import { RESULTS_BATCH_SIZE } from "../config/search.js";

const API_KEY = "98d46a3";
const API_URL = "https://www.omdbapi.com/";
const searchCache = new Map();
const detailCache = new Map();
const detailRequests = new Map();

function mapOmdbErrorMessage(error = "") {
  if (error === "Movie not found!") {
    return "No results found.";
  }

  if (error === "Too many results.") {
    return "Too many results for this search.";
  }

  return error || "No results found.";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("Communication with OMDb failed.");
  }

  return response.json();
}

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesQuery(title, query) {
  return normalizeText(title).includes(normalizeText(query));
}

function getCacheKey(query, page) {
  return `${query}::${page}`;
}

async function fetchSearchPage(query, page, signal) {
  const cacheKey = getCacheKey(query, page);

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    apikey: API_KEY,
    s: query,
    page: String(page)
  });

  const data = await fetchJson(`${API_URL}?${params.toString()}`, { signal });
  let payload;

  if (data.Response === "False") {
    const error = mapOmdbErrorMessage(data.Error);
    payload = {
      status: "not_found",
      results: [],
      totalResults: 0,
      error
    };
  } else {
    payload = {
      status: "success",
      results: Array.isArray(data.Search) ? data.Search : [],
      totalResults: Number(data.totalResults || 0),
      error: ""
    };
  }

  searchCache.set(cacheKey, payload);
  return payload;
}

function getTotalPages(totalResults) {
  return Math.max(1, Math.ceil(totalResults / RESULTS_BATCH_SIZE));
}

export async function createSearchSession(query, signal) {
  const exactPage = await fetchSearchPage(query, 1, signal);
  const seenIds = new Set();
  let sources = [];
  let strategy = "exact";
  let totalResults = 0;
  let exhausted = false;
  let error = "";

  if (exactPage.status === "success") {
    sources = [
      {
        prefix: query,
        page: 1
      }
    ];
    totalResults = exactPage.totalResults;
  } else {
    error = exactPage.error;
    exhausted = true;
  }

  async function loadMore(chunkSize = RESULTS_BATCH_SIZE) {
    const items = [];

    while (items.length < chunkSize && sources.length) {
      const source = sources.shift();
      const pageData = await fetchSearchPage(source.prefix, source.page, signal);

      if (pageData.status !== "success") {
        continue;
      }

      const matchingItems = pageData.results.filter((item) => includesQuery(item.Title, query));

      for (const item of matchingItems) {
        if (seenIds.has(item.imdbID)) {
          continue;
        }

        seenIds.add(item.imdbID);
        items.push(item);

        if (items.length === chunkSize) {
          break;
        }
      }

      const totalPages = getTotalPages(pageData.totalResults);

      if (source.page < totalPages) {
        sources.unshift({
          ...source,
          page: source.page + 1
        });
      }
    }

    if (!sources.length) {
      exhausted = true;
    }

    return {
      items,
      exhausted,
      strategy,
      totalResults,
      error
    };
  }

  return {
    loadMore,
    getMeta() {
      return {
        strategy,
        totalResults,
        error
      };
    }
  };
}

export async function fetchTitleDetails(imdbId) {
  if (detailCache.has(imdbId)) {
    return detailCache.get(imdbId);
  }

  if (detailRequests.has(imdbId)) {
    return detailRequests.get(imdbId);
  }

  const params = new URLSearchParams({
    apikey: API_KEY,
    i: imdbId,
    plot: "short"
  });

  const request = fetchJson(`${API_URL}?${params.toString()}`)
    .then((data) => {
      if (data.Response === "False") {
        throw new Error(mapOmdbErrorMessage(data.Error));
      }

      detailCache.set(imdbId, data);
      return data;
    })
    .finally(() => {
      detailRequests.delete(imdbId);
    });

  detailRequests.set(imdbId, request);
  return request;
}
