import { animationParts } from "./animationParts.js";
export const VIEWS_SOURCE = "/assets/duck-rig-views-v6.png";
export const VIEWS_SIZE = [1402, 1122];
export const VIEWS_ATLAS_OFFSET = 1100;
const rect = (x, y, width, height) => ({ x, y, width, height });
export const animationViews = {
  idle: {
    head: {
      ...animationParts.head,
      source: "views",
      sourceRect: rect(137, 33, 513, 533),
      bbox: rect(139, 35, 509, 529),
      anchor: [425, 560],
      scale: 0.25,
    },
    torso: {
      ...animationParts.torso,
      source: "views",
      sourceRect: rect(809, 36, 451, 558),
      bbox: rect(811, 38, 447, 554),
      anchor: [1090, 462],
      shoulderNear: [925, 198],
      shoulderFar: [1170, 210],
      neck: [1045, 94],
      scale: 0.23,
    },
  },
  side: {
    head: {
      ...animationParts.head,
      source: "views",
      sourceRect: rect(138, 594, 538, 508),
      bbox: rect(140, 596, 534, 504),
      anchor: [440, 1099],
      scale: 0.26,
    },
    torso: {
      ...animationParts.torso,
      source: "views",
      sourceRect: rect(867, 592, 348, 501),
      bbox: rect(869, 592, 344, 499),
      anchor: [1100, 1000],
      shoulderNear: [1035, 720],
      shoulderFar: [1055, 718],
      neck: [1070, 635],
      scale: 0.23,
    },
  },
};
export function getAnimationPart(type, id) {
  return (
    animationViews[type === "idle" ? "idle" : "side"][id] || animationParts[id]
  );
}
// Both source sheets are packed into one runtime canvas, without changing any art.
for (const view of Object.values(animationViews))
  for (const part of Object.values(view)) {
    part.sourceRect.y += VIEWS_ATLAS_OFFSET;
    part.bbox.y += VIEWS_ATLAS_OFFSET;
    for (const key of ["anchor", "shoulderNear", "shoulderFar", "neck"])
      if (part[key])
        part[key] = [part[key][0], part[key][1] + VIEWS_ATLAS_OFFSET];
  }
