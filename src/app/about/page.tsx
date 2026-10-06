import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AboutDay from "@/components/about/AboutDay";
import Icon from "@/components/Icon";
import { site } from "@/lib/site";
import "../home.css";
import "./about.css";

export const metadata: Metadata = {
  title: "About",
  description: "Work is human. Meet Aspio HR: one connected workspace for the people, conversations and everyday work behind your business, based in Addis Ababa.",
};

const principles = [
  { number: "01", title: "People before paperwork.", body: "A staff record is a person, not just another row. Routine information should be easy to find, so managers have more room for the conversations that matter.", icon: "users" },
  { number: "02", title: "Context, kept together.", body: "Attendance makes more sense alongside the team. Conversations belong close to the work. Branches are part of one organization. We keep those connections in view.", icon: "org" },
  { number: "03", title: "Practical from the start.", body: "Start with the way your business works: a walkthrough, a conversation about your needs and a setup that makes sense for your people and branches.", icon: "check" },
] as const;

export default function AboutPage() {
  return <div className="hr-home hr-about">
    <section className="abt-hero" aria-labelledby="about-title">
      <svg className="abt-hero-curve" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0H485C432 175 429 280 462 413C503 577 470 775 337 1000H0Z" />
      </svg>
      <div className="hr-wrap abt-hero-inner">
        <div className="abt-hero-copy">
          <span className="hr-kicker">ABOUT ASPIO</span>
          <h1 id="about-title">A clearer workday.<br /><em>A more connected team.</em></h1>
          <p>Our focus is simple: make everyday staff coordination easier, so people can spend more time working together.</p>
          <a href="#our-purpose" className="abt-discover"><span>Discover Aspio</span><Icon name="arrow" size={27} /></a>
        </div>
        <Image className="abt-hero-signature" src="/favicon.png" alt="" aria-hidden="true" width={36} height={36} />
      </div>
      <div className="abt-hero-visual">
        <Image src="/images/about/connections-v1.png" alt="Two colleagues reviewing staff records together on a laptop in a bright office" fill sizes="(max-width: 900px) 100vw, 60vw" preload />
      </div>
    </section>

    <section className="abt-purpose hr-wrap" id="our-purpose" aria-labelledby="purpose-heading">
      <div className="abt-purpose-copy">
        <span className="hr-kicker">WHY WE BUILT THIS</span>
        <h2 id="purpose-heading">Less chasing answers.<br /><em>More time for people.</em></h2>
        <p>Small questions take up a lot of the day when every answer lives somewhere different.</p>
        <p>Aspio HR brings attendance, staff records, documents and conversations into one workspace. The everyday details get a home, and your team gets a clearer place to start.</p>
        <Link href="/services" className="hr-secondary">See how it comes together <Icon name="arrow" size={18} /></Link>
      </div>
      <div className="abt-chat" role="group" aria-label="Everyday questions, answered in one place">
        <p className="abt-bubble abt-bubble-a"><small>Branch manager</small>Who’s here today?</p>
        <p className="abt-bubble abt-bubble-b"><small>HR team</small>Where’s that staff record?</p>
        <p className="abt-bubble abt-bubble-c"><small>Operations</small>Has the branch seen the update?</p>
        <p className="abt-bubble abt-bubble-answer"><small>Aspio HR</small>All in one workspace: attendance, records, documents and conversations.</p>
      </div>
    </section>

    <section className="abt-day" aria-labelledby="day-heading">
      <div className="hr-wrap">
        <header>
          <span className="hr-kicker">ONE LOCATION. OR MANY.</span>
          <h2 id="day-heading">A workday,<br /><em>in five moments.</em></h2>
          <p>A manager wearing several hats, or an HR team supporting different branches. The need is the same: know what’s happening, and keep people connected.</p>
        </header>
        <AboutDay />
      </div>
    </section>

    <section className="abt-principles" aria-labelledby="principles-heading">
      <div className="hr-wrap">
        <header>
          <span className="hr-kicker">WHAT WE BELIEVE</span>
          <h2 id="principles-heading">Three ideas behind<br /><em>everything we build.</em></h2>
        </header>
        <div>{principles.map(principle => <article key={principle.number}>
          <span className="abt-principle-number" aria-hidden="true">{principle.number}</span>
          <span className="abt-principle-icon"><Icon name={principle.icon} size={22} /></span>
          <h3>{principle.title}</h3>
          <p>{principle.body}</p>
        </article>)}</div>
      </div>
    </section>

    <section className="abt-place hr-wrap" aria-labelledby="place-heading">
      <div className="abt-radar" aria-hidden="true"><i /><i /><i /><b /><span>9.03° N · 38.74° E</span></div>
      <div className="abt-place-copy">
        <span className="hr-kicker"><Icon name="pin" size={16} /> WHERE WE ARE</span>
        <h2 id="place-heading">Rooted in<br /><em>Addis Ababa.</em></h2>
        <p>We’re based in {site.location}, and we build for businesses with one location or many: teams that start their day in different places and still work as one.</p>
      </div>
    </section>

    <section className="abt-contact" aria-labelledby="contact-heading">
      <div className="hr-wrap abt-contact-inner">
        <div>
          <span className="hr-kicker">LET’S TALK ABOUT YOUR TEAM</span>
          <h2 id="contact-heading">Your people.<br /><span>Your next chapter.</span></h2>
          <p>Tell us how your workplace runs today, and what you’d like to make simpler.</p>
          <Link href={site.demo} className="hr-button hr-button-white">Let’s meet in a demo <span><Icon name="arrow" size={20} /></span></Link>
        </div>
        <div className="abt-contact-details">
          <a href={`mailto:${site.email}`}><span><small>EMAIL OUR TEAM</small><b>{site.email}</b></span><Icon name="arrowUp" size={21} /></a>
          <div><Icon name="pin" size={17} /><span>{site.location}</span></div>
          <Link href="/contact" className="abt-contact-link">Send us a message <Icon name="arrow" size={17} /></Link>
        </div>
      </div>
    </section>
  </div>;
}
