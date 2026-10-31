import React, { useId, useState } from "react";
import { apps } from "./data/apps.js";
import {
  useAppDispatch,
  useAppSelector,
  selectSettings,
  setDevice,
} from "./store/index.js";
import "./device-drawing-guide.css";

const techniques = {
  sketch: "Эскиз",
  ink: "Чистый контур",
  fill: "Базовый цвет",
  shade: "Тень",
  animation: "Построение движения",
};
const lessons = {
  line: "1. Линия",
  oval: "2. Овал",
  layer: "3. Слой",
  fill: "4. Заливка",
  animation: "5. Два кадра",
};
const initialLesson = {
  sketch: "line",
  ink: "oval",
  fill: "fill",
  shade: "layer",
  animation: "animation",
};
function Feedback({ app, lesson }) {
  const guide = app.drawingGuide;
  const expected = {
    line: "Три отдельные линии и одна S-кривая. На нажимной кисти средняя линия толще; без нажима толщина меняется ползунком.",
    oval: "Один замкнутый овал со светлым краем. Высота и ширина различимы; линия не состоит из множества коротких «волосков».",
    layer:
      "Если скрыть эскиз, чистый овал остаётся. Если скрыть контур, виден только светлый эскиз.",
    fill: "Овал окрашен внутри, фон снаружи не изменился. При скрытии цвета отдельный контур остаётся.",
    animation:
      app.id === "huawei"
        ? "В режиме с Timeline два рисунка сменяются по Play. Без режима есть два отдельных слоя поз; это подготовка кадров, а не готовая анимация."
        : "Два кружка сменяются по Play, а на паузе каждый кадр выбирается отдельно. Это не видео записи процесса рисования.",
  };
  const errors = {
    line: { title: "Линия рваная или отстаёт", fix: guide.stabilization },
    oval: {
      title: "Овал вышел слишком жирным или ломаным",
      fix: `В ${app.name} уменьши Size и поверни холст до удобного угла. Не пытайся компенсировать нажимом неверный размер кисти. Сделай новый овал рядом, не закрашивай ошибку.`,
    },
    layer: {
      title: "При скрытии эскиза исчезает всё",
      fix:
        guide.layers +
        " Выделение слоя проверь одной точкой в пустом месте, затем сразу Undo.",
    },
    fill: {
      title: "Цвет вышел за край или исчез вместе с линией",
      fix: guide.fill,
    },
    animation: {
      title: "Кадры не меняются или нужной команды нет",
      fix: guide.animation.fallback,
    },
  };
  return (
    <div className="ddg-feedback">
      <p>
        <strong>Должно получиться:</strong> {expected[lesson]}
      </p>
      <details>
        <summary>{errors[lesson].title}</summary>
        <p>{errors[lesson].fix}</p>
      </details>
    </div>
  );
}

function Practice({ app, technique }) {
  const [lesson, setLesson] = useState(initialLesson[technique]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState({});
  const actions = app.drawingGuide.micro[lesson];
  const key = `${lesson}:${step}`;
  return (
    <div className="ddg-practice">
      <h4>Проба перед героем: один маленький шаг за раз</h4>
      <div
        className="ddg-lesson-tabs"
        role="group"
        aria-label="Выбрать упражнение на планшете"
      >
        {Object.entries(lessons).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={id === lesson ? "selected" : ""}
            aria-pressed={id === lesson}
            onClick={() => {
              setLesson(id);
              setStep(0);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ddg-action" aria-live="polite">
        <span className="ddg-step-label">
          {lessons[lesson]} · действие {step + 1} из {actions.length}
        </span>
        <p>{actions[step]}</p>
        <label className="ddg-check">
          <input
            type="checkbox"
            checked={!!done[key]}
            onChange={(event) =>
              setDone((current) => ({
                ...current,
                [key]: event.target.checked,
              }))
            }
          />
          Я сделал это в {app.name}
        </label>
      </div>
      <div className="ddg-step-buttons">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((value) => value - 1)}
        >
          ← Предыдущее действие
        </button>
        <button
          type="button"
          disabled={step === actions.length - 1}
          onClick={() => setStep((value) => value + 1)}
        >
          Следующее действие →
        </button>
      </div>
      <Feedback app={app} lesson={lesson} />
      <p className="ddg-note">
        Отметки этой пробы действуют до закрытия блока. Они не проверяют рисунок
        и не заменяют сохранение проекта в приложении.
      </p>
    </div>
  );
}

function GuideContent({ app, technique, compact }) {
  const guide = app.drawingGuide,
    brush = guide.brushes[technique];
  const [input, setInput] = useState("stylus");
  return (
    <>
      <div className="ddg-current-tool">
        <span className="ddg-kicker">СЕЙЧАС · {techniques[technique]}</span>
        <h4>{brush.name}</h4>
        <p>
          <strong>Где найти:</strong> {brush.path}
        </p>
        <dl className="ddg-settings">
          <div>
            <dt>Размер</dt>
            <dd>{brush.size}</dd>
          </div>
          <div>
            <dt>Прозрачность</dt>
            <dd>{brush.opacity}</dd>
          </div>
          <div>
            <dt>Сглаживание</dt>
            <dd>{brush.stabilization}</dd>
          </div>
        </dl>
        <p>
          <strong>Проверка кисти:</strong> {brush.check}
        </p>
        <details>
          <summary>У меня нет кисти с таким названием</summary>
          <p>{brush.fallback}</p>
          <p>{guide.versionCheck}</p>
        </details>
        <p className="ddg-note">
          Размеры и проценты — стартовые настройки упражнения, не обязательные
          значения производителя. На другом холсте сравни толщину при 100%
          просмотре. Прозрачность кисти меняет новый штрих, прозрачность слоя —
          весь уже нарисованный слой.
        </p>
      </div>
      <details className="ddg-full" open={!compact}>
        <summary>
          {compact
            ? "Открыть настройку и практику линии, овала, слоя и заливки"
            : "Настройка и практическая проба"}
        </summary>
        <div className="ddg-input-options" role="group" aria-label="Чем рисую">
          <button
            type="button"
            aria-pressed={input === "stylus"}
            onClick={() => setInput("stylus")}
          >
            Совместимый стилус
          </button>
          <button
            type="button"
            aria-pressed={input === "finger"}
            onClick={() => setInput("finger")}
          >
            Палец / стилус без нажима
          </button>
        </div>
        <p>{guide[input]}</p>
        <details>
          <summary>Как проверить нажим и сглаживание</summary>
          <p>{guide.pressureTest}</p>
          <p>{guide.stabilization}</p>
        </details>
        <details>
          <summary>Подготовить лист и разделить слои</summary>
          <p>{guide.workspace}</p>
          <p>{guide.layers}</p>
        </details>
        <Practice
          key={`${app.id}:${technique}`}
          app={app}
          technique={technique}
        />
        <details className="ddg-animation" open={technique === "animation"}>
          <summary>Первая анимация: проверить возможности своей версии</summary>
          <p>
            <strong>Сначала найди режим:</strong> {guide.animation.check}
          </p>
          <p>
            <strong>Проба на двух кружках:</strong> {guide.animation.start}
          </p>
          <p>
            <strong>Затем целый герой:</strong> {guide.animation.body}
          </p>
          <p>
            <strong>Ограничения:</strong> {guide.animation.limit}
          </p>
          <p>
            <strong>Если режима нет или он не работает:</strong>{" "}
            {guide.animation.fallback}
          </p>
          <p>
            <strong>Сохранить пробу:</strong> {guide.animation.export}
          </p>
        </details>
        <p>
          <strong>Сохрани исходник:</strong> {guide.save}
        </p>
        <details className="ddg-sources">
          <summary>Официальные руководства · проверено {guide.checked}</summary>
          <ul>
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} ↗
                </a>
              </li>
            ))}
          </ul>
          <p>
            Кнопки и доступность функций сверяй с установленной версией, языком
            интерфейса и моделью планшета.
          </p>
        </details>
      </details>
    </>
  );
}

export default function DeviceDrawingGuide({
  technique = "sketch",
  compact = false,
}) {
  const selectedTechnique = Object.hasOwn(techniques, technique)
    ? technique
    : "sketch";
  const dispatch = useAppDispatch(),
    { device } = useAppSelector(selectSettings);
  const app = apps.find((item) => item.id === device) || apps[0];
  const id = useId();
  return (
    <section
      className={`device-drawing-guide${compact ? " ddg-compact" : ""}`}
      aria-labelledby={`${id}-title`}
    >
      <header className="ddg-header">
        <div>
          <span className="ddg-kicker">ПОДСКАЗКИ ПОД ТВОЙ ПЛАНШЕТ</span>
          <h3 id={`${id}-title`}>
            {app.name} · {app.device}
          </h3>
        </div>
        <label htmlFor={`${id}-device`}>
          Моя программа
          <select
            id={`${id}-device`}
            value={app.id}
            onChange={(event) => dispatch(setDevice(event.target.value))}
          >
            {apps.map((item) => (
              <option key={item.id} value={item.id}>
                {item.device} · {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <GuideContent
        key={app.id}
        app={app}
        technique={selectedTechnique}
        compact={compact}
      />
    </section>
  );
}
