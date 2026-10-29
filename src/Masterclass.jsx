import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Expand,
  Eye,
  Layers,
  X,
  ZoomIn,
} from "lucide-react";
import { masterclasses } from "./data/masterclasses";
import "./masterclass.css";

const PROGRESS_KEY = "shtrih-masterclass-progress-v1";
const CURSOR_KEY = "shtrih-masterclass-cursor-v1";
function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}
function readCursor() {
  try {
    const value = JSON.parse(localStorage.getItem(CURSOR_KEY));
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}
function courseIndex(id, value) {
  const c = masterclasses.find((c) => c.id === id) || masterclasses[0];
  const last = c.chapters.reduce((n, ch) => n + ch.steps.length, 0) - 1;
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(last, Math.floor(value)))
    : 0;
}
function saveCursor(id, index) {
  try {
    localStorage.setItem(
      CURSOR_KEY,
      JSON.stringify({ ...readCursor(), [id]: index }),
    );
  } catch {
    /* The drawing walkthrough remains usable without browser storage. */
  }
}
function Illustration({
  step,
  title,
  reference,
  showReference = false,
  zoom = 1,
}) {
  const [aspect, setAspect] = useState(1);
  useEffect(() => {
    if (showReference) return;
    const img = new Image();
    img.onload = () =>
      setAspect(
        img.naturalWidth / step.columns / (img.naturalHeight / step.rows),
      );
    img.src = step.sheet;
    return () => {
      img.onload = null;
    };
  }, [step.sheet, step.columns, step.rows, showReference]);
  const col = step.panel % step.columns,
    row = Math.floor(step.panel / step.columns);
  return (
    <div className="mc-illustration-scroll">
      <div
        className="mc-illustration-scale"
        style={{ width: `${zoom * 100}%` }}
      >
        {showReference ? (
          <img
            className="mc-original"
            src={reference}
            alt={`Оригинальный референс: ${title}`}
          />
        ) : (
          <div
            className="mc-raster"
            role="img"
            aria-label={`Отрисовка этапа «${step.title}»`}
            style={{
              aspectRatio: aspect,
              backgroundImage: `url("${step.sheet}")`,
              backgroundSize: `${step.columns * 100}% ${step.rows * 100}%`,
              backgroundPosition: `${step.columns === 1 ? 0 : (col / (step.columns - 1)) * 100}% ${step.rows === 1 ? 0 : (row / (step.rows - 1)) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function Masterclass({ initial = "duck", startAt = null }) {
  const requestedId = initial === "wolf" ? "boss" : initial,
    initialId = masterclasses.some((c) => c.id === requestedId)
      ? requestedId
      : masterclasses[0].id;
  const [character, setCharacter] = useState(initialId),
    [index, setIndex] = useState(() =>
      courseIndex(initialId, startAt ?? readCursor()[initialId]),
    ),
    [showReference, setShowReference] = useState(false),
    [dialogReference, setDialogReference] = useState(false),
    [progress, setProgress] = useState(readProgress),
    [saveError, setSaveError] = useState(false),
    [zoomOpen, setZoomOpen] = useState(false),
    [zoom, setZoom] = useState(1);
  const dialog = useRef(null),
    expandButton = useRef(null),
    stepHeading = useRef(null);
  const course =
      masterclasses.find((c) => c.id === character) || masterclasses[0],
    steps = course.chapters.flatMap((ch) =>
      ch.steps.map((s) => ({ ...s, chapterId: ch.id, chapterTitle: ch.title })),
    ),
    step = steps[Math.min(index, steps.length - 1)];
  const completed = steps.filter(
      (s) => progress[`${course.id}:${s.id}`],
    ).length,
    isDone = !!progress[`${course.id}:${step.id}`];
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
    window.dispatchEvent(new Event("shtrih-progress-change"));
  }, [progress]);
  useEffect(() => {
    const nextIndex = courseIndex(
      initialId,
      startAt ?? readCursor()[initialId],
    );
    setCharacter(initialId);
    setIndex(nextIndex);
    saveCursor(initialId, nextIndex);
    setShowReference(false);
    setDialogReference(false);
  }, [initialId, startAt]);
  useEffect(() => {
    if (!zoomOpen) return;
    const el = dialog.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.showModal();
    return () => {
      el?.close();
      document.body.style.overflow = oldOverflow;
      expandButton.current?.focus();
    };
  }, [zoomOpen]);
  function choose(id) {
    const nextIndex = courseIndex(id, readCursor()[id]);
    saveCursor(character, index);
    setCharacter(id);
    setIndex(nextIndex);
    saveCursor(id, nextIndex);
    setShowReference(false);
    setDialogReference(false);
    setZoom(1);
  }
  function navigate(next) {
    const nextIndex = courseIndex(course.id, next);
    setIndex(nextIndex);
    saveCursor(course.id, nextIndex);
    setShowReference(false);
    setDialogReference(false);
    setZoom(1);
    if (!zoomOpen)
      requestAnimationFrame(() => {
        stepHeading.current
          ?.closest(".mc-workspace")
          ?.scrollIntoView({ block: "start", behavior: "instant" });
        stepHeading.current?.focus({ preventScroll: true });
      });
  }
  function openZoom(reference = false) {
    setDialogReference(reference);
    setZoomOpen(true);
    setZoom(1);
  }
  function mark() {
    const key = `${course.id}:${step.id}`;
    setProgress((p) => ({ ...p, [key]: !p[key] }));
  }
  const navigation = (
    <div className="mc-navigation">
      <button
        className="secondary"
        disabled={index === 0}
        onClick={() => navigate(index - 1)}
      >
        <ArrowLeft size={17} /> Назад
      </button>
      <span>
        {index + 1} / {steps.length}
      </span>
      <button
        className="secondary"
        disabled={index === steps.length - 1}
        onClick={() => navigate(index + 1)}
      >
        Дальше <ArrowRight size={17} />
      </button>
    </div>
  );
  return (
    <section className="masterclass">
      <div className="eyebrow">МАСТЕР-КЛАСС · ОТ ЭСКИЗА ДО ДЕТАЛЕЙ</div>
      <div className="mc-intro">
        <h1>
          Нарисуем героя.
          <br />
          Шаг за шагом.
        </h1>
        <p>
          Открой программу на планшете, а этот разбор оставь рядом. Рассматривай
          рисунки крупно, повторяй небольшими частями и возвращайся к сложным
          местам.
        </p>
      </div>
      <div
        className="mc-character-tabs"
        role="group"
        aria-label="Выбор персонажа"
      >
        {masterclasses.map((c) => (
          <button
            key={c.id}
            aria-pressed={character === c.id}
            className={
              character === c.id ? "mc-character selected" : "mc-character"
            }
            onClick={() => choose(c.id)}
          >
            <img src={c.reference} alt="" />
            <span>
              <strong>{c.title}</strong>
              <small>
                {c.id === "duck"
                  ? "Основной персонаж · 18 этапов"
                  : "Дополнительная практика · 12 этапов"}
              </small>
            </span>
            {character === c.id && <Check size={19} />}
          </button>
        ))}
      </div>
      <div className="mc-course-intro">
        <div>
          <h2>{course.title}</h2>
          <p>{course.subtitle}</p>
          <span className="mc-duration">{course.duration}</span>
        </div>
        <a className="secondary" href={course.reference} download>
          <Download size={17} /> Скачать оригинал героя
        </a>
      </div>
      <details className="mc-preparation">
        <summary>
          <Layers size={18} /> Подготовь холст и слои{" "}
          <span>Открыть памятку</span>
        </summary>
        <div className="mc-preparation-content">
          <p>{course.canvas}</p>
          <ul>
            {course.layers.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
          <div className="mc-palette">
            {course.palette.map((color) => (
              <span key={color.hex}>
                <i style={{ background: color.hex }} />
                <b>{color.name}</b>
                <small>{color.hex}</small>
              </span>
            ))}
          </div>
          <p className="mc-note">
            Палитра — опора для старта. Сохраняй исходник со слоями после
            каждого большого этапа.
          </p>
        </div>
      </details>
      <div className="mc-progress-row">
        <span>
          {saveError
            ? "Браузер не сохранил отметки. Оставь страницу открытой."
            : `Выполнено ${completed} из ${steps.length} этапов · сохраняется в этом браузере`}
        </span>
        <div
          className="mc-progress-track"
          role="progressbar"
          aria-label="Прогресс мастер-класса"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completed}
        >
          <i style={{ width: `${(completed / steps.length) * 100}%` }} />
        </div>
      </div>
      <div className="mc-stage-picker">
        <label>
          Раздел
          <select
            value={step.chapterId}
            onChange={(e) =>
              navigate(steps.findIndex((s) => s.chapterId === e.target.value))
            }
          >
            {course.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
        </label>
        <div className="mc-stage-buttons" aria-label="Все этапы">
          {steps.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Этап ${i + 1}: ${s.title}${progress[`${course.id}:${s.id}`] ? " · выполнен" : ""}`}
              aria-current={index === i ? "step" : undefined}
              title={s.title}
              className={index === i ? "current" : ""}
              onClick={() => navigate(i)}
            >
              {progress[`${course.id}:${s.id}`] ? <Check size={15} /> : i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="mc-workspace">
        <div className="mc-art-panel">
          <div className="mc-art-label">
            <span>
              {showReference
                ? "ОРИГИНАЛ ГЕРОЯ"
                : `ЭТАП ${String(index + 1).padStart(2, "0")} · ОТРИСОВКА`}
            </span>
            <button
              ref={expandButton}
              className="mc-zoom-button"
              onClick={() => openZoom(showReference)}
            >
              <Expand size={16} /> Увеличить
            </button>
          </div>
          <Illustration
            step={step}
            title={course.title}
            reference={course.reference}
            showReference={showReference}
          />
          <div className="mc-art-actions">
            <button
              className="secondary"
              aria-pressed={showReference}
              onClick={() => setShowReference((v) => !v)}
            >
              <Eye size={17} />
              {showReference ? "Вернуться к этапу" : "Сравнить с оригиналом"}
            </button>
            <a href={step.sheet} download className="text-button">
              <Download size={15} /> Скачать лист этапов
            </a>
          </div>
          <p className="mc-note">
            {showReference
              ? "Сравни крупные пропорции, силуэт и расположение деталей. Точное совпадение не требуется."
              : "Рассмотри, что добавилось на этом этапе. Рисуй в своей программе — здесь можно изучать и увеличивать изображения."}
          </p>
          <div className="mc-permanent-reference">
            <div>
              <span className="eyebrow">ОРИГИНАЛ · ОРИЕНТИР ДЕТАЛЕЙ</span>
              <button className="mc-zoom-button" onClick={() => openZoom(true)}>
                <Expand size={15} /> Увеличить оригинал
              </button>
            </div>
            <button
              className="mc-reference-preview"
              aria-label={`Увеличить оригинальный референс: ${course.title}`}
              onClick={() => openZoom(true)}
            >
              <img
                src={course.reference}
                alt={`Оригинальный референс: ${course.title}`}
              />
            </button>
          </div>
          <p className="mc-note mc-ai-note">
            Этапные иллюстрации созданы с помощью ИИ по исходному изображению.
            Они показывают последовательность работы; оригинал рядом — твой
            ориентир для пропорций, одежды и деталей.
          </p>
        </div>
        <div className="mc-step-content">
          <span className="eyebrow">
            {step.chapterTitle} · ЭТАП {index + 1}
          </span>
          <h2 ref={stepHeading} tabIndex={-1}>
            {step.title}
          </h2>
          <p className="mc-goal">{step.goal}</p>
          <dl className="mc-tool-info">
            <div>
              <dt>Инструмент</dt>
              <dd>{step.tools}</dd>
            </div>
            <div>
              <dt>Рабочий слой</dt>
              <dd>{step.layer}</dd>
            </div>
          </dl>
          <h3>Что делать на планшете</h3>
          <ol className="mc-actions">
            {step.actions.map((action, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                <p>{action}</p>
              </li>
            ))}
          </ol>
          <div className="mc-checkpoint">
            <strong>
              <Check size={17} /> Перед следующим этапом
            </strong>
            <p>{step.checkpoint}</p>
          </div>
          <div className="mc-mistake">
            <strong>Если что-то не сходится</strong>
            <p>{step.commonMistake}</p>
          </div>
          <button
            className={isDone ? "primary mc-mark completed" : "primary mc-mark"}
            aria-pressed={isDone}
            onClick={mark}
          >
            <Check size={18} />
            {isDone ? "Этап выполнен · снять отметку" : "Я закончил этот этап"}
          </button>
          <p className="mc-note">
            Иди дальше, когда готов. Можно повторять этапы и пропускать
            знакомое.
          </p>
        </div>
      </div>
      {navigation}
      <dialog
        ref={dialog}
        className="mc-dialog"
        aria-labelledby="mc-dialog-title"
        onCancel={() => setZoomOpen(false)}
        onClose={() => setZoomOpen(false)}
      >
        <div className="mc-dialog-toolbar">
          <div>
            <span className="eyebrow">
              {dialogReference
                ? "ОРИГИНАЛ"
                : `ЭТАП ${index + 1} / ${steps.length}`}
            </span>
            <h2 id="mc-dialog-title">
              {dialogReference ? course.title : step.title}
            </h2>
          </div>
          <button
            className="secondary"
            aria-label="Закрыть увеличенное изображение"
            onClick={() => setZoomOpen(false)}
          >
            <X size={20} />
            <span>Закрыть</span>
          </button>
        </div>
        <div className="mc-dialog-image">
          <Illustration
            step={step}
            title={course.title}
            reference={course.reference}
            showReference={dialogReference}
            zoom={zoom}
          />
        </div>
        <div className="mc-dialog-bottom">
          <label className="mc-zoom-control">
            <ZoomIn size={18} />
            <span>{Math.round(zoom * 100)}%</span>
            <input
              type="range"
              min="1"
              max="2.5"
              step=".25"
              value={zoom}
              aria-label="Масштаб изображения"
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <button
            className="secondary"
            aria-pressed={dialogReference}
            onClick={() => {
              setDialogReference((v) => !v);
              setZoom(1);
            }}
          >
            <Eye size={17} />
            {dialogReference ? "Показать этап" : "Оригинал"}
          </button>
          {navigation}
        </div>
      </dialog>
    </section>
  );
}
