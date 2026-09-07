const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const { parseRecipe } = require("./scripts/recipe-format");

const md = new markdownIt();

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public/css": "css" });
  eleventyConfig.addPassthroughCopy({ "public/images": "images" });
  eleventyConfig.addPassthroughCopy({ "public/icons": "icons" });
  eleventyConfig.addPassthroughCopy({ "public/manifest.webmanifest": "manifest.webmanifest" });
  eleventyConfig.addPassthroughCopy({ "public/sw.js": "sw.js" });

  eleventyConfig.addFilter("markdown", function (content) {
    if (!content) return "";
    return md.render(content);
  });

  eleventyConfig.addCollection("recipes", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/recipes/*.md").sort((a, b) => {
      const titleA = (a.data.title || "").toLowerCase();
      const titleB = (b.data.title || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });
  });

  eleventyConfig.addFilter("parseRecipeSections", function (inputPath) {
    if (!inputPath) return {};
    const fullPath = path.join(process.cwd(), inputPath);
    if (!fs.existsSync(fullPath)) return {};
    return parseRecipe(fs.readFileSync(fullPath, "utf8")).sections;
  });

  eleventyConfig.addFilter("ingredientGroups", function (text) {
    if (!text) return [];
    const groups = [];
    const lines = text.split(/\n/).map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
    for (const line of lines) {
      const component = line.match(/^([A-Za-z][A-Za-z &-]*):\s+(.+)$/);
      const title = component ? component[1] : "";
      const item = component ? component[2] : line;
      if (!groups.length || groups[groups.length - 1].title !== title) {
        groups.push({ title, items: [] });
      }
      groups[groups.length - 1].items.push(item);
    }
    return groups;
  });

  eleventyConfig.addFilter("instructionsToList", function (text) {
    if (!text) return [];
    return text
      .split(/\n/)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
