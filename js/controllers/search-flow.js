import { bindMovieCardToggle, createMovieCard } from "../components/movie-card.js";

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesQuery(title, query) {
  return normalizeText(title).includes(normalizeText(query));
}

export function createSearchFlowController({
  searchPanel,
  resultsSection,
  movies,
  minQueryLength,
  mockDelayMs
}) {
  let activeSearchToken = 0;

  function hideResults() {
    resultsSection.element.hidden = true;
    resultsSection.summary.textContent = "";
    resultsSection.grid.className = "results-grid";
    resultsSection.grid.innerHTML = "";
  }

  function renderLoadingState(query) {
    resultsSection.element.hidden = false;
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

  function renderEmptyState(query) {
    resultsSection.element.hidden = false;
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

  function renderErrorState() {
    resultsSection.element.hidden = false;
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

  function renderResults(items, query) {
    resultsSection.element.hidden = false;
    resultsSection.summary.textContent = `Showing ${items.length} result(s) for "${query}".`;
    resultsSection.grid.className = "results-grid";
    resultsSection.grid.innerHTML = "";

    items.forEach((movie) => {
      const card = createMovieCard(movie);
      bindMovieCardToggle(card, resultsSection.grid);
      resultsSection.grid.append(card);
    });
  }

  function resolveMockSearchState(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return "hidden";
    }

    if (normalizedQuery === "error") {
      return "error";
    }

    return "results";
  }

  function filterMovies(query) {
    return movies.filter((movie) => includesQuery(movie.title, query));
  }

  function performSearch(rawQuery) {
    const query = rawQuery.trim();
    activeSearchToken += 1;
    const currentToken = activeSearchToken;

    if (query.length < minQueryLength) {
      hideResults();
      return;
    }

    renderLoadingState(query);

    window.setTimeout(() => {
      if (currentToken !== activeSearchToken) {
        return;
      }

      const state = resolveMockSearchState(query);

      if (state === "error") {
        renderErrorState();
        return;
      }

      const filteredMovies = filterMovies(query);

      if (!filteredMovies.length) {
        renderEmptyState(query);
        return;
      }

      renderResults(filteredMovies, query);
    }, mockDelayMs);
  }

  return {
    performSearch
  };
}