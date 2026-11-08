# Design Direction: Rick and Morty Watch Planner

Written before the tool is styled. The core component (a night of the plan)
is tried out in `design-trials/trial-1.html`; build from this document.

## Concept

A lab console in deep space. The plan is a series of nights, each a logged
block with its episodes below. The thing to see first is how many of your
favorites are in each episode, shown as glowing dots next to the title. The
look borrows the show's colors (portal green, lab-coat cyan, Morty yellow, a
purple-navy void) and a few science and sci-fi symbols, all drawn with CSS
and text characters.

No show logos, artwork or screenshots. Character images come from the API.

Revision: the first version used a flat dark green palette with no symbols.
It was too generic, so this version moves toward the show's own colors and a
sci-fi feel.

## Palette

| Token | Hex | Use |
|---|---|---|
| Void | `#0A0D1A` | Page background (with faint star dots) |
| Panel | `#131833` | Night blocks, cards, inputs |
| Rule | `#2B3566` | Borders, empty dots, bar tracks |
| Text | `#EAF2FF` | Main text |
| Muted | `#9FB0D6` | Episode codes, dates, hints |
| Portal | `#7CFF4F` | Primary buttons, headings, filled dots, focus ring, glow |
| Lab | `#5FD4F4` | Second accent: bar gradient end, section symbols |
| Yellow | `#FFD23F` | Error and invalid-input messages |

Contrast: Text and Muted on Panel and Void clear AA for body text. Portal,
Lab and Yellow on Void and Panel clear AA. Button text is Void on Portal.

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
reads on a phone. Blocks are Panel-colored with a 1px Rule border, 8px
radius, and a 4px Portal bar on the left edge with a soft Portal glow. The
page background is Void with a few faint star dots drawn in CSS.

Order on the page: search, favorites, nights input and Build button, then
results (ranked list, nightly plan, season breakdown).

An episode row has three columns: code, title, dots. The favorites' names
and the air date sit below the title in Muted.

## Components

- **Symbols:** a CSS portal (a spinning green and cyan gradient ring) beside
  the page title, and a small science glyph before each section heading
  (atom, radiation, star). Glyphs are text characters marked decorative, so
  screen readers skip them.
- **Night block:** monospace uppercase heading in Portal ("NIGHT 1", with
  the episode count on the right), then the episode rows split by Rule lines.
- **Dots:** one per picked favorite, filled Portal if they are in the
  episode, Rule if not. Always paired with the names in text and an
  `aria-label` ("2 of 3 favorites"), so color is never the only signal.
- **Search result:** image, name, status and species, and an Add button.
  The button is disabled and reads "Added" once a character is picked.
- **Buttons:** Portal fill with Void-colored text and a soft glow; disabled is Rule fill
  with Muted text.
- **Season breakdown:** one row per season with a count and a Portal to Lab
  gradient bar scaled to the largest season, and the number always shown beside the bar.

## States

- **Empty (start):** Muted text "Search for a character to start" and a
  favorites panel reading "Your favorites (0 of 3)".
- **Empty (no match):** Muted text "No characters found for '<text>'. Try a
  shorter name." in the results area. Not styled as an error.
- **Loading:** Muted text "Searching..." or "Building your plan..." in the
  area that will fill, and the triggering button disabled.
- **Error:** an Yellow-bordered block with Yellow text, `role="alert"`, above
  the results, with a "Try again" button inside it.
- **Invalid input:** one line of Yellow text directly under the field that
  caused it, and the field gets an Yellow border. Nothing is sent.
- **In use:** night blocks, ranked list and season breakdown as above.

## Motion

The title portal rotates slowly. Skipped under `prefers-reduced-motion`,
where it stays still. Nothing else animates.

## Accessibility

- Every interactive element has a visible Portal focus outline.
- Real `<button>`, `<label>`, `<input>`, `<ol>` and `<section>` elements.
- Error messages use `role="alert"` so they are announced.
- Readable at 360px wide with no horizontal scroll.
