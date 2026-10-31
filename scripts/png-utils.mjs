import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import assert from "node:assert/strict";
export function readPng(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes[24], 8);
  assert.equal(bytes[25], 6);
  assert.equal(bytes[28], 0);
  const width = bytes.readUInt32BE(16),
    height = bytes.readUInt32BE(20),
    chunks = [];
  for (let i = 8; i < bytes.length;) {
    const n = bytes.readUInt32BE(i);
    if (bytes.toString("ascii", i + 4, i + 8) === "IDAT")
      chunks.push(bytes.subarray(i + 8, i + 8 + n));
    i += n + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)),
    stride = width * 4,
    pixels = Buffer.alloc(stride * height);
  function paeth(a, b, c) {
    const p = a + b - c,
      aa = Math.abs(p - a),
      bb = Math.abs(p - b),
      cc = Math.abs(p - c);
    return aa <= bb && aa <= cc ? a : bb <= cc ? b : c;
  }
  let offset = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? pixels[y * stride + x - 4] : 0,
        b = y ? pixels[(y - 1) * stride + x] : 0,
        c = y && x >= 4 ? pixels[(y - 1) * stride + x - 4] : 0;
      pixels[y * stride + x] =
        (raw[offset++] +
          (filter === 1
            ? a
            : filter === 2
              ? b
              : filter === 3
                ? Math.floor((a + b) / 2)
                : filter === 4
                  ? paeth(a, b, c)
                  : 0)) &
        255;
    }
  }
  return {
    width,
    height,
    pixels,
    alpha(x, y) {
      return pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3];
    },
  };
}
