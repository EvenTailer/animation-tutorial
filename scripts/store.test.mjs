import test from "node:test";
import { ANIMATION_COUNTS } from "../src/routing/paths.js";
import assert from "node:assert/strict";
import {
  createAppStore,
  setTheme,
  setDevice,
  toggleLesson,
  toggleDrawingStep,
  setDrawingCursor,
  toggleAnimationFrame,
  setLastLesson,
  replaceProgress,
  resetProgress,
  selectPersistenceError,
} from "../src/store/index.js";
import {
  STORAGE_KEY,
  CONTENT_REVISION,
  loadPersistedState,
  normalizeProgress,
  parseBackup,
  serializeBackup,
  resolveBrowserStorage,
} from "../src/store/storage.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    writes: [],
    fail: false,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      this.writes.push({ key, value });
      if (this.fail) throw new Error("QuotaExceededError");
      values.set(key, value);
    },
  };
}

test("all features update the same Redux state and toggles can be undone", () => {
  const app = createAppStore({ storage: null });
  app.dispatch(setTheme("dark"));
  app.dispatch(setDevice("samsung"));
  app.dispatch(toggleLesson("w3-l1"));
  app.dispatch(
    toggleDrawingStep({ character: "duck", stepId: "duck-profile-v4-1" }),
  );
  app.dispatch(setDrawingCursor({ character: "duck", index: 9 }));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: 0 }));
  app.dispatch(setLastLesson("w3-l1"));
  assert.deepEqual(app.getState().settings, {
    theme: "dark",
    device: "samsung",
  });
  assert.deepEqual(app.getState().progress, {
    contentRevision: CONTENT_REVISION,
    lessons: ["w3-l1"],
    drawing: { "duck:duck-profile-v4-1": true },
    cursors: { duck: 9, boss: 0 },
    animation: { "run:0": true },
    legacyDrawing: {},
    legacyAnimation: {},
    lastLesson: "w3-l1",
  });
  app.dispatch(toggleLesson("w3-l1"));
  app.dispatch(
    toggleDrawingStep({ character: "duck", stepId: "duck-profile-v4-1" }),
  );
  app.dispatch(toggleAnimationFrame({ type: "run", frame: 0 }));
  assert.deepEqual(app.getState().progress.lessons, []);
  assert.deepEqual(app.getState().progress.drawing, {});
  assert.deepEqual(app.getState().progress.animation, {});
});

test("migration archives previous drawing and animation marks without changing old keys", () => {
  const legacy = {
    "shtrih-theme": JSON.stringify("dark"),
    "shtrih-device": JSON.stringify("huawei"),
    "shtrih-progress": JSON.stringify(["w1-l1", "w1-l1", "not-a-lesson"]),
    "shtrih-last-lesson": JSON.stringify("w2-l3"),
    "shtrih-masterclass-progress-v2": JSON.stringify({ "duck:duck-101": true }),
    "shtrih-masterclass-cursor-v2": JSON.stringify({ duck: 4 }),
    "gramilya-animation-progress-v1": JSON.stringify({ "jump:1": true }),
    "shtrih-masterclass-progress-v1": JSON.stringify({ "duck:duck-01": true }),
    "shtrih-masterclass-cursor-v1": JSON.stringify({ duck: 2 }),
  };
  const storage = memoryStorage(legacy);
  const app = createAppStore({ storage });
  assert.deepEqual(app.getState().settings, {
    theme: "dark",
    device: "huawei",
  });
  assert.deepEqual(app.getState().progress.lessons, ["w1-l1"]);
  assert.equal(app.getState().progress.lastLesson, "w2-l3");
  assert.deepEqual(app.getState().progress.drawing, {});
  assert.equal(app.getState().progress.legacyDrawing["duck:duck-101"], true);
  assert.deepEqual(app.getState().progress.animation, {});
  assert.equal(app.getState().progress.legacyAnimation["jump:1"], true);
  assert.equal(app.getState().progress.legacyDrawing["duck:duck-01"], true);
  assert.equal(app.getState().progress.drawing["duck:duck-01"], undefined);
  assert.deepEqual(app.getState().progress.cursors, { duck: 4, boss: 0 });
  for (const [key, value] of Object.entries(legacy))
    assert.equal(storage.values.get(key), value);
  assert.equal(storage.writes.length, 1);
  assert.equal(storage.writes[0].key, STORAGE_KEY);
});

test("a reset is saved to the unified key and legacy marks do not reappear", () => {
  const storage = memoryStorage({ "shtrih-progress": '["w1-l1"]' });
  const app = createAppStore({ storage });
  app.dispatch(setTheme("dark"));
  app.dispatch(resetProgress());
  const reloaded = createAppStore({ storage });
  assert.deepEqual(reloaded.getState().progress.lessons, []);
  assert.equal(reloaded.getState().settings.theme, "dark");
  assert.equal(storage.values.get("shtrih-progress"), '["w1-l1"]');
});

test("quota failures set one error transition without recursive writes", () => {
  const storage = memoryStorage();
  storage.fail = true;
  const app = createAppStore({ storage });
  assert.equal(selectPersistenceError(app.getState()), true);
  assert.equal(storage.writes.length, 1);
  app.dispatch(toggleLesson("w1-l1"));
  assert.equal(storage.writes.length, 2);
  assert.equal(selectPersistenceError(app.getState()), true);
  app.dispatch({ type: "unrelated/action" });
  assert.equal(storage.writes.length, 2);
  storage.fail = false;
  app.dispatch(setTheme("dark"));
  assert.equal(storage.writes.length, 3);
  assert.equal(selectPersistenceError(app.getState()), false);
});

test("invalid actions, malformed arrays and maps are rejected safely", () => {
  const app = createAppStore({ storage: null });
  app.dispatch(setTheme("__proto__"));
  app.dispatch(setDevice("unknown"));
  app.dispatch(toggleLesson({ id: "w1-l1" }));
  app.dispatch(
    toggleDrawingStep({ character: "duck", stepId: "boss-profile-v4-1" }),
  );
  app.dispatch(setDrawingCursor({ character: "__proto__", index: 9 }));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: -1 }));
  assert.equal(app.getState().settings.theme, "paper");
  assert.deepEqual(app.getState().progress.lessons, []);
  assert.deepEqual(app.getState().progress.drawing, {});
  const dirty = JSON.parse(
    '{"contentRevision":4,"lessons":["w1-l1","w1-l1",2],"drawing":{"__proto__":true,"duck:duck-profile-v4-1":true,"boss:duck-profile-v4-1":true,"duck:duck-profile-v4-2":"true"},"animation":{"run:0":true,"run:-1":true},"cursors":{"duck":-9,"boss":"2"},"legacyDrawing":{"constructor":true}}',
  );
  app.dispatch(replaceProgress(dirty));
  assert.deepEqual(app.getState().progress.lessons, ["w1-l1"]);
  assert.deepEqual(app.getState().progress.drawing, {
    "duck:duck-profile-v4-1": true,
  });
  assert.deepEqual(app.getState().progress.animation, { "run:0": true });
  assert.deepEqual(app.getState().progress.cursors, { duck: 0, boss: 0 });
  assert.deepEqual(app.getState().progress.legacyDrawing, {});
  assert.equal({}.polluted, undefined);
});

test("corrupted unified storage does not fall back to obsolete legacy progress", () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: "{broken",
    "shtrih-progress": '["w1-l1"]',
  });
  const loaded = loadPersistedState(storage);
  assert.equal(loaded.persistence.error, true);
  assert.deepEqual(loaded.progress.lessons, []);
  const malformed = memoryStorage({
    "shtrih-progress": "{broken",
    "shtrih-masterclass-progress-v2": "[]",
  });
  assert.deepEqual(loadPersistedState(malformed).progress.drawing, {});
});

test("backup v4 round-trips and importer can validate against lazy content", () => {
  const app = createAppStore({ storage: null });
  app.dispatch(
    toggleDrawingStep({ character: "duck", stepId: "duck-profile-v4-1" }),
  );
  app.dispatch(toggleLesson("w1-l1"));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: 0 }));
  const restored = parseBackup(serializeBackup(app.getState()), {
    lessonIds: ["w1-l1"],
    drawingKeys: ["duck:duck-profile-v4-1"],
    animationKeys: ["run:0"],
    characterStepCounts: { duck: 60, boss: 36 },
  });
  assert.deepEqual(restored.progress, app.getState().progress);
  assert.deepEqual(restored.settings, app.getState().settings);
  const filtered = normalizeProgress(
    {
      contentRevision: CONTENT_REVISION,
      lessons: ["w1-l1", "w2-l1"],
      drawing: {
        "duck:duck-profile-v4-1": true,
        "duck:duck-profile-v4-999": true,
      },
      cursors: { duck: 999 },
      animation: { "run:999": true },
    },
    {
      lessonIds: ["w1-l1"],
      drawingKeys: ["duck:duck-profile-v4-1"],
      animationKeys: ["run:0"],
      characterStepCounts: { duck: 60 },
    },
  );
  assert.deepEqual(filtered.lessons, ["w1-l1"]);
  assert.deepEqual(filtered.drawing, { "duck:duck-profile-v4-1": true });
  assert.equal(filtered.cursors.duck, 59);
  assert.deepEqual(filtered.animation, {});
});

test("older backup versions retain old drawings as archive, not new microsteps", () => {
  const v2 = parseBackup({
    version: 2,
    completed: ["w1-l1"],
    masterclassProgress: { "duck:duck-01": true },
  });
  assert.deepEqual(v2.progress.drawing, {});
  assert.equal(v2.progress.legacyDrawing["duck:duck-01"], true);
  const v3 = parseBackup({
    version: 3,
    completed: [],
    masterclassProgress: { "duck:duck-101": true },
    previousDrawingProgress: { "boss:boss-01": true },
  });
  assert.deepEqual(v3.progress.drawing, {});
  assert.equal(v3.progress.legacyDrawing["duck:duck-101"], true);
  assert.equal(v3.progress.legacyDrawing["boss:boss-01"], true);
  assert.throws(() => parseBackup("{bad"));
  assert.throws(() => parseBackup({ version: 99, completed: [] }));
  assert.throws(() => parseBackup({ version: 4, settings: {}, progress: {} }));
});

test("store is SSR-safe, and explicit preloaded state is isolated from disk", () => {
  assert.equal(resolveBrowserStorage().storage, null);
  const app = createAppStore({
    storage: null,
    preloadedState: {
      settings: { theme: "light", device: "huawei" },
      progress: { lessons: ["w2-l1"] },
    },
  });
  assert.equal(app.getState().settings.theme, "light");
  assert.deepEqual(app.getState().progress.lessons, ["w2-l1"]);
  assert.equal(app.getState().persistence.error, false);
});

test("current cursors and progress keys stay within real drawing and animation bounds", () => {
  const app = createAppStore({ storage: null });
  app.dispatch(setDrawingCursor({ character: "duck", index: 60 }));
  app.dispatch(setDrawingCursor({ character: "boss", index: 9999 }));
  assert.deepEqual(app.getState().progress.cursors, { duck: 59, boss: 35 });
  for (const [character, validLast, invalidNext] of [
    ["duck", 60, 61],
    ["boss", 36, 37],
  ]) {
    app.dispatch(
      toggleDrawingStep({
        character,
        stepId: `${character}-profile-v4-${validLast}`,
      }),
    );
    app.dispatch(
      toggleDrawingStep({
        character,
        stepId: `${character}-profile-v4-${invalidNext}`,
      }),
    );
    app.dispatch(
      toggleDrawingStep({ character, stepId: `${character}-profile-v4-0` }),
    );
    app.dispatch(
      toggleDrawingStep({ character, stepId: `${character}-profile-v4-01` }),
    );
  }
  assert.deepEqual(app.getState().progress.drawing, {
    "duck:duck-profile-v4-60": true,
    "boss:boss-profile-v4-36": true,
  });
  for (const [type, count] of Object.entries(ANIMATION_COUNTS)) {
    app.dispatch(toggleAnimationFrame({ type, frame: count - 1 }));
    app.dispatch(toggleAnimationFrame({ type, frame: count }));
    app.dispatch(toggleAnimationFrame({ type, frame: -1 }));
  }
  assert.deepEqual(app.getState().progress.animation, {
    "idle:3": true,
    [`run:${ANIMATION_COUNTS.run - 1}`]: true,
    "jump:5": true,
    "hit:5": true,
  });
  app.dispatch(
    replaceProgress({
      contentRevision: CONTENT_REVISION,
      drawing: {
        "duck:duck-profile-v4-1": true,
        "duck:duck-profile-v4-999": true,
        "duck:duck-01": true,
      },
      animation: {
        "idle:4": true,
        [`run:${ANIMATION_COUNTS.run}`]: true,
        [`run:${ANIMATION_COUNTS.run - 1}`]: true,
      },
      cursors: { duck: 999, boss: -1 },
      legacyDrawing: { "duck:duck-01": true, "boss:boss-12": true },
    }),
  );
  assert.deepEqual(app.getState().progress.drawing, {
    "duck:duck-profile-v4-1": true,
  });
  assert.deepEqual(app.getState().progress.animation, {
    [`run:${ANIMATION_COUNTS.run - 1}`]: true,
  });
  assert.deepEqual(app.getState().progress.cursors, { duck: 59, boss: 0 });
  assert.deepEqual(app.getState().progress.legacyDrawing, {
    "duck:duck-01": true,
    "boss:boss-12": true,
  });
});

test("persisted out-of-range cursors are clamped before UI reads and bounds cannot be expanded by backup options", () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      settings: {},
      progress: {
        contentRevision: CONTENT_REVISION,
        cursors: { duck: 6000, boss: 3600 },
        animation: { "hit:6": true, "hit:5": true },
        drawing: {
          "boss:boss-profile-v4-37": true,
          "boss:boss-profile-v4-36": true,
        },
        legacyDrawing: { "duck:duck-01": true },
      },
    }),
  });
  const app = createAppStore({ storage });
  assert.deepEqual(app.getState().progress.cursors, { duck: 59, boss: 35 });
  assert.deepEqual(app.getState().progress.animation, { "hit:5": true });
  assert.deepEqual(app.getState().progress.drawing, {
    "boss:boss-profile-v4-36": true,
  });
  assert.equal(app.getState().progress.legacyDrawing["duck:duck-01"], true);
  const normalized = normalizeProgress(
    { cursors: { duck: 500 } },
    { characterStepCounts: { duck: 1000 } },
  );
  assert.equal(normalized.cursors.duck, 59);
});

test("unversioned unified state archives numeric drawings and all former animation frames once", () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      settings: { theme: "dark", device: "ipad" },
      progress: {
        lessons: ["w1-l1"],
        drawing: {
          "duck:duck-101": true,
          "boss:boss-136": true,
          "duck:duck-999": true,
          "boss:duck-101": true,
        },
        animation: { "run:7": true, "run:8": true, "hit:5": true },
        legacyDrawing: { "duck:duck-01": true },
      },
    }),
  });
  const first = createAppStore({ storage }).getState().progress;
  assert.equal(first.contentRevision, CONTENT_REVISION);
  assert.deepEqual(first.drawing, {});
  assert.deepEqual(first.animation, {});
  assert.deepEqual(first.legacyDrawing, {
    "duck:duck-01": true,
    "duck:duck-101": true,
    "boss:boss-136": true,
  });
  assert.deepEqual(first.legacyAnimation, { "run:7": true, "hit:5": true });
  assert.deepEqual(createAppStore({ storage }).getState().progress, first);
  assert.deepEqual(normalizeProgress(first), first);
});

test("profile revision drawings and animation persist and round-trip separately from archives", () => {
  const storage = memoryStorage();
  const app = createAppStore({
    storage,
    preloadedState: {
      progress: {
        contentRevision: CONTENT_REVISION,
        lessons: [],
        legacyDrawing: { "duck:duck-101": true },
        legacyAnimation: { "run:7": true },
      },
    },
  });
  app.dispatch(
    toggleDrawingStep({ character: "duck", stepId: "duck-profile-v4-60" }),
  );
  app.dispatch(
    toggleDrawingStep({ character: "boss", stepId: "boss-profile-v4-36" }),
  );
  app.dispatch(
    toggleAnimationFrame({ type: "run", frame: ANIMATION_COUNTS.run - 1 }),
  );
  const current = app.getState().progress;
  assert.deepEqual(createAppStore({ storage }).getState().progress, current);
  assert.deepEqual(
    parseBackup(serializeBackup(app.getState())).progress,
    current,
  );
  assert.deepEqual(current.drawing, {
    "duck:duck-profile-v4-60": true,
    "boss:boss-profile-v4-36": true,
  });
  assert.deepEqual(current.animation, {
    [`run:${ANIMATION_COUNTS.run - 1}`]: true,
  });
  assert.equal(current.legacyDrawing["duck:duck-101"], true);
  assert.equal(current.legacyAnimation["run:7"], true);
  app.dispatch(resetProgress());
  assert.deepEqual(app.getState().progress.legacyDrawing, {});
  assert.deepEqual(app.getState().progress.legacyAnimation, {});
});

test("old v4 backups migrate to the profile revision without marking its new animation", () => {
  const restored = parseBackup({
    version: 4,
    settings: {},
    progress: {
      lessons: [],
      drawing: { "duck:duck-160": true },
      animation: { "run:7": true },
    },
  });
  assert.equal(restored.progress.contentRevision, CONTENT_REVISION);
  assert.deepEqual(restored.progress.drawing, {});
  assert.deepEqual(restored.progress.animation, {});
  assert.deepEqual(restored.progress.legacyDrawing, { "duck:duck-160": true });
  assert.deepEqual(restored.progress.legacyAnimation, { "run:7": true });
  const current = normalizeProgress({
    contentRevision: CONTENT_REVISION,
    drawing: {
      "duck:duck-profile-v4-0": true,
      "duck:duck-profile-v4-01": true,
      "duck:duck-profile-v4-61": true,
      "boss:boss-profile-v4-37": true,
      "boss:duck-profile-v4-1": true,
      "duck:duck-profile-v4-1": true,
    },
    animation: { [`run:${ANIMATION_COUNTS.run}`]: true, "run:0": true },
  });
  assert.deepEqual(current.drawing, { "duck:duck-profile-v4-1": true });
  assert.deepEqual(current.animation, { "run:0": true });
});
