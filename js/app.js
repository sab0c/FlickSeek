import { createAppBrand, createBackToTopButton, createIntroSplash } from "./components/app-chrome.js";
import { createResultsSection } from "./components/results-section.js";
import { createSearchPanel } from "./components/search-panel.js";
import {
  MIN_QUERY_LENGTH,
  MOCK_SEARCH_DELAY_MS,
  RESULTS_BATCH_SIZE,
  SEARCH_DEBOUNCE_MS
} from "./config/search.js";
import { createSearchFlowController } from "./controllers/search-flow.js";
import { debounce } from "./utils/debounce.js";

const HERO_COPY_TYPE_DELAY_MS = 18;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const staticMovies = [
  {
    imdbID: "tt0372784",
    Title: "Batman Begins",
    Type: "movie",
    Year: "2005",
    Poster: "N/A",
    Runtime: "140 min",
    imdbRating: "8.2",
    Genre: "Action, Crime, Drama",
    Awards: "Nominated for an Oscar.",
    Plot: "After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from corruption."
  },
  {
    imdbID: "tt0468569",
    Title: "The Dark Knight",
    Type: "movie",
    Year: "2008",
    Poster: "N/A",
    Runtime: "152 min",
    imdbRating: "9.0",
    Genre: "Action, Crime, Drama",
    Awards: "Won 2 Oscars.",
    Plot: "Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos and tests the limits of justice."
  },
  {
    imdbID: "tt0103776",
    Title: "Batman Returns",
    Type: "movie",
    Year: "1992",
    Poster: "N/A",
    Runtime: "126 min",
    imdbRating: "7.1",
    Genre: "Action, Crime, Fantasy",
    Awards: "Nominated for 2 Oscars.",
    Plot: "Batman faces the Penguin and Catwoman while Gotham City falls into a new wave of darkness and manipulation."
  },
  {
    imdbID: "tt0096895",
    Title: "Batman",
    Type: "movie",
    Year: "1989",
    Poster: "N/A",
    Runtime: "126 min",
    imdbRating: "7.5",
    Genre: "Action, Adventure",
    Awards: "Won 1 Oscar.",
    Plot: "The Dark Knight of Gotham City begins his war on crime as he faces the rise of the Joker."
  },
  {
    imdbID: "tt0112462",
    Title: "Batman Forever",
    Type: "movie",
    Year: "1995",
    Poster: "N/A",
    Runtime: "121 min",
    imdbRating: "5.4",
    Genre: "Action, Adventure",
    Awards: "Nominated for 3 Oscars.",
    Plot: "Batman takes on Two-Face and the Riddler while wrestling with his own identity and legacy."
  },
  {
    imdbID: "tt0118688",
    Title: "Batman & Robin",
    Type: "movie",
    Year: "1997",
    Poster: "N/A",
    Runtime: "125 min",
    imdbRating: "3.8",
    Genre: "Action, Sci-Fi",
    Awards: "Nominated for 11 Razzie Awards.",
    Plot: "Batman and Robin must stop Mr. Freeze and Poison Ivy from plunging Gotham into chaos."
  },
  {
    imdbID: "tt1877830",
    Title: "The Batman",
    Type: "movie",
    Year: "2022",
    Poster: "N/A",
    Runtime: "176 min",
    imdbRating: "7.8",
    Genre: "Action, Crime, Drama",
    Awards: "Nominated for 3 Oscars.",
    Plot: "Batman uncovers corruption in Gotham while pursuing the Riddler, a serial killer targeting the elite."
  },
  {
    imdbID: "tt0106364",
    Title: "Batman: Mask of the Phantasm",
    Type: "movie",
    Year: "1993",
    Poster: "N/A",
    Runtime: "76 min",
    imdbRating: "7.8",
    Genre: "Animation, Action, Crime",
    Awards: "Critically acclaimed animated feature.",
    Plot: "Batman investigates a mysterious vigilante while revisiting a painful chapter from Bruce Wayne's past."
  }
];

const app = document.querySelector("#app");
const brand = createAppBrand();
const backToTopButton = createBackToTopButton();
const stack = document.createElement("div");
stack.className = "app__stack";
const introSplash = createIntroSplash();

const searchPanel = createSearchPanel();
const resultsSection = createResultsSection();
const searchFlow = createSearchFlowController({
  searchPanel,
  resultsSection,
  movies: staticMovies,
  minQueryLength: MIN_QUERY_LENGTH,
  resultsBatchSize: RESULTS_BATCH_SIZE,
  mockDelayMs: MOCK_SEARCH_DELAY_MS
});

resultsSection.element.hidden = true;

stack.append(searchPanel.element, resultsSection.element);
app.append(brand, stack);
document.body.append(introSplash, backToTopButton);
document.body.classList.add("is-intro-locked");

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth"
  });
});

function startHeroCopyTyping() {
  const heroCopy = searchPanel.heroCopy;

  if (!heroCopy) {
    return;
  }

  const fullText = heroCopy.dataset.fullText || "";

  if (prefersReducedMotion) {
    heroCopy.textContent = fullText;
    return;
  }

  heroCopy.textContent = "|";

  let currentIndex = 0;

  function typeNextCharacter() {
    currentIndex += 1;
    heroCopy.textContent = `${fullText.slice(0, currentIndex)}|`;

    if (currentIndex < fullText.length) {
      window.setTimeout(typeNextCharacter, HERO_COPY_TYPE_DELAY_MS);
      return;
    }

    heroCopy.textContent = fullText;
  }

  window.setTimeout(typeNextCharacter, 140);
}

window.requestAnimationFrame(() => {
  window.requestAnimationFrame(() => {
    introSplash.classList.add("intro-splash--active");
    app.classList.add("app--intro-ready");
  });
});

window.setTimeout(() => {
  introSplash.classList.add("intro-splash--done");
  document.body.classList.remove("is-intro-locked");
  startHeroCopyTyping();
}, prefersReducedMotion ? 100 : 1800);

introSplash.addEventListener("animationend", (event) => {
  if (event.animationName === "intro-splash-out") {
    introSplash.remove();
  }
});

let loadMoreTimeoutId = 0;

const resultsObserver = new IntersectionObserver(
  (entries) => {
    const [entry] = entries;

    if (entry?.isIntersecting) {
      window.clearTimeout(loadMoreTimeoutId);
      loadMoreTimeoutId = window.setTimeout(() => {
        searchFlow.loadMoreResults();
      }, 180);
    }
  },
  {
    rootMargin: "80px 0px 120px 0px",
    threshold: 0.2
  }
);

resultsObserver.observe(resultsSection.sentinel);

const backToTopObserver = new IntersectionObserver(
  (entries) => {
    const [entry] = entries;
    backToTopButton.classList.toggle("back-to-top--visible", !entry?.isIntersecting);
  },
  {
    threshold: 0.15
  }
);

backToTopObserver.observe(searchPanel.element);

const debouncedSearch = debounce((value) => {
  searchFlow.performSearch(value);
}, SEARCH_DEBOUNCE_MS);

searchPanel.input.addEventListener("input", (event) => {
  debouncedSearch(event.target.value);
});