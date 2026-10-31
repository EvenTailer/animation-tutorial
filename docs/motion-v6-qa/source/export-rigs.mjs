import { createCanvas, loadImage } from "@napi-rs/canvas";
import gifenc from "gifenc";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  drawAnimationFrame,
  drawAnimationStudy,
} from "../src/animationRaster.js";
import {
  animationParts,
  getRigDrawPlan,
  getRigPose,
} from "../src/data/animationRig.js";
import {
  animationViews,
  getAnimationPart,
  VIEWS_ATLAS_OFFSET,
} from "../src/data/animationViews.js";
const { GIFEncoder, quantize, applyPalette } = gifenc;
const out = resolve(process.argv[2] || "docs/motion-v6-qa");
await mkdir(out, { recursive: true });
globalThis.document = { createElement: () => createCanvas(1, 1) };
const source = await loadImage("public/assets/duck-profile-parts-v5.png");
const views = await loadImage("public/assets/duck-rig-views-v6.png");
const packed = createCanvas(1448, VIEWS_ATLAS_OFFSET + views.height);
packed.getContext("2d").drawImage(source, 0, 0);
packed.getContext("2d").drawImage(views, 0, VIEWS_ATLAS_OFFSET);
await writeFile(
  resolve(out, "duck-rig-packed-v6.png"),
  packed.toBuffer("image/png"),
);
await copyFile(
  "public/assets/duck-profile-parts-v5.png",
  resolve(out, "duck-parts-v5.png"),
);
await copyFile(
  "public/assets/duck-rig-views-v6.png",
  resolve(out, "duck-views-v6.png"),
);
await mkdir(resolve(out, "parts"), { recursive: true });
const variants = {
  ...Object.fromEntries(
    Object.entries(animationParts).map(([id, p]) => [id, p]),
  ),
  ...Object.fromEntries(
    Object.entries(animationViews).flatMap(([view, parts]) =>
      Object.entries(parts).map(([id, p]) => [view + "-" + id, p]),
    ),
  ),
};
for (const [id, part] of Object.entries(variants)) {
  const r = part.sourceRect,
    c = createCanvas(r.width, r.height);
  c.getContext("2d").drawImage(
    packed,
    r.x,
    r.y,
    r.width,
    r.height,
    0,
    0,
    r.width,
    r.height,
  );
  await writeFile(resolve(out, "parts", id + ".png"), c.toBuffer("image/png"));
}
const manifest = {
  version: 6,
  source: "duck-rig-packed-v6.png",
  viewSourceOffsetY: VIEWS_ATLAS_OFFSET,
  canvas: [512, 600],
  baseline: 560,
  anatomy: "right mechanical arm, left mechanical shin",
  parts: animationParts,
  views: animationViews,
  animations: {},
};
for (const [type, count, samples, duration] of [
  ["run", 6, 36, 720],
  ["idle", 4, 48, 2400],
  ["jump", 6, 66, 1320],
]) {
  const gif = GIFEncoder(),
    motionGif = type === "run" ? GIFEncoder() : null;
  const atlas = createCanvas(512 * 6, 600 * Math.ceil(samples / 6));
  const montage = createCanvas(
    256 * 6,
    300 * Math.ceil((type === "idle" ? 8 : 24) / 6),
  );
  const n = type === "idle" ? 8 : 24;
  manifest.animations[type] = {
    durationMs: duration,
    keyframes: count,
    samples: [],
  };
  for (let i = 0; i < samples; i++) {
    const frame = (i / samples) * count,
      c = createCanvas(512, 600),
      ctx = c.getContext("2d");
    drawAnimationFrame(ctx, packed, type, frame);
    atlas.getContext("2d").drawImage(c, (i % 6) * 512, Math.floor(i / 6) * 600);
    manifest.animations[type].samples.push({
      timeMs: (i / samples) * duration,
      frame,
      pose: getRigPose(type, frame),
      drawPlan: getRigDrawPlan(type, frame),
    });
    const preview = createCanvas(384, 450),
      pc = preview.getContext("2d");
    pc.fillStyle = "#f4f1e8";
    pc.fillRect(0, 0, 384, 450);
    pc.scale(0.75, 0.75);
    pc.strokeStyle = "#9da58f";
    pc.beginPath();
    pc.moveTo(0, 560);
    pc.lineTo(512, 560);
    pc.stroke();
    pc.drawImage(c, 0, 0);
    const rgba = pc.getImageData(0, 0, 384, 450).data,
      palette = quantize(rgba, 256);
    gif.writeFrame(applyPalette(rgba, palette), 384, 450, {
      palette,
      delay: duration / samples,
      repeat: 0,
    });
    if (motionGif) {
      // Matched ground translation makes planted feet stationary in world space.
      pc.strokeStyle = "#a4ad99";
      pc.lineWidth = 2;
      const shift = ((i / samples) * (98 / 0.29)) % 80;
      for (let x = -shift; x < 512; x += 80) {
        pc.beginPath();
        pc.moveTo(x, 560);
        pc.lineTo(x - 12, 580);
        pc.stroke();
      }
      const d = pc.getImageData(0, 0, 384, 450).data,
        p = quantize(d, 256);
      motionGif.writeFrame(applyPalette(d, p), 384, 450, {
        palette: p,
        delay: duration / samples,
        repeat: 0,
      });
    }
  }
  for (let i = 0; i < n; i++) {
    const c = createCanvas(512, 600),
      ctx = c.getContext("2d");
    ctx.fillStyle = "#f4f1e8";
    ctx.fillRect(0, 0, 512, 600);
    drawAnimationFrame(ctx, packed, type, (i / n) * count);
    ctx.fillStyle = "#333";
    ctx.font = "18px sans-serif";
    ctx.fillText(`${type} ${i + 1}/${n}`, 20, 25);
    montage
      .getContext("2d")
      .drawImage(c, (i % 6) * 256, Math.floor(i / 6) * 300, 256, 300);
  }
  gif.finish();
  await writeFile(resolve(out, `${type}-loop-v6.gif`), gif.bytes());
  if (motionGif) {
    motionGif.finish();
    await writeFile(
      resolve(out, `${type}-ground-loop-v6.gif`),
      motionGif.bytes(),
    );
  }
  await writeFile(
    resolve(out, `${type}-samples-v6.png`),
    atlas.toBuffer("image/png"),
  );
  await writeFile(
    resolve(out, `${type}-montage-v6.png`),
    montage.toBuffer("image/png"),
  );
  const keyAtlas = createCanvas(512 * (type === "idle" ? 2 : 3), 1200);
  for (let f = 0; f < count; f++) {
    const ctx = keyAtlas.getContext("2d");
    ctx.save();
    ctx.translate(
      (f % (type === "idle" ? 2 : 3)) * 512,
      Math.floor(f / (type === "idle" ? 2 : 3)) * 600,
    );
    drawAnimationFrame(ctx, packed, type, f);
    ctx.restore();
  }
  await writeFile(
    resolve(out, `${type}-keys-v6.png`),
    keyAtlas.toBuffer("image/png"),
  );
  const study = createCanvas(512 * 4, 600 * 3);
  for (let s = 0; s < 12; s++) {
    const c = study.getContext("2d");
    c.save();
    c.translate((s % 4) * 512, Math.floor(s / 4) * 600);
    drawAnimationStudy(c, packed, type, 0, s);
    c.restore();
  }
  await writeFile(
    resolve(out, `${type}-drawing-stages-v6.png`),
    study.toBuffer("image/png"),
  );
  console.log(
    `${type}: ${samples} rendered poses, loop + atlas + teaching stages`,
  );
}
await writeFile(
  resolve(out, "duck-rig-v6.json"),
  JSON.stringify(manifest, null, 2),
);
await mkdir(resolve(out, "source"), { recursive: true });
for (const file of [
  "animationRig.js",
  "animationParts.js",
  "animationViews.js",
  "animation.js",
])
  await copyFile("src/data/" + file, resolve(out, "source", file));
await mkdir(resolve(out, "archive-v4"), { recursive: true });
await mkdir(resolve(out, "archive-front-prototype"), { recursive: true });
for (const type of ["run", "idle", "jump"]) {
  await copyFile(
    `public/assets/duck-profile-${type}-v4.png`,
    resolve(out, "archive-v4", `${type}-v4.png`),
  );
  await copyFile(
    `public/assets/duck-${type}-frames.png`,
    resolve(out, "archive-front-prototype", `${type}-prototype.png`),
  );
}
await mkdir(resolve(out, "archive-v5"), { recursive: true });
for (const file of [
  "animationRig.js",
  "animationParts.js",
  "animationSheets.js",
])
  await writeFile(
    resolve(out, "archive-v5", file),
    execFileSync("git", ["show", `81ffc2d:src/data/${file}`]),
  );
await copyFile(
  "public/assets/duck-profile-parts-v5.png",
  resolve(out, "archive-v5", "duck-profile-parts-v5.png"),
);
await writeFile(
  resolve(out, "README.txt"),
  `РИГИ КИБЕР-УТЁНКА · 31.10.2026\n\nАктуальная версия: v6. Открой preview.html для GIF движения.\nrun: 36 промежуточных поз, 720ms; idle:48/2400ms; jump:66/1320ms.\n*-keys-v6.png: учебные ключи, не полный плавный цикл.\n*-samples-v6.png: все промежуточные кадры, сетка 6 столбцов, ячейка512x600; строки слева направо сверху вниз.\nparts/: отдельные прозрачные детали PNG.\nduck-rig-v6.json: анатомия, якоря, слои, координаты и матрицы каждой фазы. Все sourceRect относятся к duck-rig-packed-v6.png; дополнительные ракурсы стоят ниже на1100px.\nsource/: JS определения костей, кинематики и частей. Это переносимый набор PNG+JSON+JS, не проект Spine/Live2D.\narchive-v5/: предыдущий риг из частей; archive-v4/: предыдущие боковые спрайты; archive-front-prototype/: отклонённые фронтальные прототипы. Архивы не используются в новой версии.\nПравая рука механическая, левая голень механическая. Стойка3/4, бег и прыжок строго боковые. Все кадры вправо без зеркального отражения.\nРастровые части созданы с помощью image_gen; вторичное движение волос и ткани отдельно пока не задано.\n`,
);
await writeFile(
  resolve(out, "preview.html"),
  `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Риги утёнка v6</title><style>body{background:#f4f1e8;color:#282c27;font:18px system-ui;margin:32px}main{display:flex;flex-wrap:wrap;gap:24px}figure{margin:0}img{width:320px;max-width:100%}a{color:#326546}figcaption{padding:12px}</style><h1>Движение утёнка · v6</h1><p>Стойка в три четверти. Бег и прыжок в боковой плоскости.</p><main>${[
    ["idle", "Стойка"],
    ["run", "Бег"],
    ["jump", "Прыжок"],
    ["run-ground", "Бег · разметка земли"],
  ]
    .map(
      ([id, name]) =>
        `<figure><img src="${id}-loop-v6.gif" alt="${name}"><figcaption>${name}</figcaption></figure>`,
    )
    .join(
      "",
    )}</main><p><a href="duck-rig-v6.json">Данные рига</a> · <a href="parts/">Отдельные части</a> · <a href="README.txt">Состав пакета</a></p></html>`,
);
console.log(out);
