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
