import { createMovieCard, createMovieCardController } from "../components/movie-card.js";

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
  const movieCardController = createMovieCardController(resultsSection.grid);

  let activeSearchToken = 0;
  let currentResults = [];
  let visibleResults = 0;
  let currentQuery = "";
  let loadingMore = false;

  movieCardController.bindOutsideClick();

  function buildMovieCards(items) {
    return items.map((movie) => {
      const card = createMovieCard(movie);
      movieCardController.bindCard(card);
      return card;
    });
  }

  function updateSummary() {
    if (!currentQuery) {
      return "";
    }

    if (!visibleResults) {
      return `Showing 0 result(s) for "${currentQuery}".`;
    }

    return `Showing ${visibleResults} of ${currentResults.length} result(s) for "${currentQuery}".`;
  }

  function resetState() {
    currentResults = [];
    visibleResults = 0;
    currentQuery = "";
    loadingMore = false;
    resultsSection.setLoadingMore(false);
  }

  function filterMovies(query) {
    return movies.filter((movie) => includesQuery(movie.Title, query));
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
    resultsSection.setLoadingMore(visibleResults > 0);

    window.setTimeout(() => {
      const nextItems = currentResults.slice(
        visibleResults,
        visibleResults + resultsBatchSize
      );

      const cards = buildMovieCards(nextItems);
      visibleResults += nextItems.length;

      if (visibleResults === nextItems.length) {
        resultsSection.showCards(cards, updateSummary());
      } else {
        resultsSection.appendCards(cards, updateSummary());
      }

      loadingMore = false;
      resultsSection.setLoadingMore(visibleResults < currentResults.length);
    }, mockDelayMs);
  }

  function performSearch(rawQuery) {
    const query = rawQuery.trim();
    activeSearchToken += 1;
    const currentToken = activeSearchToken;

    movieCardController.closeAllDetails();

    if (query.length < minQueryLength) {
      resetState();
      resultsSection.hide();
      return;
    }

    currentQuery = query;
    currentResults = [];
    visibleResults = 0;
    loadingMore = false;

    resultsSection.showInitialLoading(query);

    window.setTimeout(() => {
      if (currentToken !== activeSearchToken) {
        return;
      }

      const normalizedQuery = normalizeText(query);

      if (normalizedQuery === "error") {
        resetState();
        currentQuery = query;
        resultsSection.showError();
        return;
      }

      currentResults = filterMovies(query);

      if (!currentResults.length) {
        visibleResults = 0;
        resultsSection.showEmpty(query);
        return;
      }

      visibleResults = 0;
      loadMoreResults();
    }, mockDelayMs);
  }

  return {
    performSearch,
    loadMoreResults
  };
}