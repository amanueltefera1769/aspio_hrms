"use client";

import { useEffect, useId, useRef, useState } from "react";

type Feature = "attendance" | "team" | "records";
// Paths are fitted to the purple lines painted in the 1672 × 941 master, in travel
// order. The courtyard path starts out in the empty floor, before the painted line.
// This is an illustrative workflow, not a live transfer or check-in indicator.
const courtyard = "M 440 732 L 951.7 599.6";
const routes: { id: Feature; path: string; door: [number, number] }[] = [
  { id: "attendance", path: "M 1067.6 620.4 L 1140.8 766.2 L 1220.6 782.6", door: [1220, 782] },
  { id: "team", path: "M 1061 578 L 1317.1 490.4", door: [1316, 491] },
  { id: "records", path: "M 979.7 522.6 L 886.8 468.1", door: [888, 469] },
];
// One cycle, in ms: in from the courtyard, the rock lights, then out to each
// building in turn; each leaves only once the previous one has arrived.
const arrive = 1500;
const legs = routes.map((route, index) => ({ ...route, start: 1750 + index * 1150, duration: index === 2 ? 800 : 1000 }));
const lit = 1500; // how long a building keeps its arrival glow
const cycle = 9000;
const tail = .16, head = .035; // dash lengths, as a share of each path

const ease = (t: number) => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
// Opacity envelope: rise over `rise` ms from `start`, hold, then fall over `fall` ms until `end`.
const envelope = (time: number, start: number, end: number, rise: number, fall: number) =>
  Math.min(clamp01((time - start) / rise), clamp01((end - time) / fall));

export default function CampusSignal({ enabled, onLight }: { enabled: boolean; onLight?: (buildings: Feature[]) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const [onscreen, setOnscreen] = useState(false);
  const id = useId();
  const active = enabled && onscreen;
  const light = useRef(onLight);
  useEffect(() => { light.current = onLight; }, [onLight]);

  useEffect(() => {
    if (!svg.current) return;
    let intersecting = false;
    const update = () => setOnscreen(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; update(); });
    observer.observe(svg.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  useEffect(() => {
    const root = svg.current;
    if (!root || !active) { light.current?.([]); return; }
    const pulses = [...root.querySelectorAll<SVGGElement>("[data-pulse]")].map(group => {
      const path = group.querySelector<SVGPathElement>("path")!;
      return { group, path, length: path.getTotalLength(), name: group.dataset.pulse!, spark: group.querySelector<SVGGElement>(".mc-signal-spark")! };
    });
    const rock = root.querySelector<SVGGElement>(".mc-signal-rock")!;
    const doors = Object.fromEntries(routes.map(route => [route.id, root.querySelector<SVGElement>(`[data-door=${route.id}]`)!]));
    const begin = performance.now();
    let frame = 0, lastLit = "";
    const draw = (now: number) => {
      const time = (now - begin) % cycle;
      for (const pulse of pulses) {
        const leg = pulse.name === "courtyard" ? { start: 0, duration: arrive } : legs.find(item => item.id === pulse.name)!;
        const progress = ease(clamp01((time - leg.start) / leg.duration));
        const running = time >= leg.start && time <= leg.start + leg.duration + 60;
        // The head travels the path; the tail and the lit line follow it.
        pulse.group.style.setProperty("--progress", String(progress));
        pulse.group.style.setProperty("--head", String(running ? Math.min(1, (time - leg.start) / 120, (leg.start + leg.duration + 60 - time) / 160) : 0));
        const lineFade = envelope(time, leg.start, leg.start + leg.duration + 1100, 60, 900);
        pulse.group.style.setProperty("--line", String(lineFade));
        const point = pulse.path.getPointAtLength(progress * pulse.length);
        pulse.spark.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
      }
      // The rock flares when the signal arrives and glows while it sends it on.
      const sendEnd = legs[2].start + 200;
      const flare = Math.exp(-(((time - arrive - 120) / 260) ** 2));
      const hold = envelope(time, arrive - 80, sendEnd + 900, 200, 900);
      const sending = Math.max(...legs.map(leg => Math.exp(-(((time - leg.start) / 160) ** 2))));
      rock.style.opacity = String(Math.min(1, .55 * hold + .45 * flare + .25 * sending));
      const glowing: Feature[] = [];
      for (const leg of legs) {
        const landed = leg.start + leg.duration;
        const glow = envelope(time, landed - 60, landed + lit, 160, 600);
        doors[leg.id].style.opacity = String(glow);
        if (time >= landed - 40 && time <= landed + lit) glowing.push(leg.id);
      }
      const key = glowing.join(" ");
      if (key !== lastLit) { lastLit = key; light.current?.(glowing); }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); light.current?.([]); };
  }, [active]);

  const blur = (name: string, deviation: number) => <filter id={`${id}-${name}`} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={deviation} /></filter>;
  const pulse = (name: string, path: string) => <g key={name} data-pulse={name} className="mc-signal-pulse">
    <path d={path} className="mc-signal-line" pathLength="1" filter={`url(#${id}-soft)`} />
    <path d={path} className="mc-signal-tail" pathLength="1" filter={`url(#${id}-wide)`} style={{ strokeDasharray: `${tail} 2` }} />
    <path d={path} className="mc-signal-glow" pathLength="1" filter={`url(#${id}-soft)`} style={{ strokeDasharray: `${tail * .6} 2` }} />
    <path d={path} className="mc-signal-core" pathLength="1" style={{ strokeDasharray: `${head} 2` }} />
    <g className="mc-signal-spark"><circle r="15" className="mc-signal-spark-halo" filter={`url(#${id}-wide)`} /><circle r="4.5" className="mc-signal-spark-core" /></g>
  </g>;
  return <svg ref={svg} className="mc-signal" viewBox="0 0 1672 941" aria-hidden="true" focusable="false" data-active={active}>
    <defs>{blur("soft", 2.5)}{blur("wide", 7)}{blur("halo", 16)}</defs>
    {routes.map(route => <g key={route.id} data-door={route.id} className="mc-signal-door">
      <ellipse cx={route.door[0]} cy={route.door[1]} rx="46" ry="18" filter={`url(#${id}-halo)`} />
      <ellipse cx={route.door[0]} cy={route.door[1]} rx="12" ry="5" className="mc-signal-door-core" filter={`url(#${id}-soft)`} />
    </g>)}
    <g className="mc-signal-rock">
      <ellipse cx="1022" cy="598" rx="100" ry="24" className="mc-signal-rock-floor" filter={`url(#${id}-halo)`} />
      <ellipse cx="1021" cy="552" rx="62" ry="58" className="mc-signal-rock-halo" filter={`url(#${id}-halo)`} />
      <ellipse cx="1018" cy="556" rx="21" ry="25" className="mc-signal-rock-mark" filter={`url(#${id}-wide)`} />
    </g>
    {pulse("courtyard", courtyard)}
    {routes.map(route => pulse(route.id, route.path))}
  </svg>;
}
