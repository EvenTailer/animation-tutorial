import test from "node:test";
import assert from "node:assert/strict";
import {
  getRigPose,
  getRigDrawPlan,
  animationParts,
} from "../src/data/animationRig.js";
import {
  createAppStore,
  toggleAnimationDrawingStep,
} from "../src/store/index.js";
import { getAnimationDrawingSteps } from "../src/data/animationDrawing.js";
import { apps } from "../src/data/apps.js";
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const transform = (m, [x, y]) => [
  m[0] * x + m[2] * y + m[4],
  m[1] * x + m[3] * y + m[5],
];
test("each robot segment stays attached to its anatomical chain in every phase", () => {
  for (const [type, count] of Object.entries({ idle: 4, run: 6, jump: 6 }))
    for (let frame = 0; frame < count; frame++) {
      const p = getRigPose(type, frame),
        plan = getRigDrawPlan(type, frame);
      for (const [id, parent, child] of [
        ["rightForearm", p.nearElbow, p.nearWrist],
        ["leftForearm", p.farElbow, p.farWrist],
        ["leftShin", p.leftLeg.knee, p.leftLeg.ankle],
        ["rightShin", p.rightLeg.knee, p.rightLeg.ankle],
      ]) {
        const part = animationParts[id],
          m = plan.find((i) => i.id === id).matrix;
        assert.ok(distance(transform(m, part.parent), parent) < 1e-7);
        assert.ok(distance(transform(m, part.child), child) < 1e-7);
      }
      for (const leg of [p.rightLeg, p.leftLeg]) {
        assert.ok(Math.abs(distance(leg.hip, leg.knee) - 98) < 1e-7);
        assert.ok(Math.abs(distance(leg.knee, leg.ankle) - 90) < 1e-7);
      }
    }
});
test("finishing a pose requires all twelve actual drawing steps", () => {
  const store = createAppStore({ storage: null });
  for (let step = 0; step < 11; step++)
    store.dispatch(
      toggleAnimationDrawingStep({ type: "jump", frame: 4, step }),
    );
  assert.equal(store.getState().progress.animation["jump:4"], undefined);
  store.dispatch(
    toggleAnimationDrawingStep({ type: "jump", frame: 4, step: 11 }),
  );
  assert.equal(store.getState().progress.animation["jump:4"], true);
  store.dispatch(
    toggleAnimationDrawingStep({ type: "jump", frame: 4, step: 3 }),
  );
  assert.equal(store.getState().progress.animation["jump:4"], undefined);
  for (const payload of [
    { type: "hit", frame: 0, step: 0 },
    { type: "run", frame: 99, step: 0 },
    { type: "run", frame: 0, step: 12 },
  ])
    store.dispatch(toggleAnimationDrawingStep(payload));
  assert.equal(
    Object.keys(store.getState().progress.animationDrawing).length,
    11,
  );
});
test("drawing lessons progress through construction, silhouette, detail, flat color and checking", () => {
  for (const type of ["idle", "run", "jump"]) {
    const steps = getAnimationDrawingSteps(type, 0);
    assert.equal(steps.length, 12);
    assert.equal(steps[0].technique, "sketch");
    assert.equal(steps[7].technique, "ink");
    assert.equal(steps[9].technique, "fill");
    assert.equal(steps[11].technique, "animation");
    assert.ok(
      steps.every((s) => s.text.length > 100 && s.checkpoint.length > 25),
    );
  }
});
test("device guides provide different brush paths and concrete practice for every application", () => {
  assert.equal(
    new Set(apps.map((a) => a.drawingGuide.brushes.sketch.path)).size,
    3,
  );
  for (const app of apps) {
    const g = app.drawingGuide;
    for (const t of ["sketch", "ink", "fill", "shade", "animation"]) {
      assert.ok(
        g.brushes[t].name &&
          g.brushes[t].path &&
          g.brushes[t].fallback &&
          g.brushes[t].check,
      );
    }
    for (const k of ["line", "oval", "layer", "fill", "animation"])
      assert.equal(g.micro[k].length, 3);
    assert.ok(g.sources.length >= 3);
    assert.ok(app.setup.includes("горизонтальный"));
  }
});
