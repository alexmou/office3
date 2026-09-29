import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageConfigPath = path.join(repoRoot, "system", "pageConfig.js");
const apiPath = path.join(repoRoot, "system", "api.js");
const generatedDir = path.join(repoRoot, "docs", "generated");

const read = (file) => fs.readFileSync(file, "utf8");
const trackedSourceFiles = () => fs.readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .flatMap((entry) => walk(path.join(repoRoot, entry.name)))
  .filter((file) => /\.(js|html|css)$/.test(file) && !file.includes(`${path.sep}vendor${path.sep}`));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function extractBalanced(source, openIndex) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") { lineComment = true; i += 1; continue; }
    if (char === "/" && next === "*") { blockComment = true; i += 1; continue; }
    if (char === "\"" || char === "'") { quote = char; continue; }
    if (char === "{" || char === "[") depth += 1;
    if (char === "}" || char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, i + 1);
    }
  }
  throw new Error(`Unbalanced literal near offset ${openIndex}`);
}

function getObject(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing source marker: ${marker}`);
  const openIndex = source.indexOf("{", markerIndex + marker.length);
  return extractBalanced(source, openIndex);
}

function stringList(block, property) {
  const match = block.match(new RegExp(`${property}\\s*:\\s*\\[([\\s\\S]*?)\\]`));
  return match ? [...match[1].matchAll(/["']([^"']+)["']/g)].map((item) => item[1]) : [];
}

function stringValue(block, property) {
  return block.match(new RegExp(`${property}\\s*:\\s*["']([^"']*)["']`))?.[1] || null;
}

function parsePageConfig() {
  const source = stripComments(read(pageConfigPath));
  const object = getObject(source, "window.PAGE_CONFIG =");
  const pages = [];
  const entryPattern = /(?:^|\n)\s{2,}([A-Za-z][A-Za-z0-9_]*):\s*\{/g;
  let match;
  while ((match = entryPattern.exec(object))) {
    const openIndex = object.indexOf("{", match.index);
    const block = extractBalanced(object, openIndex);
    const id = match[1];
    const html = stringValue(block, "html");
    const js = stringList(block, "js");
    const css = stringList(block, "css");
    const externalJs = stringList(block, "externalJs");
    const externalCss = stringList(block, "externalCss");
    const sourceFiles = [html, ...js, ...css, ...externalJs, ...externalCss].filter(Boolean);
    const initializerFiles = js.filter((file) => fs.existsSync(path.join(repoRoot, file)));
    const initializerMatches = initializerFiles.flatMap((file) => {
      const text = read(path.join(repoRoot, file));
      return [...text.matchAll(/registerPageInit\(\s*(?:["']([^"']+)["']|PAGE_ID)\s*,\s*([^\)\n]+)/g)]
        .filter((item) => !item[1] || item[1] === id)
        .map((item) => item[2].trim());
    });
    const callers = initializerFiles.flatMap((file) => {
      const text = read(path.join(repoRoot, file));
      return [...text.matchAll(/\bAPI\.([A-Za-z0-9_]+)/g)].map((item) => item[1]);
    });
    pages.push({
      id,
      title: stringValue(block, "title"),
      kind: id === "header" ? "shared" : "page",
      html,
      javascript: js,
      css,
      externalAssets: [...externalJs, ...externalCss],
      initializer: initializerMatches[0] || null,
      apiServices: [...new Set(callers)].sort(),
      sourceFiles
    });
    entryPattern.lastIndex = openIndex + block.length;
  }
  return pages;
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function parseRoutes() {
  const source = read(apiPath);
  const object = getObject(source, "let API_ROUTES =");
  const routes = [];
  const entryPattern = /(?:^|\n)\s{4}([A-Za-z][A-Za-z0-9_]*):\s*\{([^{}]*)\}/g;
  let match;
  while ((match = entryPattern.exec(object))) {
    const fields = Object.fromEntries([...match[2].matchAll(/(source|method|webhook|webhookAction|rawBody)\s*:\s*["']?([^,\s"'}]+)["']?/g)]
      .map((item) => [item[1], item[2] === "true" ? true : item[2] === "false" ? false : item[2]]));
    routes.push({
      service: match[1],
      method: fields.method || "POST",
      source: fields.source || "unspecified",
      webhookMode: fields.webhook || "prod",
      webhookAction: fields.webhookAction || null,
      rawBody: fields.rawBody === true,
      callers: []
    });
  }
  const files = trackedSourceFiles();
  for (const route of routes) {
    for (const file of files) {
      const relative = path.relative(repoRoot, file).split(path.sep).join("/");
      if (relative === "system/api.js") continue;
      const text = read(file);
      const calls = [
        ...[...text.matchAll(new RegExp(`\\bAPI\\.${route.service}\\b`, "g"))].map(() => "API." + route.service),
        ...[...text.matchAll(new RegExp(`googleFuncName\\s*:\\s*["']${route.service}["']`, "g"))].flatMap(() => ["googleFuncName", "runGSfunction"]),
      ];
      if (calls.length) route.callers.push({ file: relative, forms: [...new Set(calls)] });
    }
    route.callers.sort((a, b) => a.file.localeCompare(b.file));
  }
  return routes;
}

function buildContextIndex(pages, routes) {
  const pageById = new Map(pages.map((page) => [page.id, page]));
  const pageFiles = (ids) => ids.flatMap((id) => pageById.get(id)?.sourceFiles || []);
  const domains = {
    runtime: { sourceFiles: ["index.html", "system/system.js", "system/pageConfig.js", "system/app.js"], docs: ["docs/ARCHITECTURE.md", "docs/PAGES.md"], verificationCommands: ["node tools/generate-docs.mjs --check"] },
    auth: { sourceFiles: ["login/login.js", "system/system.js", "system/api.js"], docs: ["docs/SECURITY.md", "docs/API.md"], verificationCommands: ["node --check system/api.js", "node --check login/login.js"] },
    api: { sourceFiles: ["system/api.js", "system/n8n.js"], docs: ["docs/API.md"], verificationCommands: ["node tools/generate-docs.mjs --check"] },
    sale: { sourceFiles: pageFiles(["newsale"]), docs: ["docs/SALE_FLOW.md", "docs/DATA_MODEL.md"], verificationCommands: ["node --check newsale/newsale.js", "node --check newsale/newsales_classes.js"] },
    catalog: { sourceFiles: pageFiles(["catalog"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check catalog/catalog.js"] },
    warehouse: { sourceFiles: pageFiles(["admin_sklad"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check admin_sklad/admin_sklad.js"] },
    barcode: { sourceFiles: pageFiles(["barcode"]), docs: ["docs/PAGES.md"], verificationCommands: ["node --check barcode/barcode.js"] },
    sales: { sourceFiles: pageFiles(["sales"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check sales/sales.js"] },
    cash: { sourceFiles: pageFiles(["cashregister"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check cashRegister/cashRegister.js"] },
    budget: { sourceFiles: pageFiles(["budget"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check budget/budget.js"] },
    salary: { sourceFiles: pageFiles(["salary"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check salary/salary.js"] },
    schedule: { sourceFiles: pageFiles(["schedule"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check schedule/schedule.js"] },
    statistics: { sourceFiles: pageFiles(["statistic"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check statistic/statistic.js"] },
    suppliers: { sourceFiles: pageFiles(["suppliers"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check suppliers/suppliers.js"] },
    sapo: { sourceFiles: pageFiles(["sapo"]), docs: ["docs/PAGES.md", "docs/API.md"], verificationCommands: ["node --check sapo/sapo.js"] }
  };
  return { generatedAt: new Date().toISOString().slice(0, 10), domains, counts: { pages: pages.length, routes: routes.length } };
}

function build() {
  const pages = parsePageConfig();
  const routes = parseRoutes();
  return {
    pages: { generatedAt: new Date().toISOString().slice(0, 10), source: "system/pageConfig.js", pages },
    routes: { generatedAt: new Date().toISOString().slice(0, 10), source: "system/api.js", routes },
    context: buildContextIndex(pages, routes)
  };
}

const output = build();
const files = {
  "pages.json": output.pages,
  "api-routes.json": output.routes,
  "context-index.json": output.context
};

if (process.argv.includes("--check")) {
  for (const [name, value] of Object.entries(files)) {
    const target = path.join(generatedDir, name);
    if (!fs.existsSync(target) || JSON.stringify(JSON.parse(read(target)), null, 2) !== JSON.stringify(value, null, 2)) {
      throw new Error(`Generated file is stale: docs/generated/${name}`);
    }
  }
} else {
  fs.mkdirSync(generatedDir, { recursive: true });
  for (const [name, value] of Object.entries(files)) {
    fs.writeFileSync(path.join(generatedDir, name), `${JSON.stringify(value, null, 2)}\n`);
  }
}

console.log(`Documentation context ${process.argv.includes("--check") ? "is current" : "generated"}: ${output.context.counts.pages} pages, ${output.context.counts.routes} routes`);