import "./audit-profile-animation.mjs";
import assert from "node:assert/strict";
import { animationSheets } from "../src/data/animationSheets.js";
import { animationFrames, animationDurations } from "../src/data/animation.js";
import { ANIMATION_COUNTS } from "../src/routing/paths.js";
import { getAnimationPlacement } from "../src/animationRaster.js";
import { readPng } from "./png-utils.mjs";
for (const [type, sheet] of Object.entries(animationSheets)) {
  const image = readPng(new URL(`../public${sheet.src}`, import.meta.url));
  assert.deepEqual([image.width, image.height], sheet.sourceSize);
  assert.equal(sheet.frames.length, ANIMATION_COUNTS[type]);
  assert.equal(sheet.frames.length, animationFrames[type].length);
  assert.equal(sheet.frames.length, animationDurations[type].length);
  let transparent = 0;
  for (let i = 3; i < image.pixels.length; i += 4)
    if (image.pixels[i] === 0) transparent++;
  assert.ok(
    transparent > image.width * image.height * 0.2,
    `${type}: real alpha transparency required`,
  );
  const bottoms = [];
  sheet.frames.forEach((frame, i) => {
    const { source: s, destination: d } = getAnimationPlacement(type, i),
      b = frame.bbox;
    assert.ok(
      s.x >= 0 &&
        s.y >= 0 &&
        s.x + s.width <= image.width &&
        s.y + s.height <= image.height,
      `${type}/${i}: crop inside source`,
    );
    assert.ok(
      s.x <= b.x &&
        s.y <= b.y &&
        s.x + s.width >= b.x + b.width &&
        s.y + s.height >= b.y + b.height,
      `${type}/${i}: whole pose retained`,
    );
    assert.ok(
      d.x >= 16 &&
        d.y >= 16 &&
        d.x + d.width <= sheet.output.width - 16 &&
        d.y + d.height <= sheet.output.height - 16,
      `${type}/${i}: no output clipping`,
    );
    assert.ok(
      d.width / s.width === d.height / s.height ||
        Math.abs(d.width / s.width - d.height / s.height) < 1e-9,
      "Do not stretch the artwork",
    );
    bottoms.push(d.y + (b.y + b.height - s.y) * sheet.scale);
  });
  const grounded =
    type === "run"
      ? [0, 1, 3, 4]
      : type === "jump"
        ? [0, 1, 4, 5]
        : [0, 1, 2, 3];
  for (const i of grounded)
    assert.ok(
      Math.abs(bottoms[i] - sheet.output.baseline) <= 1.1,
      `${type}/${i}: grounded feet use the same baseline`,
    );
  if (type === "run")
    for (const i of [2, 5])
      assert.ok(
        bottoms[i] <= sheet.output.baseline - 25,
        "Run flight clears the floor",
      );
  if (type === "jump")
    assert.ok(
      bottoms[3] <= sheet.output.baseline - 100,
      "Jump apex clears the floor",
    );
  console.log(
    `${type}: ${sheet.frames.length} whole profile poses, transparent source, common scale, grounded/airborne registration verified`,
  );
}
