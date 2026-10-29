export const STORAGE_KEY = "gramilya-state-v1";
export const STORAGE_VERSION = 1;
export const BACKUP_VERSION = 4;

const themes = new Set(["paper", "light", "dark"]);
const devices = new Set(["ipad", "samsung", "huawei"]);
const characters = Object.keys(COURSE_COUNTS);
// The microstep course deliberately started a new ID namespace after v1 stages.
const firstDrawingStep = 101;
const forbiddenKeys = new Set(["__proto__", "constructor", "prototype"]);
const lessonPattern = /^w(?:[1-9]|10)-l[1-3]$/;

export function isRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function allowlist(values) {
  return values instanceof Set
    ? values
    : Array.isArray(values)
      ? new Set(values)
      : null;
}

export function isDrawingKey(key) {
  if (typeof key !== "string") return false;
  const match = /^(duck|boss):(duck|boss)-([1-9]\d{0,5})$/.exec(key);
  if (!match || match[1] !== match[2]) return false;
  const stepNumber = Number(match[3]);
  return (
    stepNumber >= firstDrawingStep &&
    stepNumber < firstDrawingStep + COURSE_COUNTS[match[1]]
  );
}

export function isAnimationKey(key) {
  if (typeof key !== "string") return false;
  const match = /^(idle|run|jump|hit):(0|[1-9]\d{0,3})$/.exec(key);
  return !!match && Number(match[2]) < ANIMATION_COUNTS[match[1]];
}

function trueMap(value, predicate, allowed) {
  if (!isRecord(value)) return {};
  const accepted = allowlist(allowed);
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, entry]) =>
        entry === true &&
        !forbiddenKeys.has(key) &&
        predicate(key) &&
        (!accepted || accepted.has(key)),
    ),
  );
}

export function normalizeSettings(value) {
  const input = isRecord(value) ? value : {};
  return {
    theme: themes.has(input.theme) ? input.theme : "paper",
    device: devices.has(input.device) ? input.device : "ipad",
  };
}

/** Content-aware validation is optional and injected by the importer.
 * constraints: {lessonIds, drawingKeys, animationKeys, characterStepCounts}
 * The store never imports the heavy tutorial or animation modules.
 */
export function normalizeProgress(value, constraints = {}) {
  const input = isRecord(value) ? value : {};
  const lessonIds = allowlist(constraints.lessonIds);
  const validLesson = (id) =>
    typeof id === "string" &&
    lessonPattern.test(id) &&
    (!lessonIds || lessonIds.has(id));
  const cursors = {};
  for (const character of characters) {
    const supplied = isRecord(input.cursors)
      ? input.cursors[character]
      : undefined;
    const suppliedCount = constraints.characterStepCounts?.[character];
    const count =
      Number.isSafeInteger(suppliedCount) && suppliedCount > 0
        ? Math.min(suppliedCount, COURSE_COUNTS[character])
        : COURSE_COUNTS[character];
    const last = count - 1;
    cursors[character] = Number.isSafeInteger(supplied)
      ? Math.max(0, Math.min(last, supplied))
      : 0;
  }
  const fallbackLesson = lessonIds?.values().next().value || "w1-l1";
  return {
    lessons: [
      ...new Set(
        Array.isArray(input.lessons) ? input.lessons.filter(validLesson) : [],
      ),
    ],
    drawing: trueMap(input.drawing, isDrawingKey, constraints.drawingKeys),
    cursors,
    animation: trueMap(
      input.animation,
      isAnimationKey,
      constraints.animationKeys,
    ),
    // Old broad-stage marks are archival; they never become current microsteps.
    legacyDrawing: trueMap(input.legacyDrawing, (key) =>
      /^[a-z0-9][a-z0-9:_-]{0,120}$/i.test(key),
    ),
    lastLesson: validLesson(input.lastLesson)
      ? input.lastLesson
      : fallbackLesson,
  };
}

export function defaultAppState() {
  return {
    settings: normalizeSettings(),
    progress: normalizeProgress(),
    persistence: { error: false },
  };
}

/** Access to localStorage can itself throw in restricted browser contexts. */
export function resolveBrowserStorage() {
  try {
    return {
      storage: typeof localStorage === "undefined" ? null : localStorage,
      error: false,
    };
  } catch {
    return { storage: null, error: true };
  }
}

export function loadPersistedState(storage) {
  let error = false;
  const read = (key, fallback) => {
    try {
      const raw = storage?.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      error = true;
      return fallback;
    }
  };
  let unifiedExists = false;
  let unified;
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    unifiedExists = raw != null;
    if (unifiedExists) unified = JSON.parse(raw);
  } catch {
    error = true;
    // An existing corrupted unified record must not resurrect reset legacy marks.
    unifiedExists = true;
  }
  if (unifiedExists) {
    const valid = isRecord(unified) && unified.version === STORAGE_VERSION;
    return {
      settings: normalizeSettings(valid ? unified.settings : undefined),
      progress: normalizeProgress(valid ? unified.progress : undefined),
      persistence: { error: error || !valid },
    };
  }
  const theme = read("shtrih-theme", "paper");
  const device = read("shtrih-device", "ipad");
  const lessons = read("shtrih-progress", []);
  const lastLesson = read("shtrih-last-lesson", "w1-l1");
  const drawing = read("shtrih-masterclass-progress-v2", {});
  const cursors = read("shtrih-masterclass-cursor-v2", {});
  const animation = read("gramilya-animation-progress-v1", {});
  const legacyDrawing = read("shtrih-masterclass-progress-v1", {});
  return {
    settings: normalizeSettings({ theme, device }),
    progress: normalizeProgress({
      lessons,
      lastLesson,
      drawing,
      cursors,
      animation,
      legacyDrawing,
    }),
    persistence: { error },
  };
}

export function serializePersistedState(state) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    settings: normalizeSettings(state.settings),
    progress: normalizeProgress(state.progress),
  });
}

export function savePersistedState(storage, state) {
  if (!storage) return { error: false };
  try {
    storage.setItem(STORAGE_KEY, serializePersistedState(state));
    return { error: false };
  } catch {
    return { error: true };
  }
}

export function createBackup(state) {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: normalizeSettings(state.settings),
    progress: normalizeProgress(state.progress),
  };
}

export function serializeBackup(state) {
  return JSON.stringify(createBackup(state), null, 2);
}

/** Returns {settings, progress}; dispatch both explicitly after a valid import. */
export function parseBackup(source, constraints = {}) {
  let data;
  try {
    data = typeof source === "string" ? JSON.parse(source) : source;
  } catch {
    throw new Error("Файл не содержит корректный JSON.");
  }
  if (!isRecord(data) || ![1, 2, 3, BACKUP_VERSION].includes(data.version)) {
    throw new Error("Неизвестный формат резервной копии GRAMILYA.");
  }
  if (data.version === BACKUP_VERSION) {
    if (
      !isRecord(data.settings) ||
      !isRecord(data.progress) ||
      !Array.isArray(data.progress.lessons)
    ) {
      throw new Error("В резервной копии отсутствуют настройки или прогресс.");
    }
    return {
      settings: normalizeSettings(data.settings),
      progress: normalizeProgress(data.progress, constraints),
    };
  }
  if (!Array.isArray(data.completed))
    throw new Error("В резервной копии отсутствует список занятий.");
  return {
    settings: normalizeSettings({ theme: data.theme, device: data.device }),
    progress: normalizeProgress(
      {
        lessons: data.completed,
        lastLesson: data.lastLesson,
        drawing: data.version === 3 ? data.masterclassProgress : {},
        cursors: data.version === 3 ? data.masterclassCursor : {},
        animation: data.version === 3 ? data.animationProgress : {},
        legacyDrawing:
          data.version === 2
            ? data.masterclassProgress
            : data.previousDrawingProgress,
      },
      constraints,
    ),
  };
}
import { COURSE_COUNTS, ANIMATION_COUNTS } from "../routing/paths.js";
