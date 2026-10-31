import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Pencil } from "lucide-react";
import { weeks } from "../data/curriculum.js";
import { foundationLessons } from "../data/foundationLessons.js";
import { apps } from "../data/apps.js";
import {
  useAppDispatch,
  useAppSelector,
  selectSettings,
  selectProgress,
  setDevice,
  setLastLesson,
  toggleLesson,
} from "../store/index.js";
import LessonIllustration from "../LessonIllustration.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import "../foundation-lessons.css";
const allLessons = weeks.flatMap((w) => w.lessons);
const projectSave = (app) =>
  app.drawingGuide.save
    .split(/Для анимации|Возможности экспорта анимации/)[0]
    .trim();
export default function LessonPage() {
  const { id } = useParams();
  const course = allLessons.find((l) => l.id === id),
    lesson = foundationLessons[id];
  return course && lesson ? (
    <FoundationLesson key={id} lesson={{ ...course, ...lesson, id }} />
  ) : (
    <NotFoundPage />
  );
}
function AppHelp({ app, step, setup }) {
  const brush =
    app.drawingGuide.brushes[step.technique] || app.drawingGuide.brushes.sketch;
  const menu = step.interaction === "menu";
  return (
    <details className="fl-app-help">
      <summary>Как сделать этот шаг в {app.name}</summary>
      {!menu && (
        <p>
          <strong>Кисть:</strong> {brush.name}. {brush.path}.
        </p>
      )}
      <p>
        <strong>
          {menu ? "Команды этого шага:" : "Настройки для этого упражнения:"}
        </strong>{" "}
        {step.tool}
      </p>
      {(!menu ||
        ["layer", "ink-layer", "base-layer"].includes(
          step.visual.operation,
        )) && (
        <p>
          <strong>Слой:</strong> выбери «{step.layer}». Если его ещё нет:{" "}
          {app.layerStart}
        </p>
      )}
      {step.visual.kind !== "files" && (
        <p>
          <strong>Холст урока:</strong>{" "}
          {typeof setup.canvas === "string"
            ? setup.canvas
            : JSON.stringify(setup.canvas)}
          . Создаётся один раз в начале урока.{" "}
          {step.visual.operation === "canvas" ? app.canvasStart : ""}
        </p>
      )}
      {!menu && (
        <details>
          <summary>Кисть называется иначе или нет нажима</summary>
          <p>{brush.fallback}</p>
          <p>{app.drawingGuide.finger}</p>
        </details>
      )}
      {!menu && (
        <details>
          <summary>Где настроить толщину, нажим и сглаживание</summary>
          <p>
            Если размер кисти указан в процентах или без px, сделай один пробный
            штрих на текущем слое при 100% просмотре и сравни с примером. Меняй
            Size до тонкой различимой линии; новый документ не создавай.
          </p>
          <p>{brush.stabilization}</p>
          <p>{app.drawingGuide.stabilization}</p>
          <p>{app.drawingGuide.pressureTest}</p>
        </details>
      )}
      {!menu && step.technique === "fill" && <p>{app.drawingGuide.fill}</p>}
      {[
        "base-layer",
        "base",
        "fill-regions",
        "study-base",
        "color-pass",
      ].includes(step.visual.operation) && (
        <p>
          <strong>Положение цвета:</strong> в панели слоёв перетащи строку
          цветового слоя ниже строки «Контур». Контур должен оставаться видимым
          поверх заливки. Скрой цвет на секунду: линия должна остаться.
        </p>
      )}
      {step.technique === "shade" && (
        <p>
          <strong>Положение тени:</strong> слой тени находится над базовым
          цветом и под контуром. Не закрашивай линию непрозрачным цветом.
        </p>
      )}
      {step.technique === "animation" && step.interaction === "menu" && (
        <p>
          {app.drawingGuide.animation.check}{" "}
          {app.drawingGuide.animation.fallback}
        </p>
      )}
      {step.visual.operation === "undo" && (
        <p>
          {app.id === "ipad"
            ? "Undo: коснись холста двумя пальцами. Redo: тремя пальцами. Можно использовать стрелки отмены и повтора."
            : "Найди Undo / Отмена (стрелка назад) и Redo / Повтор (стрелка вперёд) на панели команд. Нажми по одному разу, наблюдая за последней линией."}
        </p>
      )}
      {step.visual.operation === "visibility" && (
        <p>
          {app.drawingGuide.layers} Выключай значок видимости строки, не удаляй
          слой.
        </p>
      )}
      <details>
        <summary>Сохранить исходник и проверить версию программы</summary>
        <p>{projectSave(app)}</p>
        <p>{app.drawingGuide.versionCheck}</p>
        <ul>
          {app.drawingGuide.sources.slice(0, 3).map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </details>
  );
}
function FoundationLesson({ lesson }) {
  const navigate = useNavigate();
  const zoomDialog = useRef(null);
  const stepNavigation = useRef(null);
  const dispatch = useAppDispatch(),
    { device } = useAppSelector(selectSettings),
    progress = useAppSelector(selectProgress);
  const app = apps.find((a) => a.id === device) || apps[0];
  const [index, setIndex] = useState(0),
    [repeated, setRepeated] = useState({}),
    [checks, setChecks] = useState({}),
    [showError, setShowError] = useState(false);
  const step = lesson.steps[index],
    done = progress.lessons.includes(lesson.id),
    position = allLessons.findIndex((l) => l.id === lesson.id);
  const week = weeks.find((w) => w.lessons.some((l) => l.id === lesson.id));
  useEffect(() => {
    dispatch(setLastLesson(lesson.id));
  }, [dispatch, lesson.id]);
  useLayoutEffect(() => {
    // A different lesson starts at its introduction; changing a step stays put.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [lesson.id]);
  useLayoutEffect(() => {
    const nav = stepNavigation.current;
    const button = nav?.children[index];
    if (!button) return;
    const left = button.offsetLeft - nav.offsetLeft;
    // Reveal the selected tab horizontally without scrolling the document.
    if (left < nav.scrollLeft) nav.scrollLeft = left;
    else if (left + button.offsetWidth > nav.scrollLeft + nav.clientWidth)
      nav.scrollLeft = left + button.offsetWidth - nav.clientWidth;
  }, [index]);
  function choose(n) {
    setIndex(n);
    setShowError(false);
  }
  const setup = lesson.setup;
  return (
    <section className="foundation-lesson">
      <header className="fl-header">
        <div>
          <span className="eyebrow">ОСНОВЫ РИСУНКА · {week.title}</span>
          <h1>{lesson.title}</h1>
        </div>
      </header>
      <div className="fl-purpose">
        <p>
          <strong>Чему научишься:</strong> {lesson.goal}
        </p>
        <p>
          <strong>В конце получится:</strong> {lesson.result}
        </p>
        <p className="fl-note">
          Рисуй в своей программе на планшете. Здесь можно рассмотреть пример и
          выбрать следующий шаг; сайт не проверяет твой рисунок.
        </p>
      </div>
      <div className="fl-setup">
        <div>
          <strong>Подготовка этого упражнения</strong>
          <p>
            Холст:{" "}
            {typeof setup.canvas === "string"
              ? setup.canvas
              : JSON.stringify(setup.canvas)}
          </p>
          <p>
            Слои, которые добавим по ходу упражнения:{" "}
            {Array.isArray(setup.layers)
              ? setup.layers.join("; ")
              : setup.layers}
          </p>
          <p className="fl-note">
            Это список рабочих слоёв, не порядок наложения. Где разместить новый
            слой, указано в его шаге.
          </p>
        </div>
        <label>
          Моя программа
          <select
            aria-label="Моя программа"
            value={app.id}
            onChange={(e) => dispatch(setDevice(e.target.value))}
          >
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.device} · {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {lesson.prerequisites?.length > 0 && (
        <p className="fl-prerequisites">
          Если это пока незнакомо:{" "}
          {lesson.prerequisites.map((id, i) => (
            <React.Fragment key={id}>
              {i > 0 ? " · " : ""}
              <Link to={`/lesson/${id}`}>
                {allLessons.find((l) => l.id === id)?.title || id}
              </Link>
            </React.Fragment>
          ))}
        </p>
      )}
      <div className="fl-step-bar">
        <label className="fl-lesson-picker">
          <span>Урок</span>
          <select
            aria-label="Выбрать занятие"
            value={lesson.id}
            onChange={(e) => navigate(`/lesson/${e.target.value}`)}
          >
            {weeks.map((w) => (
              <optgroup key={w.id} label={`${w.id}. ${w.title}`}>
                {w.lessons.map((l, i) => (
                  <option key={l.id} value={l.id}>
                    {w.id}.{i + 1} · {l.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <nav
          ref={stepNavigation}
          className="fl-step-nav"
          aria-label="Шаги упражнения"
        >
          {lesson.steps.map((s, i) => (
            <button
              key={s.visual.operation}
              aria-current={i === index ? "step" : undefined}
              aria-label={`Шаг ${i + 1}: ${s.title}`}
              className={i === index ? "selected" : ""}
              onClick={() => choose(i)}
            >
              <span>{repeated[i] ? <Check size={15} /> : i + 1}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </nav>
        <div className="fl-step-shortcuts" aria-label="Переключить шаг">
          <button
            aria-label="Предыдущий шаг упражнения"
            disabled={index === 0}
            onClick={() => choose(index - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          <span>
            {index + 1} / {lesson.steps.length}
          </span>
          <button
            aria-label="Следующий шаг упражнения"
            disabled={index === lesson.steps.length - 1}
            onClick={() => choose(index + 1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div className="fl-workspace">
        <article className="fl-action" aria-labelledby="fl-active-title">
          <div className="fl-step-intro">
            <span className="eyebrow">
              ШАГ {index + 1} ИЗ {lesson.steps.length}
            </span>
            <h2 id="fl-active-title">{step.title}</h2>
            <p className="fl-action-text">{step.text}</p>
            <p className="fl-why">
              <strong>Зачем:</strong> {step.why}
            </p>
            <dl className="fl-current-settings">
              <div>
                <dt>
                  {step.interaction === "menu"
                    ? "Область работы"
                    : "Сейчас рисуем на слое"}
                </dt>
                <dd>{step.layer}</dd>
              </div>
              <div>
                <dt>Инструмент этого шага</dt>
                <dd>{step.tool}</dd>
              </div>
            </dl>
          </div>
          <div className="fl-step-details">
            <div className="fl-check">
              <strong>Прежде чем двигаться дальше</strong>
              <p>{step.checkpoint}</p>
            </div>
            <details className="fl-fix" open={showError}>
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setShowError((v) => !v);
                }}
              >
                Показать частую ошибку и исправление
              </summary>
              <p>{step.mistake}</p>
              <p className="fl-note">
                В схеме красным показан пример ошибки, зелёным — принцип
                исправления.
              </p>
            </details>
            <AppHelp app={app} step={step} setup={setup} />
            <label className="fl-repeat">
              <input
                type="checkbox"
                checked={!!repeated[index]}
                onChange={(e) =>
                  setRepeated({ ...repeated, [index]: e.target.checked })
                }
              />
              Я повторил это действие на планшете
            </label>
            <div className="fl-controls">
              <button
                className="secondary"
                disabled={index === 0}
                onClick={() => choose(index - 1)}
              >
                <ArrowLeft size={17} />
                Назад
              </button>
              <button
                className="primary"
                disabled={index === lesson.steps.length - 1}
                onClick={() => choose(index + 1)}
              >
                Следующий шаг
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </article>
        <aside className="fl-example">
          <figure>
            <div className="fl-figure-heading">
              <Pencil size={16} />
              <span>
                Пример действия · {index + 1}/{lesson.steps.length}
              </span>
              <button
                className="text-button"
                onClick={() => zoomDialog.current.showModal()}
              >
                Увеличить схему
              </button>
            </div>
            <LessonIllustration
              visual={step.visual}
              lessonId={lesson.id}
              showError={showError}
            />
            <figcaption>{step.visual.alt}</figcaption>
            <p className="fl-legend">
              <span>Серое — построение</span>
              <span>Зелёное — текущий приём</span>
            </p>
          </figure>
          {step.visual.kind === "lion" && (
            <details className="fl-original">
              <summary>Посмотреть исходный арт льва</summary>
              <img
                src="/assets/boss-pride-lion.png"
                alt="Исходный арт льва Гордыни: грива, сюртук, шпага влево и хвост вправо"
              />
              <p>
                Здесь учимся на упрощённом этюде. Полный арт разбирается
                отдельно:{" "}
                <Link to="/draw/boss/1">96 действий по оригиналу</Link>.
              </p>
            </details>
          )}
          {lesson.reference && step.visual.kind !== "lion" && (
            <details className="fl-original">
              <summary>Референс этого упражнения</summary>
              <img src={lesson.reference.src} alt={lesson.reference.alt} />
            </details>
          )}
        </aside>
      </div>
      <dialog
        ref={zoomDialog}
        className="fl-zoom"
        aria-label={`Увеличенная схема: ${step.title}`}
      >
        <header>
          <strong>{step.title}</strong>
          <button
            className="secondary"
            onClick={() => zoomDialog.current.close()}
            autoFocus
          >
            Закрыть схему
          </button>
        </header>
        <p>
          Прокручивай схему, чтобы рассмотреть штрихи. Она показывает пример;
          повторяй его в своей программе.
        </p>
        <LessonIllustration visual={step.visual} showError={showError} />
      </dialog>
      <section className="fl-practice">
        <div>
          <span className="eyebrow">ЗАКРЕПИ НАВЫК</span>
          <h2>Теперь сделай без подсказки</h2>
          <p>{lesson.exercise}</p>
          <h3>Сохрани и проверь работу</h3>
          <ol>
            <li>
              Назови проект «{lesson.id}-проба-01» и сохрани редактируемый
              исходник. {projectSave(app)}
            </li>
            <li>
              Сделай отдельную PNG-копию для просмотра. Исходник со слоями
              оставь рядом.
            </li>
            <li>
              Вернись в галерею или список файлов, открой исходник снова. Скрой
              и покажи слой рисунка: слои должны сохраниться.
            </li>
          </ol>
          <p className="fl-note">
            Отметки отдельных шагов действуют до ухода со страницы. Итоговая
            отметка занятия сохраняется в браузере. Сам рисунок сохраняй в
            приложении.
          </p>
        </div>
        <div className="fl-final-check">
          <h3>Проверь результат урока</h3>
          {lesson.checklist.map((c, i) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={!!checks[i]}
                onChange={(e) =>
                  setChecks({ ...checks, [i]: e.target.checked })
                }
              />
              <span>{c}</span>
            </label>
          ))}
          <button
            className={`primary ${done ? "completed" : ""}`}
            onClick={() => dispatch(toggleLesson(lesson.id))}
          >
            <Check size={17} />
            {done
              ? "Выполнено · снять отметку"
              : "Отметить занятие выполненным"}
          </button>
          <small>
            Это твоя самооценка, а не автоматическая проверка рисунка.
          </small>
        </div>
      </section>
      <nav className="fl-lesson-links" aria-label="Другие занятия">
        {position > 0 ? (
          <Link to={`/lesson/${allLessons[position - 1].id}`}>
            <ArrowLeft size={16} />
            Предыдущее занятие
          </Link>
        ) : (
          <Link to="/">К маршруту</Link>
        )}
        {position < allLessons.length - 1 && (
          <Link to={`/lesson/${allLessons[position + 1].id}`}>
            Следующее занятие
            <ArrowRight size={16} />
          </Link>
        )}
      </nav>
    </section>
  );
}
