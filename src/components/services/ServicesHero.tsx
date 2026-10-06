"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/Icon";
import "./services-hero.css";

const views = [
  { id: "workspace", label: "People", icon: "users", title: "Your people, together.", detail: "Staff records with a place to belong." },
  { id: "attendance", label: "Attendance", icon: "clock", title: "A clear start to the day.", detail: "App and biometric check-ins, connected." },
  { id: "reports", label: "Reports", icon: "chart", title: "See the bigger picture.", detail: "Your team’s activity, ready to review." },
] as const;

export default function ServicesHero() {
  const [selected, setSelected] = useState(0);
  const view = views[selected];
  return <div className="svc-system-scene">
    <div className="svc-scene-orbit" aria-hidden="true" />
    <div className="svc-scene-topline"><span><i /> PEOPLE. WORK. CONNECTED.</span><span>ASPIO HR</span></div>
    <div className="svc-system-window">
      <header><div><Image src="/images/aspio-logo.webp" width={94} height={36} alt="Aspio" /><span>HR</span></div></header>
      <div className="svc-scene-controls" aria-label="Preview workspace capabilities">{views.map((item, index) => <button key={item.id} aria-pressed={selected === index} aria-controls="service-hero-preview" onClick={() => setSelected(index)}><Icon name={item.icon} size={17} />{item.label}</button>)}</div>
      <div id="service-hero-preview" className="svc-scene-panel" aria-live="polite">
        <span className="svc-scene-eyebrow">ONE SHARED WORKSPACE</span><h2>{view.title}</h2>
        {selected === 0 ? <div className="svc-scene-people">{[["LB", "Liya Bekele", "Operations", "Bole"], ["DA", "Dawit Alemu", "Team lead", "Kazanchis"], ["HT", "Hana Tadesse", "Customer care", "Piassa"]].map(([initials, name, role, branch], index) => <div key={name}><span className={`hr-avatar hr-avatar-${["lilac", "peach", "mint"][index]}`}>{initials}</span><div><b>{name}</b><small>{role}</small></div><span>{branch}</span></div>)}</div> : selected === 1 ? <div className="svc-scene-attendance"><div><Icon name="clock" size={26} /><span>START OF THE WORKDAY</span><b>08:30</b></div><div><span><Icon name="check" size={25} /></span><b>Checked in</b><small>Liya Bekele · Bole branch</small><span className="svc-scene-method">App or biometric</span></div></div> : <div className="svc-scene-report"><span>TEAM ATTENDANCE / EXAMPLE WEEK</span><div role="img" aria-label="Illustrative weekly attendance chart">{[52, 70, 60, 95, 81].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><span>{["M", "T", "W", "T", "F"][index]}</span></div>)}</div></div>}
        <footer><span>{view.detail}</span><a href={`#${view.id}`} aria-label={`Explore ${view.label.toLowerCase()}`}>Explore <Icon name="arrow" size={15} /></a></footer>
      </div>
    </div>
    <div className="svc-scene-message"><span><Icon name="chat" size={22} /></span><div><small>HR TEAM / GROUP CHAT</small><b>Let’s get the team together.</b><span>Conversations stay close to the work.</span></div></div>
    <div className="svc-scene-branches"><Icon name="building" size={20} /><div><b>Every branch.</b><span>One connected team.</span></div><span><i /><i /><i /></span></div>
    <div className="svc-scene-caption">Interactive workspace illustration · Example data</div>
  </div>;
}
