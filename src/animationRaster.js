import { animationSheets } from "./data/animationSheets.js";

const images = new Map();
function selectSheet(type) {
  const sheet = animationSheets[type];
  if (!sheet) throw new TypeError("Unknown animation");
  return sheet;
}
export function loadAnimationImage(type) {
  const sheet = selectSheet(type);
  if (!images.has(sheet.src)) {
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        if (
          image.naturalWidth !== sheet.sourceSize[0] ||
          image.naturalHeight !== sheet.sourceSize[1]
        ) {
          images.delete(sheet.src);
          reject(
            new Error(
              "Animation sheet dimensions do not match the source rectangles",
            ),
          );
        } else resolve(image);
      };
      image.onerror = () => {
        images.delete(sheet.src);
        reject(new Error("Animation sheet could not be loaded"));
      };
      image.src = sheet.src;
    });
    images.set(sheet.src, promise);
  }
  return images.get(sheet.src);
}

// Pure placement shared by the live player, exported PNG, and content audit.
export function getAnimationPlacement(type, frame) {
  const sheet = selectSheet(type);
  const index =
    ((Math.floor(Number.isFinite(frame) ? frame : 0) % sheet.frames.length) +
      sheet.frames.length) %
    sheet.frames.length;
  const pose = sheet.frames[index],
    source = pose.sourceRect;
  const x = sheet.output.anchorX + (source.x - pose.anchor.x) * sheet.scale;
  const y =
    sheet.output.baseline -
    pose.lift +
    (source.y - pose.anchor.y) * sheet.scale;
  return {
    index,
    source,
    destination: {
      x,
      y,
      width: source.width * sheet.scale,
      height: source.height * sheet.scale,
    },
  };
}

export function drawAnimationFrame(
  context,
  image,
  type,
  frame,
  { opacity = 1, offsetX = 0, offsetY = 0 } = {},
) {
  const { source: s, destination: d } = getAnimationPlacement(type, frame);
  context.save();
  context.globalAlpha *= opacity;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    s.x,
    s.y,
    s.width,
    s.height,
    d.x + offsetX,
    d.y + offsetY,
    d.width,
    d.height,
  );
  context.restore();
}

// Exports precisely the same aligned frames displayed in CharacterAnimation.
export async function exportAnimationAtlas(type) {
  const sheet = selectSheet(type),
    image = await loadAnimationImage(type);
  const canvas = document.createElement("canvas");
  canvas.width = sheet.output.width * sheet.columns;
  canvas.height = sheet.output.height * sheet.rows;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  sheet.frames.forEach((_, frame) =>
    drawAnimationFrame(context, image, type, frame, {
      offsetX: (frame % sheet.columns) * sheet.output.width,
      offsetY: Math.floor(frame / sheet.columns) * sheet.output.height,
    }),
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    ),
  );
}
