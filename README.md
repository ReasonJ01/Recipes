# Recipe Notebook

A personal recipe notebook at https://recipes.reason.place/, using Cormorant Garamond, Source Serif 4, and Source Sans 3. Recipes are reading pages with grouped ingredients, a numbered method, and kitchen notes. The layout stacks on mobile and uses two columns on wider screens. Timers and ingredient checkboxes have been removed.

## Quick Start

```bash
npm ci
npm run check
npm run build
npm run serve
```

Then open http://localhost:8080

## Dictate a recipe to an agent

Tell your GitHub-connected agent to add a recipe to `ReasonJ01/Recipes`, then dictate or paste your rough notes. The agent should read `AGENTS.md`, write the recipe, run checks, and give you a Cloudflare preview to review. When you ask it to publish, it merges the change and checks the production deployment.

You do not need to format Markdown, supply a photo, run a terminal, or open Cloudflare for each recipe. Missing optional details can be left out. The agent should ask about anything essential rather than inventing it.

The live site is https://recipes.reason.place/.

## Adding Recipes

1. Create a new `.md` file in `src/recipes/`
2. Use the format:

```markdown
---
title: Recipe Name
image: filename.jpg          # optional
prep_time: 15 min             # optional
cook_time: 12 min             # optional
servings: 4                   # optional
categories: [dinner, pasta]   # optional
source: Site or book name     # optional - attribution
source_url: https://...       # optional - link when source is set
---

## Ingredients
- Item 1
- Item 2

## Instructions
1. Step one
2. Step two

## Notes
- Optional tips
```

3. Add images to `public/images/` and reference via the `image` field
4. Run `npm run build`

Only `title`, `## Ingredients`, and `## Instructions` are required. Use one ingredient or numbered step per line; do not wrap steps onto multiple lines or add subheadings. Put component names at the start of ingredient lines, such as `- Fruit: 650 g pears`; consecutive matching labels become ingredient group headings. Ingredients and Instructions display plain text; Notes supports Markdown. Quote YAML values containing punctuation such as a colon. Image paths are relative to `public/images/`.

The catalogue updates automatically from the recipe files. Published URLs come from the recipe title, so changing an existing title also changes its URL.

## Checks and deployment

`npm run validate` checks recipe structure, metadata, and image references. `npm run check` runs the regression tests and full site build. `npm run build` also validates recipes before building, so an invalid recipe stops a normal Cloudflare build. GitHub runs `npm run check` for pull requests and pushes to `main`.

The existing Cloudflare Pages project is `recipes`. Its GitHub integration has successfully deployed this repository. The build settings for this Eleventy project are:

| Setting | Value |
| --- | --- |
| Repository | `ReasonJ01/Recipes` |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `_site` |
| Root directory | Repository root |

These are the settings to verify if deployment needs troubleshooting; repository files cannot establish the current dashboard settings. No new deployment service or secret is required for the existing Git integration.

Cloudflare's [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) supports branch previews and automatic deployment. For each recipe:

1. The agent creates a branch and pull request, then checks the build and the Cloudflare preview for that commit.
2. Review the recipe in the preview. Tell the agent to publish when ready.
3. The agent merges into `main`, waits for the Cloudflare deployment result for the merged commit, and checks the recipe's live URL.

If a preview or deployment does not appear, inspect the PR checks and Cloudflare branch deployment controls before changing the setup. If a deployment fails, inspect the build log. Report a successful deployment separately from a live-page check if the live domain cannot be reached.

## PWA

The site is a Progressive Web App—installable and works offline for cached pages. Online page visits fetch current content so newly published recipes appear; offline visits use a saved copy when available. An already-open page needs reloading to show changes. Icons are generated on build. Deploy over HTTPS for full PWA features.
