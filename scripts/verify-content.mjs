import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { masterclasses } from "../src/data/masterclasses.js";
import { weeks } from "../src/data/curriculum.js";

const root = new URL("../", import.meta.url);
const ids = new Set();
const sheets = new Map();
for (const course of masterclasses) {
  const steps = course.chapters.flatMap((chapter) => chapter.steps);
  assert.equal(steps.length, course.id === "duck" ? 60 : 36);
  assert.ok(existsSync(new URL(`public${course.reference}`, root)));
  for (const step of steps) {
    assert.ok(!ids.has(step.id), `Duplicate stage: ${step.id}`);
    ids.add(step.id);
    for (const field of [
      "title",
      "goal",
      "tools",
      "layer",
      "checkpoint",
      "commonMistake",
    ]) {
      assert.ok(
        typeof step[field] === "string" && step[field].trim(),
        `${step.id}: missing ${field}`,
      );
    }
    assert.ok(
      step.actions.length === 1 &&
        step.actions.every(
          (action) => typeof action === "string" && action.trim(),
        ),
    );
    assert.ok(
      Number.isInteger(step.panel) &&
        step.panel >= 0 &&
        step.panel < step.columns * step.rows,
    );
    const file = new URL(`public${step.sheet}`, root);
    const bytes = readFileSync(file);
    assert.equal(
      bytes.subarray(0, 8).toString("hex"),
      "89504e470d0a1a0a",
      step.sheet,
    );
    const width = bytes.readUInt32BE(16),
      height = bytes.readUInt32BE(20);
    assert.ok(
      width / step.columns >= 128 && height / step.rows >= 128,
      `${step.sheet}: each panel must be large enough to study`,
    );
    const panels = sheets.get(step.sheet) || new Set();
    assert.ok(
      !panels.has(step.panel),
      `${step.sheet}: duplicate panel ${step.panel}`,
    );
    panels.add(step.panel);
    sheets.set(step.sheet, panels);
  }
  console.log(
    `${course.id}: ${steps.length} illustrated stages, ${steps.reduce((n, step) => n + step.actions.length, 0)} actions`,
  );
}
assert.equal(weeks.length, 10);
const lessons = weeks.flatMap((week) => week.lessons);
assert.equal(lessons.length, 30);
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 30);
assert.equal(sheets.size, 8);
for (const [motion, columns, rows] of [
  ["run", 4, 2],
  ["jump", 3, 2],
  ["hit", 3, 2],
  ["idle", 2, 2],
]) {
  const bytes = readFileSync(
    new URL(`public/assets/duck-${motion}-frames.png`, root),
  );
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.ok(
    bytes.readUInt32BE(16) / columns >= 200 &&
      bytes.readUInt32BE(20) / rows >= 200,
  );
  console.log(`${motion}: ${columns * rows} full-character poses available`);
}
console.log(
  "References, unique panel assignments, image grids and 30 supporting lessons verified.",
);
