import { createAppBrand } from "./components/app-chrome.js";
import { createResultsSection } from "./components/results-section.js";
import { createSearchPanel } from "./components/search-panel.js";
import { MOCK_SEARCH_DELAY_MS, MIN_QUERY_LENGTH, SEARCH_DEBOUNCE_MS } from "./config/search.js";
import { createSearchFlowController } from "./controllers/search-flow.js";
import { debounce } from "./utils/debounce.js";

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

const app = document.querySelector("#app");

if (app) {
  const brand = createAppBrand();
  const searchPanel = createSearchPanel();
  const resultsSection = createResultsSection();

  const searchFlow = createSearchFlowController({
    searchPanel,
    resultsSection,
    movies: staticMovies,
    minQueryLength: MIN_QUERY_LENGTH,
    mockDelayMs: MOCK_SEARCH_DELAY_MS
  });

  const debouncedSearch = debounce((value) => {
    searchFlow.performSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  app.append(brand, searchPanel.element, resultsSection.element);

  searchPanel.input.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
  });
}