import React from "react";
import { ArrowUpRight, Check, Monitor, Download } from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  selectProgress,
  selectSettings,
  setDevice as deviceAction,
  replaceProgress,
  resetProgress,
  setTheme,
} from "../store/index.js";
import { COURSE_COUNTS } from "../routing/paths.js";
import { apps } from "../data/apps.js";
import { useStore } from "react-redux";
import { serializeBackup, parseBackup } from "../store/storage.js";
export default function ToolsPage() {
  const dispatch = useAppDispatch();
  const progress = useAppSelector(selectProgress),
    { device } = useAppSelector(selectSettings);
  const done = progress.lessons;
  const setDevice = (value) => dispatch(deviceAction(value));
  const app = apps.find((a) => a.id === device) || apps[0];
  const store = useStore(),
    duckSteps = { length: COURSE_COUNTS.duck },
    duckDone = Object.keys(progress.drawing).filter((key) =>
      key.startsWith("duck:"),
    ).length,
    pct = Math.round((done.length / 30) * 100);
  function backup() {
    const url = URL.createObjectURL(
      new Blob([serializeBackup(store.getState())], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "gramilya-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(event) {
    const input = event.currentTarget,
      file = input.files?.[0];
    if (!file) return;
    try {
      const [text, { weeks }, { masterclasses }, { animationFrames }] =
        await Promise.all([
          file.text(),
          import("../data/curriculum"),
          import("../data/masterclasses"),
          import("../data/animation.js"),
        ]);
      const result = parseBackup(text, {
        lessonIds: weeks.flatMap((w) => w.lessons.map((l) => l.id)),
        drawingKeys: masterclasses.flatMap((c) =>
          c.chapters.flatMap((ch) => ch.steps.map((s) => c.id + ":" + s.id)),
        ),
        animationKeys: Object.entries(animationFrames).flatMap(
          ([type, frames]) => frames.map((_, i) => type + ":" + i),
        ),
        characterStepCounts: COURSE_COUNTS,
      });
      dispatch(replaceProgress(result.progress));
      dispatch(setTheme(result.settings.theme));
      dispatch(deviceAction(result.settings.device));
      alert("Прогресс восстановлен");
    } catch {
      alert(
        "Не удалось прочитать файл прогресса. Выбери JSON, скачанный из GRAMILYA.",
      );
    } finally {
      input.value = "";
    }
  }
  function reset() {
    if (
      confirm(
        "Удалить все отметки о выполнении? Сначала можно скачать прогресс.",
      )
    )
      dispatch(resetProgress());
  }
  return (
    <>
      <span className="eyebrow">ПЕРЕД ПЕРВЫМ ШТРИХОМ</span>
      <h1>
        Твой планшет.
        <br />
        Твои инструменты.
      </h1>
      <p className="intro">
        Учимся рисовать в твоей программе. Выбери устройство — подсказки в
        занятиях подстроятся. Сам сайт бесплатный; условия приложений
        отличаются.
      </p>
      <div className="app-grid">
        {apps.map((a) => (
          <button
            key={a.id}
            className={"app-card " + (device === a.id ? "selected" : "")}
            onClick={() => setDevice(a.id)}
          >
            <Monitor size={27} />
            <span>{a.device}</span>
            <h2>{a.name}</h2>
            <p>{a.tag}</p>
            <span className="app-select">
              {device === a.id ? (
                <>
                  <Check size={16} /> Выбрано
                </>
              ) : (
                "Выбрать программу"
              )}
            </span>
          </button>
        ))}
      </div>
      <section className="info-panel">
        <span className="eyebrow">НАСТРОЙКА · {app.name.toUpperCase()}</span>
        <h2>Начни с чистого листа</h2>
        <p>{app.setup}</p>
        <h3>Как сохранить работу</h3>
        <p>{app.export}</p>
        <div className="link-row">
          <a href={app.url} target="_blank" rel="noreferrer">
            Официальный сайт <ArrowUpRight size={16} />
          </a>
          <a href={app.help} target="_blank" rel="noreferrer">
            Руководство по анимации и экспорту <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="caption">
          Совместимость и условия проверены 29 октября 2026. Перед покупкой
          проверь свою модель, ОС и магазин. Для бесплатного старта на iPad,
          Android и поддерживаемых Huawei есть{" "}
          <a
            href="https://ibispaint.com/productMobile.jsp"
            target="_blank"
            rel="noreferrer"
          >
            ibisPaint X
          </a>
          ; названия команд будут отличаться.
        </p>
      </section>
      <section className="info-panel">
        <h2>Твой прогресс — у тебя</h2>
        <p>
          Герой: {duckDone} из {duckSteps.length} шагов. Дополнительные
          упражнения: {done.length} из 30 занятий ({pct}%). Отметки, программа и
          тема сохраняются в этом браузере. Очистка данных браузера удалит их.
          Рисунки хранятся в твоём приложении на планшете.
        </p>
        <div className="link-row">
          <button className="secondary" onClick={backup}>
            <Download size={17} /> Скачать прогресс
          </button>
          <label className="secondary file-label">
            Восстановить из файла
            <input
              type="file"
              accept=".json,application/json"
              onChange={restore}
            />
          </label>
          <button className="text-button" onClick={reset}>
            Сбросить отметки
          </button>
        </div>
      </section>
    </>
  );
}
