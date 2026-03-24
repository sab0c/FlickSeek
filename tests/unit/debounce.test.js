import assert from "node:assert/strict";
import test from "node:test";

import { debounce } from "../../js/utils/debounce.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("debounce runs only the last call", async (t) => {
  const originalWindow = globalThis.window;
  globalThis.window = globalThis;
  t.after(() => {
    globalThis.window = originalWindow;
  });

  const calls = [];
  const debounced = debounce((value) => calls.push(value), 25);

  debounced("first");
  debounced("second");
  debounced("third");

  await wait(50);

  assert.deepEqual(calls, ["third"]);
});

test("debounce respects the delay before executing", async (t) => {
  const originalWindow = globalThis.window;
  globalThis.window = globalThis;
  t.after(() => {
    globalThis.window = originalWindow;
  });

  let executed = false;
  const debounced = debounce(() => {
    executed = true;
  }, 30);

  debounced();
  await wait(10);
  assert.equal(executed, false);

  await wait(30);
  assert.equal(executed, true);
});
