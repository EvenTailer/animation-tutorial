import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  Pause,
  Route,
  BookOpen,
  Layers,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Clock,
  Download,
  PenTool,
  Menu,
  X,
} from "lucide-react";
import { weeks } from "./data/curriculum";
import Diagram, { motionFrames, getDiagramType } from "./Diagram";
import Masterclass from "./Masterclass";
import AnimationStudio from "./AnimationStudio";
import CharacterAnimation, { animationFrames } from "./CharacterAnimation";
import { masterclasses } from "./data/masterclasses";
import "./style.css";
import "./drawing-path.css";
const roadmapCopy = {
  3: [
    "Голова: повторяй за мной",
    "От одного овала до хохолка — крупным планом",
  ],
  4: ["Тело, шея и майка", "По одной форме, детали и складке"],
  5: ["Руки, брюки и обувь", "Пальцы, протез, карманы и шнуровка"],
  6: ["Цельный герой в цвете", "Контур, заливки, свет и материалы"],
  7: ["Герой оживает", "Первое дыхание полного персонажа"],
};

const apps = [
  {
    id: "ipad",
    device: "iPad",
    name: "Procreate",
    tag: "Разовая покупка",
    url: "https://procreate.com/procreate",
    help: "https://help.procreate.com/procreate/handbook/animation",
    setup:
      "Нажми + в галерее → новый холст 2048 × 2048 px. Выбери карандаш в Sketching. В Layers создай отдельные слои «эскиз», «контур», «цвет». Для движения: Actions → Canvas → Animation Assist.",
    export:
      "Actions → Share → PSD сохраняет слои. Для кадров — PNG Files; для просмотра — Animated GIF.",
  },
  {
    id: "samsung",
    device: "Samsung Galaxy",
    name: "Clip Studio Paint",
    tag: "Платные планы",
    url: "https://www.clipstudio.net/en/",
    help: "https://help.clip-studio.com/en-us/manual_en/600_animation/Export_animation.htm",
    setup:
      "File → New → Illustration, 2048 × 2048 px. Начни с Pencil и трёх растровых слоёв: эскиз, контур, цвет. Для анимации создай документ Animation и открой Timeline. В PRO есть ограничение 24 кадра: для наших коротких упражнений достаточно.",
    export:
      "Сохрани исходник .clip. Копию со слоями — PSD; для просмотра — Export animation → Animated GIF. Серийный экспорт cels зависит от редакции.",
  },
  {
    id: "huawei",
    device: "Huawei MatePad",
    name: "GoPaint",
    tag: "Для совместимых моделей",
    url: "https://consumer.huawei.com/en/mobileservices/gopaint/",
    help: "https://consumer.huawei.com/cn/support/content/zh-cn16041996/",
    setup:
      "В My artwork создай холст 2048 × 2048 px. Выбери карандаш, открой Layers и создай эскиз, контур и цвет. Обнови планшет через HOTA: анимация доступна на поддерживаемых моделях и версиях. Если её нет, нарисуй ключевые позы на отдельных слоях и собери движение позже на ПК.",
    export:
      "Menu → Export & share → PSD для продолжения на ПК; PNG для отдельных частей. В версиях с анимацией доступны GIF, MP4 и последовательность кадров.",
  },
];
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function useSaved(key, initial) {
  const [v, set] = useState(() => read(key, initial));
  const [error, setError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
      setError(false);
    } catch {
      setError(true);
    }
  }, [key, v]);
  return [v, set, error];
}
function DrawingPreview({ step }) {
  const column = step.panel % step.columns;
  const row = Math.floor(step.panel / step.columns);
  return (
    <div
      className="week-process-cell"
      role="img"
      aria-label={step.title}
      style={{
        backgroundImage: `url(${step.sheet})`,
        backgroundSize: `${step.columns * 100}% ${step.rows * 100}%`,
        backgroundPosition: `${(column / (step.columns - 1)) * 100}% ${(row / (step.rows - 1)) * 100}%`,
      }}
    />
  );
}
function App() {
  const [view, setView] = useState("home"),
    [theme, setTheme] = useSaved("shtrih-theme", "paper"),
    [device, setDevice] = useSaved("shtrih-device", "ipad"),
    [done, setDone, saveError] = useSaved("shtrih-progress", []),
    [selected, setSelected] = useSaved(
      "shtrih-last-lesson",
      weeks[0].lessons[0].id,
    ),
    [stage, setStage] = useState(0),
    [frame, setFrame] = useState(0),
    [playing, setPlaying] = useState(false),
    [menu, setMenu] = useState(false),
    [checked, setChecked] = useState({}),
    [drawingCourse, setDrawingCourse] = useState("duck"),
    [drawingStart, setDrawingStart] = useState(null),
    [drawingSession, setDrawingSession] = useState(0),
    [animationType, setAnimationType] = useState("idle"),
    [drawingProgress, setDrawingProgress] = useState(() =>
      read("shtrih-masterclass-progress-v2", {}),
    );
  const duckSteps = masterclasses[0].chapters.flatMap((c) => c.steps);
  const duckDone = duckSteps.filter(
    (s) => drawingProgress[`duck:${s.id}`],
  ).length;
  const drawingWeekStages = {
    3: Array.from({ length: 12 }, (_, i) => i),
    4: Array.from({ length: 12 }, (_, i) => i + 12),
    5: Array.from({ length: 24 }, (_, i) => i + 24),
    6: Array.from({ length: 12 }, (_, i) => i + 48),
    10: Array.from({ length: 36 }, (_, i) => i),
  };
  function weekDrawingProgress(w) {
    const indices = drawingWeekStages[w.id];
    if (!indices) return null;
    const course = masterclasses.find(
      (c) => c.id === (w.id === 10 ? "boss" : "duck"),
    );
    const steps = course.chapters.flatMap((c) => c.steps);
    return {
      indices,
      steps,
      course: course.id,
      count: indices.filter(
        (i) => drawingProgress[`${course.id}:${steps[i].id}`],
      ).length,
    };
  }
  useEffect(() => {
    const refresh = () =>
      setDrawingProgress(read("shtrih-masterclass-progress-v2", {}));
    window.addEventListener("shtrih-progress-change", refresh);
    return () => window.removeEventListener("shtrih-progress-change", refresh);
  }, []);
  const lessons = weeks.flatMap((w) => w.lessons),
    lesson = lessons.find((l) => l.id === selected) || lessons[0],
    week = weeks.find((w) => w.lessons.some((l) => l.id === lesson.id)),
    app = apps.find((a) => a.id === device) || apps[0],
    next = lessons.find((l) => !done.includes(l.id)) || lessons[0],
    pct = Math.round((done.length / lessons.length) * 100),
    diagramType = getDiagramType(lesson),
    frameNames = animationFrames[diagramType] || motionFrames[diagramType],
    motion = !!frameNames,
    frameCount = frameNames?.length || 1;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        motion
          ? setFrame((x) => (x + 1) % frameCount)
          : setStage((x) => (x + 1) % lesson.steps.length),
      motion
        ? {
            hit: [450, 600, 120, 200, 450],
            jump: [350, 450, 130, 300, 200, 450],
          }[diagramType]?.[frame] || 300
        : 1800,
    );
    return () => clearInterval(t);
  }, [playing, motion, lesson, frame]);
  function go(v) {
    setPlaying(false);
    setView(v);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openMasterclass(course = "duck", startAt = null) {
    setPlaying(false);
    setDrawingCourse(course);
    setDrawingStart(startAt);
    setDrawingSession((n) => n + 1);
    go("masterclass");
  }
  function openAnimation(type = "idle") {
    setAnimationType(type);
    go("animation");
  }
  function open(id) {
    setSelected(id);
    setStage(0);
    setFrame(0);
    setPlaying(false);
    setChecked({});
    go("lesson");
  }
  function complete() {
    setDone((d) =>
      d.includes(lesson.id)
        ? d.filter((x) => x !== lesson.id)
        : [...d, lesson.id],
    );
  }
  function backup() {
    const blob = new Blob(
      [
        JSON.stringify({
          version: 3,
          completed: done,
          device,
          theme,
          masterclassProgress: drawingProgress,
          masterclassCursor: read("shtrih-masterclass-cursor-v2", {}),
          animationProgress: read("gramilya-animation-progress-v1", {}),
          previousDrawingProgress: read("shtrih-masterclass-progress-v1", {}),
        }),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gramilya-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(e) {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (![1, 2, 3].includes(data.version) || !Array.isArray(data.completed))
        throw Error();
      if (data.version === 3) {
        const validKeys = new Set(
          masterclasses.flatMap((c) =>
            c.chapters.flatMap((ch) => ch.steps.map((s) => `${c.id}:${s.id}`)),
          ),
        );
        const restored = Object.fromEntries(
          Object.entries(data.masterclassProgress || {}).filter(
            ([key, value]) => validKeys.has(key) && value === true,
          ),
        );
        const cursors = Object.fromEntries(
          masterclasses.map((c) => [
            c.id,
            Math.max(
              0,
              Math.min(
                c.chapters.flatMap((ch) => ch.steps).length - 1,
                Number.isInteger(data.masterclassCursor?.[c.id])
                  ? data.masterclassCursor[c.id]
                  : 0,
              ),
            ),
          ]),
        );
        localStorage.setItem(
          "shtrih-masterclass-progress-v2",
          JSON.stringify(restored),
        );
        localStorage.setItem(
          "shtrih-masterclass-cursor-v2",
          JSON.stringify(cursors),
        );
        setDrawingProgress(restored);
        if (
          data.previousDrawingProgress &&
          typeof data.previousDrawingProgress === "object" &&
          !Array.isArray(data.previousDrawingProgress)
        ) {
          localStorage.setItem(
            "shtrih-masterclass-progress-v1",
            JSON.stringify(data.previousDrawingProgress),
          );
        }
        const validAnimationKeys = new Set(
          Object.entries(animationFrames).flatMap(([type, frames]) =>
            frames.map((_, index) => `${type}:${index}`),
          ),
        );
        localStorage.setItem(
          "gramilya-animation-progress-v1",
          JSON.stringify(
            Object.fromEntries(
              Object.entries(data.animationProgress || {}).filter(
                ([key, value]) => validAnimationKeys.has(key) && value === true,
              ),
            ),
          ),
        );
      } else if (data.version === 2) {
        localStorage.setItem(
          "shtrih-masterclass-progress-v1",
          JSON.stringify(data.masterclassProgress || {}),
        );
        localStorage.setItem(
          "shtrih-masterclass-cursor-v1",
          JSON.stringify(data.masterclassCursor || {}),
        );
      }
      setDone([
        ...new Set(
          data.completed.filter((id) => lessons.some((l) => l.id === id)),
        ),
      ]);
      if (apps.some((a) => a.id === data.device)) setDevice(data.device);
      if (["paper", "light", "dark"].includes(data.theme)) setTheme(data.theme);
      alert("Прогресс восстановлен");
    } catch {
      alert(
        "Не удалось прочитать файл прогресса. Выбери JSON, скачанный из GRAMILYA.",
      );
    }
    e.target.value = "";
  }
  return (
    <div className="shell">
      <aside className={menu ? "sidebar mobile-open" : "sidebar"}>
        <button className="brand" onClick={() => go("home")}>
          <span className="brand-mark">G.</span>
          <span>
            GRAMILYA<span className="brand-sub">МАСТЕРСКАЯ ПЕРСОНАЖА</span>
          </span>
        </button>
        <button
          className="mobile-close icon"
          aria-label="Закрыть меню"
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        <div className="side-label">ТВОЯ МАСТЕРСКАЯ</div>
        <nav>
          {[
            ["home", Route, "Мой маршрут"],
            ["masterclass", BookOpen, "Рисуем героя"],
            ["animation", Play, "Анимация героя"],
            ["lesson", PenTool, "Основы рисунка"],
            ["tools", SlidersHorizontal, "Инструменты"],
            ["library", Layers, "Шпаргалки"],
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() =>
                id === "masterclass"
                  ? openMasterclass()
                  : id === "lesson"
                    ? open(selected)
                    : go(id)
              }
            >
              <Icon size={19} />
              {label}
              {id === "home" && <span className="nav-count">10</span>}
            </button>
          ))}
        </nav>
        <div className="side-note">
          <span className="tiny-star">✳</span>
          <p>
            Не нужно уметь.
            <br />
            Нужно попробовать.
          </p>
          <small>Один штрих уже считается.</small>
        </div>
        <div className="side-bottom">
          <span className="side-label">ОФОРМЛЕНИЕ</span>
          <div className="themes">
            {[
              ["paper", "Бумага", PenTool],
              ["light", "Светлая", Sun],
              ["dark", "Ночная", Moon],
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                title={label}
                aria-label={`Тема: ${label}`}
                aria-pressed={theme === id}
                className={theme === id ? "chosen" : ""}
                onClick={() => setTheme(id)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <small>Бесплатно. Без спешки. Без оценок.</small>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <div>
            <button
              className="mobile-menu icon"
              aria-label="Открыть меню"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Мастерская <ChevronRight size={13} />{" "}
              <b>
                {
                  {
                    home: "Мой маршрут",
                    lesson: "Занятие",
                    masterclass: "Рисуем героя",
                    animation: "Анимация героя",
                    tools: "Инструменты",
                    library: "Шпаргалки",
                  }[view]
                }
              </b>
            </span>
          </div>
          <button className="header-progress" onClick={() => go("tools")}>
            <span className="status-dot" />
            {saveError
              ? "Не удалось сохранить"
              : `Герой: ${duckDone} из ${duckSteps.length} шагов`}
            <span className="mini-progress">
              <i style={{ width: (duckDone / duckSteps.length) * 100 + "%" }} />
            </span>
          </button>
        </header>
        <main>
          {view === "home" && (
            <>
              <div className="eyebrow">
                <span /> ОТ ПЕРВОЙ ЛИНИИ ДО ПЕРВОГО ДВИЖЕНИЯ
              </div>
              <section className="hero">
                <div className="hero-copy">
                  <h1>
                    Твой персонаж.
                    <br />
                    Твоими <em>руками.</em>
                  </h1>
                  <p>
                    Нарисуй именно этого кибер-утёнка: от построения до перьев,
                    механики, складок и финальных бликов. 60 небольших шагов:
                    крупный фрагмент и одно действие, которое ты повторяешь на
                    планшете.
                  </p>
                  <button className="primary" onClick={() => openMasterclass()}>
                    {duckDone
                      ? "Продолжить рисунок героя"
                      : "Нарисовать этого героя"}
                    <ArrowUpRight size={20} />
                  </button>
                  <button
                    className="text-button hero-foundations"
                    onClick={() => open(next.id)}
                  >
                    Сначала разминки и основы <ArrowRight size={14} />
                  </button>
                  <div className="hero-meta">
                    <span>
                      <Clock size={15} /> 60 шагов · без спешки
                    </span>
                    <span>
                      Пройдено {duckDone}/{duckSteps.length}
                    </span>
                  </div>
                  <div className="hand-note">можно начать с нуля ↗</div>
                </div>
                <div className="hero-art">
                  <div className="art-top">
                    <span>ПРОЕКТ 01 / КИБЕР-УТЁНОК</span>
                    <span>↗</span>
                  </div>
                  <img
                    src="/assets/duck-hero.png"
                    alt="Референс кибер-утёнка спереди, с двух сторон и сзади"
                  />
                  <div className="art-footer">
                    <span>
                      <i /> Наш ориентир, шаг за шагом
                    </span>
                    <span>CHARACTER STUDY</span>
                  </div>
                  <span className="art-sticker">
                    От кружка
                    <br />
                    до характера.
                  </span>
                </div>
              </section>
              <section
                className="drawing-path"
                aria-label="Путь к законченному рисунку"
              >
                <div>
                  <span className="eyebrow">
                    ОДИН ГЕРОЙ · ОДИН ЗАКОНЧЕННЫЙ РИСУНОК
                  </span>
                  <h2>Не останавливаемся на эскизе.</h2>
                  <p>
                    Построение → лицо и перья → одежда и механика → цвет → тени
                    и фактуры. Каждый этап продолжает предыдущий. В подарок —
                    такой же разбор кибер-волка.
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => openMasterclass("duck", 0)}
                >
                  Все этапы отрисовки <ArrowUpRight size={18} />
                </button>
              </section>
              <section className="journey-strip">
                <div>
                  <span className="strip-symbol">✳</span>
                  <p>
                    <strong>10 недель в своём темпе</strong>
                    <small>
                      Можно повторять, останавливаться и идти дальше.
                    </small>
                  </p>
                </div>
                <div className="strip-stat">
                  <b>30</b>
                  <span>
                    практических
                    <br />
                    занятий
                  </span>
                </div>
                <div className="strip-stat">
                  <b>0 ₽</b>
                  <span>
                    за обучение
                    <br />
                    без регистрации
                  </span>
                </div>
              </section>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">МАЛЕНЬКИЕ ШАГИ. БОЛЬШОЙ ПУТЬ.</span>
                  <h2>Твой маршрут</h2>
                </div>
                <span className="soft-label">
                  Все недели открыты <ArrowUpRight size={14} />
                </span>
              </div>
              <div className="roadmap">
                {weeks.map((w, i) => {
                  const drawing = weekDrawingProgress(w);
                  const weekTitle = roadmapCopy[w.id]?.[0] || w.title;
                  const weekSubtitle = roadmapCopy[w.id]?.[1] || w.subtitle;
                  const animation = { 7: "idle", 8: "run", 9: "hit" }[w.id];
                  const animationDone = read(
                    "gramilya-animation-progress-v1",
                    {},
                  );
                  const poseCount = animation
                    ? animationFrames[animation].filter(
                        (_, f) => animationDone[`${animation}:${f}`],
                      ).length
                    : 0;
                  const count = w.lessons.filter((l) =>
                    done.includes(l.id),
                  ).length;
                  return (
                    <article
                      key={w.id}
                      className={"week-card " + (i === 0 ? "featured" : "")}
                    >
                      <div className="week-top">
                        <span>НЕДЕЛЯ {String(w.id).padStart(2, "0")}</span>
                        <span>
                          {(
                            drawing
                              ? drawing.count === drawing.indices.length
                              : animation
                                ? poseCount ===
                                  animationFrames[animation].length
                                : count === 3
                          ) ? (
                            <Check size={17} />
                          ) : (
                            String(i + 1).padStart(2, "0")
                          )}
                        </span>
                      </div>
                      <div className="week-visual">
                        {i >= 2 && i <= 4 ? (
                          <DrawingPreview
                            step={duckSteps[[11, 23, 35][i - 2]]}
                          />
                        ) : i === 5 ? (
                          <img
                            className="week-reference"
                            src={
                              i === 5
                                ? "/assets/duck-hero.png"
                                : "/assets/duck-process-b.png"
                            }
                            alt="Детальная отрисовка исходного героя"
                            loading="lazy"
                          />
                        ) : i >= 6 && i <= 8 ? (
                          <DrawingPreview
                            step={{
                              sheet: `/assets/duck-${["idle", "run", "hit"][i - 6]}-frames.png`,
                              columns: i === 6 ? 2 : i === 7 ? 4 : 3,
                              rows: 2,
                              panel: 0,
                              title: "Полноцветная поза героя",
                            }}
                          />
                        ) : i === 9 ? (
                          <img
                            className="week-reference"
                            src="/assets/cyber-boss.png"
                            alt="Бонусный мастер-класс кибер-волка"
                            loading="lazy"
                          />
                        ) : (
                          <Diagram
                            type={w.lessons[1]?.diagram || "body"}
                            stage={i < 2 ? i : 3}
                            frame={i % 4}
                          />
                        )}
                        <span>
                          {i < 3 ? "ОСНОВЫ" : i < 7 ? "ПЕРСОНАЖ" : "ДВИЖЕНИЕ"}
                        </span>
                      </div>
                      <h3>{weekTitle}</h3>
                      <p>{weekSubtitle}</p>
                      <div className="week-bottom">
                        <span>
                          {drawing
                            ? `${drawing.count}/${drawing.indices.length} этапов`
                            : animation
                              ? `${poseCount}/${animationFrames[animation].length} поз`
                              : `${count}/3 занятия`}
                        </span>
                        <button
                          aria-label={`Открыть неделю ${w.id}: ${weekTitle}`}
                          onClick={() =>
                            drawing
                              ? openMasterclass(
                                  drawing.course,
                                  drawing.indices.find(
                                    (j) =>
                                      !drawingProgress[
                                        `${drawing.course}:${drawing.steps[j].id}`
                                      ],
                                  ) ?? drawing.indices[0],
                                )
                              : i >= 6 && i <= 8
                                ? openAnimation(["idle", "run", "hit"][i - 6])
                                : open(
                                    w.lessons.find((l) => !done.includes(l.id))
                                      ?.id || w.lessons[0].id,
                                  )
                          }
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="honest-note">
                <BookOpen size={23} />
                <p>
                  <strong>Десять недель — ориентир, а не дедлайн.</strong>{" "}
                  Детализация референса потребует повторений и дополнительной
                  практики. Первый результат может быть проще — он всё равно
                  твой.
                </p>
              </div>
              <section className="boss">
                <div>
                  <span className="eyebrow">
                    БОНУС · КОГДА ЗАХОЧЕТСЯ БОЛЬШЕ
                  </span>
                  <h2>
                    А кто будет
                    <br />
                    твоим боссом?
                  </h2>
                  <p>
                    В подарок — подробная отрисовка этого кибер-волка. 36
                    небольших шагов: морда и грива, рваная майка, механическая
                    лапа, хвост, цвет и текстуры. Его оригинал можно скачать.
                  </p>
                  <button
                    className="secondary"
                    onClick={() => openMasterclass("boss")}
                  >
                    Нарисовать босса по шагам <ArrowUpRight size={18} />
                  </button>
                </div>
                <img
                  src="/assets/cyber-boss.png"
                  alt="Дополнительный концепт кибер-зверя для самостоятельной практики"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </section>
            </>
          )}
          {view === "masterclass" && (
            <>
              <div className="masterclass-app">
                <span>Рисую в</span>
                <select
                  aria-label="Программа для мастер-класса"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.device} · {a.name}
                    </option>
                  ))}
                </select>
                <button className="text-button" onClick={() => go("tools")}>
                  Как настроить программу <ArrowUpRight size={14} />
                </button>
              </div>
              <Masterclass
                key={drawingSession}
                initial={drawingCourse}
                startAt={drawingStart}
              />
              <div className="drawing-support">
                <BookOpen size={22} />
                <div>
                  <h3>Нужна дополнительная практика?</h3>
                  <p>
                    Основы, ракурсы и анимация остаются под рукой. Этап рисунка
                    сохранится, и ты сможешь к нему вернуться.
                  </p>
                </div>
                <button className="secondary" onClick={() => go("animation")}>
                  Анимация полного героя <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {view === "animation" && (
            <AnimationStudio key={animationType} initial={animationType} />
          )}
          {view === "lesson" && (
            <>
              <div className="lesson-head">
                <div>
                  <span className="eyebrow">
                    НЕДЕЛЯ {week.id} · {week.title}
                  </span>
                  <h1>{lesson.title}</h1>
                  <p>
                    <Clock size={16} /> Около {lesson.duration} минут · можно
                    разделить на два подхода
                  </p>
                </div>
                <select
                  aria-label="Выбрать занятие"
                  value={selected}
                  onChange={(e) => open(e.target.value)}
                >
                  {weeks.map((w) => (
                    <optgroup key={w.id} label={`Неделя ${w.id} · ${w.title}`}>
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
              <div className="lesson-layout">
                <div>
                  <div className="lesson-canvas">
                    <div className="canvas-label">
                      <span>
                        {motion ? "КЛЮЧЕВЫЕ ПОЗЫ" : "ПОШАГОВАЯ СХЕМА"}
                      </span>
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
                            : setStage((x) =>
                                Math.min(lesson.steps.length - 1, x + 1),
                              );
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
                          Схема проигрывается медленно для разбора; у прыжка и
                          удара фазы имеют разную длительность. Для своей пробы
                          начни с 6–8 кадров/с. Добавляй промежуточные рисунки
                          между ключевыми позами.
                        </p>
                      </>
                    )}
                    <p className="caption">
                      {animationFrames[diagramType]
                        ? "Перед тобой полная поза героя. Повтори положение тела, затем перенеси знакомые детали костюма и материалы из мастер-класса."
                        : "Упрощённая схема объясняет принцип. Рисуй в своей программе; детали героя добавляй постепенно."}
                    </p>
                  </div>
                </div>
                <div className="lesson-instructions">
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
                    <button className="text-button" onClick={() => go("tools")}>
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
                  <small>
                    Чек-лист помогает оценить себя. Отметку ставишь ты.
                  </small>
                </div>
              </div>
              <div className="lesson-nav">
                <button className="secondary" onClick={() => go("home")}>
                  К маршруту
                </button>
                {lessons.indexOf(lesson) < 29 && (
                  <button
                    className="secondary"
                    onClick={() =>
                      open(lessons[lessons.indexOf(lesson) + 1].id)
                    }
                  >
                    Следующее занятие <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </>
          )}
          {view === "tools" && (
            <>
              <span className="eyebrow">ПЕРЕД ПЕРВЫМ ШТРИХОМ</span>
              <h1>
                Твой планшет.
                <br />
                Твои инструменты.
              </h1>
              <p className="intro">
                Учимся рисовать в твоей программе. Выбери устройство — подсказки
                в занятиях подстроятся. Сам сайт бесплатный; условия приложений
                отличаются.
              </p>
              <div className="app-grid">
                {apps.map((a) => (
                  <button
                    key={a.id}
                    className={
                      "app-card " + (device === a.id ? "selected" : "")
                    }
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
                <span className="eyebrow">
                  НАСТРОЙКА · {app.name.toUpperCase()}
                </span>
                <h2>Начни с чистого листа</h2>
                <p>{app.setup}</p>
                <h3>Как сохранить работу</h3>
                <p>{app.export}</p>
                <div className="link-row">
                  <a href={app.url} target="_blank" rel="noreferrer">
                    Официальный сайт <ArrowUpRight size={16} />
                  </a>
                  <a href={app.help} target="_blank" rel="noreferrer">
                    Руководство по анимации и экспорту{" "}
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <p className="caption">
                  Совместимость и условия проверены 29 октября 2026. Перед
                  покупкой проверь свою модель, ОС и магазин. Для бесплатного
                  старта на iPad, Android и поддерживаемых Huawei есть{" "}
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
                  упражнения: {done.length} из 30 занятий ({pct}%). Отметки,
                  программа и тема сохраняются в этом браузере. Очистка данных
                  браузера удалит их. Рисунки хранятся в твоём приложении на
                  планшете.
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
                  <button
                    className="text-button"
                    onClick={() => {
                      if (
                        confirm(
                          "Удалить все отметки о выполнении? Сначала можно скачать прогресс.",
                        )
                      ) {
                        setDone([]);
                        localStorage.removeItem(
                          "shtrih-masterclass-progress-v2",
                        );
                        localStorage.removeItem("shtrih-masterclass-cursor-v2");
                        localStorage.removeItem(
                          "gramilya-animation-progress-v1",
                        );
                        setDrawingProgress({});
                      }
                    }}
                  >
                    Сбросить отметки
                  </button>
                </div>
              </section>
            </>
          )}
          {view === "library" && (
            <>
              <span className="eyebrow">ПОД РУКОЙ</span>
              <h1>
                Меньше искать.
                <br />
                Больше рисовать.
              </h1>
              <div className="reference-panel">
                <h2>Твой референс</h2>
                <img
                  src="/assets/duck-hero.png"
                  alt="Четыре ракурса героя для изучения пропорций и деталей"
                />
                <a className="secondary" href="/assets/duck-hero.png" download>
                  Скачать референс <Download size={17} />
                </a>
              </div>
              <div className="cheats">
                {[
                  [
                    "01",
                    "Сначала крупное",
                    "Силуэт → простые объёмы → пропорции → контур → большие пятна цвета → тени → детали. Если поза не читается в маленьком размере, мелкие детали её не спасут.",
                  ],
                  [
                    "02",
                    "Кисти без магии",
                    "Для старта достаточно карандаша, непрозрачной круглой кисти и ластика. Для контура уменьши размер кисти; для больших пятен увеличь. Стабилизацию держи небольшой, чтобы чувствовать движение руки.",
                  ],
                  [
                    "03",
                    "Слои для рисунка",
                    "Снизу вверх: фон, эскиз, цвет, тени, контур, детали. Эскиз сделай полупрозрачным. Не рисуй цвет на слое контура. Сохраняй исходный файл до объединения слоёв.",
                  ],
                  [
                    "04",
                    "Кадр и риг",
                    "Кадр — отдельный рисунок движения. В покадровой анимации ты рисуешь позы заново. Риг на ПК двигает отдельные части: это другой процесс. Наши упражнения с кадрами помогают понять позы и вес.",
                  ],
                  [
                    "05",
                    "Пакет для рига",
                    "Раздели head, torso, upper_arm_L, forearm_L, hand_L, thigh_L, shin_L, foot_L и правую сторону (_R). L/R — стороны персонажа. Дорисуй скрытые участки плеча, локтя и колена с запасом. Проверь, что при повороте не появляются дырки.",
                  ],
                  [
                    "06",
                    "Перед передачей на ПК",
                    "Сохрани слоёный PSD и исходник программы. Экспортируй части в PNG с прозрачностью, с одинаковым размером холста и без автоматической обрезки. Не меняй масштаб между частями. Запиши, где центры суставов, и проверь импорт в выбранную программу рига.",
                  ],
                ].map(([n, title, text]) => (
                  <article key={n}>
                    <span className="eyebrow">ПАМЯТКА {n}</span>
                    <h2>{title}</h2>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
              <section className="info-panel">
                <span className="eyebrow">ТВОЙ БОНУС</span>
                <h2>Нарисуй этого кибер-волка</h2>
                <p>
                  Полный разбор существующего босса: от пропорций до меха,
                  механической руки, одежды и финального цвета. Тридцать шесть
                  рисованных этапов и конкретные действия на планшете.
                </p>
                <div className="link-row">
                  <button
                    className="primary"
                    onClick={() => openMasterclass("boss")}
                  >
                    Открыть мастер-класс <ArrowUpRight size={17} />
                  </button>
                  <a
                    className="secondary"
                    href="/assets/cyber-boss.png"
                    download="cyber-wolf-boss.png"
                  >
                    Скачать босса <Download size={17} />
                  </a>
                </div>
                <img
                  className="boss-reference"
                  src="/assets/cyber-boss.png"
                  alt="Пример дополнительного персонажа: кибер-волк"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <p className="caption">
                  Сохранён тот же концепт босса. Иллюстрации созданы с помощью
                  ИИ; при работе сверяй детали с оригиналом.
                </p>
              </section>
              <section className="info-panel alternate-hero">
                <div>
                  <span className="eyebrow">
                    ОТДЕЛЬНЫЙ КОНЦЕПТ · ГОРОДСКОЙ РАЗВЕДЧИК
                  </span>
                  <h2>
                    Больше характера.
                    <br />
                    Всё ещё твой утёнок.
                  </h2>
                  <p>
                    Самостоятельный образ: индиговая куртка, бирюзовый шарф,
                    компактный протез и лёгкая обувь. Подвижный городской
                    разведчик с собственным силуэтом. Основной урок остаётся по
                    исходному герою.
                  </p>
                  <a
                    className="secondary"
                    href="/assets/duck-hero-v3.png"
                    download="duck-hero-v3.png"
                  >
                    Скачать новый концепт <Download size={17} />
                  </a>
                  <p className="caption">
                    Отдельный художественный вариант, созданный с помощью ИИ.
                  </p>
                </div>
                <img
                  src="/assets/duck-hero-v3.png"
                  alt="Новый концепт главного героя: харизматичный кибер-утёнок"
                  loading="lazy"
                />
              </section>
            </>
          )}
          <footer>
            <span className="footer-brand">GRAMILYA</span>
            <span>Рисуй в своём темпе. Возвращайся, когда захочешь.</span>
            <button onClick={() => go("tools")}>
              Настройки и прогресс <ArrowUpRight size={14} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
