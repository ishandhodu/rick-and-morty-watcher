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

1. Search for a character by name and press Add on up to three of them.
2. Enter how many nights you want to watch over (1 to 20).
3. Press Build plan.

You get a plan split into nights, a ranked list of every episode, and a
per-season breakdown. Episodes with none of your favorites are left out. The
API has no episode runtime, so a night is a number of episodes, not minutes.

## Where what the agent built differs from what I expected

TODO (write this after you have compared the finished tool to your proposal).

## Required question

TODO (pick one piece of AI output you did not accept as-is, say what it
gave you, what you changed, how you knew, and point at the commit).
