import assert from "node:assert/strict";
import test from "node:test";

import { escapeHtml } from "../../js/utils/html.js";

test("escapeHtml escapes dangerous HTML characters", () => {
  assert.equal(
    escapeHtml(`<div class="x">'&"</div>`),
    "&lt;div class=&quot;x&quot;&gt;&#39;&amp;&quot;&lt;/div&gt;"
  );
});

test("escapeHtml converts non-string values", () => {
  assert.equal(escapeHtml(123), "123");
  assert.equal(escapeHtml(null), "null");
});
