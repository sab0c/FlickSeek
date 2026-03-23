export function createAppBrand() {
  const brand = document.createElement("header");
  brand.className = "app__brand";
  brand.innerHTML = `<span class="app__brand-name">FlickSeek</span>`;
  return brand;
}

export function createBackToTopButton() {
  const button = document.createElement("button");
  button.className = "back-to-top";
  button.type = "button";
  button.setAttribute("aria-label", "Back to top");
  button.innerHTML = "↑";
  return button;
}

export function createIntroSplash() {
  const introSplash = document.createElement("div");
  introSplash.className = "intro-splash";
  introSplash.innerHTML = `
    <div class="intro-splash__halo" aria-hidden="true"></div>
    <div class="intro-splash__content">
      <p class="intro-splash__eyebrow">Cinema Search Experience</p>
      <h1 class="intro-splash__title">FlickSeek</h1>
      <p class="intro-splash__tagline">Lights, search, discovery.</p>
    </div>
  `;
  return introSplash;
}