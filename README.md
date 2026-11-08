# Rick and Morty Watch Planner

Pick up to three favorite Rick and Morty characters and get a watch plan of
the episodes they appear in, ranked by how many of your favorites are in
each one and split across the number of nights you have.

Built for my roommate Ayushman, who wants to rewatch the show by character
instead of from S01E01.

**Live site:** https://ishandhodu.github.io/rick-and-morty-watcher/

## API

[The Rick and Morty API](https://rickandmortyapi.com/documentation). No key
needed. The page uses:
- `GET /api/character/?name=<text>` to search characters
- `GET /api/episode/1,2,3` to fetch many episodes in one request

## How to use

1. Search for a character by name, or tap one of the quick picks, and press
   "+ Add to favorites" on up to three of them. "Load more results" shows
   the next page of matches.
2. Use the steppers to set nights (1 to 20) and episodes per night (1 to 4).
3. Press Build plan.

You get a short plan of the best episodes (nights x episodes per night),
split into night cards, and a per-season breakdown. Episodes are ranked by
how many of your favorites are in them. Under Settings you can switch to
chronological order, change the max favorites (1 to 6), or hide the season
breakdown. The API has no episode runtime, so a night is a number of
episodes, not minutes.

## Where what the agent built differs from what I expected

I expected the agent to build a Rick and Morty theme, using the colors from
the show and symbols related to science, sci-fi and technology, but it did
not use the exact designs I expected. I also expected it to list just a few
episodes per night, but it made a very unrealistic plan and printed the full
output, which was very long. Those UI and UX decisions were poor.

## Required question

The AI's first version of the plan (commit 2adf8b1) split every episode my
favorite characters share across the nights I picked. With Rick, Morty and
Summer over 5 nights, that was about 11 episodes a night, and it also printed
a full ranked list of all 51 episodes below it. I did not accept that. When I
looked at it, the plan was not something anyone would actually watch, and the
page was very long. My roommate Ayushman tried it and told me the same thing:
too long, and he wanted a more realistic plan.

I changed it in commit 867498a. I added an "episodes per night" input (1 to
4), made the plan include only the best nights x episodes-per-night episodes
(for example 5 x 2 = 10), and removed the full ranked list. I updated PRD.md
first, in commit 33e2209, so the change is documented before the code.
