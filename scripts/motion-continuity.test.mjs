import test from "node:test";
import assert from "node:assert/strict";
import {
  getRigPose,
  getRigDrawPlan,
  animationParts,
} from "../src/data/animationRig.js";
import {
  getAnimationPart,
  animationViews,
  VIEWS_SIZE,
  VIEWS_ATLAS_OFFSET,
} from "../src/data/animationViews.js";
import { animationDurations } from "../src/data/animation.js";
const point = (m, p) => [
  m[0] * p[0] + m[2] * p[1] + m[4],
  m[1] * p[0] + m[3] * p[1] + m[5],
];
test("intermediate motion stays attached, fits the frame and retains contact throughout the cycle", () => {
  for (const [type, count] of [
    ["run", 6],
    ["jump", 6],
    ["idle", 4],
  ])
    for (let n = 0; n < 1200; n++) {
      const frame = (n / 1200) * count,
        p = getRigPose(type, frame),
        plan = getRigDrawPlan(type, frame);
      assert.equal(p.root[0], 256);
      for (const item of plan) {
        const part = getAnimationPart(type, item.id),
          b = part.bbox;
        for (const q of [
          [b.x, b.y],
          [b.x + b.width, b.y],
          [b.x, b.y + b.height],
          [b.x + b.width, b.y + b.height],
        ]) {
          const [x, y] = point(item.matrix, q);
          assert.ok(
            x > 0 && x < 512 && y > 0 && y < 600,
            `${type}/${frame}/${item.id} remains visible`,
          );
        }
      }
      for (const [i, id] of ["rightShoe", "leftShoe"].entries()) {
        const m = plan.find((item) => item.id === id).matrix;
        const bottom = Math.max(
          ...animationParts[id].hull.map((q) => point(m, q)[1]),
        );
        assert.ok(
          bottom <= 560 + 1e-6,
          `${type}/${frame} cannot penetrate the floor`,
        );
        if (p.planted[i]) assert.ok(Math.abs(bottom - 560) < 1e-6);
      }
      if (type === "run") {
        assert.equal(p.lean, 14);
        assert.ok(Math.abs(p.nearShoulder[0] - p.farShoulder[0]) < 8);
      }
    }
});
test("cycle seam has continuous position and velocity; phase clocks remain uniform", () => {
  const eps = 1e-4;
  for (const [type, count] of [
    ["run", 6],
    ["idle", 4],
    ["jump", 6],
  ]) {
    assert.equal(new Set(animationDurations[type]).size, 1);
    const a = getRigPose(type, count - eps),
      b = getRigPose(type, 0),
      c = getRigPose(type, eps);
    for (const key of ["root", "nearWrist", "farWrist", "neck"])
      for (let axis = 0; axis < 2; axis++) {
        assert.ok(Math.abs(a[key][axis] - c[key][axis]) < 0.03);
        const before = (b[key][axis] - a[key][axis]) / eps,
          after = (c[key][axis] - b[key][axis]) / eps;
        assert.ok(
          Math.abs(before - after) < 0.03,
          `${type}/${key} seam velocity`,
        );
      }
  }
});
test("idle uses actual three-quarter artwork and separate feet, running uses a separate profile", () => {
  assert.notDeepEqual(
    getAnimationPart("idle", "head").sourceRect,
    getAnimationPart("run", "head").sourceRect,
  );
  assert.notDeepEqual(
    getAnimationPart("idle", "torso").sourceRect,
    getAnimationPart("run", "torso").sourceRect,
  );
  const p = getRigPose("idle", 0);
  assert.ok(Math.abs(p.rightLeg.ankle[0] - p.leftLeg.ankle[0]) >= 60);
  for (const view of Object.values(animationViews))
    for (const part of Object.values(view)) {
      const r = part.sourceRect;
      assert.ok(r.x >= 0 && r.x + r.width <= VIEWS_SIZE[0]);
      assert.ok(
        r.y >= VIEWS_ATLAS_OFFSET &&
          r.y + r.height <= VIEWS_ATLAS_OFFSET + VIEWS_SIZE[1],
      );
    }
});
