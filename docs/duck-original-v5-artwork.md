# Исходный арт утёнка: основной курс v5

Дата: 2026-10-31. Встроенный image_gen, без CLI/API. Основной курс теперь учит рисовать именно исходную динамичную позу 15-duck-subdermal-interface.png. В нём 84 действия: 7 глав по 12 панелей. Профильный курс v4 сохранён отдельно в src/data/duckProfileMasterclass.js для будущего перехода к анимации; основной duckMasterclass.js его не использует.

## Авторитетный референс и стороны

Оригинал: D:/My game/picture/главный герой/15-duck-subdermal-interface.png. В приложении: /assets/duck-current-art.png; именно этот файл стоит в duckMasterclass.reference. Лист разворотов /assets/duck-current-model.png — только дополнительный источник деталей.

Перед листами создан и визуально проверен стабильный полноцветный эталон /assets/duck-original-pose-guide-v5.png. Он повторяет динамичную позу оригинала без напольных брызг; исходный арт остаётся главным.

В оригинале ноги широко расставлены и согнуты; голова в три четверти слегка вправо, видны два обычных глаза. Слева на экране — правая рука героя: живое плечо, механическое предплечье и раскрытые металлические пальцы. Справа — левая живая рука с перчаткой без пальцев и открытыми естественными пальцами. Слева — длинная брючина на живой правой ноге. Справа — короткая рваная брючина над открытым механическим левым коленом и голенью. Зеркалирование всей модели не применяется.

Рабочий холст: 3600 × 2400 px, горизонтальный 3:2. Квадратная учебная панель является окном просмотра/приближением и не требует сжимать стойку или менять формат исходника.

## Финальные файлы

Все 7 учебных листов имеют 1448 × 1086 px, сетка 4 × 3, ячейка 362 × 362 px. Порядок слева направо, затем следующая строка.

| Файл в public/assets                   | Содержание                                         | Исходный файл генератора                      |
| -------------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| duck-original-pose-guide-v5.png        | Полноцветный эталон исходной позы                  | exec-fbcd6b17-7fd5-46c4-9b3a-2800e61e259d.png |
| duck-original-composition-steps-v5.png | Габариты, оси, объёмы корпуса, конечности и ладони | exec-8f5d12f6-97a2-4d69-a84f-cf5f67ddc576.png |
| duck-original-head-steps-v5.png        | Голова в три четверти: от овала до чистой линии    | exec-6aa959aa-87af-4ac5-81c8-a6d8bd4c8abe.png |
| duck-original-torso-steps-v5.png       | Шея, майка, жилет, пояс, ткань и хвост             | exec-1ef6ddbb-2666-4312-9ea4-82d904f5269f.png |
| duck-original-arms-steps-v5.png        | Разные руки и раскрытые кисти                      | exec-0debcd8a-b143-4f05-ab34-c76ee2b64662.png |
| duck-original-legs-steps-v5.png        | Широкая стойка, брюки, протез справа, кроссовки    | exec-c6f1188b-5014-47f0-86c2-1beebf407eb8.png |
| duck-original-ink-steps-v5.png         | Последовательная обводка отдельных частей          | exec-4278c8b3-1494-48c5-8c92-d0d86a6adb4a.png |
| duck-original-finish-steps-v5.png      | Последовательные заливки, тени, металл и опора     | exec-2c27b0c2-d6eb-4c47-90ae-389eb89b5dd4.png |

Исходные результаты находятся в C:/Users/ilyag/.codex/generated_images/01a18d0f-3fd9-7f22-a0b0-09013839174e/. Финалы скопированы в проект, оригиналы генератора оставлены на месте.

## Проверка и исправления

Каждый финальный лист просмотрен через view_image. Проверены исходная раскрытая поза, экранные стороны рук/ног, два обычных глаза, маленький височный имплант, высокий малиновый жилет, разные брючины, раскрытые кисти и отсутствие нового оружия.

- Для composition первый вариант слишком усилил наклон торса. Первая коррекция спутала последовательность ранних стадий; она не принята. Финал сгенерирован заново с явным запретом сливать овал и оси лица, одну и две ноги: это разные операции в своих панелях.
- Для arms исправлен сдвиг первых стадий: теперь первая панель уже строит живое плечо слева; вторая — крепление; третья — пустой корпус протеза; четвёртая — его внутренние грани и нишу. В третьей панели отдельно удалены преждевременные детали ниши.
- Десятая панель рук реально строит всю живую кисть, одиннадцатая добавляет перчатку; текст согласован с этими операциями.
- На части панелей уже готовые участки осветлены серым для выделения нового действия. В курсе прямо объяснено, что в собственном рисунке их стирать или осветлять не нужно. Это особенно относится к чистовой обводке и смене фокуса с механической голени на обувь.
- Лист finish начинается с кремовой базы живых частей и последовательно добавляет лицо, светлую ткань, малиновый жилет, тёмную ткань, металл, цветные вставки, тени, грани, фактуру и напольную опору.

Структурная проверка Node: 7 глав по 12, 84 последовательных уникальных ID duck-original-v5-1…84, по одному непустому действию и критерию/ошибке; все 7 PNG существуют, размеры делятся на сетку без остатка. Prettier выполнен для данных и документации.

Листы — учебная реконструкция стадий, созданная ИИ по оригиналу, а не запись процесса автора или его исходные слои. Главный оригинал доступен для точной сверки формы и материалов.

## Точные промпты

### Цветовой эталон исходной позы

```text
Use case: scientific-educational. Asset: master pose reference for an exact drawing tutorial.
Reproduce the supplied cyber duck FULL BODY artwork as faithfully as possible, preserving its EXACT DYNAMIC THREE-QUARTER POSE, silhouette, proportions, face, outfit, limb anatomy and left/right assignment. Plain pale warm gray backdrop, remove only ground paint splatter. Do not redesign or straighten pose.
POSE LOCK: head above center, tilted and turned slightly right, BOTH natural eyes visible, orange beak points right. Wide bent knees and widely separated feet. On IMAGE LEFT the anatomical RIGHT arm extends down-left with LIVING feathered upper arm and METAL forearm plus splayed METAL FINGERS. On IMAGE RIGHT the anatomical LEFT arm extends down-right, living skin/feathers, BLACK FINGERLESS GLOVE and natural fingertips. On IMAGE LEFT the anatomical RIGHT leg has full long baggy charcoal trouser leg and sneaker. On IMAGE RIGHT the anatomical LEFT leg has short ragged trouser opening above exposed METAL KNEE, METAL SHIN, sneaker.
IDENTITY: cream spiky punk crest with black/magenta ends, tiny flat temple implant (NO huge cyber-eye), segmented dark neck/cyan lights, short MAGENTA sleeveless high collar vest over cream torn tank, dark belt with rectangular buckle, magenta sash trailing left, little cream feather tail behind left hip, reference high-top cream/black/cyan/magenta sneakers.
Ink linework/cel shading/material textures match original. Center full pose with room around fingertips, crest and soles. NO front neutral stance, NO side-profile stance, NO mirroring, NO weapon, NO labels/text. Full color. The original image is the sole authority.
```

### Композиция, первый вариант

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: FULL BODY COMPOSITION/POSE CONSTRUCTION ONLY. Whole pose fits every cell with safety margin. No face details, no clothes, no color. Each progressive operation is clearly visible as slightly darker new pencil lines while earlier construction remains light.
1 floor baseline plus very faint overall pose bounding box, otherwise blank.
2 add oval skull near upper center-right exactly matching reference head center/tilt, leave room for crest.
3 add curved vertical face axis and eye-level cross guide showing the head in 3/4 turning right.
4 add curved spine action line from skull base down-left to pelvis location.
5 add tilted ribcage oval around upper spine, reference shoulder lean.
6 add angled pelvis block below ribcage, narrow gap at waist.
7 add diagonal shoulder axis and two small shoulder joint circles.
8 add anatomical RIGHT arm stick from left-screen shoulder down-left via elbow to wrist, mechanical hand not yet drawn.
9 add anatomical LEFT arm stick from right-screen shoulder down-right via elbow to wrist.
10 add anatomical RIGHT leg stick from pelvis diagonally down-left via bent knee to floor, simple sneaker wedge.
11 add anatomical LEFT leg stick from pelvis outward right through high bent knee down-right to floor, simple second sneaker wedge.
12 add small palm wedges/fan guides at both wrists, left-screen splayed mechanical hand orientation, right-screen live hand orientation. Keep mannequin simple and uncolored, no clothes.
By cell12 show only well-placed construction scaffold of exact dynamic pose, not a finished character.
```

### Композиция, отклонённая коррекция якорей

```text
Edit this twelve-panel pose-construction sheet. Keep exact 4x3 grid, twelve different cumulative operations and all stage progression. Correct ONLY the body landmark placement to match second image (the ORIGINAL artwork) more accurately. The first version leans the torso far too much left and places pelvis too low. Original torso is only gently diagonal, head nearly above pelvis; do not exaggerate the lean.
In EACH equal square panel, normalized coordinates measured within its own cell, use these same anchors whenever that part has appeared:
skull center x58%,y24%, skull width19%,height22%;
neck base x54%,y35%;
ribcage center x53%,y43%;
pelvis center x51%,y57%;
left-screen shoulder x40%,y36%; right-screen shoulder x66%,y40%;
left-screen elbow x30%,y45%, left-screen wrist x18%,y55%, left-screen hand tips x10%,y63%;
right-screen elbow x74%,y50%, right-screen wrist x84%,y58%, right-screen hand tips x91%,y64%;
left-screen trouser knee x32%,y74%, left-screen foot wedge center x23%,y91%;
right-screen exposed mechanical knee x72%,y68%, right-screen foot wedge center x84%,y90%.
Both feet same ground baseline y94%, safe inside cells. Wide original spread stance, right-screen knee high and bent. Keep bare skeleton/construction only, NO finished clothes or face. Stages:1 box/ground;2 oval;3 headguides;4 spine;5 ribcage;6 pelvis;7 shoulders;8 left arm axes;9 right arm axes;10 left leg/foot;11 right leg/foot;12 hand fan wedges. No phantom extra body parts earlier. Early cells remain simple, matching cell12 layout. No words/numbers.
```

### Композиция, принятый финал

```text
Scientific educational raster worksheet: twelve DISTINCT progressive drawing steps in EXACT 4 columns x3 rows, equal square panels, pale paper, precise thin gray grid. No text or numbers. Every panel adds ONLY ONE operation below and retains all previous operations. Do not shift or collapse sequence. Do not draw future parts earlier.
REFERENCE: supplied ORIGINAL duck wide crouched pose. This is only its BARE CONSTRUCTION SKELETON, no feathers, face, clothing or mechanical details. Head near upper center (58%width), pelvis near 51%width: head only SLIGHTLY right of pelvis, torso nearly upright with slight diagonal. Wide bent knees, hands outspread sideways/down. All parts same coordinates in all cells.
1 ONLY faint overall bounding rectangle and ground line, no oval yet.
2 add ONE EMPTY skull oval, NO facial cross, NO spine, no body.
3 add facial cross guide INSIDE that oval; no new body parts yet.
4 add short gentle spine curve from neck base to future pelvis center y57%; DO NOT extend spine to floor.
5 add ribcage oval centered x53%,y43%, beneath head.
6 add pelvis block centered x51%,y57%, no shoulders/arms/legs yet.
7 add shoulder line with two shoulder joint circles, no arms yet.
8 add LEFT-SCREEN arm stick with elbow/wrist circles, from shoulder down-left.
9 add RIGHT-SCREEN arm stick with elbow/wrist circles, from shoulder down-right. No legs yet.
10 add ONLY LEFT-SCREEN bent leg with knee circle and large foot wedge on ground; RIGHT leg still absent.
11 ADD RIGHT-SCREEN bent leg with HIGH OUTWARD KNEE and second foot wedge on ground. This must differ clearly from cell10 by one complete new leg.
12 ADD small palm/finger-fan wedges at both wrists. No detailed fingers.
Keep full dynamic pose simple scaffold, feet far apart and same ground level y94%, left hand at x12%,right handx90%. Critical stages2 and3 are EMPTY OVAL then FACIAL GUIDES; stage10 ONE LEG then stage11 TWO LEGS. No duplicates.
```

### Голова

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: CLOSE-UP HEAD construction, exact 3/4 angle of ORIGINAL, not profile. Same crop/position every cell; no body/neck. TWO ordinary eyes visible, far right-screen eye narrower. No color.
1 one light tilted oval skull.
2 add curved facial centerline biased toward screen-right, and eye-level guide.
3 add broad upper duck bill silhouette projecting slightly right in 3/4.
4 add lower bill thickness, corner and mouth seam.
5 add near ordinary eye on screen-left of face, heavy top lid.
6 add narrower far ordinary eye on screen-right of face at same perspective level.
7 add brows and small irises under lids, stern original expression.
8 add short feathered cheek and chin contour around lower skull.
9 add large swept spiky crest OUTER silhouette with reference big feather groups and asymmetry.
10 add a few internal crest grouping lines.
11 add tiny flat gold-temple implant contour on screen-left temple above eye, NOT a large circular lens.
12 erase construction, clean all final linework of SAME head and details. Do not color, do not ink-fill whole crest. Exactly original head shape/angle.
```

### Торс и одежда

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: TORSO close-up, crop from chin to hips of ORIGINAL DYNAMIC pose. Ghost jaw/shoulder-axis context allowed, no finished arms or legs. Keep torso tilted as original, never upright neutral. Each cell cumulative monochrome:
1 light ribcage and pelvic block plus refined side contours of chest/waist.
2 add short mechanical neck cylinder beneath jaw, no segments yet.
3 add layered neck plates and slim unfilled indicator slots.
4 add tank top neckline and outer side edges.
5 add tank bottom hem and a few large diagonal cloth folds.
6 add tall pointed vest COLLAR on both sides of neck, left-screen collar larger.
7 add near LEFT-SCREEN short vest panel with sleeveless armhole and thickness, living shoulder remains open.
8 add far RIGHT-SCREEN vest panel, narrow lapel and several seam edges; tank visible between panels.
9 add belt wrapping angled pelvis, rectangular buckle near front, left-screen hanging metal ring/loops.
10 add long narrow ragged belt cloth sash trailing down-left, from belt attachment.
11 add short fluffy duck tail at left-screen hip behind belt, not long animal tail.
12 remove hidden construction and clean clear lineart of complete neck, shirt, vest, belt, sash and short tail. No color.
Each cell same torso position/shape, true incremental drawing, no fully clothed torso in early cells.
```

### Руки, первый вариант

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: BOTH OUTSTRETCHED ARMS from shoulder to spread fingertips, matching full original wide dynamic gesture. Crop wide enough to fit all fingers, torso/vest faint gray ghost context ONLY; arms start as thin axes with joint markers, remain at exact original positions. No head/legs required. On SCREEN LEFT mechanical forearm/hand; on SCREEN RIGHT live hand. NO COLOR.
1 add only contours of LIVING feathered upper arm on SCREEN LEFT between shoulder and elbow.
2 add elbow connector ring/cuff on LEFT SCREEN arm.
3 add large angular METAL forearm armor shell running down-left from elbow, taper at wrist.
4 add large armor seams and narrow blank light recess.
5 add mechanical wrist joint and palm block, palm open toward viewer at angle.
6 add different length splayed finger AXES from that mechanical palm, including opposed thumb (simple sticks only).
7 enclose all mechanical finger axes with short rigid phalanx segments and joint gaps; clearly ROBOT fingers.
8 add contours of LIVING upper arm on SCREEN RIGHT, shoulder to elbow, no metal.
9 add LIVING forearm contours from RIGHT SCREEN elbow down-right to wrist.
10 add RIGHT SCREEN natural palm and thumb in original relaxed open spread gesture.
11 add remaining natural fingertips and fingerless-glove outline/cuff on RIGHT SCREEN hand, leave fingers exposed.
12 erase joint/axis construction and refine both arm contours, short feather edge and a few metal fasteners.
Critical anatomically RIGHT hero arm = SCREEN LEFT robot forearm, hero LEFT arm = SCREEN RIGHT living. Both hands open, not fists. Stages must build actual parts, not zoom same finished picture.
```

### Руки, исправление первых четырёх стадий

```text
Edit ONLY first four panels (top row) of this 4x3 arms-construction tutorial, keeping all eight panels in rows2 and3 unchanged. Current top row is shifted one operation too late. Preserve identical light-gray torso/arm axes, EXACT pose/positions and same grid.
TOP ROW corrected cumulative black drawing:
cell1: add living feathered SCREEN LEFT upper-arm silhouette from shoulder to elbow (as current cell2). Rest arms only pale axes.
cell2: keep that living upper arm, add mechanical elbow connector cuff/ring (as current cell3).
cell3: retain upper arm/cuff, add large angular mechanical forearm SHELL (as current cell4), stop at wrist, no palm yet.
cell4: retain all above, add large armor panel seams and narrow rectangular LIGHT SLOT inside forearm. Stop at wrist, no palm yet.
Rows2 and3 unchanged: cell5 already has wrist/palm, cell6 finger axes,cell7 segmented metal fingers,cell8 living upper arm RIGHT SCREEN,cell9 living forearm,cell10 natural hand,cell11 fingerless glove,cell12 cleaned contours.
IMPORTANT SCREEN LEFT is robotic forearm/hand; SCREEN RIGHT is LIVING natural arm/hand with fingerless glove. Do not swap sides. No color, no text. No new introductory axes-only stage; corrected cell1 already has living upper arm.
```

### Руки, удаление преждевременной ниши в панели3

```text
Precise LOCAL edit ONLY in row1 column3 (third cell of top row) of this existing 4x3 worksheet. In that cell, mechanical forearm currently already has internal rectangular light-slot and armor seam lines. ERASE ONLY those INTERNAL detail lines inside the forearm shell, leaving a plain EMPTY white angular forearm housing with its outer contour and elbow/wrist connecting outlines intact. The third cell must teach outer shell only; internal plate seams and rectangular light-slot belong to fourth cell and should first appear there.
Do not change any other panel, grid, body pose, gray guides, upper arm or hand axes. In row1 column4 KEEP all armor seam/slot details exactly as they are. No color, no text.
```

### Ноги

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: BOTH LEGS in ORIGINAL WIDE CROUCHED THREE-QUARTER stance, crop belt/hips to soles, no upper torso/head. Underlying pose axes light gray in ALL panels as already completed context. No introductory axes-only cell: panel1 starts directly with first requested operation. No color. SCREEN LEFT full baggy trouser leg bent outward left; SCREEN RIGHT short ragged thigh, high exposed mechanical knee bent outward right and mechanical shin diagonal down-right. Large reference sneakers seen in DIFFERENT THREE-QUARTER angles, not side-view copies. Fixed floor baseline.
1 add broad upper thigh contours of full-length trouser leg on SCREEN LEFT from pelvis to bent knee.
2 add lower trouser leg contours from that knee to ankle, no shoe detail.
3 add a few large directional folds of long trouser leg.
4 add SCREEN RIGHT short thigh/trouser section with ragged hem ABOVE future mechanical knee.
5 add exposed large circular mechanical knee and side coupling below that ragged hem.
6 add mechanical shin struts linking right-screen knee down-right to ankle.
7 add large angled armor plates, gaps and narrow blank light recess on mechanical shin.
8 add SCREEN LEFT sneaker VOLUME with broad foreshortened toe toward viewer-left, high ankle and thick sole, no detailed panels.
9 add SCREEN RIGHT sneaker volume connected to mechanical ankle, toe points right slightly toward viewer, same floor level.
10 add both sneaker major panel boundaries and thick sole divisions.
11 add laces and a few ankle/knee fasteners.
12 remove joint/axis guides, clean linework and overlaps of finished monochrome legs. Keep original wide dynamic squat and correct asymmetry.
```

### Чистовой контур

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: FULL FIGURE CLEAN-INK PASS over a very pale 20% gray complete detailed working sketch of EXACT original dynamic pose (image references). All details already in pale sketch in every cell. Twelve progressive operations trace separate areas in clear BLACK ink while untraced areas stay pale gray. NO COLOR OR SHADING anywhere. Same full figure size/pose every cell, full safe margins including fingers and soles. Never all-black finished art early.
1 trace ONLY OUTER HEAD silhouette (crest/cheeks/chin); all face interior/body still pale sketch.
2 add clean face ink: BOTH ordinary eyes/brows, beak, tiny flat temple implant, crest interior groups.
3 add clean mechanical NECK plates/slots.
4 add clean TANK TOP edges/major folds.
5 add clean HIGH COLLAR MAGENTA VEST outlines, both panels and sleeveless armholes, no fill.
6 add clean BELT/buckle/ring, trailing cloth SASH and short feather TAIL.
7 add clean SCREEN LEFT mechanical ARM: living upper arm then metal forearm, palm and rigid splayed segmented fingers.
8 add clean SCREEN RIGHT LIVE ARM and fingerless glove, natural exposed spread fingertips.
9 add clean LONG LEFT-SCREEN TROUSERS and short ragged RIGHT-SCREEN thigh, main folds.
10 add clean RIGHT-SCREEN MECHANICAL KNEE/SHIN and armor construction.
11 add clean BOTH SNEAKERS panels/laces/soles at different original 3/4 angles.
12 REMOVE pale underlying construction everywhere, complete clean black outline artwork, no color.
This is cumulative ink coverage, not twelve complete copies with tiny unrelated marks. Make newly inked area obvious in every cell. Keep exact reference pose, hand sides and foot spacing.
```

### Цвет и материалы

```text
Use case: scientific-educational. Asset: a genuine RASTER drawing-tutorial sheet, EXACT FOUR columns by THREE rows, twelve equal SQUARE cells, landscape 4:3. Precise thin gray grid on warm off-white paper, NO labels/text/numbers. Read left to right, then next row. Every cell adds EXACTLY its requested small drawing operation to all previous marks. SAME pose, view, size and location throughout a sheet. Early stages simple construction, not12 copies of completed art. Pencil to ink, monochrome unless explicitly coloring.
BOTH supplied images are reference images of THE SAME EXACT ORIGINAL DYNAMIC THREE-QUARTER POSE; image1 original is authoritative, image2 is clean pose guide. Do not neutralize or rotate the pose. Head turns slightly RIGHT, both ordinary eyes visible. Wide spread bent legs. On SCREEN LEFT: anatomical RIGHT living upper arm + MECHANICAL FOREARM/HAND stretched down-left, full long baggy trouser RIGHT leg with sneaker below. On SCREEN RIGHT: anatomical LEFT LIVE ARM/HAND in fingerless glove down-right, LEFT short ragged thigh + EXPOSED METAL KNEE/SHIN + sneaker. Small flat temple implant, NO old big round cyber-eye. Magenta sleeveless vest, cream tank, short feather tail and trailing magenta sash. NO flipping sides, NO side-view/profile stance, NO weapons. Keep reference silhouette and proportions exactly.
SHEET: FULL FIGURE COLORING in EXACT SAME ORIGINAL wide dynamic crouched THREE-QUARTER pose in all12 cells. Start with complete clean black linework of original and progressively add specified MATERIAL/COLOR operations. At every cell all uncolored areas remain white paper, NO gray colored fill unless specified. No intro lineart-only cell: stage1 must already add cream. Same drawing positions/proportions and fine linework throughout, safe margins.
1 add ONLY flat light CREAM to crest/cheeks, living shoulders/arms, right-screen exposed natural fingertips and short tail; all beak/clothes/metal remain white.
2 retain cream and add orange BEAK, two ordinary eyes with dark pupils/light sclera and tiny gold temple implant.
3 add warm ivory TANK TOP and light cream SNEAKER PANELS only, vest/trousers/metal white.
4 add deep MAGENTA high-collar short vest and trailing belt sash.
5 add CHARCOAL long LEFT-SCREEN trousers, short RIGHT-SCREEN ragged thigh, belt, RIGHT-SCREEN fingerless glove and black shoe panels. Natural fingertips remain cream; robot areas still white.
6 add dark STEEL base fills on NECK, SCREEN LEFT mechanical FOREARM/HAND and SCREEN RIGHT mechanical KNEE/SHIN, with slightly lighter armor panels. Living arm on screen right is NOT metal.
7 add BLACK/MAGENTA CREST TIPS plus small blue/magenta inserts on both sneakers, flat color only.
8 add large cel shadows on FEATHERS/LIVING SKIN, consistent upper-left light.
9 add grouped cel shadows on CLOTH and SHOES, keep large readable shapes.
10 add METAL edge highlights and narrow CYAN indicators on neck, LEFT SCREEN forearm and RIGHT SCREEN shin.
11 add controlled fine material texture: small ink feather strokes, cloth frays, metal scratches and very sparse magenta edge accents.
12 add soft CONTACT SHADOW under feet and restrained cyan/magenta ground flecks as original, final clean refined dynamic artwork.
Critical: preserve both ordinary eyes and exact image-left mechanical hand/image-right natural fingers throughout. Do not accidentally color natural fingers as metal. Each cell clearly cumulative, NOT12 finished color copies. No side pose or standing neutral.
```
