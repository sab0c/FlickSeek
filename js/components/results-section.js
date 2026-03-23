export function createResultsSection() {
  const element = document.createElement("section");
  element.className = "results-section app__panel";
  element.setAttribute("aria-label", "Results");
  element.innerHTML = `
    <header class="results-section__head">
      <span class="results-section__eyebrow">Curated catalog</span>
      <span id="resultsSummary" class="results-section__summary" role="status" aria-live="polite"></span>
    </header>
    <div class="results-grid"></div>
    <div class="results-section__loading" hidden>
      <div class="results-section__loading-shell">
        <div class="results-section__spinner" aria-hidden="true"></div>
        <div class="results-section__loading-copy">
          <strong>Loading more titles</strong>
          <span>Expanding your catalog with more matches.</span>
        </div>
      </div>
    </div>
    <div class="results-section__sentinel" aria-hidden="true"></div>
  `;

  const summary = element.querySelector(".results-section__summary");
  const grid = element.querySelector(".results-grid");
  const loading = element.querySelector(".results-section__loading");
  const sentinel = element.querySelector(".results-section__sentinel");

  function setVisible(isVisible) {
    element.hidden = !isVisible;
  }

  function setSummary(message = "") {
    summary.textContent = message;
  }

  function setLoadingMore(isVisible) {
    loading.hidden = !isVisible;
  }

  function setGridEmptyMode(isEmpty) {
    grid.classList.toggle("results-grid--empty", isEmpty);
  }

  function clearGrid() {
    grid.innerHTML = "";
  }

  function hide() {
    setVisible(false);
    setSummary("");
    setLoadingMore(false);
    setGridEmptyMode(false);
    clearGrid();
  }

  function showInitialLoading(query) {
    setVisible(true);
    setSummary(`Searching for "${query}"...`);
    setLoadingMore(false);
    setGridEmptyMode(true);
    grid.innerHTML = `
      <div class="results-section__loading-shell">
        <div class="results-section__spinner" aria-hidden="true"></div>
        <div class="results-section__loading-copy">
          <strong>Loading titles</strong>
          <span>Preparing your catalog.</span>
        </div>
      </div>
    `;
  }

  function showEmpty(query) {
    setVisible(true);
    setSummary(`Showing 0 result(s) for "${query}".`);
    setLoadingMore(false);
    setGridEmptyMode(true);
    grid.innerHTML = `
      <div class="results-section__loading-shell movie-card__empty movie-card__empty--neutral">
        <div class="results-section__loading-copy">
          <strong>No titles found</strong>
        </div>
      </div>
    `;
  }

  function showError() {
    setVisible(true);
    setSummary("");
    setLoadingMore(false);
    setGridEmptyMode(true);
    grid.innerHTML = `
      <div class="results-section__loading-shell movie-card__empty movie-card__empty--error">
        <div class="results-section__loading-copy">
          <strong>Unable to load titles</strong>
          <span>Try another search in a moment.</span>
        </div>
      </div>
    `;
  }

  function showCards(cards, summaryText) {
    setVisible(true);
    setSummary(summaryText);
    setGridEmptyMode(false);
    setLoadingMore(false);
    clearGrid();
    cards.forEach((card) => grid.append(card));
  }

  function appendCards(cards, summaryText) {
    setVisible(true);
    setSummary(summaryText);
    setGridEmptyMode(false);
    cards.forEach((card) => grid.append(card));
  }

  return {
    element,
    summary,
    grid,
    loading,
    sentinel,
    hide,
    setSummary,
    setLoadingMore,
    showInitialLoading,
    showEmpty,
    showError,
    showCards,
    appendCards
  };
}