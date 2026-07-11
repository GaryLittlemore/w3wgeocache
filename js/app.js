// Loads /data/caches.json and renders the searchable list.
// No external APIs are called — What3Words addresses are stored and
// displayed as plain text/word-arrays only.

const state = {
  all: [],
  query: "",
  area: "all",
  difficulty: "all",
};

const grid = document.getElementById("cache-grid");
const searchInput = document.getElementById("search-input");
const areaSelect = document.getElementById("area-select");
const resultsCount = document.getElementById("results-count");
const chips = document.querySelectorAll(".chip");

init();

async function init() {
  try {
    const res = await fetch("data/caches.json");
    if (!res.ok) throw new Error("Could not load cache data");
    state.all = await res.json();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Couldn't load the cache list (${escapeHtml(
      String(err.message)
    )}). If you're viewing this file directly from disk, serve it over a local server instead — browsers block fetch() on file:// URLs.</div>`;
    return;
  }

  populateAreas(state.all);
  bindEvents();
  render();
}

function populateAreas(caches) {
  const areas = [...new Set(caches.map((c) => c.area))].sort();
  for (const area of areas) {
    const opt = document.createElement("option");
    opt.value = area;
    opt.textContent = area;
    areaSelect.appendChild(opt);
  }
}

function bindEvents() {
  let debounceId;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      state.query = e.target.value.trim().toLowerCase();
      render();
    }, 120);
  });

  areaSelect.addEventListener("change", (e) => {
    state.area = e.target.value;
    render();
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      state.difficulty = chip.dataset.difficulty;
      render();
    });
  });
}

function matches(cache) {
  const inArea = state.area === "all" || cache.area === state.area;
  const inDifficulty =
    state.difficulty === "all" ||
    cache.difficulty.toLowerCase() === state.difficulty;

  if (!state.query) return inArea && inDifficulty;

  const haystack = [
    cache.title,
    cache.area,
    cache.description,
    cache.hint || "",
    (cache.w3w || []).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return inArea && inDifficulty && haystack.includes(state.query);
}

function render() {
  const results = state.all.filter(matches);

  resultsCount.textContent = `${results.length} ${
    results.length === 1 ? "cache" : "caches"
  } listed`;

  if (results.length === 0) {
    grid.innerHTML = `<div class="empty-state">No caches match that search. Try a different area, difficulty, or keyword.</div>`;
    return;
  }

  grid.innerHTML = results.map(cacheCard).join("");
}

function cacheCard(cache) {
  const words = cache.w3w || [];
  const w3wHtml = words.map((w) => `<span>${escapeHtml(w)}</span>`).join("");
  const diffClass = (cache.difficulty || "").toLowerCase();

  return `
    <article class="cache-card">
      <div>
        <h3>${escapeHtml(cache.title)}</h3>
        <div class="cache-meta">${escapeHtml(cache.area)}</div>
      </div>

      <div class="w3w" aria-label="what3words address">${w3wHtml}</div>

      <div class="difficulty-badge">
        <span class="dot ${diffClass}"></span>
        ${escapeHtml(cache.difficulty)}${
    cache.size ? ` &middot; ${escapeHtml(cache.size)}` : ""
  }
      </div>

      <p class="desc">${escapeHtml(cache.description)}</p>

      ${
        cache.hint
          ? `<details><summary>Reveal hint</summary><p>${escapeHtml(
              cache.hint
            )}</p></details>`
          : ""
      }

      <div class="footer-line">Added by ${escapeHtml(
        cache.submittedBy || "anonymous"
      )} &middot; ${escapeHtml(cache.dateAdded || "")}</div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
