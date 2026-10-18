import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { buildDocumentation } from "./generate-docs.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = path.join(repoRoot, "docs", "generated");
const generatedNames = ["pages.json", "api-routes.json", "context-index.json"];

function assertLocalFile(reference, owner) {
  const target = path.resolve(repoRoot, reference);
  const relative = path.relative(repoRoot, target);
  assert.ok(relative && !relative.startsWith(`..${path.sep}`) && relative !== "..", `${owner} escapes repository: ${reference}`);
  assert.ok(fs.existsSync(target), `${owner} references missing file: ${reference}`);
}

async function makeFixture(t) {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "button-rouge-docs-"));
  t.after(() => fs.promises.rm(root, { recursive: true, force: true }));
  await fs.promises.mkdir(path.join(root, "system"), { recursive: true });
  await fs.promises.mkdir(path.join(root, "suppliers"), { recursive: true });
  await fs.promises.writeFile(path.join(root, "system", "pageConfig.js"), `window.PAGE_CONFIG = {
  header: { title: "Header", html: "header.html", js: [], css: [] },
  login: { title: "Login", html: "login.html", js: ["login.js"], css: [] },
  suppliers: {
    title: "Suppliers",
    html: "suppliers/suppliers.html",
    js: ["./suppliers/suppliers.js?v=fixture"],
    css: ["suppliers/suppliers.css#fixture"],
    externalJs: ["https://cdn.example.test/library.js?v=1"]
  }
};`);
  await fs.promises.writeFile(path.join(root, "system", "api.js"), `let API_ROUTES = {
    getSuppliersData: { source: "n8n", method: "GET" },
    markSupplierPaymentsDone: { source: "n8n", method: "POST", rawBody: true },
    saveBudgetVocabulary: { source: "n8n", method: "POST", rawBody: true },
    // lineCommentedRoute: { source: "n8n" },
    /* blockCommentedRoute: { source: "n8n" }, */
};`);
  await fs.promises.writeFile(path.join(root, "login.html"), "<main>login</main>");
  await fs.promises.writeFile(path.join(root, "header.html"), "<header></header>");
  await fs.promises.writeFile(path.join(root, "login.js"), `registerPageInit("login", () => {});`);
  await fs.promises.writeFile(path.join(root, "suppliers", "suppliers.html"), "<main>suppliers</main>");
  await fs.promises.writeFile(path.join(root, "suppliers", "suppliers.css"), "main { display: block; }");
  await fs.promises.writeFile(path.join(root, "suppliers", "suppliers.js"), `
registerPageInit("suppliers", boot);
window.API.getSuppliersData();
window.API.markSupplierPaymentsDone({});
window.API.saveBudgetVocabulary({});
window.API.computePayroll({});
runGSfunction({ googleFuncName: "printbill" });
/* window.API.commentedOnly(); */
`);
  return root;
}

test("tracked Markdown links resolve to local files", () => {
  const tracked = execFileSync("git", ["ls-files", "-z", "*.md"], { cwd: repoRoot, encoding: "utf8" })
    .split("\0").filter(Boolean);
  const linkPattern = /!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\)/g;

  for (const markdownPath of tracked) {
    const source = fs.readFileSync(path.join(repoRoot, markdownPath), "utf8");
    for (const match of source.matchAll(linkPattern)) {
      let target = match[1].replace(/^<|>$/g, "");
      if (/^(?:[A-Za-z][A-Za-z\d+.-]*:|\/\/|#)/.test(target)) continue;
      target = target.split(/[?#]/, 1)[0];
      if (!target) continue;
      try { target = decodeURIComponent(target); } catch (_) {}
      const resolved = path.resolve(path.dirname(path.join(repoRoot, markdownPath)), target);
      const relative = path.relative(repoRoot, resolved);
      assert.ok(relative && !relative.startsWith(`..${path.sep}`) && relative !== "..", `${markdownPath} link escapes repository: ${match[1]}`);
      assert.ok(fs.existsSync(resolved), `${markdownPath} links to missing file: ${match[1]}`);
    }
  }
});

test("generated inventories reference existing local source files", () => {
  const generated = buildDocumentation(repoRoot);
  const pages = generated.pages;
  const routes = generated.routes;
  const context = generated.context;
  const pageConfigContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(repoRoot, "system", "pageConfig.js"), "utf8"), pageConfigContext);
  assert.deepEqual(pages.pages.map((page) => page.id), Object.keys(pageConfigContext.window.PAGE_CONFIG));

  for (const page of pages.pages) {
    for (const file of page.sourceFiles) assertLocalFile(file, `page ${page.id}`);
  }
  assert.equal(pages.pages.find((page) => page.id === "header").kind, "shared");
  const login = pages.pages.find((page) => page.id === "login");
  assert.equal(login.initializer, "anonymous callback");
  assert.equal(login.initializerRegistered, true);
  const statistic = pages.pages.find((page) => page.id === "statistic");
  assert.ok(statistic.externalAssets.some((asset) => /^https?:\/\//.test(asset)));
  assert.ok(statistic.sourceFiles.every((file) => !/^https?:\/\//.test(file)));
  const suppliers = pages.pages.find((page) => page.id === "suppliers");
  assert.ok(suppliers.javascript.some((asset) => asset.includes("?v=")));
  assert.ok(suppliers.css.some((asset) => asset.includes("?v=")));
  assert.ok(suppliers.sourceFiles.includes("suppliers/suppliers.js"));
  assert.equal(suppliers.initializer, "boot");
  assert.equal(suppliers.initializerRegistered, true);
  assert.deepEqual(suppliers.apiServices, ["getSuppliersData", "markSupplierPaymentsDone"]);
  for (const route of routes.routes) {
    for (const caller of route.callers) assertLocalFile(caller.file, `API route ${route.service}`);
  }
  for (const service of ["saveBudgetChanges", "saveBudgetVocabulary"]) {
    const route = routes.routes.find((item) => item.service === service);
    assert.equal(route.method, "POST");
    assert.equal(route.webhookAction, "budget");
    assert.equal(route.rawBody, true);
    assert.ok(route.callers.some((caller) => caller.file === "budget/budget.js"));
  }
  const actualApiSource = fs.readFileSync(path.join(repoRoot, "system", "api.js"), "utf8");
  const routeObject = actualApiSource.match(/let API_ROUTES\s*=\s*\{([\s\S]*?)\n\s{2}\};/);
  assert.ok(routeObject, "API_ROUTES object must remain discoverable");
  const activeRouteSource = routeObject[1]
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const sourceRouteNames = [...activeRouteSource.matchAll(/^\s{4}([A-Za-z][A-Za-z0-9_]*)\s*:\s*\{/gm)]
    .map((match) => match[1]);
  assert.deepEqual(routes.routes.map((route) => route.service), sourceRouteNames);
  assert.ok(routes.routes.some((route) => route.service === "saveBudgetVocabulary"));
  assert.ok(!routes.routes.some((route) => route.service === "getCatalogFilterOptions"));

  const runtimeSource = fs.readFileSync(path.join(repoRoot, "system", "api.js"), "utf8");
  const legacySource = fs.readFileSync(path.join(repoRoot, "system", "system.js"), "utf8");
  assert.match(runtimeSource, /const route = API_ROUTES\[actionName\] \|\| \{\}/);
  assert.match(runtimeSource, /return \(params = \{\}, opts = \{\}\) => invokeApiAction\(prop, params, opts\)/);
  assert.match(legacySource, /requestViaN8nOrMock\(request\.googleFuncName/);
  assert.ok(routes.unresolvedCalls.some((call) => call.service === "printbill" && call.invocationType === "legacy"));
  assert.ok(routes.inactiveReferences.some((call) => call.service === "computePayroll" && call.invocationType === "dynamic/proxy"));
  assert.ok(!routes.routes.some((route) => route.service === "computePayroll" || route.service === "printbill"));
  assert.equal(JSON.stringify(generated).includes("generatedAt"), false);

  for (const [domain, entry] of Object.entries(context.domains)) {
    for (const file of [...entry.sourceFiles, ...entry.docs]) assertLocalFile(file, `context domain ${domain}`);
  }
  assert.equal(pages.pages.length, context.counts.pages);
  assert.equal(routes.routes.length, context.counts.routes);
});

test("fixture proves query normalization, comment filtering, and unresolved classification", async (t) => {
  const root = await makeFixture(t);
  const generated = buildDocumentation(root);
  const suppliers = generated.pages.pages.find((page) => page.id === "suppliers");
  assert.equal(suppliers.javascript[0], "./suppliers/suppliers.js?v=fixture");
  assert.equal(suppliers.sourceFiles.includes("suppliers/suppliers.js"), true);
  assert.equal(suppliers.initializer, "boot");
  assert.deepEqual(suppliers.apiServices, ["computePayroll", "getSuppliersData", "markSupplierPaymentsDone", "saveBudgetVocabulary"]);
  assert.equal(suppliers.sourceFiles.some((file) => file.includes("cdn.example.test")), false);
  assert.deepEqual(generated.routes.routes.map((route) => route.service), [
    "getSuppliersData",
    "markSupplierPaymentsDone",
    "saveBudgetVocabulary",
  ]);
  assert.equal(generated.routes.unresolvedCalls.find((call) => call.service === "computePayroll")?.active, true);
  assert.equal(generated.routes.unresolvedCalls.find((call) => call.service === "printbill")?.invocationType, "legacy");
  assert.ok(!generated.routes.routes.some((route) => route.service.includes("Commented")));
  assert.ok(!generated.routes.unresolvedCalls.some((call) => call.service === "commentedOnly"));
});

test("builder is deterministic and matches checked-in generated JSON without writing", () => {
  const first = buildDocumentation(repoRoot);
  const second = buildDocumentation(repoRoot);
  assert.deepEqual(second, first);
  const expected = {
    "pages.json": first.pages,
    "api-routes.json": first.routes,
    "context-index.json": first.context,
  };
  for (const name of generatedNames) {
    const committed = JSON.parse(fs.readFileSync(path.join(generatedDir, name), "utf8"));
    assert.deepEqual(committed, expected[name], `${name} is stale; run the generator explicitly`);
  }
});