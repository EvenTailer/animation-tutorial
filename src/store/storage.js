import { COURSE_COUNTS, ANIMATION_COUNTS } from "../routing/paths.js";

export const STORAGE_KEY = "gramilya-state-v1";
export const STORAGE_VERSION = 1;
export const BACKUP_VERSION = 4;
export const CONTENT_REVISION = 5;

const themes = new Set(["paper", "light", "dark"]);
const devices = new Set(["ipad", "samsung", "huawei"]);
const characters = Object.keys(COURSE_COUNTS);
// Original-art tutorials use new IDs. Old profile and numeric marks stay archived.
const previousDrawingCounts = Object.freeze({ duck: 60, boss: 36 });
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
  const match = /^(duck|boss):(duck|boss)-original-v5-([1-9]\d{0,2})$/.exec(
    key,
  );
  if (!match || match[1] !== match[2]) return false;
  const stepNumber = Number(match[3]);
  return stepNumber >= 1 && stepNumber <= COURSE_COUNTS[match[1]];
}

function isPreviousDrawingKey(key) {
  if (typeof key !== "string") return false;
  const profile = /^(duck|boss):(duck|boss)-profile-v4-([1-9]\d{0,2})$/.exec(
    key,
  );
  if (profile)
    return (
      profile[1] === profile[2] &&
      Number(profile[3]) <= previousDrawingCounts[profile[1]]
    );
  const match = /^(duck|boss):(duck|boss)-(\d{1,6})$/.exec(key);
  if (!match || match[1] !== match[2]) return false;
  const step = Number(match[3]);
  const count = previousDrawingCounts[match[1]];
  return (step >= 1 && step <= count) || (step >= 101 && step < 101 + count);
}

export function isAnimationKey(key) {
  if (typeof key !== "string") return false;
  const match = /^(idle|run|jump|hit):(0|[1-9]\d{0,3})$/.exec(key);
  return !!match && Number(match[2]) < ANIMATION_COUNTS[match[1]];
}

export function isAnimationDrawingKey(key) {
  if (typeof key !== "string") return false;
  const match = /^(idle|run|jump):(0|[1-9]\d{0,3}):(0|[1-9]\d?)$/.exec(key);
  return (
    !!match &&
    Number(match[2]) < ANIMATION_COUNTS[match[1]] &&
    Number(match[3]) < 12
  );
}

function isPreviousAnimationKey(key) {
  if (typeof key !== "string") return false;
  const previousCounts = { idle: 4, run: 8, jump: 6, hit: 6 };
  const match = /^(idle|run|jump|hit):(0|[1-9]\d{0,3})$/.exec(key);
  return !!match && Number(match[2]) < previousCounts[match[1]];
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
 * constraints: {lessonIds, drawingKeys, animationKeys, animationDrawingKeys, characterStepCounts}
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
  const sameRevision = input.contentRevision === CONTENT_REVISION;
  return {
    contentRevision: CONTENT_REVISION,
    lessons: [
      ...new Set(
        Array.isArray(input.lessons) ? input.lessons.filter(validLesson) : [],
      ),
    ],
    drawing: trueMap(input.drawing, isDrawingKey, constraints.drawingKeys),
    cursors,
    lessonCursors: Object.fromEntries(
      Object.entries(
        isRecord(input.lessonCursors) ? input.lessonCursors : {},
      ).filter(
        ([id, index]) =>
          validLesson(id) && Number.isSafeInteger(index) && index >= 0,
      ),
    ),
    animation: trueMap(
      sameRevision ? input.animation : {},
      isAnimationKey,
      constraints.animationKeys,
    ),
    animationDrawing: trueMap(
      sameRevision ? input.animationDrawing : {},
      isAnimationDrawingKey,
      constraints.animationDrawingKeys,
    ),
    // Previous profile/numeric marks keep their original keys. Their old bounds
    // are independent of the larger current original-art tutorials.
    legacyDrawing: {
      ...trueMap(input.legacyDrawing, isPreviousDrawingKey),
      ...trueMap(input.drawing, isPreviousDrawingKey),
    },
    // Animation kept the same frame keys, so only an explicit revision makes
    // those keys current. Unversioned earlier marks are archived once.
    legacyAnimation: {
      ...trueMap(input.legacyAnimation, isPreviousAnimationKey),
      ...trueMap(sameRevision ? {} : input.animation, isPreviousAnimationKey),
    },
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
