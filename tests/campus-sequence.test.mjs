import test from "node:test";
import assert from "node:assert/strict";
import { sequences, sequenceFrames, sequenceDuration, restTransform, depthParams } from "../src/components/home/campus-sequence.ts";

const identity = "translate(0%, 0%) scale(1)";
const parse = transform => transform === identity ? [0, 0, 1] : transform.match(/-?\d+\.?\d*/g).map(Number);
// Linear interpolation of a keyframe property at an offset, as WAAPI does with linear keyframes.
function at(keys, offset, read) {
  const i = keys.findIndex(key => key.offset >= offset);
  if (i <= 0) return read(keys[Math.max(0, i)]);
  const [a, b] = [keys[i - 1], keys[i]];
  const t = b.offset === a.offset ? 1 : (offset - a.offset) / (b.offset - a.offset);
  return read(a) + (read(b) - read(a)) * t;
}

test("Each route is one push-in and one cut from the shared master to its feature", () => {
  for (const [feature, route] of Object.entries(sequences)) {
    assert.equal(route.length, 2);
    assert.equal(route[0].src, "/images/campus/sequences-v1/overview.webp");
    assert.equal(route[0].depth, "/images/campus/sequences-v1/depth/overview.webp");
    assert.equal(route[1].id, feature);
    assert.equal(route[1].depth, `/images/campus/sequences-v1/depth/${feature}.webp`);
    assert.ok(sequenceDuration(route) >= 2000 && sequenceDuration(route) <= 2600);
  }
});

test("Planes start and end at rest, with ordered, reversible frames", () => {
  for (const route of Object.values(sequences)) {
    const [master, closeup] = route.map(frame => sequenceFrames(frame.id, route));
    for (const keys of [master, closeup]) {
      assert.equal(keys[0].offset, 0);
      assert.equal(keys.at(-1).offset, 1);
      assert.ok(keys.every((key, i) => !i || key.offset >= keys[i - 1].offset));
      assert.ok(keys.every(key => !key.transform.includes("NaN")));
    }
    assert.deepEqual([master[0].opacity, master[0].transform], [1, identity]);
    assert.deepEqual([closeup.at(-1).opacity, closeup.at(-1).transform], [1, restTransform(route[1])]);
    assert.equal(master.at(-1).opacity, 0);
    assert.equal(closeup[0].opacity, 0);
    assert.deepEqual(sequenceFrames("unrelated", route), [{ opacity: 0 }, { opacity: 0 }]);
  }
});

test("Visible frames always cover the box, and only one layer fades at a time", () => {
  for (const route of Object.values(sequences)) {
    const planes = route.map(frame => sequenceFrames(frame.id, route));
    for (const keys of planes) for (const key of keys.filter(key => key.opacity > 0)) {
      const [x, y, scale] = parse(key.transform);
      assert.ok(scale >= .9999, `scale ${scale}`);
      for (const value of [x, y]) assert.ok(value / 100 <= 1e-5 && value / 100 >= 1 - scale - 1e-5, `gap ${key.transform}`); // strings round to 5 places
    }
    for (let offset = 0; offset <= 1; offset += .002) {
      const fading = planes.filter(keys => { const o = at(keys, offset, key => key.opacity); return o > .001 && o < .999; });
      assert.ok(fading.length <= 1, `two layers fading at ${offset}`);
    }
  }
});

test("The camera only moves forward: each layer keeps zooming in while it is on screen", () => {
  for (const route of Object.values(sequences)) {
    for (const keys of route.map(frame => sequenceFrames(frame.id, route))) {
      const visible = keys.filter(key => key.opacity > 0).map(key => parse(key.transform)[2]);
      assert.ok(visible.every((scale, i) => !i || scale >= visible[i - 1] - 1e-6), "never pulls back");
      assert.ok(visible.at(-1) > visible[0], "actually moves");
    }
  }
});

test("Depth, blur and bloom vanish at rest and peak at the cut", () => {
  for (const route of Object.values(sequences)) {
    for (const [index, time] of [[0, 0], [1, 1]]) {
      const { parallax, blur, bloom } = depthParams(route, index, time);
      assert.ok(Math.abs(parallax) < 1e-6 && blur < .001 && bloom < .001, "the canvas matches the resting picture");
    }
    const mid = depthParams(route, 0, .5), early = depthParams(route, 0, .3);
    assert.ok(mid.bloom > early.bloom && mid.blur > early.blur);
    assert.ok(depthParams(route, 0, .45).parallax > depthParams(route, 0, .2).parallax, "nearer ground pulls ahead as the camera moves in");
  }
});
