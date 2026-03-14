import crypto from 'crypto';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const SAFE_POST_PROBE_PATHS = new Set(['interfaceWebhookProbe']);

function parseArgs(argv) {
  const ids = [];
  for (const part of argv) {
    if (part.startsWith('-')) continue;
    ids.push(part);
  }
  return ids;
}

async function loadSettings() {
  const raw = await fs.readFile('.vscode/settings.json', 'utf8');
  const settings = JSON.parse(raw);
  const baseUrl = String(settings['n8n.host'] || '').replace(/\/+$/, '');
  const apiKey = settings['n8n.apiKey'];
  if (!baseUrl || !apiKey) {
    throw new Error('Missing n8n.host or n8n.apiKey in .vscode/settings.json');
  }
  return { baseUrl, apiKey };
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {}
  return { response, text, json };
}

function isWebhookNode(node) {
  return String(node?.type || '') === 'n8n-nodes-base.webhook';
}

function getWebhookKey(node) {
  const method = String(node?.parameters?.httpMethod || 'GET').trim().toUpperCase();
  const path = String(node?.parameters?.path || '').trim();
  return `${node?.name || ''}|${method}|${path}`;
}

function getProbeUrl(baseUrl, node) {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  const path = String(node?.parameters?.path || '').replace(/^\/+/, '');
  const method = String(node?.parameters?.httpMethod || 'GET').trim().toUpperCase();
  return `${base}/webhook/${path}${method === 'GET' ? '?probe=1' : ''}`;
}

function getProbeInit(node) {
  const method = String(node?.parameters?.httpMethod || 'GET').trim().toUpperCase();
  const path = String(node?.parameters?.path || '').trim();
  if (method !== 'POST') return { method, skipped: false };
  if (SAFE_POST_PROBE_PATHS.has(path)) {
    return {
      method,
      skipped: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ probe: true }),
    };
  }
  return { method, skipped: true };
}

function buildWebhookLookup(nodes) {
  const lookup = new Map();
  for (const node of Array.isArray(nodes) ? nodes : []) {
    if (!isWebhookNode(node)) continue;
    lookup.set(getWebhookKey(node), node);
  }
  return lookup;
}

function patchWebhookIds(workflow) {
  const activeLookup = buildWebhookLookup(workflow.activeVersion?.nodes || []);
  const assigned = [];
  const nodes = (workflow.nodes || []).map((node) => {
    if (!isWebhookNode(node)) return node;
    const fallback = activeLookup.get(getWebhookKey(node));
    const webhookId = node.webhookId || fallback?.webhookId || crypto.randomUUID();
    assigned.push({
      name: node.name,
      method: String(node.parameters?.httpMethod || 'GET').toUpperCase(),
      path: String(node.parameters?.path || ''),
      webhookId,
      source: node.webhookId ? 'current' : fallback?.webhookId ? 'activeVersion' : 'generated',
    });
    return { ...node, webhookId };
  });
  return { nodes, assigned };
}

async function getWorkflow(baseUrl, apiKey, workflowId) {
  const { response, json, text } = await fetchJson(`${baseUrl}/api/v1/workflows/${workflowId}`, {
    headers: { 'X-N8N-API-KEY': apiKey },
  });
  if (!response.ok || !json) {
    throw new Error(`Failed to load workflow ${workflowId}: ${response.status} ${text}`);
  }
  return json;
}

async function execRootPython(source, payloadPath = '') {
  const command = `nsenter -t 1 -m -u -i -n -p -- python3 - <<'PY'\n${source}\nPY\n`;
  const args = ['run', '--rm', '--privileged', '--pid=host'];
  if (payloadPath) args.push('-e', `PAYLOAD_PATH=${payloadPath}`);
  args.push('alpine', 'sh', '-lc', command);
  await execFileAsync('docker', args, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 8 });
}

async function probeWebhook(baseUrl, node) {
  const probeInit = getProbeInit(node);
  const method = probeInit.method;
  const url = getProbeUrl(baseUrl, node);
  const response = probeInit.skipped ? null : await fetch(url, probeInit);
  return {
    name: node.name,
    method,
    path: String(node.parameters?.path || ''),
    webhookId: node.webhookId || '',
    status: response ? response.status : null,
    skipped: probeInit.skipped,
  };
}

async function patchDatabase(payload) {
  const payloadPath = path.join(os.tmpdir(), `publish-n8n-${payload.workflowId}.json`);
  await fs.writeFile(payloadPath, JSON.stringify(payload), 'utf8');
  const python = `
import json
import os
import sqlite3

payload_path = os.environ['PAYLOAD_PATH']
payload = json.load(open(payload_path, 'r', encoding='utf-8'))

conn = sqlite3.connect('/.n8n/database.sqlite')
cur = conn.cursor()

workflow_id = payload['workflowId']
version_id = payload['versionId']
nodes_json = json.dumps(payload['nodes'], ensure_ascii=False)

cur.execute(
    'UPDATE workflow_entity SET nodes = ?, active = 1, activeVersionId = ? WHERE id = ?',
    (nodes_json, version_id, workflow_id),
)
cur.execute(
    'UPDATE workflow_history SET nodes = ? WHERE workflowId = ? AND versionId = ?',
    (nodes_json, workflow_id, version_id),
)
cur.execute('DELETE FROM webhook_entity WHERE workflowId = ?', (workflow_id,))

conn.commit()
conn.close()
`
  try {
    await execRootPython(python, payloadPath);
  } finally {
    await fs.rm(payloadPath, { force: true });
  }
}

async function restartN8n() {
  await execRootPython('import subprocess; subprocess.run([\"systemctl\", \"restart\", \"n8n.service\"], check=True)');
}

async function waitForN8n(baseUrl, apiKey) {
  const deadline = Date.now() + 60_000;
  let lastError = 'n8n did not become ready';
  while (Date.now() < deadline) {
    try {
      const { response } = await fetchJson(`${baseUrl}/api/v1/workflows?limit=1`, {
        headers: { 'X-N8N-API-KEY': apiKey },
      });
      if (response.ok) return;
      lastError = `n8n returned ${response.status}`;
    } catch (error) {
      lastError = error.message || String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(lastError);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeWorkflowUntilReady(baseUrl, apiKey, workflowId) {
  const deadline = Date.now() + 45_000;
  let lastWorkflow = null;
  let lastProbes = [];
  while (Date.now() < deadline) {
    lastWorkflow = await getWorkflow(baseUrl, apiKey, workflowId);
    const hooks = (lastWorkflow.activeVersion?.nodes || lastWorkflow.nodes || []).filter(isWebhookNode);
    lastProbes = [];
    for (const node of hooks) {
      lastProbes.push(await probeWebhook(baseUrl, node));
    }
    if (
      lastProbes.length > 0 &&
      lastProbes.every((probe) =>
        probe.skipped ? Boolean(probe.webhookId) : probe.status >= 200 && probe.status < 300
      )
    ) {
      return { workflow: lastWorkflow, probes: lastProbes };
    }
    await sleep(1500);
  }
  return { workflow: lastWorkflow, probes: lastProbes };
}

async function prepareWorkflowPublish(baseUrl, apiKey, workflowId) {
  const workflow = await getWorkflow(baseUrl, apiKey, workflowId);
  const { nodes, assigned } = patchWebhookIds(workflow);
  await patchDatabase({
    workflowId,
    versionId: workflow.versionId,
    nodes,
  });
  return {
    workflowId,
    assigned,
  };
}

async function main() {
  const workflowIds = parseArgs(process.argv.slice(2));
  if (workflowIds.length === 0) {
    throw new Error('Usage: node tools/publish_n8n_workflow.mjs <workflowId> [workflowId...]');
  }
  const { baseUrl, apiKey } = await loadSettings();
  const prepared = [];
  for (const workflowId of workflowIds) {
    prepared.push(await prepareWorkflowPublish(baseUrl, apiKey, workflowId));
  }
  await restartN8n();
  await waitForN8n(baseUrl, apiKey);
  const results = [];
  for (const item of prepared) {
    const { workflow, probes } = await probeWorkflowUntilReady(baseUrl, apiKey, item.workflowId);
    results.push({
      workflowId: item.workflowId,
      workflowName: workflow?.name || item.workflowId,
      versionId: workflow?.versionId || null,
      activeVersionId: workflow?.activeVersionId || null,
      assigned: item.assigned,
      probes,
    });
  }
  console.log(JSON.stringify(results, null, 2));
  const hasFailures = results.some((result) =>
    result.probes.some((probe) => probe.status < 200 || probe.status >= 300),
  );
  if (hasFailures) process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
