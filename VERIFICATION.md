# Homework 5 verification

Checked on November 23, 2026.

## Completed checks

- JavaScript syntax: `node --check cat-fact-panel.js` and `node --check cat-fact-controls.js` passed.
- `npm test`: all 7 DOM test groups passed. They cover local sample cycling;
  loading and safe text rendering; success; HTTP, malformed JSON, invalid fields,
  and network failures; recovery on the same component; timeout recovery;
  restored/invalid preferences; storage read/write exceptions; and static
  content with scripts disabled. These are simulated DOM/network tests.
- Chrome local preview: the actual Cat Facts API returned a fact, the interface
  showed the returned text and success count, and controls became available again.
- Chrome local preview: compact mode survived reload; Enter activated both the
  external mode control and the internal sample control.
- Chrome local preview: light and dark themes used the portfolio's existing
  palette and a visible focus outline.
- `cd ssg-exercise && npm run build`: Eleventy 3.1.8 generated `index.html` and
  `about.html` and copied local assets successfully.
- Shared-section propagation: temporarily changed only `footer.njk`, rebuilt,
  and checked the new marker in both output files. Restored the final footer and
  rebuilt successfully.

## Reproduce in the browser

1. Start `python3 -m http.server 8080` in the portfolio root. Open
   `http://localhost:8080/projects.html#cat-facts`.
2. Tab to the internal buttons; use Enter/Space to switch samples and request a
   live fact. In DevTools Network, inspect the GET to `https://catfact.ninja/fact`
   and compare its JSON `fact` to the displayed text.
3. In Network, select Offline after the page has loaded. Request another fact:
   the status should report failure, the old fact should remain, and both
   controls should be restored. Navigation and the existing content remain usable.
4. Restore the connection and activate **Try live fact again** without reloading.
   A successful fact should replace the old one and clear the error status.
5. Use the external button to toggle compact mode in both directions. Confirm
   the chosen fact is preserved, `aria-pressed` matches the mode, and reloading
   restores the last choice. Repeat with the opposite mode.
6. Switch both themes and inspect text, buttons, and keyboard focus. Also check
   a narrow viewport for wrapped buttons and no horizontal overflow.
7. Storage exceptions are exercised automatically in `tests/component.test.cjs`
   without leaving deliberate errors in production code. For a manual check,
   temporarily throw inside each storage try block separately; ensure default
   restoration or current-page interaction still works, then remove the throw.
8. Disable JavaScript in DevTools and reload: the portfolio content/navigation,
   static fact, and explicit `<noscript>` message should remain. Re-enable
   JavaScript and test a live request again.
9. In `ssg-exercise/`, run `npm ci`, `npm run build`, and `npm start`; inspect
   `/index.html` and `/about.html` at port 8081. Follow its README to edit one
   footer and verify both pages update.

The browser offline toggle and browser-level JavaScript-disabled checks are
reproduction steps; the corresponding failure/fallback paths were also covered
by the automated tests. An API outage does not prevent the static portfolio
from being read.
