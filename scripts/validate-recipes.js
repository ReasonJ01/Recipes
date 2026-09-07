const fs = require("node:fs");
const path = require("node:path");
const { parseRecipe } = require("./recipe-format");

const fields = new Set(["title", "image", "prep_time", "cook_time", "servings", "categories", "source", "source_url"]);
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;

function validateRecipe(text, imagesDir) {
  const errors = [];
  let recipe;
  try { recipe = parseRecipe(text); } catch (error) { return [error.message]; }
  const { data, sections } = recipe;
  if (!nonempty(data.title)) errors.push("title must be non-empty text (quote numeric titles).");
  for (const field of Object.keys(data)) {
    if (!fields.has(field)) errors.push(`Unknown field "${field}"; check the recipe format in README.md.`);
  }
  for (const field of ["prep_time", "cook_time", "source"]) {
    if (field in data && !nonempty(data[field])) errors.push(`${field} must be non-empty text, or omitted.`);
  }
  if ("servings" in data && !(nonempty(data.servings) || (typeof data.servings === "number" && Number.isFinite(data.servings) && data.servings > 0))) {
    errors.push("servings must be positive or descriptive text, or omitted.");
  }
  if ("categories" in data && !(Array.isArray(data.categories) && data.categories.every(nonempty))) {
    errors.push("categories must be a list of text values, such as [dinner, pasta].");
  }
  if ("source_url" in data) {
    try {
      const url = new URL(data.source_url);
      if (!nonempty(data.source_url) || !["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch { errors.push("source_url must be an http or https URL."); }
    if (!nonempty(data.source)) errors.push("Include source with source_url so the attribution is displayed.");
  }
  if ("image" in data) {
    if (!nonempty(data.image)) {
      errors.push("image must name an existing file, or be omitted. Images are optional.");
    } else {
      const root = path.resolve(imagesDir);
      const target = path.resolve(root, data.image);
      if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
        errors.push(`Image "${data.image}" is missing from public/images; add it or omit image.`);
      }
    }
  }
  for (const [name, pattern, format] of [
    ["Ingredients", /^[-*]\s+\S/, "- ingredient"],
    ["Instructions", /^\d+\.\s+\S/, "1. Step"],
  ]) {
    if (!sections[name]) {
      errors.push(`Add a non-empty ## ${name} section.`);
      continue;
    }
    sections[name].split("\n").forEach((line, index) => {
      if (line.trim() && !pattern.test(line)) errors.push(`${name} line ${index + 1}: use ${format}, with each item on one line.`);
    });
  }
  return errors;
}

function validateDirectory(root = path.resolve(__dirname, "..")) {
  const recipeDir = path.join(root, "src/recipes");
  const files = fs.readdirSync(recipeDir).filter((file) => file.endsWith(".md")).sort();
  let failed = false;
  for (const file of files) {
    const errors = validateRecipe(fs.readFileSync(path.join(recipeDir, file), "utf8"), path.join(root, "public/images"));
    for (const error of errors) console.error(`${file}: ${error}`);
    failed ||= errors.length > 0;
  }
  if (!files.length) { console.error("No recipes found in src/recipes."); failed = true; }
  if (!failed) console.log(`Validated ${files.length} recipes.`);
  return !failed;
}

if (require.main === module) process.exitCode = validateDirectory() ? 0 : 1;
module.exports = { validateRecipe, validateDirectory };
