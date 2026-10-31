import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { animationSheets } from "../src/data/animationSheets.js";
import { getAnimationPlacement } from "../src/animationRaster.js";

function decodePng(bytes) {
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  const width = bytes.readUInt32BE(16),
    height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8);
  assert.equal(bytes[25], 6);
  assert.equal(bytes[28], 0);
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.toString("ascii", offset + 4, offset + 8) === "IDAT")
      chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)),
    stride = width * 4;
  assert.equal(raw.length, (stride + 1) * height);
  const pixels = Buffer.alloc(stride * height);
  let offset = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c,
      aa = Math.abs(p - a),
      bb = Math.abs(p - b),
      cc = Math.abs(p - c);
    return aa <= bb && aa <= cc ? a : bb <= cc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[y * stride + x - 4] : 0;
      const above = y ? pixels[(y - 1) * stride + x] : 0;
      const corner = y && x >= 4 ? pixels[(y - 1) * stride + x - 4] : 0;
      const prediction =
        filter === 1
          ? left
          : filter === 2
            ? above
            : filter === 3
              ? Math.floor((left + above) / 2)
              : filter === 4
                ? paeth(left, above, corner)
                : 0;
      pixels[y * stride + x] = (raw[offset++] + prediction) & 255;
    }
  }
  return { width, height, pixels };
}
let total = 0;
for (const [type, sheet] of Object.entries(animationSheets)) {
  const image = decodePng(
    readFileSync(new URL(`../public${sheet.src}`, import.meta.url)),
  );
  assert.deepEqual(
    [image.width, image.height],
    sheet.sourceSize,
    `${type}: source dimensions`,
  );
  assert.equal(
    sheet.frames.length,
    sheet.columns * sheet.rows,
    `${type}: complete output grid`,
  );
  assert.equal(sheet.output.width, 512);
  assert.equal(sheet.output.height, 600);
  assert.equal(sheet.output.baseline, 560);
  const alpha = (x, y) => image.pixels[(y * image.width + x) * 4 + 3];
  for (const [index, frame] of sheet.frames.entries()) {
    const r = frame.sourceRect,
      b = frame.bbox,
      p = getAnimationPlacement(type, index),
      label = `${type}/${index + 1}`;
    assert.ok(
      r.x >= 0 &&
        r.y >= 0 &&
        r.x + r.width <= image.width &&
        r.y + r.height <= image.height,
      `${label}: source crop in image`,
    );
    assert.ok(
      r.x <= b.x &&
        r.y <= b.y &&
        r.x + r.width >= b.x + b.width &&
        r.y + r.height >= b.y + b.height,
      `${label}: full bbox included`,
    );
    for (let x = r.x; x < r.x + r.width; x++)
      for (const y of [r.y, r.y + r.height - 1])
        assert.ok(
          alpha(x, y) < 16,
          `${label}: horizontal crop cuts opaque art`,
        );
    for (let y = r.y; y < r.y + r.height; y++)
      for (const x of [r.x, r.x + r.width - 1])
        assert.ok(alpha(x, y) < 16, `${label}: vertical crop cuts opaque art`);
    const visible = {
      x: p.destination.x + (b.x - r.x) * sheet.scale,
      y: p.destination.y + (b.y - r.y) * sheet.scale,
      width: b.width * sheet.scale,
      height: b.height * sheet.scale,
    };
    assert.ok(
      visible.x >= 12 &&
        visible.y >= 12 &&
        visible.x + visible.width <= 500 &&
        visible.y + visible.height <= 588,
      `${label}: at least 12px output margin`,
    );
    if (frame.lift === 0)
      assert.ok(
        Math.abs(visible.y + visible.height - sheet.output.baseline) < 0.001,
        `${label}: support foot anchored to ground`,
      );
    else
      assert.ok(
        visible.y + visible.height <= sheet.output.baseline - frame.lift + 1,
        `${label}: feet above ground`,
      );
    assert.ok(
      Math.abs(p.destination.width / r.width - sheet.scale) < 1e-9,
      `${label}: scale unchanged`,
    );
    total++;
  }
  console.log(
    `${type}: ${sheet.frames.length} complete profile poses, scale ${sheet.scale}, export ${sheet.columns * 512}×${sheet.rows * 600}`,
  );
}
console.log(
  `${total} frames: crop borders, output margins, scale, ground and flight anchors verified. Visual anatomy review remains required.`,
);
