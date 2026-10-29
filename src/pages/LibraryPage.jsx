import React from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, selectProgress } from "../store/index.js";
import { drawPath, COURSE_COUNTS } from "../routing/paths.js";
export default function LibraryPage() {
  const navigate = useNavigate();
  const progress = useAppSelector(selectProgress);
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
  return (
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
          Полный разбор существующего босса: от пропорций до меха, механической
          руки, одежды и финального цвета. Тридцать шесть рисованных этапов и
          конкретные действия на планшете.
        </p>
        <div className="link-row">
          <button className="primary" onClick={() => openMasterclass("boss")}>
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
          Сохранён тот же концепт босса. Иллюстрации созданы с помощью ИИ; при
          работе сверяй детали с оригиналом.
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
            Самостоятельный образ: индиговая куртка, бирюзовый шарф, компактный
            протез и лёгкая обувь. Подвижный городской разведчик с собственным
            силуэтом. Основной урок остаётся по исходному герою.
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
  );
}
