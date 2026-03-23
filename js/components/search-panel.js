const heroCopyText =
  "Search titles, discover details about your favorite movies, and explore your next watch like a cinematic showcase.";

export function createSearchPanel() {
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