import { createMovieCard } from "../components/movie-card.js";
import { createSearchSession } from "../services/omdb-api.js";
import { escapeHtml } from "../utils/html.js";

export function createSearchFlowController({
  searchPanel,
  resultsSection,
  movieCardController,
  minQueryLength,
  resultsBatchSize
}) {
  let latestSearchToken = 0;
  let activeSearchController = null;
  let currentSession = null;
  let visibleResults = 0;
  let loadingMore = false;

  function setEmptySectionState(isEmpty) {
    resultsSection.element.classList.toggle("results-section--empty-state", isEmpty);
  }

  function setStatus(message, tone = "default") {
    searchPanel.status.textContent = message;

    if (tone === "default") {
      searchPanel.status.removeAttribute("data-tone");
      return;
    }

    searchPanel.status.dataset.tone = tone;
  }

  function setSummary(message = "") {
    resultsSection.summary.textContent = message;
  }

  function setResultsVisibility(isVisible) {
    resultsSection.element.hidden = !isVisible;
  }

  function setLoadingMore(isVisible) {
    resultsSection.loading.hidden = !isVisible;
  }

  function renderEmptyState({
    title = "No titles available",
    tone = "neutral"
  }) {
    setEmptySectionState(true);
    resultsSection.grid.classList.add("results-grid--empty");
    resultsSection.grid.innerHTML = `
      <div class="results-section__loading-shell movie-card__empty movie-card__empty--${escapeHtml(tone)}">
        <div class="results-section__loading-copy">
          <strong>${escapeHtml(title)}</strong>
        </div>
      </div>
    `;
  }

  function appendResults(items) {
    setEmptySectionState(false);
    resultsSection.grid.classList.remove("results-grid--empty");
    items.forEach((item) => {
      const card = createMovieCard(item);
      card.classList.add("movie-card--entering");
      movieCardController.bindCard(card);
      resultsSection.grid.append(card);

      window.requestAnimationFrame(() => {
        card.classList.remove("movie-card--entering");
      });
    });
  }

  function updateSummary(query, meta) {
    if (!visibleResults) {
      if (query) {
        setSummary(`Showing 0 result(s) for "${query}".`);
      } else {
        setSummary("");
      }
      return;
    }

    if (meta.strategy === "exact" && meta.totalResults) {
      setSummary(`Showing ${visibleResults} of ${meta.totalResults} result(s) for "${query}".`);
      return;
    }

    setSummary(`Showing ${visibleResults} result(s) found for "${query}".`);
  }

  async function loadMoreResults() {
    if (!currentSession || loadingMore) {
      return;
    }

    const session = currentSession;
    loadingMore = true;
    setLoadingMore(true);

    try {
      const payload = await session.loadMore(resultsBatchSize);

      if (session !== currentSession) {
        return;
      }

      const meta = session.getMeta();

      if (!payload.items.length && !visibleResults) {
        renderEmptyState({
          title: "No titles found",
          tone: "neutral"
        });
        setStatus(meta.error || "No results found.");
        updateSummary(searchPanel.input.value.trim(), meta);
        setLoadingMore(false);
        if (session === currentSession) {
          currentSession = null;
        }
        return;
      }

      if (payload.items.length) {
        appendResults(payload.items);
        visibleResults += payload.items.length;
      }

      updateSummary(searchPanel.input.value.trim(), meta);

      if (meta.strategy === "exact" && meta.totalResults) {
        setStatus(`Results updated for "${searchPanel.input.value.trim()}".`);
      } else {
        setStatus(`Showing matches found for "${searchPanel.input.value.trim()}".`);
      }

      if (payload.exhausted) {
        setLoadingMore(false);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      if (!visibleResults) {
        renderEmptyState({
          title: "Unable to load titles",
          tone: "error"
        });
      }

      setStatus(error.message || "An unexpected error occurred.", "error");
    } finally {
      loadingMore = false;

      if (session === currentSession && currentSession) {
        setLoadingMore(false);
      }
    }
  }

  async function performSearch(rawQuery) {
    const query = rawQuery.trim();
    latestSearchToken += 1;
    const searchToken = latestSearchToken;

    if (activeSearchController) {
      activeSearchController.abort();
    }

    movieCardController.closeAllDetails();

    if (query.length < minQueryLength) {
      setResultsVisibility(false);
      setEmptySectionState(false);
      setStatus(`Type at least ${minQueryLength} character to search.`);
      setSummary("");
      resultsSection.grid.classList.remove("results-grid--empty");
      resultsSection.grid.innerHTML = "";
      setLoadingMore(false);
      currentSession = null;
      visibleResults = 0;
      return;
    }

    activeSearchController = new AbortController();
    setResultsVisibility(true);
    setStatus(`Searching for "${query}"...`);
    setSummary("");
    visibleResults = 0;
    currentSession = null;
    renderEmptyState({
      title: "Building your catalog",
      tone: "loading"
    });

    try {
      const session = await createSearchSession(query, activeSearchController.signal);

      if (searchToken !== latestSearchToken) {
        return;
      }

      resultsSection.grid.classList.remove("results-grid--empty");
      resultsSection.grid.innerHTML = "";
      currentSession = session;
      await loadMoreResults();
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      renderEmptyState({
        title: "Unable to load titles",
        tone: "error"
      });
      setSummary("");
      setStatus(error.message || "An unexpected error occurred.", "error");
    }
  }

  return {
    loadMoreResults,
    performSearch
  };
}