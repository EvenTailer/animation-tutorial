import assert from "node:assert/strict";
import { readPng } from "./png-utils.mjs";
import {
  animationParts,
  PARTS_SOURCE,
  PARTS_SIZE,
  getRigPose,
  getRigDrawPlan,
  RIG_CANVAS,
} from "../src/data/animationRig.js";
import { animationFrames } from "../src/data/animation.js";
import {
  getAnimationPart,
  animationViews,
  VIEWS_SIZE,
  VIEWS_ATLAS_OFFSET,
} from "../src/data/animationViews.js";
import { getAnimationDrawingSteps } from "../src/data/animationDrawing.js";
const image = readPng(new URL(`../public${PARTS_SOURCE}`, import.meta.url));
assert.deepEqual([image.width, image.height], PARTS_SIZE);
const point = (m, [x, y]) => [
  m[0] * x + m[2] * y + m[4],
  m[1] * x + m[3] * y + m[5],
];
const identity = getRigDrawPlan("idle", 0).map((p) => p.id);
for (const p of Object.values(animationParts)) {
  const r = p.sourceRect;
  assert.ok(
    r.x >= 0 &&
      r.y >= 0 &&
      r.x + r.width <= image.width &&
      r.y + r.height <= image.height,
    `${p.id}: crop remains in source`,
  );
}
assert.ok(
  animationParts.rightForearm.mechanical &&
    !animationParts.leftForearm.mechanical,
);
assert.ok(
  animationParts.leftShin.mechanical && !animationParts.rightShin.mechanical,
);
let total = 0;
for (const [type, frames] of Object.entries(animationFrames)) {
  frames.forEach((_, frame) => {
    const pose = getRigPose(type, frame),
      plan = getRigDrawPlan(type, frame);
    assert.deepEqual(
      plan.map((p) => p.id),
      identity,
      "Anatomical identities and layer order never change",
    );
    for (const item of plan) {
      const m = item.matrix;
      assert.ok(m.every(Number.isFinite));
      assert.ok(
        m[0] * m[3] - m[1] * m[2] > 0,
        "Never mirror an asymmetric limb",
      );
      assert.ok(
        Math.abs(m[0] ** 2 + m[1] ** 2 - m[2] ** 2 - m[3] ** 2) < 1e-8,
        "Parts rotate and scale uniformly",
      );
      const b = getAnimationPart(type, item.id).bbox;
      for (const p of [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x, b.y + b.height],
        [b.x + b.width, b.y + b.height],
      ]) {
        const [x, y] = point(m, p);
        assert.ok(
          x >= 4 && x <= 508 && y >= 12 && y <= 588,
          `${type}/${frame + 1}/${item.id}: artwork stays inside the frame`,
        );
      }
    }
    for (const [index, id] of ["rightShoe", "leftShoe"].entries()) {
      const m = plan.find((p) => p.id === id).matrix,
        maxY = Math.max(...animationParts[id].hull.map((p) => point(m, p)[1]));
      if (pose.planted[index])
        assert.ok(
          Math.abs(maxY - RIG_CANVAS.baseline) < 1e-7,
          `${type}/${frame}: rolled support foot stays grounded`,
        );
      else
        assert.ok(
          maxY < RIG_CANVAS.baseline - 3,
          `${type}/${frame}: airborne foot clears ground`,
        );
    }
    const steps = getAnimationDrawingSteps(type, frame);
    assert.equal(steps.length, 12);
    assert.equal(new Set(steps.map((s) => s.title)).size, 12);
    for (const step of steps)
      for (const key of ["text", "checkpoint", "mistake", "technique"])
        assert.ok(step[key]?.trim());
    total++;
  });
  console.log(
    `${type}: ${frames.length} fixed-identity poses, real foot roll, support/flight and 12 drawing steps verified`,
  );
}
console.log(
  `${total} poses / ${total * 12} drawing steps. No frame swaps limb assets; all artwork fits.`,
);
