"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";
import { site } from "@/lib/site";
const navigation = [["/", "Home"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];
export default function Header() {
  const pathname = usePathname();
  const campusHero = pathname === "/";
  const [open, setOpen] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_STAFF_APP_URL;
  return <header className={`site-header${["/", "/services", "/about", "/demo"].includes(pathname) ? " hr-home-header" : ""}${campusHero ? " hr-lab-header" : ""}${pathname === "/about" ? " hr-about-header" : ""}`}><div className="header-inner">
    <Link href="/" className="brand" aria-label="Aspio HR home" onClick={() => setOpen(false)}><Image src="/images/aspio-logo.webp" width={111} height={42} alt="Aspio" priority /><span>{campusHero || pathname === "/about" ? "Staff app" : "HR"}</span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav>
    <div className="header-actions">{appUrl && /^https:\/\//.test(appUrl) && <a href={appUrl} className="sign-in">Sign in <Icon name="arrowUp" size={15} /></a>}<Link href={site.demo} className="button button-small">Request a demo <Icon name="arrow" size={16} /></Link><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation"><Icon name={open ? "close" : "menu"} /></button></div>
    {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>{navigation.map(([href, label]) => <Link href={href} key={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}<Icon name="arrow" size={18} /></Link>)}</nav>}
  </div></header>;
}
