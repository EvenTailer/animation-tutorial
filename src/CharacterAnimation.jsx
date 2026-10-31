import React, { useEffect, useRef, useState } from "react";
import { animationFrames, animationLessons } from "./data/animation.js";
import { animationSheets } from "./data/animationSheets.js";
import { drawAnimationFrame, loadAnimationImage } from "./animationRaster.js";
import "./character-animation.css";
export {
  animationFrames,
  animationDurations,
  animationLessons,
} from "./data/animation.js";
export { animationSheets } from "./data/animationSheets.js";

export default function CharacterAnimation({
  type = "idle",
  frame = 0,
  ghost = false,
}) {
  const selected = Object.hasOwn(animationSheets, type) ? type : "idle";
  const sheet = animationSheets[selected],
    count = sheet.frames.length;
  const index =
    ((Math.floor(Number.isFinite(frame) ? frame : 0) % count) + count) % count;
  const canvas = useRef(null);
  const [loaded, setLoaded] = useState({
    src: null,
    image: null,
    status: "loading",
  });
  const current =
    loaded.src === sheet.src ? loaded : { status: "loading", image: null };
  const caption = animationFrames[selected][index];
  useEffect(() => {
    let active = true;
    loadAnimationImage(selected).then(
      (image) =>
        active && setLoaded({ src: sheet.src, image, status: "ready" }),
      () =>
        active && setLoaded({ src: sheet.src, image: null, status: "error" }),
    );
    return () => {
      active = false;
    };
  }, [selected, sheet.src]);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, sheet.output.width, sheet.output.height);
    if (!current.image) return;
    if (ghost)
      drawAnimationFrame(
        context,
        current.image,
        selected,
        (index + count - 1) % count,
        { opacity: 0.2 },
      );
    drawAnimationFrame(context, current.image, selected, index);
  }, [current.image, selected, index, count, ghost, sheet]);
  return (
    <figure className="character-animation" aria-label={sheet.title}>
      <figcaption className="character-animation-heading">
        <span>{sheet.title} · новый герой</span>
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
            Не удалось загрузить боковые кадры движения. Обнови страницу.
          </p>
        ) : (
          <canvas
            ref={canvas}
            className="character-animation-canvas"
            width={sheet.output.width}
            height={sheet.output.height}
            role="img"
            aria-label={`${sheet.title}: ${caption}. Полноцветный герой в профиль.`}
          />
        )}
        {current.status === "loading" && (
          <span className="character-animation-loading" role="status">
            Загружаем боковые кадры…
          </span>
        )}
      </div>
      <div className="character-animation-ground">
        <span>Вид сбоку · вправо · холст 512 × 600 · общая земля</span>
      </div>
      <div className="character-animation-caption">
        <strong>
          {String(index + 1).padStart(2, "0")} · {caption}
        </strong>
        <span>{animationLessons[selected][index].focus}</span>
      </div>
      <p className="character-animation-note">
        Отдельные растровые позы героя в профиль для метроидвании. Правая рука и
        левая голень остаются механическими. Масштаб одинаков во всех кадрах
        движения; калька показывает предыдущий арт.
      </p>
    </figure>
  );
}
