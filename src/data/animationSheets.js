import { PARTS_SOURCE, PARTS_SIZE, RIG_CANVAS } from "./animationRig.js";
export const animationSheets = Object.fromEntries(
  [
    ["idle", 4, "Ожидание"],
    ["run", 6, "Бег"],
    ["jump", 6, "Прыжок"],
  ].map(([type, count, title]) => [
    type,
    {
      src: PARTS_SOURCE,
      sourceSize: PARTS_SIZE,
      columns: type === "idle" ? 2 : 3,
      rows: 2,
      title: `${title} · ${type === "idle" ? "стойка в три четверти" : "вид сбоку"}`,
      output: RIG_CANVAS,
      frames: Array.from({ length: count }, (_, frame) => ({ frame })),
    },
  ]),
);
