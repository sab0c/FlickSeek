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

  return {
    element,
    summary: element.querySelector(".results-section__summary"),
    grid: element.querySelector(".results-grid")
  };
}