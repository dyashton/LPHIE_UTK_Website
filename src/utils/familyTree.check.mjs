// ponytail: one runnable check for lineageIds — run: node src/utils/familyTree.check.mjs
import { indexRows, lineageIds } from "./familyTree.js";
import assert from "node:assert/strict";

const rows = [
  { brother: "A", parent: "", family: "X", school: "UTK", label: "A" },
  { brother: "B", parent: "A", family: "X", school: "UTK", label: "B" },
  { brother: "C", parent: "B", family: "X", school: "UTK", label: "C" },
  { brother: "D", parent: "A", family: "X", school: "UTK", label: "D" },
];

const { byId, children } = indexRows(rows);

const fromB = lineageIds("B", byId, children);
assert.deepEqual([...fromB].sort(), ["A", "B", "C"], "B lineage is A→B→C");

const fromA = lineageIds("A", byId, children);
assert.deepEqual([...fromA].sort(), ["A", "B", "C", "D"], "A lineage is whole tree");

const missing = lineageIds("Nope", byId, children);
assert.equal(missing.size, 0, "unknown id → empty");

console.log("familyTree.check: ok");
