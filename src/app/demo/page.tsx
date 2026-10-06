import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Icon, { type IconName } from "@/components/Icon";
import { site } from "@/lib/site";
import "../home.css";
import "./demo.css";

export const metadata: Metadata = {
  title: "Request a demo",
  description: "See Aspio HR with your team: attendance with app or biometric check-in, staff records, payroll preparation, team chat and branches, walked through around your setup.",
};

const agenda: [IconName, string, string][] = [
  ["clock", "Attendance", "App check-in or a supported biometric device, in one shared record."],
  ["file", "Staff records & payroll preparation", "Records and attendance together, ready for month-end review."],
  ["chat", "Team chat", "Direct messages and group conversations for your teams."],
  ["building", "Branches & reports", "A shared view across locations, and the detail behind the workday."],
];
const steps: [string, string][] = [
  ["Send the form", "Tell us a little about your team. We’ll reply using the details you share."],
  ["See it with your setup", "We walk you through the workspace with your branches, people and devices in mind."],
  ["Choose your next step", "We discuss setup, your package and the agreement that fits your business."],
];
const ready = ["How many branches you have, and your team size", "How staff check in today", "Your biometric device, if you already use one", "What you’d most like to make simpler"];

export default function DemoPage() {
  return <div className="hr-home demo-page">
    <section className="demo-hero">
      <div className="hr-wrap demo-hero-inner">
        <div className="demo-copy">
          <span className="hr-kicker"><span /> BOOK A DEMO</span>
          <h1>See Aspio<br /><em>with your team.</em></h1>
          <p>A guided walkthrough of the workspace, built around your branches, your people and how your workday starts.</p>
          <ul className="demo-notes">
            <li><Icon name="building" size={16} /> Built around your branch setup</li>
            <li><Icon name="check" size={16} /> Biometric compatibility checked with you</li>
            <li><Icon name="file" size={16} /> Setup and package discussed openly</li>
          </ul>
        </div>
        <div className="demo-form contact-form-shell"><ContactForm demo /></div>
        <section className="demo-agenda" aria-labelledby="demo-agenda-heading">
          <h2 id="demo-agenda-heading">What we’ll cover</h2>
          <ol>{agenda.map(([icon, title, copy]) => <li key={title}><span className="demo-icon"><Icon name={icon} size={19} /></span><div><b>{title}</b><small>{copy}</small></div></li>)}</ol>
          <p className="demo-agenda-note">Questions are welcome throughout.</p>
        </section>
      </div>
    </section>

    <section className="demo-after hr-wrap" aria-labelledby="demo-after-heading">
      <div className="demo-steps">
        <span className="hr-kicker">AFTER YOU SEND IT</span>
        <h2 id="demo-after-heading">What happens <em>next.</em></h2>
        <ol>{steps.map(([title, copy], index) => <li key={title}><span>0{index + 1}</span><div><b>{title}</b><p>{copy}</p></div></li>)}</ol>
      </div>
      <aside className="demo-ready" aria-labelledby="demo-ready-heading">
        <h3 id="demo-ready-heading">Helpful to have ready</h3>
        <ul>{ready.map(item => <li key={item}><Icon name="check" size={16} />{item}</li>)}</ul>
        <div className="demo-email">
          <span className="demo-icon"><Icon name="mail" size={19} /></span>
          <div><small>Prefer email?</small><a href={`mailto:${site.email}?subject=${encodeURIComponent("Aspio HR — Request a demo")}`}>{site.email} <Icon name="arrowUp" size={14} /></a></div>
        </div>
      </aside>
    </section>
  </div>;
}
