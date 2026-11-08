# PRD: Rick and Morty Watch Planner

## Goal
Ayushman picks up to three favorite characters and gets a short,
night-by-night watch plan of the episodes they appear in.

## User flow
1. Search a character by name, or tap a quick-pick chip, and see results.
2. Add up to three favorites (the max is a setting, 1 to 6).
3. Set nights (1 to 20) and episodes per night (1 to 4) with steppers.
4. Build the plan and see the night cards and a season breakdown.

## Data
API: https://rickandmortyapi.com (no key, CORS open)
- Search: GET /api/character/?name=<text>. Uses `info.count`, `info.next`
  and `results`. "Load more" fetches `info.next` and appends.
- Episodes: GET /api/episode/1,2,3 (one request; a single id returns an
  object, so wrap it in an array).
- Character fields: id, name, image, status, species, episode[] (URLs)
- Episode fields: id, name, episode ("S01E01"), air_date
The API has no runtime, so a night is a number of episodes, not minutes.

## Computed output
- For each episode, which favorites appear in it (episode id = last part of
  each URL in `character.episode`). Episodes with none are left out.
- Ranking setting: "most" (most favorites first, then by episode id) or
  "chrono" (episode id only).
- Plan: the first nights x episodes-per-night ranked episodes, split into
  nights. Only nights with episodes are shown, so the plan can be shorter.
- Season breakdown (a setting, on by default): planned episodes per season
  (season = parseInt(code.slice(1, 3))), with per-favorite counts.
- Every count is pluralized correctly.

Change after user testing: the first version split every shared episode
across the nights (about 11 per night) and printed the full ranked list.
Ayushman and I found that unrealistic and too long, so the plan is capped.

## States

### Empty
- Before any search: quick-pick chips ("Rick Sanchez", "Morty Smith",
  "Summer", "Mr. Meeseeks", "Birdperson", "Squanchy") and no results.
- Search with no match (the API answers 404): status line
  `No one named "xyz" in this dimension.` Not an error.
- No favorites: empty dashed slots, and Build is replaced by
  "Add at least one favorite to open a portal".

### Loading
- Search: a small portal and "Scanning dimensions…".
- Load more: the button reads "Loading…" and is disabled.
- Plan: a portal and "Calculating the optimal timeline…".

### Error
- Search or load more fails (network, or a non-404 bad response): status
  line "Couldn't reach the API. Try again." The Search button stays enabled.
- Plan fails: red text under the Build button "Plan failed — the portal
  fluid ran out. Try again." The Build button stays enabled.

### Invalid input
- Empty or whitespace-only search: refused before any request, with the
  status line "Type a character name first."
- Steppers cannot go below or above their ranges.
- Adding past the max is not possible: those cards show "Slots full".

### In use
- Status line `42 results for "Rick" · showing 20`, results grid.
- Favorite slots with avatar, name, and remove.
- Plan header "5 nights, 10 episodes" and "The best 10 of 14 episodes
  featuring your favorites, across 4 seasons."
- Night cards and the season card.

## Out of scope
Accounts, saved plans, other shows, a language model.

## Constraints
Plain HTML, CSS and JavaScript. No framework or library. The only outside
resource besides the API is the Google Fonts stylesheet named in DESIGN.md.
No key. Each fetch in try/catch with a response.ok check. Semantic HTML,
readable on a phone. Deploy on GitHub Pages.
