"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Icon, { type IconName } from "@/components/Icon";

// An illustrative workday. Times and moments are examples, not usage data.
const moments: { time: string; title: string; copy: string; href: string; icon: IconName; link: string }[] = [
  { time: "08:30", title: "The day starts", copy: "Staff check in with the app or a supported biometric device, and attendance lands in one shared record.", href: "/services#attendance", icon: "clock", link: "Explore attendance" },
  { time: "09:15", title: "Everyone’s in the loop", copy: "A quick update to the team, a reply from the branch. Conversations stay close to the people they involve.", href: "/services#chat", icon: "chat", link: "Explore team chat" },
  { time: "11:00", title: "A new face joins", copy: "A staff record with role, branch and documents in one place, so a person is never just another row.", href: "/services#workspace", icon: "users", link: "Explore staff records" },
  { time: "14:00", title: "Branches, side by side", copy: "Each location stays organized, without losing sight of the business as a whole.", href: "/services#branches", icon: "building", link: "Explore branches" },
  { time: "16:45", title: "The day, reviewed", copy: "Hours and attendance are ready to look over, and month-end starts from organized records.", href: "/services#reports", icon: "chart", link: "Explore reports" },
];

export default function AboutDay() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // The moment crossing the middle of the screen sets the clock.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
    }, { rootMargin: "-45% 0px -45% 0px" });
    items.current.forEach(item => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const [hours, minutes] = moments[active].time.split(":").map(Number);
  const hands = { "--hour": `${(hours % 12 + minutes / 60) * 30}deg`, "--minute": `${minutes * 6}deg` } as CSSProperties;
  return <div className="abt-day-grid">
    <div className="abt-clock" aria-hidden="true">
      <div className="abt-clock-face" style={hands}>
        {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--tick": `${index * 30}deg` } as CSSProperties} />)}
        <span className="abt-hand-hour" /><span className="abt-hand-minute" /><b />
      </div>
      <div className="abt-clock-read"><time>{moments[active].time}</time><span>{moments[active].title}</span></div>
      <div className="abt-clock-dots">{moments.map((moment, index) => <span key={moment.time} data-on={index <= active} />)}</div>
    </div>
    <ol className="abt-workday-path">
      {moments.map((moment, index) => <li key={moment.time} ref={element => { items.current[index] = element; }} data-index={index} data-active={index === active}>
        <Link href={moment.href}>
          <span className="abt-moment-time"><Icon name={moment.icon} size={18} />{moment.time}</span>
          <h3>{moment.title}</h3>
          <p>{moment.copy}</p>
          <span className="abt-moment-link">{moment.link} <Icon name="arrow" size={16} /></span>
        </Link>
      </li>)}
    </ol>
  </div>;
}
