import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Check,
  Layers,
  Download,
} from "lucide-react";
import {
  useAppDispatch,
  useAppSelector,
  selectProgress,
  selectSettings,
  toggleAnimationDrawingStep,
} from "./store";
import CharacterAnimation, {
  animationFrames,
  animationLessons,
  animationDurations,
} from "./CharacterAnimation";
import {
  getAnimationDrawingSteps,
  drawingStepNames,
} from "./data/animationDrawing.js";
import { exportAnimationAtlas } from "./animationRaster.js";
import DeviceDrawingGuide from "./DeviceDrawingGuide.jsx";
import { apps } from "./data/apps.js";
import "./animation-studio.css";
import { revealInstruction } from "./revealInstruction.js";
const names = { idle: "Ожидание", run: "Бег", jump: "Прыжок" };
export default function AnimationStudio() {
  const params = useParams(),
    navigate = useNavigate(),
    location = useLocation(),
    dispatch = useAppDispatch();
  const type = Object.hasOwn(names, params.type) ? params.type : "idle",
    frames = animationFrames[type];
  const number = Number(params.frame),
    valid =
      params.type === type &&
      /^[1-9]\d*$/.test(params.frame || "") &&
      Number.isSafeInteger(number) &&
      number <= frames.length;
  const routeFrame = valid ? number - 1 : 0,
    progress = useAppSelector(selectProgress),
    { device } = useAppSelector(selectSettings),
    app = apps.find((a) => a.id === device) || apps[0];
  const [playing, setPlaying] = useState(false),
    [playbackFrame, setPlaybackFrame] = useState(routeFrame),
    [studying, setStudying] = useState(true),
    [step, setStep] = useState(0),
    [ghost, setGhost] = useState(false),
    [speed, setSpeed] = useState(1),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  const playbackLocation = useRef(location.key),
    active = playing && playbackLocation.current === location.key,
    frame = routeFrame;
  const instruction = useRef(null),
    navigation = useRef(null),
    stepStrip = useRef(null),
    frameStrip = useRef(null),
    revealStep = useRef(false);
  useLayoutEffect(() => {
    for (const strip of [stepStrip.current, frameStrip.current]) {
      const selected = strip?.querySelector('[aria-current="step"]');
      if (strip && selected) {
        const left = selected.offsetLeft - strip.offsetLeft;
        if (left < strip.scrollLeft) strip.scrollLeft = left;
        else if (
          left + selected.offsetWidth >
          strip.scrollLeft + strip.clientWidth
        )
          strip.scrollLeft = left + selected.offsetWidth - strip.clientWidth;
      }
    }
    if (revealStep.current) {
      revealStep.current = false;
      revealInstruction(instruction.current, navigation.current);
    }
  }, [step, type, routeFrame, studying]);
  const steps = getAnimationDrawingSteps(type, frame),
    lesson = steps[step],
    key = `${type}:${frame}:${step}`,
    drawn = progress.animationDrawing || {},
    phaseComplete = frames.filter(
      (_, i) => progress.animation[`${type}:${i}`],
    ).length;
  const stepCount = steps.filter(
    (_, i) => drawn[`${type}:${frame}:${i}`],
  ).length;
  useEffect(() => {
    if (!valid)
      navigate(`/animation/${type}/1`, {
        replace: true,
        preventScrollReset: true,
      });
  }, [valid, type, navigate]);
  useEffect(() => {
    setPlaying(false);
    setPlaybackFrame(routeFrame);
    setStep(0);
  }, [type, routeFrame, location.key]);
  useEffect(() => {
    if (!active) return;
    let request, previous;
    const tick = (now) => {
      if (previous !== undefined) {
        const elapsed = Math.min(now - previous, 64) * speed;
        setPlaybackFrame((f) => {
          let position = f,
            remaining = elapsed;
          while (remaining > 0) {
            const index = Math.floor(position) % frames.length;
            const duration = animationDurations[type][index];
            const timeToNext = (Math.floor(position) + 1 - position) * duration;
            if (remaining < timeToNext) {
              position += remaining / duration;
              break;
            }
            remaining -= timeToNext;
            position = (Math.floor(position) + 1) % frames.length;
          }
          return position;
        });
      }
      previous = now;
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [active, type, speed, frames.length]);
  function chooseFrame(next) {
    revealStep.current = true;
    setPlaying(false);
    setStudying(true);
    setStep(0);
    navigate(
      `/animation/${type}/${((next + frames.length) % frames.length) + 1}`,
      { preventScrollReset: true },
    );
  }
  function chooseType(next) {
    revealStep.current = true;
    setPlaying(false);
    setStudying(true);
    setStep(0);
    navigate(`/animation/${next}/1`, { preventScrollReset: true });
  }
  function play() {
    if (playing) {
      setPlaying(false);
      setStudying(true);
    } else {
      setStudying(false);
      setPlaybackFrame(routeFrame);
      playbackLocation.current = location.key;
      setPlaying(true);
    }
  }
  function study(next = step) {
    revealStep.current = true;
    if (next === step)
      revealInstruction(instruction.current, navigation.current);
    setPlaying(false);
    setStudying(true);
    setStep(next);
  }
  async function download() {
    setExporting(true);
    setExportError("");
    try {
      const blob = await exportAnimationAtlas(type),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `duck-${type}-reference-v6.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError(
        "Не удалось подготовить PNG. Дождись загрузки эталона и повтори.",
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <section className="animation-studio">
      <span className="eyebrow">
        ПОСЛЕ ИСХОДНОГО АРТА · УЧИМСЯ РИСОВАТЬ ДВИЖЕНИЕ
      </span>
      <h1>
        Каждую позу.
        <br />
        Шаг за шагом.
      </h1>
      <p className="intro">
        Сначала <Link to="/draw/duck/1">нарисуй исходный арт героя</Link>. Здесь
        отдельное упражнение: переводим героя в боковой игровой вид, затем
        рисуем каждую фазу движения от осей до цвета. Атаки пока нет.
      </p>
      <details className="as-setup">
        <summary>От исходного арта к игровому профилю</summary>
        <ol>
          <li>
            Сохрани законченный исходный рисунок со слоями. Не превращай его в
            профиль растягиванием или сжатием.
          </li>
          <li>
            Создай отдельный документ 1536 × 1800 px для кадров. По нижнему
            среднему виду листа модели заново построй нейтральный профиль
            вправо: один глаз, боковой клюв, те же пропорции и костюм.
          </li>
          <li>
            Закрепи стороны: ближняя правая рука механическая, ближняя правая
            нога органическая в длинной брючине. Дальняя левая рука живая,
            дальняя левая голень механическая.
          </li>
          <li>
            Для ожидания нарисуй отдельную расслабленную стойку в лёгком
            развороте: два глаза, дальний уже, видны две плоскости торса. Для
            бега и прыжка используй профиль с одним глазом. Не меняй ракурс
            корпуса в середине цикла бега.
          </li>
        </ol>
        <a
          href="/assets/duck-current-model.png"
          target="_blank"
          rel="noreferrer"
        >
          Открыть лист модели с профильным ориентиром
        </a>
      </details>
      <div className="as-tabs" role="group" aria-label="Выбрать движение">
        {Object.entries(names).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={type === id}
            className={type === id ? "selected" : ""}
            onClick={() => chooseType(id)}
          >
            {label}
            <span>{animationFrames[id].length} поз × 12 шагов</span>
          </button>
        ))}
      </div>
      <details className="as-setup">
        <summary>
          <Layers size={18} /> Подготовка движения в моей программе
        </summary>
        <DeviceDrawingGuide technique="animation" compact />
        <p>
          <strong>{app.name}:</strong> {app.animationStart}
        </p>
        <p>
          Одна группа или cel — один полный рисунок героя. Предыдущий рисунок
          включай калькой на 15–25%. Линия земли остаётся на отдельном
          неподвижном слое.
        </p>
      </details>
      <div className="as-navigation" ref={navigation}>
        <div className="as-toolbar" aria-label="Кадры движения">
          <label className="as-motion-picker">
            Движение
            <select
              aria-label="Выбрать движение"
              value={type}
              onChange={(e) => chooseType(e.target.value)}
            >
              {Object.entries(names).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="secondary"
            aria-label="Предыдущая поза"
            onClick={() => chooseFrame(frame - 1)}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="as-frame-strip" ref={frameStrip}>
            {frames.map((label, i) => (
              <button
                key={i}
                aria-label={`Кадр ${i + 1}: ${label}`}
                aria-current={frame === i ? "step" : undefined}
                className={frame === i ? "selected" : ""}
                onClick={() => chooseFrame(i)}
              >
                {i + 1}
                {progress.animation[`${type}:${i}`] && <Check size={10} />}
              </button>
            ))}
          </div>
          <button
            className="secondary"
            aria-label="Следующая поза"
            onClick={() => chooseFrame(frame + 1)}
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <div
          className="as-step-strip"
          ref={stepStrip}
          role="group"
          aria-label="Шаги рисования текущей позы"
        >
          {drawingStepNames.map((name, i) => (
            <button
              key={name}
              onClick={() => study(i)}
              className={studying && step === i ? "selected" : ""}
              aria-label={`Шаг ${i + 1}: ${name}`}
              aria-current={studying && step === i ? "step" : undefined}
            >
              {i + 1}. {name}
              {drawn[`${type}:${frame}:${i}`] && <Check size={12} />}
            </button>
          ))}
        </div>
      </div>
      <div className="as-workspace">
        <div className="as-player">
          <div className="as-controls">
            <button className="primary" onClick={play}>
              {playing ? <Pause size={17} /> : <Play size={17} />}{" "}
              {playing
                ? "Вернуться к своей позе"
                : "Смотреть итоговое движение"}
            </button>
            <button
              className="secondary"
              aria-pressed={studying}
              onClick={() => study()}
            >
              Рисовать по шагам
            </button>
            <button
              className="secondary"
              aria-pressed={ghost}
              onClick={() => setGhost((v) => !v)}
            >
              Калька предыдущей позы
            </button>
            <label>
              Скорость
              <select
                aria-label="Скорость просмотра анимации"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={0.5}>Медленно ×0,5</option>
                <option value={1}>Обычно ×1</option>
                <option value={2}>Быстро ×2</option>
              </select>
            </label>
          </div>
          <div className="as-player-art">
            <CharacterAnimation
              type={type}
              frame={active ? playbackFrame : frame}
              ghost={ghost}
              studyStage={studying ? step : null}
            />
          </div>
          <p className="caption">
            {studying
              ? `Поза ${frame + 1}, шаг ${step + 1} из 12. Повтори показанное построение на своём холсте.`
              : "Эталон движения закрепляет одни и те же части за каждой конечностью. Нарисуй собственные кадры по учебным шагам."}
          </p>
          <button
            className="text-button"
            onClick={download}
            disabled={exporting}
          >
            <Download size={15} />
            {exporting ? "Готовим PNG…" : "Скачать эталон поз (PNG)"}
          </button>
          {exportError && (
            <p role="status" className="caption">
              {exportError}
            </p>
          )}
          <p className="caption">
            Это эталон для сравнения, а не экспорт твоего рисунка.
          </p>
        </div>
        <div className="as-instruction">
          <div className="as-instruction-heading" ref={instruction}>
            <span className="eyebrow">
              {names[type]} · ПОЗА {frame + 1}/{frames.length} · ШАГ {step + 1}
              /12
            </span>
            <h2>{lesson.title}</h2>
            <p className="as-action">{lesson.text}</p>
          </div>
          <div className="as-instruction-details">
            <div className="as-focus">
              <strong>Перед переходом</strong>
              <p>{lesson.checkpoint}</p>
            </div>
            <div className="as-check">
              <h3>Частая ошибка</h3>
              <p>{lesson.mistake}</p>
            </div>
            <details className="as-brush-help" key={`${type}:${frame}:${step}`}>
              <summary>Кисть и настройки в моей программе</summary>
              <DeviceDrawingGuide technique={lesson.technique} compact />
            </details>
            <button
              className={drawn[key] ? "primary completed" : "primary"}
              aria-pressed={!!drawn[key]}
              onClick={() =>
                dispatch(toggleAnimationDrawingStep({ type, frame, step }))
              }
            >
              <Check size={17} />
              {drawn[key]
                ? "Этот шаг нарисован · снять отметку"
                : "Я нарисовал этот шаг"}
            </button>
            <p className="caption">
              В этой позе выполнено {stepCount}/12 шагов. Полностью построено{" "}
              {phaseComplete}/{frames.length} поз.
            </p>
            <div className="as-study-nav">
              <button
                className="secondary"
                disabled={step === 0}
                onClick={() => study(step - 1)}
              >
                <ArrowLeft size={16} /> Предыдущий шаг
              </button>
              <button
                className="primary"
                onClick={() =>
                  step < 11 ? study(step + 1) : chooseFrame(frame + 1)
                }
              >
                {step < 11 ? "Следующий шаг" : "Строить следующую позу"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <section className="as-next">
        <h2>Когда ключевые позы нарисованы</h2>
        <p>
          Просмотри сначала силуэты без деталей. Между резкими переходами
          нарисуй промежуточные позы. У каждой снова пройди ось, четыре цепочки
          конечностей и объёмы. Не меняй дизайн руки ради маха. Только после
          проверки опоры и сторон выполняй общий проход контура, цвета и света.
        </p>
        <p>
          <strong>В {app.name}:</strong> {app.export}
        </p>
        <Link to="/tools">Подробные основы и настройки моего планшета</Link>
      </section>
    </section>
  );
}
