import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  selectProgress,
  selectPersistenceError,
  toggleDrawingStep,
  setDrawingCursor,
} from "./store";
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
import BeginnerSetup, { HeadPlacement } from "./BeginnerSetup";

function courseIndex(id, value) {
  const c = masterclasses.find((c) => c.id === id) || masterclasses[0];
  const last = c.chapters.reduce((n, ch) => n + ch.steps.length, 0) - 1;
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(last, Math.floor(value)))
    : 0;
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
    <div
      className="mc-illustration-scroll"
      style={{ "--mc-cell-aspect": aspect }}
    >
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

export default function Masterclass() {
  const params = useParams(),
    routerNavigate = useNavigate(),
    dispatch = useAppDispatch();
  const savedProgress = useAppSelector(selectProgress),
    saveError = useAppSelector(selectPersistenceError);
  const progress = savedProgress.drawing,
    cursors = savedProgress.cursors;
  const earlierRoute = Object.keys(savedProgress.legacyDrawing).length > 0;
  const character = masterclasses.some((c) => c.id === params.character)
    ? params.character
    : masterclasses[0].id;
  const course = masterclasses.find((c) => c.id === character);
  const steps = course.chapters.flatMap((ch) =>
    ch.steps.map((s) => ({ ...s, chapterId: ch.id, chapterTitle: ch.title })),
  );
  const routeStep = Number(params.step);
  const validStep =
    params.character === character &&
    /^[1-9]\d*$/.test(params.step || "") &&
    Number.isSafeInteger(routeStep) &&
    routeStep <= steps.length;
  const index = validStep ? routeStep - 1 : 0;
  const step = steps[index];
  const [preparationOpen, setPreparationOpen] = useState(index === 0);
  const [showReference, setShowReference] = useState(false),
    [dialogReference, setDialogReference] = useState(false),
    [zoomOpen, setZoomOpen] = useState(false),
    [zoom, setZoom] = useState(1);
  const dialog = useRef(null),
    expandButton = useRef(null),
    stepHeading = useRef(null),
    stageStrip = useRef(null),
    workspace = useRef(null),
    viewportSnapshot = useRef(null);
  const completed = steps.filter(
      (s) => progress[`${course.id}:${s.id}`],
    ).length,
    isDone = !!progress[`${course.id}:${step.id}`];
  useEffect(() => {
    if (!validStep)
      routerNavigate(`/draw/${character}/1`, {
        replace: true,
        preventScrollReset: true,
      });
  }, [validStep, character, routerNavigate]);
  useEffect(() => {
    if (validStep) dispatch(setDrawingCursor({ character, index }));
  }, [character, index, validStep, dispatch]);
  useLayoutEffect(() => {
    resetReadingPanes();
  }, [character, index]);
  useLayoutEffect(() => {
    const strip = stageStrip.current;
    const active = strip?.querySelector('[aria-current="step"]');
    if (strip && active) {
      const left = active.offsetLeft;
      if (left < strip.scrollLeft) strip.scrollLeft = left;
      else if (left + active.offsetWidth > strip.scrollLeft + strip.clientWidth)
        strip.scrollLeft = left + active.offsetWidth - strip.clientWidth;
    }
    const position = viewportSnapshot.current;
    if (position && !zoomOpen) {
      if (window.scrollY !== position.y || window.scrollX !== position.x)
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: "instant",
        });
      viewportSnapshot.current = null;
    }
  }, [character, index, showReference, zoomOpen]);
  useEffect(() => {
    setShowReference(false);
    setDialogReference(false);
    setZoom(1);
  }, [character, index]);
  useEffect(() => {
    if (!zoomOpen) return;
    const el = dialog.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.showModal();
    return () => {
      el?.close();
      document.body.style.overflow = oldOverflow;
      expandButton.current?.focus({ preventScroll: true });
    };
  }, [zoomOpen]);
  function keepViewport() {
    if (zoomOpen) return;
    viewportSnapshot.current = { x: window.scrollX, y: window.scrollY };
    if (workspace.current && window.matchMedia("(max-width: 950px)").matches)
      workspace.current.style.minHeight = `${workspace.current.getBoundingClientRect().height}px`;
  }
  function resetReadingPanes() {
    if (!window.matchMedia("(min-width: 951px)").matches) return;
    workspace.current
      ?.querySelectorAll(
        ".mc-art-panel, .mc-step-content, .mc-illustration-scroll",
      )
      .forEach((pane) => {
        pane.scrollTop = 0;
        pane.scrollLeft = 0;
      });
  }
  function choose(id) {
    keepViewport();
    resetReadingPanes();
    const nextIndex = courseIndex(id, cursors[id]);
    routerNavigate(`/draw/${id}/${nextIndex + 1}`, {
      preventScrollReset: true,
    });
    setShowReference(false);
    setDialogReference(false);
    setZoom(1);
  }
  function navigate(next) {
    keepViewport();
    resetReadingPanes();
    const nextIndex = courseIndex(course.id, next);
    routerNavigate(`/draw/${course.id}/${nextIndex + 1}`, {
      preventScrollReset: true,
    });
    setShowReference(false);
    setDialogReference(false);
    setZoom(1);
  }
  function openZoom(reference = false) {
    setDialogReference(reference);
    setZoomOpen(true);
    setZoom(1);
  }
  function mark() {
    dispatch(toggleDrawingStep({ character: course.id, stepId: step.id }));
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
      <div className="eyebrow">
        НОВЫЕ ПЕРСОНАЖИ · РИСУЕМ ПРОФИЛЬ ДЛЯ МЕТРОИДВАНИИ
      </div>
      <div className="mc-intro">
        <h1>
          Рисуем новый арт.
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
                  ? "Основной персонаж"
                  : "Дополнительная практика"}
                {` · ${c.chapters.reduce((n, ch) => n + ch.steps.length, 0)} шагов`}
              </small>
            </span>
            {character === c.id && <Check size={19} />}
          </button>
        ))}
      </div>
      <aside className="mc-route-update">
        <strong>Один ракурс — от построения до цвета.</strong> Все панели этого
        урока созданы по новым персонажам. Рисуем боковой вид вправо; исходный
        арт помогает сверять костюм и материалы.{" "}
        <a href={course.currentArt} target="_blank" rel="noreferrer">
          Открыть актуальный референс
        </a>
        .
      </aside>
      <div className="mc-course-intro">
        <div>
          <h2>{course.title}</h2>
          <p>{course.subtitle}</p>
          <span className="mc-duration">{course.duration}</span>
        </div>
        <a className="secondary" href={course.reference} download>
          <Download size={17} /> Скачать референс нового персонажа
        </a>
      </div>
      {earlierRoute && (
        <p className="mc-route-update">
          Обновлённый маршрут: одно действие за шаг. Старые упражнения сохранены
          в браузере; новые шаги отмечаются отдельно.
        </p>
      )}
      <details
        className="mc-preparation"
        open={preparationOpen}
        onToggle={(event) => setPreparationOpen(event.currentTarget.open)}
      >
        <summary>
          <Layers size={18} /> Подготовь холст и слои{" "}
          <span>Показать / скрыть</span>
        </summary>
        <div className="mc-preparation-content">
          <BeginnerSetup character={character} />
          <details>
            <summary>Полный план рисунка: слои, палитра и ориентиры</summary>
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
          </details>
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
      <div className="mc-stage-toolbar" aria-label="Навигация по шагам">
        <div className="mc-toolbar-top">
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
          {navigation}
        </div>
        <div
          className="mc-stage-strip"
          ref={stageStrip}
          aria-label="Все шаги — прокрути ленту вбок"
        >
          {steps.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Этап ${i + 1}: ${s.title}${progress[`${course.id}:${s.id}`] ? " · выполнен" : ""}`}
              aria-current={index === i ? "step" : undefined}
              title={s.title}
              className={index === i ? "current" : ""}
              onClick={() => navigate(i)}
            >
              <span>{i + 1}</span>
              {progress[`${course.id}:${s.id}`] && (
                <Check size={10} className="mc-stage-done" />
              )}
            </button>
          ))}
        </div>
        <p
          className="mc-current-stage"
          aria-live="polite"
          aria-atomic="true"
          title={`Шаг ${index + 1}. ${step.title}`}
        >
          <span>Шаг {index + 1}.</span> {step.title}
        </p>
      </div>
      <div className="mc-workspace" ref={workspace}>
        <div
          className="mc-art-panel"
          tabIndex={0}
          role="region"
          aria-label="Иллюстрация шага и оригинал героя"
        >
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
          {step.focusTitle && (
            <p className="mc-focus-title">{step.focusTitle}</p>
          )}
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
        <div
          className="mc-step-content"
          tabIndex={0}
          role="region"
          aria-label="Описание действия и самопроверка"
        >
          <span className="eyebrow">
            {step.chapterTitle} · ЭТАП {index + 1}
          </span>
          <h2 ref={stepHeading} tabIndex={-1}>
            {step.title}
          </h2>
          <p className="mc-goal">{step.goal}</p>
          {character === "duck" && index === 0 && <HeadPlacement />}
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
          <h3>Одно действие на планшете</h3>
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
