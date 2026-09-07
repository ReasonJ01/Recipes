const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const code = fs.readFileSync(path.join(__dirname, "../public/sw.js"), "utf8");
function setup(fetch) {
  const handlers = {};
  const entries = new Map();
  const deleted = [];
  const cache = { put: async (request, response) => entries.set(request.url, response) };
  const self = { location: { origin: "https://recipes.reason.place" }, addEventListener: (name, handler) => { handlers[name] = handler; }, clients: { claim() {} } };
  vm.runInNewContext(code, {
    self, URL, fetch,
    caches: {
      match: async (request) => entries.get(request.url),
      open: async () => cache,
      keys: async () => ["recipe-catalogue-v1", "recipe-catalogue-v2", "unrelated-cache"],
      delete: async (key) => deleted.push(key),
    },
  });
  const navigate = async (url = self.location.origin + "/") => {
    let result;
    const pending = [];
    handlers.fetch({ request: { method: "GET", mode: "navigate", url }, respondWith: (promise) => { result = promise; }, waitUntil: (promise) => pending.push(promise) });
    await Promise.all(pending);
    return result;
  };
  return { handlers, entries, deleted, navigate };
}
const page = (body, status = 200) => ({ body, status, type: "basic", clone() { return page(body, status); } });

test("online navigation replaces the old catalogue and caches the new one", async () => {
  const app = setup(async () => page("New recipe catalogue"));
  const url = "https://recipes.reason.place/";
  app.entries.set(url, page("Old catalogue"));
  assert.equal((await app.navigate()).body, "New recipe catalogue");
  assert.equal(app.entries.get(url).body, "New recipe catalogue");
});

test("a previously visited recipe remains available offline", async () => {
  const app = setup(async () => { throw new Error("Offline"); });
  const url = "https://recipes.reason.place/recipes/brownies/";
  app.entries.set(url, page("Brownies"));
  assert.equal((await app.navigate(url)).body, "Brownies");
  await assert.rejects(app.navigate(), /Offline/);
});

test("removed pages show the server response instead of stale cached content", async () => {
  const app = setup(async () => page("Not found", 404));
  app.entries.set("https://recipes.reason.place/", page("Old page"));
  assert.equal((await app.navigate()).status, 404);
});

test("activation only removes old recipe caches", async () => {
  const app = setup(async () => page("OK"));
  let pending;
  app.handlers.activate({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.deepEqual(app.deleted, ["recipe-catalogue-v1"]);
});

test("external requests are left to the browser", async () => {
  const app = setup(() => { throw new Error("Should not fetch"); });
  assert.equal(await app.navigate("https://example.com/"), undefined);
});
