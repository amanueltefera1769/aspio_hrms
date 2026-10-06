import Link from "next/link";
import Icon from "@/components/Icon";
import HeroWorkspace from "@/components/home/HeroWorkspace";
import { site } from "@/lib/site";

// The original homepage hero, now introducing the Services workspace.
export default function WorkspaceHero() {
  return <section className="hr-hero"><div className="hr-wrap hr-hero-inner"><div className="hr-hero-copy">
    <span className="hr-kicker"><span /> PEOPLE FIRST. EVERYTHING CONNECTED.</span>
    <h1>Your people.<br />Your workday.<br /><em>All together.</em></h1>
    <p>From the first check-in to the last report.<br className="hr-desktop-break" /> One HR system for your team, your conversations<br className="hr-desktop-break" /> and every branch of your business.</p>
    <div className="hr-actions"><Link className="hr-button" href={site.demo}>Request a demo <span><Icon name="arrow" /></span></Link><a className="hr-secondary" href="#attendance">Explore the tools <Icon name="arrow" size={18} /></a></div>
    <div className="hr-hero-notes"><span><Icon name="check" size={15} /> App & biometric attendance</span><span><Icon name="check" size={15} /> Built for multi-branch teams</span></div>
  </div><HeroWorkspace /></div><div className="hr-hero-bottom hr-wrap"><span>LESS BACK-AND-FORTH. MORE GETTING THINGS DONE.</span><a href="#attendance">A closer look <Icon name="arrow" size={16} /></a></div></section>;
}
