import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Contact & request a demo", description: "Talk to the Aspio HR team in Ethiopia. Request a demo for attendance, staff records, team chat and branch management." };
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ request?: string }> }) {
  const query = await searchParams;
  return <section className="contact-page container"><div className="contact-copy"><span className="eyebrow">A conversation, not a sales script</span><h1>Let’s talk<br />about <em>your team.</em></h1><p>Tell us what your workday looks like. We’ll show you where Aspio HR can make it simpler.</p><div className="contact-details"><div><span><Icon name="mail" size={21} /></span><div><small>Email our team</small><a href={`mailto:${site.email}`}>{site.email}<Icon name="arrowUp" size={15} /></a></div></div><div><span><Icon name="pin" size={21} /></span><div><small>Find us in</small><b>{site.location}</b></div></div></div><div className="contact-expectations"><span className="eyebrow">What happens next?</span><ol><li><span>01</span>We get to know your business.</li><li><span>02</span>We show you the relevant features.</li><li><span>03</span>We discuss setup and your next step.</li></ol></div></div><div className="contact-form-shell"><ContactForm demo={query.request === "demo"} /></div></section>;
}
