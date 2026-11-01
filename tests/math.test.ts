import { test } from "node:test";
import assert from "node:assert/strict";
import { findPath, quaternionFromEuler, rayRect, rotateVector, seededRandom, slerp, valueNoise } from "../src/lib/math";

test("rays select a positive contact distance with the correct normal", () => {
  assert.deepEqual(rayRect({ x: 0, y: 5 }, { x: 1, y: 0 }, { x: 10, y: 0, w: 5, h: 10 }), { distance: 10, normal: { x: -1, y: 0 } });
  assert.deepEqual(rayRect({ x: 12, y: 20 }, { x: 0, y: -1 }, { x: 10, y: 0, w: 5, h: 10 }), { distance: 10, normal: { x: 0, y: 1 } });
  assert.equal(rayRect({ x: 0, y: 15 }, { x: 1, y: 0 }, { x: 10, y: 0, w: 5, h: 10 }), null);
  assert.equal(rayRect({ x: 0, y: 5 }, { x: -1, y: 0 }, { x: 10, y: 0, w: 5, h: 10 }), null);
});

test("seeded terrain repeats and remains continuous across cell boundaries", () => {
  const sample = (seed: number) => { const random = seededRandom(seed); return Array.from({ length: 20 }, () => random()); };
  assert.deepEqual(sample(42), sample(42));
  assert.notDeepEqual(sample(42), sample(179));
  assert.ok(Math.abs(valueNoise(1 - 1e-5, 42) - valueNoise(1 + 1e-5, 42)) < 1e-4);
});

test("A* navigates around a wall without wrapping rows", () => {
  const walls = new Set([2, 7, 12, 17]);
  const { path } = findPath(5, 5, walls, 0, 4);
  assert.equal(path[0], 0);
  assert.equal(path.at(-1), 4);
  assert.equal(path.length - 1, 12);
  for (let i = 1; i < path.length; i++) {
    assert.ok(!walls.has(path[i]));
    const a = path[i - 1], b = path[i];
    assert.equal(Math.abs(a % 5 - b % 5) + Math.abs(Math.floor(a / 5) - Math.floor(b / 5)), 1);
  }
  assert.deepEqual(findPath(3, 3, new Set([1, 3]), 0, 8).path, []);
});

test("slerp takes the equivalent quaternion's short arc and preserves unit length", () => {
  assert.deepEqual(slerp([0, 0, 0, 1], [0, 0, 0, -1], 0.5), [0, 0, 0, 1]);
  const midpoint = slerp([0, 0, 0, 1], [0, 1, 0, 0], 0.5);
  assert.ok(Math.abs(Math.hypot(...midpoint) - 1) < 1e-10);
  assert.ok(Math.abs(midpoint[1] - Math.SQRT1_2) < 1e-10);
  const end = quaternionFromEuler(2.7, 2.4, 2.8);
  const point = { x: 1, y: 0, z: 0 };
  const interpolated = rotateVector(point, slerp([0, 0, 0, 1], end, 1));
  const direct = rotateVector(point, end);
  assert.ok(Math.hypot(interpolated.x - direct.x, interpolated.y - direct.y, interpolated.z - direct.z) < 1e-10);
  assert.ok(Math.abs(Math.hypot(direct.x, direct.y, direct.z) - 1) < 1e-10);
});
