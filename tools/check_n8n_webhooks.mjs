import fs from 'fs/promises';

const SAFE_POST_PROBE_PATHS = new Set(['interfaceWebhookProbe']);

async function loadSettings() {
  const raw = await fs.readFile('.vscode/settings.json', 'utf8');
  return JSON.parse(raw);
}

function getWebhookUrl(baseUrl, path, method = 'GET') {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const query = method.toUpperCase() === 'GET' ? '?ping=1' : '';
  return `${base}/webhook/${cleanPath}${query}`;
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

async function main() {
  const settings = await loadSettings();
  const baseUrl = String(settings['n8n.host'] || '').replace(/\/+$/, '');
  const apiKey = settings['n8n.apiKey'];
  if (!baseUrl || !apiKey) {
    throw new Error('Missing n8n.host or n8n.apiKey in .vscode/settings.json');
  }

  const list = await fetchJson(`${baseUrl}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': apiKey },
  });
  const items = Array.isArray(list.json?.data) ? list.json.data : Array.isArray(list.json?.items) ? list.json.items : [];

  const rows = [];
  for (const item of items) {
    const details = await fetchJson(`${baseUrl}/api/v1/workflows/${item.id}`, {
      headers: { 'X-N8N-API-KEY': apiKey },
    });
    const workflow = details.json || {};
    const hooks = (workflow.nodes || []).filter((node) => String(node.type || '').includes('webhook'));
    if (!workflow.active || hooks.length === 0) continue;

    for (const hook of hooks) {
      const method = String(hook.parameters?.httpMethod || 'GET').toUpperCase();
      const path = hook.parameters?.path || '';
      const url = getWebhookUrl(baseUrl, path, method);
      const probeInit = getProbeInit(path, method);
      const probe = probeInit.skipped ? null : await fetch(url, probeInit);
      rows.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        active: workflow.active,
        nodeName: hook.name,
        method,
        path,
        webhookId: hook.webhookId || '',
        status: probe ? probe.status : null,
        probeSkipped: probeInit.skipped,
      });
    }
  }

  const summary = rows.map((row) => ({
    workflow: row.workflowName,
    id: row.workflowId,
    node: row.nodeName,
    method: row.method,
    path: row.path,
    webhookId: row.webhookId || '(missing)',
    status: row.probeSkipped ? 'skipped-post' : row.status,
  }));

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
