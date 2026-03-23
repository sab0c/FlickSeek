import { createAppBrand } from "./components/app-chrome.js";
import { createMovieCard, bindMovieCardToggle } from "./components/movie-card.js";
import { createResultsSection } from "./components/results-section.js";
import { createSearchPanel } from "./components/search-panel.js";

const MOCK_DELAY_MS = 420;

const staticMovies = [
  {
    id: "tt-batman-begins",
    title: "Batman Begins",
    type: "movie",
    year: "2005",
    runtime: "140 min",
    rating: "8.2",
    genre: "Action, Crime, Drama",
    awards: "Nominated for an Oscar.",
    synopsis:
      "After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from corruption.",
    posterLabel: "Batman Begins"
  },
  {
    id: "tt-dark-knight",
    title: "The Dark Knight",
    type: "movie",
    year: "2008",
    runtime: "152 min",
    rating: "9.0",
    genre: "Action, Crime, Drama",
    awards: "Won 2 Oscars.",
    synopsis:
      "Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos and tests the limits of justice.",
    posterLabel: "The Dark Knight"
  }
];

let activeSearchToken = 0;

function renderLoadingState(resultsSection, query) {
  resultsSection.summary.textContent = `Searching for "${query}"...`;
  resultsSection.grid.className = "results-grid results-grid--empty";
  resultsSection.grid.innerHTML = `
    <div class="results-section__loading-shell">
      <div class="results-section__spinner" aria-hidden="true"></div>
      <div class="results-section__loading-copy">
        <strong>Loading titles</strong>
        <span>Preparing your mock catalog.</span>
      </div>
    </div>
  `;
}

function renderEmptyState(resultsSection, query) {
  resultsSection.summary.textContent = `Showing 0 result(s) for "${query}".`;
  resultsSection.grid.className = "results-grid results-grid--empty";
  resultsSection.grid.innerHTML = `
    <div class="results-section__loading-shell movie-card__empty movie-card__empty--neutral">
      <div class="results-section__loading-copy">
        <strong>No titles found</strong>
      </div>
    </div>
  `;
}

function renderErrorState(resultsSection) {
  resultsSection.summary.textContent = "";
  resultsSection.grid.className = "results-grid results-grid--empty";
  resultsSection.grid.innerHTML = `
    <div class="results-section__loading-shell movie-card__empty movie-card__empty--error">
      <div class="results-section__loading-copy">
        <strong>Unable to load titles</strong>
        <span>Try another mock search.</span>
      </div>
    </div>
  `;
}

function renderStaticResults(resultsSection, query) {
  resultsSection.grid.className = "results-grid";
  resultsSection.grid.innerHTML = "";
  resultsSection.summary.textContent = `Showing 2 result(s) for "${query}".`;

  staticMovies.forEach((movie) => {
    const card = createMovieCard(movie);
    bindMovieCardToggle(card, resultsSection.grid);
    resultsSection.grid.append(card);
  });
}

function resolveMockSearchState(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return "hidden";
  }

  if (normalizedQuery === "error") {
    return "error";
  }

  if (normalizedQuery === "empty" || normalizedQuery === "nada" || normalizedQuery === "zzz") {
    return "empty";
  }

  return "results";
}

function runMockSearch(resultsSection, query, token) {
  renderLoadingState(resultsSection, query);

  window.setTimeout(() => {
    if (token !== activeSearchToken) {
      return;
    }

    const state = resolveMockSearchState(query);

    if (state === "error") {
      renderErrorState(resultsSection);
      return;
    }

    if (state === "empty") {
      renderEmptyState(resultsSection, query);
      return;
    }

    renderStaticResults(resultsSection, query);
  }, MOCK_DELAY_MS);
}

const app = document.querySelector("#app");

if (app) {
  const brand = createAppBrand();
  const searchPanel = createSearchPanel();
  const resultsSection = createResultsSection();

  app.append(brand, searchPanel.element, resultsSection.element);

  searchPanel.input.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    activeSearchToken += 1;
    const currentToken = activeSearchToken;

    if (!query) {
      resultsSection.element.hidden = true;
      resultsSection.grid.innerHTML = "";
      resultsSection.summary.textContent = "";
      return;
    }

    resultsSection.element.hidden = false;
    runMockSearch(resultsSection, query, currentToken);
  });
}