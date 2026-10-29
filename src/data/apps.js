export const apps = [
  {
    id: "ipad",
    device: "iPad",
    name: "Procreate",
    tag: "Разовая покупка",
    url: "https://procreate.com/procreate",
    help: "https://help.procreate.com/procreate/handbook/animation",
    setup:
      "Нажми + в галерее → новый холст 2048 × 2048 px. Выбери карандаш в Sketching. В Layers создай отдельные слои «эскиз», «контур», «цвет». Для движения: Actions → Canvas → Animation Assist.",
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
    setup:
      "File → New → Illustration, 2048 × 2048 px. Начни с Pencil и трёх растровых слоёв: эскиз, контур, цвет. Для анимации создай документ Animation и открой Timeline. В PRO есть ограничение 24 кадра: для наших коротких упражнений достаточно.",
    export:
      "Сохрани исходник .clip. Копию со слоями — PSD; для просмотра — Export animation → Animated GIF. Серийный экспорт cels зависит от редакции.",
  },
  {
    id: "huawei",
    device: "Huawei MatePad",
    name: "GoPaint",
    tag: "Для совместимых моделей",
    url: "https://consumer.huawei.com/en/mobileservices/gopaint/",
    help: "https://consumer.huawei.com/cn/support/content/zh-cn16041996/",
    setup:
      "В My artwork создай холст 2048 × 2048 px. Выбери карандаш, открой Layers и создай эскиз, контур и цвет. Обнови планшет через HOTA: анимация доступна на поддерживаемых моделях и версиях. Если её нет, нарисуй ключевые позы на отдельных слоях и собери движение позже на ПК.",
    export:
      "Menu → Export & share → PSD для продолжения на ПК; PNG для отдельных частей. В версиях с анимацией доступны GIF, MP4 и последовательность кадров.",
  },
];
