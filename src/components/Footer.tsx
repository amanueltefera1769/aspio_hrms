import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import Icon from "./Icon";
export function DemoCallout() {
  return <section className="demo-callout container"><div><span className="eyebrow">A little less admin. A lot more clarity.</span><h2>Make room for<br />a better workday.</h2></div><div><p>Let’s walk through Aspio HR with your team, your branches and your everyday work in mind.</p><Link href={site.demo} className="button button-white">Request a demo <Icon name="arrow" /></Link></div></section>;
}
export default function Footer() {
  return <footer className="site-footer container"><div className="footer-top"><div className="footer-brand"><Link href="/" className="brand" aria-label="Aspio HR home"><Image src="/images/aspio-logo.webp" alt="Aspio" width={111} height={42} /><span>HR</span></Link><p>Your people. Your branches.<br />One clearer picture.</p></div><div><span className="eyebrow">Explore</span><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/about">About Aspio HR</Link></div><div><span className="eyebrow">Let’s talk</span><Link href={site.demo}>Request a demo <Icon name="arrowUp" size={14} /></Link><a href={`mailto:${site.email}`}>{site.email}</a></div><div className="footer-note"><span className="eyebrow">People, first.</span><p>Built to bring everyday HR<br />into one shared workspace.</p><span className="location"><Icon name="pin" size={15} /> {site.location}</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Aspio. All rights reserved.</span><span>Attendance · People · Conversations · Clarity</span><Link href="/contact">Get in touch <Icon name="arrowUp" size={14} /></Link></div></footer>;
}
