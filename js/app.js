const heroCopyText =
  "Search titles, discover details about your favorite movies, and explore your next watch like a cinematic showcase.";

const staticMovies = [
  {
    title: "Batman Begins",
    type: "movie",
    year: "2005"
  },
  {
    title: "The Dark Knight",
    type: "movie",
    year: "2008"
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

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  card.innerHTML = `
    <div class="movie-card__poster">
      <span>${movie.title}</span>
    </div>

    <div class="movie-card__body">
      <h3 class="movie-card__title">${movie.title}</h3>
      <p class="movie-card__meta">${movie.type} • ${movie.year}</p>
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

function renderStaticResults(resultsSection, query) {
  resultsSection.grid.innerHTML = "";
  resultsSection.summary.textContent = `Showing 2 result(s) for "${query}".`;

  staticMovies.forEach((movie) => {
    resultsSection.grid.append(createMovieCard(movie));
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