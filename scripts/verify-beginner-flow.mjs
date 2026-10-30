// Render route-specific help for every supported program, without a browser.
// This catches missing context and conflicting canvas sizes; it is not visual QA.
import assert from "node:assert/strict";
import { build } from "esbuild";
import { writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const result = await build({
  stdin: {
    contents: `
    import React from 'react';
    import {renderToStaticMarkup} from 'react-dom/server';
    import {Provider} from 'react-redux';
    import {MemoryRouter,Routes,Route} from 'react-router-dom';
    import {createAppStore} from './src/store/index.js';
    import MasterclassPage from './src/pages/MasterclassPage.jsx';
    import AnimationStudio from './src/AnimationStudio.jsx';
    import LessonPage from './src/pages/LessonPage.jsx';
    import ToolsPage from './src/pages/ToolsPage.jsx';
    export function render(path,device){
      const store=createAppStore({storage:null,preloadedState:{settings:{device,theme:'paper'}}});
      const html=renderToStaticMarkup(<Provider store={store}><MemoryRouter initialEntries={[path]}><Routes>
        <Route path="/draw/:character/:step" element={<MasterclassPage/>}/>
        <Route path="/animation/:type/:frame" element={<AnimationStudio/>}/>
        <Route path="/lesson/:id" element={<LessonPage/>}/>
        <Route path="/tools" element={<ToolsPage/>}/>
      </Routes></MemoryRouter></Provider>);
      return {html,state:store.getState()};
    }
  `,
    resolveDir: process.cwd(),
    loader: "jsx",
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  packages: "external",
  loader: { ".css": "empty" },
  logLevel: "silent",
});
const temporary = new URL(
  `.beginner-check-${randomUUID()}.mjs`,
  import.meta.url,
);
try {
  await writeFile(temporary, result.outputFiles[0].contents);
  const { render } = await import(temporary.href);
  for (const device of ["ipad", "samsung", "huawei"]) {
    for (const [character, size] of [
      ["duck", "2400 × 3200 px"],
      ["boss", "2400 × 3600 px"],
    ]) {
      const { html, state } = render(`/draw/${character}/1`, device);
      assert.ok(
        html.includes(size),
        `${character}/${device}: missing matching canvas`,
      );
      assert.ok(
        !html.includes("2048"),
        `${character}/${device}: obsolete square canvas`,
      );
      assert.ok(html.includes("Создай один слой эскиза"));
      if (character === "duck")
        assert.ok(html.includes("head-placement-title"));
      else assert.ok(html.includes("Бонус открыт сразу"));
      assert.equal(Object.keys(state.progress.drawing).length, 0);
    }
    const { html } = render("/animation/run/1", device);
    assert.ok(html.includes("Программа для анимации"));
    assert.ok(html.includes("Скачать образец поз (PNG)"));
    assert.ok(html.includes("Сайт не получает твой проект"));
    assert.ok(html.includes("Кадр — один рисунок"));
    assert.ok(!render("/tools", device).html.includes("2048"));
  }
  const lesson = render("/lesson/w3-l1", "ipad").html;
  assert.ok(lesson.includes("ОСНОВЫ И ПРАКТИКА · БЛОК"));
  assert.ok(lesson.includes("не недели основного"));
  assert.ok(!lesson.includes("Неделя 3"));
  console.log(
    "Beginner flows: 6 drawing variants, 3 animation programs, 3 setup pages and supporting lesson rendered successfully. No progress marks written. Browser/visual recheck still required.",
  );
} finally {
  await unlink(temporary).catch(() => {});
}
