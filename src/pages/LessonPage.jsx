import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useAppDispatch,
  useAppSelector,
  selectProgress,
  selectSettings,
  setDevice as deviceAction,
  toggleLesson,
  setLastLesson,
} from "../store/index.js";
import { lessonPath } from "../routing/paths.js";
import { apps } from "../data/apps.js";
import { weeks } from "../data/curriculum";
import Diagram, { motionFrames, getDiagramType } from "../Diagram";
import CharacterAnimation from "../CharacterAnimation";
import { animationFrames, animationDurations } from "../data/animation.js";
import NotFoundPage from "./NotFoundPage";
import DeviceDrawingGuide from "../DeviceDrawingGuide.jsx";
const lessons = weeks.flatMap((w) => w.lessons);
export default function LessonPage() {
  const { id } = useParams();
  const lesson = lessons.find((l) => l.id === id);
  if (lesson?.diagram === "hit")
    return (
      <section className="info-panel">
        <h1>Атака появится позже</h1>
        <p>
          Сначала изучаем передвижение нового героя. Дизайн и анимацию атаки
          определим отдельно.
        </p>
      </section>
    );
  return lesson ? <LessonContent key={id} lesson={lesson} /> : <NotFoundPage />;
}
function LessonContent({ lesson }) {
  const navigate = useNavigate(),
    dispatch = useAppDispatch();
  const progress = useAppSelector(selectProgress),
    { device } = useAppSelector(selectSettings);
  const done = progress.lessons;
  const setDevice = (value) => dispatch(deviceAction(value));
  const app = apps.find((a) => a.id === device) || apps[0];
  const open = (id) => navigate(lessonPath(id));
  const selected = lesson.id,
    week = weeks.find((w) => w.lessons.includes(lesson));
  const [stage, setStage] = useState(0),
    [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [checked, setChecked] = useState({});
  const diagramType = getDiagramType(lesson),
    frameNames = animationFrames[diagramType] || motionFrames[diagramType],
    motion = !!frameNames,
    frameCount = frameNames?.length || 1;
  useEffect(() => {
    dispatch(setLastLesson(lesson.id));
  }, [dispatch, lesson.id]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        motion
          ? setFrame((x) => (x + 1) % frameCount)
          : setStage((x) => (x + 1) % lesson.steps.length),
      motion ? animationDurations[diagramType]?.[frame] || 300 : 1800,
    );
    return () => clearInterval(t);
  }, [playing, motion, lesson, frame]);

  const complete = () => dispatch(toggleLesson(lesson.id));
  return (
    <>
      <div className="lesson-head">
        <div>
          <span className="eyebrow">
            ОСНОВЫ И ПРАКТИКА · БЛОК {week.id} · {week.title}
          </span>
          <h1>{lesson.title}</h1>
          <p>
            <Clock size={16} /> Около {lesson.duration} минут · можно разделить
            на два подхода
          </p>
        </div>
        <select
          aria-label="Выбрать занятие"
          value={selected}
          onChange={(e) => open(e.target.value)}
        >
          {weeks.map((w) => (
            <optgroup key={w.id} label={`Практика ${w.id} · ${w.title}`}>
              {w.lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {done.includes(l.id) ? "✓ " : ""}
                  {l.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <p className="intro">
        Это дополнительные упражнения на отдельные навыки, а не недели основного
        маршрута. Схемы объясняют основы; полный новый арт рисуем по боковым
        пошаговым панелям.{" "}
        <button className="text-button" onClick={() => navigate("/draw")}>
          Рисовать нового героя <ArrowRight size={15} />
        </button>
      </p>
      <div className="lesson-layout">
        <div>
          {animationFrames[diagramType] && (
            <p>
              <Link className="primary" to={`/animation/${diagramType}/1`}>
                Рисовать каждую позу в 12 последовательных шагах
              </Link>
            </p>
          )}
          <div className="lesson-canvas">
            <div className="canvas-label">
              <span>{motion ? "КЛЮЧЕВЫЕ ПОЗЫ" : "ПОШАГОВАЯ СХЕМА"}</span>
              <span>
                {motion
                  ? `Кадр ${frame + 1} / ${frameCount}`
                  : `Этап ${stage + 1} / ${lesson.steps.length}`}
              </span>
            </div>
            {animationFrames[diagramType] ? (
              <CharacterAnimation type={diagramType} frame={frame} />
            ) : (
              <Diagram
                type={diagramType}
                stage={motion ? 3 : Math.min(3, stage)}
                frame={frame}
              />
            )}
            <div className="canvas-controls">
              <button
                className="secondary"
                onClick={() => {
                  setPlaying(false);
                  motion
                    ? setFrame((x) => (x + frameCount - 1) % frameCount)
                    : setStage((x) => Math.max(0, x - 1));
                }}
                aria-label="Предыдущий этап"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                className="secondary"
                onClick={() => setPlaying((x) => !x)}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}{" "}
                {playing
                  ? "Пауза"
                  : motion
                    ? "Смотреть движение"
                    : "Показать этапы"}
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setPlaying(false);
                  motion
                    ? setFrame((x) => (x + 1) % frameCount)
                    : setStage((x) => Math.min(lesson.steps.length - 1, x + 1));
                }}
                aria-label="Следующий этап"
              >
                <ArrowRight size={17} />
              </button>
            </div>
            {motion && (
              <>
                <div className="frames">
                  {frameNames.map((n, i) => (
                    <button
                      key={n}
                      className={i === frame ? "selected" : ""}
                      onClick={() => {
                        setFrame(i);
                        setPlaying(false);
                      }}
                    >
                      {i + 1} · {n}
                    </button>
                  ))}
                </div>
                <p className="caption">
                  Движение проигрывается по учебному таймингу; у прыжка фазы
                  имеют разную длительность. Для своей пробы начни с 6–8
                  кадров/с. Добавляй промежуточные рисунки между ключевыми
                  позами.
                </p>
              </>
            )}
            <p className="caption">
              {animationFrames[diagramType]
                ? "Перед тобой поза нового героя. Сверяй костюм и стороны механических конечностей с актуальным листом модели в шпаргалках."
                : "Упрощённая схема объясняет принцип. Рисуй в своей программе; детали героя добавляй постепенно."}
            </p>
          </div>
        </div>
        <div className="lesson-instructions">
          <DeviceDrawingGuide
            technique={
              animationFrames[diagramType]
                ? "animation"
                : diagramType === "light"
                  ? "shade"
                  : "sketch"
            }
            compact
          />
          <div className="prep">
            <span className="eyebrow">ПОДГОТОВЬ ПЛАНШЕТ</span>
            <label className="app-inline">
              Моя программа
              <select
                aria-label="Моя программа"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                {apps.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.device} · {a.name}
                  </option>
                ))}
              </select>
            </label>
            <p>{app.setup}</p>
            <button className="text-button" onClick={() => navigate("/tools")}>
              Сменить программу <ArrowUpRight size={14} />
            </button>
          </div>
          <h2>Повторяй по шагам</h2>
          {lesson.steps.map((s, i) => (
            <button
              className={"step " + (i === stage ? "selected" : "")}
              key={i}
              onClick={() => {
                setStage(i);
                setPlaying(false);
              }}
            >
              <span className="step-number">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="practice-layout">
        <div>
          <section className="practice">
            <span className="eyebrow">ТЕПЕРЬ ТВОЯ ОЧЕРЕДЬ</span>
            <h2>Попробуй самостоятельно</h2>
            <p>{lesson.exercise}</p>
          </section>
          <div className="warning">
            <strong>Если не получается</strong>
            <p>{lesson.mistake}</p>
          </div>
        </div>
        <div className="self-check">
          <h3>Проверь себя</h3>
          {lesson.checklist.map((c, i) => (
            <label key={i}>
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={(e) =>
                  setChecked({ ...checked, [i]: e.target.checked })
                }
              />
              <span>{c}</span>
            </label>
          ))}
          <button
            className={
              "primary " + (done.includes(lesson.id) ? "completed" : "")
            }
            onClick={complete}
          >
            <Check size={18} />
            {done.includes(lesson.id)
              ? "Выполнено · снять отметку"
              : "Занятие выполнено"}
          </button>
          <small>Чек-лист помогает оценить себя. Отметку ставишь ты.</small>
        </div>
      </div>
      <div className="lesson-nav">
        <button className="secondary" onClick={() => navigate("/")}>
          К маршруту
        </button>
        {lessons.indexOf(lesson) < 29 && (
          <button
            className="secondary"
            onClick={() => open(lessons[lessons.indexOf(lesson) + 1].id)}
          >
            Следующее занятие <ArrowRight size={17} />
          </button>
        )}
      </div>
    </>
  );
}
