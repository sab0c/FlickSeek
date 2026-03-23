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
  `;

  const summary = element.querySelector(".results-section__summary");
  const grid = element.querySelector(".results-grid");

  function setVisible(isVisible) {
    element.hidden = !isVisible;
  }

  function setSummary(message = "") {
    summary.textContent = message;
  }

  function setGridEmptyMode(isEmpty) {
    grid.className = isEmpty ? "results-grid results-grid--empty" : "results-grid";
  }

  function clearGrid() {
    grid.innerHTML = "";
  }

  function hide() {
    setVisible(false);
    setSummary("");
    setGridEmptyMode(false);
    clearGrid();
  }

  function showLoading(query) {
    setVisible(true);
    setSummary(`Searching for "${query}"...`);
    setGridEmptyMode(true);
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
    grid.innerHTML = `
      <div class="results-section__loading-shell movie-card__empty movie-card__empty--error">
        <div class="results-section__loading-copy">
          <strong>Unable to load titles</strong>
          <span>Try another mock search.</span>
        </div>
      </div>
    `;
  }

  function showCards(cards, query) {
    setVisible(true);
    setSummary(`Showing ${cards.length} result(s) for "${query}".`);
    setGridEmptyMode(false);
    clearGrid();

    cards.forEach((card) => {
      grid.append(card);
    });
  }

  return {
    element,
    summary,
    grid,
    hide,
    showLoading,
    showEmpty,
    showError,
    showCards
  };
}