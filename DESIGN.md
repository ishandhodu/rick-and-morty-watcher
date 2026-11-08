# Design Direction: Rick and Morty Watch Planner

Written before the tool is styled. The core component (a night of the plan)
was tried out in `design-trials/trial-1.html`. This is the second direction.
The first (flat dark green, then a neon retheme) is in the git history.

## Concept

A dark sci-fi lab console. The theme comes from show artwork, the API's
character art, an original CSS portal, and a portal-green palette on
near-black. No show logo or icon pack. The footer credits the art and says
the project is not affiliated with Adult Swim.

## Palette

| Role | Hex |
|---|---|
| Page background | `#0a0e12` |
| Panel / card | `#111820` |
| Raised panel, card header, image background | `#16202a` |
| Border | `#22303c` |
| Divider between episodes | `#1a242e` |
| Stronger border (filled slot, hover) | `#2c3d4a`, `#3a4d5c` |
| Text primary | `#eaf2e3` |
| Text secondary | `#93a39b` |
| Text tertiary, placeholders | `#6d7d76` |
| Favorite names | `#c3d0c8` |
| Portal green (primary accent) | `#a6e13a`, hover `#bdf04f` |
| Deep green (bar gradient start) | `#3c7a24` |
| Cyan (episode codes) | `#5fd3e6` |
| Danger, Dead | `#ff6b4a` |
| Unknown status | `#8a97a0` |

Status dots: Alive green, Dead `#ff6b4a`, unknown `#8a97a0`.

## Type

Loaded from Google Fonts (the one exception to the no-CDN rule, because
this direction calls for it), with system fallbacks:
- **Bungee**: title, section headings, "Search" and "Build plan", night labels.
- **Outfit** (400 to 700): body and UI text.
- **Space Mono** (400, 700): kickers, counters, step badges, episode codes,
  status pills, summaries.

## Page

Centered column, max width 1240px, padding 40px 24px 80px, gap 40px, fully
fluid. Starfield background on the body (three star layers plus a green glow
top right and a cyan glow left).

## Images

Show artwork in `images/`, resized and saved as WebP (about 300 KB total):

| File | Where |
|---|---|
| `hero.webp` (family poster) | Header background, anchored right. The black left side holds the title; a dark gradient keeps text readable when the screen is narrow. |
| `portal-jump.webp` (Rick and Morty in the portal) | Start banner in step 01, before the first search, above the quick picks. |
| `pickle-rick.webp` | Beside the "No one named … in this dimension" status. |
| `mr-poopybutthole.webp` | Inside the "Add at least one favorite" box. |
| `rick-wired.webp` | Beside both error messages. |
| `favicon.png` | Browser tab icon, from the wired Rick head. |

All are decorative (`alt=""`), because the text next to each one says the
same thing.

## The portal

An original CSS circle used three times (72px header, 36px search loading,
48px plan loading): a glowing green radial core under a masked, spinning
conic-gradient swirl, pulsing slowly.

## Layout

- Header: a rounded banner with the family poster behind it, holding the
  portal, kicker "Interdimensional viewing schedule", H1, subtitle.
- Two columns that wrap: search on the left, a sticky aside on the right
  with favorites, plan controls and settings. The aside stacks under the
  search on narrow screens.
- Below: the watch plan (night cards grid, then a season card) and a footer
  crediting rickandmortyapi.com.

## Components

- **Step badge:** "01", "02", "03" in a green chip beside a Bungee heading.
- **Search:** field with a `>_` prompt, green Search button, quick-pick chips
  before the first search, a status line, results grid, "Load more".
- **Character card:** square image, status pill with colored dot, name,
  "species · N episodes", and an action: Add to favorites, "In favorites",
  or "Slots full".
- **Favorites:** exactly as many slots as the max (default 3). Filled slot
  has a glowing green avatar ring and a remove button; empty slots are dashed.
- **Steppers:** Nights (1 to 20, default 5) and Episodes per night (1 to 4,
  default 2), with a "5 × 2 = up to 10 episodes" summary.
- **Night card:** header with "Night 01" and "2 eps"; episode rows with a
  cyan code chip, title, air date, and overlapping favorite avatars with
  names, or "All your favorites".
- **Season card:** a bar per season scaled to the largest season, with the
  per-favorite counts under it.
- **Settings:** ranking (most favorites first or chronological), max
  favorites (1 to 6), and whether to show the season breakdown.

## States

- **Empty:** the portal-jump banner and quick-pick chips, no results;
  favorite slots empty; Build replaced by a dashed box with Mr. Poopybutthole
  and "Add at least one favorite to open a portal".
- **No match:** Pickle Rick beside `No one named "xyz" in this dimension.`
- **Loading:** portal plus "Scanning dimensions…" (search) or
  "Calculating the optimal timeline…" (plan).
- **Error:** the wired Rick head beside the message. Search: "Couldn't
  reach the API. Try again.",
  and in red under the Build button "Plan failed — the portal fluid ran out.
  Try again." The buttons stay enabled so the user can try again.
- **Invalid input:** an empty search is refused with a status line. The
  steppers cannot go outside their ranges, and the app will not let a
  fourth favorite be added: the card shows "Slots full".
- **In use:** results, favorites, night cards and season card.

## Motion

The portal spins and pulses. Skipped under `prefers-reduced-motion`. The
plan scrolls smoothly into view after it is built.

## Accessibility

- Real buttons, labels, inputs, lists and sections. Visible focus outline.
- Status and error text is in `aria-live` regions.
- Color is never the only signal: status has text, favorites have names.
- Readable at 360px wide with no horizontal scroll.
