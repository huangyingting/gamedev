export interface Vec2 { x: number; y: number }
export interface Rect { x: number; y: number; w: number; h: number }

export const clamp = (n: number, min = 0, max = 1): number => Math.min(max, Math.max(min, n));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

export type Quaternion = [number, number, number, number];
export interface Vec3 extends Vec2 { z: number }

export function quaternionFromEuler(x: number, y: number, z: number): Quaternion {
  const cx = Math.cos(x / 2), cy = Math.cos(y / 2), cz = Math.cos(z / 2);
  const sx = Math.sin(x / 2), sy = Math.sin(y / 2), sz = Math.sin(z / 2);
  return [sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz, cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz];
}

export function rotateVector(p: Vec3, q: Quaternion): Vec3 {
  const [x, y, z, w] = q;
  const tx = 2 * (y * p.z - z * p.y);
  const ty = 2 * (z * p.x - x * p.z);
  const tz = 2 * (x * p.y - y * p.x);
  return { x: p.x + w * tx + y * tz - z * ty, y: p.y + w * ty + z * tx - x * tz, z: p.z + w * tz + x * ty - y * tx };
}

export function slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let target = b;
  let dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
  if (dot < 0) { target = b.map(n => -n) as Quaternion; dot = -dot; }
  if (dot > 0.9995) {
    const q = a.map((n, i) => lerp(n, target[i], t));
    const length = Math.hypot(...q);
    return q.map(n => n / length) as Quaternion;
  }
  const theta = Math.acos(clamp(dot, -1, 1));
  const sin = Math.sin(theta);
  return a.map((n, i) => (n * Math.sin((1 - t) * theta) + target[i] * Math.sin(t * theta)) / sin) as Quaternion;
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let n = state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

export function valueNoise(x: number, seed: number): number {
  const i = Math.floor(x);
  const a = seededRandom(seed + i * 1013)();
  const b = seededRandom(seed + (i + 1) * 1013)();
  return lerp(a, b, smoothstep(x - i));
}

export function rayRect(origin: Vec2, direction: Vec2, rect: Rect): { distance: number; normal: Vec2 } | null {
  let near = -Infinity;
  let far = Infinity;
  let normal: Vec2 = { x: 0, y: 0 };
  for (const axis of ["x", "y"] as const) {
    const min = rect[axis];
    const max = min + (axis === "x" ? rect.w : rect.h);
    const d = direction[axis];
    if (Math.abs(d) < 1e-10) {
      if (origin[axis] < min || origin[axis] > max) return null;
      continue;
    }
    const t1 = (min - origin[axis]) / d;
    const t2 = (max - origin[axis]) / d;
    const enter = Math.min(t1, t2);
    if (enter > near) {
      near = enter;
      normal = axis === "x" ? { x: d > 0 ? -1 : 1, y: 0 } : { x: 0, y: d > 0 ? -1 : 1 };
    }
    far = Math.min(far, Math.max(t1, t2));
    if (near > far) return null;
  }
  if (far < 0 || near < 0) return null;
  return { distance: near, normal };
}

export function findPath(cols: number, rows: number, walls: Set<number>, start: number, goal: number): { path: number[]; visited: number[] } {
  const heuristic = (n: number) => Math.abs(n % cols - goal % cols) + Math.abs(Math.floor(n / cols) - Math.floor(goal / cols));
  const open = new Set([start]);
  const costs = new Map([[start, 0]]);
  const parents = new Map<number, number>();
  const visited: number[] = [];
  while (open.size) {
    let best = -1;
    let score = Infinity;
    for (const n of open) {
      const f = costs.get(n)! + heuristic(n);
      if (f < score) { best = n; score = f; }
    }
    open.delete(best);
    visited.push(best);
    if (best === goal) {
      const path = [goal];
      while (path[0] !== start) path.unshift(parents.get(path[0])!);
      return { path, visited };
    }
    const x = best % cols;
    const y = Math.floor(best / cols);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const n = ny * cols + nx;
      if (walls.has(n)) continue;
      const cost = costs.get(best)! + 1;
      if (cost >= (costs.get(n) ?? Infinity)) continue;
      costs.set(n, cost);
      parents.set(n, best);
      open.add(n);
    }
  }
  return { path: [], visited };
}
