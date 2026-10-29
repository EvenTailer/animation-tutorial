import React, { useEffect, useState } from "react";
import "./character-animation.css";

const sheets = {
  run: {
    src: "/assets/duck-run-frames.png",
    columns: 4,
    rows: 2,
    title: "Бег кибер-утёнка",
  },
  jump: {
    src: "/assets/duck-jump-frames.png",
    columns: 3,
    rows: 2,
    title: "Прыжок кибер-утёнка",
  },
  hit: {
    src: "/assets/duck-hit-frames.png",
    columns: 3,
    rows: 2,
    title: "Удар кибер-утёнка",
  },
  idle: {
    src: "/assets/duck-idle-frames.png",
    columns: 2,
    rows: 2,
    title: "Живое ожидание кибер-утёнка",
  },
};

import {
  animationFrames,
  animationDurations,
  animationLessons,
} from "./data/animation.js";
export {
  animationFrames,
  animationDurations,
  animationLessons,
} from "./data/animation.js";
export default function CharacterAnimation({ type = "idle", frame = 0 }) {
  const selected = Object.hasOwn(sheets, type) ? type : "idle",
    sheet = sheets[selected];
  const count = animationFrames[selected].length,
    number = Number.isFinite(frame) ? Math.floor(frame) : 0,
    index = ((number % count) + count) % count;
  const [loaded, setLoaded] = useState({
    src: null,
    aspect: 1,
    status: "loading",
  });
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active)
        setLoaded({
          src: sheet.src,
          aspect:
            img.naturalWidth / sheet.columns / (img.naturalHeight / sheet.rows),
          status: "ready",
        });
    };
    img.onerror = () => {
      if (active) setLoaded({ src: sheet.src, aspect: 1, status: "error" });
    };
    img.src = sheet.src;
    return () => {
      active = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [sheet.src, sheet.columns, sheet.rows]);
  const current =
      loaded.src === sheet.src ? loaded : { aspect: 1, status: "loading" },
    col = index % sheet.columns,
    row = Math.floor(index / sheet.columns),
    caption = animationFrames[selected][index];
  return (
    <figure className="character-animation" aria-label={sheet.title}>
      <figcaption className="character-animation-heading">
        <span>{sheet.title}</span>
        <span>
          Кадр {index + 1} / {count}
        </span>
      </figcaption>
      <div
        className="character-animation-stage"
        aria-busy={current.status === "loading"}
      >
        {current.status === "error" ? (
          <p className="character-animation-error" role="status">
            Не удалось загрузить рисунки движения. Проверь соединение и открой
            занятие ещё раз.
          </p>
        ) : (
          <div
            className="character-animation-raster"
            role="img"
            aria-label={`${sheet.title}: ${caption}. Полноцветная ключевая поза исходного персонажа.`}
            style={{
              aspectRatio: current.aspect,
              maxWidth: `${Math.max(280, Math.min(720, current.aspect * 560))}px`,
              backgroundImage: `url("${sheet.src}")`,
              backgroundSize: `${sheet.columns * 100}% ${sheet.rows * 100}%`,
              backgroundPosition: `${(col / (sheet.columns - 1)) * 100}% ${(row / (sheet.rows - 1)) * 100}%`,
            }}
          />
        )}
        {current.status === "loading" && (
          <span className="character-animation-loading">
            Загружаем рисунки…
          </span>
        )}
      </div>
      <div className="character-animation-ground">
        <span>Земля — общий ориентир для всех кадров</span>
      </div>
      <div className="character-animation-caption">
        <strong>
          {String(index + 1).padStart(2, "0")} · {caption}
        </strong>
        <span>{animationLessons[selected][index].focus}</span>
      </div>
      <p className="character-animation-note">
        Рассматривай полную позу, затем повторяй её на планшете. Это ключевые
        рисунки: для более плавного движения добавь промежуточные кадры. Стороны
        киберглаза и протеза сверяй с исходным героем.
      </p>
    </figure>
  );
}
