import React from "react";
import { canvasLabel } from "./data/projectSetup.js";
import { apps } from "./data/apps.js";
import { useAppSelector, selectSettings } from "./store/index.js";
import "./beginner-setup.css";
import DeviceDrawingGuide from "./DeviceDrawingGuide.jsx";

export default function BeginnerSetup({ character }) {
  const { device } = useAppSelector(selectSettings);
  const app = apps.find((a) => a.id === device) || apps[0];
  return (
    <section
      className="beginner-setup"
      aria-label="Подготовка для первого рисунка"
    >
      <h3>Первый раз? Подготовим только самое нужное</h3>
      <ol>
        <li>
          <strong>Открой {app.name} на планшете.</strong> {app.canvasStart}{" "}
          Размер для этого героя:{" "}
          <strong>{canvasLabel(character)}, горизонтально</strong>. Рисуй на
          одном холсте до конца.
        </li>
        <li>
          <strong>Создай один слой эскиза.</strong> Слой — как прозрачный лист
          поверх фона: на нём можно рисовать и стирать отдельно.{" "}
          {app.layerStart} Назови его «01 Композиция — построение». Слои для
          глаз, одежды и цвета добавишь позже — создавать весь список сейчас не
          нужно.
        </li>
        <li>
          <strong>Выбери карандаш и приблизь лист.</strong> Разведи два пальца,
          чтобы область головы стала крупнее. «150–200%» — увеличение просмотра,
          а не размера рисунка; попадать в точное число не обязательно. Если
          линия слишком тёмная, уменьши непрозрачность кисти.
        </li>
      </ol>
      <DeviceDrawingGuide technique="sketch" compact />
      <p>
        Сохрани проект в своей программе. Здесь сохраняются номер шага и твои
        отметки; сам рисунок остаётся на планшете.
      </p>
    </section>
  );
}

export function HeadPlacement({ reference, poseGuide }) {
  return (
    <figure className="head-placement">
      <img
        src={poseGuide || reference}
        alt="Размещение исходной позы на горизонтальном холсте"
      />
      <figcaption>
        <strong>Сначала вся композиция, затем детали.</strong> На горизонтальном
        холсте 3600 × 2400 оставь поля вокруг полного силуэта. Повторяем
        исходную позу: положение головы, широкую опору или шпагу и хвост. Не
        заменяй её профилем. Учебные приближения дальше относятся к этому же
        холсту.
      </figcaption>
    </figure>
  );
}
