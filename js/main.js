const API = 'https://rickandmortyapi.com/api';

// ---- data ----

// Returns { status, data }. fetch only throws on a network failure, so a
// 404 or 500 has to be caught by checking response.ok in the caller.
async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

// Search by name. The API answers 404 when nothing matches, which is not an
// error for us: it means "no results". Only the first page (20) is used.
async function searchCharacters(name) {
  const { ok, status, data } = await getJson(`${API}/character/?name=${encodeURIComponent(name)}`);
  if (status === 404) return [];
  if (!ok) throw new Error(`API answered ${status}`);
  return data.results;
}

// "https://rickandmortyapi.com/api/episode/12" -> 12
function idFromUrl(url) {
  return Number(url.split('/').pop());
}

// "S02E05" -> 2
function seasonFromCode(code) {
  return Number(code.slice(1, 3));
}

// Fetch every episode in one request: /episode/1,2,3. With a single id the
// API sends an object instead of an array, so wrap it.
async function getEpisodes(ids) {
  const { ok, status, data } = await getJson(`${API}/episode/${ids.join(',')}`);
  if (!ok) throw new Error(`API answered ${status}`);
  return Array.isArray(data) ? data : [data];
}

// For each episode, which favorites are in it. Episodes with none are left
// out. Highest count first, ties by earliest air date, then by id.
function rankEpisodes(favorites, episodes) {
  const ranked = episodes.map(episode => {
    const appearing = favorites.filter(f => f.episode.some(url => idFromUrl(url) === episode.id));
    return { episode, appearing, score: appearing.length };
  }).filter(item => item.score > 0);

  ranked.sort((a, b) =>
    b.score - a.score ||
    new Date(a.episode.air_date) - new Date(b.episode.air_date) ||
    a.episode.id - b.episode.id);
  return ranked;
}

// Split the ranked list into the requested number of nights. Rounds the
// per-night count up, so there can be fewer nights than asked for.
function splitIntoNights(ranked, nights) {
  const perNight = Math.ceil(ranked.length / nights);
  const result = [];
  for (let i = 0; i < ranked.length; i += perNight) {
    result.push(ranked.slice(i, i + perNight));
  }
  return result;
}

// Per season: how many planned episodes, and how many each favorite is in.
function seasonCounts(favorites, ranked) {
  const seasons = {};
  ranked.forEach(item => {
    const season = seasonFromCode(item.episode.episode);
    seasons[season] = seasons[season] || { total: 0, byFavorite: {} };
    seasons[season].total += 1;
    item.appearing.forEach(f => {
      seasons[season].byFavorite[f.name] = (seasons[season].byFavorite[f.name] || 0) + 1;
    });
  });
  return seasons;
}

// ---- page wiring ----

const $ = selector => document.querySelector(selector);

const state = {
  favorites: []   // character objects from the API, max 3
};

function showError(boxId, message, retry) {
  const box = $(boxId);
  box.textContent = message;
  if (retry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Try again';
    button.addEventListener('click', retry);
    box.append(button);
  }
  box.hidden = false;
}

function clearError(boxId) {
  $(boxId).hidden = true;
  $(boxId).textContent = '';
}

function setMessage(id, text, invalid) {
  const p = $(id);
  p.textContent = text;
  p.classList.toggle('invalid', Boolean(invalid));
}

function characterCard(character, buttonLabel, buttonDisabled, onClick) {
  const li = document.createElement('li');
  li.className = 'card';

  const img = document.createElement('img');
  img.src = character.image;
  img.alt = '';
  img.width = 56;
  img.height = 56;

  const info = document.createElement('div');
  info.className = 'info';
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = character.name;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${character.status} · ${character.species} · ${character.episode.length} episodes`;
  info.append(name, meta);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = buttonLabel;
  button.disabled = buttonDisabled;
  button.className = buttonLabel === 'Remove' ? 'secondary' : '';
  button.addEventListener('click', onClick);

  li.append(img, info, button);
  return li;
}

let searchResults = [];

function renderResults() {
  const list = $('#results');
  list.replaceChildren();
  searchResults.forEach(character => {
    const picked = state.favorites.some(f => f.id === character.id);
    list.append(characterCard(character, picked ? 'Added' : 'Add', picked, () => addFavorite(character)));
  });
}

async function runSearch(name) {
  const button = $('#search-btn');
  button.disabled = true;
  clearError('#search-error');
  setMessage('#search-msg', 'Searching...');
  $('#results').replaceChildren();
  try {
    searchResults = await searchCharacters(name);
    if (searchResults.length === 0) {
      setMessage('#search-msg', `No characters found for '${name}'. Try a shorter name.`);
    } else {
      setMessage('#search-msg', '');
      renderResults();
    }
  } catch (error) {
    setMessage('#search-msg', '');
    showError('#search-error', 'Could not reach the Rick and Morty API. Check your connection and try again.', () => runSearch(name));
  } finally {
    button.disabled = false;
  }
}

$('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#search-input').value.trim();
  $('#search-input').classList.remove('invalid');
  if (name === '') {
    $('#search-input').classList.add('invalid');
    setMessage('#search-msg', 'Type a character name first.', true);
    return;
  }
  runSearch(name);
});

function renderFavorites() {
  const list = $('#favorites');
  list.replaceChildren();
  state.favorites.forEach(character => {
    list.append(characterCard(character, 'Remove', false, () => removeFavorite(character.id)));
  });
  $('#fav-count').textContent = state.favorites.length;
  $('#fav-empty').hidden = state.favorites.length > 0;
}

function addFavorite(character) {
  if (state.favorites.length >= 3) {
    setMessage('#search-msg', 'You can pick up to three. Remove one first.', true);
    return;
  }
  state.favorites.push(character);
  setMessage('#search-msg', '');
  renderFavorites();
  renderResults();
}

function removeFavorite(id) {
  state.favorites = state.favorites.filter(f => f.id !== id);
  setMessage('#search-msg', '');
  renderFavorites();
  renderResults();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Filled dot for each favorite who is in the episode, faint dot for those who are not.
function pipsFor(item) {
  const pips = el('span', 'pips');
  pips.setAttribute('aria-label', `${item.score} of ${state.favorites.length} favorites`);
  state.favorites.forEach(f => {
    const dot = el('span', item.appearing.includes(f) ? '' : 'off', '●');
    pips.append(dot);
  });
  return pips;
}

function episodeRow(item) {
  const li = el('li', 'ep');
  li.append(
    el('span', 'code', item.episode.episode),
    el('span', 'title', item.episode.name),
    pipsFor(item),
    el('span', 'who', item.appearing.map(f => f.name).join(', ')),
    el('span', 'date', item.episode.air_date)
  );
  return li;
}

function renderPlan(ranked, nights) {
  const plan = $('#plan');
  plan.replaceChildren();
  splitIntoNights(ranked, nights).forEach((night, index) => {
    const section = el('section', 'night');
    const heading = el('h4');
    heading.append(el('span', '', `Night ${index + 1}`), el('span', '', `${night.length} episodes`));
    const list = el('ul');
    night.forEach(item => list.append(episodeRow(item)));
    section.append(heading, list);
    plan.append(section);
  });

  const ol = $('#ranked');
  ol.replaceChildren();
  ranked.forEach(item => {
    const li = el('li');
    li.append(el('span', 'code', item.episode.episode), `${item.episode.name} (${item.score} of ${state.favorites.length})`);
    ol.append(li);
  });

  const seasons = seasonCounts(state.favorites, ranked);
  const biggest = Math.max(...Object.values(seasons).map(s => s.total));
  const box = $('#seasons');
  box.replaceChildren();
  Object.keys(seasons).forEach(number => {
    const season = seasons[number];
    const row = el('div', 'season');
    const label = el('div', 'label');
    label.append(el('span', '', `Season ${number}`), el('span', '', `${season.total} episodes`));
    const bar = el('div', 'bar');
    const fill = el('span');
    fill.style.width = `${(season.total / biggest) * 100}%`;
    bar.append(fill);
    const detail = Object.entries(season.byFavorite).map(([name, count]) => `${name} ${count}`).join(' · ');
    row.append(label, bar, el('div', 'meta', detail));
    box.append(row);
  });

  const mostShared = Math.max(...ranked.map(item => item.score));
  $('#out-note').textContent = state.favorites.length > 1 && mostShared < 2
    ? 'None of these characters appear in an episode together. Showing each one’s own episodes instead.'
    : `${ranked.length} episodes across ${Object.keys(seasons).length} seasons.`;
  $('#output').hidden = false;
}

async function runBuild(nights) {
  const button = $('#build-btn');
  button.disabled = true;
  clearError('#plan-error');
  setMessage('#plan-msg', 'Building your plan...');
  $('#output').hidden = true;
  try {
    const ids = [...new Set(state.favorites.flatMap(f => f.episode.map(idFromUrl)))];
    const episodes = await getEpisodes(ids);
    const ranked = rankEpisodes(state.favorites, episodes);
    renderPlan(ranked, nights);
    setMessage('#plan-msg', '');
  } catch (error) {
    setMessage('#plan-msg', '');
    showError('#plan-error', 'Could not reach the Rick and Morty API. Check your connection and try again.', () => runBuild(nights));
  } finally {
    button.disabled = false;
  }
}

$('#plan-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#nights-input');
  const nights = Number(input.value);
  input.classList.remove('invalid');
  if (state.favorites.length === 0) {
    setMessage('#plan-msg', 'Pick at least one character.', true);
    return;
  }
  if (input.value.trim() === '' || !Number.isInteger(nights) || nights < 1 || nights > 20) {
    input.classList.add('invalid');
    setMessage('#plan-msg', 'Enter a whole number of nights from 1 to 20.', true);
    return;
  }
  runBuild(nights);
});

renderFavorites();
