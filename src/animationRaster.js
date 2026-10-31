import { animationSheets } from "./data/animationSheets.js";
import {
  animationParts,
  getRigDrawPlan,
  getRigPose,
  RIG_CANVAS,
} from "./data/animationRig.js";
const images = new Map();
const studyAssets = new WeakMap();
function getStudyAssets(image, type, frame) {
  let cache = studyAssets.get(image);
  if (!cache) {
    const source = document.createElement("canvas");
    source.width = image.naturalWidth || image.width;
    source.height = image.naturalHeight || image.height;
    const c = source.getContext("2d");
    c.drawImage(image, 0, 0);
    const pixels = c.getImageData(0, 0, source.width, source.height),
      data = pixels.data;
    const visited = new Set();
    for (const part of Object.values(animationParts)) {
      const r = part.sourceRect;
      const rectKey = JSON.stringify(r);
      if (visited.has(rectKey)) continue;
      visited.add(rectKey);
      for (
        let y = Math.max(0, r.y);
        y < Math.min(source.height, r.y + r.height);
        y++
      )
        for (
          let x = Math.max(0, r.x);
          x < Math.min(source.width, r.x + r.width);
          x++
        ) {
          const i = (y * source.width + x) * 4;
          if (data[i + 3] < 32) continue;
          const red = data[i],
            green = data[i + 1],
            blue = data[i + 2],
            hi = Math.max(red, green, blue),
            lo = Math.min(red, green, blue);
          let color;
          if (hi < 32) color = [31, 29, 34];
          else if (red > green * 1.35 && blue > green * 1.18)
            color = [184, 25, 78];
          else if (green > red * 1.25 && blue > red * 1.25)
            color = [4, 174, 206];
          else if (red > green * 1.45 && green > blue * 1.25 && red > 100)
            color = [230, 119, 24];
          else if (part.id === "head" && hi < 110) color = [31, 29, 34];
          else if (
            part.id === "torso" &&
            x < part.bbox.x + part.bbox.width * 0.3 &&
            y > part.bbox.y + part.bbox.height * 0.44 &&
            y < part.bbox.y + part.bbox.height * 0.82
          )
            color = [239, 198, 157];
          else if (part.id === "torso")
            color = hi > 150 && hi - lo < 70 ? [236, 224, 203] : [53, 49, 56];
          else if (part.id.includes("Shoe"))
            color = hi > 145 ? [235, 222, 194] : [48, 46, 53];
          else if (
            part.mechanical ||
            (part.id === "head" && y > part.bbox.y + part.bbox.height * 0.79)
          )
            color = [91, 94, 100];
          else if (["rightThigh", "rightShin"].includes(part.id))
            color = [53, 49, 56];
          else if (
            part.id === "leftThigh" &&
            y < part.bbox.y + part.bbox.height * 0.65
          )
            color = [53, 49, 56];
          else if (
            part.id === "leftForearm" &&
            y > part.bbox.y + part.bbox.height * 0.48 &&
            hi < 150
          )
            color = [48, 46, 53];
          else
            color =
              hi > 225 && hi - lo < 28 ? [242, 235, 220] : [239, 198, 157];
          data[i] = color[0];
          data[i + 1] = color[1];
          data[i + 2] = color[2];
        }
    }
    c.putImageData(pixels, 0, 0);
    cache = { source, frames: new Map() };
    studyAssets.set(image, cache);
  }
  const key = `${type}:${frame}`;
  if (!cache.frames.has(key)) {
    const flat = document.createElement("canvas");
    flat.width = 512;
    flat.height = 600;
    const c = flat.getContext("2d");
    drawAnimationFrame(c, cache.source, type, frame);
    const line = document.createElement("canvas");
    line.width = 512;
    line.height = 600;
    const lc = line.getContext("2d"),
      work = document.createElement("canvas"),
      raw = document.createElement("canvas");
    work.width = raw.width = 512;
    work.height = raw.height = 600;
    const wc = work.getContext("2d"),
      rc = raw.getContext("2d");
    for (const item of getRigDrawPlan(type, frame)) {
      const r = animationParts[item.id].sourceRect;
      for (const [ctx, source] of [
        [wc, cache.source],
        [rc, image],
      ]) {
        ctx.clearRect(0, 0, 512, 600);
        ctx.save();
        ctx.transform(...item.matrix);
        ctx.drawImage(
          source,
          r.x,
          r.y,
          r.width,
          r.height,
          r.x,
          r.y,
          r.width,
          r.height,
        );
        ctx.restore();
      }
      const d = wc.getImageData(0, 0, 512, 600).data,
        rd = rc.getImageData(0, 0, 512, 600).data,
        ink = lc.createImageData(512, 600),
        o = ink.data;
      for (let y = 1; y < 599; y++)
        for (let x = 1; x < 511; x++) {
          const i = (y * 512 + x) * 4;
          if (d[i + 3] < 64) continue;
          let edge = false;
          for (const j of [i - 4, i + 4, i - 2048, i + 2048]) {
            if (d[j + 3] < 64) {
              edge = true;
              break;
            }
          }
          // Keep broad facial ink, filtering isolated texture flecks. Costume
          // seams are drawn deliberately below instead of edge-detecting paint.
          if (item.id === "head") {
            let dark = 0;
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) {
                const j = i + (dy * 512 + dx) * 4;
                if (
                  rd[j + 3] > 128 &&
                  Math.max(rd[j], rd[j + 1], rd[j + 2]) < 105
                )
                  dark++;
              }
            edge ||= dark >= 6;
          }
          o[i] = edge ? 42 : 255;
          o[i + 1] = edge ? 39 : 255;
          o[i + 2] = edge ? 44 : 255;
          o[i + 3] = 255;
        }
      wc.putImageData(ink, 0, 0);
      lc.drawImage(work, 0, 0);
    }
    drawCostumeGuides(lc, type, frame);
    cache.frames.set(key, { flat, line });
  }
  return cache.frames.get(key);
}
export function loadAnimationImage(type) {
  const sheet = animationSheets[type];
  if (!sheet) throw new TypeError("Unknown animation");
  if (!images.has(sheet.src))
    images.set(
      sheet.src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => {
          images.delete(sheet.src);
          reject(new Error("Could not load character parts"));
        };
        image.src = sheet.src;
      }),
    );
  return images.get(sheet.src);
}
export function drawAnimationFrame(
  context,
  image,
  type,
  frame,
  { opacity = 1, offsetX = 0, offsetY = 0 } = {},
) {
  context.save();
  context.globalAlpha *= opacity;
  context.translate(offsetX, offsetY);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  for (const item of getRigDrawPlan(type, frame)) {
    const r = animationParts[item.id].sourceRect;
    context.save();
    context.transform(...item.matrix);
    context.drawImage(
      image,
      r.x,
      r.y,
      r.width,
      r.height,
      r.x,
      r.y,
      r.width,
      r.height,
    );
    context.restore();
  }
  context.restore();
}
function stroke(context, points, color, width = 3, dash = []) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.setLineDash(dash);
  context.beginPath();
  points.forEach(([x, y], i) =>
    i ? context.lineTo(x, y) : context.moveTo(x, y),
  );
  context.stroke();
  context.restore();
}
function circle(context, point, r, color, fill = false) {
  context.save();
  context.beginPath();
  context.arc(...point, r, 0, Math.PI * 2);
  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineWidth = 2;
  fill ? context.fill() : context.stroke();
  context.restore();
}
function label(context, text, x, y, color = "#435044") {
  context.save();
  context.font = "12px Arial";
  context.fillStyle = color;
  context.fillText(text, x, y);
  context.restore();
}
function limb(context, points, color, volumes = false) {
  if (volumes) stroke(context, points, color + "44", 22);
  stroke(context, points, color, 3);
  points.forEach((p) => circle(context, p, 5, color, true));
}
export function drawAnimationStudy(context, image, type, frame, step) {
  const p = getRigPose(type, frame),
    near = "#ba6540",
    far = "#298b9b",
    robot = "#b62a67",
    organic = "#587c48";
  stroke(
    context,
    [
      [24, 560],
      [488, 560],
    ],
    "#97a38e",
    2,
  );
  label(context, "Неподвижная земля", 28, 582);
  stroke(
    context,
    [
      [256, 85],
      [256, 560],
    ],
    "#a9b1a1",
    1,
    [5, 5],
  );
  if (step === 0) {
    for (const [name, y] of [
      ["Верх головы", p.neck[1] - 123],
      ["Плечи", p.nearShoulder[1]],
      ["Таз", p.root[1]],
      ["Опора", 560],
    ]) {
      stroke(
        context,
        [
          [155, y],
          [355, y],
        ],
        "#869c80",
        1,
        [4, 4],
      );
      label(context, name, 30, y + 4);
    }
    return;
  }
  if (step <= 6) {
    stroke(
      context,
      [p.root, p.neck, [p.neck[0] + 8, p.neck[1] - 80]],
      "#7b8875",
      4,
    );
    circle(context, [p.neck[0] + 4, p.neck[1] - 69], 47, "#75856d");
    circle(context, p.root, 17, "#75856d");
    stroke(
      context,
      [
        [p.neck[0] + 32, p.neck[1] - 55],
        [p.neck[0] + 62, p.neck[1] - 35],
        [p.neck[0] + 28, p.neck[1] - 36],
      ],
      "#75856d",
      2,
    );
    if (step >= 2)
      limb(
        context,
        [p.rightLeg.hip, p.rightLeg.knee, p.rightLeg.ankle],
        near,
        step === 6,
      );
    if (step >= 3)
      limb(
        context,
        [p.leftLeg.hip, p.leftLeg.knee, p.leftLeg.ankle],
        far,
        step === 6,
      );
    if (step >= 4)
      limb(
        context,
        [p.nearShoulder, p.nearElbow, p.nearWrist],
        robot,
        step === 6,
      );
    if (step >= 5)
      limb(
        context,
        [p.farShoulder, p.farElbow, p.farWrist],
        organic,
        step === 6,
      );
    const plan = getRigDrawPlan(type, frame);
    for (const [id, minimum, color] of [
      ["rightShoe", 2, near],
      ["leftShoe", 3, far],
    ])
      if (step >= minimum) {
        const b = animationParts[id].bbox,
          [a, c, d, e, tx, ty] = plan.find((item) => item.id === id).matrix;
        const transform = ([x, y]) => [a * x + d * y + tx, c * x + e * y + ty];
        stroke(
          context,
          [
            [b.x + b.width * 0.12, b.y + b.height * 0.9],
            [b.x + b.width * 0.92, b.y + b.height * 0.9],
          ].map(transform),
          color,
          4,
        );
      }
    if (step === 6) {
      context.save();
      context.fillStyle = "#73866c33";
      context.beginPath();
      context.ellipse(
        p.root[0] - 3,
        p.root[1] - 45,
        45,
        75,
        (p.lean * Math.PI) / 180,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();
    }
    label(context, "Ближняя: правая рука — протез", 24, 32, robot);
    label(context, "Дальняя: левая нога — протез", 24, 52, far);
    return;
  }
  if (step === 7) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 600;
    const c = canvas.getContext("2d");
    drawAnimationFrame(c, image, type, frame);
    c.globalCompositeOperation = "source-in";
    c.fillStyle = "#414641";
    c.fillRect(0, 0, 512, 600);
    context.drawImage(canvas, 0, 0);
    return;
  }
  if (step === 8 || step === 9) {
    const assets = getStudyAssets(image, type, frame);
    context.drawImage(step === 8 ? assets.line : assets.flat, 0, 0);
    if (step === 8) {
      circle(context, p.nearWrist, 15, robot);
      circle(context, p.leftLeg.knee, 15, far);
      label(context, "Контур и постоянные стороны протезов", 24, 595);
    } else {
      label(context, "Плоские заливки — без теней и фактуры", 24, 595);
      [
        "#efc69d",
        "#e67718",
        "#b8194e",
        "#ece0cb",
        "#353138",
        "#5b5e64",
        "#04aece",
      ].forEach((color, i) => {
        context.fillStyle = color;
        context.fillRect(270 + i * 29, 570, 22, 16);
      });
    }
    return;
  }
  context.save();
  drawAnimationFrame(context, image, type, frame);
  context.restore();
  if (step === 8) {
    circle(context, p.nearWrist, 17, robot);
    circle(context, p.leftLeg.knee, 17, far);
    label(context, "Проверь протезы на тех же сторонах", 24, 32, robot);
  }
  if (step === 10) {
    label(context, "Свет сверху слева", 24, 595);
    stroke(
      context,
      [
        [50, 50],
        [90, 90],
      ],
      "#ac8e53",
      2,
    );
  }
}
export async function exportAnimationAtlas(type) {
  const sheet = animationSheets[type],
    image = await loadAnimationImage(type),
    canvas = document.createElement("canvas");
  canvas.width = RIG_CANVAS.width * sheet.columns;
  canvas.height = RIG_CANVAS.height * sheet.rows;
  const context = canvas.getContext("2d");
  sheet.frames.forEach((_, frame) =>
    drawAnimationFrame(context, image, type, frame, {
      offsetX: (frame % sheet.columns) * 512,
      offsetY: Math.floor(frame / sheet.columns) * 600,
    }),
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("PNG export failed"))),
      "image/png",
    ),
  );
}

function drawCostumeGuides(context, type, frame) {
  for (const item of getRigDrawPlan(type, frame)) {
    const part = animationParts[item.id],
      b = part.bbox;
    const local = (points) =>
      points.map(([x, y]) => [b.x + x * b.width, b.y + y * b.height]);
    context.save();
    context.transform(...item.matrix);
    context.strokeStyle = "#3c3842";
    context.lineWidth = 4;
    context.lineJoin = "round";
    context.lineCap = "round";
    const path = (points) => {
      context.beginPath();
      local(points).forEach(([x, y], i) =>
        i ? context.lineTo(x, y) : context.moveTo(x, y),
      );
      context.stroke();
    };
    if (item.id === "torso") {
      path([
        [0.48, 0.22],
        [0.59, 0.38],
        [0.54, 0.58],
      ]);
      path([
        [0.3, 0.64],
        [0.86, 0.65],
      ]);
      context.strokeRect(
        b.x + b.width * 0.62,
        b.y + b.height * 0.64,
        b.width * 0.15,
        b.height * 0.1,
      );
    }
    if (item.id === "rightForearm") {
      path([
        [0.25, 0.2],
        [0.51, 0.18],
        [0.68, 0.43],
        [0.43, 0.49],
        [0.25, 0.2],
      ]);
      path([
        [0.29, 0.57],
        [0.77, 0.57],
      ]);
      context.strokeRect(
        b.x + b.width * 0.4,
        b.y + b.height * 0.28,
        b.width * 0.14,
        b.height * 0.16,
      );
    }
    if (item.id === "leftShin") {
      path([
        [0.28, 0.27],
        [0.63, 0.31],
        [0.79, 0.7],
        [0.47, 0.75],
        [0.28, 0.27],
      ]);
      circle(context, part.parent, b.width * 0.24, "#3c3842");
      circle(context, part.child, b.width * 0.16, "#3c3842");
      path([
        [0.42, 0.38],
        [0.57, 0.4],
        [0.69, 0.66],
      ]);
    }
    if (item.id === "rightThigh" || item.id === "rightShin") {
      path([
        [0.27, 0.28],
        [0.64, 0.41],
        [0.4, 0.55],
      ]);
      path([
        [0.75, 0.64],
        [0.38, 0.76],
      ]);
    }
    if (item.id === "leftThigh")
      path([
        [0.18, 0.66],
        [0.57, 0.8],
        [0.85, 0.65],
      ]);
    if (item.id === "leftForearm")
      path([
        [0.3, 0.49],
        [0.77, 0.56],
      ]);
    if (item.id.includes("Shoe")) {
      path([
        [0.1, 0.78],
        [0.48, 0.84],
        [0.9, 0.79],
      ]);
      path([
        [0.38, 0.36],
        [0.62, 0.5],
        [0.4, 0.5],
        [0.67, 0.6],
        [0.45, 0.62],
      ]);
    }
    context.restore();
  }
}
