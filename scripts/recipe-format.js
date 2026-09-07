const yaml = require("js-yaml");

// Shared by validation and rendering so accepted recipes render the same way.
function parseRecipe(text) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const frontmatter = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!frontmatter) throw new Error("Start with YAML frontmatter between --- lines.");
  const data = yaml.load(frontmatter[1]);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Frontmatter must contain named fields, including title.");
  }
  const body = normalized.slice(frontmatter[0].length).trim();
  const headings = [...body.matchAll(/^## (.+?)\s*$/gm)];
  const sections = {};
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const name = heading[1].trim();
    if (!["Ingredients", "Instructions", "Notes"].includes(name)) {
      throw new Error(`Unknown section "${name}". Use Ingredients, Instructions, or Notes.`);
    }
    if (Object.hasOwn(sections, name)) throw new Error(`Duplicate ${name} section.`);
    sections[name] = body.slice(heading.index + heading[0].length, headings[i + 1]?.index).trim();
  }
  if (body.slice(0, headings[0]?.index ?? body.length).trim()) {
    throw new Error("Put introductory text in the Notes section so it appears on the site.");
  }
  return { data, sections };
}

module.exports = { parseRecipe };
