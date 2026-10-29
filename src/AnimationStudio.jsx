import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  selectProgress,
  selectPersistenceError,
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
const names = {
  idle: "Живое ожидание",
  run: "Бег",
  jump: "Прыжок",
  hit: "Удар",
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
  const storageError = useAppSelector(selectPersistenceError);
  const [playbackFrame, setPlaybackFrame] = useState(routeFrame),
    [playing, setPlaying] = useState(false),
    [ghost, setGhost] = useState(false),
    [speed, setSpeed] = useState(1);
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
