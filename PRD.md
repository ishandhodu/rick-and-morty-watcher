# PRD: Rick and Morty Watch Planner

## Goal
Ayushman picks up to three favorite characters and gets a ranked, nightly
watch plan of the episodes they appear in together.

## User flow
1. Search a character by name and see matching results.
2. Pick up to three favorites.
3. Set how many nights to watch over.
4. See the ranked episodes, the plan split by night, and a season breakdown.

## Data
API: https://rickandmortyapi.com (no key, CORS open)
- Search: GET /api/character/?name=<text>  (20 per page; show the first page)
- Episodes: GET /api/episode/1,2,3  (one request for many ids)
- Character fields: id, name, image, status, species, episode[] (URLs)
- Episode fields: id, name, episode ("S01E01"), air_date, characters[] (URLs)
Assumption stated in README: no runtime in the API, so a night is a number
of episodes, not minutes.

## Computed output
- Overlap score per episode: how many of the picked favorites are in it.
- Ranking: highest score first, ties by earliest air date.
- Plan: ranked episodes split into the chosen number of nights.
- Season breakdown: appearances per season (read from "S02E05" -> 2).
Episodes with no favorites are left out.

## States

### Empty
- Before any search: a prompt, "Search for a character to start", with the
  search box focused and an empty "Your favorites (0 of 3)" panel.
- Search with no match: the API answers 404. Show "No characters found for
  '<text>'. Try a shorter name." Do not treat this as an error.
- Favorites picked but no shared episodes: "None of these characters appear
  in an episode together" and show each one's own episodes instead.

### Loading
- Search: "Searching..." under the box; the search button is disabled.
- Building the plan: "Building your plan..." in the results area; the
  Build button is disabled so a second click cannot send a second request.

### Error
- Shown in a visible message under the search box or above the results
  (role="alert"), in red, saying what failed: "Could not reach the Rick and
  Morty API. Check your connection and try again."
- Triggered by a network failure (catch) or a non-404 bad response
  (response.ok false). A 404 on search is the empty state, not this.
- Next step: a "Try again" button repeats the last request.

### Invalid input
Refused before any request is sent:
- Empty or whitespace-only search: "Type a character name first."
- Build with no favorites picked: "Pick at least one character."
- Picking a fourth favorite: "You can pick up to three. Remove one first."
- Nights outside 1 to 20 or not a whole number: "Enter a whole number of
  nights from 1 to 20."

### In use
- Search results: image, name, status, species, an "Add" button (disabled
  once picked).
- Favorites panel: picked characters with a remove button.
- Ranked list: episode code, title, air date, which favorites appear.
- Plan: "Night 1, Night 2, ..." groups of episodes.
- Season breakdown: appearances per season, per favorite.

## Out of scope
Accounts, saved plans, other shows, a language model.

## Constraints
Plain HTML, CSS and JavaScript. No framework, no CDN, no key. Each fetch in
try/catch with a response.ok check. Semantic HTML, readable on a phone.
Deploy on GitHub Pages.
