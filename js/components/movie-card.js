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

export function createMovieCard(movie) {
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

export function closeAllMovieCards(grid) {
  grid.querySelectorAll(".movie-card").forEach((item) => {
    item.classList.remove("is-active");

    const itemButton = item.querySelector(".movie-card__button");
    const itemDetails = item.querySelector(".movie-card__details");

    itemButton?.setAttribute("aria-expanded", "false");

    if (itemDetails) {
      itemDetails.hidden = true;
    }
  });
}

export function bindMovieCardToggle(card, grid) {
  const button = card.querySelector(".movie-card__button");
  const details = card.querySelector(".movie-card__details");

  if (!button || !details) {
    return;
  }

  button.addEventListener("click", () => {
    const isActive = card.classList.contains("is-active");

    closeAllMovieCards(grid);

    if (isActive) {
      return;
    }

    card.classList.add("is-active");
    button.setAttribute("aria-expanded", "true");
    details.hidden = false;
  });
}