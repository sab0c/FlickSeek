import { createAppBrand, createBackToTopButton, createIntroSplash } from "./components/app-chrome.js";
import { createMovieCardController } from "./components/movie-card.js";
import { createResultsSection } from "./components/results-section.js";
import { createSearchPanel } from "./components/search-panel.js";
import { MIN_QUERY_LENGTH, RESULTS_BATCH_SIZE, SEARCH_DEBOUNCE_MS } from "./config/search.js";
import { createSearchFlowController } from "./controllers/search-flow.js";
import { debounce } from "./utils/debounce.js";

const HERO_COPY_TYPE_DELAY_MS = 18;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const app = document.querySelector("#app");
const brand = createAppBrand();
const backToTopButton = createBackToTopButton();
const stack = document.createElement("div");
stack.className = "app__stack";
const introSplash = createIntroSplash();

const searchPanel = createSearchPanel();
const resultsSection = createResultsSection();
const movieCardController = createMovieCardController(resultsSection.grid);
const searchFlow = createSearchFlowController({
  searchPanel,
  resultsSection,
  movieCardController,
  minQueryLength: MIN_QUERY_LENGTH,
  resultsBatchSize: RESULTS_BATCH_SIZE
});
resultsSection.element.hidden = true;

stack.append(searchPanel.element, resultsSection.element);
app.append(brand, stack);
document.body.append(introSplash, backToTopButton);
movieCardController.bindOutsideClick();
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

const observer = new IntersectionObserver(
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

observer.observe(resultsSection.sentinel);

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

searchPanel.input.value = "matrix";
searchFlow.performSearch("matrix");
