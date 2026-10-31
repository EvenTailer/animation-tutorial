export const COURSE_COUNTS = Object.freeze({ duck: 84, boss: 96 });
export const ANIMATION_COUNTS = Object.freeze({
  idle: 4,
  run: 6,
  jump: 6,
  hit: 6,
});

function requireIndex(index, count) {
  if (!Number.isInteger(index) || index < 0 || index >= count)
    throw new RangeError("Invalid zero-based route index");
  return index + 1;
}
export function drawPath(character = "duck", index = 0) {
  if (!Object.hasOwn(COURSE_COUNTS, character))
    throw new TypeError("Unknown character");
  return `/draw/${character}/${requireIndex(index, COURSE_COUNTS[character])}`;
}
export function animationPath(type = "idle", index = 0) {
  if (!Object.hasOwn(ANIMATION_COUNTS, type))
    throw new TypeError("Unknown animation");
  return `/animation/${type}/${requireIndex(index, ANIMATION_COUNTS[type])}`;
}
export function lessonPath(id = "w1-l1") {
  if (typeof id !== "string" || !/^w(?:[1-9]|10)-l[1-3]$/.test(id))
    throw new TypeError("Unknown lesson");
  return `/lesson/${id}`;
}
