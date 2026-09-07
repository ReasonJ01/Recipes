const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { validateRecipe } = require("../scripts/validate-recipes");
const { parseRecipe } = require("../scripts/recipe-format");

const recipe = '---\ntitle: "Toast: my way"\n---\n\n## Ingredients\n- Bread\n- Butter to taste\n\n## Instructions\n1. Toast the bread.\n2. Spread with butter.\n';
const images = path.resolve(__dirname, "../public/images");

test("dictated recipe needs no image, timing, or servings", () => {
  assert.deepEqual(validateRecipe(recipe, images), []);
});

test("Windows line endings render identically to validated input", () => {
  const windows = recipe.replace(/\n/g, "\r\n");
  assert.deepEqual(validateRecipe(windows, images), []);
  assert.deepEqual(parseRecipe(windows), parseRecipe(recipe));
});

test("headings and wrapped steps cannot silently disappear or become extra steps", () => {
  assert.match(validateRecipe(recipe.replace("## Instructions", "## Method"), images).join("\n"), /Unknown section/);
  assert.match(validateRecipe(recipe.replace("1. Toast the bread.", "1. Toast the\n   bread."), images).join("\n"), /each item on one line/);
  assert.match(validateRecipe(recipe.replace("- Bread", "### Bread"), images).join("\n"), /Ingredients line/);
  assert.match(validateRecipe(recipe + "\n## Ingredients\n- Salt\n", images).join("\n"), /Duplicate/);
});

test("missing content, malformed YAML, and metadata typos are actionable errors", () => {
  assert.match(validateRecipe(recipe.replace("- Bread\n- Butter to taste", ""), images).join("\n"), /non-empty ## Ingredients/);
  assert.ok(validateRecipe(recipe.replace('"Toast: my way"', "Toast: my way"), images).length);
  assert.match(validateRecipe(recipe.replace("title:", "name:"), images).join("\n"), /title/);
  assert.match(validateRecipe(recipe.replace("---\n\n", "prepTime: 2 min\n---\n\n"), images).join("\n"), /Unknown field/);
});

test("optional image and attribution must work when supplied", () => {
  const metadata = (text) => recipe.replace("---\n\n", text + "\n---\n\n");
  assert.deepEqual(validateRecipe(metadata("image: brownie.png"), images), []);
  assert.match(validateRecipe(metadata("image: missing.jpg"), images).join("\n"), /missing from/);
  assert.match(validateRecipe(metadata("image: ../sw.js"), images).join("\n"), /missing from/);
  assert.match(validateRecipe(metadata("source_url: https://example.com"), images).join("\n"), /Include source/);
  assert.match(validateRecipe(metadata("source: Notes\nsource_url: javascript:alert(1)"), images).join("\n"), /http or https/);
});

test("all existing recipes validate", () => {
  const dir = path.resolve(__dirname, "../src/recipes");
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    assert.deepEqual(validateRecipe(fs.readFileSync(path.join(dir, file), "utf8"), images), [], file);
  }
});

test("a malformed recipe fails the build validation command", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "recipe-validation-"));
  try {
    fs.mkdirSync(path.join(root, "src/recipes"), { recursive: true });
    fs.writeFileSync(path.join(root, "src/recipes/broken.md"), recipe.replace("## Instructions", "## Method"));
    const script = path.resolve(__dirname, "../scripts/validate-recipes.js");
    const result = spawnSync(process.execPath, ["-e", "process.exitCode = require(process.argv[1]).validateDirectory(process.argv[2]) ? 0 : 1", script, root], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /broken.md: Unknown section "Method"/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
