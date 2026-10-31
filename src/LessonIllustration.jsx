import React, { useId } from "react";
import {
  lessonSceneOperations,
  supportsLessonVisual,
} from "./data/lessonScenes.js";
import {
  getRigPose,
  getRigDrawPlan,
  animationParts,
} from "./data/animationRig.js";
const green = "#3c734c",
  old = "#a7ada4",
  ink = "#39453b",
  red = "#b65145",
  paper = "#f9f8f1";
function Text({ x, y, children, size = 15, color = ink, ...rest }) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="Arial,sans-serif"
      fontSize={size}
      fill={color}
      {...rest}
    >
      {children}
    </text>
  );
}
function Path({ d, color = green, width = 3, dash, ...rest }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash ? "7 6" : undefined}
      {...rest}
    />
  );
}
function Circle({ x, y, r = 8, color = green, fill = "none", dash, ...rest }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={fill}
      stroke={color}
      strokeWidth="3"
      strokeDasharray={dash ? "7 6" : undefined}
      {...rest}
    />
  );
}
function Step({ at, now, children }) {
  return now >= at ? (
    <g stroke={now === at ? green : old} color={now === at ? green : old}>
      {children}
    </g>
  ) : null;
}
const tone = (at, now) => (at === now ? green : old);
function Line({ x1, y1, x2, y2, color = green, dash, ...rest }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray={dash ? "7 6" : undefined}
      {...rest}
    />
  );
}
function Arrow({ x = 100, y = 100, toX = 200, toY = 180, color = green }) {
  const a = Math.atan2(toY - y, toX - x),
    n = 12;
  return (
    <g>
      <Line x1={x} y1={y} x2={toX} y2={toY} color={color} />
      <Path
        color={color}
        d={`M${toX - n * Math.cos(a - 0.5)},${toY - n * Math.sin(a - 0.5)} L${toX},${toY} L${toX - n * Math.cos(a + 0.5)},${toY - n * Math.sin(a + 0.5)}`}
      />
    </g>
  );
}
function Tablet({ p }) {
  return (
    <>
      <rect
        x="110"
        y="70"
        width="390"
        height="340"
        rx="16"
        fill="#eceee5"
        stroke={old}
        strokeWidth="3"
      />
      <rect
        x="130"
        y="90"
        width="290"
        height="290"
        fill="white"
        stroke={p === 0 ? green : old}
        strokeWidth="3"
      />
      <Text x={180} y={52}>
        1200 × 1200 px
      </Text>
      {p >= 1 && (
        <g>
          <rect
            x="440"
            y="120"
            width="140"
            height="54"
            rx="6"
            fill="#e6efdb"
            stroke={tone(1, p)}
            strokeWidth="2"
          />
          <Text x={452} y={151} size={14}>
            ◉ Проба
          </Text>
          <rect
            x="440"
            y="185"
            width="140"
            height="54"
            rx="6"
            fill="white"
            stroke={old}
          />
          <Text x={452} y={216} size={14}>
            ◉ Фон
          </Text>
        </g>
      )}
      {p >= 2 && (
        <Path d="M175 160 Q215 150 255 160" color={tone(2, p)} width={4} />
      )}
      {p >= 3 && (
        <>
          <Path d="M175 220 Q215 210 255 220" width={2} color={tone(3, p)} />
          <Path d="M175 280 Q215 270 255 280" width={8} color={tone(3, p)} />
          <Text x={280} y={223} size={12}>
            тоньше
          </Text>
          <Text x={280} y={283} size={12}>
            толще
          </Text>
        </>
      )}
      {p === 4 && (
        <>
          <Arrow x={300} y={325} toX={260} toY={285} />
          <Text x={150} y={349} size={14}>
            Undo — исчезла · Redo — вернулась
          </Text>
        </>
      )}
      {p === 5 && (
        <g>
          <rect x="147" y="115" width="256" height="242" fill="white" />
          <Text x={169} y={205}>
            Видимость выключена
          </Text>
          <Text x={166} y={236} size={13}>
            Фон остаётся
          </Text>
          <Arrow x={437} y={145} toX={390} toY={180} />
        </g>
      )}
      {p === 6 && (
        <>
          <rect x="147" y="315" width="256" height="43" rx="5" fill="#e5efd9" />
          <Text x={170} y={342}>
            ✓ Проба-01 · 2 слоя
          </Text>
          <Text x={150} y={449} size={14}>
            Сохранить → закрыть → открыть
          </Text>
        </>
      )}
      <Text x={130} y={475} size={13}>
        Рамка — пример экрана, рисуй в своей программе
      </Text>
    </>
  );
}
function Strokes({ p }) {
  return (
    <>
      {[130, 280, 430].map((x) => (
        <g key={x}>
          <Circle x={x} y={110} r={4} fill={tone(0, p)} color={tone(0, p)} />
          <Circle
            x={x + 95}
            y={110}
            r={4}
            fill={tone(0, p)}
            color={tone(0, p)}
          />
        </g>
      ))}
      {p >= 1 && (
        <Path
          d="M130 110 L225 110 M280 110 L375 110 M430 110 L525 110"
          color={tone(1, p)}
          dash
        />
      )}
      {p >= 2 && (
        <>
          <Path d="M130 110 L225 110" color={tone(2, p)} width={4} />
          <Text x={130} y={148} size={13}>
            один проход
          </Text>
        </>
      )}
      {p >= 3 && (
        <>
          <Path
            d="M130 230 L220 230 M295 190 L295 270 M430 270 L510 190"
            color={tone(3, p)}
          />
          <Text x={120} y={310} size={13}>
            горизонталь
          </Text>
          <Text x={260} y={310} size={13}>
            вертикаль
          </Text>
          <Text x={425} y={310} size={13}>
            наклон
          </Text>
          <Arrow x={545} y={230} toX={566} toY={270} />
          <Text x={430} y={345} size={12}>
            поворачивай холст
          </Text>
        </>
      )}
      {p >= 4 && (
        <Path
          d="M130 430 Q185 340 240 430 M300 430 Q350 385 400 430 M450 430 Q490 330 530 430"
          color={tone(4, p)}
        />
      )}
      {p === 5 && (
        <>
          <Circle x={178} y={110} r={63} color={green} />
          <Text x={80} y={488} size={14}>
            Выбери уверенный штрих — не обводи все линии
          </Text>
        </>
      )}
    </>
  );
}
function BasicShapes({ p }) {
  return (
    <>
      <g transform="translate(30,0)">
        <ellipse
          cx="160"
          cy="100"
          rx="70"
          ry="42"
          fill="none"
          stroke={tone(0, p)}
          strokeWidth="3"
        />
        {p >= 1 && <Path d="M330 140 L380 60 L440 140 Z" color={tone(1, p)} />}
        {p >= 2 && (
          <>
            <ellipse
              cx="250"
              cy="330"
              rx="100"
              ry="67"
              fill={p === 5 ? green : "none"}
              stroke={tone(2, p)}
              strokeWidth="3"
            />
            <Circle
              x={290}
              y={245}
              r={57}
              color={tone(2, p)}
              fill={p === 5 ? green : paper}
            />
          </>
        )}
        {p >= 3 && (
          <Path
            d="M337 240 L390 262 L339 280 Z"
            color={tone(3, p)}
            fill={p === 5 ? green : "none"}
          />
        )}
        {p >= 4 && (
          <Path
            d="M215 391 L215 425 L245 425 M290 391 L290 425 L320 425"
            color={tone(4, p)}
            width={p === 5 ? 14 : 3}
          />
        )}
        {p === 5 && (
          <>
            <Path d="M337 240 L390 262 L339 280 Z" color={green} fill={green} />
            <Text x={100} y={475}>
              Условная птица: только крупные формы
            </Text>
          </>
        )}
      </g>
    </>
  );
}
function SphereTurn({ p }) {
  const circle = (cx, side, at) => (
    <g key={cx}>
      <Circle x={cx} y={235} r={78} color={old} />
      {p >= at && (
        <Path
          d={
            side === 0
              ? `M${cx} 157 V313`
              : side > 0
                ? `M${cx + 35} 166 Q${cx + 90} 235 ${cx + 35} 304`
                : `M${cx - 35} 166 Q${cx - 90} 235 ${cx - 35} 304`
          }
          color={tone(at, p)}
        />
      )}
      <Text x={cx - 35} y={355}>
        {side === 0 ? "прямо" : side > 0 ? "вправо" : "влево"}
      </Text>
    </g>
  );
  return (
    <>
      {circle(130, 0, 1)}
      {p >= 2 && (
        <Path
          d="M52 235 Q130 278 208 235 M52 235 Q130 208 208 235"
          color={tone(2, p)}
        />
      )}{" "}
      {p >= 3 && circle(340, 1, 3)}
      {p >= 4 && circle(550, -1, 4)}
      {p === 5 && (
        <>
          <Arrow x={290} y={393} toX={375} toY={393} />
          <Arrow x={580} y={393} toX={495} toY={393} />
          <Text x={80} y={450}>
            Внешний круг тот же — меняется ось на поверхности
          </Text>
        </>
      )}
    </>
  );
}
function BoxCylinder({ p }) {
  return (
    <>
      <Path d="M75 210 H210 V345 H75 Z" color={tone(0, p)} />
      {p >= 1 && (
        <Path
          d="M75 210 L125 155 H260 L210 210 M260 155 V290 L210 345"
          color={tone(1, p)}
        />
      )}
      {p >= 2 && (
        <>
          <Path d="M410 120 L440 280" color={tone(2, p)} dash />
          <ellipse
            cx="410"
            cy="120"
            rx="47"
            ry="17"
            transform="rotate(-10 410 120)"
            fill="none"
            stroke={tone(2, p)}
            strokeWidth="3"
          />
          <ellipse
            cx="440"
            cy="280"
            rx="47"
            ry="17"
            transform="rotate(-10 440 280)"
            fill="none"
            stroke={tone(2, p)}
            strokeWidth="3"
          />
        </>
      )}
      {p >= 3 && (
        <Path d="M364 127 L394 287 M456 113 L486 273" color={tone(3, p)} />
      )}
      {p >= 4 && (
        <>
          <Circle x={448} y={305} r={25} color={tone(4, p)} />
          <Path d="M450 322 L530 390 M470 294 L566 354" color={tone(4, p)} />
          <ellipse
            cx="548"
            cy="372"
            rx="21"
            ry="28"
            transform="rotate(42 548 372)"
            fill="none"
            stroke={tone(4, p)}
            strokeWidth="3"
          />
        </>
      )}
      {p === 5 && (
        <>
          <Path d="M394 287 Q442 312 486 273" color={green} width={5} />
          <Text x={60} y={438}>
            Ближний край — яснее
          </Text>
          <Text x={60} y={467}>
            Скрытые линии — легче или пунктиром
          </Text>
        </>
      )}
    </>
  );
}
function Light({ p, id }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <circle cx="200" cy="275" r="83" />
        </clipPath>
      </defs>
      <Line x1={65} y1={360} x2={600} y2={360} color={old} />
      {p >= 5 && (
        <>
          <ellipse
            cx="275"
            cy="365"
            rx="100"
            ry="15"
            fill={green}
            opacity=".3"
          />
          <path
            d="M420 360 L550 360 L610 390 L480 390 Z"
            fill={green}
            opacity=".3"
          />
        </>
      )}
      <Circle
        x={200}
        y={275}
        r={83}
        color={old}
        fill={p >= 2 ? "#dedfd7" : "none"}
      />
      <path
        d="M380 230 H480 V360 H380 Z M380 230 L430 185 H530 L480 230 M530 185 V315 L480 360"
        fill={p >= 2 ? "#dedfd7" : "none"}
        stroke={old}
        strokeWidth="3"
      />
      {p >= 1 && (
        <>
          <Circle x={70} y={70} r={18} color={tone(1, p)} />
          <Arrow x={95} y={95} toX={165} toY={170} color={tone(1, p)} />
          <Text x={180} y={100}>
            Свет сверху слева
          </Text>
        </>
      )}
      {p >= 3 && (
        <path
          d="M215 180 Q155 260 270 358 H320 V180 Z"
          clipPath={`url(#${id})`}
          fill={tone(3, p)}
          opacity=".75"
        />
      )}
      {p >= 4 && (
        <path d="M480 230 L530 185 V315 L480 360 Z" fill={tone(4, p)} />
      )}
      <Text x={110} y={440}>
        {p === 0
          ? "Контур + общая земля"
          : p === 1
            ? "Одна лампа для обеих форм"
            : p === 2
              ? "Цвет под контуром"
              : p === 3
                ? "Собственная тень по изгибу шара"
                : p === 4
                  ? "Тень по плоскости коробки"
                  : "Падающая тень касается предмета"}
      </Text>
    </>
  );
}
function Mannequin({
  level = 5,
  silhouette = false,
  headScale = 1,
  shoeScale = 1,
  activeLevel = null,
}) {
  const fill = silhouette ? green : "none";
  const stageColor = (stage) =>
    activeLevel === stage ? green : "currentColor";
  return (
    <>
      <ellipse
        cx="330"
        cy="120"
        rx={48 * headScale}
        ry={51 * headScale}
        stroke={stageColor(1)}
        strokeWidth="3"
        fill={fill}
      />
      {silhouette && (
        <path
          d="M366 115 L402 132 L370 145 M293 91 L310 53 L330 75 L357 48 L367 88"
          stroke={green}
          strokeWidth="5"
          fill={green}
        />
      )}
      {level >= 2 && (
        <>
          <ellipse
            cx="330"
            cy="239"
            rx="48"
            ry="65"
            stroke={stageColor(2)}
            strokeWidth="3"
            fill={fill}
          />
          <rect
            x="300"
            y="303"
            width="60"
            height="35"
            rx="8"
            stroke={stageColor(2)}
            strokeWidth="3"
            fill={fill}
          />
        </>
      )}
      {level >= 3 && (
        <>
          <Path
            d="M310 331 L269 384 L217 450 M350 331 L393 390 L429 450"
            color={stageColor(3)}
            width={silhouette ? 33 : 3}
          />
          <Path
            d={`M${217 - 15 * shoeScale} 450 H${217 + 43 * shoeScale} M${429 - 15 * shoeScale} 450 H${429 + 43 * shoeScale}`}
            color={stageColor(3)}
            width={silhouette ? 20 : 5}
          />
        </>
      )}
      {level >= 4 && (
        <>
          <Path
            d="M288 206 L245 260 L200 299 M372 206 L421 248 L474 278"
            color={stageColor(4)}
            width={silhouette ? 23 : 3}
          />
          <ellipse
            cx="200"
            cy="299"
            rx="13"
            ry="10"
            fill={fill}
            stroke={stageColor(4)}
            strokeWidth="3"
          />
          <ellipse
            cx="474"
            cy="278"
            rx="13"
            ry="10"
            fill={fill}
            stroke={stageColor(4)}
            strokeWidth="3"
          />
          {!silhouette &&
            [
              [245, 260],
              [269, 384],
              [393, 390],
              [421, 248],
            ].map(([x, y]) => (
              <Circle key={x} x={x} y={y} r={8} color="currentColor" />
            ))}
        </>
      )}
    </>
  );
}
function Figure({ p, variant }) {
  if (variant === "gesture")
    return (
      <>
        <Line x1={100} y1={460} x2={560} y2={460} color={old} />
        <Path d="M285 460 L303 437 L350 447 L361 460 Z" color={tone(0, p)} />
        {p >= 1 && (
          <>
            <Circle x={326} y={309} r={7} color={tone(1, p)} />
            <Path d="M326 309 V460" color={tone(1, p)} dash />
          </>
        )}
        {p >= 2 && (
          <Path d="M326 309 Q290 220 338 106" color={tone(2, p)} width={4} />
        )}
        {p >= 3 && (
          <>
            <Circle x={338} y={118} r={43} color={tone(3, p)} />
            <ellipse
              cx="319"
              cy="239"
              rx="45"
              ry="63"
              fill="none"
              stroke={tone(3, p)}
              strokeWidth="3"
            />
            <Path d="M272 199 L365 216 M292 305 L354 293" color={tone(3, p)} />
          </>
        )}
        {p >= 4 && (
          <Path
            d="M309 309 L313 390 L321 448 M347 306 L395 375 L405 445"
            color={tone(4, p)}
            width={4}
          />
        )}
        {p >= 5 && (
          <Path
            d="M279 206 L239 273 L226 325 M360 215 L399 275 L450 258"
            color={tone(5, p)}
            width={4}
          />
        )}
        <Text x={90} y={498}>
          Вертикаль веса попадает в площадь опорной стопы
        </Text>
      </>
    );
  if (variant === "cloth")
    return (
      <>
        {p < 5 && (
          <g color={old}>
            <ellipse
              cx="310"
              cy="185"
              rx="60"
              ry="78"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M290 275 L330 355 L409 414 M328 255 L368 336 L438 377"
              color={old}
            />
            <Circle x={349} y={347} r={22} color={old} />
          </g>
        )}
        {p >= 1 && (
          <Path
            d="M250 125 L276 117 L288 143 H332 L345 117 L370 125 L367 270 L397 336 L478 390 L439 444 L330 391 L256 279 Z"
            color={tone(1, p)}
          />
        )}
        {p >= 2 &&
          [
            [273, 125],
            [344, 124],
            [270, 273],
            [366, 340],
          ].map(([x, y]) => (
            <Circle
              key={x + y}
              x={x}
              y={y}
              r={5}
              color={tone(2, p)}
              fill={tone(2, p)}
            />
          ))}
        {p >= 3 && (
          <Path d="M273 273 L318 310 M366 340 L408 371" color={tone(3, p)} />
        )}
        {p >= 4 && <Path d="M328 347 l-13 16 27 3 -14 14" color={tone(4, p)} />}
        {p === 5 && (
          <Text x={160} y={487}>
            Тело скрыто · край одежды + три складки
          </Text>
        )}
      </>
    );
  if (variant === "silhouette")
    return p < 4 ? (
      <>
        <g color={old}>
          <Mannequin level={4} />
        </g>
        {p >= 1 && (
          <g color={tone(1, p)}>
            <Mannequin level={p >= 3 ? 4 : p >= 2 ? 3 : 1} silhouette />
          </g>
        )}
        {p === 3 && (
          <>
            <Circle x={265} y={291} r={20} color={green} />
            <Circle x={397} y={283} r={20} color={green} />
            <Text x={140} y={498}>
              Светлые промежутки отделяют руки от тела
            </Text>
          </>
        )}
      </>
    ) : (
      <>
        {[
          [130, 1.25, 1],
          [330, 1, 1.4],
          [530, 1, 1],
        ].map(([x, h, s], i) => (
          <g
            key={x}
            transform={`translate(${x - 165},80) scale(.5)`}
            color={green}
          >
            <Mannequin level={4} silhouette headScale={h} shoeScale={s} />
            <Text x={280} y={520}>
              вариант {i + 1}
            </Text>
          </g>
        ))}
        {p === 5 && (
          <rect
            x="43"
            y="98"
            width="181"
            height="280"
            fill="none"
            stroke={green}
            strokeWidth="3"
          />
        )}
        <Text x={125} y={450}>
          Один выбранный вариант — читается издалека
        </Text>
      </>
    );
  return (
    <>
      <rect
        x="150"
        y="55"
        width="365"
        height="410"
        rx="2"
        fill="none"
        stroke={tone(0, p)}
        strokeWidth="2"
        strokeDasharray="6 7"
      />
      {p >= 1 && (
        <>
          <g color={old}>
            <Mannequin
              level={p >= 4 ? 4 : p >= 3 ? 3 : p >= 2 ? 2 : 1}
              activeLevel={p}
            />
          </g>
          <Path
            d="M100 69 H125 M113 69 V171 M100 171 H125"
            color={tone(1, p)}
          />
          <Text x={53} y={127} size={12}>
            1 голова
          </Text>
        </>
      )}
      {p === 5 && (
        <>
          <Path
            d="M150 171 H515 M150 337 H515 M150 450 H515"
            color={green}
            dash
          />
          <Text x={175} y={498}>
            Сравни голову, таз и расстояние между стопами
          </Text>
        </>
      )}
    </>
  );
}
function DuckHead({ p = 5, inkOnly = false, color = green }) {
  const line = inkOnly ? color : p === 0 ? green : old;
  return (
    <>
      <ellipse
        cx="300"
        cy="235"
        rx="115"
        ry="108"
        fill="none"
        stroke={line}
        strokeWidth="3"
      />
      {!inkOnly && (
        <Path
          d="M322 132 Q392 235 322 339 M189 225 Q300 260 409 225"
          color={old}
          dash
        />
      )}
      {p >= 1 && <Path d="M328 276 Q360 262 382 278" color={tone(1, p)} />}
      {p >= 2 && (
        <Path
          d="M329 277 Q379 257 419 281 L470 302 Q427 330 367 311 L337 308 M367 311 Q414 342 470 302"
          color={inkOnly ? color : tone(2, p)}
        />
      )}
      {p >= 3 && (
        <>
          <ellipse
            cx="305"
            cy="228"
            rx="34"
            ry="25"
            fill="none"
            stroke={inkOnly ? color : tone(3, p)}
            strokeWidth="3"
          />
          <ellipse
            cx="381"
            cy="226"
            rx="16"
            ry="22"
            fill="none"
            stroke={inkOnly ? color : tone(3, p)}
            strokeWidth="3"
          />
          <Circle
            x={316}
            y={230}
            r={8}
            color={inkOnly ? color : tone(3, p)}
            fill={inkOnly ? color : tone(3, p)}
          />
          <Circle
            x={386}
            y={228}
            r={5}
            color={inkOnly ? color : tone(3, p)}
            fill={inkOnly ? color : tone(3, p)}
          />
        </>
      )}
      {p >= 4 && (
        <Path
          d="M190 213 L162 181 L212 178 L193 124 L252 148 L269 91 L304 133 L346 103 L354 150 L400 151 L391 190"
          color={inkOnly ? color : tone(4, p)}
        />
      )}
      {p >= 5 && (
        <>
          <Path
            d="M271 341 V384 Q300 398 331 384 V339 M271 355 Q300 369 331 355"
            color={inkOnly ? color : tone(5, p)}
          />
          <Path
            d="M271 374 Q300 388 331 374"
            color={inkOnly ? color : tone(5, p)}
          />
        </>
      )}
    </>
  );
}
function Head({ p, variant }) {
  if (variant === "expression")
    return (
      <>
        {[140, 330, 520].map((x, i) => (
          <g key={x}>
            <Circle x={x} y={225} r={75} color={old} />
            <Path d={`M${x + 48} 237 l40 20 -47 12`} color={old} />
            {p >= i + 1 && (
              <>
                <Path
                  d={
                    i === 0
                      ? `M${x - 42} 211 H${x + 8} M${x + 24} 211 H${x + 51}`
                      : i === 1
                        ? `M${x - 43} 199 L${x + 9} 218 M${x + 24} 218 L${x + 53} 202`
                        : `M${x - 40} 200 Q${x - 13} 160 ${x + 10} 200 M${x + 24} 200 Q${x + 41} 173 ${x + 55} 201`
                  }
                  color={tone(i + 1, p)}
                />
                <Path
                  d={`M${x - 43} 220 Q${x - 13} 248 ${x + 10} 220 M${x + 24} 220 Q${x + 42} 240 ${x + 53} 220`}
                  color={old}
                />
              </>
            )}
            {p >= 4 && (
              <>
                <Circle
                  x={x - 6}
                  y={219}
                  r={8}
                  color={tone(4, p)}
                  fill={tone(4, p)}
                />
                <Circle
                  x={x + 42}
                  y={218}
                  r={5}
                  color={tone(4, p)}
                  fill={tone(4, p)}
                />
              </>
            )}
            {p < 5 && (
              <Text x={x - 50} y={335} size={14}>
                {["спокойно", "решительно", "удивлённо"][i]}
              </Text>
            )}
            {p === 5 && <Circle x={x - 59} y={199} r={6} color={green} />}
          </g>
        ))}
        <Text x={104} y={445}>
          {p === 5
            ? "Два обычных глаза · маленький модуль отдельно"
            : "Места глаз одинаковые — меняются верхние веки"}
        </Text>
      </>
    );
  if (variant === "ink")
    return (
      <>
        {p < 5 && (
          <g opacity=".28">
            <DuckHead p={5} />
          </g>
        )}
        {p >= 2 && (
          <g color={tone(2, p)}>
            <Path
              d="M190 213 L162 181 L212 178 L193 124 L252 148 L269 91 L304 133 L346 103 L354 150 L400 151 L391 190 Q414 230 400 269 Q435 275 470 302 Q427 330 367 311 Q350 335 331 339 V384 Q300 398 271 384 V341 Q161 291 190 213 Z"
              color={tone(2, p)}
            />
          </g>
        )}
        {p >= 3 && (
          <>
            <ellipse
              cx="305"
              cy="228"
              rx="34"
              ry="25"
              fill="none"
              stroke={tone(3, p)}
              strokeWidth="3"
            />
            <ellipse
              cx="381"
              cy="226"
              rx="16"
              ry="22"
              fill="none"
              stroke={tone(3, p)}
              strokeWidth="3"
            />
            <Circle
              x={316}
              y={230}
              r={8}
              color={tone(3, p)}
              fill={tone(3, p)}
            />
            <Circle
              x={386}
              y={228}
              r={5}
              color={tone(3, p)}
              fill={tone(3, p)}
            />
            <Path
              d="M276 213 L332 220 M368 218 L397 208 M337 308 Q405 346 470 302 M271 355 Q300 369 331 355 M271 374 Q300 388 331 374"
              color={tone(3, p)}
              width={p >= 4 ? 5 : 3}
            />
          </>
        )}
        {p === 1 && (
          <>
            <rect
              x="430"
              y="370"
              width="170"
              height="45"
              fill="#e8efdf"
              stroke={green}
            />
            <Text x={443} y={399}>
              03 Контур
            </Text>
          </>
        )}
        <Text x={130} y={465}>
          {p === 0
            ? "Эскиз: прозрачность слоя 25%"
            : p === 1
              ? "Новый пустой слой над эскизом"
              : p === 5
                ? "Эскиз скрыт: остаётся чистый рисунок"
                : "Новый контур — поверх светлого построения"}
        </Text>
      </>
    );
  return (
    <>
      <DuckHead p={p} />
      <Text x={150} y={468}>
        {
          [
            "Череп и две направляющие",
            "Основание клюва на оси лица",
            "Клин с нижней плоскостью",
            "Ближний глаз шире дальнего",
            "Пять крупных групп перьев",
            "Короткая шея под черепом",
          ][p]
        }
      </Text>
    </>
  );
}
function ColorStudy({ p, variant }) {
  if (variant === "material-samples")
    return (
      <>
        <Arrow x={85} y={60} toX={135} toY={110} />
        {[150, 330, 510].map((x, i) => (
          <g key={x}>
            <path
              d={`M${x - 55} 180 V355 A55 20 0 0 0 ${x + 55} 355 V180`}
              fill={p >= 1 ? "#adb0a3" : "none"}
              stroke={old}
              strokeWidth="3"
            />
            <ellipse
              cx={x}
              cy="180"
              rx="55"
              ry="20"
              fill={p >= 1 ? "#d4d6ca" : "none"}
              stroke={old}
              strokeWidth="3"
            />
            {p >= i + 2 && (
              <>
                <path
                  d={`M${x + 15} 196 V365 Q${x + 43} 362 ${x + 53} 350 V189 Z`}
                  fill="#6b7668"
                />
                <path
                  d={`M${x - 34} 197 V360`}
                  fill="none"
                  stroke={i === 1 ? "#fffdf0" : "#dce2d0"}
                  strokeWidth={i === 1 ? 10 : 31}
                />
                {i === 2 &&
                  [230, 255, 280, 305, 330].map((y) => (
                    <Path key={y} d={`M${x - 12} ${y} l16 14`} color={green} />
                  ))}
              </>
            )}
            {p < 5 && (
              <Text x={x - 32} y={413}>
                {["ткань", "металл", "перья"][i]}
              </Text>
            )}
          </g>
        ))}
        <Text x={92} y={470}>
          Та же форма — разная ширина блика и характер края
        </Text>
      </>
    );
  const palette = ["#ebcda8", "#e89639", "#b53a61", "#4b4a50", "#ece5d8"];
  return (
    <>
      {palette.map((c, i) => (
        <rect
          key={c}
          x={155 + i * 68}
          y="55"
          width="48"
          height="38"
          fill={c}
          stroke={p === 0 ? green : old}
        />
      ))}
      {p >= 1 && (
        <g transform="translate(40,40) scale(.8)">
          <g color={old}>
            <Mannequin level={4} />
          </g>
          <Circle
            x={330}
            y={120}
            r={48}
            color={p === 1 ? green : old}
            fill={p >= 3 ? palette[0] : "none"}
          />
          <Path
            d="M365 120 L404 134 L371 148 Z"
            color={p === 1 ? green : old}
            fill={p >= 3 ? palette[1] : "none"}
          />
          <path
            d="M283 195 L318 198 L325 286 L285 288 Z M342 198 L375 195 L372 290 L345 285 Z"
            fill={p >= 3 ? palette[2] : "none"}
            stroke={old}
            strokeWidth="3"
          />
          <path
            d="M318 200 H343 V292 H318 Z"
            fill={p >= 3 ? palette[4] : "none"}
            stroke={old}
          />
          {p >= 3 && (
            <Path
              d="M310 331 L269 384 L217 443 M350 331 L393 390 L429 442"
              color={palette[3]}
              width={33}
            />
          )}
          {p >= 5 && (
            <Path
              d="M345 154 L350 172 M365 217 L360 273 M357 343 L392 391"
              color="#54574c"
              width={12}
            />
          )}
        </g>
      )}
      {p === 2 && (
        <>
          <rect
            x="440"
            y="230"
            width="150"
            height="40"
            fill="white"
            stroke={old}
          />
          <Text x={455} y={256}>
            03 Контур
          </Text>
          <rect
            x="440"
            y="288"
            width="150"
            height="40"
            fill="#e5efd9"
            stroke={green}
          />
          <Text x={455} y={314}>
            04 Цвет
          </Text>
        </>
      )}
      {p === 4 && (
        <>
          <rect x="460" y="170" width="100" height="180" fill="#e5e5dc" />
          <Circle x={510} y={211} r={25} fill="#deded7" color={old} />
          <Path d="M510 251 V315" color="#4b4a50" width={32} />
          <Text x={440} y={385} size={12}>
            Проверь светлоту издалека
          </Text>
        </>
      )}
      <Text x={100} y={480}>
        {p === 0
          ? "Пять образцов — один сохранённый набор"
          : p === 1
            ? "Замкнутый контур без щелей"
            : p === 2
              ? "Цвет скрывается отдельно от контура"
              : p === 3
                ? "Крупные области — без теней"
                : p === 4
                  ? "Голова светлее одежды"
                  : "Один отдельный слой тени"}
      </Text>
    </>
  );
}
function Views({ p, variant }) {
  const back = variant === "back";
  return (
    <>
      {[85, 135, 185, 235, 315, 385, 455].map((y, i) => (
        <g key={y}>
          <Line
            x1={115}
            y1={y}
            x2={610}
            y2={y}
            color={old}
            strokeDasharray="5 7"
          />
          <Text x={15} y={y + 4} size={12}>
            {
              [
                "макушка",
                "глаза",
                "подбородок",
                "плечи",
                "таз",
                "колени",
                "земля",
              ][i]
            }
          </Text>
        </g>
      ))}
      {p >= 1 && (
        <g transform="translate(-100,0)" color={tone(1, p)}>
          <Circle x={330} y={135} r={50} color="currentColor" />
          <ellipse
            cx="330"
            cy="263"
            rx="50"
            ry="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <rect
            x="300"
            y="310"
            width="60"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {!back && (
            <>
              <Path d="M330 85 V185 M304 145 H352" color={old} />
              <Circle x={310} y={132} r={6} color={old} />
              <Circle x={350} y={132} r={6} color={old} />
            </>
          )}
          {p >= 2 && (
            <Path
              d={
                back
                  ? "M313 340 L302 386 L300 447 H318 M348 340 L359 386 L363 447 H345 M281 238 L268 295 L270 338 M380 238 L393 295 L390 338"
                  : "M313 340 L296 386 L286 455 H323 M348 340 L367 386 L380 455 H343 M281 238 L263 295 L260 338 M380 238 L399 295 L400 338"
              }
              color={tone(2, p)}
              width={4}
            />
          )}
          {back && p >= 3 && (
            <Path
              d="M286 217 H374 L382 305 H278 Z M286 232 L297 288 M373 232 L365 288"
              color={tone(3, p)}
            />
          )}
          {back && p >= 4 && (
            <Path
              d="M319 314 l-15 -7 3 16 -13 6 17 6 2 17 12 -9 14 8 2 -16 13 -5 -15 -9 1 -13 Z M353 326 L370 364"
              color={tone(4, p)}
            />
          )}
        </g>
      )}
      {!back && p >= 3 && (
        <g color={tone(3, p)}>
          <ellipse
            cx="490"
            cy="135"
            rx="44"
            ry="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <Path d="M524 132 L560 148 L524 160" color="currentColor" />
          <Circle x={510} y={130} r={5} color="currentColor" />
          <ellipse
            cx="490"
            cy="265"
            rx="31"
            ry="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <rect
            x="471"
            y="310"
            width="39"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {p >= 4 && (
            <>
              <Path
                d="M488 340 L473 388 L476 455 H521 M502 340 L499 386 L505 445 H544"
                color={old}
              />
              <Path
                d="M486 231 L478 286 L496 335"
                color={tone(4, p)}
                width={5}
              />
              <Path d="M493 230 L503 280 L520 323" color={old} />
            </>
          )}
          {p === 5 && (
            <>
              <Text x={449} y={300} color={green}>
                R
              </Text>
              <Text x={511} y={405} color={green}>
                L
              </Text>
            </>
          )}
        </g>
      )}
      <Text x={170} y={498}>
        {back
          ? "Со спины: затылок без клюва, пятки вместо носков"
          : "Одинаковые уровни, разные объёмы — не сжатая копия"}
      </Text>
      {back && p === 5 && (
        <>
          <Text x={430} y={216}>
            Не видно в источнике?
          </Text>
          <Text x={430} y={248} size={13}>
            Подпиши интерпретацию
          </Text>
          <Arrow x={460} y={300} toX={290} toY={320} />
        </>
      )}
    </>
  );
}
function Layers({ p }) {
  const upper =
    "M180 150 Q145 135 140 165 L160 282 Q180 305 205 280 L215 170 Q218 143 180 150 Z";
  const lower =
    p === 5
      ? "M180 282 Q165 305 190 320 L285 365 Q308 365 310 340 L203 282 Q190 273 180 282 Z"
      : "M180 282 Q155 285 164 317 L191 405 Q216 421 233 399 L214 306 Q208 282 180 282 Z";
  return (
    <>
      <Path
        d={upper}
        color={p >= 2 ? tone(2, p) : old}
        fill={p >= 2 ? "#e1e9d7" : "none"}
      />
      <Path
        d={lower}
        color={p >= 3 ? tone(3, p) : old}
        fill={p >= 3 ? "#e3e5dc" : "none"}
      />
      <ellipse
        cx={p === 5 ? 326 : 219}
        cy={p === 5 ? 364 : 433}
        rx="22"
        ry="33"
        fill={p >= 4 ? "#dce8d1" : "none"}
        stroke={p >= 4 ? tone(4, p) : old}
        strokeWidth="3"
        transform={p === 5 ? "rotate(-60 326 364)" : undefined}
      />
      {p >= 1 &&
        [
          [180, 160],
          [188, 295],
          [p === 5 ? 304 : 216, p === 5 ? 350 : 409],
        ].map(([x, y]) => (
          <Circle key={y} x={x} y={y} r={7} color={tone(1, p)} fill={green} />
        ))}
      {p >= 2 && (
        <>
          <Circle x={188} y={295} r={22} color={tone(2, p)} dash />
          <Path d="M350 170 H590 V210 H350 Z" color={tone(2, p)} />
          <Text x={365} y={196}>
            arm_R_upper
          </Text>
        </>
      )}
      {p >= 3 && (
        <>
          <Path d="M350 230 H590 V270 H350 Z" color={tone(3, p)} />
          <Text x={365} y={256}>
            arm_R_forearm
          </Text>
          <Circle x={216} y={409} r={18} color={old} dash />
        </>
      )}
      {p >= 4 && (
        <>
          <Path d="M350 290 H590 V330 H350 Z" color={tone(4, p)} />
          <Text x={365} y={316}>
            hand_R
          </Text>
        </>
      )}
      {p === 0 && (
        <>
          <rect
            x="350"
            y="160"
            width="230"
            height="80"
            fill="#e7efde"
            stroke={green}
          />
          <Text x={365} y={191}>
            Рука-риг-проба
          </Text>
          <Text x={365} y={220} size={12}>
            копия, исходник отдельно
          </Text>
        </>
      )}
      {p === 5 && (
        <>
          <Arrow x={257} y={270} toX={288} toY={307} />
          <Text x={350} y={397}>
            Поворот вокруг локтя
          </Text>
        </>
      )}
      <Text x={110} y={491}>
        Круглые окончания остаются под соседней частью
      </Text>
    </>
  );
}
function SmallPose({
  x,
  y,
  scale = 0.65,
  phase = 0,
  color = green,
  type = "run",
  parts = "all",
}) {
  const poses = [
    [
      [42, 75],
      [15, 125],
      [-30, 70],
      [-53, 105],
    ],
    [
      [-2, 75],
      [-34, 125],
      [25, 56],
      [36, 83],
    ],
    [
      [-35, 72],
      [-65, 96],
      [48, 50],
      [72, 110],
    ],
    [
      [-30, 70],
      [-53, 105],
      [42, 75],
      [15, 125],
    ],
    [
      [25, 56],
      [36, 83],
      [-2, 75],
      [-34, 125],
    ],
    [
      [48, 50],
      [72, 110],
      [-35, 72],
      [-65, 96],
    ],
  ];
  const a = poses[phase % 6];
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <Circle x={10} y={-105} r={23} color={color} />
      <Path d="M25 -107 L48 -96 L25 -91" color={color} />
      <Path d="M6 -79 L0 0" color={color} width={4} />
      <Path
        d={`M0 0 L${a[0][0]} ${a[0][1]} L${a[1][0]} ${a[1][1]} l22 0 M5 0 L${a[2][0]} ${a[2][1]} L${a[3][0]} ${a[3][1]} l22 0`}
        color={color}
      />
      <Path
        d={`M5 -65 L${phase < 3 ? -27 : 34} -35 L${phase < 3 ? -6 : 51} -55 M7 -65 L${phase < 3 ? 38 : -25} -44 L${phase < 3 ? 55 : -7} -65`}
        color={color}
      />
    </g>
  );
}
function MotionPose({
  type = "run",
  frame = 0,
  arms = true,
  legs = true,
  anatomy = 0,
  clean = 0,
  color = green,
}) {
  const pose = getRigPose(type, frame),
    plan = getRigDrawPlan(type, frame),
    d = (pts) => "M" + pts.map((q) => q.join(" ")).join(" L");
  const shoePath = (id) => {
    const m = plan.find((item) => item.id === id).matrix;
    return (
      d(
        animationParts[id].hull.map(([x, y]) => [
          m[0] * x + m[2] * y + m[4],
          m[1] * x + m[3] * y + m[5],
        ]),
      ) + " Z"
    );
  };
  return (
    <>
      <Circle
        x={pose.neck[0] + 8}
        y={pose.neck[1] - 50}
        r={37}
        color={color}
        fill={clean >= 3 ? "#e9c89c" : "none"}
      />
      <Path
        d={d([
          [pose.neck[0] + 32, pose.neck[1] - 42],
          [pose.neck[0] + 57, pose.neck[1] - 27],
          [pose.neck[0] + 31, pose.neck[1] - 20],
        ])}
        color={color}
      />
      <Path
        d={d([pose.neck, pose.root])}
        color={color}
        width={clean >= 1 ? 15 : 4}
      />
      <ellipse
        cx={pose.root[0]}
        cy={pose.root[1] - 45}
        rx="30"
        ry="48"
        fill={clean >= 3 ? "#bb4267" : "none"}
        stroke={color}
        strokeWidth="4"
      />
      {legs &&
        [pose.leftLeg, pose.rightLeg].map((leg, i) => (
          <g key={i}>
            <Path
              d={d([leg.hip, leg.knee, leg.ankle])}
              color={i === 0 ? old : color}
              width={clean >= 1 ? 12 : 4}
            />
            <Path
              d={shoePath(i === 0 ? "leftShoe" : "rightShoe")}
              color={i === 0 ? old : color}
              width={3}
            />
          </g>
        ))}
      {arms && (
        <>
          <Path
            d={d([pose.farShoulder, pose.farElbow, pose.farWrist])}
            color={old}
            width={clean >= 1 ? 10 : 4}
          />
          <Path
            d={d([pose.nearShoulder, pose.nearElbow, pose.nearWrist])}
            color={color}
            width={clean >= 1 ? 10 : 4}
          />
        </>
      )}
      {anatomy >= 1 && (
        <Path
          d={d([pose.nearElbow, pose.nearWrist])}
          color="#b53a73"
          width={8}
        />
      )}
      {anatomy >= 2 && (
        <Path
          d={d([pose.leftLeg.knee, pose.leftLeg.ankle])}
          color="#2193a5"
          width={8}
        />
      )}
      {anatomy >= 3 &&
        [
          pose.nearShoulder,
          pose.nearElbow,
          pose.nearWrist,
          pose.leftLeg.hip,
          pose.leftLeg.knee,
          pose.leftLeg.ankle,
        ].map(([x, y]) => (
          <Circle key={x + y} x={x} y={y} r={8} color={green} />
        ))}
      {anatomy >= 4 &&
        pose.planted.map(
          (yes, i) =>
            yes && (
              <Path
                key={i}
                d={`M${(i ? pose.leftLeg : pose.rightLeg).ankle[0] - 10} 560 h40`}
                color={green}
                width={6}
              />
            ),
        )}
      {clean === 2 && (
        <>
          <Circle
            x={pose.nearElbow[0]}
            y={pose.nearElbow[1]}
            r={12}
            color={color}
          />
          <Circle
            x={pose.rightLeg.knee[0]}
            y={pose.rightLeg.knee[1]}
            r={14}
            color={color}
          />
        </>
      )}
      {clean >= 4 && (
        <Path
          d={`M${pose.root[0] + 16} ${pose.root[1] - 70} v45`}
          color="#69705c"
          width={12}
        />
      )}
      <Path d="M70 560 H440" color={old} />
    </>
  );
}
function Motion({ p, variant }) {
  if (
    ["run-keys", "run-loop", "anatomy", "cleanup", "jump"].includes(variant)
  ) {
    const type = variant === "jump" ? "jump" : "run";
    const count =
      variant === "run-keys"
        ? Math.max(1, Math.min(3, p))
        : variant === "run-loop"
          ? p === 0
            ? 3
            : p === 1
              ? 4
              : 6
          : variant === "jump"
            ? p + 1
            : 6;
    return (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect
              x={15 + (i % 3) * 220}
              y={35 + Math.floor(i / 3) * 235}
              width="195"
              height="218"
              rx="5"
              fill="none"
              stroke={old}
            />
            <Text
              x={28 + (i % 3) * 220}
              y={57 + Math.floor(i / 3) * 235}
              size={12}
            >
              Ключ {i + 1}
            </Text>
            {i < count && (
              <g
                transform={`translate(${18 + (i % 3) * 220},${52 + Math.floor(i / 3) * 235}) scale(.34)`}
              >
                <MotionPose
                  type={type}
                  frame={i}
                  arms={variant !== "run-keys" || p >= 4}
                  legs={variant !== "run-keys" || p >= 1}
                  anatomy={variant === "anatomy" ? p : 0}
                  clean={variant === "cleanup" ? p : 0}
                  color={i === count - 1 ? green : old}
                />
                {variant === "anatomy" && (
                  <>
                    <Text x={180} y={300} color="#b53a73" size={24}>
                      R
                    </Text>
                    <Text x={328} y={470} color="#2193a5" size={24}>
                      L
                    </Text>
                  </>
                )}
                {variant === "run-keys" && p === 0 && (
                  <Path d="M256 80 V580" color={green} dash />
                )}
                {variant === "run-keys" && p === 5 && (
                  <Path
                    d={`M100 ${getRigPose("run", i).root[1]} H410`}
                    color={green}
                    dash
                  />
                )}
              </g>
            )}
          </g>
        ))}
        {variant === "run-loop" && p >= 3 && (
          <>
            <Path
              d="M70 247 H185 Q200 171 125 174 Q63 177 70 247"
              color={green}
              dash
            />
            <Arrow x={143} y={247} toX={90} toY={247} />
          </>
        )}
        {variant === "run-loop" && p === 4 && (
          <g transform="translate(35,48) scale(.34)" opacity=".4">
            <MotionPose frame={0.5} />
          </g>
        )}
        {variant === "cleanup" && p === 0 && (
          <Text x={210} y={21} size={13}>
            Рабочая копия · эскизы сохраняются
          </Text>
        )}
        <Text x={40} y={514} size={12}>
          {variant === "run-keys"
            ? "Боковая плоскость · контакт → сжатие → полёт"
            : variant === "run-loop"
              ? "Шесть ключей · промежуточные рисунки добавляй между ними"
              : variant === "anatomy"
                ? "R — правая мехрука · L — левая мехголень"
                : variant === "cleanup"
                  ? "Один проход по всем кадрам: контур → цвет → тень"
                  : "Стойка → приседание → отрыв → вершина → посадка → возврат"}
        </Text>
      </>
    );
  }
  if (variant === "secondary")
    return (
      <>
        {[145, 330, 515].map((x, i) => (
          <g key={x}>
            <g transform={`rotate(${i === 1 ? 17 : 0} ${x} 275)`}>
              <rect
                x={x - 32}
                y="150"
                width="64"
                height="125"
                rx="25"
                fill="none"
                stroke={old}
                strokeWidth="3"
              />
              <Line x1={x - 35} y1={275} x2={x + 35} y2={275} color={old} />
              {p >= 1 && (
                <Circle x={x} y={275} r={6} color={tone(1, p)} fill={green} />
              )}
            </g>
            {p >= i + 2 && (
              <Path
                d={
                  i === 0
                    ? `M${x - 5} 278 L${x - 10} 350 L${x + 7} 350 L${x + 6} 278`
                    : i === 1
                      ? `M${x - 5} 278 Q${x - 55} 300 ${x - 61} 338 L${x - 46} 345 Q${x - 40} 310 ${x + 6} 278`
                      : `M${x - 5} 278 Q${x + 32} 312 ${x + 65} 318 L${x + 70} 305 Q${x + 26} 295 ${x + 6} 278`
                }
                color={tone(i + 2, p)}
              />
            )}
            <Text x={x - 55} y={395} size={13}>
              {["до движения", "корпус наклонился", "корпус остановился"][i]}
            </Text>
          </g>
        ))}
        {p === 5 && (
          <>
            <Path d="M510 278 L510 350 L525 350 L525 278" color={green} />
            <Text x={110} y={458}>
              После перелёта конец возвращается вниз
            </Text>
          </>
        )}
        <Text x={135} y={95}>
          Корень ленты следует за поясом сразу
        </Text>
      </>
    );
  if (variant === "ball-spacing")
    return (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <g
            key={i}
            transform={`translate(${45 + (i % 3) * 205},${62 + Math.floor(i / 3) * 224})`}
          >
            <rect
              width="170"
              height="190"
              fill="white"
              stroke={p === 0 ? green : old}
              strokeWidth="2"
            />
            <Text x={10} y={23} size={13}>
              Кадр {i + 1}
            </Text>
            {p >= 1 && (
              <>
                <Line x1={10} y1={164} x2={160} y2={164} color={tone(1, p)} />
                <Path
                  d={p === 5 ? "M65 40 V164 M125 40 V164" : "M85 40 V164"}
                  color={old}
                  dash
                />
              </>
            )}
            {p >= 2 && (
              <Circle
                x={p === 5 ? 65 : 85}
                y={[145, 95, 55, 43, 95, 145][i]}
                r={p >= 3 ? 18 : 3}
                color={p >= 3 ? tone(3, p) : tone(2, p)}
              />
            )}
            {p === 5 && (
              <>
                <Circle
                  x={125}
                  y={[145, 111, 77, 43, 95, 145][i]}
                  r={18}
                  color={green}
                  data-spacing="uniform-ascent"
                  data-key={i + 1}
                />
                <Text x={58} y={183} size={12}>
                  А
                </Text>
                <Text x={118} y={183} size={12}>
                  Б
                </Text>
              </>
            )}
          </g>
        ))}
        {p >= 4 && (
          <Text x={75} y={505}>
            {p === 4
              ? "1 → 2 → 3 → 4 → 5 → 6 · 6 кадров/с"
              : "Сравни подъём в кадрах 1–4: А — замедление, Б — равные шаги"}
          </Text>
        )}
      </>
    );
  if (variant === "ball-squash")
    return (
      <>
        {Array.from({ length: p + 1 }, (_, i) => (
          <g
            key={i}
            transform={`translate(${108 + (i % 3) * 210},${190 + Math.floor(i / 3) * 235})`}
          >
            <Line x1={-75} y1={0} x2={75} y2={0} color={old} />
            <ellipse
              cx="0"
              cy={[-35, -27, -90, -120, -27, -35][i]}
              rx={[35, 45, 27, 35, 45, 35][i]}
              ry={[35, 27, 45, 35, 27, 35][i]}
              fill="none"
              stroke={tone(i, p)}
              strokeWidth="3"
            />
            <Text x={-55} y={35} size={13}>
              {
                [
                  "исходный круг",
                  "ниже и шире",
                  "выше и уже",
                  "круг на вершине",
                  "сжатие на земле",
                  "исходный круг",
                ][i]
              }
            </Text>
          </g>
        ))}
      </>
    );
  if (variant === "idle")
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            transform={`translate(${8 + i * 162},95) scale(.28)`}
            opacity={p < 2 && i > 0 ? 0.2 : 1}
          >
            <MotionPose type="idle" frame={i} color={old} />
            <Text x={210} y={635} size={34}>
              кадр{i + 1}
            </Text>
          </g>
        ))}
        {p >= 2 && (
          <>
            <ellipse
              cx="330"
              cy="380"
              rx="45"
              ry="65"
              fill="none"
              stroke={old}
              strokeWidth="3"
            />
            <ellipse
              cx="330"
              cy={380 - [0, 0, 5, 9, 2, 0][p]}
              rx="45"
              ry="65"
              fill="none"
              stroke={green}
              strokeWidth="3"
            />
            <Text x={400} y={380} size={13}>
              Увеличение движения груди
            </Text>
          </>
        )}
        <Text x={100} y={85}>
          Стопы зафиксированы · грудь движется на толщину линии
        </Text>
        <Text x={160} y={470}>
          {p === 5
            ? "Проверь стык 4 → 1 без скачка"
            : "Голова и кисти следуют за грудью с небольшой задержкой"}
        </Text>
      </>
    );
  return (
    <Text x={90} y={250}>
      Схема движения готовится отдельно для этого действия
    </Text>
  );
}
function LionStudy({ p, variant }) {
  const silhouette = variant === "silhouette" && p === 5,
    level = variant === "silhouette" ? [0, 2, 4, 5, 7, 8][p] : p;
  const colored = level >= 9,
    finished = level >= 8,
    edge = finished ? green : old;
  const c = (at) => (finished ? edge : tone(at, level)),
    fill = (color) => (silhouette ? ink : colored ? color : "none");
  const mane = [
    "M336 100 L300 60 L320 128 L347 121 Z",
    "M340 100 L352 48 L377 109 L357 127 Z",
    "M375 109 L415 78 L402 142 L375 149 Z",
    "M320 128 L276 130 L313 174 L340 164 Z",
    "M315 164 L298 224 L353 197 L360 171 Z",
    "M376 164 L409 212 L371 223 L349 188 Z",
  ];
  return (
    <>
      <Path
        d="M70 462 H586 M70 462 V45 H586 V462"
        color={level === 0 ? green : old}
        dash
      />
      {level === 0 && (
        <>
          {[
            [354, 52, "грива"],
            [302, 451, "стопа"],
            [404, 451, "стопа"],
            [75, 455, "шпага"],
            [561, 315, "хвост"],
          ].map(([x, y, label]) => (
            <g key={label + x}>
              <Circle x={x} y={y} r={5} color={green} />
              <Text x={x - 22} y={y === 451 ? 495 : y - 12} size={13}>
                {label}
              </Text>
            </g>
          ))}
        </>
      )}
      {level >= 7 && (
        <>
          <Path
            d="M384 333 Q455 392 518 358 Q565 342 555 307"
            color={c(7)}
            width={silhouette ? 15 : 5}
          />
          <path
            d="M550 310 L555 278 L577 292 L573 314 L556 332 Z"
            fill={fill("#645240")}
            stroke={c(7)}
            strokeWidth="3"
          />
        </>
      )}
      {level >= 5 && (
        <>
          <path
            d="M326 288 L270 400 L316 367 L331 400 L352 328 M384 290 L433 389 L393 361 L394 411 L366 334"
            fill={fill("#b73058")}
            stroke={c(5)}
            strokeWidth="3"
          />
          <Path
            d="M388 232 Q435 248 412 284 L392 292"
            color={c(5)}
            width={silhouette ? 16 : 4}
          />
        </>
      )}
      {level >= 3 && (
        <>
          <path
            d="M322 219 L380 214 L394 299 L333 310 Z"
            fill={fill("#eee3cd")}
            stroke={c(3)}
            strokeWidth="3"
          />
          <path
            d="M333 310 L391 305 L390 337 L337 341 Z"
            fill={fill("#4c4a4e")}
            stroke={c(3)}
            strokeWidth="3"
          />
          <Path d="M350 226 L363 334" color={c(3)} dash={!finished} />
        </>
      )}
      {level >= 4 && (
        <>
          <Path
            d="M345 336 L326 391 L317 447 M375 335 L394 389 L404 447"
            color={silhouette ? ink : colored ? "#4c4a4e" : c(4)}
            width={colored || silhouette ? 24 : 4}
          />
          <path
            d="M301 413 H329 L332 454 H291 L294 441 H303 Z M390 412 H414 L422 453 H388 Z"
            fill={fill("#4c4a4e")}
            stroke={c(4)}
            strokeWidth="3"
          />
        </>
      )}
      {level >= 5 && (
        <>
          <path
            d="M323 217 L340 213 L351 243 L336 272 L350 293 L327 307 Z M377 215 L392 225 L377 272 L391 293 L376 308 L362 246 Z"
            fill={fill("#4c4a4e")}
            stroke={c(5)}
            strokeWidth="3"
          />
          <Path d="M343 226 L368 246 L341 271" color={c(5)} width={3} />
        </>
      )}
      {level >= 6 && (
        <>
          <Path
            d="M321 234 L285 278 L259 316"
            color={c(6)}
            width={silhouette ? 19 : 5}
          />
          <path
            d="M280 273 L294 283 L269 317 L253 306 Z"
            fill={fill("#969997")}
            stroke={c(6)}
            strokeWidth="3"
          />
          <Path d="M270 314 L249 330" color={c(6)} width={5} />
          <Circle x={259} y={321} r={10} color={c(6)} fill={fill("#969997")} />
          {colored && <Path d="M280 283 L268 301" color="#31a9b7" width={4} />}
        </>
      )}
      {level >= 7 && (
        <>
          <path
            d="M254 328 L75 455 L245 335 Z"
            fill={fill("#bfc2bb")}
            stroke={c(7)}
            strokeWidth="3"
          />
          <Path
            d="M241 319 L265 342 M239 332 Q256 351 272 327"
            color={c(7)}
            width={4}
          />
        </>
      )}
      {level >= 2 &&
        mane.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={fill("#e9c17d")}
            stroke={c(2)}
            strokeWidth="3"
          />
        ))}
      {level >= 1 && (
        <>
          <ellipse
            cx="363"
            cy="132"
            rx="34"
            ry="43"
            fill={fill("#e8bd76")}
            stroke={c(1)}
            strokeWidth="3"
          />
          <path
            d="M386 139 Q414 131 425 147 L416 162 Q393 176 371 163"
            fill={fill("#e8bd76")}
            stroke={c(1)}
            strokeWidth="3"
          />
          {!silhouette && (
            <>
              <Path
                d="M416 143 L426 147 L419 154 Z M367 124 l13 1 M394 128 l7 1"
                color={c(1)}
                width={3}
              />
              <Path d="M420 160 Q398 181 373 169" color={c(1)} />
            </>
          )}
        </>
      )}
      {level >= 10 && !silhouette && (
        <>
          <Path
            d="M313 181 L337 210 L352 192 M377 245 L383 289 M400 418 L405 448"
            color="#806344"
            width={9}
          />
          <Circle x={115} y={85} r={13} color={green} />
          <Arrow x={130} y={100} toX={175} toY={150} />
          <ellipse
            cx="355"
            cy="459"
            rx="70"
            ry="6"
            fill="#887a62"
            opacity=".4"
          />
        </>
      )}
      {level === 11 && (
        <>
          <image
            href="/assets/boss-pride-lion.png"
            x="463"
            y="55"
            width="112"
            height="160"
            preserveAspectRatio="xMidYMid meet"
          />
          <Text x={478} y={238} size={12}>
            Оригинал
          </Text>
          <Text x={461} y={263} size={12}>
            Сравни 6 масс
          </Text>
        </>
      )}
      {level > 0 && (
        <Text x={85} y={502} size={13}>
          {silhouette
            ? "Учебный силуэт льва · без мелких деталей"
            : colored
              ? "Упрощённый этюд льва, а не замена исходного арта"
              : "Построение льва · морда, грива, сюртук, шпага и хвост"}
        </Text>
      )}
    </>
  );
}
function Files({ p }) {
  return (
    <>
      <Text x={90} y={60} size={20}>
        Учебный-проект /
      </Text>
      {["source", "parts", "animation"].map((name, i) => (
        <g key={name} transform={`translate(70,${125 + i * 115})`}>
          <path
            d="M0 0 H52 L64 15 H160 V74 H0 Z"
            fill="#e5ecd8"
            stroke={tone(0, p)}
            strokeWidth="2"
          />
          <Text x={18} y={48}>
            {name}/
          </Text>
        </g>
      ))}
      {p >= 1 && (
        <>
          <rect
            x="305"
            y="125"
            width="270"
            height="70"
            fill="white"
            stroke={tone(1, p)}
          />
          <Text x={320} y={155}>
            lion_study_v01
          </Text>
          <Text x={320} y={180} size={13}>
            родной проект · слои
          </Text>
        </>
      )}
      {p >= 2 && (
        <>
          <defs>
            <pattern
              id="transparency"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="20" height="20" fill="white" />
              <path d="M0 0 H10 V10 H0 M10 10 H20 V20 H10" fill="#d6d9cf" />
            </pattern>
          </defs>
          <rect
            x="305"
            y="240"
            width="270"
            height="70"
            fill="url(#transparency)"
            stroke={tone(2, p)}
          />
          <Path d="M334 256 L366 280 L406 272" color={tone(2, p)} width={15} />
          <Text x={430} y={280} size={13}>
            arm_R.png
          </Text>
        </>
      )}
      {p >= 3 &&
        [0, 1, 2].map((i) => (
          <g key={i}>
            <rect
              x={305 + i * 90}
              y="350"
              width="76"
              height="92"
              fill="white"
              stroke={tone(3, p)}
              strokeWidth="2"
            />
            <Text x={313 + i * 90} y={385} size={11}>
              run_0{i + 1}
            </Text>
            <Text x={313 + i * 90} y={415} size={11}>
              один размер
            </Text>
          </g>
        ))}
      {p >= 4 && (
        <>
          <rect
            x="305"
            y="465"
            width="270"
            height="32"
            fill="#e6eddc"
            stroke={tone(4, p)}
          />
          <Text x={320} y={486} size={12}>
            README: размер · земля · R/L · статус
          </Text>
        </>
      )}
      {p === 5 && (
        <Text x={95} y={95} color={green}>
          ✓ Открой файлы и проверь содержимое
        </Text>
      )}
    </>
  );
}
export default function LessonIllustration({ visual, showError = false }) {
  const uid = useId().replace(/:/g, "");
  if (!supportsLessonVisual(visual))
    return (
      <div role="alert">Для этого действия ещё нет согласованной схемы.</div>
    );
  const p = lessonSceneOperations[`${visual.kind}/${visual.variant}`].indexOf(
    visual.operation,
  );
  const art =
    visual.kind === "tablet" ? (
      <Tablet p={p} />
    ) : visual.kind === "strokes" ? (
      <Strokes p={p} />
    ) : visual.kind === "shapes" ? (
      <BasicShapes p={p} />
    ) : visual.kind === "volume" ? (
      visual.variant === "sphere-turn" ? (
        <SphereTurn p={p} />
      ) : (
        <BoxCylinder p={p} />
      )
    ) : visual.kind === "light" ? (
      <Light p={p} id={uid} />
    ) : visual.kind === "figure" ? (
      <Figure p={p} variant={visual.variant} />
    ) : visual.kind === "head" ? (
      <Head p={p} variant={visual.variant} />
    ) : visual.kind === "color" ? (
      <ColorStudy p={p} variant={visual.variant} />
    ) : visual.kind === "views" ? (
      <Views p={p} variant={visual.variant} />
    ) : visual.kind === "layers" ? (
      <Layers p={p} />
    ) : visual.kind === "motion" ? (
      <Motion p={p} variant={visual.variant} />
    ) : visual.kind === "lion" ? (
      <LionStudy p={p} variant={visual.variant} />
    ) : visual.kind === "files" ? (
      <Files p={p} />
    ) : null;
  return (
    <>
      <svg
        className="fl-illustration"
        viewBox="0 0 660 520"
        role="img"
        aria-label={visual.alt}
        data-scene={`${visual.kind}/${visual.variant}/${visual.operation}`}
      >
        <title>{visual.alt}</title>
        {art}
      </svg>
      {showError && (
        <ErrorExample kind={visual.kind} operation={visual.operation} />
      )}
    </>
  );
}
function ErrorExample({ kind, operation }) {
  let labels, art;
  if (operation === "canvas" || operation.includes("bounds")) {
    labels = ["Край обрезает рисунок", "Есть запас вокруг рисунка"];
    art = (
      <>
        {[60, 360].map((x, i) => (
          <g key={x}>
            <rect
              x={x}
              y="55"
              width="145"
              height="105"
              fill="white"
              stroke={i ? green : red}
            />
            <Circle x={x + 96} y={85} r={19} color={i ? green : red} />
            <Path
              d={`M${x + 96} 104 L${x + 80} 132 L${x + (i ? 10 : -30)} ${i ? 150 : 185}`}
              color={i ? green : red}
            />
          </g>
        ))}
      </>
    );
  } else if (operation === "study-skull") {
    labels = [
      "Длинный плоский клин меняет зверя",
      "Короткая морда с нижней челюстью",
    ];
    art = (
      <>
        {[120, 420].map((x, i) => (
          <g key={x}>
            <Circle x={x} y={105} r={37} color={old} />
            {i ? (
              <>
                <ellipse
                  cx={x + 35}
                  cy="115"
                  rx="28"
                  ry="20"
                  fill="none"
                  stroke={green}
                  strokeWidth="3"
                />
                <Path
                  d={`M${x + 55} 106 l12 5 -10 8 M${x + 55} 132 Q${x + 25} 148 ${x + 5} 132`}
                  color={green}
                />
              </>
            ) : (
              <Path
                d={`M${x + 24} 95 L${x + 100} 115 L${x + 23} 130 Z`}
                color={red}
              />
            )}
          </g>
        ))}
      </>
    );
  } else if (operation === "study-weapon-tail") {
    labels = ["Клинок ушёл вправо", "Клинок вниз-влево, хвост вправо"];
    art = (
      <>
        {[120, 420].map((x, i) => (
          <g key={x}>
            <Circle x={x} y={65} r={18} color={old} />
            <Path d={`M${x} 85 V132 M${x} 100 L${x - 25} 115`} color={old} />
            <Path
              d={`M${x - 25} 115 L${i ? x - 95 : x + 90} 163 M${x} 132 Q${x + 58} 158 ${x + 78} 121`}
              color={i ? green : red}
            />
          </g>
        ))}
      </>
    );
  } else if (
    operation === "study-arm" ||
    (kind === "layers" &&
      ["upper-arm", "forearm", "hand", "rotation-test"].includes(operation))
  ) {
    labels = [
      "Разрыв между соседними частями",
      "Запас окончания закрывает стык",
    ];
    art = (
      <>
        {[110, 410].map((x, i) => (
          <g key={x}>
            <Path
              d={`M${x - 25} 65 L${x + 4} 106 M${x + (i ? 4 : 21)} ${i ? 106 : 125} L${x + 60} 148`}
              color={i ? green : red}
              width={12}
            />
            <Circle
              x={x + 4}
              y={106}
              r={17}
              color={i ? green : red}
              dash={!i}
            />
          </g>
        ))}
      </>
    );
  } else if (operation === "front-face" || operation === "depth") {
    labels = [
      operation === "front-face"
        ? "Стороны пересеклись"
        : "Рёбра уходят в разные стороны",
      operation === "front-face"
        ? "Замкнутая передняя грань"
        : "Одно направление глубины",
    ];
    art =
      operation === "front-face" ? (
        <>
          <Path d="M75 65 L170 145 V65 L75 145 Z" color={red} />
          <Path d="M375 65 H470 V145 H375 Z" color={green} />
        </>
      ) : (
        <>
          <Path
            d="M75 90 H150 V160 H75 Z M75 90 L45 55 M150 90 L180 55 M150 160 L180 140"
            color={red}
          />
          <Path
            d="M375 90 H450 V160 H375 Z M375 90 L405 55 H480 L450 90 M480 55 V125 L450 160"
            color={green}
          />
        </>
      );
  } else if (kind === "volume" && operation === "axis") {
    labels = [
      "Прямой вид не имеет бокового сдвига",
      "Ось прямого вида — по центру",
    ];
    art = (
      <>
        <Circle x={125} y={110} r={45} color={old} />
        <Path d="M145 70 Q185 110 145 150" color={red} />
        <Circle x={425} y={110} r={45} color={old} />
        <Path d="M425 65 V155" color={green} />
      </>
    );
  } else if (kind === "light" || operation.includes("shadow")) {
    labels = ["Тень направлена к лампе", "Тень уходит от лампы"];
    art = (
      <>
        {[115, 420].map((x, i) => (
          <g key={x}>
            <Circle x={x - 50} y={58} r={9} color={i ? green : red} />
            <Circle x={x} y={110} r={32} color={old} />
            <ellipse
              cx={x + (i ? 48 : -48)}
              cy="146"
              rx="43"
              ry="9"
              fill={i ? green : red}
              opacity=".5"
            />
            <Arrow x={x - 34} y={72} toX={x - 13} toY={95} color={old} />
          </g>
        ))}
      </>
    );
  } else if (
    kind === "color" ||
    ["closed-contour", "outer-contour", "study-base"].includes(operation)
  ) {
    labels = ["Щель выпускает цвет в фон", "Сначала замкни край"];
    art = (
      <>
        <Path d="M125 64 A45 40 0 1 0 158 90" color={red} />
        <Path d="M158 90 Q199 90 224 117" color={red} width={14} />
        <Circle x={420} y={106} r={43} color={green} fill="#e2ebd6" />
      </>
    );
  } else if (
    kind === "volume" ||
    (kind === "head" && ["skull", "beak-base", "copies"].includes(operation))
  ) {
    labels = ["Линия не огибает объём", "Дуга лежит на поверхности"];
    art = (
      <>
        <Circle x={125} y={110} r={45} color={old} />
        <Path d="M125 65 V155 M80 110 H170" color={red} />
        <Circle x={425} y={110} r={45} color={old} />
        <Path
          d="M425 65 Q455 110 425 155 M380 110 Q425 140 470 110"
          color={green}
        />
      </>
    );
  } else if (
    kind === "motion" ||
    (kind === "figure" &&
      ["contact", "weight-axis", "free-leg"].includes(operation))
  ) {
    labels = ["Между опорой и землёй зазор", "Подошва касается земли"];
    art = (
      <>
        {[110, 410].map((x, i) => (
          <g key={x}>
            <Line x1={x - 65} y1={155} x2={x + 85} y2={155} color={old} />
            <Path
              d={`M${x} 62 L${x - 15} 110 L${x + 12} ${i ? 155 : 137} h38`}
              color={i ? green : red}
              width={4}
            />
            {!i && <Path d={`M${x + 30} 140 v12`} color={red} dash />}
          </g>
        ))}
      </>
    );
  } else if (kind === "head") {
    labels = ["Линии глаз не согласованы", "Веки на общей направляющей"];
    art = (
      <>
        {[120, 420].map((x, i) => (
          <g key={x}>
            <Circle x={x} y={105} r={47} color={old} />
            <Path d={`M${x - 45} 98 Q${x} 117 ${x + 45} 98`} color={old} dash />
            <Circle
              x={x - 19}
              y={i ? 105 : 82}
              r={12}
              color={i ? green : red}
            />
            <Circle x={x + 24} y={107} r={8} color={i ? green : red} />
          </g>
        ))}
      </>
    );
  } else if (kind === "lion") {
    labels = ["Детали до больших масс", "Сначала объём и большие формы"];
    art = (
      <>
        <Path
          d="M85 90 l10 -12 9 18 11 -18 13 18 13 -14 10 19 M105 110 l12 -13 12 15 12 -12"
          color={red}
        />
        <Circle x={425} y={108} r={31} color={green} />
        <Path
          d="M404 86 L382 70 L395 106 L376 124 L407 141 L429 161 L449 137 L468 115 L450 80 L432 62 Z"
          color={green}
        />
      </>
    );
  } else if (["tablet", "layers", "files", "views"].includes(kind)) {
    labels = ["Всё слито в одну картинку", "Основа и действие раздельно"];
    art = (
      <>
        <rect x="65" y="65" width="155" height="75" fill="white" stroke={red} />
        <Text x={80} y={108} size={13}>
          один плоский слой
        </Text>
        <rect
          x="365"
          y="60"
          width="170"
          height="35"
          fill="white"
          stroke={green}
        />
        <rect
          x="365"
          y="112"
          width="170"
          height="35"
          fill="white"
          stroke={green}
        />
        <Text x={380} y={82} size={12}>
          действие / часть
        </Text>
        <Text x={380} y={134} size={12}>
          сохранённая основа
        </Text>
      </>
    );
  } else {
    labels = ["Много поправок по одному месту", "Один осмысленный проход"];
    art = (
      <>
        <Path
          d="M60 110 l15 -9 -5 12 18 -14 -3 16 18 -13 -5 13 20 -13 -4 14 20 -15 -4 15 35 -10"
          color={red}
        />
        <Path d="M360 110 Q420 100 510 110" color={green} />
      </>
    );
  }
  return (
    <div className="fl-error-box">
      <strong>Сравни принцип этого упражнения</strong>
      <svg
        viewBox="0 0 600 190"
        role="img"
        aria-label={`${labels[0]}; исправление: ${labels[1]}`}
      >
        <Text x={35} y={25} size={13} color={red}>
          {labels[0]}
        </Text>
        <Text x={335} y={25} size={13} color={green}>
          {labels[1]}
        </Text>
        {art}
      </svg>
      <p>Порядок исправления текущего рисунка указан в тексте шага.</p>
    </div>
  );
}
