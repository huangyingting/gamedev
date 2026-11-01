import { clamp, easeOutCubic, findPath, lerp, quaternionFromEuler, rayRect, rotateVector, seededRandom, slerp, valueNoise, type Vec2 } from "./math";
import type { Category } from "./concepts";
import type { Locale } from "./i18n";
import { translateDemoText } from "./demo-i18n";

const W = 420;
const H = 250;
const cyan = "#22d3ee";
const pink = "#f472b6";
const green = "#a3e635";
const purple = "#a78bfa";
const yellow = "#facc15";
const muted = "#83859e";
const lineColor = "#242635";
const colors: Record<Category, string> = { "3d": cyan, feel: pink, systems: green, perf: purple };

interface Agent extends Vec2 { vx: number; vy: number }

export interface DemoState {
  time: number;
  seed: number;
  pointer: Vec2;
  pointing: boolean;
  variant: number;
  frame: number;
  accumulator: number;
  variableX: number;
  constantX: number;
  springX: number;
  springV: number;
  fixedX: number;
  fixedV: number;
  physicsAccumulator: number;
  agents: Agent[];
  loaded: Set<number>;
}

export function createDemoState(seed = 42): DemoState {
  const random = seededRandom(seed);
  return {
    time: 0, seed, pointer: { x: 300, y: 100 }, pointing: false, variant: 0, frame: 0,
    accumulator: 0, variableX: 0, constantX: 0, springX: 60, springV: 0, fixedX: 60, fixedV: 0,
    physicsAccumulator: 0,
    agents: Array.from({ length: 16 }, () => ({ x: 40 + random() * 300, y: 60 + random() * 120, vx: 0, vy: 0 })),
    loaded: new Set(),
  };
}

export function renderDemo(ctx: CanvasRenderingContext2D, slug: string, category: Category, state: DemoState, dt: number, locale: Locale = "en", title = slug): void {
  const t = state.time;
  const accent = colors[category];
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0a0b12";
  ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const text = (message: string, x: number, y: number, color = muted, size = 10) => {
    ctx.fillStyle = color;
    ctx.font = locale === "zh" ? `${Math.max(size, 11)}px "Noto Sans CJK SC", "Microsoft YaHei", sans-serif` : `${size}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    ctx.fillText(locale === "zh" ? translateDemoText(message) : message, x, y, W - x - 12);
  };
  const line = (x1: number, y1: number, x2: number, y2: number, color = lineColor, width = 1) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.lineWidth = 1;
  };
  const circle = (x: number, y: number, r: number, color = accent, fill = true) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.stroke(); }
  };
  const rect = (x: number, y: number, w: number, h: number, color = accent, fill = true) => {
    if (fill) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); } else { ctx.strokeStyle = color; ctx.strokeRect(x, y, w, h); }
  };
  const polygon = (points: Vec2[], fill: string, stroke = fill) => {
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.stroke();
  };
  const arrow = (x: number, y: number, dx: number, dy: number, color = accent) => {
    line(x, y, x + dx, y + dy, color, 1.5);
    const angle = Math.atan2(dy, dx);
    line(x + dx, y + dy, x + dx - 5 * Math.cos(angle - 0.5), y + dy - 5 * Math.sin(angle - 0.5), color);
    line(x + dx, y + dy, x + dx - 5 * Math.cos(angle + 0.5), y + dy - 5 * Math.sin(angle + 0.5), color);
  };
  const grid = (spacing = 30) => {
    for (let x = 0; x < W; x += spacing) line(x, 35, x, H - 25, "#171925");
    for (let y = 35; y < H - 25; y += spacing) line(0, y, W, y, "#171925");
  };
  const cube = (x: number, y: number, size: number, color = accent) => {
    const d = size * 0.45;
    polygon([{ x, y: y - d }, { x: x + size, y }, { x, y: y + d }, { x: x - size, y }], `${color}40`, color);
    polygon([{ x: x - size, y }, { x, y: y + d }, { x, y: y + size }, { x: x - size, y: y + size - d }], `${color}18`, color);
    polygon([{ x, y: y + d }, { x: x + size, y }, { x: x + size, y: y + size - d }, { x, y: y + size }], `${color}30`, color);
  };
  const character = (x: number, y: number, color = accent, duck = false) => {
    const height = duck ? 20 : 34;
    rect(x - 8, y - height, 16, height, color);
    rect(x + 2, y - height + 6, 3, 3, "#0a0b12");
  };
  const twoLanes = (top: string, bottom: string) => {
    text(top, 18, 45, muted); text(bottom, 18, 139, accent);
    line(18, 110, 400, 110); line(18, 205, 400, 205);
  };
  const target = state.pointing ? state.pointer : { x: 220 + Math.sin(t * 0.5) * 100, y: 120 + Math.cos(t * 0.7) * 40 };
  text(locale === "zh" ? `实时 / ${title}` : "LIVE / " + slug.toUpperCase().replaceAll("-", " "), 15, 20, accent, 9);

  switch (slug) {
    case "raycasting": {
      grid();
      const origin = { x: 55, y: 155 };
      const aim = state.pointing ? state.pointer : { x: 340, y: 120 + Math.sin(t * 0.7) * 90 };
      const length = Math.hypot(aim.x - origin.x, aim.y - origin.y) || 1;
      const direction = { x: (aim.x - origin.x) / length, y: (aim.y - origin.y) / length };
      const boxes = [{ x: 155, y: 72, w: 50, h: 80 }, { x: 275, y: 120, w: 70, h: 65 }, { x: 280, y: 45, w: 35, h: 35 }];
      let distance = 360;
      let normal = { x: 0, y: 0 };
      for (const box of boxes) {
        const hit = rayRect(origin, direction, box);
        rect(box.x, box.y, box.w, box.h, "#242d3b"); rect(box.x, box.y, box.w, box.h, "#4f617a", false);
        if (hit && hit.distance < distance) { distance = hit.distance; normal = hit.normal; }
      }
      const x = origin.x + direction.x * distance;
      const y = origin.y + direction.y * distance;
      ctx.setLineDash([4, 5]); line(x, y, origin.x + direction.x * 360, origin.y + direction.y * 360, "#3d4256"); ctx.setLineDash([]);
      line(origin.x, origin.y, x, y, cyan, 2); circle(origin.x, origin.y, 6, "#e9ebf4");
      if (distance < 360) { circle(x, y, 5, pink); arrow(x, y, normal.x * 27, normal.y * 27, yellow); }
      text(`distance ${distance.toFixed(1)} / point to aim`, 18, 234);
      break;
    }
    case "normals": {
      grid();
      const light = state.pointing ? state.pointer : { x: 210 + Math.cos(t * 0.6) * 115, y: 105 + Math.sin(t * 0.6) * 65 };
      const center = { x: 205, y: 132 };
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + t * 0.1;
        const p1 = { x: center.x + Math.cos(a) * 63, y: center.y + Math.sin(a) * 63 };
        const p2 = { x: center.x + Math.cos(a + Math.PI / 3) * 63, y: center.y + Math.sin(a + Math.PI / 3) * 63 };
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const nx = Math.cos(a + Math.PI / 6), ny = Math.sin(a + Math.PI / 6);
        const len = Math.hypot(light.x - mx, light.y - my) || 1;
        const brightness = Math.max(0, nx * (light.x - mx) / len + ny * (light.y - my) / len);
        polygon([center, p1, p2], `rgb(${20 + brightness * 20},${50 + brightness * 140},${65 + brightness * 170})`, "#376578");
        arrow(mx, my, nx * 22, ny * 22, cyan);
      }
      circle(light.x, light.y, 7, yellow); circle(light.x, light.y, 12, "#facc1540", false);
      text("N · L → brightness / move the light", 18, 234);
      break;
    }
    case "level-of-detail": {
      const distance = state.pointing ? clamp(state.pointer.x / W) : (Math.sin(t * 0.5) + 1) / 2;
      const level = distance < 0.35 ? 0 : distance < 0.7 ? 1 : 2;
      const segments = [20, 10, 5][level];
      const radius = 70 - distance * 32;
      const project = (lat: number, lon: number) => {
        const x = Math.sin(lat) * Math.cos(lon + t * 0.3);
        const z = Math.sin(lat) * Math.sin(lon + t * 0.3);
        return { x: 210 + x * radius, y: 126 + (Math.cos(lat) + z * 0.3) * radius };
      };
      for (let lat = 0; lat < segments / 2; lat++) for (let lon = 0; lon < segments; lon++) {
        const a = project(lat * Math.PI / (segments / 2), lon * Math.PI * 2 / segments);
        const b = project((lat + 1) * Math.PI / (segments / 2), lon * Math.PI * 2 / segments);
        const c = project((lat + 1) * Math.PI / (segments / 2), (lon + 1) * Math.PI * 2 / segments);
        line(a.x, a.y, b.x, b.y, "#1f697c"); line(a.x, a.y, c.x, c.y, cyan);
      }
      text(`LOD ${level} / ${segments * (segments / 2) * 2} triangles`, 18, 52, cyan);
      rect(25, 212, 370, 3, lineColor); rect(25, 212, distance * 370, 3, cyan);
      text("NEAR", 25, 234); text("FAR", 367, 234);
      break;
    }
    case "frustum-culling": {
      grid();
      const angle = state.pointing ? Math.atan2(state.pointer.y - 130, state.pointer.x - 85) : Math.sin(t * 0.5) * 0.7;
      const origin = { x: 85, y: 130 };
      const edge = (a: number) => ({ x: origin.x + Math.cos(a) * 300, y: origin.y + Math.sin(a) * 300 });
      polygon([origin, edge(angle - 0.5), edge(angle + 0.5)], "#22d3ee0c", "#22d3ee60");
      let visible = 0;
      for (let i = 0; i < 24; i++) {
        const x = 135 + (i % 6) * 45, y = 50 + Math.floor(i / 6) * 47;
        const a = Math.atan2(y - origin.y, x - origin.x);
        const delta = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
        const inside = Math.abs(delta) < 0.56;
        if (inside) visible++;
        cube(x, y, 10, inside ? cyan : "#303244");
      }
      circle(origin.x, origin.y, 6); arrow(origin.x, origin.y, Math.cos(angle) * 30, Math.sin(angle) * 30);
      text(`${visible} visible / ${24 - visible} rejected`, 18, 234);
      break;
    }
    case "fragment-shader": {
      const pixelSize = 6;
      const frequency = state.pointing ? 1 + state.pointer.x / 70 : 4;
      for (let y = 42; y < 218; y += pixelSize) for (let x = 25; x < 395; x += pixelSize) {
        const v = (Math.sin(x / 65 * frequency + t * 1.3 + Math.sin(y / 38 + t)) + 1) / 2;
        rect(x, y, pixelSize, pixelSize, `rgb(${Math.round(lerp(25, 160, v))},${Math.round(lerp(160, 70, v))},${Math.round(lerp(200, 245, v))})`);
      }
      text(`UV + time / frequency ${frequency.toFixed(1)}`, 18, 234);
      break;
    }
    case "billboarding": {
      const angle = state.pointing ? state.pointer.x / W * Math.PI * 2 : t * 0.8;
      [110, 310].forEach((x, i) => {
        cube(x, 145, 28, "#5f718c");
        const width = i === 0 ? Math.abs(Math.cos(angle)) * 80 : 80;
        rect(x - width / 2, 75, width, 10, "#273327");
        rect(x - width / 2, 75, width * 0.75, 10, green);
        circle(x + Math.cos(angle) * 48, 198 + Math.sin(angle) * 8, 3, muted);
      });
      text("FIXED IN WORLD", 65, 48); text("CAMERA FACING", 260, 48, cyan);
      text("orbit the view / labels remain readable", 18, 234);
      break;
    }
    case "quaternions": {
      const u = (Math.sin(t * 0.55) + 1) / 2;
      const end = quaternionFromEuler(2.7, 2.4, 2.8);
      const q = slerp([0, 0, 0, 1], end, u);
      const euler = quaternionFromEuler(2.7 * u, 2.4 * u, 2.8 * u);
      const vertices = [{ x: 53, y: 0, z: 0 }, { x: -26, y: -21, z: 0 }, { x: -26, y: 21, z: 0 }, { x: -17, y: 0, z: 22 }];
      [110, 310].forEach((x, i) => {
        circle(x, 130, 65, lineColor, false);
        const points = vertices.map(vertex => {
          const p = rotateVector(vertex, i ? q : euler);
          return { x: x + p.x + p.z * 0.25, y: 130 + p.y - p.z * 0.45 };
        });
        for (const indices of [[0, 1, 3], [0, 2, 3], [0, 1, 2]]) polygon(indices.map(index => points[index]), i ? "#22d3ee20" : "#f472b620", i ? cyan : pink);
        circle(points[0].x, points[0].y, 3, yellow);
      });
      text("EULER COMPONENTS", 52, 49, pink); text("QUATERNION SLERP", 255, 49, cyan);
      text("same endpoints / different rotation paths", 18, 234);
      break;
    }
    case "z-fighting": {
      [110, 310].forEach((x, i) => {
        polygon([{ x: x - 80, y: 130 }, { x, y: 78 }, { x: x + 80, y: 130 }, { x, y: 185 }], "#233141", "#44546b");
        ctx.save(); ctx.translate(x, 130); ctx.transform(1, 0.55, -1, 0.55, 0, 0);
        rect(-25, -25, 50, 50, yellow);
        if (!i) for (let n = 0; n < 12; n++) rect(-25, -25 + n * 4.2, 50, 2 + Math.sin(t * 14 + n) * 1.5, "#233141");
        ctx.restore();
      });
      text("COPLANAR", 80, 49, pink); text("DEPTH BIAS", 275, 49, cyan); text("a small offset prevents conflicting depths", 18, 234);
      break;
    }
    case "delta-time": {
      twoLanes("FIXED DISTANCE / FRAME", "VELOCITY × DELTA TIME");
      const fps = Math.sin(t * 0.6) > 0 ? 15 : 60;
      state.accumulator += dt;
      while (state.accumulator >= 1 / fps) {
        state.variableX += 1.5; state.constantX += 90 / fps; state.accumulator -= 1 / fps;
      }
      for (const [i, x] of [state.variableX, state.constantX].entries()) {
        const y = i ? 195 : 100;
        for (let n = 0; n < 12; n++) line(25 + n * 32, y - 5, 25 + n * 32 + 16, y - 5, lineColor);
        character(30 + x % 355, y, i ? pink : muted);
      }
      text(`simulated render rate: ${fps} FPS`, 18, 234);
      break;
    }
    case "coyote-time":
    case "input-buffering": {
      const coyote = slug === "coyote-time";
      twoLanes(coyote ? "NO GRACE WINDOW" : "EARLY PRESS DISCARDED", coyote ? "100 ms GRACE WINDOW" : "120 ms INPUT BUFFER");
      const phase = t % 3;
      const x = coyote ? 40 + phase * 110 : 100 + phase * 65;
      for (let i = 0; i < 2; i++) {
        const floor = i ? 205 : 110;
        rect(20, floor, coyote ? 145 : 380, 7, "#303446");
        if (coyote) rect(260, floor, 140, 7, "#303446");
        let y = floor;
        if (coyote && x > 165) {
          const jumpAge = phase - 1.22;
          y += i && jumpAge > 0 ? -190 * jumpAge + 150 * jumpAge ** 2 : (phase - 1.13) ** 2 * 150;
          if (x >= 260 && i && y > floor) y = floor;
        }
        if (!coyote) {
          y -= phase < 1 ? 90 * (1 - phase) ** 2 : i && phase < 2 ? Math.sin((phase - 1) * Math.PI) * 75 : 0;
        }
        if (y < floor + 50) character(x, y, i ? pink : muted);
      }
      const pressed = coyote ? phase > 1.22 && phase < 1.6 : phase > 0.88 && phase < 1.3;
      text(pressed ? "JUMP PRESSED" : "watch the input timing", 18, 234, pressed ? yellow : muted);
      break;
    }
    case "easing": {
      const progress = (t % 2.5) / 1.6;
      const u = clamp(progress);
      const back = (n: number) => 1 + 2.70158 * (n - 1) ** 3 + 1.70158 * (n - 1) ** 2;
      const curves = [(n: number) => n, easeOutCubic, back];
      const palette = [muted, pink, yellow];
      line(40, 180, 155, 180); line(40, 180, 40, 60);
      curves.forEach((curve, i) => {
        for (let k = 0; k < 50; k++) line(40 + k * 2.2, 180 - curve(k / 50) * 100, 40 + (k + 1) * 2.2, 180 - curve((k + 1) / 50) * 100, palette[i]);
        line(200, 80 + i * 50, 370, 80 + i * 50);
        rect(195 + curve(u) * 170, 73 + i * 50, 14, 14, palette[i]);
      });
      text("linear / cubic / back", 18, 234);
      break;
    }
    case "screen-shake": {
      const age = t % 2.7;
      const trauma = Math.max(0, 1 - age);
      [110, 310].forEach((x, i) => {
        rect(x - 82, 58, 164, 139, "#333648", false);
        ctx.save(); ctx.beginPath(); ctx.rect(x - 81, 59, 162, 137); ctx.clip();
        const intensity = i ? trauma ** 2 : trauma;
        ctx.translate(Math.sin(t * (i ? 35 : 115)) * 13 * intensity, Math.cos(t * (i ? 27 : 173)) * 9 * intensity);
        for (let n = 0; n < 4; n++) rect(x - 78 + n * 42, 142 - n % 2 * 30, 32, 65, "#26334b");
        character(x, 170, i ? pink : muted);
        if (age < 0.2) circle(x + 25, 145, 25 * (age / 0.2), "#facc1560", false);
        ctx.restore();
      });
      text("RAW JITTER", 68, 45); text("SMOOTH DECAY", 264, 45, pink);
      text(`trauma ${trauma.toFixed(2)} / replay to trigger`, 18, 234);
      break;
    }
    case "squash-and-stretch": {
      const phase = (t % 1.4) / 1.4;
      const height = Math.abs(Math.sin(phase * Math.PI)) * 118;
      [110, 310].forEach((x, i) => {
        line(x - 70, 205, x + 70, 205);
        const scale = i ? (height < 18 ? 0.65 : 1 + Math.abs(Math.cos(phase * Math.PI)) * 0.4) : 1;
        ctx.fillStyle = i ? pink : muted; ctx.beginPath(); ctx.ellipse(x, 205 - height - 16 * scale, 16 / scale, 16 * scale, 0, 0, Math.PI * 2); ctx.fill();
      });
      text("RIGID", 94, 45); text("DEFORMED", 280, 45, pink); text("same trajectory / conserved visual area", 18, 234);
      break;
    }
    case "camera-deadzone": {
      const playerX = state.pointing ? state.pointer.x : 210 + Math.sin(t * 0.7) * 155;
      const cameraX = clamp(playerX, 150, 270) - 210;
      ctx.save(); ctx.translate(-cameraX, 0);
      for (let i = -1; i < 8; i++) rect(i * 85, 75 + i % 2 * 30, 48, 123, "#1b2233");
      line(-200, 205, 620, 205);
      character(playerX, 205, pink);
      ctx.restore();
      rect(150, 75, 120, 130, "#f472b610"); rect(150, 75, 120, 130, "#f472b680", false);
      text("DEADZONE", 179, 65, pink); text(`camera offset ${cameraX.toFixed(0)} / move horizontally`, 18, 234);
      break;
    }
    case "acceleration-and-friction": {
      twoLanes("INSTANT VELOCITY", "ACCELERATE / BRAKE");
      const raw = Math.sin(t * 1.1) > 0 ? 1 : -1;
      const smoothed = Math.tanh(Math.sin(t * 1.1) * 5);
      character(210 + raw * 120, 110, muted); character(210 + smoothed * 120, 205, pink);
      for (let x = 20; x < 395; x += 3) {
        const v = Math.sin((t - (395 - x) / 90) * 1.1);
        const next = Math.sin((t - (392 - x) / 90) * 1.1);
        line(x, 65 - Math.sign(v) * 13, x + 3, 65 - Math.sign(next) * 13, muted);
        line(x, 160 - Math.tanh(v * 5) * 13, x + 3, 160 - Math.tanh(next * 5) * 13, pink);
      }
      text("input direction flips / velocity ramps", 18, 234);
      break;
    }
    case "hit-stop":
    case "hitbox-hurtbox": {
      const hitboxes = slug === "hitbox-hurtbox";
      if (!hitboxes) twoLanes("CONTINUOUS SWING", "120 ms IMPACT PAUSE");
      const cycle = t % 2;
      const lanes = hitboxes ? 1 : 2;
      for (let i = 0; i < lanes; i++) {
        const floor = hitboxes ? 190 : i ? 205 : 110;
        const phase = i && cycle > 0.6 && cycle < 0.72 ? 0.6 : i && cycle >= 0.72 ? cycle - 0.12 : cycle;
        const duck = hitboxes && Math.floor(t / 2) % 2 === 1;
        character(150, floor, accent); character(263, floor, muted, duck);
        const swordX = 162 + Math.sin(clamp(phase / 1.2) * Math.PI) * 105;
        line(158, floor - 22, swordX, floor - 34, yellow, 4);
        if (hitboxes) {
          rect(254, floor - (duck ? 20 : 34), 20, duck ? 20 : 34, "#22d3ee35"); rect(254, floor - (duck ? 20 : 34), 20, duck ? 20 : 34, cyan, false);
          if (cycle > 0.4 && cycle < 0.85) rect(swordX - 12, floor - 42, 25, 17, "#f472b660");
          text(duck ? "DUCK: HURTBOX BELOW ATTACK" : "ACTIVE HITBOX ∩ HURTBOX", 75, 55, duck ? cyan : pink);
        }
        const sparkAge = cycle - 0.6;
        if (sparkAge > 0 && sparkAge < 0.4 && !duck) for (let n = 0; n < 8; n++) {
          const a = n * Math.PI / 4; circle(260 + Math.cos(a) * sparkAge * 80, floor - 34 + Math.sin(a) * sparkAge * 80, 2, yellow);
        }
      }
      text(hitboxes ? "pink = attack / cyan = damageable area" : "particles keep running while actors pause", 18, 234);
      break;
    }
    case "invincibility-frames": {
      twoLanes("DAMAGE ON EVERY CONTACT", "DAMAGE + IMMUNITY TIMER");
      const phase = t % 4;
      const contact = phase > 1 && phase < 2.5;
      for (let i = 0; i < 2; i++) {
        const y = i ? 205 : 110;
        const health = i ? (phase > 1 ? 0.75 : 1) : clamp(1 - Math.max(0, phase - 1) * 1.1);
        rect(275, y - 67, 95, 7, "#303244"); rect(275, y - 67, 95 * health, 7, i ? pink : "#d77a89");
        if (!i || !contact || Math.floor(t * 10) % 2 === 0) character(295, y, i ? pink : muted);
        rect(40 + (phase * 110) % 345, y - 22, 34, 7, yellow);
      }
      text(contact ? "IMMUNE / additional damage ignored" : "waiting for next projectile", 18, 234, contact ? pink : muted);
      break;
    }
    case "object-pooling": {
      text("PREALLOCATED PROJECTILE SLOTS", 20, 52, green);
      for (let i = 0; i < 18; i++) {
        const age = (t * 0.8 + i * 0.19) % 2;
        const x = 45 + i % 9 * 41, y = 78 + Math.floor(i / 9) * 35;
        rect(x, y, 26, 24, age < 1 ? "#a3e63535" : "#1a1e28"); rect(x, y, 26, 24, age < 1 ? green : "#3c4052", false);
        text(String(i).padStart(2, "0"), x + 6, y + 16, age < 1 ? green : muted, 9);
        if (age < 1) circle(30 + age * 360, 185 + (i % 3) * 9, 2, green);
      }
      text("acquire → reset → active → release → reuse", 18, 234);
      break;
    }
    case "state-machine": {
      const names = ["IDLE", "RUN", "ATTACK"];
      const active = Math.floor(t / 1.3 + state.variant) % 3;
      for (let i = 0; i < 3; i++) {
        const x = 70 + i * 140;
        if (i < 2) arrow(x + 39, 122, 58, 0, i === active ? green : lineColor);
        circle(x, 122, 38, i === active ? "#a3e63520" : "#151924");
        circle(x, 122, 38, i === active ? green : "#424756", false);
        text(names[i], x - names[i].length * 3, 126, i === active ? green : muted);
      }
      ctx.setLineDash([4, 4]); line(350, 164, 350, 186, "#424756"); line(350, 186, 70, 186, "#424756"); line(70, 186, 70, 164, "#424756"); ctx.setLineDash([]);
      text("MOVE", 124, 104); text("ATTACK", 256, 104); text("animation finished", 155, 204);
      text(`current state: ${names[active].toLowerCase()}`, 18, 234, green);
      break;
    }
    case "pathfinding": {
      const cols = 15, rows = 7, size = 24, ox = 30, oy = 45;
      const walls = new Set<number>();
      for (let y = 0; y < rows; y++) {
        if (y !== 5) walls.add(y * cols + 5);
        if (y !== 1) walls.add(y * cols + 10);
      }
      const gx = state.pointing ? clamp(Math.floor((state.pointer.x - ox) / size), 0, cols - 1) : 13;
      const gy = state.pointing ? clamp(Math.floor((state.pointer.y - oy) / size), 0, rows - 1) : 5;
      const goal = gy * cols + gx;
      const result = findPath(cols, rows, walls, cols + 1, goal);
      const reveal = Math.floor((t % 5) * 35);
      const explored = new Set(result.visited.slice(0, reveal));
      const path = new Set(reveal >= result.visited.length ? result.path : []);
      for (let i = 0; i < cols * rows; i++) {
        const color = walls.has(i) ? "#3c4356" : path.has(i) ? "#a3e63565" : explored.has(i) ? "#22d3ee23" : "#171c28";
        rect(ox + i % cols * size, oy + Math.floor(i / cols) * size, size - 2, size - 2, color);
      }
      circle(ox + 1.5 * size - 1, oy + 1.5 * size - 1, 5, green);
      circle(ox + (gx + 0.5) * size - 1, oy + (gy + 0.5) * size - 1, 5, pink);
      text(result.path.length ? `${result.visited.length} explored / ${result.path.length - 1} steps / point to set goal` : "unreachable goal / choose an open cell", 18, 234);
      break;
    }
    case "particle-system": {
      const mode = state.variant % 3;
      text(["SPARKS / gravity + fade", "SMOKE / rise + expand", "CONFETTI / spread + spin"][mode], 18, 48, green);
      const random = seededRandom(state.seed);
      for (let i = 0; i < 70; i++) {
        const angle = random() * Math.PI - Math.PI;
        const speed = 35 + random() * 85;
        const life = 0.8 + random() * 1.4;
        const age = (t + random() * life) % life;
        const x = target.x + Math.cos(angle) * speed * age;
        const y = target.y + Math.sin(angle) * speed * age + (mode === 1 ? -25 : 45) * age * age;
        ctx.globalAlpha = 1 - age / life;
        if (mode === 1) circle(x, y, 4 + age * 12, "#9aafc0");
        else if (mode === 2) { ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); rect(-3, -2, 6, 4, [green, pink, cyan, yellow][i % 4]); ctx.restore(); }
        else line(x, y, x - Math.cos(angle) * 5, y - Math.sin(angle) * 5, yellow, 2);
      }
      ctx.globalAlpha = 1; circle(target.x, target.y, 4, green); text("move the emitter / change effect below", 18, 234);
      break;
    }
    case "fixed-timestep": {
      twoLanes("VARIABLE PHYSICS STEP", "FIXED PHYSICS STEP / 60 Hz");
      const step = Math.sin(t * 0.8) > 0.7 ? 0.11 : 1 / 60;
      state.accumulator += dt;
      while (state.accumulator >= step) {
        state.springV += -90 * state.springX * step;
        state.springX += state.springV * step;
        if (Math.abs(state.springX) > 130) { state.springX = 60; state.springV = 0; }
        state.accumulator -= step;
      }
      state.physicsAccumulator += dt;
      while (state.physicsAccumulator >= 1 / 60) {
        state.fixedV += -90 * state.fixedX / 60; state.fixedX += state.fixedV / 60; state.physicsAccumulator -= 1 / 60;
      }
      [state.springX, state.fixedX].forEach((offset, i) => {
        const y = i ? 180 : 85;
        const end = 230 + offset;
        for (let n = 0; n < 16; n++) line(45 + (end - 55) * n / 16, y + (n % 2 ? 7 : -7), 45 + (end - 55) * (n + 1) / 16, y + (n % 2 ? -7 : 7), i ? green : muted);
        circle(end, y, 12, i ? green : muted);
      });
      text(`render interval ${(step * 1000).toFixed(0)} ms / physics 16.67 ms`, 18, 234);
      break;
    }
    case "steering-behaviors": {
      grid(); circle(target.x, target.y, 35, "#a3e63530", false); circle(target.x, target.y, 4, green);
      for (const agent of state.agents) {
        const dx = target.x - agent.x, dy = target.y - agent.y, distance = Math.hypot(dx, dy) || 1;
        const speed = 65 * clamp(distance / 60);
        let fx = dx / distance * speed - agent.vx, fy = dy / distance * speed - agent.vy;
        for (const other of state.agents) {
          if (other === agent) continue;
          const sx = agent.x - other.x, sy = agent.y - other.y, d = Math.hypot(sx, sy);
          if (d > 0 && d < 24) { fx += sx / d * (24 - d) * 5; fy += sy / d * (24 - d) * 5; }
        }
        const force = Math.hypot(fx, fy) || 1;
        agent.vx += fx / force * Math.min(force, 120) * dt; agent.vy += fy / force * Math.min(force, 120) * dt;
        agent.x += agent.vx * dt; agent.y += agent.vy * dt;
        ctx.save(); ctx.translate(agent.x, agent.y); ctx.rotate(Math.atan2(agent.vy, agent.vx));
        polygon([{ x: 7, y: 0 }, { x: -5, y: -4 }, { x: -5, y: 4 }], "#a3e63560", green); ctx.restore();
      }
      text("seek + arrive + separation / point to guide", 18, 234);
      break;
    }
    case "tunneling": {
      twoLanes("DISCRETE OVERLAP", "SWEPT COLLISION");
      const x = 30 + (t % 3) * 130;
      [100, 195].forEach((y, i) => {
        rect(240, y - 45, 6, 55, muted);
        for (let n = 0; n < 9; n++) circle(30 + n * 43, y - 20, 2, "#3c4156");
        const px = i ? Math.min(x, 234) : Math.floor((x - 30) / 43) * 43 + 30;
        circle(px, y - 20, 6, i ? green : pink);
        if (i) line(30, y - 20, px, y - 20, "#a3e63560");
      });
      text("large steps miss a thin wall / sweep catches it", 18, 234);
      break;
    }
    case "seeded-noise": {
      text(`SEED ${state.seed}`, 18, 48, green);
      for (let i = 0; i < 74; i++) {
        const x = 25 + i * 5;
        const height = (valueNoise(i / 12, state.seed) + 0.5 * valueNoise(i / 6, state.seed + 1) + 0.25 * valueNoise(i / 3, state.seed + 2)) * 70;
        rect(x, 205 - height, 5, height, "#a3e63525"); line(x, 205 - height, x + 5, 205 - height, green);
        const raw = seededRandom(state.seed + i * 7)() * 35;
        line(x, 77 - raw, x + 4, 77 - raw, "#6e738d");
      }
      text("random samples", 260, 89); text("smooth multi-octave terrain", 18, 234, green);
      break;
    }
    case "frame-budget": {
      const budgetY = 200 - 16.67 * 7;
      ctx.setLineDash([4, 4]); line(25, budgetY, 397, budgetY, pink); ctx.setLineDash([]);
      text("16.67 ms", 321, budgetY - 7, pink);
      for (let i = 0; i < 32; i++) {
        const x = 27 + i * 11.5;
        const logic = 2.3 + Math.sin(i + t) * 0.6;
        const physics = 3.2 + Math.max(0, Math.sin(i * 1.3 - t * 2)) ** 12 * 9;
        const rendering = 5 + Math.cos(i * 0.7 + t) * 1.2;
        let y = 200;
        for (const [cost, color] of [[logic, green], [physics, purple], [rendering, cyan]] as const) { y -= cost * 7; rect(x, y, 8, cost * 7 - 1, color); }
      }
      text("update", 30, 222, green); text("physics", 130, 222, purple); text("render", 247, 222, cyan);
      text("budget = 1000 / target FPS", 18, 244);
      break;
    }
    case "draw-calls": {
      const instanced = state.variant % 2 === 0;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 15; x++) {
        cube(37 + x * 24 + Math.sin(t * 0.25) * y * 1.5, 64 + y * 17, 7, instanced ? purple : [purple, cyan, pink][x % 3]);
      }
      text(instanced ? "INSTANCED / 1 DRAW CALL" : "INDIVIDUAL / 120 DRAW CALLS", 18, 44, purple);
      text("120 copies / identical geometry / toggle mode", 18, 234);
      break;
    }
    case "spatial-partitioning": {
      grid(40);
      const points = Array.from({ length: 48 }, (_, i) => ({ x: 25 + (i * 67 + Math.sin(t * 0.4 + i) * 25 + 360) % 365, y: 50 + (i * 43 + Math.cos(t * 0.5 + i) * 20 + 160) % 150 }));
      const focus = state.pointing ? state.pointer : points[0];
      const cx = Math.floor(focus.x / 40), cy = Math.floor((focus.y - 35) / 40);
      let candidates = 0;
      for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++) rect(x * 40, 35 + y * 40, 40, 40, "#a78bfa12");
      for (const p of points) {
        const nearby = Math.abs(Math.floor(p.x / 40) - cx) <= 1 && Math.abs(Math.floor((p.y - 35) / 40) - cy) <= 1;
        if (nearby) { candidates++; line(focus.x, focus.y, p.x, p.y, "#a78bfa45"); }
        circle(p.x, p.y, 4, nearby ? purple : "#4e536b");
      }
      circle(focus.x, focus.y, 7, yellow, false); text(`local query: ${candidates} candidates / 48 total`, 18, 234);
      break;
    }
    case "overdraw": {
      const heat = state.variant % 2 === 0;
      const smoke = Array.from({ length: 14 }, (_, i) => ({ x: 210 + Math.sin(t * 0.3 + i * 1.8) * 80, y: 132 + Math.cos(t * 0.4 + i * 2.3) * 45, r: 32 + i % 3 * 8 }));
      if (heat) {
        const palette = ["#0b1020", "#234786", "#4467b7", "#6877ca", "#a47dc8", "#e09ac3", "#f9cedb", "#fff4ef"];
        for (let y = 50; y < 211; y += 5) for (let x = 30; x < 395; x += 5) {
          const count = smoke.filter(p => Math.hypot(x - p.x, y - p.y) < p.r).length;
          if (count) rect(x, y, 5, 5, palette[Math.min(count, 7)]);
        }
      } else {
        ctx.globalAlpha = 0.15; for (const p of smoke) circle(p.x, p.y, p.r, "#b8c2d3"); ctx.globalAlpha = 1;
      }
      text(heat ? "OVERLAP HEATMAP / brighter = more layers" : "TRANSPARENT SMOKE / same geometry", 18, 234);
      break;
    }
    case "time-slicing": {
      const bucket = Math.floor(t * 6) % 8;
      for (let i = 0; i < 8; i++) {
        rect(30 + i * 46, 51, 38, 18, i === bucket ? purple : "#282b3d");
        text(String(i), 45 + i * 46, 64, i === bucket ? "#0a0b12" : muted);
      }
      for (let i = 0; i < 96; i++) {
        const x = 35 + i % 16 * 23 + Math.sin(t + i) * 3;
        const y = 97 + Math.floor(i / 16) * 18 + Math.cos(t * 0.6 + i) * 3;
        circle(x, y, 3, i % 8 === bucket ? purple : "#474b61");
      }
      text("decide: 1 / 8 buckets     move: every agent", 18, 234);
      break;
    }
    case "texture-atlas": {
      const palette = [purple, cyan, pink, yellow, green, "#fb923c"];
      rect(25, 60, 130, 130, "#2b2f43", false);
      for (let i = 0; i < 6; i++) {
        const x = 31 + i % 3 * 41, y = 66 + Math.floor(i / 3) * 60;
        rect(x, y, 34, 50, `${palette[i]}25`); circle(x + 17, y + 25, 9, palette[i]);
      }
      arrow(166, 125, 32, 0, purple);
      for (let i = 0; i < 24; i++) {
        const x = 219 + i % 6 * 30, y = 75 + Math.floor(i / 6) * 34;
        circle(x, y + Math.sin(t + i) * 4, 7, palette[i % 6]);
      }
      text("ONE ATLAS", 60, 208, purple); text("ONE COMPATIBLE BATCH", 218, 208, purple);
      text("UV rectangles select each sprite region", 18, 234);
      break;
    }
    case "chunk-streaming": {
      const size = 26, cols = 14, rows = 6, ox = 28, oy = 52;
      const player = state.pointing ? state.pointer : { x: 210 + Math.sin(t * 0.5) * 110, y: 130 + Math.cos(t * 0.6) * 38 };
      const loadRadius = 60, unloadRadius = 87;
      for (let i = 0; i < cols * rows; i++) {
        const x = ox + i % cols * size, y = oy + Math.floor(i / cols) * size;
        const d = Math.hypot(x + size / 2 - player.x, y + size / 2 - player.y);
        if (d < loadRadius) state.loaded.add(i); else if (d > unloadRadius) state.loaded.delete(i);
        const loaded = state.loaded.has(i);
        rect(x, y, size - 2, size - 2, loaded ? "#a78bfa40" : "#1a1d2a"); rect(x, y, size - 2, size - 2, loaded ? "#a78bfa70" : "#292d3e", false);
      }
      circle(player.x, player.y, loadRadius, purple, false);
      ctx.setLineDash([4, 4]); circle(player.x, player.y, unloadRadius, "#a78bfa55", false); ctx.setLineDash([]);
      circle(player.x, player.y, 5, yellow);
      text(`${state.loaded.size} / ${cols * rows} loaded / larger unload radius`, 18, 234);
      break;
    }
    default: text("Select a concept to begin", 110, 130);
  }
}
