import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { COURSE_COUNTS } from "../routing/paths.js";
import {
  STORAGE_KEY,
  defaultAppState,
  isAnimationKey,
  isDrawingKey,
  isRecord,
  loadPersistedState,
  normalizeProgress,
  normalizeSettings,
  resolveBrowserStorage,
  serializePersistedState,
} from "./storage.js";

const settingsSlice = createSlice({
  name: "settings",
  initialState: normalizeSettings(),
  reducers: {
    setTheme(state, action) {
      const theme = normalizeSettings({ theme: action.payload }).theme;
      if (theme === action.payload) state.theme = theme;
    },
    setDevice(state, action) {
      const device = normalizeSettings({ device: action.payload }).device;
      if (device === action.payload) state.device = device;
    },
  },
});

const progressSlice = createSlice({
  name: "progress",
  initialState: normalizeProgress(),
  reducers: {
    toggleLesson(state, action) {
      const id = action.payload;
      if (normalizeProgress({ lessons: [id] }).lessons.length !== 1) return;
      const index = state.lessons.indexOf(id);
      if (index >= 0) state.lessons.splice(index, 1);
      else state.lessons.push(id);
    },
    toggleDrawingStep(state, action) {
      const { character, stepId } = isRecord(action.payload)
        ? action.payload
        : {};
      const key = `${character}:${stepId}`;
      if (!isDrawingKey(key)) return;
      if (state.drawing[key]) delete state.drawing[key];
      else state.drawing[key] = true;
    },
    setDrawingCursor(state, action) {
      const { character, index } = isRecord(action.payload)
        ? action.payload
        : {};
      if (
        !Object.hasOwn(COURSE_COUNTS, character) ||
        !Number.isSafeInteger(index)
      )
        return;
      state.cursors[character] = Math.max(
        0,
        Math.min(COURSE_COUNTS[character] - 1, index),
      );
    },
    toggleAnimationFrame(state, action) {
      const { type, frame } = isRecord(action.payload) ? action.payload : {};
      if (!Number.isSafeInteger(frame)) return;
      const key = `${type}:${frame}`;
      if (!isAnimationKey(key)) return;
      if (state.animation[key]) delete state.animation[key];
      else state.animation[key] = true;
    },
    setLastLesson(state, action) {
      const id = action.payload;
      if (normalizeProgress({ lessons: [id] }).lessons.length === 1)
        state.lastLesson = id;
    },
    replaceProgress(_state, action) {
      return normalizeProgress(action.payload);
    },
    resetProgress() {
      return normalizeProgress();
    },
  },
});

const persistenceSlice = createSlice({
  name: "persistence",
  initialState: { error: false },
  reducers: {
    setPersistenceError(state, action) {
      const value = action.payload === true;
      if (state.error !== value) state.error = value;
    },
  },
});

export const { setTheme, setDevice } = settingsSlice.actions;
export const {
  toggleLesson,
  toggleDrawingStep,
  setDrawingCursor,
  toggleAnimationFrame,
  setLastLesson,
  replaceProgress,
  resetProgress,
} = progressSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectProgress = (state) => state.progress;
export const selectPersistenceError = (state) => state.persistence.error;
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

/** storage:null explicitly disables persistence (SSR, tests, embedded previews).
 * Supply a Storage-like {getItem,setItem} object to isolate an instance in tests.
 * preloadedState is sanitized and wins over disk when explicitly supplied.
 */
export function createAppStore(options = {}) {
  const resolved = Object.hasOwn(options, "storage")
    ? { storage: options.storage || null, error: false }
    : resolveBrowserStorage();
  const loaded = loadPersistedState(resolved.storage);
  const supplied = isRecord(options.preloadedState)
    ? options.preloadedState
    : null;
  const base = supplied || loaded;
  const defaults = defaultAppState();
  const appStore = configureStore({
    reducer: {
      settings: settingsSlice.reducer,
      progress: progressSlice.reducer,
      persistence: persistenceSlice.reducer,
    },
    preloadedState: {
      settings: normalizeSettings(base.settings || defaults.settings),
      progress: normalizeProgress(base.progress || defaults.progress),
      persistence: {
        error: resolved.error || base.persistence?.error === true,
      },
    },
  });

  let lastObserved;
  const persist = () => {
    if (!resolved.storage) return;
    const serialized = serializePersistedState(appStore.getState());
    if (serialized === lastObserved) return;
    // Set before error dispatch: the nested subscription cannot write or loop.
    lastObserved = serialized;
    let failed = false;
    try {
      resolved.storage.setItem(STORAGE_KEY, serialized);
    } catch {
      failed = true;
    }
    if (appStore.getState().persistence.error !== failed) {
      appStore.dispatch(persistenceSlice.actions.setPersistenceError(failed));
    }
  };
  appStore.subscribe(persist);
  // Persist even an empty migration/reset boundary before a later reload.
  persist();
  return appStore;
}

export const store = createAppStore();
export default store;
