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
            Нарисуй именно этого кибер-утёнка: от построения до перьев,
            механики, складок и финальных бликов. 60 небольших шагов: крупный
            фрагмент и одно действие, которое ты повторяешь на планшете.
          </p>
          <button className="primary" onClick={() => openMasterclass()}>
            {duckDone ? "Продолжить рисунок героя" : "Нарисовать этого героя"}
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
          <span className="eyebrow">ОДИН ГЕРОЙ · ОДИН ЗАКОНЧЕННЫЙ РИСУНОК</span>
          <h2>Не останавливаемся на эскизе.</h2>
          <p>
            Построение → лицо и перья → одежда и механика → цвет → тени и
            фактуры. Каждый этап продолжает предыдущий. В подарок — такой же
            разбор кибер-волка.
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
          const weekTitle = roadmapCopy[w.id]?.[0] || w.title;
          const weekSubtitle = roadmapCopy[w.id]?.[1] || w.subtitle;
          const animation = { 7: "idle", 8: "run", 9: "hit" }[w.id];
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
            В подарок — подробная отрисовка этого кибер-волка. 36 небольших
            шагов: морда и грива, рваная майка, механическая лапа, хвост, цвет и
            текстуры. Его оригинал можно скачать.
          </p>
          <button className="secondary" onClick={() => openMasterclass("boss")}>
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
  );
}
