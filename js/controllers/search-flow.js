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

  function performSearch(rawQuery) {
    const query = rawQuery.trim();
    activeSearchToken += 1;
    const currentToken = activeSearchToken;

    if (query.length < minQueryLength) {
      resultsSection.hide();
      return;
    }

    resultsSection.showLoading(query);

    window.setTimeout(() => {
      if (currentToken !== activeSearchToken) {
        return;
      }

      const state = resolveMockSearchState(query);

      if (state === "error") {
        resultsSection.showError();
        return;
      }

      const filteredMovies = filterMovies(query);

      if (!filteredMovies.length) {
        resultsSection.showEmpty(query);
        return;
      }

      const cards = buildMovieCards(filteredMovies);
      resultsSection.showCards(cards, query);
    }, mockDelayMs);
  }

  return {
    performSearch
  };
}