import React, { useState, useEffect } from "react";
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
const names = {
  idle: "Живое ожидание",
  run: "Бег",
  jump: "Прыжок",
  hit: "Удар",
};
const progressKey = "gramilya-animation-progress-v1";
function readProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(progressKey));
    return p && typeof p === "object" && !Array.isArray(p) ? p : {};
  } catch {
    return {};
  }
}
export default function AnimationStudio({ initial = "idle" }) {
  const [type, setType] = useState(
      Object.hasOwn(names, initial) ? initial : "idle",
    ),
    [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [ghost, setGhost] = useState(false),
    [speed, setSpeed] = useState(1),
    [done, setDone] = useState(readProgress),
    [storageError, setStorageError] = useState(false);
  const frames = animationFrames[type],
    lesson = animationLessons[type][frame],
    durations = animationDurations[type],
    key = `${type}:${frame}`,
    complete = frames.filter((_, i) => done[`${type}:${i}`]).length;
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(
      () => setFrame((f) => (f + 1) % frames.length),
      durations[frame] / speed,
    );
    return () => clearTimeout(timer);
  }, [playing, frame, type, speed]);
  useEffect(() => {
    try {
      localStorage.setItem(progressKey, JSON.stringify(done));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    window.dispatchEvent(new Event("shtrih-progress-change"));
  }, [done]);
  function selectFrame(i) {
    setPlaying(false);
    setFrame((i + frames.length) % frames.length);
  }
  function selectType(t) {
    setPlaying(false);
    setType(t);
    setFrame(0);
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
        Каждый кадр — одетый, раскрашенный персонаж. Разбери позу крупно, затем
        повтори её на планшете. Рисунок из мастер-класса станет моделью для
        лица, одежды и материалов.
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
      <details className="as-setup" open>
        <summary>
          <Layers size={18} /> Подготовь анимационный документ
        </summary>
        <p>
          Сохрани копию законченного героя. Создай отдельный проект анимации:
          одинаковый размер холста и прозрачный фон у всех кадров. На служебном
          слое проведи линию земли. Создай папку первого кадра и перенеси в неё
          рисунок героя. Для следующего кадра нужна новая папка или ячейка
          анимации.
        </p>
        <p>
          Включи onion skin — полупрозрачный предыдущий кадр. Если приложение не
          поддерживает анимацию, рисуй позы в отдельных группах и собери
          движение на ПК. Сначала проверь позы, сохраняя голову, протез, майку и
          обувь. Затем переходи к чистовому контуру и цвету.
        </p>
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
            <button className="primary" onClick={() => setPlaying((p) => !p)}>
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
            {ghost && (
              <div className="as-onion" aria-hidden="true">
                <CharacterAnimation
                  type={type}
                  frame={(frame + frames.length - 1) % frames.length}
                />
              </div>
            )}
            <CharacterAnimation type={type} frame={frame} />
          </div>
          <p className="caption">
            Проигрываются отдельные рисунки поз: меняются корпус и конечности.
            Длительности фаз помогают разобрать ритм.
          </p>
          <a
            className="text-button"
            href={`/assets/duck-${type}-frames.png`}
            download
          >
            <Download size={15} /> Скачать лист поз
          </a>
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
                Протез остаётся на той же стороне; одежда следует за плечами и
                тазом.
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
            onClick={() => setDone((d) => ({ ...d, [key]: !d[key] }))}
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
          контур, затем верни цвета героя. Экспортируй GIF для проверки и
          PNG-кадры с одинаковым холстом для работы на ПК.
        </p>
        <p>
          Растровые позы созданы с помощью ИИ по исходному персонажу. Изучай
          движение по ним, а точные детали модели сверяй с исходным листом.
        </p>
      </section>
    </section>
  );
}
