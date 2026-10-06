"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Icon from "@/components/Icon";
import { site } from "@/lib/site";
import type { CampusRenderer } from "./campus-scene";
import "./campus-hero.css";

const stages = [
  { label: "Campus overview", kicker: "ASPIO STAFF APP", first: "Different branches.", second: "One connected team.", body: "Explore how attendance, team conversations and staff records work together." },
  { label: "Attendance", kicker: "01 / ATTENDANCE", first: "Every check-in.", second: "In one place.", body: "See attendance across your branches in one shared workspace.", href: "/services#attendance", link: "Explore attendance" },
  { label: "Team communication", kicker: "02 / TEAM COMMUNICATION", first: "Keep conversations", second: "with your team.", body: "A shared place for team updates and everyday conversations.", href: "/services#chat", link: "Explore team communication" },
  { label: "Staff records", kicker: "03 / STAFF RECORDS", first: "Staff information.", second: "Kept together.", body: "Keep staff records and attendance together for payroll preparation.", href: "/services#workspace", link: "Explore staff records" },
  { label: "Connected campus", kicker: "ONE CONNECTED WORKSPACE", first: "Different branches.", second: "One connected team.", body: "Attendance, team conversations and staff records, connected through Aspio." },
];
const features = ["Attendance", "Team communication", "Staff records"];
const mqSubscribe = (query: string) => (callback: () => void) => { const media = matchMedia(query); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); };
const subscribeMobile = mqSubscribe("(max-width: 700px)"), subscribeReduced = mqSubscribe("(prefers-reduced-motion: reduce)");
const mobileSnapshot = () => matchMedia("(max-width: 700px)").matches;
const reducedSnapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function ProductExample({ stage }: { stage: number }) {
  if (stage === 1) return <div className="campus-example"><header>Today’s attendance <span>Example data</span></header><div className="campus-attendance-row"><span className="campus-avatar">S</span><b>Sara</b><span className="campus-presence" /> Checked in 08:30</div><div className="campus-attendance-row"><span className="campus-avatar campus-avatar-dark">D</span><b>Daniel</b><span className="campus-presence" /> Checked in 08:42</div></div>;
  if (stage === 2) return <div className="campus-example"><header>Team updates <span>Example conversation</span></header><div className="campus-message"><span className="campus-avatar">S</span><div><b>Sara <time>09:14</time></b><p>Tomorrow’s meeting starts at 10:00.</p></div></div><div className="campus-message"><span className="campus-avatar campus-avatar-dark">D</span><div><b>Daniel <time>09:16</time></b><p>Got it. See you there.</p></div></div></div>;
  if (stage === 3) return <div className="campus-example campus-record"><header>Staff record <span>Example data</span></header><div className="campus-record-person"><span className="campus-avatar">S</span><b>Sara</b><span>Operations</span></div><details><summary><Icon name="users" size={17} /> Personal details <Icon name="chevron" size={15} /></summary><p>Team: Operations · Branch: Bole<br />Role: Team member</p></details><details><summary><Icon name="calendar" size={17} /> Attendance history <Icon name="chevron" size={15} /></summary><p>Sample check-in: 08:30<br />App and supported biometric records in one place.</p></details></div>;
  return null;
}

export default function CampusHero() {
  const compact = useSyncExternalStore(subscribeMobile, mobileSnapshot, () => false);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, () => true);
  const [stage, setStage] = useState(0), [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [still, setStill] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const wrapper = useRef<HTMLElement>(null), host = useRef<HTMLDivElement>(null), copy = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLButtonElement[]>([]), engine = useRef<CampusRenderer | null>(null);
  const progress = useRef(0), destination = useRef(0), lastStage = useRef(0), clickFrame = useRef(0);
  const selectRef = useRef<(index: number) => void>(() => {});
  const scrollJourney = !compact && !reduced && !failed;

  function select(index: number) {
    cancelAnimationFrame(clickFrame.current);
    destination.current = index;
    setAnnouncement(stages[index].label);
    if (!scrollJourney) { setStage(index); lastStage.current = index; return; }
    if (!wrapper.current) return;
    const sectionTop = wrapper.current.getBoundingClientRect().top + scrollY;
    const step = (wrapper.current.offsetHeight - innerHeight) / 4;
    const from = scrollY, to = sectionTop + index * step, start = performance.now();
    if (still) { window.scrollTo({ top: to, behavior: "instant" }); return; }
    const travel = (now: number) => {
      const t = Math.min(1, (now - start) / 1400), ease = t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      window.scrollTo({ top: from + (to - from) * ease, behavior: "instant" });
      if (t < 1) clickFrame.current = requestAnimationFrame(travel); else clickFrame.current = 0;
    };
    clickFrame.current = requestAnimationFrame(travel);
  }
  useEffect(() => { selectRef.current = select; });
  useEffect(() => {
    let cancelled = false;
    import("./campus-scene").then(({ createCampus }) => {
      if (cancelled || !host.current) return;
      try { engine.current = createCampus(host.current, labels.current, i => selectRef.current(i), () => setReady(true), () => setFailed(true)); }
      catch { setFailed(true); }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; engine.current?.dispose(); engine.current = null; cancelAnimationFrame(clickFrame.current); };
  }, []);
  useEffect(() => {
    let frame = 0, visible = true, previous = performance.now();
    const updateScroll = () => {
      if (!scrollJourney || !wrapper.current) return;
      const top = wrapper.current.getBoundingClientRect().top + scrollY;
      const step = Math.max(1, (wrapper.current.offsetHeight - innerHeight) / 4);
      destination.current = Math.min(4, Math.max(0, (scrollY - top) / step));
    };
    const tick = (now: number) => {
      const dt = Math.min(.08, (now - previous) / 1000); previous = now;
      if (scrollJourney || reduced || still) progress.current = destination.current;
      else progress.current += (destination.current - progress.current) * (1 - Math.exp(-dt * 11));
      if (Math.abs(progress.current - destination.current) < .001) progress.current = destination.current;
      const next = Math.round(progress.current);
      if (next !== lastStage.current) { lastStage.current = next; setStage(next); }
      const opacity = reduced || still ? 1 : Math.max(.06, 1 - Math.abs(progress.current - next) * 2.3);
      if (copy.current) { copy.current.style.opacity = String(opacity); copy.current.style.transform = `translateY(${(1 - opacity) * 12}px)`; }
      if (host.current) host.current.dataset.progress = progress.current.toFixed(3);
      engine.current?.update(progress.current, reduced || still);
      if (visible) frame = requestAnimationFrame(tick); else frame = 0;
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !frame) { previous = performance.now(); frame = requestAnimationFrame(tick); } }, { threshold: 0 });
    if (host.current) observer.observe(host.current);
    const interrupt = () => { cancelAnimationFrame(clickFrame.current); clickFrame.current = 0; };
    const interruptKey = (event: KeyboardEvent) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) interrupt(); };
    window.addEventListener("scroll", updateScroll, { passive: true }); window.addEventListener("resize", updateScroll);
    window.addEventListener("wheel", interrupt, { passive: true }); window.addEventListener("touchstart", interrupt, { passive: true }); window.addEventListener("keydown", interruptKey);
    updateScroll(); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", updateScroll); window.removeEventListener("resize", updateScroll); window.removeEventListener("wheel", interrupt); window.removeEventListener("touchstart", interrupt); window.removeEventListener("keydown", interruptKey); };
  }, [scrollJourney, reduced, still]);

  const current = stages[stage], overview = stage === 0 || stage === 4;
  return <section ref={wrapper} className={`campus-journey${scrollJourney ? " is-scroll-journey" : " is-tab-journey"}`} aria-labelledby="campus-title" data-stage={stage} data-ready={ready} data-motion={reduced || still ? "still" : "travel"}>
    <div className="campus-pin">
      <div className="campus-render" ref={host} />
      {!ready && !failed && <div className="campus-loading" role="status"><span /> Preparing your campus…</div>}
      {failed && <div className="campus-unavailable"><Icon name="building" size={26} /><p>The 3D preview isn’t available in this browser.</p><span>You can still explore every feature below.</span></div>}
      <div className="campus-labels" role="group" aria-label="Choose a campus building">{features.map((name, i) => <button key={name} ref={node => { if (node) labels.current[i] = node; }} className="campus-label" data-shown={ready && !failed && (overview || stage === i + 1)} aria-label={`Explore ${name} building`} aria-pressed={stage === i + 1} onClick={() => select(i + 1)} onPointerEnter={() => engine.current?.highlight(i + 1)} onPointerLeave={() => engine.current?.highlight(-1)}><span>{stage === 4 ? <Icon name="check" size={15} /> : String(i + 1).padStart(2, "0")}</span>{name}<i aria-hidden="true" /></button>)}</div>
      <div className="campus-copy" ref={copy}>
        <span className="campus-kicker">{current.kicker}</span>
        <h1 id="campus-title">{current.first}<br /><em>{current.second}</em></h1>
        <p className="campus-description">{current.body}</p>
        {overview ? <div className="campus-actions"><Link href={site.demo} className="hr-button">Request a demo <span><Icon name="arrow" size={20} /></span></Link>{stage === 4 && <button className="campus-again" onClick={() => select(0)}>Explore again <Icon name="arrow" size={17} /></button>}</div> : <><ProductExample stage={stage} /><Link href={current.href!} className="campus-feature-link">{current.link} <Icon name="arrow" size={18} /></Link></>}
      </div>
      <div className="campus-toolbar">
        <button className="campus-back" onClick={() => select(0)} disabled={stage === 0}><span aria-hidden="true">←</span> Back to overview</button>
        <div className="campus-feature-controls" role="group" aria-label="Campus features" onKeyDown={event => { if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return; const buttons = Array.from(event.currentTarget.querySelectorAll("button")); const index = buttons.indexOf(document.activeElement as HTMLButtonElement); const next = (index + (event.key === "ArrowRight" ? 1 : -1) + 3) % 3; event.preventDefault(); buttons[next].focus(); select(next + 1); }}>{features.map((name, i) => <button key={name} aria-pressed={stage === i + 1} onClick={() => select(i + 1)}><span>{String(i + 1).padStart(2, "0")}</span>{name}</button>)}</div>
        {stage < 4 ? <button className="campus-next" onClick={() => select(stage + 1)}>{stage === 0 ? "Start exploring" : stage === 3 ? "See the connected campus" : `Next: ${stages[stage + 1].label}`} <Icon name="arrow" size={17} /></button> : <a className="campus-next" href="#workspace">Explore more <Icon name="arrow" size={17} /></a>}
      </div>
      <div className="campus-progress"><span>{String(stage + 1).padStart(2, "0")} / 05</span><div role="group" aria-label="Camera journey stages">{stages.map((s, i) => <button key={s.label} aria-label={s.label} aria-pressed={stage === i} onClick={() => select(i)}><span /></button>)}</div><button className="campus-motion" disabled={reduced} aria-label={reduced ? "Reduced motion enabled" : still ? "Enable smooth camera travel" : "Use still camera positions"} onClick={() => setStill(!still)} title={reduced ? "Respects your reduced-motion preference" : "Switch between smooth travel and still camera positions"}><Icon name={reduced || still ? "pin" : "org"} size={16} /></button></div>
      <div className="campus-instruction">{failed ? "Choose a feature to explore" : overview ? stage === 4 ? "Keep scrolling to explore more" : compact || reduced ? "Choose a building or feature to explore" : "Click a building or scroll to explore" : "One campus. One connected workday."}<span aria-hidden="true">⌄</span></div>
      <div className="visually-hidden" role="status" aria-live="polite">{announcement}</div>
    </div>
  </section>;
}
