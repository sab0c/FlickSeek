import { createAppBrand } from "./components/app-chrome.js";
import { createResultsSection } from "./components/results-section.js";
import { createSearchPanel } from "./components/search-panel.js";
import {
  MIN_QUERY_LENGTH,
  MOCK_DETAILS_DELAY_MS,
  RESULTS_BATCH_SIZE,
  SEARCH_DEBOUNCE_MS
} from "./config/search.js";
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
  },
  {
    id: "tt-batman-returns",
    title: "Batman Returns",
    type: "movie",
    year: "1992",
    runtime: "126 min",
    rating: "7.1",
    genre: "Action, Crime, Fantasy",
    awards: "Nominated for 2 Oscars.",
    synopsis:
      "Batman faces the Penguin and Catwoman while Gotham City falls into a new wave of darkness and manipulation.",
    posterLabel: "Batman Returns"
  },
  {
    id: "tt-batman-1989",
    title: "Batman",
    type: "movie",
    year: "1989",
    runtime: "126 min",
    rating: "7.5",
    genre: "Action, Adventure",
    awards: "Won 1 Oscar.",
    synopsis:
      "The Dark Knight of Gotham City begins his war on crime as he faces the rise of the Joker.",
    posterLabel: "Batman"
  },
  {
    id: "tt-batman-forever",
    title: "Batman Forever",
    type: "movie",
    year: "1995",
    runtime: "121 min",
    rating: "5.4",
    genre: "Action, Adventure",
    awards: "Nominated for 3 Oscars.",
    synopsis:
      "Batman takes on Two-Face and the Riddler while wrestling with his own identity and legacy.",
    posterLabel: "Batman Forever"
  },
  {
    id: "tt-batman-robin",
    title: "Batman & Robin",
    type: "movie",
    year: "1997",
    runtime: "125 min",
    rating: "3.8",
    genre: "Action, Sci-Fi",
    awards: "Nominated for 11 Razzie Awards.",
    synopsis:
      "Batman and Robin must stop Mr. Freeze and Poison Ivy from plunging Gotham into chaos.",
    posterLabel: "Batman & Robin"
  },
  {
    id: "tt-the-batman",
    title: "The Batman",
    type: "movie",
    year: "2022",
    runtime: "176 min",
    rating: "7.8",
    genre: "Action, Crime, Drama",
    awards: "Nominated for 3 Oscars.",
    synopsis:
      "Batman uncovers corruption in Gotham while pursuing the Riddler, a serial killer targeting the elite.",
    posterLabel: "The Batman"
  },
  {
    id: "tt-batman-mask",
    title: "Batman: Mask of the Phantasm",
    type: "movie",
    year: "1993",
    runtime: "76 min",
    rating: "7.8",
    genre: "Animation, Action, Crime",
    awards: "Critically acclaimed animated feature.",
    synopsis:
      "Batman investigates a mysterious vigilante while revisiting a painful chapter from Bruce Wayne's past.",
    posterLabel: "Mask of the Phantasm"
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
    resultsBatchSize: RESULTS_BATCH_SIZE,
    mockDelayMs: MOCK_DETAILS_DELAY_MS
  });

  const debouncedSearch = debounce((value) => {
    searchFlow.performSearch(value);
  }, SEARCH_DEBOUNCE_MS);

  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;

      if (entry?.isIntersecting) {
        searchFlow.loadMoreResults();
      }
    },
    {
      rootMargin: "80px 0px 120px 0px",
      threshold: 0.2
    }
  );

  observer.observe(resultsSection.sentinel);

  app.append(brand, searchPanel.element, resultsSection.element);

  searchPanel.input.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
  });
}