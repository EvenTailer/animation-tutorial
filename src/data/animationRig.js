import { animationParts, PARTS_SOURCE, PARTS_SIZE } from "./animationParts.js";
import { getAnimationPart } from "./animationViews.js";
export { animationParts, PARTS_SOURCE, PARTS_SIZE };
export const RIG_CANVAS = { width: 512, height: 600, baseline: 560 };
const rad = (n) => (n * Math.PI) / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const along = (p, angle, length) =>
  add(p, [Math.sin(rad(angle)) * length, Math.cos(rad(angle)) * length]);
const wrap = (n, count) => ((n % count) + count) % count;
const mix = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const bezier = (a, b, c, d, t) =>
  (1 - t) ** 3 * a +
  3 * (1 - t) ** 2 * t * b +
  3 * (1 - t) * t * t * c +
  t ** 3 * d;
function sample(values, frame, slopes = null) {
  const p = wrap(frame, values.length),
    i = Math.floor(p),
    t = p - i,
    next = (i + 1) % values.length;
  if (!slopes) return mix(values[i], values[next], ease(t));
  return (
    (2 * t ** 3 - 3 * t * t + 1) * values[i] +
    (t ** 3 - 2 * t * t + t) * slopes[i] +
    (-2 * t ** 3 + 3 * t * t) * values[next] +
    (t ** 3 - t * t) * slopes[next]
  );
}
export function solveSideLeg(hip, ankle, upper = 98, lower = 90) {
  const dx = ankle[0] - hip[0],
    dy = ankle[1] - hip[1],
    distance = Math.hypot(dx, dy);
  if (distance > upper + lower + 1e-7 || distance < Math.abs(upper - lower))
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
// A full stride has one short support and one long recovery for each foot.
// Support x is linear: matching world translation can lock it to the ground.
// Recovery is a cubic path with the SAME x velocity at both joins, not a
// smoothstep between unrelated key poses. Lift and roll have zero end slope.
function runningFoot(phase, id) {
  const p = wrap(phase, 1),
    support = 0.29,
    front = 316,
    back = 218;
  let x, clearance, angle;
  if (p <= support) {
    const t = p / support;
    x = mix(front, back, t);
    clearance = 0;
    angle =
      t < 0.38
        ? mix(-12, 0, ease(t / 0.38))
        : mix(0, 26, ease((t - 0.38) / 0.62));
  } else {
    const t = (p - support) / (1 - support),
      tangent = (((back - front) / support) * (1 - support)) / 3;
    x = bezier(back, back + tangent, front - tangent, front, t);
    clearance = 78 * Math.sin(Math.PI * t) ** 1.5;
    angle =
      t < 0.34
        ? mix(26, 44, ease(t / 0.34))
        : mix(44, -12, ease((t - 0.34) / 0.66));
  }
  return {
    ankle: [x, groundedAnkleY(id, angle) - clearance],
    angle,
    planted: p <= support,
  };
}
export const RUN_SUPPORT_FRACTION = 0.29;
export const RUN_GROUND_SPEED_PER_CYCLE = 98 / RUN_SUPPORT_FRACTION;
// Fractional frame numbers are intentional. Integer values remain the sixteen
// teaching keys; continuous playback evaluates the same articulated rig.
export function getRigPose(type = "idle", frame = 0) {
  frame = Number.isFinite(frame) ? frame : 0;
  let rootY = 326,
    lean = 0,
    nearArm = 5,
    farArm = 8,
    nearBend = 12,
    farBend = 10;
  let ankles = [
      [248, 518],
      [275, 518],
    ],
    shoeAngles = [0, 0],
    planted = [true, true];
  if (type === "run") {
    const phase = wrap(frame, 6) / 6,
      wave = Math.sin(phase * Math.PI * 4);
    rootY = 338 + 8 * wave;
    lean = 14;
    const armWave = Math.cos(phase * Math.PI * 2 - 0.12);
    nearArm = -32 * armWave;
    farArm = 32 * armWave;
    nearBend = 76 + 9 * Math.sin(phase * Math.PI * 2 - 0.5);
    farBend = 76 - 9 * Math.sin(phase * Math.PI * 2 - 0.5);
    const feet = [
      runningFoot(phase, "rightShoe"),
      runningFoot(phase + 0.5, "leftShoe"),
    ];
    ankles = feet.map((f) => f.ankle);
    shoeAngles = feet.map((f) => f.angle);
    planted = feet.map((f) => f.planted);
  } else if (type === "jump") {
    const f = wrap(frame, 6);
    rootY = sample([326, 374, 303, 246, 378, 326], f, [0, 0, -105, 0, 0, 0]);
    lean = sample([0, 11, 5, 0, 10, 0], f);
    nearArm = sample([5, -44, 37, 43, 43, 5], f);
    farArm = sample([8, -36, 44, 48, 31, 8], f);
    nearBend = sample([12, 25, 71, 55, 55, 12], f);
    farBend = sample([10, 20, 65, 60, 50, 10], f);
    shoeAngles = [
      sample([0, 0, 18, 12, 0, 0], f),
      sample([0, 0, 15, -8, 0, 0], f),
    ];
    const lift = sample([0, 0, 18, 148, 0, 0], f);
    ankles = [
      [248, groundedAnkleY("rightShoe", shoeAngles[0]) - lift],
      [268, groundedAnkleY("leftShoe", shoeAngles[1]) - lift],
    ];
    planted = [lift < 1e-8, lift < 1e-8];
  } else {
    const phase = (wrap(frame, 4) / 4) * Math.PI * 2;
    // Only the chest/shoulders breathe. Feet and hip axis never sway sideways.
    rootY = 330 - 1.5 * (1 - Math.cos(phase));
    nearArm = 4 + 1.5 * Math.sin(phase - 0.3);
    farArm = 7 + 1.2 * Math.sin(phase - 0.45);
    ankles = [224, 296].map((x, i) => [
      x,
      groundedAnkleY(i ? "leftShoe" : "rightShoe", 0),
    ]);
  }
  const root = [256, rootY],
    torso = getAnimationPart(type, "torso"),
    torsoScale = torso.scale;
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
    farShoulder = onBody(torso.shoulderFar);
  const nearElbow = along(nearShoulder, nearArm, 56),
    farElbow = along(farShoulder, farArm, 54);
  const nearWrist = along(nearElbow, nearArm + nearBend, 54),
    farWrist = along(farElbow, farArm + farBend, 51);
  const nearHip = add(root, [type === "idle" ? -5 : 0, 13]),
    farHip = add(root, [type === "idle" ? 13 : 4, 13]);
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
export const getRigPoseContinuous = getRigPose;
function affineBone(part, from, to) {
  const [sx, sy] = part.parent,
    [ex, ey] = part.child;
  const sa = Math.atan2(ey - sy, ex - sx),
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
  bone("leftUpperArm", p.farShoulder, p.farElbow, "far");
  bone("leftForearm", p.farElbow, p.farWrist, "far");
  bone("leftThigh", p.leftLeg.hip, p.leftLeg.knee, "far");
  bone("leftShin", p.leftLeg.knee, p.leftLeg.ankle, "far");
  shoe("leftShoe", p.leftLeg.ankle, "far", p.shoeAngles[1]);
  bone("rightThigh", p.rightLeg.hip, p.rightLeg.knee, "near");
  bone("rightShin", p.rightLeg.knee, p.rightLeg.ankle, "near");
  shoe("rightShoe", p.rightLeg.ankle, "near", p.shoeAngles[0]);
  // The collar occludes the neck root, as it would on a drawn character.
  // Putting the complete cyberneck above the vest makes it look doubled.
  result.push({
    id: "head",
    side: "center",
    matrix: atAnchor(
      getAnimationPart(type, "head"),
      [p.neck[0], p.neck[1] + 8],
      getAnimationPart(type, "head").scale,
      0,
    ),
  });
  result.push({
    id: "torso",
    side: "center",
    matrix: atAnchor(
      getAnimationPart(type, "torso"),
      p.root,
      p.torsoScale,
      p.lean,
    ),
  });
  bone("rightUpperArm", p.nearShoulder, p.nearElbow, "near");
  bone("rightForearm", p.nearElbow, p.nearWrist, "near");
  return result;
}
export const getRigDrawPlanContinuous = getRigDrawPlan;
