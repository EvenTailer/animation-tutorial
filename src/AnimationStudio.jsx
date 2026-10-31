import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  selectProgress,
  selectPersistenceError,
  selectSettings,
  setDevice,
  toggleAnimationFrame,
} from "./store";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Check,
  Layers,
  Download,
} from "lucide-react";
import CharacterAnimation, {
  animationFrames,
  animationLessons,
  animationDurations,
} from "./CharacterAnimation";
import "./animation-studio.css";
import { apps } from "./data/apps.js";
import { exportAnimationAtlas } from "./animationRaster.js";
const names = {
  idle: "Живое ожидание",
  run: "Бег",
  jump: "Прыжок",
};
export default function AnimationStudio() {
  const params = useParams(),
    routerNavigate = useNavigate(),
    location = useLocation(),
    dispatch = useAppDispatch();
  const type = Object.hasOwn(names, params.type) ? params.type : "idle";
  const routeFrameNumber = Number(params.frame);
  const validFrame =
    params.type === type &&
    /^[1-9]\d*$/.test(params.frame || "") &&
    Number.isSafeInteger(routeFrameNumber) &&
    routeFrameNumber <= animationFrames[type].length;
  const routeFrame = validFrame ? routeFrameNumber - 1 : 0;
  const done = useAppSelector(selectProgress).animation;
  const { device } = useAppSelector(selectSettings);
  const app = apps.find((a) => a.id === device) || apps[0];
  const storageError = useAppSelector(selectPersistenceError);
  const [playbackFrame, setPlaybackFrame] = useState(routeFrame),
    [playing, setPlaying] = useState(false),
    [ghost, setGhost] = useState(false),
    [speed, setSpeed] = useState(1),
    [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  const playbackLocation = useRef(location.key);
  const playbackActive = playing && playbackLocation.current === location.key;
  const frame = playbackActive ? playbackFrame : routeFrame;
  const frames = animationFrames[type],
    lesson = animationLessons[type][frame],
    durations = animationDurations[type],
    key = `${type}:${frame}`,
    complete = frames.filter((_, i) => done[`${type}:${i}`]).length;
  useEffect(() => {
    if (!validFrame)
      routerNavigate(`/animation/${type}/1`, {
        replace: true,
        preventScrollReset: true,
      });
  }, [validFrame, type, routerNavigate]);
  useEffect(() => {
    setPlaying(false);
    setPlaybackFrame(routeFrame);
  }, [type, routeFrame, location.key]);
  useEffect(() => {
    if (!playbackActive) return;
    const timer = setTimeout(
      () => setPlaybackFrame((f) => (f + 1) % frames.length),
      durations[playbackFrame] / speed,
    );
    return () => clearTimeout(timer);
  }, [playbackActive, playbackFrame, type, speed, frames.length, durations]);
  function selectFrame(i) {
    setPlaying(false);
    const next = (i + frames.length) % frames.length;
    routerNavigate(`/animation/${type}/${next + 1}`, {
      preventScrollReset: true,
    });
  }
  function selectType(t) {
    setPlaying(false);
    routerNavigate(`/animation/${t}/1`, { preventScrollReset: true });
  }
  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      routerNavigate(`/animation/${type}/${playbackFrame + 1}`, {
        replace: true,
        preventScrollReset: true,
      });
    } else {
      playbackLocation.current = location.key;
      setPlaybackFrame(routeFrame);
      setPlaying(true);
    }
  }
  async function downloadFrames() {
    setExporting(true);
    setExportError("");
    try {
      const blob = await exportAnimationAtlas(type);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `duck-profile-${type}-frames.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError(
        "Не удалось подготовить PNG. Проверь загрузку рисунков и повтори скачивание.",
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <section className="animation-studio">
      <span className="eyebrow">ПОСЛЕ РИСУНКА · ОЖИВЛЯЕМ ПОЛНОГО ГЕРОЯ</span>
      <h1>
        Тот же утёнок.
        <br />
        Теперь в движении.
      </h1>
      <p className="intro">
        Новый утёнок в профиль для метроидвании: малиновый жилет, механическая
        правая рука и левая нога. Рассмотри нарисованные позы сбоку и повтори их
        на планшете. Атаку добавим после разработки её идеи.
      </p>
      <p className="caption">
        Здесь ты рассматриваешь примеры, а рисуешь и сохраняешь свою анимацию в
        приложении на планшете. Для первого опыта удобнее начать с четырёх поз{" "}
        <Link to="/animation/idle/1">живого ожидания</Link>.
      </p>
      <div className="as-tabs" role="group" aria-label="Выбрать движение">
        {Object.entries(names).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={type === id}
            className={type === id ? "selected" : ""}
            onClick={() => selectType(id)}
          >
            {label}
            <span>{animationFrames[id].length} кадров</span>
          </button>
        ))}
      </div>
      <p className="caption">
        Ожидание, бег и прыжок направлены вправо. Ракурс сохраняется на всех
        кадрах: один видимый глаз, боковой клюв, разные руки и ноги. Бег показан
        на месте, чтобы удобно сравнивать опору и полёт.
      </p>
      <details className="as-setup" open>
        <summary>
          <Layers size={18} /> Подготовь анимационный документ
        </summary>
        <label className="app-inline">
          Моя программа
          <select
            aria-label="Программа для анимации"
            value={device}
            onChange={(e) => dispatch(setDevice(e.target.value))}
          >
            {apps.map((a) => (
              <option value={a.id} key={a.id}>
                {a.device} · {a.name}
              </option>
            ))}
          </select>
        </label>
        <p>
          <strong>В {app.name}:</strong> {app.animationStart}
        </p>
        <p>
          Кадр — один рисунок целого героя; группа — несколько слоёв, собранных
          вместе. Timeline — лента, которая задаёт порядок рисунков. Калька
          (onion skin) — бледный предыдущий рисунок под текущим: она помогает
          сохранить размеры и положение. Если кальки нет, уменьши непрозрачность
          предыдущего слоя до 15–25%.
        </p>
        <p>
          Не меняй размер холста между позами и не обрезай пустые края. Линию
          земли держи на неподвижном служебном слое. Включай прозрачный фон у
          копии для экспорта, сохраняя исходник со слоями.
        </p>
        <a href={app.help} target="_blank" rel="noreferrer">
          Руководство {app.name} по анимации и сохранению ↗
        </a>
      </details>
      <div className="as-toolbar" aria-label="Кадры движения">
        <button
          className="secondary"
          aria-label="Предыдущий кадр героя"
          onClick={() => selectFrame(frame - 1)}
        >
          <ArrowLeft size={17} />
        </button>
        <div className="as-frame-strip">
          {frames.map((label, i) => (
            <button
              key={`${type}-${i}`}
              className={frame === i ? "selected" : ""}
              aria-label={`Кадр ${i + 1}: ${label}`}
              aria-current={frame === i ? "step" : undefined}
              onClick={() => selectFrame(i)}
            >
              {i + 1}
              {done[`${type}:${i}`] && <Check size={10} />}
            </button>
          ))}
        </div>
        <button
          className="secondary"
          aria-label="Следующий кадр героя"
          onClick={() => selectFrame(frame + 1)}
        >
          <ArrowRight size={17} />
        </button>
      </div>
      <div className="as-workspace">
        <div className="as-player">
          <div className="as-controls">
            <button className="primary" onClick={togglePlayback}>
              {playing ? <Pause size={17} /> : <Play size={17} />}{" "}
              {playing ? "Пауза" : "Смотреть движение"}
            </button>
            <button
              className="secondary"
              aria-pressed={ghost}
              onClick={() => setGhost((v) => !v)}
            >
              Калька предыдущего кадра
            </button>
            <label>
              Скорость
              <select
                aria-label="Скорость просмотра анимации"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                <option value={0.5}>Медленно ×0,5</option>
                <option value={1}>Для разбора ×1</option>
                <option value={2}>Быстрее ×2</option>
              </select>
            </label>
          </div>

          <div className="as-player-art">
            <CharacterAnimation type={type} frame={frame} ghost={ghost} />
          </div>
          <p className="caption">
            Проигрываются отдельные цветные рисунки. Общий размер кадров и линия
            земли сохраняются, длительности фаз задают ритм.
          </p>
          <button
            className="text-button"
            onClick={downloadFrames}
            disabled={exporting}
          >
            <Download size={15} />{" "}
            {exporting ? "Готовим PNG…" : "Скачать эти кадры движения (PNG)"}
          </button>
          {exportError && (
            <p className="caption" role="status">
              {exportError}
            </p>
          )}
          <p className="caption">
            В PNG попадут те же позы, масштаб и положение над землёй, что в
            проигрывателе. Это образец движения для твоей работы.
          </p>
        </div>
        <div className="as-instruction">
          <span className="eyebrow">
            {names[type]} · КАДР {frame + 1} ИЗ {frames.length}
          </span>
          <h2>{lesson.title}</h2>
          <p className="as-action">{lesson.text}</p>
          <div className="as-focus">
            <strong>На что смотреть</strong>
            <p>{lesson.focus}</p>
          </div>
          <div className="as-check">
            <h3>Проверь этот кадр</h3>
            <ul>
              <li>Размер головы, клюва и деталей костюма сохраняется.</li>
              <li>
                Правая рука и левая голень героя остаются механическими; жилет и
                поясная ткань следуют за корпусом.
              </li>
              <li>
                Линия земли неподвижна; опорная стопа касается её, а в полёте
                стопы находятся выше.
              </li>
            </ul>
          </div>
          <button
            className={done[key] ? "primary completed" : "primary"}
            aria-pressed={!!done[key]}
            onClick={() => dispatch(toggleAnimationFrame({ type, frame }))}
          >
            <Check size={18} />
            {done[key]
              ? "Кадр нарисован · снять отметку"
              : "Я нарисовал эту позу"}
          </button>
          <p className="caption">
            {storageError
              ? "Не удалось сохранить отметки в браузере."
              : `Отмечено ${complete} из ${frames.length} поз. Рисунок остаётся в твоём приложении.`}
          </p>
        </div>
      </div>
      <section className="as-next">
        <h2>Когда основные позы готовы</h2>
        <p>
          Прокрути их вручную и найди резкие скачки. Между двумя слишком разными
          позами добавь промежуточный рисунок. На отдельной копии обведи чистый
          контур, затем верни цвета героя. В своей программе на планшете
          экспортируй GIF для проверки и PNG-кадры с одинаковым холстом для
          работы на ПК. Сайт не получает твой проект и не экспортирует его.
        </p>
        <h3>Сохранить свою работу в {app.name}</h3>
        <p>{app.export}</p>
        <Link to="/tools">Настройки программ и резервная копия отметок</Link>
        <p>
          Все показанные позы нарисованы заново по новому герою в боковом
          ракурсе. Это ключевые рисунки: для более плавного игрового движения
          добавь промежуточные позы, сохраняя профиль и стороны протезов.
        </p>
      </section>
    </section>
  );
}
