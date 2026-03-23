const heroCopyText =
  "Search titles, discover details about your favorite movies, and explore your next watch like a cinematic showcase.";

const searchHintText = "Search starts after typing at least 1 character.";
const searchStatusText = "Type the name of a movie or series to begin.";

function createSrOnlyElement(id, text, attributes = {}) {
  const element = document.createElement("span");
  element.id = id;
  element.className = "sr-only";
  element.textContent = text;

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return element;
}

export function createSearchPanel() {
  const element = document.createElement("section");
  element.className = "search-shell app__panel";
  element.setAttribute("aria-label", "Title search");
  element.innerHTML = `
    <div class="hero">
      <h1>Find movies and series</h1>
      <p class="hero__copy" data-full-text="${heroCopyText}"></p>
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
          aria-describedby="searchHint searchStatus"
        />
      </div>
    </div>
  `;

  const searchPanelElement = element.querySelector(".search-panel");
  searchPanelElement?.append(
    createSrOnlyElement("searchHint", searchHintText),
    createSrOnlyElement("searchStatus", searchStatusText, {
      role: "status",
      "aria-live": "polite"
    })
  );

  return {
    element,
    heroCopy: element.querySelector(".hero__copy"),
    input: element.querySelector("#searchInput"),
    status: element.querySelector("#searchStatus")
  };
}
