const API_KEY = "98d46a3";
const API_URL = "https://www.omdbapi.com/";
const OMDB_PAGE_SIZE = 10;

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

function getSearchCacheKey(query, page) {
  return `${query}::${page}`;
}

async function fetchSearchPage(query, page, signal) {
  const cacheKey = getSearchCacheKey(query, page);

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
    payload = {
      status: "not_found",
      results: [],
      totalResults: 0,
      error: mapOmdbErrorMessage(data.Error)
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

export async function createSearchSession(query, signal) {
  const firstPage = await fetchSearchPage(query, 1, signal);

  let bufferedResults = [];
  let nextPage = 1;
  let totalResults = 0;
  let totalPages = 0;
  let error = "";

  if (firstPage.status === "success") {
    bufferedResults = [...firstPage.results];
    totalResults = firstPage.totalResults;
    totalPages = Math.max(1, Math.ceil(totalResults / OMDB_PAGE_SIZE));
    nextPage = 2;
  } else {
    error = firstPage.error;
  }

  async function loadMore(batchSize = OMDB_PAGE_SIZE) {
    const items = [];

    while (items.length < batchSize) {
      while (bufferedResults.length && items.length < batchSize) {
        items.push(bufferedResults.shift());
      }

      if (items.length === batchSize) {
        break;
      }

      if (nextPage > totalPages) {
        break;
      }

      const pageData = await fetchSearchPage(query, nextPage, signal);
      nextPage += 1;

      if (pageData.status !== "success") {
        error = pageData.error;
        continue;
      }

      bufferedResults.push(...pageData.results);
    }

    return {
      items,
      exhausted: !bufferedResults.length && nextPage > totalPages
    };
  }

  return {
    loadMore,
    getMeta() {
      return {
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