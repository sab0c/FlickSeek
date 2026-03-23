export function createResultsSection() {
  const element = document.createElement("section");
  element.className = "results-section app__panel";
  element.hidden = true;

  element.innerHTML = `
    <header class="results-section__head">
      <span class="results-section__eyebrow">Curated catalog</span>
      <p class="results-section__summary"></p>
    </header>

    <div class="results-grid"></div>

    <div class="results-section__loading" hidden>
      <div class="results-section__loading-shell">
        <div class="results-section__spinner" aria-hidden="true"></div>
        <div class="results-section__loading-copy">
          <strong>Loading more titles</strong>
          <span>Expanding your mock catalog.</span>
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

  function setGridEmptyMode(isEmpty) {
    grid.className = isEmpty ? "results-grid results-grid--empty" : "results-grid";
  }

  function setLoadingMore(isVisible) {
    loading.hidden = !isVisible;
  }

  function clearGrid() {
    grid.innerHTML = "";
  }

  function hide() {
    setVisible(false);
    setSummary("");
    setGridEmptyMode(false);
    setLoadingMore(false);
    clearGrid();
  }

  function showLoading(query) {
    setVisible(true);
    setSummary(`Searching for "${query}"...`);
    setGridEmptyMode(true);
    setLoadingMore(false);
    grid.innerHTML = `
      <div class="results-section__loading-shell">
        <div class="results-section__spinner" aria-hidden="true"></div>
        <div class="results-section__loading-copy">
          <strong>Loading titles</strong>
          <span>Preparing your mock catalog.</span>
        </div>
      </div>
    `;
  }

  function showEmpty(query) {
    setVisible(true);
    setSummary(`Showing 0 result(s) for "${query}".`);
    setGridEmptyMode(true);
    setLoadingMore(false);
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
    setGridEmptyMode(true);
    setLoadingMore(false);
    grid.innerHTML = `
      <div class="results-section__loading-shell movie-card__empty movie-card__empty--error">
        <div class="results-section__loading-copy">
          <strong>Unable to load titles</strong>
          <span>Try another mock search.</span>
        </div>
      </div>
    `;
  }

  function resetCards() {
    setGridEmptyMode(false);
    clearGrid();
  }

  function appendCards(cards) {
    cards.forEach((card) => {
      grid.append(card);
    });
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
    showLoading,
    showEmpty,
    showError,
    resetCards,
    appendCards
  };
}