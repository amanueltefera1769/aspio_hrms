"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { site } from "@/lib/site";
import { overview, sequences, sequenceFrames, sequenceDuration, decodeSequence, restTransform, depthParams, sequenceCut, type Feature, type Scene } from "./campus-sequence";
import { createDepthLayer, type DepthLayer } from "./campus-depth";
import CampusSignal from "./CampusSignal";
import "./motion-campus.css";

type Leg = { from: Scene; to: Scene; forward: boolean; animations: Animation[] };
type FeatureInfo = {
  number: string; label: string; short: string; title: [string, string]; description: string;
  href: string; explore: string; replay: string; replayLabel: string; arriving: string;
  image: string; position: string;
  receipt: [string, string]; receiptIcon: IconName;
};

const order: Feature[] = ["attendance", "team", "records"];
const scenes: Scene[] = ["overview", ...order];
const intermediates = order.flatMap(feature => sequences[feature].slice(1, -1));
const planeIds = [...scenes, ...intermediates.map(frame => frame.id)];

// Stable endpoint copy and live product examples are kept separate from the camera timeline.
const features: Record<Feature, FeatureInfo> = {
  attendance: {
    number: "01", label: "Attendance", short: "Attendance", title: ["Every check-in.", "In one place."],
    description: "See attendance across your branches in one shared workspace.",
    href: "/services#attendance", explore: "Explore attendance", replay: "Replay check-in", replayLabel: "Replay example check-in",
    arriving: "A closer look at attendance",
    image: sequences.attendance.at(-1)!.src, position: "50% 50%", receipt: ["Attendance recorded", "App check-in · Example"], receiptIcon: "check",
  },
  team: {
    number: "02", label: "Team communication", short: "Team", title: ["Keep conversations", "with your team."],
    description: "A shared place for team updates and everyday conversations.",
    href: "/services#chat", explore: "Explore team communication", replay: "Replay conversation", replayLabel: "Replay example conversation",
    arriving: "A closer look at team communication",
    image: sequences.team.at(-1)!.src, position: "50% 50%", receipt: ["Update shared with the team", "Group chat · Example"], receiptIcon: "chat",
  },
  records: {
    number: "03", label: "Staff records", short: "Records", title: ["Staff information.", "Kept together."],
    description: "Keep staff records and attendance together for payroll preparation.",
    href: "/services#payroll", explore: "Explore staff records", replay: "Replay record", replayLabel: "Replay example staff record",
    arriving: "A closer look at staff records",
    image: sequences.records.at(-1)!.src, position: "50% 50%", receipt: ["Organized for payroll preparation", "Record and attendance · Example"], receiptIcon: "file",
  },
};

const subscribeReduced = (callback: () => void) => {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const reducedSnapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;


function AttendanceExample({ motion }: { motion: boolean }) {
  return <div className="mc-example" data-animate={motion}>
    <header><b>Today’s attendance</b><span>Example data</span></header>
    <div className="mc-staff-row"><span className="mc-avatar">S</span><b>Sara</b><span className="mc-staff-result"><i /> Checked in <time>08:30</time></span></div>
    <div className="mc-staff-row"><span className="mc-avatar mc-avatar-neutral">D</span><b>Daniel</b><span className="mc-staff-result"><i /> Checked in <time>08:42</time></span></div>
    <footer><Icon name="check" size={15} /><span>App or supported biometric device.<br /><b>One attendance record.</b></span></footer>
  </div>;
}

function TeamExample({ motion }: { motion: boolean }) {
  return <div className="mc-example mc-chat" data-animate={motion}>
    <header><b>Team updates</b><span>Example conversation</span></header>
    <ol>
      <li className="mc-message"><span className="mc-avatar">S</span><div><p><b>Sara</b><time>9:14 AM</time></p><p className="mc-message-text">Tomorrow’s meeting starts at 10:00.</p></div></li>
      <li className="mc-message mc-message-reply"><span className="mc-avatar mc-avatar-neutral">D</span><div><p><b>Daniel</b><time>9:16 AM</time></p><p className="mc-message-text">Got it. See you there.</p><span className="mc-typing" aria-hidden="true"><i /><i /><i /></span></div></li>
    </ol>
    <footer><Icon name="chat" size={15} /><span>Direct messages and group chats.<br /><b>One team workspace.</b></span></footer>
  </div>;
}

const week = [["Mon", "08:30"], ["Tue", "08:27"], ["Wed", "08:34"], ["Thu", "08:29"], ["Fri", "08:31"]];
function RecordsExample({ motion }: { motion: boolean }) {
  const [open, setOpen] = useState<"details" | "attendance" | null>("attendance");
  const toggle = (row: "details" | "attendance") => setOpen(value => value === row ? null : row);
  return <div className="mc-example mc-record" data-animate={motion}>
    <div className="mc-record-rail" aria-hidden="true"><span className="mc-mark" /></div>
    <div className="mc-record-body">
      <header><b>Staff record</b><span>Example data</span></header>
      <div className="mc-record-person"><span className="mc-avatar">S</span><div><b>Sara</b><small>Front desk · Bole branch</small></div></div>
      <div className="mc-record-row">
        <button aria-expanded={open === "details"} aria-controls="mc-record-details" onClick={() => toggle("details")}><Icon name="users" size={16} /> Personal details <Icon name="chevron" size={15} /></button>
        <dl id="mc-record-details" hidden={open !== "details"}><div><dt>Role</dt><dd>Front desk</dd></div><div><dt>Branch</dt><dd>Bole</dd></div><div><dt>Started</dt><dd>March 2024</dd></div></dl>
      </div>
      <div className="mc-record-row">
        <button aria-expanded={open === "attendance"} aria-controls="mc-record-attendance" onClick={() => toggle("attendance")}><Icon name="calendar" size={16} /> Attendance history <Icon name="chevron" size={15} /></button>
        <div id="mc-record-attendance" hidden={open !== "attendance"}>
          <ol className="mc-week" aria-label="This week’s check-ins">{week.map(([day, time]) => <li key={day}><span>{day}</span><i aria-hidden="true" /><time>{time}</time></li>)}</ol>
          <p><Icon name="check" size={13} /> Kept with Sara’s record for payroll preparation</p>
        </div>
      </div>
    </div>
  </div>;
}

const examples: Record<Feature, (props: { motion: boolean }) => ReactNode> = { attendance: AttendanceExample, team: TeamExample, records: RecordsExample };

export default function MotionCampusHero() {
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, () => true);
  const [view, setView] = useState<Scene>("overview");
  const [target, setTarget] = useState<Scene>("overview");
  const [travelling, setTravelling] = useState(false);
  const [motionOff, setMotionOff] = useState(false);
  const [loaded, setLoaded] = useState<Scene[]>([]);
  const [failed, setFailed] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const [warmRoutes, setWarmRoutes] = useState<Feature[]>([]);
  const [visited, setVisited] = useState<Feature[]>([]);
  const [replay, setReplay] = useState(0);
  // The copy follows the picture: it switches at the cut, not when the move settles.
  const [copyView, setCopyView] = useState<Scene>("overview");
  const [copyHidden, setCopyHidden] = useState(false);
  const copyRef = useRef<Scene>("overview");
  const copyHiddenRef = useRef(false);
  const [announcement, setAnnouncement] = useState("");
  const hero = useRef<HTMLElement>(null);
  const planes = useRef<Record<string, HTMLDivElement | null>>({});
  const canvases = useRef<Partial<Record<Scene, HTMLCanvasElement | null>>>({});
  const layers = useRef<Partial<Record<Scene, DepthLayer>>>({});
  const frameRequest = useRef(0);
  const readyRoutes = useRef(new Set<Feature>());
  const request = useRef(0);
  const leg = useRef<Leg | null>(null);
  const scene = useRef<Scene>("overview");
  const destination = useRef<Scene>("overview");
  const instantRef = useRef(true);
  const mounted = useRef(true);
  const still = reduced || motionOff;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; leg.current?.animations.forEach(animation => animation.cancel()); };
  }, []);
  // Depth layers load once the scene is ready; they only draw while a move is running.
  const ready = loaded.length === scenes.length;
  useEffect(() => {
    if (!ready || reduced) return;
    let cancelled = false;
    const created = layers.current;
    for (const plane of scenes) {
      const canvas = canvases.current[plane];
      const frame = plane === "overview" ? overview : sequences[plane].at(-1)!;
      if (!canvas || created[plane]) continue;
      createDepthLayer(canvas, frame.src, frame.depth).then(layer => {
        if (!layer) return;
        if (cancelled) layer.dispose(); else created[plane] = layer;
      }).catch(() => undefined); // without depth, the plain pictures still move
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRequest.current);
      Object.values(created).forEach(layer => layer?.dispose());
      layers.current = {};
    };
  }, [ready, reduced]);
  useEffect(() => {
    instantRef.current = still || failed;
    // Jump the running leg to its end; finishLeg then settles on the destination without motion.
    if (instantRef.current && leg.current?.animations[0].playState === "running") leg.current.animations.forEach(animation => animation.finish());
  }, [still, failed]);

  // The campus signal lights a building as it lands, using the hover styles.
  const lightBuildings = useCallback((buildings: Feature[]) => {
    if (hero.current) hero.current.dataset.signalLit = buildings.join(" ");
  }, []);

  function revealCopy(next: Scene) {
    if (copyRef.current !== next) { copyRef.current = next; setCopyView(next); }
    if (copyHiddenRef.current) { copyHiddenRef.current = false; setCopyHidden(false); }
  }

  function cancelLeg() {
    leg.current?.animations.forEach(animation => animation.cancel());
    leg.current = null;
  }

  function settle(next: Scene, instant = false) {
    if (!mounted.current) return;
    if (instant) request.current += 1;
    scene.current = next;
    destination.current = next;
    // Update the base-style hook before any cancel, so no frame shows the previous scene.
    if (hero.current) hero.current.dataset.view = next;
    cancelLeg();
    setPreparing(false);
    setView(next);
    setTarget(next);
    setTravelling(false);
    revealCopy(next);
    if (next === "overview") setAnnouncement("Campus overview. Choose a building to explore.");
    else {
      setVisited(value => value.includes(next) ? value : [...value, next]);
      setAnnouncement(`${features[next].label}. ${features[next].title.join(" ")}`);
    }
  }

  function startLeg(from: Scene, to: Scene) {
    const reverse = to === "overview";
    const start = reverse ? "overview" : from;
    const end = (reverse ? from : to) as Feature;
    const route = sequences[end];
    const duration = sequenceDuration(route);
    const animations = planeIds.flatMap(plane => {
      const element = planes.current[plane];
      return element ? [element.animate(sequenceFrames(plane, route), { duration, fill: "both" })] : [];
    });
    leg.current?.animations.forEach(animation => animation.cancel());
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = reverse ? duration : 0;
      animation.playbackRate = reverse ? -1 : 1;
    }
    animations[0].onfinish = finishLeg;
    leg.current = { from: start, to: end, forward: !reverse, animations };
    animations.forEach(animation => animation.play());
    setTravelling(true);
    if (!copyHiddenRef.current) { copyHiddenRef.current = true; setCopyHidden(true); }
    cancelAnimationFrame(frameRequest.current);
    frameRequest.current = requestAnimationFrame(drawDepth);
  }

  // Follow the running leg's clock, so reversals and retargets stay in step.
  function drawDepth() {
    const current = leg.current;
    if (!current) return;
    const route = sequences[current.to as Feature];
    const timing = current.animations[0];
    const time = Number(timing.currentTime ?? 0) / Number(timing.effect?.getComputedTiming().duration ?? 1);
    const side = time >= sequenceCut ? current.to : "overview";
    if (side !== copyRef.current) revealCopy(side);
    layers.current.overview?.draw(depthParams(route, 0, time));
    layers.current[current.to]?.draw(depthParams(route, 1, time));
    if (timing.playState === "running") frameRequest.current = requestAnimationFrame(drawDepth);
  }

  function advance() {
    const from = scene.current, to = destination.current;
    if (from === to) settle(to);
    else if (instantRef.current || !planes.current.overview?.animate) settle(to, true);
    else if (to !== "overview" && !readyRoutes.current.has(to)) return;
    else if (from !== "overview" && to !== "overview") startLeg(from, "overview");
    else startLeg(from, to);
  }

  function finishLeg() {
    const current = leg.current;
    if (!current || !mounted.current) return;
    scene.current = current.forward ? current.to : current.from;
    advance();
  }

  async function select(next: Scene) {
    const ticket = ++request.current;
    destination.current = next;
    setTarget(next);
    setSequenceError("");
    if (instantRef.current) { settle(next, true); return; }
    if (next !== "overview" && !readyRoutes.current.has(next)) {
      setPreparing(true);
      setTravelling(true);
      setWarmRoutes(value => value.includes(next) ? value : [...value, next]);
      try {
        await decodeSequence(sequences[next]);
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        readyRoutes.current.add(next);
      } catch {
        if (mounted.current && ticket === request.current) {
          settle(next, true);
          setSequenceError("The camera sequence couldn’t load. Showing the feature without motion; choose it again to retry.");
        }
        return;
      }
      if (!mounted.current || ticket !== request.current) return;
      if (instantRef.current) { settle(next, true); return; }
    }
    setPreparing(false);
    const current = leg.current;
    if (current?.animations[0].playState === "running") {
      // Retarget mid-move: head for the requested end, or the nearer end before continuing on.
      const timing = current.animations[0];
      const progress = Number(timing.currentTime ?? 0) / Number(timing.effect?.getComputedTiming().duration ?? 1);
      current.forward = next === current.to || (next !== current.from && progress >= .5);
      current.animations.forEach(animation => { animation.playbackRate = current.forward ? 1 : -1; });
      return;
    }
    advance();
  }

  function exploreAgain() {
    setVisited([]);
    select("attendance");
  }

  const info = view === "overview" ? null : features[view];
  const copyInfo = copyView === "overview" ? null : features[copyView];
  const summary = copyView === "overview" && visited.length === order.length;
  const sceneHidden = view !== "overview" || travelling || !loaded.includes("overview") || failed;
  const nextScene: Scene | null = target === "overview" ? null : (order[order.indexOf(target) + 1] as Feature | undefined) ?? "overview";
  const Example = copyInfo ? examples[copyView as Feature] : null;
  const onLoad = (plane: Scene) => () => setLoaded(value => value.includes(plane) ? value : [...value, plane]);

  return <section ref={hero} className="mc-hero" aria-labelledby="mc-title" data-view={view} data-target={target} data-travelling={travelling} data-copy-hidden={copyHidden} data-ready={ready} data-failed={failed} data-preparing={preparing} data-motion={still ? "still" : "animated"}>
    <div className="mc-frame">
      <div className="mc-stage">
        <div className="mc-art" aria-hidden="true">
          <div className="mc-plane mc-overview" ref={element => { planes.current.overview = element; }}><Image src={overview.src} alt="" fill sizes="100vw" unoptimized preload onLoad={onLoad("overview")} onError={() => setFailed(true)} />
            <canvas className="mc-depth" ref={element => { canvases.current.overview = element; }} />
            <CampusSignal enabled={ready && !still && !travelling && view === "overview" && !failed} onLight={lightBuildings} />
          </div>
          {order.map(feature => <div key={feature} className={`mc-plane mc-closeup mc-closeup-${feature}`} style={{ transform: restTransform(sequences[feature].at(-1)!) }} ref={element => { planes.current[feature] = element; }}>
            <Image src={features[feature].image} alt="" fill sizes="100vw" unoptimized loading="eager" style={{ objectPosition: features[feature].position }} onLoad={onLoad(feature)} onError={() => setFailed(true)} />
            <canvas className="mc-depth" ref={element => { canvases.current[feature] = element; }} />
            <span className="mc-plane-chip"><b>{features[feature].number}</b> {features[feature].label}</span>
          </div>)}
          {order.filter(feature => warmRoutes.includes(feature)).flatMap(feature => sequences[feature].slice(1, -1)).map(frame => <div key={frame.id} className="mc-plane mc-keyframe" data-frame={frame.id} ref={element => { planes.current[frame.id] = element; }}>
            <Image src={frame.src} alt="" fill sizes="100vw" unoptimized loading="eager" />
          </div>)}
          <div className="mc-art-wash" />
        </div>
        <div className="mc-scene-controls" aria-label="Campus buildings" role="group" data-hidden={sceneHidden} inert={sceneHidden}>
          {order.map(feature => <button key={feature} className={`mc-building mc-building-${feature}`} tabIndex={-1} aria-label={`Explore ${features[feature].label} building`} onClick={() => select(feature)} disabled={!ready} />)}
          {/* Labels and targets share the uncropped generated master’s coordinates. */}
          {order.map(feature => {
            const explored = visited.includes(feature);
            return <button key={feature} className={`mc-label mc-label-${feature}`} aria-label={`Explore ${features[feature].label}${explored ? ", explored" : ""}`} onClick={() => select(feature)} disabled={!ready} data-visited={explored}>
              {explored && <span className="mc-label-check"><Icon name="check" size={11} /></span>}<span className="mc-label-number">{features[feature].number}</span><span className="mc-label-full">{features[feature].label}</span><span className="mc-label-short">{features[feature].short}</span>
            </button>;
          })}
        </div>
        <div className="mc-overlay">{info && !travelling && !failed && <div className="mc-receipt" key={`${view}-${replay}`} data-animate={!still}><span><Icon name={info.receiptIcon} size={19} /></span><div><b>{info.receipt[0]}</b><small>{info.receipt[1]}</small></div></div>}</div>
        {!ready && !failed && <div className="mc-loading" role="status">Preparing the campus…</div>}
        {preparing && <div className="mc-loading" role="status">Loading the camera sequence…</div>}
        {sequenceError && <div className="mc-sequence-error" role="status">{sequenceError}</div>}
        {failed && <div className="mc-image-error" role="status">The scene couldn’t load. You can still explore each feature or request a demo.</div>}
      </div>
      <noscript><p className="mc-no-script">{order.map(feature => <Link key={feature} href={features[feature].href}>{features[feature].explore} details</Link>)}</p></noscript>
      <div className="mc-copy" inert={copyHidden}>
        <span className="mc-kicker">{copyInfo ? `${copyInfo.number} / ${copyInfo.label.toUpperCase()}` : summary ? "ONE CONNECTED WORKSPACE" : "ASPIO STAFF APP"}</span>
        <h1 id="mc-title">{copyInfo ? <>{copyInfo.title[0]}<br /><em>{copyInfo.title[1]}</em></> : <>Different branches.<br />One <em>connected team.</em></>}</h1>
        <p className="mc-description">{copyInfo ? copyInfo.description : summary ? "Attendance, team conversations and staff records, connected through Aspio." : "Explore how attendance, team conversations and staff records work together."}</p>
        {copyInfo && Example ? <>
          <Example key={`${copyView}-${replay}`} motion={!still} />
          <div className="mc-detail-actions"><Link href={copyInfo.href} className="mc-service-link">{copyInfo.explore} <Icon name="arrow" size={18} /></Link><button className="mc-replay" onClick={() => setReplay(value => value + 1)} aria-label={copyInfo.replayLabel}>{copyInfo.replay} <span aria-hidden="true">↻</span></button></div>
        </> : <div className="mc-actions">
          <Link href={site.demo} className="hr-button">Request a demo <span><Icon name="arrow" size={20} /></span></Link>
          {summary ? <button className="mc-explore" onClick={exploreAgain}>Explore again</button> : <button className="mc-explore" onClick={() => select("attendance")} disabled={!ready && !failed}>Start exploring <Icon name="arrow" size={17} /></button>}
        </div>}
      </div>
      <div className="mc-scene-caption">{travelling ? target === "overview" ? "Returning to the campus" : features[target].arriving : summary ? "Keep scrolling to explore more" : "Choose a building to explore"}<span aria-hidden="true">{travelling ? "· · ·" : "↓"}</span></div>
      <div className="mc-toolbar">
        <button className="mc-back" disabled={target === "overview"} onClick={() => select("overview")}><span aria-hidden="true">←</span> Back to overview</button>
        <div className="mc-view-controls" role="group" aria-label="Campus features">
          {order.map(feature => <button key={feature} aria-pressed={target === feature} onClick={() => select(feature)} disabled={!ready && !failed}><span aria-hidden="true">{features[feature].number}</span><span className="mc-label-full">{features[feature].label}</span><span className="mc-label-short">{features[feature].short}</span></button>)}
        </div>
        <div className="mc-toolbar-end">
          {nextScene ? <button className="mc-next" onClick={() => select(nextScene)}>{nextScene === "overview" ? "See the connected campus" : <><span className="mc-next-prefix">Next: </span>{features[nextScene].label}</>} <Icon name="arrow" size={16} /></button>
            : <span className="mc-progress" role="img" aria-label={`${visited.length} of ${order.length} features explored`}>{order.map(feature => <i key={feature} data-on={visited.includes(feature)} />)}<span>{visited.length} / {order.length} explored</span></span>}
          <button className="mc-motion" onClick={() => { setMotionOff(value => !value); if (!motionOff) { instantRef.current = true; settle(destination.current, true); } }} disabled={reduced} aria-pressed={still} aria-label={reduced ? "Reduced motion enabled" : motionOff ? "Enable scene motion" : "Disable scene motion"}><Icon name="clock" size={15} /><span>{reduced ? "Reduced motion" : motionOff ? "Motion off" : "Motion on"}</span></button>
        </div>
      </div>
    </div>
    <div className="visually-hidden" role="status" aria-live="polite">{announcement}</div>
  </section>;
}
