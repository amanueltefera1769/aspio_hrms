"use client";
import { useState } from "react";
import Icon, { type IconName } from "./Icon";
const views: { id: string; label: string; icon: IconName }[] = [
  { id: "attendance", label: "Attendance", icon: "clock" },
  { id: "chat", label: "Team chat", icon: "chat" },
  { id: "reports", label: "Reports", icon: "chart" },
  { id: "branches", label: "Branches", icon: "building" },
];
const people = [
  { name: "Liya Bekele", initials: "LB", role: "Operations", time: "08:30", state: "Checked in", className: "green" },
  { name: "Dawit Alemu", initials: "DA", role: "Team lead", time: "08:42", state: "Checked in", className: "green" },
  { name: "Hana Tadesse", initials: "HT", role: "Customer care", time: "09:00", state: "On a break", className: "amber" },
];
export default function ProductPreview() {
  const [view, setView] = useState("attendance");
  return <div className="product-scene">
    <div className="scene-label"><span className="status-dot" /> YOUR PEOPLE, IN VIEW <span>ASPIO HR</span></div>
    <div className="product-window"><div className="window-bar"><div className="window-dots"><i /><i /><i /></div><span>Workspace / {views.find((item) => item.id === view)?.label}</span><span className="window-avatar">AA</span></div>
      <div className="product-layout"><aside className="product-sidebar"><b>aspio<span> HR</span></b><small>YOUR WORKSPACE</small><nav aria-label="Choose a product preview">{views.map((item) => <button key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}><Icon name={item.icon} size={17} /><span>{item.label}</span></button>)}</nav><div className="sample-company"><span className="company-icon"><Icon name="building" size={16} /></span><span><b>Your company</b><small>All branches</small></span></div></aside>
      <div className="product-content" aria-live="polite"><header><div><small>GOOD MORNING, TEAM</small><h3>{view === "attendance" ? "Today, at a glance." : view === "chat" ? "A conversation, connected." : view === "reports" ? "The week in focus." : "Every branch, together."}</h3></div><span className="preview-date">Mon, 05 Oct</span></header>
        {view === "attendance" && <><div className="mini-metrics"><div><span>In today</span><b>24 <small>/ 28</small></b><i className="metric-line" /></div><div><span>On time</span><b>92<small>%</small></b><small className="metric-note">A clear start to the day</small></div></div><div className="preview-panel"><header><b>Team attendance</b><span>Today</span></header><div className="preview-table-head"><span>Team member</span><span>Check-in</span><span>Status</span></div>{people.map((person) => <div className="preview-person" key={person.name}><div><i className={`person-avatar ${person.className}`}>{person.initials}</i><span><b>{person.name}</b><small>{person.role}</small></span></div><time>{person.time}</time><span className={`person-status ${person.className}`}><i />{person.state}</span></div>)}</div><div className="record-note"><span><Icon name="check" size={14} /> One attendance record</span><span>App + biometric</span></div></>}
        {view === "chat" && <div className="preview-chat"><div className="chat-heading"><span className="chat-group"><Icon name="users" size={22} /></span><div><b>Operations team</b><small>3 members · Group conversation</small></div></div><div className="chat-bubble"><small>Liya · 09:12</small>Morning! The branch schedule is ready for review.</div><div className="chat-bubble outgoing"><small>You · 09:14</small>Thanks, Liya. I’ll check it before our team meeting.</div><div className="chat-bubble"><small>Dawit · 09:15</small>All set from our side.</div><div className="chat-caption"><Icon name="chat" size={16} /> A shared place for the workday.</div></div>}
        {view === "reports" && <><div className="mini-metrics"><div><span>Logged hours</span><b>386<small>.5</small></b><small className="metric-note">Across the team</small></div><div><span>Team members</span><b>12</b><small className="metric-note">In this example report</small></div></div><div className="preview-chart"><header><b>Attendance through the week</b><span>Weekly view</span></header><div className="chart-bars" role="img" aria-label="Example attendance: Monday 21, Tuesday 24, Wednesday 22, Thursday 26, Friday 25"><span style={{ "--height": "68%" } as React.CSSProperties}><i /><small>MON</small></span><span style={{ "--height": "83%" } as React.CSSProperties}><i /><small>TUE</small></span><span style={{ "--height": "74%" } as React.CSSProperties}><i /><small>WED</small></span><span style={{ "--height": "93%" } as React.CSSProperties}><i /><small>THU</small></span><span style={{ "--height": "88%" } as React.CSSProperties}><i /><small>FRI</small></span></div></div></>}
        {view === "branches" && <div className="preview-branches"><p>A connected view of your organization.</p>{[["Bole", "12 team members", "BO"], ["Kazanchis", "9 team members", "KA"], ["Piassa", "7 team members", "PI"]].map(([name, count, initials]) => <div key={name}><i>{initials}</i><span><b>{name} branch</b><small>{count}</small></span><span className="branch-connected"><span className="status-dot" />Connected</span></div>)}<footer><Icon name="building" size={17} /> 3 branches. One workspace.</footer></div>}
      </div></div>
    </div><div className="preview-caption"><span>Interactive product preview · Example data</span><span>Choose a view above <Icon name="arrowUp" size={13} /></span></div>
    <div className="floating-record" aria-hidden="true"><span><Icon name="check" size={22} /></span><div><b>The workday, recorded.</b><small>A little less chasing. A lot more knowing.</small></div></div>
  </div>;
}
