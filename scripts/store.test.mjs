import test from "node:test";
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
  app.dispatch(toggleDrawingStep({ character: "duck", stepId: "duck-101" }));
  app.dispatch(setDrawingCursor({ character: "duck", index: 9 }));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: 0 }));
  app.dispatch(setLastLesson("w3-l1"));
  assert.deepEqual(app.getState().settings, {
    theme: "dark",
    device: "samsung",
  });
  assert.deepEqual(app.getState().progress, {
    lessons: ["w3-l1"],
    drawing: { "duck:duck-101": true },
    cursors: { duck: 9, boss: 0 },
    animation: { "run:0": true },
    legacyDrawing: {},
    lastLesson: "w3-l1",
  });
  app.dispatch(toggleLesson("w3-l1"));
  app.dispatch(toggleDrawingStep({ character: "duck", stepId: "duck-101" }));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: 0 }));
  assert.deepEqual(app.getState().progress.lessons, []);
  assert.deepEqual(app.getState().progress.drawing, {});
  assert.deepEqual(app.getState().progress.animation, {});
});

test("migration retains current and archived marks without changing old keys", () => {
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
  assert.equal(app.getState().progress.drawing["duck:duck-101"], true);
  assert.equal(app.getState().progress.animation["jump:1"], true);
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
  app.dispatch(toggleDrawingStep({ character: "duck", stepId: "boss-101" }));
  app.dispatch(setDrawingCursor({ character: "__proto__", index: 9 }));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: -1 }));
  assert.equal(app.getState().settings.theme, "paper");
  assert.deepEqual(app.getState().progress.lessons, []);
  assert.deepEqual(app.getState().progress.drawing, {});
  const dirty = JSON.parse(
    '{"lessons":["w1-l1","w1-l1",2],"drawing":{"__proto__":true,"duck:duck-101":true,"boss:duck-101":true,"duck:duck-102":"true"},"animation":{"run:0":true,"run:-1":true},"cursors":{"duck":-9,"boss":"2"},"legacyDrawing":{"constructor":true}}',
  );
  app.dispatch(replaceProgress(dirty));
  assert.deepEqual(app.getState().progress.lessons, ["w1-l1"]);
  assert.deepEqual(app.getState().progress.drawing, { "duck:duck-101": true });
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
  app.dispatch(toggleDrawingStep({ character: "duck", stepId: "duck-101" }));
  app.dispatch(toggleLesson("w1-l1"));
  app.dispatch(toggleAnimationFrame({ type: "run", frame: 0 }));
  const restored = parseBackup(serializeBackup(app.getState()), {
    lessonIds: ["w1-l1"],
    drawingKeys: ["duck:duck-101"],
    animationKeys: ["run:0"],
    characterStepCounts: { duck: 60, boss: 36 },
  });
  assert.deepEqual(restored.progress, app.getState().progress);
  assert.deepEqual(restored.settings, app.getState().settings);
  const filtered = normalizeProgress(
    {
      lessons: ["w1-l1", "w2-l1"],
      drawing: { "duck:duck-101": true, "duck:duck-999": true },
      cursors: { duck: 999 },
      animation: { "run:999": true },
    },
    {
      lessonIds: ["w1-l1"],
      drawingKeys: ["duck:duck-101"],
      animationKeys: ["run:0"],
      characterStepCounts: { duck: 60 },
    },
  );
  assert.deepEqual(filtered.lessons, ["w1-l1"]);
  assert.deepEqual(filtered.drawing, { "duck:duck-101": true });
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
  assert.equal(v3.progress.drawing["duck:duck-101"], true);
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
    ["duck", 160, 161],
    ["boss", 136, 137],
  ]) {
    app.dispatch(
      toggleDrawingStep({ character, stepId: `${character}-${validLast}` }),
    );
    app.dispatch(
      toggleDrawingStep({ character, stepId: `${character}-${invalidNext}` }),
    );
    app.dispatch(toggleDrawingStep({ character, stepId: `${character}-100` }));
    app.dispatch(toggleDrawingStep({ character, stepId: `${character}-0101` }));
  }
  assert.deepEqual(app.getState().progress.drawing, {
    "duck:duck-160": true,
    "boss:boss-136": true,
  });
  for (const [type, count] of [
    ["idle", 4],
    ["run", 8],
    ["jump", 6],
    ["hit", 6],
  ]) {
    app.dispatch(toggleAnimationFrame({ type, frame: count - 1 }));
    app.dispatch(toggleAnimationFrame({ type, frame: count }));
    app.dispatch(toggleAnimationFrame({ type, frame: -1 }));
  }
  assert.deepEqual(app.getState().progress.animation, {
    "idle:3": true,
    "run:7": true,
    "jump:5": true,
    "hit:5": true,
  });
  app.dispatch(
    replaceProgress({
      drawing: {
        "duck:duck-101": true,
        "duck:duck-999": true,
        "duck:duck-01": true,
      },
      animation: { "idle:4": true, "run:8": true, "run:7": true },
      cursors: { duck: 999, boss: -1 },
      legacyDrawing: { "duck:duck-01": true, "boss:boss-12": true },
    }),
  );
  assert.deepEqual(app.getState().progress.drawing, { "duck:duck-101": true });
  assert.deepEqual(app.getState().progress.animation, { "run:7": true });
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
        cursors: { duck: 6000, boss: 3600 },
        animation: { "hit:6": true, "hit:5": true },
        drawing: { "boss:boss-137": true, "boss:boss-136": true },
        legacyDrawing: { "duck:duck-01": true },
      },
    }),
  });
  const app = createAppStore({ storage });
  assert.deepEqual(app.getState().progress.cursors, { duck: 59, boss: 35 });
  assert.deepEqual(app.getState().progress.animation, { "hit:5": true });
  assert.deepEqual(app.getState().progress.drawing, { "boss:boss-136": true });
  assert.equal(app.getState().progress.legacyDrawing["duck:duck-01"], true);
  const normalized = normalizeProgress(
    { cursors: { duck: 500 } },
    { characterStepCounts: { duck: 1000 } },
  );
  assert.equal(normalized.cursors.duck, 59);
});
