import fs from 'fs/promises';

const SAFE_POST_PROBE_PATHS = new Set(['interfaceWebhookProbe']);

function parseArgs(argv) {
  const args = { service: '', format: 'table', mode: 'prod' };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (part === '--service') args.service = argv[i + 1] || '';
    if (part === '--mode') args.mode = argv[i + 1] || 'prod';
    if (part === '--json') args.format = 'json';
  }
  return args;
}

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, 'utf8'));
}

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function getWebhookUrl(baseUrl, mode, path, method) {
  const base = normalizeBaseUrl(baseUrl);
  const webhookBase = mode === 'test' ? `${base}/webhook-test` : `${base}/webhook`;
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const isGet = String(method || 'GET').toUpperCase() === 'GET';
  return `${webhookBase}/${cleanPath}${isGet ? '?probe=1' : ''}`;
}

function getProbeInit(path, method = 'GET') {
  const upper = String(method || 'GET').toUpperCase();
  if (upper !== 'POST') return { method: upper, skipped: false };
  if (SAFE_POST_PROBE_PATHS.has(String(path || ''))) {
    return {
      method: upper,
      skipped: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ probe: true }),
    };
  }
  return { method: upper, skipped: true };
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {}
  return { response, text, json };
}

async function getWorkflow(baseUrl, apiKey, workflowId, cache) {
  if (!workflowId) return null;
  if (!cache.has(workflowId)) {
    const request = fetchJson(`${normalizeBaseUrl(baseUrl)}/api/v1/workflows/${workflowId}`, {
      headers: { 'X-N8N-API-KEY': apiKey },
    }).then(({ json }) => json || null);
    cache.set(workflowId, request);
  }
  return cache.get(workflowId);
}

function findWebhookNode(workflow, action, method) {
  if (!workflow || !Array.isArray(workflow.nodes)) return null;
  const wantedPath = String(action || '').trim().toLowerCase();
  const wantedMethod = String(method || 'GET').trim().toUpperCase();
  return workflow.nodes.find((node) => {
    if (!String(node.type || '').includes('webhook')) return false;
    const nodePath = String(node.parameters?.path || '').trim().toLowerCase();
    const nodeMethod = String(node.parameters?.httpMethod || 'GET').trim().toUpperCase();
    return nodePath === wantedPath && nodeMethod === wantedMethod;
  }) || null;
}

function toRow(serviceName, serviceConfig, workflow, node, liveStatus, probeSkipped) {
  const hasLiveSuccess = typeof liveStatus === 'number' && liveStatus >= 200 && liveStatus < 300;
  const hasSafePostRegistration = probeSkipped && workflow && workflow.active && node && node.webhookId;
  return {
    service: serviceName,
    workflowId: serviceConfig.workflowId || null,
    workflowName: serviceConfig.workflowName || null,
    action: serviceConfig.action || null,
    mode: serviceConfig.mode || 'prod',
    method: serviceConfig.method || 'POST',
    active: workflow ? Boolean(workflow.active) : null,
    nodeName: node?.name || null,
    webhookId: node?.webhookId || null,
    liveStatus,
    probeSkipped: Boolean(probeSkipped),
    ok: Boolean(
      (workflow && workflow.active && node && node.webhookId && hasLiveSuccess) ||
        hasSafePostRegistration
    ),
  };
}

function printTable(rows) {
  const headers = ['Service', 'Method', 'Mode', 'Action', 'Workflow', 'WebhookId', 'Live', 'OK'];
  const tableRows = rows.map((row) => [
    row.service,
    row.method,
    row.mode,
    row.action || '',
    row.workflowName || row.workflowId || '',
    row.webhookId || '(missing)',
    row.probeSkipped ? 'skipped-post' : row.liveStatus == null ? '(n/a)' : String(row.liveStatus),
    row.ok ? 'yes' : 'no',
  ]);
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...tableRows.map((row) => row[index].length))
  );
  const renderRow = (columns) => columns.map((value, index) => value.padEnd(widths[index])).join('  ');
  console.log(renderRow(headers));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  for (const row of tableRows) console.log(renderRow(row));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const settings = await loadJson('.vscode/settings.json');
  const mapping = await loadJson('system/n8n-service-workflow-map.json');
  const baseUrl = settings['n8n.host'];
  const apiKey = settings['n8n.apiKey'];
  if (!baseUrl || !apiKey) {
    throw new Error('Missing n8n.host or n8n.apiKey in .vscode/settings.json');
  }

  const services = Object.entries(mapping.serviceToWorkflow || {}).filter(([serviceName, config]) => {
    if (args.service && serviceName !== args.service) return false;
    if (args.mode !== 'all' && String(config.mode || 'prod') !== args.mode) return false;
    return Boolean(config.workflowId && config.action);
  });

  const workflowCache = new Map();
  const rows = [];
  for (const [serviceName, serviceConfig] of services) {
    const workflow = await getWorkflow(baseUrl, apiKey, serviceConfig.workflowId, workflowCache);
    const node = findWebhookNode(workflow, serviceConfig.action, serviceConfig.method);
    let liveStatus = null;
    if (node) {
      const url = getWebhookUrl(baseUrl, serviceConfig.mode, serviceConfig.action, serviceConfig.method);
      const method = String(serviceConfig.method || 'GET').toUpperCase();
      const probeInit = getProbeInit(serviceConfig.action, method);
      if (!probeInit.skipped) {
        const response = await fetch(url, probeInit);
        liveStatus = response.status;
      }
      rows.push(toRow(serviceName, serviceConfig, workflow, node, liveStatus, probeInit.skipped));
      continue;
    }
    rows.push(toRow(serviceName, serviceConfig, workflow, node, liveStatus, false));
  }

  if (args.format === 'json') {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    printTable(rows);
  }

  if (rows.some((row) => !row.ok)) process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
