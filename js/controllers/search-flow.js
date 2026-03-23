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
  resultsBatchSize,
  mockDelayMs
}) {
  let activeSearchToken = 0;
  let currentResults = [];
  let visibleResults = 0;
  let currentQuery = "";
  let loadingMore = false;

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

  function buildMovieCards(items) {
    return items.map((movie) => {
      const card = createMovieCard(movie);
      bindMovieCardToggle(card, resultsSection.grid);
      return card;
    });
  }

  function updateSummary() {
    if (!currentQuery) {
      resultsSection.setSummary("");
      return;
    }

    if (!visibleResults) {
      resultsSection.setSummary(`Showing 0 result(s) for "${currentQuery}".`);
      return;
    }

    resultsSection.setSummary(
      `Showing ${visibleResults} of ${currentResults.length} result(s) for "${currentQuery}".`
    );
  }

  function resetSearchState() {
    currentResults = [];
    visibleResults = 0;
    currentQuery = "";
    loadingMore = false;
    resultsSection.setLoadingMore(false);
  }

  function loadMoreResults() {
    if (!currentResults.length || loadingMore) {
      return;
    }

    if (visibleResults >= currentResults.length) {
      resultsSection.setLoadingMore(false);
      return;
    }

    loadingMore = true;
    resultsSection.setLoadingMore(true);

    window.setTimeout(() => {
      const nextItems = currentResults.slice(
        visibleResults,
        visibleResults + resultsBatchSize
      );

      const cards = buildMovieCards(nextItems);
      resultsSection.appendCards(cards);
      visibleResults += nextItems.length;
      updateSummary();

      loadingMore = false;
      resultsSection.setLoadingMore(visibleResults < currentResults.length);
    }, mockDelayMs);
  }

  function performSearch(rawQuery) {
    const query = rawQuery.trim();
    activeSearchToken += 1;
    const currentToken = activeSearchToken;

    if (query.length < minQueryLength) {
      resetSearchState();
      resultsSection.hide();
      return;
    }

    currentQuery = query;
    currentResults = [];
    visibleResults = 0;
    loadingMore = false;

    resultsSection.showLoading(query);

    window.setTimeout(() => {
      if (currentToken !== activeSearchToken) {
        return;
      }

      const state = resolveMockSearchState(query);

      if (state === "error") {
        resetSearchState();
        currentQuery = query;
        resultsSection.showError();
        return;
      }

      const filteredMovies = filterMovies(query);

      if (!filteredMovies.length) {
        resetSearchState();
        currentQuery = query;
        resultsSection.showEmpty(query);
        return;
      }

      currentResults = filteredMovies;
      visibleResults = 0;

      resultsSection.resetCards();
      loadMoreResults();
    }, mockDelayMs);
  }

  return {
    performSearch,
    loadMoreResults
  };
}