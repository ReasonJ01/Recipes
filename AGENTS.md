# Recipe publishing

Repository: `ReasonJ01/Recipes`. Live site: https://recipes.reason.place/.
This is an Eleventy site deployed by the existing Cloudflare Pages Git integration.

## Dictation to a recipe

- Treat dictated or pasted notes as a request to do the writing and repository work. Read this file, README.md, and an existing recipe first.
- Create one Markdown file in `src/recipes/` with a short lowercase hyphenated filename. The catalogue discovers recipes automatically; no index needs editing.
- Preserve the user's quantities, units, temperatures, timings, variations, and personal notes. Clean up the wording and order the steps. Repeat supplied quantities in steps where useful while keeping the ingredient list consistent.
- Do not invent missing quantities, cooking times, servings, attribution, or photos. Ask one concise question if a missing detail prevents a usable recipe. Omit unknown optional metadata. Preserve intentional approximations such as "a pinch" or "to taste".
- Images are optional. A recipe without a photo is ready to publish. Add an image only when supplied or requested, in `public/images/`.
- Use the exact YAML fields and section headings in README.md. Keep each ingredient and numbered step on one line; the renderer treats each line as a separate item. Plain text works best in Ingredients and Instructions; Notes supports Markdown.
- Quote YAML text containing colons or other YAML punctuation. Use `## Instructions`, not `## Method`. Put component names on ingredient lines, such as `- Sauce: ...`, rather than adding subheadings.
- Titles determine published URLs. Preserve the title of an existing recipe unless the user wants its URL changed. Preserve existing content when updating a recipe and check for duplicates first.

## Check and preview

1. Start from current `main`, inspect any applicable instructions, and work on a recipe-specific branch.
2. Run `npm ci` and `npm run check`. This runs tests, validates every recipe, and builds `_site/`. Confirm the new recipe is linked from the catalogue and contains the intended ingredients and steps in the generated page. Never commit `_site/` or `node_modules/`.
3. Open a pull request with the written recipe and validation result. Cloudflare normally posts a preview URL and a deployment check. Read the actual check or PR comment for the exact head commit; do not guess a preview URL. If remote checks are available, they can verify work when local execution is unavailable; state which checks actually ran.
4. Show the user the recipe and working preview for review. Resolve material recipe questions before publication.

## Publish and verify

- Publishing means merging the reviewed recipe change into `main`. The existing Cloudflare integration handles deployment; no routine Cloudflare dashboard visit, API token, deploy hook, or manual upload is needed.
- If the user has already authorized publishing this recipe, continue through merge and verification. Otherwise present the finished recipe and preview and ask for publication approval. Do not repeatedly ask after authorization.
- Before merging, check the latest PR head, build/test results, and Cloudflare preview status. Merge the expected head SHA to avoid including unreviewed edits.
- After merging, check the Cloudflare deployment result for the merged commit. Verify the new recipe at the live domain when reachable, and return its exact URL. A merge alone does not establish that the site is live; distinguish deployment success from live-page verification if access fails.
- If a check fails, inspect its logs and fix the relevant problem. Never claim a build, preview, merge, or deployment succeeded without checking the result.
