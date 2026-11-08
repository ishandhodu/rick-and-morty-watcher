# Design Direction: Rick and Morty Watch Planner

Written before the tool is styled. The core component (a night of the plan)
is tried out in `design-trials/trial-1.html`; build from this document.

## Concept

A flight log. The plan is a series of nights, and each night is a logged
block with its episodes listed below. The thing to see first is how many of
your favorites are in each episode, shown as filled dots next to the title,
not buried in a column of text. It is dark, like a screen at night, because
that is when Ayushman will use it.

No show logos, artwork or screenshots. Character images come from the API.

## Palette

| Token | Hex | Use |
|---|---|---|
| Space | `#0F1318` | Page background |
| Panel | `#171D25` | Night blocks, search results, favorites panel |
| Rule | `#2A3441` | Hairline borders, empty dots |
| Text | `#E8EDF2` | Main text |
| Muted | `#9AA6B4` | Episode codes, dates, hints, metadata |
| Portal | `#97CE4C` | Primary buttons, night headings, filled dots, focus ring |
| Amber | `#F2B84B` | Error and invalid-input messages |

Contrast: Text and Muted on Panel clear AA for body text. Portal on Space
and Panel clears AA. Amber on Space clears AA.

## Type

- **System sans** (`ui-sans-serif, system-ui, -apple-system, "Segoe UI",
  sans-serif`): headings, titles, body text.
- **System monospace** (`ui-monospace, "SF Mono", Menlo, Consolas,
  monospace`): anything that is a code or a count: S01E01, "Night 1",
  the dots, the season counts.

Nothing is loaded from a CDN. Each typeface does one job and they are not
mixed within one line.

## Layout

Single column, max width 640px, centered, with 16px side padding so it
reads on a phone. Blocks are Panel-colored with a 1px Rule border, 6px
radius, and a 4px Portal bar on the left edge. No shadows.

Order on the page: search, favorites, nights input and Build button, then
results (ranked list, nightly plan, season breakdown).

An episode row has three columns: code, title, dots. The favorites' names
and the air date sit below the title in Muted.

## Components

- **Night block:** monospace uppercase heading in Portal ("NIGHT 1", with
  the episode count on the right), then the episode rows split by Rule lines.
- **Dots:** one per picked favorite, filled Portal if they are in the
  episode, Rule if not. Always paired with the names in text and an
  `aria-label` ("2 of 3 favorites"), so color is never the only signal.
- **Search result:** image, name, status and species, and an Add button.
  The button is disabled and reads "Added" once a character is picked.
- **Buttons:** Portal fill with Space-colored text; disabled is Rule fill
  with Muted text.
- **Season breakdown:** one row per season with a count and a bar scaled to
  the largest season, and the number always shown beside the bar.

## States

- **Empty (start):** Muted text "Search for a character to start" and a
  favorites panel reading "Your favorites (0 of 3)".
- **Empty (no match):** Muted text "No characters found for '<text>'. Try a
  shorter name." in the results area. Not styled as an error.
- **Loading:** Muted text "Searching..." or "Building your plan..." in the
  area that will fill, and the triggering button disabled.
- **Error:** an Amber-bordered block with Amber text, `role="alert"`, above
  the results, with a "Try again" button inside it.
- **Invalid input:** one line of Amber text directly under the field that
  caused it, and the field gets an Amber border. Nothing is sent.
- **In use:** night blocks, ranked list and season breakdown as above.

## Motion

None required. If anything animates, it is skipped under
`prefers-reduced-motion`.

## Accessibility

- Every interactive element has a visible Portal focus outline.
- Real `<button>`, `<label>`, `<input>`, `<ol>` and `<section>` elements.
- Error messages use `role="alert"` so they are announced.
- Readable at 360px wide with no horizontal scroll.
