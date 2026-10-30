import { canvasLabel } from "./projectSetup.js";

export const apps = [
  {
    id: "ipad",
    device: "iPad",
    name: "Procreate",
    tag: "Разовая покупка",
    url: "https://procreate.com/procreate",
    help: "https://help.procreate.com/procreate/handbook/animation",
    canvasStart:
      "В галерее нажми + → новый пользовательский холст. Введи ширину и высоту в пикселях (px).",
    layerStart:
      "Открой Layers (значок двух квадратов), нажми +. Коснись нового слоя → Rename (Переименовать).",
    animationStart:
      "В копии проекта оставь одну группу со всей первой позой: отдельные слои деталей сначала собери внутрь этой группы. Открой Actions (гаечный ключ) → Canvas → Animation Assist. Внизу появятся кадры; Add Frame добавляет следующий рисунок. Группа слоёв одной позы должна оставаться одним кадром.",
    setup: `Нажми + в галерее → новый холст ${canvasLabel()}, вертикальный — для утёнка. Для босса выбери ${canvasLabel("boss")}. Выбери карандаш в Sketching. В Layers начни с одного слоя для эскиза; остальные добавляй по уроку. Для движения: Actions → Canvas → Animation Assist.`,
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
    canvasStart:
      "File → New → Illustration. Выбери единицы px и введи ширину и высоту.",
    layerStart:
      "Открой Layer → New Layer → Raster Layer, введи название слоя. В панели Layer выбери его перед рисованием.",
    animationStart:
      "В Studio Mode открой File → New → Animation. Включи Timeline через Window → Timeline, если панель скрыта. Создай анимационную папку через Animation → New animation layer → Animation folder. Добавь New animation cel на Timeline: это место для одного рисунка. Для следующей позы добавь следующую cel; слой должен быть назначен на кадр Timeline, иначе он не появится в просмотре.",
    setup: `File → New → Illustration, ${canvasLabel()}, вертикальный — для утёнка; ${canvasLabel("boss")} — для босса. Начни с Pencil и одного растрового слоя эскиза. Для анимации создай документ Animation и открой Timeline. В PRO есть ограничение 24 кадра: для наших коротких упражнений достаточно.`,
    export:
      "Сохрани исходник .clip. Копию со слоями — PSD; для просмотра — Export animation → Animated GIF. Серийный экспорт cels зависит от редакции.",
  },
  {
    id: "huawei",
    device: "Huawei MatePad",
    name: "GoPaint",
    tag: "Для совместимых моделей",
    url: "https://consumer.huawei.com/en/mobileservices/gopaint/",
    help: "https://consumer.huawei.com/en/support/content/en-us16001068/",
    canvasStart:
      "В My artwork создай новый холст с пользовательским размером. Укажи ширину и высоту в px.",
    layerStart:
      "Открой Layers (Слои) и добавь новый пустой слой. Выдели его перед рисованием; название можно поменять в параметрах слоя.",
    animationStart:
      "Сначала сделай отдельную копию проекта. Если в твоей версии есть режим анимации, открой его и создай первый кадр с целым героем. Если такого режима нет, работай обычными слоями: назови их «Поза 01», «Поза 02» и далее. Показывай только текущую позу, предыдущую оставляй полупрозрачной. Так можно нарисовать все позы сейчас и собрать движение на ПК позже.",
    setup: `В My artwork создай вертикальный холст ${canvasLabel()} для утёнка или ${canvasLabel("boss")} для босса. Выбери карандаш, открой Layers и начни с одного слоя эскиза. Анимация доступна на поддерживаемых моделях и версиях. Если её нет, нарисуй ключевые позы на отдельных слоях и собери движение позже на ПК.`,
    export:
      "Menu → Export & share → PSD для продолжения на ПК; PNG для отдельных частей. В версиях с анимацией доступны GIF, MP4 и последовательность кадров.",
  },
];
