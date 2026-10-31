import React from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, selectProgress } from "../store/index.js";
import { drawPath, COURSE_COUNTS } from "../routing/paths.js";
import { characters } from "../data/characters.js";
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
        <h2>Актуальный лист модели героя</h2>
        <p>{characters.duck.description}</p>
        <img
          src={characters.duck.model}
          alt="Шесть актуальных видов и поз кибер-утёнка"
        />
        <a className="secondary" href={characters.duck.model} download>
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
      <section className="info-panel alternate-hero">
        <div>
          <span className="eyebrow">ТЕКУЩИЙ ДИЗАЙН · ГЕРОЙ</span>
          <h2>Кибер-утёнок</h2>
          <p>{characters.duck.description}</p>
          <a className="secondary" href={characters.duck.art} download>
            Скачать арт героя <Download size={17} />
          </a>
          <p className="caption">
            Передвижение изучаем по новому образу. Атака пока не определена.
          </p>
        </div>
        <img
          src={characters.duck.art}
          alt="Текущий арт утёнка в малиновом жилете"
          loading="lazy"
        />
      </section>
      <section className="info-panel">
        <span className="eyebrow">ТЕКУЩИЙ ДИЗАЙН · БОСС</span>
        <h2>Гордыня — лев</h2>
        <p>{characters.boss.description}</p>
        <a className="secondary" href={characters.boss.art} download>
          Скачать арт босса <Download size={17} />
        </a>
        <img
          className="boss-reference"
          src={characters.boss.art}
          alt="Босс Гордыня: золотистая грива, длинное пальто и рапира"
          loading="lazy"
        />
      </section>
      <section className="info-panel">
        <span className="eyebrow">УРОКИ НОВЫХ ПЕРСОНАЖЕЙ</span>
        <h2>Повтори исходные арты героя и льва</h2>
        <p>
          Новые растровые этапы показывают построение исходных поз: 84 действия
          для утёнка и 96 для льва. Боковой вид изучается отдельно, после
          основного арта.
        </p>
        <div className="link-row">
          <button className="secondary" onClick={() => openMasterclass("duck")}>
            Исходный утёнок · 84 шага <ArrowUpRight size={17} />
          </button>
          <button className="secondary" onClick={() => openMasterclass("boss")}>
            Исходный лев · 96 шагов <ArrowUpRight size={17} />
          </button>
        </div>
      </section>
    </>
  );
}
