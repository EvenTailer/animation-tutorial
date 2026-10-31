import React from "react";
import { canvasLabel } from "./data/projectSetup.js";
import { apps } from "./data/apps.js";
import { useAppSelector, selectSettings } from "./store/index.js";
import "./beginner-setup.css";

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
          <strong>{canvasLabel(character)}, вертикально</strong>. Рисуй на одном
          холсте до конца.
        </li>
        <li>
          <strong>Создай один слой эскиза.</strong> Слой — как прозрачный лист
          поверх фона: на нём можно рисовать и стирать отдельно.{" "}
          {app.layerStart} Назови его «01 Голова — построение». Слои для глаз,
          одежды и цвета добавишь позже — создавать весь список сейчас не нужно.
        </li>
        <li>
          <strong>Выбери карандаш и приблизь лист.</strong> Разведи два пальца,
          чтобы область головы стала крупнее. «150–200%» — увеличение просмотра,
          а не размера рисунка; попадать в точное число не обязательно. Если
          линия слишком тёмная, уменьши непрозрачность кисти.
        </li>
      </ol>
      <p>
        Сохрани проект в своей программе. Здесь сохраняются номер шага и твои
        отметки; сам рисунок остаётся на планшете.
      </p>
    </section>
  );
}

export function HeadPlacement() {
  return (
    <figure className="head-placement">
      <svg
        viewBox="0 0 240 320"
        role="img"
        aria-labelledby="head-placement-title"
      >
        <title id="head-placement-title">
          Целый вертикальный холст: голова в профиль сверху, справа оставлено
          место для клюва, снизу — для тела
        </title>
        <rect
          x="1"
          y="1"
          width="238"
          height="318"
          rx="4"
          fill="var(--panel)"
          stroke="var(--muted)"
        />
        <path d="M120 16V304" stroke="var(--line)" strokeDasharray="4 4" />
        <ellipse
          cx="112"
          cy="48"
          rx="15"
          ry="18"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <path
          d="M122 48L141 54L124 59"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        <path d="M143 49H180M143 150H172" stroke="var(--muted)" />
        <text x="145" y="42" fill="var(--ink)" fontSize="10">
          голова
        </text>
        <text x="145" y="143" fill="var(--muted)" fontSize="10">
          место
        </text>
        <text x="145" y="158" fill="var(--muted)" fontSize="10">
          для тела
        </text>
      </svg>
      <figcaption>
        <strong>Сначала посмотри на весь лист.</strong> Рисуем вправо: справа от
        овала оставь место клюву и груди. Овал занимает примерно одну девятую
        высоты листа и одну восьмую ширины. Над ним оставь примерно высоту ещё
        одного овала для хохолка. Не измеряй линейкой: важнее оставить место
        телу. Схема показывает расположение; крупное изображение рядом — новый
        профиль головы.
      </figcaption>
    </figure>
  );
}
