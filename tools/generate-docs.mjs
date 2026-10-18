import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const read = (file) => fs.readFileSync(file, "utf8");
const trackedSourceFiles = (root) => fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
  .flatMap((entry) => walk(path.join(root, entry.name)))
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

function getInitializer(source, id) {
  source = stripComments(source);
  const registrations = [...source.matchAll(/\bregisterPageInit\(\s*(?:(["'])([^"']+)\1|PAGE_ID)\s*,/g)];
  const matching = registrations.filter((item) => !item[2] || item[2] === id);
  const names = matching.map((item) => {
    let callback = source.slice(item.index + item[0].length).trimStart();
    callback = callback.replace(/^async\s+/, "");
    if (callback.startsWith("function")) {
      return callback.match(/^function\s+([A-Za-z_$][\w$]*)\s*\(/)?.[1] || "anonymous callback";
    }
    if (/^(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(callback)) return "anonymous callback";
    return callback.match(/^([A-Za-z_$][\w$]*)\b/)?.[1] || null;
  });
  return { registered: matching.length > 0, name: names.find(Boolean) || null };
}

function localSourcePath(asset) {
  const value = String(asset || "").trim();
  if (!value || value.startsWith("//") || /^[A-Za-z][A-Za-z\d+.-]*:/.test(value)) return null;
  const pathname = value.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  if (!pathname) return null;
  return path.posix.normalize(pathname).replace(/^\.\//, "");
}

function existingLocalPath(root, asset) {
  const relative = localSourcePath(asset);
  if (!relative) return null;
  const absolute = path.resolve(root, relative);
  const fromRoot = path.relative(root, absolute);
  if (fromRoot === ".." || fromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(fromRoot)) return null;
  return fs.existsSync(absolute) ? relative : null;
}

function parsePageConfig(root) {
  const source = stripComments(read(path.join(root, "system", "pageConfig.js")));
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
    const configuredAssets = [html, ...js, ...css, ...externalJs, ...externalCss].filter(Boolean);
    const sourceFiles = [...new Set(configuredAssets.map(localSourcePath).filter(Boolean))];
    const initializerFiles = js.map((file) => existingLocalPath(root, file)).filter(Boolean);
    const initializerMatches = initializerFiles.map((file) => getInitializer(read(path.join(root, file)), id))
      .filter((item) => item.registered);
    const callers = initializerFiles.flatMap((file) => {
      const text = stripComments(read(path.join(root, file)));
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
      initializer: initializerMatches[0]?.name || null,
      initializerRegistered: initializerMatches.length > 0,
      apiServices: [...new Set(callers)].sort(),
      sourceFiles
    });
    entryPattern.lastIndex = openIndex + block.length;
  }
  return pages;
}

function stripComments(source, comments = []) {
  let result = "";
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let commentText = "";

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        comments.push(commentText);
        commentText = "";
        result += char;
      } else {
        commentText += char;
      }
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        comments.push(commentText);
        commentText = "";
        index += 1;
      } else if (char === "\n") {
        result += char;
        commentText += char;
      } else {
        commentText += char;
      }
      continue;
    }
    if (quote) {
      result += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      commentText = "";
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      commentText = "";
      index += 1;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") quote = char;
    result += char;
  }
  if (lineComment || blockComment) comments.push(commentText);
  return result;
}

function scanServiceCalls(root, explicitRoutes) {
  const references = new Map();
  const helperNames = new Set(["call", "getRoutes", "setRoutes", "getContractVersion", "setContractVersion"]);
  for (const file of trackedSourceFiles(root)) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    if (relative === "system/api.js") continue;
    const comments = [];
    const source = stripComments(read(file), comments);
    const add = (service, invocationType, form, active) => {
      const key = `${service}\0${relative}\0${invocationType}\0${active}`;
      const reference = references.get(key) || { service, file: relative, invocationType, active, forms: new Set() };
      reference.forms.add(form);
      references.set(key, reference);
    };
    const collect = (text, active) => {
      for (const match of text.matchAll(/\b(?:window\s*\.\s*)?API\s*\.\s*([A-Za-z_$][\w$]*)/g)) {
        if (!helperNames.has(match[1])) add(match[1], "dynamic/proxy", `API.${match[1]}`, active);
      }
      for (const match of text.matchAll(/googleFuncName\s*:\s*["']([^"']+)["']/g)) {
        add(match[1], "legacy", "googleFuncName", active);
      }
    };
    collect(source, true);
    comments.forEach((comment) => collect(comment, false));
  }
  return [...references.values()].map((item) => ({
    ...item,
    forms: [...item.forms],
    explicit: explicitRoutes.has(item.service),
  }));
}

function parseRoutes(root) {
  const source = stripComments(read(path.join(root, "system", "api.js")));
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
  const references = scanServiceCalls(root, new Set(routes.map((route) => route.service)));
  for (const route of routes) {
    route.callers = references.filter((item) => item.service === route.service)
      .reduce((callers, item) => {
        const existing = callers.find((caller) => caller.file === item.file);
        const forms = item.invocationType === "legacy" ? ["googleFuncName", "runGSfunction"] : item.forms;
        if (existing) existing.forms = [...new Set([...existing.forms, ...forms])];
        else callers.push({ file: item.file, forms: [...new Set(forms)] });
        return callers;
      }, []);
    route.callers.sort((a, b) => a.file.localeCompare(b.file));
  }
  const unresolvedCalls = references.filter((item) => !item.explicit && item.active).map((item) => ({
    service: item.service,
    sourceFile: item.file,
    invocationType: item.invocationType,
    active: true,
    resolutionStatus: "no explicit API_ROUTES declaration; runtime config or frontend fallback may resolve it",
    staticallyVerified: true,
    verificationScope: "frontend call/fallback only; backend behavior is unverified",
  })).sort((a, b) => a.service.localeCompare(b.service) || a.sourceFile.localeCompare(b.sourceFile));
  const inactiveReferences = references.filter((item) => !item.explicit && !item.active).map((item) => ({
    service: item.service,
    sourceFile: item.file,
    invocationType: item.invocationType,
    active: false,
    resolutionStatus: "commented-out reference; not an active invocation",
    staticallyVerified: true,
    verificationScope: "comment text only; no runtime behavior asserted",
  })).sort((a, b) => a.service.localeCompare(b.service) || a.sourceFile.localeCompare(b.sourceFile));
  return { routes, unresolvedCalls, inactiveReferences };
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
  return { domains, counts: { pages: pages.length, routes: routes.length } };
}

export function buildDocumentation(root = repoRoot) {
  const pages = parsePageConfig(root);
  const { routes, unresolvedCalls, inactiveReferences } = parseRoutes(root);
  return {
    pages: { source: "system/pageConfig.js", pages },
    routes: { source: "system/api.js", routes, unresolvedCalls, inactiveReferences },
    context: buildContextIndex(pages, routes)
  };
}

function main() {
  const output = buildDocumentation();
  const generatedDir = path.join(repoRoot, "docs", "generated");
  const files = {
    "pages.json": output.pages,
    "api-routes.json": output.routes,
    "context-index.json": output.context
  };

  if (process.argv.includes("--stdout")) {
    process.stdout.write(`${JSON.stringify(files, null, 2)}\n`);
  } else if (process.argv.includes("--check")) {
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

  console.log(`Documentation context ${process.argv.includes("--check") ? "is current" : process.argv.includes("--stdout") ? "built" : "generated"}: ${output.context.counts.pages} pages, ${output.context.counts.routes} routes`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main();