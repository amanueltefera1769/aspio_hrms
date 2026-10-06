import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import ServiceIndex from "@/components/ServiceIndex";
import { ChatPreview, PayrollPreview, ReportsPreview, BranchesPreview } from "@/components/home/HomePreviews";
import AttendanceDevices from "@/components/services/AttendanceDevices";
import WorkspaceHero from "@/components/services/WorkspaceHero";
import { features, modules, site } from "@/lib/site";
import "../home.css";
import "./services.css";

export const metadata: Metadata = {
  title: "Services",
  description: "A connected HR workspace for attendance, team chat, payroll preparation, reports and branch management. Explore what Aspio HR can do for your team.",
};

const previews = [AttendanceDevices, ChatPreview, PayrollPreview, ReportsPreview, BranchesPreview];
const headings = [
  ["Clock in with", "a touch. Or a tap."],
  ["Keep your people", "in the loop."],
  ["Month-end.", "Minus the scramble."],
  ["See the detail.", "Get the picture."],
  ["Different branches.", "Same team."],
];
const outcomes = [
  "Start the day with a shared view of who’s here.",
  "Bring the people and the conversation together.",
  "Give month-end review a more organized starting point.",
  "Turn everyday records into a clearer view of your team.",
  "Keep the local detail. See the whole organization.",
];
const questions = [
  ["Can we manage more than one branch?", "Yes. Aspio HR brings staff and branch records into one workspace. You can organize individual locations and keep a shared view of the business."],
  ["Can staff check in without a biometric device?", "Yes. App check-in is one of the attendance options. Our team can explain the setup and help you choose the right approach for your workplaces."],
  ["Does this include payroll?", "Aspio HR brings staff records and attendance together for payroll preparation. We’ll discuss your calculation, review and payroll requirements during the demo."],
  ["How are packages and pricing decided?", "The right package depends on your team, branches and agreement. Request a demo for a walkthrough and a quote based on your business."],
  ["What happens after I request a demo?", "Our team will get in touch to understand your needs, walk you through the relevant features and discuss setup and next steps."],
];

export default function ServicesPage() {
  return <div className="hr-home hr-services">
    <WorkspaceHero />

    <ServiceIndex />

    <div className="svc-stories">
      {features.map((feature, index) => {
        const Preview = previews[index];
        return <section id={feature.id} key={feature.id} className={`svc-story${index % 2 ? " svc-story-reverse" : ""}${feature.id === "branches" ? " svc-story-dark" : ""}`} aria-labelledby={`${feature.id}-heading`}>
          <div className="hr-wrap svc-story-inner">
            <div className="svc-story-copy">
              <span className="hr-kicker"><Icon name={feature.icon} size={17} /> {feature.number} / {feature.shortTitle.toUpperCase()}</span>
              <h2 id={`${feature.id}-heading`}>{headings[index][0]}<br /><em>{headings[index][1]}</em></h2>
              <p>{feature.description}</p>
              <ul>{feature.points.map((point) => <li key={point}><Icon name="check" size={17} />{point}</li>)}</ul>
              {feature.id === "attendance" && <p className="svc-note">Using a biometric device? We’ll help you check compatibility during your demo.</p>}
              {feature.id === "payroll" && <p className="svc-note">This is payroll preparation. Talk to us about your specific payroll and calculation requirements.</p>}
              <Link href={site.demo} className="hr-secondary">See {feature.shortTitle.toLowerCase()} in action <Icon name="arrow" size={18} /></Link>
            </div>
            {feature.id === "attendance" ? <AttendanceDevices /> : <div className={`svc-preview svc-preview-${feature.id}`}>
              <div className="svc-preview-label"><span>{feature.shortTitle}</span><span>WORKSPACE PREVIEW</span></div>
              <div className="hr-demo-screen"><Preview /></div>
              <span className="hr-visual-caption">Illustrative workspace · Example data</span>
            </div>}
            <div className="svc-outcome"><span>{feature.number}</span><p>{outcomes[index]}</p><Icon name={feature.icon} size={21} /></div>
          </div>
        </section>;
      })}
    </div>

    <section id="workspace" className="svc-workspace hr-wrap" aria-labelledby="workspace-heading">
      <header><span className="hr-kicker">THE EVERYDAY DETAILS, TOO</span><h2 id="workspace-heading">A home for<br /><em>the whole team.</em></h2><p>The tools around your core HR work. Together, not scattered across different places.</p><Link href={site.demo} className="hr-secondary">Explore the full workspace <Icon name="arrow" size={18} /></Link></header>
      <div className="svc-tools">
        {modules.map(([name, description, icon]) => <article key={name}><span><Icon name={icon} size={23} /></span><div><h3>{name}</h3><p>{description}</p></div></article>)}
        <article className="svc-billing"><span><Icon name="file" size={23} /></span><div><h3>Billing</h3><p>Keep your workspace subscription in view.</p></div></article>
      </div>
    </section>

    <section className="svc-faq hr-faq hr-wrap" aria-labelledby="faq-heading">
      <header><span className="hr-kicker">BEFORE WE MEET</span><h2 id="faq-heading">A little clarity.<br /><em>A good start.</em></h2><p>Have a question about your team’s setup?</p><Link href="/contact" className="hr-secondary">Let’s talk <Icon name="arrow" size={17} /></Link></header>
      <div>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
    </section>

    <section className="hr-final svc-final"><div className="hr-wrap"><span className="hr-kicker">YOUR TEAM. YOUR WAY OF WORKING.</span><h2>Let’s find<br /><span>your fit.</span></h2><div className="hr-final-bottom"><p>A walkthrough built around your people,<br />your branches and what you need next.</p><Link href={site.demo} className="hr-button hr-button-white">Request your demo <span><Icon name="arrow" size={20} /></span></Link></div><span className="hr-final-mark" aria-hidden="true">↗</span></div></section>
  </div>;
}
