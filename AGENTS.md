# How this tool is built

- Plain HTML, CSS and JavaScript. GitHub Pages serves the repo files as they
  are. No framework, no build step, no library, nothing loaded from a CDN
  (no script, stylesheet or font link to an outside host). Fonts are
  self-hosted in `fonts/` and declared with `@font-face` in the stylesheet.
- Use the simplest code that works, and add nothing I did not ask for.
- The only outside call is to the Rick and Morty API
  (https://rickandmortyapi.com). It needs no key. No other API, no backend,
  no serverless function, no AI model call. If a feature would need one,
  stop, tell me, and do not build it.
- No API key, token or secret anywhere in the repo.
- Every fetch uses `await` inside `try/catch` and checks `response.ok`,
  because a 404 does not throw. On search, a 404 means "no results" and is
  the empty state, not an error (see `PRD.md`).
- Read a real response before writing code that reads it. Use field names
  from the actual JSON (`episode`, `characters`, `air_date`), never guesses.
  `console.log` the response while building.
- Do not change what `PRD.md` says. If code and PRD disagree, tell me.
- Follow `DESIGN.md` exactly: the palette tokens, the two type stacks and
  their roles. Do not add a color, a font or a shadow because it is the
  easy default.
- One stylesheet (`css/styles.css`), one script (`js/main.js`), one
  `index.html`. No inline `<style>` blocks and no inline event handlers.
- Never use `alert()`. Errors and invalid input render inline, as described
  in `PRD.md`.
- Settings (ranking, max favorites, season breakdown) live in one `settings`
  object in `js/main.js`. Use `textContent`, not `innerHTML`, for anything that came
  from the API.
- Ask for one piece at a time. Build in this order and stop after each so I
  can check it: fetch and log a search, render results, favorites, fetch
  episodes in one batched request, compute the ranking, split into nights,
  season breakdown, then the error, loading and invalid-input states.
- Semantic HTML, readable on a phone.
- File and folder names: lowercase, no spaces.
- Commit as you go: one commit per working piece, not one commit holding the
  finished tool.
