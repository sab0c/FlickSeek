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

  return {
    element,
    summary: element.querySelector(".results-section__summary"),
    grid: element.querySelector(".results-grid"),
    loading: element.querySelector(".results-section__loading"),
    sentinel: element.querySelector(".results-section__sentinel")
  };
}
