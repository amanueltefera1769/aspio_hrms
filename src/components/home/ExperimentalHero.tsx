"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { site } from "@/lib/site";
import "./experimental-hero.css";

const chapters: { id: string; label: string; icon: IconName; signal: string; title: string; body: string; x: number; y: number }[] = [
  { id: "attendance", label: "Attendance", icon: "clock", signal: "Check-in, connected", title: "A good day starts here.", body: "App check-in or a supported biometric device. Bring attendance into the same workspace as your people.", x: 24, y: 48 },
  { id: "chat", label: "Conversations", icon: "chat", signal: "The team, in conversation", title: "Keep the conversation close.", body: "Direct messages and group chats keep your people connected, wherever the workday takes them.", x: 53, y: 29 },
  { id: "payroll", label: "Payroll prep", icon: "file", signal: "Records, ready for review", title: "A calmer month-end.", body: "Staff records and attendance together. An organized starting point for payroll preparation, not another spreadsheet chase.", x: 85, y: 54 },
  { id: "reports", label: "Reports", icon: "chart", signal: "The bigger picture, clearer", title: "See the whole workday.", body: "Turn organized staff and attendance records into a clearer picture of your team and your branches.", x: 66, y: 48 },
  { id: "branches", label: "Branches", icon: "building", signal: "Every branch, together", title: "One team. Many places.", body: "Give every location its place while keeping a shared view of the wider business. One connected HR workspace.", x: 19, y: 19 },
];
const paths = [
  "M0 244 L340 132 Q350 128 369 134 L525 188 Q580 208 532 227 L189 354 Q156 367 176 381 L257 445 Q275 460 326 471 L481 502",
  "M481 502 L956 725 Q984 739 1007 728 L1183 642 Q1205 633 1192 620 L1035 543",
  "M1007 728 Q1032 737 1056 724 L1289 612 Q1310 601 1326 612 L1672 814",
  "M1190 210 L1260 243 Q1276 252 1300 242 L1672 98",
  "M481 502 Q495 493 511 481 L759 397",
];
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function motionSnapshot() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

export default function ExperimentalHero() {
  const [selected, setSelected] = useState(0);
  const [requestedMotion, setRequestedMotion] = useState(true);
  const [inView, setInView] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const reducedMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true);
  const scene = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const playing = requestedMotion && !reducedMotion && inView;
  const chapter = chapters[selected];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    if (hero.current) observer.observe(hero.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setSelected((current) => (current + 1) % chapters.length), 7200);
    return () => window.clearInterval(timer);
  }, [playing, selected]);

  function selectChapter(index: number) {
    setSelected(index);
    // Manual exploration stays put; Play resumes the guided tour.
    setRequestedMotion(false);
    setAnnouncement(`${chapters[index].label}: ${chapters[index].title}`);
  }

  return <section className="lab-hero" ref={hero} aria-labelledby="lab-title" data-playing={playing} data-feature={chapter.id}
    onPointerMove={(event) => {
      if (!playing || event.pointerType !== "mouse") return;
      const bounds = event.currentTarget.getBoundingClientRect();
      scene.current?.style.setProperty("--pan-x", `${(event.clientX / bounds.width - 0.5) * -10}px`);
      scene.current?.style.setProperty("--pan-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * -8}px`);
    }}
    onPointerLeave={() => { scene.current?.style.setProperty("--pan-x", "0px"); scene.current?.style.setProperty("--pan-y", "0px"); }}>
    <div className="lab-world-position"><div className="lab-world" ref={scene}><div className="lab-camera">
      <Image className="lab-render" src="/images/connected-workplace.webp" alt="A miniature connected workplace: branch offices, an open-plan headquarters, an app check-in kiosk and a records pavilion linked by purple paths." fill sizes="(max-width: 1350px) 1350px, 100vw" preload />
      <svg className="lab-network" viewBox="0 0 1672 941" fill="none" aria-hidden="true">
        {paths.map((path, index) => <g key={path}><path className="lab-path-glow" d={path} /><path className="lab-path-signal" d={path} style={{ "--path-delay": `${index * -1.8}s` } as CSSProperties} /></g>)}
      </svg>
      <div className="lab-pins" role="group" aria-label="Explore capabilities in the workplace">
        {chapters.map((item, index) => <button key={item.id} className={`lab-pin lab-pin-${item.id}`} style={{ left: `${item.x}%`, top: `${item.y}%`, "--float-delay": `${index * -0.8}s` } as CSSProperties}
          aria-label={`Explore ${item.label}`} aria-pressed={selected === index} aria-controls="lab-feature-detail" onClick={() => selectChapter(index)}>
          <span className="lab-pin-icon"><Icon name={item.icon} size={17} /></span><span className="lab-pin-text">{item.signal}</span><span className="lab-pin-dot" aria-hidden="true" />
        </button>)}
      </div>
    </div></div></div>
    <div className="lab-atmosphere" aria-hidden="true" />
    <div className="lab-scene-note"><span /> A connected workday, imagined <span className="lab-note-divider">/</span> Explore the scene</div>
    <div className="lab-mobile-signal" aria-hidden="true"><span><Icon name={chapter.icon} size={15} /></span>{chapter.signal}<Icon name="check" size={14} /></div>
    <div className="lab-content hr-wrap">
      <div className="lab-copy"><span className="lab-eyebrow"><span><Icon name="org" size={14} /></span> THE HUMAN SIDE OF EVERY WORKDAY</span>
        <h1 id="lab-title">The whole workday.<br /><em>Moving together.</em></h1>
        <p>Your people, conversations and every branch. <br />Not scattered. Connected with Aspio HR.</p>
        <a className="lab-explore" href="#workspace">Step inside the workspace <Icon name="arrow" size={17} /></a>
      </div>
      <div className="lab-story">
        <div className="lab-feature-detail" id="lab-feature-detail" aria-label="Selected capability">
          <div className="lab-feature-heading"><span>{String(selected + 1).padStart(2, "0")} / {chapter.label}</span><Icon name={chapter.icon} size={19} /></div>
          <h2>{chapter.title}</h2><p>{chapter.body}</p><Link href={`/services#${chapter.id}`}>Explore {chapter.label.toLowerCase()} <Icon name="arrowUp" size={14} /></Link>
        </div>
        <Link className="lab-demo" href={site.demo}><span className="lab-demo-icon"><Icon name="arrowUp" size={25} /></span><span><b>Bring your team together.</b><small>Let’s explore it in a demo.</small></span><span className="lab-demo-arrow" aria-hidden="true">↗</span></Link>
      </div>
    </div>
    <div className="lab-tour-bar"><div className="hr-wrap lab-tour-inner"><span className="lab-tour-label">EXPLORE THE CONNECTIONS</span>
      <div className="lab-chapters" role="group" aria-label="Workplace tour chapters">{chapters.map((item, index) => <button key={item.id} aria-pressed={index === selected} aria-controls="lab-feature-detail" onClick={() => selectChapter(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}<i key={`${selected}-${playing}`} aria-hidden="true" /></button>)}</div>
      <button className="lab-motion" onClick={() => setRequestedMotion((value) => !value)} disabled={reducedMotion} aria-label={reducedMotion ? "Motion reduced by your preference" : playing ? "Pause scene motion" : "Play scene motion"} title={reducedMotion ? "Respects your device’s reduced-motion preference" : playing ? "Pause the scene and guided tour" : "Resume the scene and guided tour"}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{playing ? <path d="M4 3h3v10H4zm5 0h3v10H9z" /> : <path d="m5 3 8 5-8 5z" />}</svg><span>{reducedMotion ? "Motion off" : playing ? "Pause" : "Play"}</span>
      </button>
    </div></div>
    <div className="visually-hidden" role="status" aria-live="polite">{announcement}</div>
  </section>;
}
