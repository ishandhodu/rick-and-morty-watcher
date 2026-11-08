const API = 'https://rickandmortyapi.com/api';

// ---- data ----

// Returns { ok, status, data }. fetch only throws on a network failure, so a
// 404 or 500 has to be caught by checking response.ok in the caller.
async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

function searchUrl(name) {
  return `${API}/character/?name=${encodeURIComponent(name)}`;
}

// One page of characters. The API answers 404 when nothing matches, which is
// not an error for us: it means "no results".
async function fetchCharacters(url) {
  const { ok, status, data } = await getJson(url);
  if (status === 404) return { count: 0, next: null, results: [] };
  if (!ok) throw new Error(`API answered ${status}`);
  return { count: data.info.count, next: data.info.next, results: data.results };
}

// "https://rickandmortyapi.com/api/episode/12" -> 12
function idFromUrl(url) {
  return Number(url.split('/').pop());
}

// "S02E05" -> 2
function seasonFromCode(code) {
  return parseInt(code.slice(1, 3), 10);
}

// Fetch every episode in one request: /episode/1,2,3. With a single id the
// API sends an object instead of an array, so wrap it.
async function getEpisodes(ids) {
  const { ok, status, data } = await getJson(`${API}/episode/${ids.join(',')}`);
  if (!ok) throw new Error(`API answered ${status}`);
  return Array.isArray(data) ? data : [data];
}

// Map episode id -> favorites who appear in it.
function favoritesByEpisode(favorites) {
  const map = new Map();
  favorites.forEach(f => {
    f.episode.forEach(url => {
      const id = idFromUrl(url);
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(f);
    });
  });
  return map;
}

// "most": most favorites first, then by episode id. "chrono": episode id only.
function rankEpisodes(episodes, byEpisode, ranking) {
  const items = episodes.map(episode => ({ episode, appearing: byEpisode.get(episode.id) || [] }))
    .filter(item => item.appearing.length > 0);
  items.sort((a, b) =>
    ranking === 'chrono'
      ? a.episode.id - b.episode.id
      : b.appearing.length - a.appearing.length || a.episode.id - b.episode.id);
  return items;
}

// Take the first nights x perNight episodes and split them into nights.
// Only nights that have episodes come back, so the plan can be shorter.
function planNights(ranked, nights, perNight) {
  const chosen = ranked.slice(0, nights * perNight);
  const result = [];
  for (let i = 0; i < chosen.length; i += perNight) {
    result.push(chosen.slice(i, i + perNight));
  }
  return result;
}

// Season number -> { total, byFavorite: { name: count } }, in season order.
function seasonCounts(items) {
  const seasons = new Map();
  items.forEach(item => {
    const season = seasonFromCode(item.episode.episode);
    if (!seasons.has(season)) seasons.set(season, { total: 0, byFavorite: new Map() });
    const entry = seasons.get(season);
    entry.total += 1;
    item.appearing.forEach(f => entry.byFavorite.set(f.name, (entry.byFavorite.get(f.name) || 0) + 1));
  });
  return new Map([...seasons.entries()].sort((a, b) => a[0] - b[0]));
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// ---- page wiring ----

const settings = {
  ranking: 'most',      // 'most' | 'chrono'
  maxFavorites: 3,      // 1 to 6
  showSeasons: true
};

const state = {
  query: '',
  searched: false,
  searching: false,
  loadingMore: false,
  count: 0,
  next: null,
  results: [],
  favorites: [],
  nights: 5,
  perNight: 2,
  building: false,
  planBuilt: false,
  lastPlan: null
};

const LIMITS = { nights: [1, 20], perNight: [1, 4] };
const QUICK_PICKS = ['Rick Sanchez', 'Morty Smith', 'Summer', 'Mr. Meeseeks', 'Birdperson', 'Squanchy'];

const $ = selector => document.querySelector(selector);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function img(src, className) {
  const image = el('img', className);
  image.src = src;
  image.alt = '';
  image.loading = 'lazy';
  return image;
}

function isFavorite(character) {
  return state.favorites.some(f => f.id === character.id);
}

// ---- search ----

function setStatus(text) {
  $('#status').textContent = text;
}

function renderChips() {
  const box = $('#chips');
  box.replaceChildren();
  if (state.searched) return;
  box.append(el('span', 'chips-label', 'Try:'));
  QUICK_PICKS.forEach(name => {
    const chip = el('button', 'chip', name);
    chip.type = 'button';
    chip.addEventListener('click', () => {
      $('#search-input').value = name;
      runSearch(name);
    });
    box.append(chip);
  });
}

function statusClass(status) {
  const s = status.toLowerCase();
  return s === 'alive' ? 'alive' : s === 'dead' ? 'dead' : '';
}

function characterCard(character) {
  const li = el('li', 'card');

  const imageBox = el('div', 'card-img');
  const image = img(character.image, isFavorite(character) ? 'faded' : '');
  const pill = el('span', 'pill');
  pill.append(el('span', `dot ${statusClass(character.status)}`), character.status);
  imageBox.append(image, pill);

  const body = el('div', 'card-body');
  body.append(
    el('div', 'card-name', character.name),
    el('div', 'card-meta', `${character.species} · ${plural(character.episode.length, 'episode')}`)
  );

  const action = el('div', 'card-action');
  if (isFavorite(character)) {
    action.append(el('div', 'muted-box', 'In favorites'));
  } else if (state.favorites.length >= settings.maxFavorites) {
    action.append(el('div', 'muted-box', 'Slots full'));
  } else {
    const add = el('button', 'btn-add', '+ Add to favorites');
    add.type = 'button';
    add.addEventListener('click', () => addFavorite(character));
    action.append(add);
  }
  body.append(action);

  li.append(imageBox, body);
  return li;
}

function renderResults() {
  const list = $('#results');
  list.replaceChildren(...state.results.map(characterCard));

  const more = $('#more');
  more.replaceChildren();
  if (state.next && !state.searching) {
    const button = el('button', 'btn-more', state.loadingMore ? 'Loading…' : 'Load more results');
    button.type = 'button';
    button.disabled = state.loadingMore;
    button.addEventListener('click', loadMore);
    more.append(button);
  }
}

function resultsStatus() {
  if (state.count === 0) return `No one named "${state.query}" in this dimension.`;
  return `${plural(state.count, 'result')} for "${state.query}" · showing ${state.results.length}`;
}

async function runSearch(name) {
  state.query = name;
  state.searched = true;
  state.searching = true;
  state.results = [];
  state.next = null;
  renderChips();
  setStatus('');
  $('#search-loading').hidden = false;
  renderResults();
  try {
    const page = await fetchCharacters(searchUrl(name));
    state.count = page.count;
    state.next = page.next;
    state.results = page.results;
    setStatus(resultsStatus());
  } catch (error) {
    setStatus('Couldn’t reach the API. Try again.');
  } finally {
    state.searching = false;
    $('#search-loading').hidden = true;
    renderResults();
  }
}

async function loadMore() {
  state.loadingMore = true;
  renderResults();
  try {
    const page = await fetchCharacters(state.next);
    state.next = page.next;
    state.results = state.results.concat(page.results);
    setStatus(resultsStatus());
  } catch (error) {
    setStatus('Couldn’t reach the API. Try again.');
  } finally {
    state.loadingMore = false;
    renderResults();
  }
}

$('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#search-input').value.trim();
  if (name === '') {
    setStatus('Type a character name first.');
    $('#search-input').focus();
    return;
  }
  runSearch(name);
});

// ---- favorites ----

function renderSlots() {
  const list = $('#slots');
  list.replaceChildren();
  for (let i = 0; i < settings.maxFavorites; i++) {
    const character = state.favorites[i];
    const li = el('li', character ? 'slot filled' : 'slot empty');
    if (character) {
      const info = el('div', 'slot-info');
      info.append(el('div', 'slot-name', character.name), el('div', 'slot-meta', `${character.species} · ${character.status}`));
      const remove = el('button', 'btn-remove', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove ${character.name}`);
      remove.addEventListener('click', () => removeFavorite(character.id));
      li.append(img(character.image, 'slot-avatar'), info, remove);
    } else {
      li.append(el('span', 'slot-num', String(i + 1).padStart(2, '0')), el('span', 'slot-empty-label', 'Empty slot'));
    }
    list.append(li);
  }
  $('#fav-counter').textContent = `${state.favorites.length} / ${settings.maxFavorites}`;
  $('#max-text').textContent = settings.maxFavorites;
}

function addFavorite(character) {
  if (isFavorite(character) || state.favorites.length >= settings.maxFavorites) return;
  state.favorites.push(character);
  renderFavoritesAndControls();
}

function removeFavorite(id) {
  state.favorites = state.favorites.filter(f => f.id !== id);
  renderFavoritesAndControls();
}

function renderFavoritesAndControls() {
  renderSlots();
  renderResults();
  renderBuild();
  renderMaxOptions();
}

// ---- plan controls ----

function renderSteppers() {
  $('#nights-val').textContent = state.nights;
  $('#per-val').textContent = state.perNight;
  document.querySelectorAll('.ctl button').forEach(button => {
    const key = button.dataset.key;
    const dir = Number(button.dataset.dir);
    const [min, max] = LIMITS[key];
    button.disabled = dir < 0 ? state[key] <= min : state[key] >= max;
  });
  const total = state.nights * state.perNight;
  $('#plan-summary').textContent = `${state.nights} × ${state.perNight} = up to ${plural(total, 'episode')}`;
}

document.querySelectorAll('.ctl button').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.key;
    const [min, max] = LIMITS[key];
    state[key] = Math.min(max, Math.max(min, state[key] + Number(button.dataset.dir)));
    renderSteppers();
  });
});

function renderBuild() {
  const area = $('#build-area');
  area.replaceChildren();
  if (state.favorites.length === 0) {
    area.append(el('div', 'build-disabled', 'Add at least one favorite to open a portal'));
    return;
  }
  const button = el('button', 'btn-build', state.planBuilt ? 'Rebuild plan' : 'Build plan');
  button.type = 'button';
  button.disabled = state.building;
  button.addEventListener('click', buildPlan);
  area.append(button);
}

// ---- build ----

async function buildPlan() {
  state.building = true;
  $('#plan-error').textContent = '';
  $('#plan').hidden = true;
  $('#plan-loading').hidden = false;
  renderBuild();
  try {
    const byEpisode = favoritesByEpisode(state.favorites);
    const episodes = await getEpisodes([...byEpisode.keys()]);
    const ranked = rankEpisodes(episodes, byEpisode, settings.ranking);
    state.lastPlan = { ranked, nights: planNights(ranked, state.nights, state.perNight), favorites: [...state.favorites] };
    state.planBuilt = true;
    renderPlan();
    scrollToPlan();
  } catch (error) {
    $('#plan-error').textContent = 'Plan failed — the portal fluid ran out. Try again.';
  } finally {
    state.building = false;
    $('#plan-loading').hidden = true;
    renderBuild();
  }
}

function scrollToPlan() {
  const top = $('#plan').getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top, behavior: 'smooth' });
}

function episodeRow(item, favoriteCount) {
  const li = el('li', 'ep');
  const favs = el('div', 'ep-favs');
  item.appearing.forEach(f => favs.append(img(f.image, 'ep-avatar')));
  const everyone = favoriteCount >= 2 && item.appearing.length === favoriteCount;
  favs.append(el('span', 'ep-names', everyone ? 'All your favorites' : item.appearing.map(f => f.name).join(', ')));
  li.append(
    el('span', 'ep-code', item.episode.episode),
    el('div', 'ep-title', item.episode.name),
    el('div', 'ep-date', item.episode.air_date),
    favs
  );
  return li;
}

function renderPlan() {
  const { ranked, nights, favorites } = state.lastPlan;
  const planned = nights.flat();
  const seasons = seasonCounts(planned);

  $('#plan-title').textContent = `${plural(nights.length, 'night')}, ${plural(planned.length, 'episode')}`;
  const lead = settings.ranking === 'chrono' ? 'The first' : 'The best';
  $('#plan-note').textContent = ranked.length === 0
    ? 'None of your favorites appear in any episode.'
    : `${lead} ${planned.length} of ${plural(ranked.length, 'episode')} featuring your favorites, across ${plural(seasons.size, 'season')}.`;

  const grid = $('#nights');
  grid.replaceChildren();
  nights.forEach((night, index) => {
    const card = el('article', 'night');
    const head = el('div', 'night-head');
    head.append(
      el('h3', 'night-label', `Night ${String(index + 1).padStart(2, '0')}`),
      el('span', 'night-count', night.length === 1 ? '1 ep' : `${night.length} eps`)
    );
    const list = el('ul');
    night.forEach(item => list.append(episodeRow(item, favorites.length)));
    card.append(head, list);
    grid.append(card);
  });

  const rows = $('#season-rows');
  rows.replaceChildren();
  const largest = Math.max(0, ...[...seasons.values()].map(s => s.total));
  seasons.forEach((season, number) => {
    const row = el('div', 'season');
    const label = el('div', 'season-label');
    label.append(el('span', '', `Season ${number}`), el('span', '', plural(season.total, 'episode')));
    const track = el('div', 'track');
    const fill = el('div', 'fill');
    fill.style.width = `${(season.total / largest) * 100}%`;
    track.append(fill);
    const detail = [...season.byFavorite.entries()].map(([name, count]) => `${name} ×${count}`).join(' · ');
    row.append(label, track, el('div', 'season-meta', detail));
    rows.append(row);
  });
  $('#seasons').hidden = !settings.showSeasons || seasons.size === 0;
  $('#plan').hidden = false;
}

// ---- settings ----

// Max favorites can't go below how many are already picked.
function renderMaxOptions() {
  const select = $('#set-max');
  select.replaceChildren();
  for (let n = 1; n <= 6; n++) {
    const option = el('option', '', String(n));
    option.value = n;
    option.disabled = n < state.favorites.length;
    option.selected = n === settings.maxFavorites;
    select.append(option);
  }
}

$('#set-ranking').addEventListener('change', event => {
  settings.ranking = event.target.value;
});

$('#set-max').addEventListener('change', event => {
  settings.maxFavorites = Number(event.target.value);
  renderFavoritesAndControls();
});

$('#set-seasons').addEventListener('change', event => {
  settings.showSeasons = event.target.checked;
  if (state.lastPlan) renderPlan();
});

// ---- start ----

renderChips();
renderSteppers();
renderFavoritesAndControls();
