import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import Icon, { type IconName } from "@/components/Icon";
import AttendanceDevices from "@/components/services/AttendanceDevices";
import { site } from "@/lib/site";

// Landing page sections below the campus hero. Visuals are illustrative and use example data.

export function CheckInSection() {
  return <section className="lab-checkin" id="check-in" aria-labelledby="lab-checkin-heading">
    <div className="hr-wrap lab-checkin-inner">
      <div className="lab-checkin-copy">
        <span className="hr-kicker"><Icon name="clock" size={17} /> ATTENDANCE / CHECK-IN</span>
        <h2 id="lab-checkin-heading">At the door.<br /><em>Or on the phone.</em></h2>
        <p>Staff check in with the Aspio app or a supported biometric device. Either way, it lands in the same attendance record your managers already look at.</p>
        <ul className="lab-ticks">
          <li><Icon name="check" size={17} />App check-in from a phone</li>
          <li><Icon name="check" size={17} />Supported biometric devices at the entrance</li>
          <li><Icon name="check" size={17} />Check-ins, check-outs and logged hours in one record</li>
        </ul>
        <p className="lab-note"><Icon name="pin" size={16} /> Using a biometric device? We’ll help you check compatibility during your demo.</p>
        <div className="lab-links"><Link href="/services#attendance" className="lab-link">Explore attendance <Icon name="arrow" size={17} /></Link><Link href={site.demo} className="lab-link lab-link-quiet">Ask about your devices <Icon name="arrow" size={17} /></Link></div>
      </div>
      <AttendanceDevices />
    </div>
  </section>;
}

type Card = { id: string; icon: IconName; title: string; copy: string; href: string; more: string; visual: ReactNode };

const cards: Card[] = [
  {
    id: "chat", icon: "chat", title: "Team chat", href: "/services#chat", more: "Explore team chat",
    copy: "Direct messages and group chats keep work conversations next to the people they involve.",
    visual: <div className="lab-mini-chat">
      <div className="lab-bubble"><span className="hr-avatar hr-avatar-lilac">LB</span><div><small>Liya · Operations</small><p>The updated branch schedule is ready.</p></div></div>
      <div className="lab-bubble lab-bubble-out"><div><small>You</small><p>Thanks! Let’s review it together.</p></div></div>
      <div className="lab-bubble"><span className="hr-avatar hr-avatar-peach">DA</span><div><small>Dawit · Team lead</small><p>Received, thank you.</p></div></div>
    </div>,
  },
  {
    id: "payroll", icon: "file", title: "Payroll preparation", href: "/services#payroll", more: "Explore payroll preparation",
    copy: "Start month-end with staff records and attendance already together, not scattered across spreadsheets.",
    visual: <div className="lab-mini-table">
      <header><span>SEPTEMBER · MONTH-END</span><span className="lab-pill">Ready for review</span></header>
      <div className="lab-table-head"><span>Team member</span><span>Days</span><span>Hours</span></div>
      {[["Liya Bekele", "22", "176.0"], ["Dawit Alemu", "21", "168.5"], ["Hana Tadesse", "22", "174.0"]].map(([name, days, hours]) => <div key={name}><b>{name}</b><span>{days}</span><span>{hours}</span></div>)}
    </div>,
  },
  {
    id: "reports", icon: "chart", title: "Reports", href: "/services#reports", more: "Explore reports",
    copy: "Review attendance, logged hours and team activity across branches, week by week.",
    visual: <div className="lab-mini-chart">
      <header><span>TEAM ATTENDANCE</span><b>386.5 <small>hours this week</small></b></header>
      <div className="lab-bars">{[21, 24, 22, 26, 25].map((value, index) => <div key={index} style={{ "--bar": `${value / 26 * 100}%` } as CSSProperties}><span>{value}</span><i /><small>{["Mon", "Tue", "Wed", "Thu", "Fri"][index]}</small></div>)}</div>
    </div>,
  },
  {
    id: "people", icon: "users", title: "People & organization chart", href: "/services#workspace", more: "Meet the workspace",
    copy: "Profiles, roles and reporting lines in one place, so everyone has a clear spot in the bigger picture.",
    visual: <div className="lab-mini-org">
      <div className="lab-org-node lab-org-lead"><span className="hr-avatar hr-avatar-peach">DA</span><div><b>Dawit Alemu</b><small>Team lead · Bole</small></div></div>
      <div className="lab-org-lines" />
      <div className="lab-org-row">
        <div className="lab-org-node"><span className="hr-avatar hr-avatar-lilac">LB</span><div><b>Liya Bekele</b><small>Operations</small></div></div>
        <div className="lab-org-node"><span className="hr-avatar hr-avatar-mint">HT</span><div><b>Hana Tadesse</b><small>Customer care</small></div></div>
      </div>
    </div>,
  },
];

const modules: [IconName, string, string][] = [
  ["dashboard", "Dashboard", "A shared view of your team to start the day."],
  ["calendar", "Calendar", "People and schedules in context."],
  ["folder", "Files", "A clear home for staff documents."],
  ["settings", "Users & settings", "Access, company settings and billing."],
];

export function WorkspaceBento() {
  return <section className="lab-workspace hr-wrap" id="workspace" aria-labelledby="lab-workspace-heading">
    <header className="lab-head">
      <div><span className="hr-kicker">THE WHOLE WORKDAY, IN ONE PLACE</span><h2 id="lab-workspace-heading">Less chasing.<br /><em>More knowing.</em></h2></div>
      <p>Who’s in? Where’s that file? What changed? Bring the answers into one workspace, so your team has more room to do their best work.</p>
    </header>
    <div className="lab-bento">
      {cards.map(card => <article key={card.id} className={`lab-card lab-card-${card.id}`}>
        <div className="lab-card-visual" aria-hidden="true">{card.visual}</div>
        <div className="lab-card-copy">
          <span className="lab-card-icon"><Icon name={card.icon} size={20} /></span>
          <h3><Link href={card.href} className="lab-card-link">{card.title}</Link></h3>
          <p>{card.copy}</p>
          <span className="lab-card-more" aria-hidden="true">{card.more} <Icon name="arrow" size={16} /></span>
        </div>
      </article>)}
      <div className="lab-modules">
        <span className="lab-modules-title">ALSO IN THE WORKSPACE</span>
        {modules.map(([icon, title, copy]) => <div key={title}><span className="lab-card-icon"><Icon name={icon} size={19} /></span><div><b>{title}</b><small>{copy}</small></div></div>)}
      </div>
    </div>
    <p className="lab-caption">Illustrative workspace · Example data</p>
  </section>;
}

const steps: [string, string, string][] = [
  ["Tell us about your team", "Share your branches, team size and how staff check in today.", "users"],
  ["See it with your setup", "We walk you through the workspace and talk through your attendance devices.", "dashboard"],
  ["Agree and get started", "We discuss setup, your package and the agreement that fits your business.", "check"],
];

export function StartSteps() {
  return <section className="lab-steps" aria-labelledby="lab-steps-heading">
    <div className="hr-wrap">
      <header className="lab-head">
        <div><span className="hr-kicker">GETTING STARTED</span><h2 id="lab-steps-heading">From demo<br /><em>to day one.</em></h2></div>
        <p>It starts with a short conversation about how your business works: your branches, your people and how the workday begins.</p>
      </header>
      <ol className="lab-step-list">
        {steps.map(([title, copy, icon], index) => <li key={title}>
          <div className="lab-step-top"><span className="lab-step-number">0{index + 1}</span><span className="lab-card-icon"><Icon name={icon as IconName} size={20} /></span></div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </li>)}
      </ol>
      <div className="lab-steps-cta"><Link href={site.demo} className="hr-button">Request a demo <span><Icon name="arrow" size={20} /></span></Link><span>See the workspace with your own branches in mind.</span></div>
    </div>
  </section>;
}
