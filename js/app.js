const heroCopyText =
  "Search titles, discover details about your favorite movies, and explore your next watch like a cinematic showcase.";

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
    synopsis: "After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from corruption.",
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
    synopsis: "Batman faces the Joker, a criminal mastermind who pushes Gotham into chaos and tests the limits of justice.",
    posterLabel: "The Dark Knight"
  }
];

function createAppBrand() {
  const brand = document.createElement("header");
  brand.className = "app__brand";
  brand.innerHTML = `<span class="app__brand-name">FlickSeek</span>`;
  return brand;
}

function createSearchPanel() {
  const element = document.createElement("section");
  element.className = "search-shell app__panel";
  element.setAttribute("aria-label", "Busca");

  element.innerHTML = `
    <div class="hero">
      <h1>Find movies and series</h1>
      <p class="hero__copy">${heroCopyText}</p>
    </div>

    <div class="search-panel">
      <label class="search-panel__label" for="searchInput">Search title</label>
      <div class="search-panel__field">
        <input
          id="searchInput"
          name="search"
          type="search"
          autocomplete="off"
          placeholder="Ex.: Batman, Spider-Man, The Office..."
        />
      </div>
    </div>
  `;

  return {
    element,
    input: element.querySelector("#searchInput")
  };
}

function renderInfoBlock(label, value, extraClass = "") {
  return `
    <div class="movie-card__emphasis${extraClass ? ` ${extraClass}` : ""}">
      <strong>${label}:</strong>
      <p class="movie-card__info-value">${value}</p>
    </div>
  `;
}

function renderCardDetails(movie) {
  return `
    <div class="movie-card__details-content">
      <div class="movie-card__meta-row">
        <span class="movie-card__stat-chip movie-card__stat-chip--runtime">${movie.runtime}</span>
        <span class="movie-card__stat-chip movie-card__stat-chip--rating">
          <strong aria-label="IMDb rating">★</strong>
          <span>${movie.rating}</span>
        </span>
      </div>
      ${renderInfoBlock("Genre", movie.genre)}
      ${renderInfoBlock("Awards", movie.awards)}
      ${renderInfoBlock("Synopsis", movie.synopsis, "movie-card__plot")}
    </div>
  `;
}

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.dataset.movieId = movie.id;

  card.innerHTML = `
    <button
      class="movie-card__button"
      type="button"
      aria-expanded="false"
      aria-controls="details-${movie.id}"
    >
      <div class="movie-card__media">
        <div class="movie-card__poster movie-card__poster--placeholder" aria-label="Poster unavailable">
          <span>${movie.posterLabel}</span>
        </div>
      </div>

      <div class="movie-card__body">
        <h3 class="movie-card__title">${movie.title}</h3>
        <p class="movie-card__meta">${movie.type} • ${movie.year}</p>
      </div>
    </button>

    <div id="details-${movie.id}" class="movie-card__details" hidden>
      ${renderCardDetails(movie)}
    </div>
  `;

  return card;
}

function createResultsSection() {
  const element = document.createElement("section");
  element.className = "results-section app__panel";
  element.hidden = true;

  element.innerHTML = `
    <header class="results-section__head">
      <span class="results-section__eyebrow">Curated catalog</span>
      <p class="results-section__summary"></p>
    </header>

    <div class="results-grid"></div>
  `;

  return {
    element,
    summary: element.querySelector(".results-section__summary"),
    grid: element.querySelector(".results-grid")
  };
}

function bindCardToggle(card, grid) {
  const button = card.querySelector(".movie-card__button");
  const details = card.querySelector(".movie-card__details");

  if (!button || !details) {
    return;
  }

  button.addEventListener("click", () => {
    const isActive = card.classList.contains("is-active");

    grid.querySelectorAll(".movie-card").forEach((item) => {
      item.classList.remove("is-active");

      const itemButton = item.querySelector(".movie-card__button");
      const itemDetails = item.querySelector(".movie-card__details");

      itemButton?.setAttribute("aria-expanded", "false");

      if (itemDetails) {
        itemDetails.hidden = true;
      }
    });

    if (isActive) {
      return;
    }

    card.classList.add("is-active");
    button.setAttribute("aria-expanded", "true");
    details.hidden = false;
  });
}

function renderStaticResults(resultsSection, query) {
  resultsSection.grid.innerHTML = "";
  resultsSection.summary.textContent = `Showing 2 result(s) for "${query}".`;

  staticMovies.forEach((movie) => {
    const card = createMovieCard(movie);
    bindCardToggle(card, resultsSection.grid);
    resultsSection.grid.append(card);
  });
}

const app = document.querySelector("#app");

if (app) {
  const brand = createAppBrand();
  const searchPanel = createSearchPanel();
  const resultsSection = createResultsSection();

  app.append(brand, searchPanel.element, resultsSection.element);

  searchPanel.input.addEventListener("input", (event) => {
    const query = event.target.value.trim();

    if (!query) {
      resultsSection.element.hidden = true;
      resultsSection.grid.innerHTML = "";
      resultsSection.summary.textContent = "";
      return;
    }

    resultsSection.element.hidden = false;
    renderStaticResults(resultsSection, query);
  });
}