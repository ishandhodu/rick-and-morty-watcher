# Proposal: Rick and Morty Watch Planner

## What I am building
A page where you pick up to three favorite Rick and Morty characters and it
builds a ranked watch list of the episodes they appear in together.

## Who it is for
My roommate Ayushman, a big fan of the show. He has seen parts of it but
wants to rewatch the episodes featuring his favorite characters, in an
order that puts the best overlap first, without going through all 51
episodes in order.

## The API
- Rick and Morty API, https://rickandmortyapi.com/documentation
- URLs I opened:
  https://rickandmortyapi.com/api/character/?name=rick
  https://rickandmortyapi.com/api/episode/1,2,3
- Fields I will use:
  - character: id, name, image, status, species, episode (list of URLs)
  - episode: id, name, episode (S01E01), air_date, characters (list of URLs)
- No key needed, and it sends CORS headers, so GitHub Pages works.

## What the user chooses
Which characters to search for and pick (up to 3), and how many nights
they have to watch.

## What the page works out
For each episode, how many of my favorites are in it. Then:
- ranking: episodes with the most favorites first, ties broken by air date
- split into nights at a set number of episodes per night
- a count per season showing where my favorites cluster

## Features
1. Character search with results
2. Pick up to three favorites
3. Ranked episode list by favorite overlap
4. Watch plan split across the nights I choose
5. Per-season breakdown

## What I do not know yet
- How to turn the episode URLs into IDs for one batched request
- How to combine the three characters' episode lists (a Set / counting)
- How to read the season out of "S02E05"
- What to do when a search returns 404
