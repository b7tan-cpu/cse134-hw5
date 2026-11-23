# Homework 5 — Binteng Tan

This independent copy of my Homework 4 portfolio adds **Cat Curiosity**, a custom
element on [`projects.html#cat-facts`](projects.html#cat-facts). The home page links
directly to it. The original Homework 4 repository and deployment are unchanged.

## Preview the portfolio

No build or dependencies are needed for the main site. From this folder:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080/ and http://localhost:8080/projects.html#cat-facts.
Use a web server rather than opening the HTML as a file. The live feature needs
an Internet connection; local samples and the portfolio remain available offline
after the page is loaded.

## Design note

A visitor wants a short, playful study break while browsing my projects. The
`<cat-fact-panel>` begins with a clearly labeled local sample. Its **Next local
sample** button cycles through two JavaScript examples and announces the sample
number. Its **Get a live cat fact** button calls `loadFact()` and sends an HTTPS
GET request to `https://catfact.ninja/fact` with `Accept: application/json`.

While waiting, the existing `role="status"` paragraph announces loading, both
internal buttons are disabled, and the previous fact remains visible. The code
checks `response.ok`, parses JSON, and checks that `fact` is a nonempty string
of at most 5,000 characters before assigning it to the blockquote's `textContent`.
It also updates the source and success status without navigation or a reload.
Remote strings are never inserted as HTML. Network, HTTP, JSON, validation, or
12-second timeout failures leave the previous content visible, announce failure,
and restore the buttons. **Try live fact again** retries on the same page.

The native button outside the component sets or removes the observed `compact`
attribute. `attributeChangedCallback()` hides or reveals the description and
source without replacing the selected fact, controls, or status. Its
`aria-pressed` state and label reflect the restored mode. The component's own
`hw5-cat-fact-panel-mode` storage key accepts `compact` or `expanded`; other values
default to expanded. Reads and writes have separate `try/catch` handling, and the
attribute changes before saving, so blocked storage does not prevent interaction.

The portfolio stylesheet supplies `--cat-background`, `--cat-text`, `--cat-muted`,
`--cat-border`, and `--cat-focus` using the existing light/dark theme variables.
Component declarations consume these properties with usable fallback colors.
Native buttons, visible focus rings, a persistent status region, static fallback
content, and a nearby `<noscript>` message support keyboard and no-JavaScript use.

## Separate static site generator exercise

Folder: **`ssg-exercise/`**. Preview **Home (`/index.html`)** and **About Me
(`/about.html`)**. Both are copies of existing portfolio pages with their own
main content and a shared `src/_includes/footer.njk` include. The exercise is
separate from the deployed portfolio. See its [README](ssg-exercise/README.md)
for installation, build, preview, and shared-footer verification instructions.

## Verification

See [VERIFICATION.md](VERIFICATION.md) for checks and reproduction steps. The
automated DOM tests are in `tests/component.test.cjs`:

```sh
npm ci
npm test
```

## Submission

`links.txt` must contain the actual Homework 5 repository, deployed home page,
and deployed `projects.html` URLs, in that order, one HTTPS URL per line. Verify
all three before uploading that file to Gradescope. Do not submit Homework 4 URLs.

## References

- [Cat Facts endpoint](https://catfact.ninja/fact)
- [Eleventy getting started](https://www.11ty.dev/docs/)
- [Eleventy includes](https://www.11ty.dev/docs/includes/)
