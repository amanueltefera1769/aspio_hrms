export type Feature = "attendance" | "team" | "records";
export type Scene = "overview" | Feature;
export type CameraFrame = { id: string; src: string; depth: string; focus: [number, number]; extent: number };

const base = "/images/campus/sequences-v1";
const frame = (id: string, path: string, depth: string, focus: [number, number], extent: number): CameraFrame =>
  ({ id, src: `${base}/${path}.webp`, depth: `${base}/depth/${depth}.webp`, focus, extent });
export const overview = frame("overview", "overview", "overview", [.775, .815], .14);
// One push-in, one deliberate cut, one settle. In-between pictures were dropped:
// each was redrawn from a different angle, so blending them read as a slideshow.
export const sequences: Record<Feature, CameraFrame[]> = {
  attendance: [overview, frame("attendance", "attendance/05", "attendance", [.49, .605], .632)],
  team: [{ ...overview, focus: [.856, .29], extent: .065 }, frame("team", "team/04", "team", [.72, .44], .20)],
  records: [{ ...overview, focus: [.54, .30], extent: .07 }, frame("records", "records/04", "records", [.65, .61], .50)],
};

const identity = "translate(0%, 0%) scale(1)";
const cut = .5; // where the overview hands over to the close-up
export const sequenceCut = cut; // the copy changes here too, with the picture
const fade = .06; // close-up fade, centered on the cut and hidden in the bloom
const restZoom = 1.08; // close-ups settle slightly inside their frame, so they can keep moving forward
const pushEnd = cut + fade / 2;
const settleStart = cut - fade / 2;
// Accelerate into the cut, decelerate out of it: one move with one edit.
const easeIn = (t: number) => t ** 1.8;
const easeOut = (t: number) => 1 - (1 - t) ** 2.6;
const bump = (time: number, width: number) => Math.exp(-(((time - cut) / width) ** 2));
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const sequenceDuration = (route: CameraFrame[]) => route.length > 1 ? 2300 : 0;

// Scale about the subject and move it toward the centre, without uncovering the box.
function cameraTransform(focus: [number, number], scale: number, target: [number, number]) {
  if (Math.abs(scale - 1) < 1e-4) return identity;
  const [x, y] = [0, 1].map(axis => Math.min(0, Math.max(1 - scale, target[axis] - focus[axis] * scale)) * 100);
  return `translate(${x.toFixed(4)}%, ${y.toFixed(4)}%) scale(${scale.toFixed(5)})`;
}
// The overview pushes toward where the close-up frames the same subject, and close
// to its size, so the cut reads as continuing forward. Its softness at this zoom
// falls under the cut's blur.
const pushZoom = (route: CameraFrame[]) => Math.min(3.4, Math.max(1.8, route[1].extent / route[0].extent / 1.35));
const pushTransform = (route: CameraFrame[], amount: number) => {
  const [from, to] = [route[0].focus, route[1].focus];
  const target: [number, number] = [from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount];
  return cameraTransform(from, pushZoom(route) ** amount, target);
};
const settleTransform = (focus: [number, number], amount: number) => cameraTransform(focus, restZoom ** amount, focus);

// Where a close-up rests once it has arrived; also its static style, so nothing jumps
// when the animation is removed.
export const restTransform = (frame: CameraFrame) => settleTransform(frame.focus, 1);

export function sequenceFrames(id: string, route: CameraFrame[]): Keyframe[] {
  const index = route.findIndex(item => item.id === id);
  if (index < 0) return [{ opacity: 0 }, { opacity: 0 }];
  const frame = route[index];
  const steps = 48;
  const times = new Set(Array.from({ length: steps + 1 }, (_, step) => step / steps));
  [settleStart, cut, pushEnd, pushEnd + .0005].forEach(time => times.add(time));
  return [...times].sort((a, b) => a - b).map(time => index === 0
    // The overview stays opaque under the arriving close-up, then drops out.
    ? { offset: time, opacity: time > pushEnd ? 0 : 1, transform: pushTransform(route, easeIn(clamp01(time / pushEnd))), zIndex: 0 }
    : { offset: time, opacity: clamp01((time - settleStart) / fade), transform: settleTransform(frame.focus, easeOut(clamp01((time - settleStart) / (1 - settleStart)))), zIndex: 1 });
}

// Shader values for a plane at a point in the move, matching the CSS motion above.
export function depthParams(route: CameraFrame[], index: number, time: number) {
  const frame = route[index];
  const blur = .09 * bump(time, .07);
  const bloom = .45 * bump(time, .045);
  // Nearer things grow faster as the camera moves in, and settle to nothing at rest.
  const parallax = index === 0 ? .18 * easeIn(clamp01(time / pushEnd)) : -.07 * (1 - easeOut(clamp01((time - settleStart) / (1 - settleStart))));
  return { parallax, blur, bloom, focus: frame.focus };
}

// Cache completed downloads, evict errors so a later selection can retry.
const decoded = new Map<string, Promise<void>>();
export function decodeSequence(route: CameraFrame[]): Promise<void> {
  return Promise.all(route.map(({ src }) => {
    if (!decoded.has(src)) {
      const promise = new Promise<void>((resolve, reject) => {
        const image = new window.Image();
        const timer = setTimeout(() => reject(new Error("Scene download timed out")), 12000);
        image.onload = () => {
          image.decode().then(resolve, reject).finally(() => clearTimeout(timer));
        };
        image.onerror = () => { clearTimeout(timer); reject(new Error("Scene download failed")); };
        image.src = src;
      }).catch(error => { decoded.delete(src); throw error; });
      decoded.set(src, promise);
    }
    return decoded.get(src)!;
  })).then(() => undefined);
}
