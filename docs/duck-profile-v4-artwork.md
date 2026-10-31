# Новый утёнок: урок профиля v4

Дата: 2026-10-30. Метод: встроенный image_gen, без API/CLI. Все листы — новые растровые изображения для проекта; исходные результаты генератора сохранены на месте. Каждый финальный лист имеет размер 1448 × 1086 px и содержит 12 стадий в равной сетке 4 × 3 (ячейка 362 × 362 px), порядок слева направо и сверху вниз.

## Источники модели

- D:/My game/picture/главный герой/15-duck-subdermal-interface.png — дизайн, материалы и цвета.
- D:/My game/picture/главный герой/15-duck-rig-poses.png — анатомические стороны и боковой ракурс (нижний средний вид, лицо вправо).
- В приложении: /assets/duck-current-art.png и /assets/duck-current-model.png.

Модель: правая рука героя механическая ниже локтя, левая живая в перчатке; левая нога механическая, правая в длинной брючине. Короткий малиновый жилет, кремовый хохолок с тёмными и малиновыми кончиками, маленький височный имплант. Старой круглой глазной линзы нет. Все учебные виды направлены вправо; зеркалирование всей асимметричной модели не используется.

## Финальные файлы и происхождение

Исходные результаты находятся в C:/Users/ilyag/.codex/generated_images/01a18d0f-3fd9-7f22-a0b0-09013839174e/. В проект скопированы:

| Файл в public/assets             | Исходный файл генератора                      |
| -------------------------------- | --------------------------------------------- |
| duck-profile-head-steps-v4.png   | exec-24f22c1a-845e-4be0-ab0d-15d2a9d54593.png |
| duck-profile-body-steps-v4.png   | exec-52cdd53e-750b-4f58-8922-050195d10b60.png |
| duck-profile-arms-steps-v4.png   | exec-8d0e3915-075a-4bf4-9848-3b6b43a613c7.png |
| duck-profile-legs-steps-v4.png   | exec-7063a3bd-9576-4d95-93f8-c894c737430c.png |
| duck-profile-finish-steps-v4.png | exec-04c182d8-3c6e-4e43-9642-d02b3f966d3c.png |

Сценарий 60 действий: src/data/duckMasterclass.js, экспорт duckMasterclass. Пять глав по 12 шагов, новые уникальные ID duck-profile-v4-* отделяют отметки от прежнего фронтального курса.

## Визуальная проверка

Все финальные листы просмотрены через view_image. На первых четырёх листах действительно нарастающее карандашное/чернильное построение, без повторения готового цветного героя с первого шага. Лист цвета начинается с чистого линейного рисунка и последовательно добавляет материалы, цвет, тени и небольшие индикаторы.

Первый вариант ног отклонён: таз и разведение ног были слишком фронтальными. Исправленная версия использует боковое перекрытие бёдер и кроссовки, направленные вправо. Для цветового листа отдельно исправлены отсутствие контура дальней руки в ранних стадиях, окрашенный хвост на первом этапе и пропущенная кремовая заливка хвоста на пятом этапе.

Проверены 60 непустых действий, 60 уникальных ID, по 12 панелей в каждой главе, существование пяти PNG и делимость их размеров на сетку. Листы являются учебными стадиями, сгенерированными по модели; это не исходные слои иллюстратора.

## Точные промпты

### 1 — голова

```text
Use case: scientific-educational. Create a professional raster drawing-tutorial contact sheet, EXACT 4 columns by 3 rows, 12 equal square panels, 2048x1536 landscape. Thin light gray dividers precisely at quarter widths and third heights. Plain warm off-white background. No text, no numbers. Reading order left to right then next row.
REFERENCE IDENTITY: attached NEW cyber duck, cream punk crest with black/magenta tips, orange duck beak, small subtle temple implant, NO round cyber-eye. Use ONLY STRICT RIGHT-FACING SIDE PROFILE as lower-middle view in rig reference, one visible eye. Never front or three-quarter. Hand-drawn pencil to ink style matching reference.
This sheet teaches DRAWING ONLY THE HEAD close up, same head position, scale and proportions in every panel. No body, no finished art in early panels. Each panel cumulatively adds the specified feature and retains prior features. No color anywhere on this sheet.
Panel1 one very light oval skull, completely empty.
Panel2 add horizontal eye construction guide and diagonal forehead guide.
Panel3 add projecting upper duck beak profile to right.
Panel4 close lower beak thickness and mouth seam.
Panel5 add ONE visible narrow tired eye above beak.
Panel6 add eyebrow and small iris looking right.
Panel7 add cheek and chin feather contour.
Panel8 add large swept backward crest silhouette with pointed feather groups.
Panel9 add inner divisions of crest.
Panel10 add tiny flat temple implant on side of head, NOT round lens.
Panel11 darken final outer contours and details with clean black ink, keep construction ghost faintly.
Panel12 erase construction guides, clean complete black line drawing of head profile, no neck, no color.
Important: actual progressive construction from oval to finished head; all twelve different stages; no full finished duck repeated.
```

### 2 — корпус

```text
Use case: scientific-educational. Generate a raster beginner drawing-tutorial sheet, EXACT 4 columns x 3 rows, 12 equal square panels, landscape 2048x1536. Thin light gray grid lines exactly divide equal panels. Warm plain off-white paper, no text or numbers. Twelve cumulative distinct pencil-to-ink construction stages reading left to right, then next row. No color.
IDENTITY: NEW cyber duck from supplied references: short magenta sleeveless high-collar vest over cream tank top, cyber neck, dark belt, cream short feather tail, long narrow magenta sash from belt. NO necklace, no large circular cyber-eye, no jacket sleeves. STRICT SIDE PROFILE FACING RIGHT throughout, same as lower-middle rig reference. This is anatomy for a side-scrolling metroidvania, never three-quarter.
THIS SHEET ONLY CROPPED NECK-TO-HIPS TORSO, in consistent position and scale. A faint small fragment of previously drawn jaw can appear at top for continuity. No completed character in early panels, no arms or legs here. Every panel retains previous marks and adds specified operation:
1 light ribcage side oval, spine guide and small hip oval, otherwise empty.
2 add narrow mechanical neck cylinder connecting jaw and chest.
3 divide neck into layered mechanical segments.
4 add neckline and side outline of tank top.
5 add bottom tank-top hem and broad folds.
6 add tall pointed vest collar behind and in front of neck.
7 add short sleeveless vest back silhouette and armhole.
8 add open vest front seam and angular lapel, cream shirt visible, keep strict side view.
9 add dark belt outline wrapping hip, side-on small buckle.
10 add long narrow ragged belt sash trailing down-left behind hip.
11 add short fluffy duck tail behind hip, NOT a long animal tail.
12 clean dark ink on all torso clothing, remove construction, keep lineart only. No shading/color.
Critical educational constraint: panel1 simple geometric construction, panel12 completed torso, with genuinely progressive cumulative stages between them.
```

### 3 — руки

```text
Use case: scientific-educational. Make a professional raster drawing tutorial sheet with EXACTLY 4 columns x 3 rows of equal square panels, 2048x1536 landscape. Thin gray equal grid, warm plain off-white paper, no labels/numbers/text. Twelve DISTINCT CUMULATIVE CONSTRUCTION stages reading left-to-right then next row. Pencil becomes clean black ink; NO COLOR.
IDENTITY LOCK: NEW cyber duck in refs, cream spiky hair, short high-collar magenta sleeveless vest, tank top, mechanical neck. Anatomical RIGHT ARM has living feathered upper arm and mechanical forearm/hand; anatomical LEFT ARM is living with black fingerless glove. No big cyber-eye. STRICT SIDE PROFILE FACING RIGHT as lower-middle rig reference. Body SIDE ON, not front or three-quarter.
Sheet is cropped shoulders to fingertips, both arms beside side-facing torso. Faint ghost side torso/vest is only CONTEXT and remains unchanged. Hands extend down-right, near RIGHT MECHANICAL ARM clearly in front and far LEFT LIVE ARM partly behind with its hand offset to be readable. No legs/head necessary. No full finished arm in early panels.
Stage1 only two faint arm axes from shoulders through elbow circles to simple wrist markers, ghost torso.
2 add near living upper-arm contours between shoulder and elbow, short feather edge.
3 add near elbow mechanical connector ring.
4 add angular large mechanical forearm shell tapering toward wrist.
5 add mechanical armor seams and narrow blank cyan-light recess (no color).
6 add mechanical wrist joint and palm block.
7 add segmented mechanical fingers to near hand, several overlapping fingers, NOT human hand.
8 add far living upper arm and forearm contour, partly behind torso, ending with empty wrist.
9 add far living palm shape and thumb.
10 add far black fingerless glove contour and exposed natural fingers; no metal on that arm.
11 add small feather edges, mechanical screws and glove cuff.
12 erase guides and clean linework of both arms and vest context.
Maintain exactly same side view, pose, scale across all12. Critical: early stage1 is only sticks, stage12 two complete DIFFERENT arms, NOT12 finished copies.
```

### 4 — ноги, первый вариант

```text
Use case: scientific-educational. Create raster beginner character drawing tutorial contact sheet: EXACT 4 columns by 3 rows, twelve equal square panels, landscape 2048x1536, thin neutral-gray grid at precise equal divisions, off-white paper background. No labels, words or numbers. Twelve DISTINCT CUMULATIVE pencil-to-black-ink construction stages, left to right then next row. No color.
IDENTITY: NEW CYBER DUCK from references. Anatomical RIGHT LEG wears LONG dark baggy trouser leg all the way to ankle. Anatomical LEFT LEG has SHORT RAGGED trouser opening ABOVE EXPOSED MECHANICAL KNEE, full metal shin with cyan-light recess, sneakers on BOTH FEET. NOT two trouser legs; NOT two prosthetics. Same cream/black/magenta/cyan high-top sneakers from reference. STRICT RIGHT-FACING SIDE VIEW like lower-middle rig reference, side-scrolling metroidvania. Sneakers side-on, toes point right, heels left. No front or three-quarter shoes.
Crop only belt/hips to soles. Same two legs slightly staggered front/back and same floor baseline across all 12 panels; near anatomical right long trouser leg rearward/left, far anatomical left mechanical lower leg forward/right so both readable. Previously completed belt faint ghost context only.
1 only faint thigh/shin stick axes with knee/ankle circles and floor line. No legs drawn.
2 add long trouser RIGHT thigh side contours from hip to knee, other leg still sticks.
3 complete RIGHT trouser shin to ankle with baggy folds.
4 add LEFT thigh and short ragged trouser opening above left knee; lower leg still sticks.
5 add large circular exposed LEFT mechanical knee joint below ragged short hem.
6 add LEFT mechanical shin struts from knee to ankle.
7 add angled shin armor plates and narrow blank light recess.
8 add ankle coupling and simple side-view sneaker volume on LEFT metal leg, toe right.
9 add second side-view sneaker volume under RIGHT trouser leg, same size.
10 add both sneakers thick soles, laces and panel outlines.
11 refine trouser folds, ragged hem and metal fasteners.
12 clean final black linework of both DIFFERENT legs and shoes, erase construction. No color.
Early stage1 simple stick skeleton, stage12 finished legs. Keep all stages anatomically consistent, every stage visibly builds on previous one. No upper body/head or weapons.
```

### 4a — коррекция профиля ног

```text
EDIT THE FIRST IMAGE, a 12-stage drawing tutorial sheet. Critical targeted correction: ALL TWELVE PANELS MUST SHOW A PURE RIGHT-FACING ORTHOGRAPHIC SIDE ELEVATION OF THE LEGS, never front, never three-quarter. Current sheet has front-facing pelvis, wide stance and frontal buckle. Correct those everywhere. Second image is identity/model reference: match its LOWER MIDDLE right-facing SIDE view.
Keep exactly 4 equal columns x3 equal rows, 12 progressive stages, off-white paper, no text, black pencil/ink only. Same progressive construction order; do not repeat final complete legs in early panels.
PURE PROFILE GEOMETRY: pelvis is narrow in horizontal projection, the two hip joints OVERLAP almost at the same horizontal coordinate, NOT separated left/right. Knees and ankles stagger only slightly along direction of travel. Trouser crotch NOT VISIBLE FROM FRONT. NO FRONT-FACING BELT BUCKLE: only side belt/hip visible. Both sneaker silhouettes exactly in side view, showing long outer sidewall, heel left and toe right; NO FRONT TOE CAPS facing viewer. The two legs overlap substantially in depth, NOT spread sideways. Use a relaxed neutral side stance, not running.
IDENTITY: anatomical right leg is nearer viewer and wears FULL-LENGTH baggy trousers; anatomical left leg is farther and has SHORT ragged trouser hem above exposed mechanical knee and full metal shin. Exposed metal knee and shin remain legible beside near trouser leg. Both wear same high-top sneakers.
Cumulative stages 1 stick construction with overlapping hip markers; 2 near right long trouser thigh; 3 near trouser lower leg; 4 far short ragged left thigh; 5 far metal knee;6 far metal shin struts;7 armor panels and recess;8 far sneaker;9 near sneaker;10 shoe details/laces;11 folds/fasteners;12 cleaned dark ink.
Reference identity maintained; all garments unchanged. Transform ONLY camera/pose to exact side profile and preserve all actual incremental drawing stages.
```

### 5 — полный рисунок и цвет

```text
Use case: scientific-educational. Create a raster beginner COLORING TUTORIAL SHEET, EXACTLY FOUR columns by THREE rows, twelve equal square panels, landscape 2048x1536, thin gray equal grid, plain warm off-white background, NO words/numbers/text. Every panel shows THE SAME FULL BODY DUCK at identical size, same pose and fixed foot baseline. Each panel is a distinct cumulative coloring stage; early panels MUST remain largely white/uncolored. Do NOT give 12 finished colored copies.
IDENTITY LOCK: attached NEW cyber duck, cream large swept punk crest with black/magenta tips, small subtle flat temple implant (NOT a large round cyber-eye), orange duck bill, segmented mechanical neck, short HIGH COLLAR MAGENTA SLEEVELESS VEST over cream tank, charcoal asymmetrical trousers, narrow magenta sash trailing down-left behind belt, small cream feather tail. Anatomical RIGHT arm near viewer has living feathered shoulder/upper arm and METAL forearm/fingers. Anatomical LEFT arm farther is living with black fingerless glove. Anatomical RIGHT leg near viewer wears LONG TROUSER LEG. Anatomical LEFT leg farther has short RAGGED hem above exposed mechanical knee + full mechanical shin. Both reference high-top cream/black/cyan/magenta sneakers.
MANDATORY VIEW: EXACT PURE RIGHT-FACING SIDE PROFILE / orthographic side elevation as LOWER MIDDLE pose of rig reference. One visible eye; beak projects RIGHT. Head, chest, pelvis, shoes all EXACTLY SIDE ON, never 3/4 or frontal. Hip joints overlap in depth, torso narrow side silhouette, belt buckle not frontal. Feet stagger just enough to see far mechanical leg, both sneaker toes point right. Relaxed standing pose; arms slightly separated to show different hands, no weapons. Head body proportions and outfit faithful to rig, expressive ink/cel-shaded texture.
12 exact cumulative panels:
1 COMPLETE CLEAN BLACK LINEART ONLY, NO COLOR anywhere.
2 add ONLY flat cream to hair, cheek, living shoulder/arms and short feather tail; all clothes and beak white.
3 add orange bill, natural eye colors and tiny temple implant; rest remains as previous.
4 add warm ivory tank top and cream shoe panels; vest, trousers, metal remain white.
5 add deep MAGENTA vest and sash; trousers/metal still white.
6 add charcoal trousers, black fingerless glove, belt and black shoe sections; metal still white.
7 add dark steel base fills to neck, RIGHT forearm/hand and LEFT lower leg, lighter armor panels.
8 add black and narrow magenta crest tips plus small blue/magenta sneaker inserts; flat color only.
9 add large cel shadows on feathers, cloth and face, one consistent upper-left light source.
10 add silver metal edge highlights and narrow CYAN indicator recesses on neck, near forearm and far shin.
11 add restrained ink texture, frayed hems and small scratches, no dirty noise.
12 final refined colors and clean edges, subtle foot contact shadow only; beautiful finished new duck strictly SIDE PROFILE.
No floor splatter, no background scene, no old character, no attack.
```

### 5a — контур дальней руки и чистый первый кадр

```text
Make ONLY these very small precise corrections to this existing 4x3 coloring tutorial sheet. Preserve all twelve cells, grid, drawing positions, pure right-facing side profile, hairstyle, outfit, anatomy, and the progressive coloring stages exactly.
1) Top-left cell (stage1) MUST be completely uncolored black lineart. Remove cream color fill from its tail feathers only, restoring same white paper inside tail. All other stage1 details stay as is.
2) In the first five cells (top row four cells, second row first cell), add the thin black outline of the far living LEFT arm and natural fingers in exactly the same location as that arm in stage6 (second row second cell): emerging behind side torso and ending slightly forward/right of belt. Keep these newly outlined arm/glove areas UNCOLORED white in stages1 through5 (their cream/black colors start at stage6 as already shown). Keep near RIGHT mechanical arm unchanged. The far arm must not suddenly appear for first time in stage6.
Do not change cells6 through12 at all. Do not repaint or redraw completed cells. This is a tutorial progression consistency correction only. No text, no numbers, no extra panels.
```

### 5b — заливка хвоста в пятой панели

```text
Precise local correction only. This is a 4x3 coloring tutorial grid. Change ONLY the short feathered duck tail in row2,column1 (the fifth panel, leftmost panel of middle row). Its interior is currently white. Fill that short feather tail with the same flat light cream color used on the tail in row1,column2. Preserve its black contour. The tail is the short pointed feather tuft sticking out LEFT behind the waist; do NOT modify the long magenta cloth sash below it.
Every other pixel area and all other eleven panels should remain unchanged. Keep progressive stages, all linework, poses, no new details. No text.
```
