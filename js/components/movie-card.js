import { fetchTitleDetails } from "../services/omdb-api.js";
import { escapeHtml } from "../utils/html.js";

const OPEN_DELAY_MS = 90;
const CLOSE_DELAY_MS = 140;
const posterRequestCache = new Map();

function getPosterFallbackMarkup(title) {
  return `
    <div class="movie-card__poster movie-card__poster--placeholder" aria-label="Poster unavailable">
      <span>${escapeHtml(title)}</span>
    </div>
  `;
}

function createPosterFallbackElement(title) {
  const placeholder = document.createElement("div");
  placeholder.className = "movie-card__poster movie-card__poster--placeholder";
  placeholder.setAttribute("aria-label", "Poster unavailable");
  placeholder.innerHTML = `<span>${escapeHtml(title)}</span>`;
  return placeholder;
}

function createPosterImageElement(poster, title) {
  const image = document.createElement("img");
  image.className = "movie-card__poster";
  image.src = poster;
  image.alt = `Poster for ${title}`;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.replaceWith(createPosterFallbackElement(title));
  });
  return image;
}

function formatInfo(value, fallback = "Not available") {
  if (!value || value === "N/A") {
    return fallback;
  }

  return value;
}

function hasInfo(value) {
  return Boolean(value && value !== "N/A");
}

function formatTypeLabel(value) {
  const type = formatInfo(value, "Unknown");
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function preloadPoster(poster) {
  if (posterRequestCache.has(poster)) {
    return posterRequestCache.get(poster);
  }

  const request = new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = poster;
  });

  posterRequestCache.set(poster, request);
  return request;
}

async function hydratePoster(card, poster, title) {
  if (!poster || poster === "N/A") {
    return;
  }

  const isAvailable = await preloadPoster(poster);

  if (!isAvailable || !document.body.contains(card)) {
    return;
  }

  const currentPoster = card.querySelector(".movie-card__poster");

  if (!currentPoster) {
    return;
  }

  currentPoster.replaceWith(createPosterImageElement(poster, title));
}

function renderInfoBlock(label, value, extraClass = "") {
  return `
    <div class="movie-card__emphasis${extraClass ? ` ${extraClass}` : ""}">
      <strong>${escapeHtml(label)}:</strong>
      <p class="movie-card__info-value">${escapeHtml(value)}</p>
    </div>
  `;
}

function getDetailErrorClass(message = "") {
  if (message === "No results found.") {
    return "movie-card__error movie-card__error--neutral";
  }

  return "movie-card__error";
}

function renderDetails(details) {
  return `
    <div class="movie-card__details-content">
      <div class="movie-card__meta-row">
        <span class="movie-card__stat-chip movie-card__stat-chip--runtime">${escapeHtml(formatInfo(details.Runtime, "- min"))}</span>
        <span class="movie-card__stat-chip movie-card__stat-chip--rating"><strong aria-label="IMDb rating">★</strong><span>${escapeHtml(formatInfo(details.imdbRating, "-"))}</span></span>
      </div>
      ${renderInfoBlock("Genre", formatInfo(details.Genre))}
      ${
        hasInfo(details.Awards)
          ? renderInfoBlock("Awards", details.Awards)
          : ""
      }
      ${renderInfoBlock("Synopsis", formatInfo(details.Plot, "No description available."), "movie-card__plot")}
    </div>
  `;
}

function renderDetailsSkeleton() {
  return `
    <div class="movie-card__details-content movie-card__details-content--loading">
      <div class="movie-card__meta-row movie-card__meta-row--skeleton">
        <span class="movie-card__stat-chip movie-card__stat-chip--skeleton movie-card__stat-chip--runtime-skeleton"></span>
        <span class="movie-card__stat-chip movie-card__stat-chip--skeleton movie-card__stat-chip--rating-skeleton"></span>
      </div>
      <div class="movie-card__emphasis movie-card__emphasis--skeleton">
        <span class="skeleton skeleton--label"></span>
        <span class="skeleton skeleton--text"></span>
      </div>
      <div class="movie-card__emphasis movie-card__emphasis--skeleton">
        <span class="skeleton skeleton--label"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text skeleton--text-short"></span>
      </div>
      <div class="movie-card__emphasis movie-card__emphasis movie-card__plot movie-card__emphasis--skeleton">
        <span class="skeleton skeleton--label"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text skeleton--text-medium"></span>
      </div>
    </div>
  `;
}

export function createMovieCard(item) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.dataset.imdbId = item.imdbID;
  card.innerHTML = `
    <button
      class="movie-card__button"
      type="button"
      aria-expanded="false"
      aria-label="Open details for ${escapeHtml(item.Title)}"
    >
      <div class="movie-card__media">
        ${getPosterFallbackMarkup(item.Title)}
        <span class="movie-card__poster-vignette" aria-hidden="true"></span>
        <span class="movie-card__poster-sheen" aria-hidden="true"></span>
      </div>
      <div class="movie-card__body">
        <h3 class="movie-card__title">${escapeHtml(item.Title)}</h3>
        <p class="movie-card__meta">${escapeHtml(formatInfo(item.Type, "unknown"))}${hasInfo(item.Year) ? ` • ${escapeHtml(item.Year)}` : ""}</p>
      </div>
    </button>
    <div class="movie-card__details" hidden></div>
  `;
  hydratePoster(card, item.Poster, item.Title);

  return card;
}

export function createMovieCardController(grid) {
  const isTouchInterface = window.matchMedia("(hover: none), (pointer: coarse)");
  let activeTouchCard = null;
  let openTimeoutId = 0;
  let closeTimeoutId = 0;

  function clearHoverTimers() {
    window.clearTimeout(openTimeoutId);
    window.clearTimeout(closeTimeoutId);
  }

  function closeDetails(card) {
    if (!card) {
      return;
    }

    const button = card.querySelector(".movie-card__button");
    const panel = card.querySelector(".movie-card__details");

    card.classList.remove("is-active");
    button?.setAttribute("aria-expanded", "false");

    if (panel) {
      panel.hidden = true;
      panel.style.display = "none";
      panel.innerHTML = "";
    }

    card.classList.remove("is-details-loaded");
    delete card.dataset.detailsLoaded;
    delete card.dataset.detailsLoading;
    delete card.dataset.detailsRequestId;

    if (isTouchInterface.matches && document.activeElement && card.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    if (activeTouchCard === card) {
      activeTouchCard = null;
    }
  }

  function scheduleOpen(card) {
    clearHoverTimers();
    openTimeoutId = window.setTimeout(() => {
      openDetails(card);
    }, OPEN_DELAY_MS);
  }

  function scheduleClose(card) {
    clearHoverTimers();
    closeTimeoutId = window.setTimeout(() => {
      closeDetails(card);
    }, CLOSE_DELAY_MS);
  }

  function closeAllDetails(exceptCard = null) {
    grid.querySelectorAll(".movie-card").forEach((card) => {
      if (card !== exceptCard) {
        closeDetails(card);
      }
    });
  }

  function preserveCardViewportPosition(card, previousTop) {
    window.requestAnimationFrame(() => {
      if (!document.body.contains(card)) {
        return;
      }

      const nextTop = card.getBoundingClientRect().top;
      const delta = nextTop - previousTop;

      if (Math.abs(delta) > 1) {
        window.scrollBy({
          top: delta,
          behavior: "auto"
        });
      }
    });
  }

  async function openDetails(card) {
    const imdbId = card.dataset.imdbId;
    const button = card.querySelector(".movie-card__button");
    const panel = card.querySelector(".movie-card__details");
    const previousTop = isTouchInterface.matches ? 0 : card.getBoundingClientRect().top;

    if (!imdbId || !panel) {
      return;
    }

    closeAllDetails(card);
    if (isTouchInterface.matches) {
      activeTouchCard = card;
    }
    const requestId = `${Date.now()}-${Math.random()}`;
    card.dataset.detailsRequestId = requestId;
    card.classList.add("is-active");
    button?.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    panel.style.removeProperty("display");

    if (!isTouchInterface.matches) {
      preserveCardViewportPosition(card, previousTop);
    }

    if (card.dataset.detailsLoaded === "true") {
      return;
    }

    if (card.dataset.detailsLoading === "true") {
      return;
    }

    card.dataset.detailsLoading = "true";
    card.classList.remove("is-details-loaded");
    panel.innerHTML = renderDetailsSkeleton();

    try {
      const details = await fetchTitleDetails(imdbId);

      if (
        !document.body.contains(card) ||
        card.dataset.detailsRequestId !== requestId ||
        !card.classList.contains("is-active") ||
        panel.hidden
      ) {
        return;
      }

      panel.innerHTML = renderDetails(details);
      card.dataset.detailsLoaded = "true";
      card.classList.add("is-details-loaded");
    } catch (error) {
      if (card.dataset.detailsRequestId !== requestId) {
        return;
      }

      panel.innerHTML = `
        <div class="movie-card__details-content">
          <p class="${getDetailErrorClass(error.message)}">${escapeHtml(error.message)}</p>
        </div>
      `;
      card.classList.add("is-details-loaded");
    } finally {
      delete card.dataset.detailsLoading;
    }
  }

  function bindCard(card) {
    card.addEventListener("mouseenter", () => {
      if (!isTouchInterface.matches) {
        scheduleOpen(card);
      }
    });

    card.addEventListener("mouseleave", () => {
      if (!isTouchInterface.matches) {
        scheduleClose(card);
      }
    });

    card.addEventListener("focusin", () => {
      if (isTouchInterface.matches) {
        return;
      }

      clearHoverTimers();
      openDetails(card);
    });

    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget) && !isTouchInterface.matches) {
        scheduleClose(card);
      }
    });

    card.querySelector(".movie-card__button")?.addEventListener("click", (event) => {
      if (!isTouchInterface.matches) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const previousTop = card.getBoundingClientRect().top;
      const wasActive = card.classList.contains("is-active");
      closeAllDetails();

      if (wasActive) {
        preserveCardViewportPosition(card, previousTop);
        return;
      }

      openDetails(card);

      if (isTouchInterface.matches) {
        preserveCardViewportPosition(card, previousTop);
      }
    });
  }

  function bindOutsideClick() {
    document.addEventListener("click", (event) => {
      if (!isTouchInterface.matches) {
        return;
      }

      if (!grid.contains(event.target)) {
        closeAllDetails();
      }
    });
  }

  return {
    bindCard,
    bindOutsideClick,
    closeAllDetails
  };
}
