// Explicit source rectangles preserve complete poses across irregular source grids.
// Opposite anatomical sides stay fixed: right arm and left leg are mechanical.
export const animationSheets = {
  run: {
    src: "/assets/duck-profile-run-v4.png",
    sourceSize: [1774, 887],
    columns: 3,
    rows: 2,
    title: "Бег · вид сбоку",
    scale: 1.05,
    output: {
      width: 512,
      height: 600,
      baseline: 560,
      anchorX: 256,
    },
    frames: [
      {
        sourceIndex: 0,
        bbox: {
          x: 33,
          y: 15,
          width: 406,
          height: 432,
        },
        sourceRect: {
          x: 29,
          y: 11,
          width: 414,
          height: 440,
        },
        anchor: {
          x: 236,
          y: 447,
        },
        lift: 0,
      },
      {
        sourceIndex: 1,
        bbox: {
          x: 498,
          y: 16,
          width: 337,
          height: 431,
        },
        sourceRect: {
          x: 494,
          y: 12,
          width: 345,
          height: 439,
        },
        anchor: {
          x: 666.5,
          y: 447,
        },
        lift: 0,
      },
      {
        sourceIndex: 3,
        bbox: {
          x: 1391,
          y: 17,
          width: 365,
          height: 428,
        },
        sourceRect: {
          x: 1387,
          y: 13,
          width: 373,
          height: 436,
        },
        anchor: {
          x: 1573.5,
          y: 447,
        },
        lift: 35,
      },
      {
        sourceIndex: 4,
        bbox: {
          x: 42,
          y: 458,
          width: 416,
          height: 418,
        },
        sourceRect: {
          x: 38,
          y: 454,
          width: 424,
          height: 426,
        },
        anchor: {
          x: 250,
          y: 876,
        },
        lift: 0,
      },
      {
        sourceIndex: 5,
        bbox: {
          x: 517,
          y: 455,
          width: 351,
          height: 421,
        },
        sourceRect: {
          x: 513,
          y: 451,
          width: 359,
          height: 429,
        },
        anchor: {
          x: 692.5,
          y: 876,
        },
        lift: 0,
      },
      {
        sourceIndex: 7,
        bbox: {
          x: 1391,
          y: 459,
          width: 365,
          height: 370,
        },
        sourceRect: {
          x: 1387,
          y: 455,
          width: 373,
          height: 378,
        },
        anchor: {
          x: 1573.5,
          y: 876,
        },
        lift: 35,
      },
    ],
  },
  jump: {
    src: "/assets/duck-profile-jump-v4.png",
    sourceSize: [1536, 1024],
    columns: 3,
    rows: 2,
    title: "Прыжок · вид сбоку",
    scale: 0.85,
    output: {
      width: 512,
      height: 600,
      baseline: 560,
      anchorX: 256,
    },
    frames: [
      {
        sourceIndex: 0,
        bbox: {
          x: 132,
          y: 33,
          width: 267,
          height: 487,
        },
        sourceRect: {
          x: 128,
          y: 29,
          width: 275,
          height: 495,
        },
        anchor: {
          x: 265.5,
          y: 520,
        },
        lift: 0,
      },
      {
        sourceIndex: 1,
        bbox: {
          x: 590,
          y: 142,
          width: 384,
          height: 381,
        },
        sourceRect: {
          x: 586,
          y: 138,
          width: 392,
          height: 389,
        },
        anchor: {
          x: 782,
          y: 523,
        },
        lift: 0,
      },
      {
        sourceIndex: 2,
        bbox: {
          x: 1151,
          y: 10,
          width: 318,
          height: 509,
        },
        sourceRect: {
          x: 1147,
          y: 6,
          width: 326,
          height: 517,
        },
        anchor: {
          x: 1310,
          y: 520,
        },
        lift: 18,
      },
      {
        sourceIndex: 3,
        bbox: {
          x: 107,
          y: 531,
          width: 356,
          height: 393,
        },
        sourceRect: {
          x: 103,
          y: 527,
          width: 364,
          height: 401,
        },
        anchor: {
          x: 285,
          y: 1013,
        },
        lift: 100,
      },
      {
        sourceIndex: 4,
        bbox: {
          x: 592,
          y: 623,
          width: 396,
          height: 390,
        },
        sourceRect: {
          x: 588,
          y: 619,
          width: 404,
          height: 398,
        },
        anchor: {
          x: 790,
          y: 1013,
        },
        lift: 0,
      },
      {
        sourceIndex: 5,
        bbox: {
          x: 1145,
          y: 528,
          width: 268,
          height: 485,
        },
        sourceRect: {
          x: 1141,
          y: 524,
          width: 276,
          height: 493,
        },
        anchor: {
          x: 1279,
          y: 1013,
        },
        lift: 0,
      },
    ],
  },
  idle: {
    src: "/assets/duck-profile-idle-v4.png",
    sourceSize: [1262, 1246],
    columns: 2,
    rows: 2,
    title: "Ожидание · вид сбоку",
    scale: 0.78,
    output: {
      width: 512,
      height: 600,
      baseline: 560,
      anchorX: 256,
    },
    frames: [
      {
        sourceIndex: 0,
        bbox: {
          x: 236,
          y: 23,
          width: 251,
          height: 596,
        },
        sourceRect: {
          x: 232,
          y: 19,
          width: 259,
          height: 604,
        },
        anchor: {
          x: 361.5,
          y: 619,
        },
        lift: 0,
      },
      {
        sourceIndex: 1,
        bbox: {
          x: 821,
          y: 21,
          width: 250,
          height: 598,
        },
        sourceRect: {
          x: 817,
          y: 17,
          width: 258,
          height: 606,
        },
        anchor: {
          x: 946,
          y: 619,
        },
        lift: 0,
      },
      {
        sourceIndex: 2,
        bbox: {
          x: 240,
          y: 632,
          width: 259,
          height: 598,
        },
        sourceRect: {
          x: 236,
          y: 628,
          width: 267,
          height: 606,
        },
        anchor: {
          x: 369.5,
          y: 1230,
        },
        lift: 0,
      },
      {
        sourceIndex: 3,
        bbox: {
          x: 816,
          y: 636,
          width: 256,
          height: 596,
        },
        sourceRect: {
          x: 812,
          y: 632,
          width: 264,
          height: 604,
        },
        anchor: {
          x: 944,
          y: 1232,
        },
        lift: 0,
      },
    ],
  },
};
