const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const { parseRecipe } = require("./scripts/recipe-format");

const md = new markdownIt();

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public/css": "css" });
  eleventyConfig.addPassthroughCopy({ "public/images": "images" });
  eleventyConfig.addPassthroughCopy({ "public/js": "js" });
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

  eleventyConfig.addFilter("ingredientsToList", function (text) {
    if (!text) return [];
    return text
      .split(/\n/)
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  });

  eleventyConfig.addFilter("instructionsToList", function (text) {
    if (!text) return [];
    return text
      .split(/\n/)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  });

  eleventyConfig.addFilter("extractMinutes", function (text) {
    if (!text || typeof text !== "string") return null;
    const match = text.match(/(\d+)\s*[-–—]\s*(\d+)\s*(?:min|minute)/i) ||
      text.match(/(\d+)\s*(?:min|minute)/i);
    if (match) {
      return match[2] ? Math.max(parseInt(match[1], 10), parseInt(match[2], 10)) : parseInt(match[1], 10);
    }
    return null;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
