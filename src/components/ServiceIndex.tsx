"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "./Icon";

const sections: { id: string; label: string; detail: string; icon: IconName }[] = [
  { id: "attendance", label: "Attendance", detail: "Touch or tap", icon: "clock" },
  { id: "chat", label: "Team chat", detail: "Keep in touch", icon: "chat" },
  { id: "payroll", label: "Payroll preparation", detail: "A calmer month-end", icon: "file" },
  { id: "reports", label: "Reports", detail: "See the picture", icon: "chart" },
  { id: "branches", label: "Branches", detail: "Stay connected", icon: "building" },
  { id: "workspace", label: "More tools", detail: "The everyday details", icon: "org" },
];

export default function ServiceIndex() {
  const [active, setActive] = useState("attendance");
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 90;
      const indexHeight = scrollContainer.current?.closest("nav")?.getBoundingClientRect().height ?? 110;
      // Never above where a link jump lands a section (scroll padding + margin), so a
      // clicked section always becomes current, whatever the strip's height.
      const landing = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
        + (parseFloat(getComputedStyle(document.getElementById(sections[0].id) ?? document.body).scrollMarginTop) || 0);
      const readingLine = Math.max(headerHeight + indexHeight + 45, landing + 12);
      let current = sections[0].id;
      sections.forEach(({ id }) => {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= readingLine) current = id;
      });
      setActive(current);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainer.current;
    const link = container?.querySelector<HTMLElement>("[aria-current]");
    if (!container || !link) return;
    const left = link.offsetLeft - container.offsetLeft;
    if (left < container.scrollLeft || left + link.offsetWidth > container.scrollLeft + container.clientWidth) {
      container.scrollTo({ left: left - (container.clientWidth - link.offsetWidth) / 2, behavior: "instant" });
    }
  }, [active]);

  return <nav className="svc-index" aria-label="Explore services">
    <div className="hr-wrap svc-index-inner"><span className="svc-index-intro">EXPLORE<br /><b>Your workspace.</b></span><div ref={scrollContainer} className="svc-index-scroll">
      {sections.map(({ id, label, detail, icon }, index) => <a
        key={id} href={`#${id}`} aria-label={label} aria-current={active === id ? "location" : undefined}
        onClick={() => setActive(id)}
      ><span className="svc-index-icon" aria-hidden="true"><Icon name={icon} size={16} /></span><span className="svc-index-copy"><b><span aria-hidden="true">0{index + 1}</span>{label}</b><small>{detail}</small></span></a>)}
    </div></div>
  </nav>;
}
