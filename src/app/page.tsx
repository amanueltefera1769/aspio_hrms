import MotionCampusHero from "@/components/home/MotionCampusHero";
import Link from "next/link";
import Icon from "@/components/Icon";
import { BranchNetwork } from "@/components/home/HomePreviews";
import { CheckInSection, StartSteps, WorkspaceBento } from "@/components/home/LabSections";
import { site } from "@/lib/site";
import "./home.css";
import "./landing.css";

const questions = [
  ["Can we manage more than one branch?", "Yes. Keep your staff organized by location and bring the wider business into one HR workspace. We’ll walk through your branch setup during the demo."],
  ["How do staff check in?", "Staff can check in through the app or a supported biometric device. Our team can help you confirm which devices work with your setup."],
  ["Can staff check in without a biometric device?", "Yes. App check-in is one of the attendance options. Our team can explain the setup and help you choose the right approach for your workplaces."],
  ["Does Aspio help with payroll?", "Aspio brings staff records and attendance together for payroll preparation. You get an organized starting point for month-end review, rather than having to gather records from different places."],
  ["How do we get started?", "Request a demo and tell us a little about your team. We’ll show you the workspace and discuss setup, your package and the agreement that fits your business."],
];
export default function Home() {
  return <div className="hr-home hr-landing">
    <MotionCampusHero />
    <CheckInSection />
    <WorkspaceBento />
    <section className="hr-branches" aria-labelledby="lab-branches-heading"><div className="hr-wrap hr-branches-inner"><div className="hr-branch-copy"><span className="hr-kicker"><Icon name="building" size={17} /> ONE TEAM. MANY PLACES.</span><h2 id="lab-branches-heading">Different branches.<br /><em>Same clear picture.</em></h2><p>Keep each location organized without losing sight of the whole business. Your people, their records and their workday stay connected.</p><ul><li><Icon name="check" size={18} /> Staff organized by branch</li><li><Icon name="check" size={18} /> A shared view across locations</li><li><Icon name="check" size={18} /> Local teams. One HR workspace.</li></ul><Link className="hr-dark-link" href="/services#branches">Explore branch management <Icon name="arrow" /></Link></div><BranchNetwork /></div></section>
    <StartSteps />
    <section className="hr-faq hr-wrap" aria-labelledby="lab-faq-heading"><header><span className="hr-kicker">A FEW THINGS YOU MIGHT BE WONDERING</span><h2 id="lab-faq-heading">Good questions.<br /><em>Clear answers.</em></h2><p>Have something else in mind?</p><Link className="hr-secondary" href="/contact">Talk to our team <Icon name="arrow" size={18} /></Link></header><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className="hr-final"><div className="hr-wrap"><span className="hr-kicker">YOUR PEOPLE DESERVE A BETTER WORKDAY.</span><h2>Let’s bring<br />it <span>all together.</span></h2><div className="hr-final-bottom"><p>Your team. Your branches. Your way of working.<br />Let’s see what Aspio HR can do for you.</p><Link href={site.demo} className="hr-button hr-button-white">Request a demo <span><Icon name="arrow" /></span></Link></div><div className="hr-final-mark" aria-hidden="true">a</div></div></section>
  </div>;
}
