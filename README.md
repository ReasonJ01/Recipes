# Recipe Catalogue

A static recipe site that presents your recipes like an art gallery catalogue—beautiful typography, cohesive colours, and fluid interactions.

## Quick Start

```bash
npm install
npm run build
npm run serve
```

Then open http://localhost:8080

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

## PWA

The site is a Progressive Web App—installable and works offline. Icons are generated on build. Deploy over HTTPS for full PWA features.
