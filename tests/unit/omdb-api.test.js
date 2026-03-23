import assert from "node:assert/strict";
import test from "node:test";

import { createSearchSession, fetchTitleDetails } from "../../js/services/omdb-api.js";

function jsonResponse(payload) {
  return {
    ok: true,
    async json() {
      return payload;
    }
  };
}

function getSearchKey(url) {
  const parsed = new URL(url);
  return `${parsed.searchParams.get("s") || ""}::${parsed.searchParams.get("page") || "1"}`;
}

test("createSearchSession uses exact results and preserves totalResults", async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    const key = getSearchKey(url);

    if (key === "batman unit::1") {
      return jsonResponse({
        Response: "True",
        totalResults: "2",
        Search: [
          { Title: "Batman Unit", imdbID: "tt-unit-1", Year: "2024", Type: "movie", Poster: "N/A" },
          { Title: "Batman Unit Returns", imdbID: "tt-unit-2", Year: "2025", Type: "movie", Poster: "N/A" }
        ]
      });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const session = await createSearchSession("batman unit");
  const batch = await session.loadMore(10);
  const meta = session.getMeta();

  assert.equal(meta.strategy, "exact");
  assert.equal(meta.totalResults, 2);
  assert.equal(batch.items.length, 2);
  assert.deepEqual(
    batch.items.map((item) => item.imdbID),
    ["tt-unit-1", "tt-unit-2"]
  );
});

test("createSearchSession returns no results when the exact search finds no matches", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url) => {
    calls.push(url);
    const key = getSearchKey(url);

    if (key === "spid::1") {
      return jsonResponse({ Response: "False", Error: "Movie not found!" });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const session = await createSearchSession("spid");
  const batch = await session.loadMore(10);

  assert.equal(session.getMeta().strategy, "exact");
  assert.equal(batch.items.length, 0);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].includes("s=spid"));
});

test("createSearchSession does not expand one-character queries", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url) => {
    calls.push(url);
    const key = getSearchKey(url);

    if (key === "b::1") {
      return jsonResponse({ Response: "False", Error: "Movie not found!" });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const session = await createSearchSession("b");
  const batch = await session.loadMore(10);

  assert.equal(session.getMeta().strategy, "exact");
  assert.equal(batch.items.length, 0);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].includes("s=b"));
});

test("createSearchSession removes duplicate items when loading more pages", async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    const key = getSearchKey(url);

    if (key === "duplicate unit::1") {
      return jsonResponse({
        Response: "True",
        totalResults: "20",
        Search: [
          { Title: "Duplicate Unit Movie 1", imdbID: "tt-dup-1", Year: "2020", Type: "movie", Poster: "N/A" },
          { Title: "Duplicate Unit Movie 2", imdbID: "tt-dup-2", Year: "2021", Type: "movie", Poster: "N/A" }
        ]
      });
    }

    if (key === "duplicate unit::2") {
      return jsonResponse({
        Response: "True",
        totalResults: "20",
        Search: [
          { Title: "Duplicate Unit Movie 2", imdbID: "tt-dup-2", Year: "2021", Type: "movie", Poster: "N/A" },
          { Title: "Duplicate Unit Movie 3", imdbID: "tt-dup-3", Year: "2022", Type: "movie", Poster: "N/A" }
        ]
      });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const session = await createSearchSession("duplicate unit");
  const batch = await session.loadMore(3);

  assert.deepEqual(
    batch.items.map((item) => item.imdbID),
    ["tt-dup-1", "tt-dup-2", "tt-dup-3"]
  );
});

test("createSearchSession loads multiple pages in exact search mode", async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    const key = getSearchKey(url);

    if (key === "paged unit::1") {
      return jsonResponse({
        Response: "True",
        totalResults: "12",
        Search: Array.from({ length: 10 }, (_, index) => ({
          Title: `Paged Unit Movie ${index + 1}`,
          imdbID: `tt-page-${index + 1}`,
          Year: `20${10 + index}`,
          Type: "movie",
          Poster: "N/A"
        }))
      });
    }

    if (key === "paged unit::2") {
      return jsonResponse({
        Response: "True",
        totalResults: "12",
        Search: [
          { Title: "Paged Unit Movie 11", imdbID: "tt-page-11", Year: "2021", Type: "movie", Poster: "N/A" },
          { Title: "Paged Unit Movie 12", imdbID: "tt-page-12", Year: "2022", Type: "movie", Poster: "N/A" }
        ]
      });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const session = await createSearchSession("paged unit");
  const batch = await session.loadMore(12);

  assert.equal(batch.items.length, 12);
  assert.equal(batch.exhausted, true);
  assert.deepEqual(
    batch.items.map((item) => item.imdbID),
    [
      "tt-page-1",
      "tt-page-2",
      "tt-page-3",
      "tt-page-4",
      "tt-page-5",
      "tt-page-6",
      "tt-page-7",
      "tt-page-8",
      "tt-page-9",
      "tt-page-10",
      "tt-page-11",
      "tt-page-12"
    ]
  );
});

test("createSearchSession preserves the exact search error when OMDb returns too many results", async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    const key = getSearchKey(url);

    if (key === "zz::1") {
      return jsonResponse({ Response: "False", Error: "Too many results." });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const session = await createSearchSession("zz");
  const batch = await session.loadMore(1);

  assert.equal(session.getMeta().strategy, "exact");
  assert.equal(session.getMeta().error, "Too many results for this search.");
  assert.equal(batch.items.length, 0);
});

test("fetchTitleDetails uses cache to avoid a second request", async (t) => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;

  globalThis.fetch = async (url) => {
    requestCount += 1;

    if (url.includes("i=tt-cache-1")) {
      return jsonResponse({
        Response: "True",
        Title: "Cache Test",
        Year: "2024",
        Genre: "Action",
        Runtime: "100 min",
        imdbRating: "8.0",
        Plot: "Plot"
      });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const first = await fetchTitleDetails("tt-cache-1");
  const second = await fetchTitleDetails("tt-cache-1");

  assert.equal(requestCount, 1);
  assert.equal(first.Title, "Cache Test");
  assert.equal(second.Title, "Cache Test");
});

test("fetchTitleDetails reuses the same request in concurrent calls", async (t) => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;

  globalThis.fetch = async (url) => {
    requestCount += 1;

    if (url.includes("i=tt-concurrent-1")) {
      await new Promise((resolve) => setTimeout(resolve, 20));

      return jsonResponse({
        Response: "True",
        Title: "Concurrent Test",
        Year: "2024",
        Genre: "Action",
        Runtime: "99 min",
        imdbRating: "7.7",
        Plot: "Plot"
      });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const firstPromise = fetchTitleDetails("tt-concurrent-1");
  const secondPromise = fetchTitleDetails("tt-concurrent-1");

  const [first, second] = await Promise.all([firstPromise, secondPromise]);

  assert.equal(requestCount, 1);
  assert.equal(first.Title, "Concurrent Test");
  assert.equal(second.Title, "Concurrent Test");
});

test("fetchTitleDetails propagates OMDb errors when details are not found", async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    if (url.includes("i=tt-missing-1")) {
      return jsonResponse({
        Response: "False",
        Error: "Movie not found!"
      });
    }

    throw new Error(`URL nao esperada: ${url}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await assert.rejects(() => fetchTitleDetails("tt-missing-1"), /No results found\./);
});
