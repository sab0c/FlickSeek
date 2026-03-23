import { createSearchPanel } from "./components/search-panel.js";

const app = document.querySelector("#app");

const brand = document.createElement("header");
brand.className = "app__brand";
brand.innerHTML = `<span class="app__brand-name">FlickSeek</span>`;

const searchPanel = createSearchPanel();

app.append(brand, searchPanel.element);