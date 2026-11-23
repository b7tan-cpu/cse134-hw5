# Shared footer exercise — Eleventy

Requires Node.js 18 or newer. From `hw5/ssg-exercise/`:

```sh
npm ci
npm run build
npm start
```

Preview both generated pages:

- Home: http://localhost:8081/index.html
- About Me: http://localhost:8081/about.html

`npm run build` writes `_site/`; `npm start` builds, serves, and watches source
changes. The main Homework 5 portfolio is outside this folder and needs no build.

## Source and shared section

- `src/index.njk`: existing portfolio home page, retaining its heading and main content.
- `src/about.njk`: existing portfolio About page, retaining its heading and main content.
- `src/_includes/footer.njk`: the single shared footer used by both templates.
- `src/styles.css`, `src/theme.js`, and `src/assets/`: local style, theme, and asset copies.
- `eleventy.config.cjs`: input/output directories and asset passthrough configuration.

The exercise navigation links to its two pages; project-plan links point to the
main portfolio. Neither page requires client JavaScript to display the footer.

## Verify a single edit updates both pages

1. Build and open both URLs above. Each has distinct main content and the footer
   text “Built with a shared Eleventy footer.”
2. Change that phrase in **only** `src/_includes/footer.njk` and save.
3. Run `npm run build` again (or let `npm start` rebuild).
4. Refresh both pages and confirm that both show the new phrase.

The checked-in `package-lock.json` makes dependency installation reproducible.
Generated `_site/` and `node_modules/` are intentionally ignored by Git.
