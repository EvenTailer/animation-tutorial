import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { transformWithEsbuild } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { foundationLessons } from "../src/data/foundationLessons.js";
const url = new URL("../src/LessonIllustration.jsx", import.meta.url);
const code = await transformWithEsbuild(
  await readFile(url, "utf8"),
  url.pathname,
  { loader: "jsx", format: "cjs", jsx: "transform" },
);
const compiled = { exports: {} };
new Function("require", "module", "exports", code.code)(
  createRequire(url),
  compiled,
  compiled.exports,
);
const Illustration = compiled.exports.default;
const out = new URL("../docs/foundations-qa/", import.meta.url);
await mkdir(new URL("scenes/", out), { recursive: true });
for (const lesson of Object.values(foundationLessons)) {
  const sheet = createCanvas(990, Math.ceil(lesson.steps.length / 3) * 290),
    c = sheet.getContext("2d");
  c.fillStyle = "#f4f1e8";
  c.fillRect(0, 0, sheet.width, sheet.height);
  for (const [i, step] of lesson.steps.entries()) {
    const html = renderToStaticMarkup(
      React.createElement(Illustration, { visual: step.visual }),
    );
    let svg = html
      .match(/<svg[\s\S]*?<\/svg>/)[0]
      .replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg" width="660" height="520"',
      );
    if (svg.includes('href="/assets/boss-pride-lion.png"')) {
      const original = await readFile(
        new URL("../public/assets/boss-pride-lion.png", import.meta.url),
      );
      svg = svg.replace(
        'href="/assets/boss-pride-lion.png"',
        `href="data:image/png;base64,${original.toString("base64")}"`,
      );
    }
    await writeFile(
      new URL(`scenes/${lesson.id}-${String(i + 1).padStart(2, "0")}.svg`, out),
      svg,
    );
    const img = await loadImage(Buffer.from(svg));
    const x = (i % 3) * 330,
      y = Math.floor(i / 3) * 290;
    c.drawImage(img, x, y + 25, 330, 260);
    c.fillStyle = "#273b2c";
    c.font = "12px sans-serif";
    c.fillText(`${i + 1}. ${step.visual.operation}`, x + 10, y + 17);
  }
  await writeFile(
    new URL(`${lesson.id}.png`, out),
    sheet.toBuffer("image/png"),
  );
}
console.log("30 lesson montages / 187 explicit SVG teaching actions exported");
