"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { interests, teamSizes } from "@/lib/contact-validation";
import Icon from "./Icon";
export default function ContactForm({ demo = false }: { demo?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [emailLink, setEmailLink] = useState(`mailto:${site.email}`);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const payload = Object.fromEntries(values.entries());
    const emailText = `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "Not provided"}\nCompany: ${payload.company}\nTeam size: ${payload.teamSize}\nInterest: ${payload.interest}${payload.message ? `\n\n${payload.message}` : ""}`;
    setEmailLink(`mailto:${site.email}?subject=${encodeURIComponent(`Aspio HR — ${payload.interest}`)}&body=${encodeURIComponent(emailText.slice(0, 2500))}`);
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, ...(!demo ? { consent: values.get("consent") === "on" } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We couldn’t send your enquiry. Please try again.");
      setState("success");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t connect. Please try again.");
      setState("error");
    }
  }
  if (state === "success") return <div className="contact-success" role="status"><span><Icon name="check" size={34} /></span><span className="eyebrow">A good conversation starts here</span><h2>You’re on our radar.</h2><p>Your enquiry has been sent. Our team will contact you using the details you shared.</p><Link href="/" className="button">Back to home <Icon name="arrow" /></Link></div>;
  return <form className="contact-form" onSubmit={submit}><input type="hidden" name="formType" value={demo ? "demo" : "contact"} /><header><span className="eyebrow">Let’s start with you</span><h2>{demo ? "Request your demo." : "Tell us what’s on your mind."}</h2><p>A few details will help us make the conversation useful.</p></header><fieldset disabled={state === "sending"}><legend className="visually-hidden">Your contact details</legend><div className="form-grid"><label>Your name <span aria-hidden="true">*</span><input name="name" required autoComplete="name" minLength={2} maxLength={100} placeholder="Full name" /></label><label>Email address <span aria-hidden="true">*</span><input name="email" required type="email" autoComplete="email" maxLength={254} placeholder="you@company.com" /></label><label>Company / organization <span aria-hidden="true">*</span><input name="company" required autoComplete="organization" minLength={2} maxLength={160} placeholder="Your company name" /></label><label>Phone number <small>optional</small><input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+251 …" /></label><label>Team size <span aria-hidden="true">*</span><select name="teamSize" required defaultValue=""><option value="" disabled>Select your team size</option>{teamSizes.map((value) => <option key={value}>{value}</option>)}</select></label><label>I’d like to talk about <span aria-hidden="true">*</span><select name="interest" defaultValue={demo ? "Request a demo" : "General question"}>{interests.map((value) => <option key={value}>{value}</option>)}</select></label>{!demo && <label className="full-width">A little about your needs <span aria-hidden="true">*</span><textarea name="message" required minLength={10} maxLength={3000} rows={4} placeholder="Tell us about your team, your branches, or what you’d like to make simpler." /></label>}</div><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>{!demo && <label className="consent"><input type="checkbox" name="consent" required /><span>I agree that Aspio can contact me about this enquiry. We’ll use these details to respond to your request.</span></label>}</fieldset>{state === "error" && <div className="form-error" role="alert"><p>{error}</p><a href={emailLink}>Send these details by email <Icon name="arrowUp" size={15} /></a></div>}<footer><span>Required fields are marked with *</span><button type="submit" className="button" disabled={state === "sending"}>{state === "sending" ? "Sending your enquiry…" : demo ? "Request my demo" : "Send enquiry"}<Icon name="arrow" /></button></footer></form>;
}
