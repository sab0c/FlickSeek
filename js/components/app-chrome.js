export function createAppBrand() {
  const brand = document.createElement("header");
  brand.className = "app__brand";
  brand.innerHTML = `<span class="app__brand-name">FlickSeek</span>`;
  return brand;
}