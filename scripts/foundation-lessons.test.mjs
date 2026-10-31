import test from "node:test";
import assert from "node:assert/strict";
import { foundationLessons } from "../src/data/foundationLessons.js";
import { weeks } from "../src/data/curriculum.js";
import { animationFrames } from "../src/data/animation.js";
import { lessonPath } from "../src/routing/paths.js";
import { apps } from "../src/data/apps.js";
import {
  lessonSceneOperations,
  supportsLessonVisual,
} from "../src/data/lessonScenes.js";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformWithEsbuild } from "vite";

// Exercise the real JSX renderer in Node; no browser, screenshot golden or
// duplicate drawing implementation is needed for these content regressions.
const illustrationUrl = new URL(
  "../src/LessonIllustration.jsx",
  import.meta.url,
);
const compiled = await transformWithEsbuild(
  readFileSync(illustrationUrl, "utf8"),
  illustrationUrl.pathname,
  {
    loader: "jsx",
    format: "cjs",
    jsx: "transform",
  },
);
const compiledModule = { exports: {} };
new Function("require", "module", "exports", compiled.code)(
  createRequire(illustrationUrl),
  compiledModule,
  compiledModule.exports,
);
const LessonIllustration = compiledModule.exports.default;
const render = (visual, showError = false) =>
  renderToStaticMarkup(
    React.createElement(LessonIllustration, { visual, showError }),
  );

const expectedIds = Array.from({ length: 10 }, (_, week) =>
  Array.from({ length: 3 }, (_, lesson) => `w${week + 1}-l${lesson + 1}`),
).flat();
const allowedKinds = new Set([
  "tablet",
  "strokes",
  "shapes",
  "volume",
  "light",
  "figure",
  "head",
  "color",
  "views",
  "layers",
  "motion",
  "lion",
  "files",
]);
const entries = Object.values(foundationLessons);
const operations = (id) =>
  foundationLessons[id].steps.map((step) => step.visual.operation);
const requireText = (value, context) => {
  assert.equal(typeof value, "string", context);
  assert.ok(value.trim(), context);
};

test("every public fundamentals URL has its own explicit learning plan", () => {
  assert.deepEqual(
    Object.keys(foundationLessons).sort(),
    [...expectedIds].sort(),
  );
  assert.deepEqual(
    weeks.flatMap((week) => week.lessons.map((lesson) => lesson.id)).sort(),
    [...expectedIds].sort(),
  );
  for (const id of expectedIds) {
    assert.equal(foundationLessons[id].id, id);
    assert.equal(lessonPath(id), `/lesson/${id}`);
  }
});

test("prerequisites resolve to real earlier lessons without cycles or self-dependencies", () => {
  const visiting = new Set(),
    visited = new Set();
  function visit(id) {
    assert.ok(!visiting.has(id), `Prerequisite cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    const lesson = foundationLessons[id];
    assert.ok(lesson, `Missing prerequisite ${id}`);
    assert.ok(Array.isArray(lesson.prerequisites), id);
    assert.equal(
      new Set(lesson.prerequisites).size,
      lesson.prerequisites.length,
      id,
    );
    for (const dependency of lesson.prerequisites) {
      assert.ok(
        expectedIds.indexOf(dependency) < expectedIds.indexOf(id),
        `${id}: unavailable prior skill ${dependency}`,
      );
      assert.notEqual(id, dependency);
      visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of expectedIds) visit(id);
});

test("each action supplies a specific scene, active layer, usable tool, observable result and repair", () => {
  for (const lesson of entries) {
    for (const field of ["title", "goal", "result", "exercise"])
      requireText(lesson[field], `${lesson.id}.${field}`);
    assert.ok(lesson.steps.length > 0, lesson.id);
    const seen = new Set();
    for (const [index, step] of lesson.steps.entries()) {
      const context = `${lesson.id} action ${index + 1}`;
      for (const field of [
        "title",
        "text",
        "why",
        "layer",
        "tool",
        "checkpoint",
        "mistake",
      ])
        requireText(step[field], `${context}.${field}`);
      assert.notEqual(
        step.text,
        step.checkpoint,
        `${context}: instruction cannot stand in for evidence`,
      );
      assert.notEqual(
        step.checkpoint,
        step.mistake,
        `${context}: repair cannot stand in for evidence`,
      );
      assert.ok(
        allowedKinds.has(step.visual?.kind),
        `${context}: missing explicit scene`,
      );
      requireText(step.visual.operation, `${context}.operation`);
      requireText(step.visual.alt, `${context}.alt`);
      const scene = `${step.visual.kind}:${step.visual.variant}:${step.visual.operation}`;
      assert.ok(
        !seen.has(scene),
        `${context}: duplicate operation hides a missing teaching transition`,
      );
      seen.add(scene);
      assert.equal(
        step.visual.phase,
        index,
        `${context}: illustration does not select the current action`,
      );
      assert.equal(step.visual.total, lesson.steps.length, context);
      for (const app of apps)
        assert.ok(
          app.drawingGuide.brushes[step.technique],
          `${context}: no ${step.technique} tool guidance for ${app.name}`,
        );
    }
  }
});

test("every published operation has an illustration and unsupported subjects fail closed", () => {
  for (const lesson of entries)
    for (const step of lesson.steps) {
      assert.ok(
        supportsLessonVisual(step.visual),
        `${lesson.id}: no illustration for ${step.visual.kind}/${step.visual.variant}/${step.visual.operation}`,
      );
      const sequence =
        lessonSceneOperations[`${step.visual.kind}/${step.visual.variant}`];
      assert.equal(
        new Set(sequence).size,
        sequence.length,
        `${lesson.id}: ambiguous illustration operation`,
      );
    }
  for (const visual of [
    { kind: "unknown", variant: "unknown", operation: "compare" },
    { kind: "lion", variant: "unknown", operation: "compare" },
    { kind: "head", variant: "ink", operation: "unimplemented-action" },
  ])
    assert.equal(
      supportsLessonVisual(visual),
      false,
      "Unsupported scenes must not silently show a duck",
    );
});

test("every real teaching scene renders visible geometry, not only a title or empty SVG", () => {
  for (const lesson of entries)
    for (const step of lesson.steps) {
      const html = render(step.visual);
      assert.doesNotMatch(
        html,
        /role="alert"/,
        `${lesson.id}: unsupported ${step.visual.operation}`,
      );
      assert.match(
        html,
        /<(?:path|line|polyline|rect|circle|ellipse)\b/,
        `${lesson.id}: empty ${step.visual.operation}`,
      );
      assert.match(html, /role="img"/, `${lesson.id}: no accessible drawing`);
    }
  const unsupported = render({
    kind: "lion",
    variant: "missing",
    operation: "missing",
    alt: "Missing scene",
  });
  assert.match(unsupported, /role="alert"/);
  assert.doesNotMatch(
    unsupported,
    /<svg/,
    "An unsupported lion scene must not display a substitute character",
  );
});

test("the lion study changes actual geometry as the learner constructs the subject", () => {
  const geometry = (html) =>
    html
      .replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, "")
      .replace(/<title>[\s\S]*?<\/title>/g, "")
      .replace(/(?:aria-label|data-scene)="[^"]*"/g, "");
  const construction = foundationLessons["w10-l2"].steps.filter(
    (step) =>
      step.technique === "sketch" && step.visual.operation !== "study-review",
  );
  const scenes = construction.map((step) => geometry(render(step.visual)));
  assert.equal(
    new Set(scenes).size,
    construction.length,
    "Changing the instruction must not leave a repeated generic drawing",
  );
});

test("completion explicitly preserves an editable project and checks the reopened file", () => {
  const lessonPage = readFileSync(
    new URL("../src/pages/LessonPage.jsx", import.meta.url),
    "utf8",
  ).replace(/\s+/g, " ");
  // This common completion instruction protects all 30 lessons, including
  // those whose final skill operation is comparison rather than file export.
  assert.match(lessonPage, /сохрани\s+редактируемый\s+исходник/iu);
  assert.match(lessonPage, /PNG[\s\S]*?Исходник со слоями/iu);
  assert.match(lessonPage, /открой исходник снова/iu);
  assert.match(lessonPage, /Скрой и покажи слой/iu);
  assert.doesNotMatch(
    lessonPage,
    /from\s+["'][^"']*Diagram["']|Math\.min\(3,\s*stage\)|setInterval\(/,
    "Fundamentals must not regress to four generic auto-played stages",
  );
});

test("document commands do not send beginners back to a painting tool", () => {
  const menuOperations = new Set([
    "canvas",
    "layer",
    "ink-layer",
    "base-layer",
    "undo",
    "visibility",
    "save",
    "save-copy",
    "folders",
    "source-file",
    "transparent-part",
    "equal-frames",
    "readme",
    "export",
  ]);
  for (const lesson of entries)
    for (const step of lesson.steps) {
      assert.ok(
        ["menu", "draw"].includes(step.interaction),
        `${lesson.id}: unspecified interaction for ${step.visual.operation}`,
      );
      if (menuOperations.has(step.visual.operation)) {
        assert.equal(
          step.interaction,
          "menu",
          `${lesson.id}: ${step.visual.operation} is not a brush stroke`,
        );
        assert.doesNotMatch(
          step.tool,
          /линия 2–4 px|непрозрачность 35%/u,
          `${lesson.id}: sketch settings substituted for the document command`,
        );
      }
    }
});

test("the boss lessons cannot silently fall back to a duck or a generic character", () => {
  for (const id of ["w10-l1", "w10-l2"])
    for (const step of foundationLessons[id].steps)
      assert.equal(
        step.visual.kind,
        "lion",
        `${id}: wrong subject in ${step.title}`,
      );
  for (const step of foundationLessons["w10-l3"].steps)
    assert.ok(
      ["files", "lion", "layers"].includes(step.visual.kind),
      `Export lesson must show files or the actual subject: ${step.title}`,
    );
  const finishing = foundationLessons["w10-l2"].steps;
  assert.ok(
    finishing.some((step) => step.technique === "ink"),
    "Lion finishing must teach its contour",
  );
  assert.ok(
    finishing.some((step) => step.technique === "fill"),
    "Lion finishing must teach its flat colors",
  );
  assert.ok(
    finishing.some((step) => step.technique === "shade"),
    "Lion finishing must teach its shadow separately",
  );
});

test("head cleanup, color and shadow teach different tools and preserve the construction", () => {
  const cleanup = foundationLessons["w4-l3"].steps;
  assert.ok(
    cleanup.every((step) => step.visual.kind === "head"),
    "Cleanup is not a turnaround lesson",
  );
  assert.ok(
    cleanup.some(
      (step) =>
        step.visual.operation === "ink-layer" && step.technique === "ink",
    ),
  );
  assert.ok(
    cleanup.some((step) => step.visual.operation === "visibility"),
    "Hide construction to inspect the surviving contour",
  );
  for (const step of cleanup.filter((step) => step.technique === "ink"))
    assert.match(
      step.layer,
      /контур/i,
      "Clean strokes must not overwrite the sketch",
    );
  const colors = foundationLessons["w5-l2"].steps;
  assert.ok(colors.some((step) => step.technique === "ink"));
  assert.ok(colors.some((step) => step.technique === "fill"));
  assert.ok(colors.some((step) => step.technique === "shade"));
  for (const lesson of entries)
    for (const step of lesson.steps) {
      if (step.technique === "fill")
        assert.match(
          step.layer,
          /цвет|силуэт|пятн|образц|палитр/i,
          `${lesson.id}: fill target`,
        );
      if (step.technique === "shade")
        assert.match(
          step.layer,
          /тен|тень|материал|свет/i,
          `${lesson.id}: shadow target`,
        );
    }
});

test("hiding the head sketch preserves two ordinary eyes, pupils and a closed outer contour", () => {
  const step = foundationLessons["w4-l3"].steps.find(
    (item) => item.visual.operation === "visibility",
  );
  const html = render(step.visual);
  const eyes = [...html.matchAll(/<ellipse\b[^>]*>/g)].map(([tag]) => {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [
        name,
        value,
      ]),
    );
    return Object.fromEntries(
      ["cx", "cy", "rx", "ry"].map((name) => [name, Number(attributes[name])]),
    );
  });
  assert.equal(
    eyes.length,
    2,
    "Both eye outlines must survive without the construction layer",
  );
  const pupils = [...html.matchAll(/<circle\b[^>]*>/g)]
    .map(([tag]) => {
      const attributes = Object.fromEntries(
        [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [
          name,
          value,
        ]),
      );
      return {
        x: Number(attributes.cx),
        y: Number(attributes.cy),
        radius: Number(attributes.r),
        fill: attributes.fill,
      };
    })
    .filter((circle) => circle.fill && circle.fill !== "none");
  for (const eye of eyes)
    assert.ok(
      pupils.some(
        (pupil) =>
          ((pupil.x - eye.cx) / eye.rx) ** 2 +
            ((pupil.y - eye.cy) / eye.ry) ** 2 <
            1 && pupil.radius < Math.min(eye.rx, eye.ry),
      ),
      "Each ordinary eye needs a smaller pupil inside, not a replacement implant",
    );
  assert.doesNotMatch(
    html,
    /stroke-dasharray=/,
    "Hidden construction axes must not survive on the clean layer",
  );
  assert.ok(
    [...html.matchAll(/<path\b[^>]*\bd="([^"]*)"/g)].some(([, path]) =>
      /Z\s*$/i.test(path),
    ),
    "The external head and neck silhouette must close rather than end in a gap",
  );
});

test("the actual run SVG plants one shoe on the drawn ground and lifts both during flight", () => {
  const step = foundationLessons["w8-l2"].steps.find(
    (item) => item.visual.operation === "loop-check",
  );
  const paths = [
    ...render(step.visual).matchAll(/<path\b[^>]*\bd="([^"]*)"/g),
  ].map(([, path]) => path);
  const poses = [];
  let shoes = [];
  for (const path of paths) {
    // The shoe silhouettes are closed polygons. Read the SVG that learners see,
    // rather than retesting the source rig's matrix or planted flags.
    if (/^M[\d\s.eE+\-]+(?: L[\d\s.eE+\-]+)+ Z$/.test(path)) {
      const points = [...path.matchAll(/[ML]([\d.eE+\-]+) ([\d.eE+\-]+)/g)].map(
        ([, x, y]) => [Number(x), Number(y)],
      );
      if (points.length >= 6) shoes.push(points);
    }
    const ground = path.match(/^M[\d.\-]+ ([\d.\-]+) H[\d.\-]+$/);
    if (ground && shoes.length === 2) {
      poses.push({ ground: Number(ground[1]), shoes });
      shoes = [];
    }
  }
  assert.equal(
    poses.length,
    6,
    "Every displayed pose needs both actual shoe contours and its ground",
  );
  const expectedContacts = [1, 1, 0, 1, 1, 0];
  for (const [index, pose] of poses.entries()) {
    const soles = pose.shoes.map((points) =>
      Math.max(...points.map(([, y]) => y)),
    );
    assert.ok(
      soles.every((y) => y <= pose.ground + 1e-6),
      `Run key ${index + 1}: shoe penetrates the floor`,
    );
    assert.equal(
      soles.filter((y) => Math.abs(y - pose.ground) < 1e-6).length,
      expectedContacts[index],
      `Run key ${index + 1}: visible sole contact disagrees with contact/compression/flight`,
    );
  }
});

test("front, profile and back studies cannot reuse an unrelated frontal body scene", () => {
  for (const id of ["w6-l1", "w6-l2"])
    assert.ok(
      foundationLessons[id].steps.every((step) => step.visual.kind === "views"),
      id,
    );
  assert.ok(
    operations("w6-l1").some((operation) => /profile|side/.test(operation)),
  );
  assert.ok(operations("w6-l2").some((operation) => /back/.test(operation)));
});

test("the straight-ahead sphere axis passes vertically through the circle center", () => {
  const step = foundationLessons["w2-l1"].steps.find(
    (item) => item.visual.operation === "axis",
  );
  const html = render(step.visual);
  const tags = [...html.matchAll(/<circle\b[^>]*>/g)].map(([tag]) =>
    Object.fromEntries(
      [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key,
        value,
      ]),
    ),
  );
  const sphere = tags.find((attributes) => Number(attributes.r) > 20);
  assert.ok(sphere, "The axis lesson must show its sphere outline");
  const cx = Number(sphere.cx),
    cy = Number(sphere.cy),
    radius = Number(sphere.r);
  const verticals = [
    ...html.matchAll(
      /<path\b[^>]*\bd="M([\d.eE+\-]+) ([\d.eE+\-]+) V([\d.eE+\-]+)"/g,
    ),
  ];
  assert.ok(
    verticals.some(
      ([, x, top, bottom]) =>
        Math.abs(Number(x) - cx) < 1e-6 &&
        Math.abs(Number(top) - (cy - radius)) < 1e-6 &&
        Math.abs(Number(bottom) - (cy + radius)) < 1e-6,
    ),
    "The front-view axis must join the top and bottom through the center, not bow toward a turned view",
  );
});

test("ball comparison really shows two six-frame paths and isolates uniform ascent in B", () => {
  const step = foundationLessons["w7-l1"].steps.find(
    (item) => item.visual.operation === "compare",
  );
  const html = render(step.visual);
  const circles = [...html.matchAll(/<circle\b[^>]*>/g)].map(([tag]) =>
    Object.fromEntries(
      [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key,
        value,
      ]),
    ),
  );
  const b = circles
    .filter((circle) => circle["data-spacing"] === "uniform-ascent")
    .sort(
      (first, second) => Number(first["data-key"]) - Number(second["data-key"]),
    );
  const a = circles.filter(
    (circle) => !circle["data-spacing"] && Number(circle.r) > 10,
  );
  assert.equal(
    a.length,
    6,
    "The original sequence A must remain visible for comparison",
  );
  assert.equal(
    b.length,
    6,
    "A label alone cannot substitute for the second six-frame sequence",
  );
  assert.deepEqual(
    b.map((circle) => Number(circle["data-key"])),
    [1, 2, 3, 4, 5, 6],
  );
  assert.ok(
    b.every((circle, index) => Number(circle.cx) !== Number(a[index].cx)),
    "A and B need separate columns, not overlapping positions",
  );
  const ay = a.map((circle) => Number(circle.cy)),
    by = b.map((circle) => Number(circle.cy));
  const ascentSteps = by.slice(1, 4).map((y, index) => y - by[index]);
  assert.ok(ascentSteps[0] < 0, "The compared first four frames must ascend");
  assert.ok(
    ascentSteps.every((distance) => Math.abs(distance - ascentSteps[0]) < 1e-6),
    "B must use equal spatial increments on ascent",
  );
  assert.ok(
    Math.abs(ay[1] - ay[0] - (ay[3] - ay[2])) > 1,
    "A must preserve its contrasting slower spacing near the apex",
  );
  assert.equal(by[0], ay[0], "Both examples must start at the same height");
  assert.equal(by[3], ay[3], "Both examples must reach the same apex");
  assert.deepEqual(
    by.slice(4),
    ay.slice(4),
    "Only ascent changes; the stated unchanged descent must stay identical",
  );
});

test("fundamentals and the actual movement studio agree on six run and jump poses", () => {
  assert.equal(animationFrames.run.length, 6);
  assert.equal(animationFrames.jump.length, 6);
  for (const id of ["w7-l1", "w7-l2", "w8-l1", "w8-l2", "w8-l3"])
    assert.ok(
      foundationLessons[id].steps.every(
        (step) => step.visual.kind === "motion",
      ),
      id,
    );
  for (const id of ["w7-l1", "w7-l2", "w8-l2"])
    assert.doesNotMatch(
      JSON.stringify(foundationLessons[id]),
      /восемь кадров|восьми кадров|8 кадров|run_08|run_01…run_08/iu,
      `${id}: obsolete eight-pose plan`,
    );
  for (const [id, operation] of [
    ["w7-l1", "ball-circles"],
    ["w8-l2", "loop-check"],
  ]) {
    const scene = foundationLessons[id].steps.find(
      (step) => step.visual.operation === operation,
    );
    const labels = [
      ...render(scene.visual).matchAll(
        /<(?:text)\b[^>]*>(?:Кадр|Ключ)\s*([1-9]\d*)<\/text>/g,
      ),
    ].map((match) => Number(match[1]));
    assert.deepEqual(
      labels,
      [1, 2, 3, 4, 5, 6],
      `${id}: the displayed sequence must match the six-pose instruction`,
    );
  }
});
