# reason.place landing page

Static landing page for `https://reason.place/`.

It currently links to `https://recipes.reason.place/` and is intentionally simple so additional projects can be added later as new entries.

## Cloudflare Pages

Create a second Cloudflare Pages project from the existing `ReasonJ01/Recipes` GitHub repository.

Use:

- Production branch: `main`
- Framework preset: None
- Build command: leave blank
- Build output directory: `landing`

After the first deployment succeeds, add `reason.place` as the custom domain for that Pages project.

The existing `recipes.reason.place` project remains separate and unchanged.

## Files

- `index.html` — landing-page content
- `styles.css` — parchment/reference-book visual treatment
- `_headers` — basic Cloudflare Pages response headers

No build step or package installation is required.
