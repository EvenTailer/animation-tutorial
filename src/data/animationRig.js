import { animationParts, PARTS_SOURCE, PARTS_SIZE } from "./animationParts.js";
export { animationParts, PARTS_SOURCE, PARTS_SIZE };
export const RIG_CANVAS = { width: 512, height: 600, baseline: 560 };
const rad = (n) => (n * Math.PI) / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const along = (p, angle, length) =>
  add(p, [Math.sin(rad(angle)) * length, Math.cos(rad(angle)) * length]);
export function solveSideLeg(hip, ankle, upper = 98, lower = 90) {
  const dx = ankle[0] - hip[0],
    dy = ankle[1] - hip[1],
    distance = Math.hypot(dx, dy);
  if (distance > upper + lower || distance < Math.abs(upper - lower))
    throw new RangeError("Unreachable leg target");
  const angle =
    Math.atan2(dy, dx) -
    Math.acos(
      Math.max(
        -1,
        Math.min(
          1,
          (upper * upper + distance * distance - lower * lower) /
            (2 * upper * distance),
        ),
      ),
    );
  return {
    hip,
    knee: add(hip, [Math.cos(angle) * upper, Math.sin(angle) * upper]),
    ankle,
  };
}
function groundedAnkleY(id, angle) {
  const part = animationParts[id],
    a = rad(angle);
  const lowest = Math.max(
    ...part.hull.map(
      ([x, y]) =>
        part.scale *
        ((x - part.anchor[0]) * Math.sin(a) +
          (y - part.anchor[1]) * Math.cos(a)),
    ),
  );
  return RIG_CANVAS.baseline - lowest;
}
export function getRigPose(type = "idle", frame = 0) {
  let rootY = 323,
    lean = 0,
    nearArm = 5,
    farArm = 8,
    nearBend = 12,
    farBend = 10;
  let ankles = [
      [250, 518],
      [276, 518],
    ],
    shoeAngles = [0, 0],
    planted = [true, true];
  if (type === "run") {
    const f = ((frame % 6) + 6) % 6;
    rootY = [335, 338, 315, 335, 338, 315][f];
    lean = 14;
    nearArm = [-50, -20, 40, 45, 15, -45][f];
    farArm = [40, 20, -45, -50, -15, 40][f];
    nearBend = farBend = 90;
    ankles = [
      [
        [330, 518],
        [190, 486],
      ],
      [
        [225, 518],
        [290, 462],
      ],
      [
        [182, 460],
        [335, 475],
      ],
      [
        [190, 486],
        [330, 518],
      ],
      [
        [290, 462],
        [225, 518],
      ],
      [
        [335, 475],
        [182, 460],
      ],
    ][f];
    shoeAngles = [
      [-16, 25],
      [24, -8],
      [35, -10],
      [25, -16],
      [-8, 24],
      [-10, 35],
    ][f];
    planted = [
      [true, false],
      [true, false],
      [false, false],
      [false, true],
      [false, true],
      [false, false],
    ][f];
  } else if (type === "jump") {
    const f = ((frame % 6) + 6) % 6;
    rootY = [320, 370, 302, 235, 380, 325][f];
    lean = [0, 15, 4, 0, 12, 2][f];
    nearArm = [5, -65, 50, 60, 58, 10][f];
    farArm = [8, -55, 65, 75, 40, 12][f];
    nearBend = [12, 25, 90, 60, 60, 15][f];
    farBend = [10, 20, 70, 85, 55, 12][f];
    const y = [518, 518, 500, 358, 518, 518][f];
    ankles = [
      [250, y],
      [276, y],
    ];
    shoeAngles = [
      [0, 0],
      [0, 0],
      [22, 18],
      [15, -12],
      [0, 0],
      [0, 0],
    ][f];
    planted = [![2, 3].includes(f), ![2, 3].includes(f)];
  } else {
    rootY += [0, -1, -3, -1][((frame % 4) + 4) % 4];
  }
  ankles = ankles.map((ankle, i) => [
    ankle[0],
    planted[i]
      ? groundedAnkleY(i === 0 ? "rightShoe" : "leftShoe", shoeAngles[i])
      : ankle[1],
  ]);
  if (type === "jump" && frame === 2)
    ankles = ankles.map((ankle, i) => [
      ankle[0],
      groundedAnkleY(i === 0 ? "rightShoe" : "leftShoe", shoeAngles[i]) - 18,
    ]);
  if (type === "jump" && frame === 3)
    ankles = ankles.map((ankle, i) => [
      ankle[0],
      groundedAnkleY(i === 0 ? "rightShoe" : "leftShoe", shoeAngles[i]) - 160,
    ]);
  const root = [256, rootY],
    torso = animationParts.torso,
    torsoScale = 0.36;
  function onBody(source) {
    const dx = (source[0] - torso.anchor[0]) * torsoScale,
      dy = (source[1] - torso.anchor[1]) * torsoScale,
      a = rad(lean);
    return add(root, [
      dx * Math.cos(a) - dy * Math.sin(a),
      dx * Math.sin(a) + dy * Math.cos(a),
    ]);
  }
  const nearShoulder = onBody(torso.shoulderNear),
    farShoulder = onBody(torso.shoulderFar),
    nearElbow = along(nearShoulder, nearArm, 56),
    farElbow = along(farShoulder, farArm, 54),
    nearWrist = along(nearElbow, nearArm + nearBend, 54),
    farWrist = along(farElbow, farArm + farBend, 51);
  const nearHip = add(root, [0, 13]),
    farHip = add(root, [14, 11]);
  return {
    type,
    frame,
    root,
    lean,
    torsoScale,
    neck: onBody(torso.neck),
    nearShoulder,
    farShoulder,
    nearElbow,
    farElbow,
    nearWrist,
    farWrist,
    rightLeg: solveSideLeg(nearHip, ankles[0]),
    leftLeg: solveSideLeg(farHip, ankles[1]),
    shoeAngles,
    planted,
    limbIdentity: {
      nearArm: "rightForearm",
      farArm: "leftForearm",
      nearLeg: "rightShin",
      farLeg: "leftShin",
    },
  };
}
function affineBone(part, from, to) {
  const [sx, sy] = part.parent,
    [ex, ey] = part.child,
    sa = Math.atan2(ey - sy, ex - sx),
    ta = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const scale =
      Math.hypot(to[0] - from[0], to[1] - from[1]) /
      Math.hypot(ex - sx, ey - sy),
    c = Math.cos(ta - sa) * scale,
    s = Math.sin(ta - sa) * scale;
  return [c, s, -s, c, from[0] - c * sx + s * sy, from[1] - s * sx - c * sy];
}
function atAnchor(part, target, scale, angle = 0) {
  const c = Math.cos(rad(angle)) * scale,
    s = Math.sin(rad(angle)) * scale,
    [x, y] = part.anchor;
  return [c, s, -s, c, target[0] - c * x + s * y, target[1] - s * x - c * y];
}
export function getRigDrawPlan(type, frame) {
  const p = getRigPose(type, frame),
    result = [];
  function bone(id, from, to, side) {
    result.push({ id, side, matrix: affineBone(animationParts[id], from, to) });
  }
  function shoe(id, ankle, side, angle) {
    const part = animationParts[id];
    result.push({ id, side, matrix: atAnchor(part, ankle, part.scale, angle) });
  }
  // Stable depth and anatomical IDs; no frame selects a substitute limb.
  bone("leftUpperArm", p.farShoulder, p.farElbow, "far");
  bone("leftForearm", p.farElbow, p.farWrist, "far");
  bone("leftThigh", p.leftLeg.hip, p.leftLeg.knee, "far");
  bone("leftShin", p.leftLeg.knee, p.leftLeg.ankle, "far");
  shoe("leftShoe", p.leftLeg.ankle, "far", p.shoeAngles[1]);
  bone("rightThigh", p.rightLeg.hip, p.rightLeg.knee, "near");
  bone("rightShin", p.rightLeg.knee, p.rightLeg.ankle, "near");
  shoe("rightShoe", p.rightLeg.ankle, "near", p.shoeAngles[0]);
  result.push({
    id: "torso",
    side: "center",
    matrix: atAnchor(animationParts.torso, p.root, p.torsoScale, p.lean),
  });
  bone("rightUpperArm", p.nearShoulder, p.nearElbow, "near");
  bone("rightForearm", p.nearElbow, p.nearWrist, "near");
  result.push({
    id: "head",
    side: "center",
    matrix: atAnchor(animationParts.head, p.neck, 0.38, 0),
  });
  return result;
}
