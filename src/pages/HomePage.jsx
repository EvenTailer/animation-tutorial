import React from "react";
import { ArrowUpRight, ArrowRight, Check, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, selectProgress } from "../store/index.js";
import {
  drawPath,
  animationPath,
  lessonPath,
  COURSE_COUNTS,
} from "../routing/paths.js";
import { weeks } from "../data/curriculum";
import { masterclasses } from "../data/masterclasses";
import { animationFrames } from "../data/animation.js";
import Diagram from "../Diagram";
import { characters } from "../data/characters.js";
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

function DrawingPreview({ step }) {
  const col = step.panel % step.columns,
    row = Math.floor(step.panel / step.columns);
  return (
    <div
      className="week-process-cell"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <img
        loading="lazy"
        decoding="async"
        src={step.sheet}
        alt={step.title}
        style={{
          position: "absolute",
          maxWidth: "none",
          width: step.columns * 100 + "%",
          height: step.rows * 100 + "%",
          left: -col * 100 + "%",
          top: -row * 100 + "%",
        }}
      />
    </div>
  );
}
export default function HomePage() {
  const navigate = useNavigate();
  const progress = useAppSelector(selectProgress),
    done = progress.lessons,
    drawingProgress = progress.drawing;
  const open = (id) => navigate(lessonPath(id));
  const openMasterclass = (character = "duck", index = null) =>
    navigate(
      drawPath(
        character,
        index ??
          Math.min(
            COURSE_COUNTS[character] - 1,
            progress.cursors[character] || 0,
          ),
      ),
    );
  const openAnimation = (type = "idle") => navigate(animationPath(type));
  const duckSteps = masterclasses[0].chapters.flatMap((c) => c.steps);
  const duckDone = duckSteps.filter(
    (s) => drawingProgress[`duck:${s.id}`],
  ).length;
  const drawingWeekStages = {
    3: Array.from({ length: 24 }, (_, i) => i),
    4: Array.from({ length: 12 }, (_, i) => i + 24),
    5: Array.from({ length: 24 }, (_, i) => i + 36),
    6: Array.from({ length: 24 }, (_, i) => i + 60),
    10: Array.from({ length: 96 }, (_, i) => i),
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

  const lessons = weeks.flatMap((w) => w.lessons),
    next = lessons.find((l) => !done.includes(l.id)) || lessons[0];
  return (
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
            Новый кибер-утёнок: малиновый жилет, кремовый хохолок и
            асимметричная механика. Изучай его арт и движение: ожидание, бег и
            прыжок. Атаку разработаем позже.
          </p>
          <button
            className="primary"
            onClick={() => openMasterclass("duck", 0)}
          >
            Нарисовать именно этот арт
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
              <Clock size={15} /> От композиции до цвета · без спешки
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
            src={characters.duck.art}
            alt="Новый утёнок в малиновом жилете с механической рукой и ногой"
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
          <span className="eyebrow">РИСОВАНИЕ · ИСХОДНЫЕ АРТЫ</span>
          <h2>От первых линий до нового персонажа.</h2>
          <p>
            84 шага исходного арта утёнка и 96 шагов льва Гордыни: композиция,
            одежда, разные конечности и цвет. Каждый этап сопровождается новым
            рисунком для бокового вида метроидвании.
          </p>
        </div>
        <button
          className="secondary"
          onClick={() => openMasterclass("duck", 0)}
        >
          Рисовать нового героя <ArrowUpRight size={18} />
        </button>
      </section>
      <section className="journey-strip">
        <div>
          <span className="strip-symbol">✳</span>
          <p>
            <strong>10 недель в своём темпе</strong>
            <small>Можно повторять, останавливаться и идти дальше.</small>
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
          const weekTitle =
            w.id === 9
              ? "Чистота движения"
              : w.id === 10
                ? "Подробный арт льва Гордыни"
                : roadmapCopy[w.id]?.[0] || w.title;
          const weekSubtitle =
            w.id === 9
              ? "Прыжок, вес и стабильность без атаки"
              : w.id === 10
                ? "96 действий от композиции до отделки"
                : roadmapCopy[w.id]?.[1] || w.subtitle;
          const animation = { 7: "idle", 8: "run", 9: "jump" }[w.id];
          const animationDone = progress.animation;
          const poseCount = animation
            ? animationFrames[animation].filter(
                (_, f) => animationDone[`${animation}:${f}`],
              ).length
            : 0;
          const count = w.lessons.filter((l) => done.includes(l.id)).length;
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
                        ? poseCount === animationFrames[animation].length
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
                  <DrawingPreview step={duckSteps[[11, 23, 35][i - 2]]} />
                ) : i === 5 ? (
                  <img
                    className="week-reference"
                    src={
                      i === 5
                        ? characters.duck.model
                        : "/assets/duck-process-b.png"
                    }
                    alt="Детальная отрисовка исходного героя"
                    loading="lazy"
                  />
                ) : i >= 6 && i <= 8 ? (
                  <img
                    className="week-reference"
                    src={characters.duck.model}
                    alt="Актуальный лист модели для передвижения"
                    loading="lazy"
                  />
                ) : i === 9 ? (
                  <img
                    className="week-reference"
                    src={characters.boss.art}
                    alt="Гордыня — новый босс-лев"
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
                  {i >= 2 && i <= 5
                    ? "РИСУЕМ НОВЫЙ АРТ"
                    : i === 9
                      ? "НОВЫЙ РЕФЕРЕНС"
                      : i < 2
                        ? "ОСНОВЫ"
                        : "ДВИЖЕНИЕ"}
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
                        ? openAnimation(["idle", "run", "jump"][i - 6])
                        : open(
                            w.lessons.find((l) => !done.includes(l.id))?.id ||
                              w.lessons[0].id,
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
          <strong>Десять недель — ориентир, а не дедлайн.</strong> Детализация
          референса потребует повторений и дополнительной практики. Первый
          результат может быть проще — он всё равно твой.
        </p>
      </div>
      <section className="boss">
        <div>
          <span className="eyebrow">БОНУС · КОГДА ЗАХОЧЕТСЯ БОЛЬШЕ</span>
          <h2>
            А кто будет
            <br />
            твоим боссом?
          </h2>
          <p>
            Гордыня — новый босс-лев: золотистая грива, длинное пальто,
            механическая рука и рапира. Скачай актуальный арт в шпаргалках. В
            новом уроке нарисуем его сбоку: от головы и гривы до сюртука, хвоста
            и цвета.
          </p>
          <button className="secondary" onClick={() => openMasterclass("boss")}>
            Рисовать льва Гордыню <ArrowUpRight size={18} />
          </button>
        </div>
        <img
          src={characters.boss.art}
          alt="Гордыня: лев в чёрно-малиновом пальто с рапирой"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </section>
    </>
  );
}
