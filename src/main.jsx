import React, { lazy } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { store, useAppSelector, selectProgress } from "./store/index.js";
import { drawPath, lessonPath, COURSE_COUNTS } from "./routing/paths.js";
import "./style.css";
import "./drawing-path.css";
const HomePage = lazy(() => import("./pages/HomePage"));
const MasterclassPage = lazy(() => import("./pages/MasterclassPage"));
const AnimationPage = lazy(() => import("./AnimationStudio"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
function ResumeDrawing() {
  const { cursors } = useAppSelector(selectProgress);
  return (
    <Navigate
      replace
      to={drawPath("duck", Math.min(COURSE_COUNTS.duck - 1, cursors.duck || 0))}
    />
  );
}
function ResumeLesson() {
  const { lastLesson } = useAppSelector(selectProgress);
  return <Navigate replace to={lessonPath(lastLesson)} />;
}
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="draw" element={<ResumeDrawing />} />
        <Route path="draw/:character/:step?" element={<MasterclassPage />} />
        <Route
          path="animation"
          element={<Navigate replace to="/animation/idle/1" />}
        />
        <Route path="animation/:type/:frame?" element={<AnimationPage />} />
        <Route path="lesson" element={<ResumeLesson />} />
        <Route path="lesson/:id" element={<LessonPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
