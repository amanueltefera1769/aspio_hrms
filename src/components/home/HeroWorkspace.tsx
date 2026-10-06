"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Icon, { type IconName } from "@/components/Icon";
import "./hero-preview.css";

const views = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "attendance", label: "Attendance", icon: "clock" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "staff", label: "Staff CRM", icon: "users" },
  { id: "files", label: "Files", icon: "folder" },
  { id: "reports", label: "Reports", icon: "chart" },
  { id: "branches", label: "Branches", icon: "building" },
] as const;
type View = (typeof views)[number]["id"];
const branches = [
  { name: "Bole", total: 12, present: 10 },
  { name: "Kazanchis", total: 9, present: 8 },
  { name: "Piassa", total: 7, present: 6 },
];
const people = [
  { name: "Liya Bekele", initials: "LB", role: "Operations", branch: "Bole", time: "08:30", state: "Checked in", color: "lilac" },
  { name: "Dawit Alemu", initials: "DA", role: "Team lead", branch: "Kazanchis", time: "08:42", state: "Checked in", color: "peach" },
  { name: "Hana Tadesse", initials: "HT", role: "Customer care", branch: "Piassa", time: "09:00", state: "On a break", color: "mint" },
];
const documents = [
  { name: "Staff handbook", type: "Company guide", text: "A shared guide to the team’s workday, workplace policies and who to ask for help." },
  { name: "Branch schedule", type: "Team schedule", text: "Monday team catch-up · 09:30. Branch review · 14:00. Keep the week’s plans close to your team." },
  { name: "Attendance summary", type: "Weekly record", text: "Attendance and logged hours, organized for the week’s review. Example report: 12 team members, 386.5 hours." },
];

function PreviewLogo({ mobile = false }: { mobile?: boolean }) {
  return <div className={mobile ? "hr-app-mobile-logo" : "hr-app-logo"}>
    <Image src="/images/aspio-logo.webp" width={111} height={42} alt="Aspio" sizes={mobile ? "60px" : "85px"} />
    <span>HR</span>
  </div>;
}

export default function HeroWorkspace() {
  const previewScreen = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("dashboard");
  const [branch, setBranch] = useState("all");
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("App check-in");
  const [checkedIn, setCheckedIn] = useState(false);
  const [conversation, setConversation] = useState("HR Team");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<{ text: string; conversation: string }[]>([]);
  const [document, setDocument] = useState(0);
  const [period, setPeriod] = useState("week");
  const selected = branches.find((item) => item.name === branch);
  const visiblePeople = people.filter((person) => (branch === "all" || person.branch === branch) && `${person.name} ${person.role}`.toLowerCase().includes(query.toLowerCase().trim()));
  const present = (selected?.present ?? 24) + (checkedIn && (branch === "all" || branch === "Bole") ? 1 : 0);
  const total = selected?.total ?? 28;
  const title = views.find((item) => item.id === view)!.label;

  useEffect(() => { previewScreen.current?.scrollTo({ top: 0 }); }, [view]);
  useEffect(() => {
    const log = previewScreen.current?.querySelector<HTMLDivElement>(".hr-hero-messages");
    log?.scrollTo({ top: log.scrollHeight });
  }, [messages, conversation, view]);

  const navigation = (mobile: boolean) => <nav className={mobile ? "hr-app-mobile-nav" : "hr-app-preview-nav"} aria-label={mobile ? "Mobile hero preview" : "Hero preview"}>
    {views.map((item) => <button type="button" key={item.id} aria-pressed={view === item.id} aria-controls="hr-hero-screen" onClick={() => setView(item.id)}><Icon name={item.icon as IconName} size={15} /><span>{item.label}</span></button>)}
  </nav>;

  const staffRows = (profiles = false) => <div className="hr-staff-rows hr-rows-compact">
    {visiblePeople.length === 0 && <p className="hr-preview-empty">No matching staff in this branch. Try another name or choose All branches.</p>}
    {visiblePeople.map((person) => profiles ? <details className="hr-hero-profile-row" key={person.name}>
      <summary><span className={`hr-avatar hr-avatar-${person.color}`}>{person.initials}</span><span><b>{person.name}</b><small>{person.role}</small></span><Icon name="chevron" size={13} /></summary>
      <dl><div><dt>Branch</dt><dd>{person.branch}</dd></div><div><dt>Role</dt><dd>{person.role}</dd></div><div><dt>Status</dt><dd>Active team member</dd></div></dl>
    </details> : <div className="hr-staff-row" key={person.name}>
      <span className={`hr-avatar hr-avatar-${person.color}`}>{person.initials}</span><div><b>{person.name}</b><small>{person.role} · {person.branch}</small></div><time>{person.time}</time><span className={`hr-state${person.state === "On a break" ? " hr-state-break" : ""}`}>{person.state}</span>
    </div>)}
  </div>;

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((current) => [...current.slice(-9), { text: draft.trim(), conversation }]);
    setDraft("");
  };

  return <div className="hr-hero-stage">
    <div className="hr-orbit hr-orbit-one" aria-hidden="true" /><div className="hr-orbit hr-orbit-two" aria-hidden="true" />
    <div className="hr-workday-stamp"><Icon name="clock" size={17} /><span>THE WORKDAY IS CONNECTED</span><i /></div>
    <div className="hr-app-window">
      <div className="hr-app-chrome"><div><i /><i /><i /></div><span>ASPIO HR / INTERACTIVE PREVIEW</span><Icon name="settings" size={14} /></div>
      <div className="hr-app-layout">
        <aside className="hr-app-sidebar"><PreviewLogo />{navigation(false)}<div className="hr-sidebar-company"><Icon name="building" size={16} /><span>Your company<small>One shared workspace</small></span></div></aside>
        <div className="hr-app-main">
          <header><PreviewLogo mobile /><span>{title}</span><label><span className="visually-hidden">Preview branch</span><select value={branch} onChange={(e) => setBranch(e.target.value)}><option value="all">All branches</option>{branches.map((item) => <option key={item.name}>{item.name}</option>)}</select></label></header>
          {navigation(true)}
          <div ref={previewScreen} id="hr-hero-screen" className="hr-hero-screen" role="region" aria-label={`${title} preview`}>
            {view === "dashboard" && <>
              <div className="hr-app-greeting"><div><small>MONDAY, 05 OCTOBER</small><h3>A good day starts here.</h3></div><span className="hr-avatar hr-avatar-lilac">AA</span></div>
              <div className="hr-overview-metrics" aria-live="polite"><div><span><Icon name="users" size={17} />In today</span><b>{present}<small> / {total}</small></b><div className="hr-progress"><i style={{ width: `${present / total * 100}%` }} /></div></div><div><span><Icon name="building" size={17} />Branches</span><b>{selected ? "01" : "03"}</b><small>One connected team</small></div><div><span><Icon name="clock" size={17} />Check-in</span><b>08:30</b><small>First arrival today</small></div></div>
              <div className="hr-app-attendance"><header><b>People in motion</b><span>{selected?.name ?? "Across your branches"}</span></header>{staffRows()}</div>
              <button type="button" className="hr-mini-report hr-mini-report-button" onClick={() => setView("reports")}><span><b>Your week, at a glance</b><small>Explore the report <Icon name="arrow" size={10} /></small></span><span className="hr-mini-bars" aria-hidden="true">{[44, 65, 58, 83, 70, 90, 74].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</span></button>
            </>}
            {(view === "attendance" || view === "staff") && <div className="hr-hero-tool">
              <div className="hr-hero-tool-heading"><small>{view === "staff" ? "PEOPLE & RECORDS" : "TODAY’S ATTENDANCE"}</small><h3>{view === "staff" ? "Meet your team." : "One clear check-in."}</h3></div>
              <label className="hr-hero-search"><span className="visually-hidden">Search preview staff</span><input type="search" placeholder="Search staff by name or role…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
              {view === "attendance" && <div className="hr-hero-checkin"><div><b>08:30</b><label><span className="visually-hidden">Hero check-in method</span><select value={method} onChange={(e) => setMethod(e.target.value)}><option>App check-in</option><option>Biometric</option></select></label></div><button type="button" onClick={() => setCheckedIn((current) => !current)}>{checkedIn ? "Reset example" : "Try a check-in"}<Icon name="check" size={14} /></button><span role="status">{checkedIn ? `${method} recorded for a Bole team member.` : "Try an example. No live records are changed."}</span></div>}
              {staffRows(view === "staff")}
            </div>}
            {view === "chat" && <div className="hr-hero-tool"><div className="hr-hero-tool-heading"><small>DIRECT & GROUP CHAT</small><h3>Keep work connected.</h3></div><label className="hr-hero-conversation"><span className="visually-hidden">Preview conversation</span><select value={conversation} onChange={(e) => setConversation(e.target.value)}><option>HR Team</option><option>Dawit Alemu</option></select><small>{conversation === "HR Team" ? "Group conversation · 3 members" : "Direct conversation"}</small></label><div className="hr-hero-messages" role="log" aria-label="Example conversation"><div className="hr-message"><small>{conversation === "HR Team" ? "Liya" : "Dawit"}</small>{conversation === "HR Team" ? "The branch schedule is ready for review." : "Ready for our team catch-up?"}</div>{messages.filter((item) => item.conversation === conversation).map((item, index) => <div className="hr-message hr-message-out" key={index}><small>You · Preview</small>{item.text}</div>)}</div><form className="hr-hero-chat-form" onSubmit={sendMessage}><label><span className="visually-hidden">Preview message</span><input value={draft} maxLength={200} onChange={(e) => setDraft(e.target.value)} placeholder="Try a message…" /></label><button type="submit" disabled={!draft.trim()} aria-label="Send preview message"><Icon name="arrow" size={16} /></button></form><p className="hr-hero-local-note">Preview only. Messages aren’t sent to anyone.</p></div>}
            {view === "files" && <div className="hr-hero-tool"><div className="hr-hero-tool-heading"><small>TEAM DOCUMENTS</small><h3>A place for the paperwork.</h3></div><div className="hr-hero-files" aria-label="Example documents">{documents.map((file, index) => <button type="button" key={file.name} aria-pressed={document === index} onClick={() => setDocument(index)}><Icon name="file" size={17} /><span><b>{file.name}</b><small>{file.type}</small></span><Icon name="chevron" size={12} /></button>)}</div><div className="hr-hero-file-detail" aria-live="polite"><b>{documents[document].name}</b><p>{documents[document].text}</p><small>Illustrative document · Example content</small></div></div>}
            {view === "reports" && <div className="hr-hero-tool"><div className="hr-hero-tool-heading"><small>HOURS & ATTENDANCE</small><h3>Your team, in focus.</h3></div><label className="hr-hero-conversation"><span className="visually-hidden">Preview report period</span><select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="week">This week</option><option value="month">This month</option></select><small>{selected?.name ?? "All branches"}</small></label><div className="hr-hero-report-stat"><small>EXAMPLE LOGGED HOURS</small><b>{period === "week" ? (selected ? (selected.total * 32.2).toFixed(1) : "386.5") : (selected ? (selected.total * 128.8).toFixed(1) : "1546.0")}<span> hrs</span></b></div><div className="hr-hero-report-chart" role="img" aria-label={`Example attendance for ${period === "week" ? "Monday to Friday" : "weeks one to four"}`}>
              {(period === "week" ? [68, 83, 74, 93, 88] : [74, 89, 80, 95]).map((height, index) => <div key={index} style={{ "--bar-height": `${height}%` } as CSSProperties}><i /><small>{period === "week" ? ["MON", "TUE", "WED", "THU", "FRI"][index] : `WK ${index + 1}`}</small></div>)}
            </div><p className="hr-hero-local-note">Illustrative totals for the selected branch and period.</p></div>}
            {view === "branches" && <div className="hr-hero-tool"><div className="hr-hero-tool-heading"><small>ONE COMPANY. EVERY LOCATION.</small><h3>Every branch, together.</h3></div><div className="hr-hero-branches">{branches.map((item) => <button type="button" key={item.name} aria-pressed={branch === item.name} onClick={() => setBranch(item.name)}><Icon name="building" size={23} /><span><b>{item.name}</b><small>{item.total} team members · {item.present} in today</small></span><Icon name="chevron" size={15} /></button>)}</div><div className="hr-hero-branch-note" role="status"><Icon name="check" size={17} /><span>{selected ? `${selected.name} selected. Other views now show this branch.` : "Choose a branch to explore its team."}</span></div></div>}
          </div>
        </div>
      </div>
    </div>
    {view === "dashboard" && <div className="hr-checkin-float"><span><Icon name="check" size={23} /></span><div><b>{checkedIn ? "Example check-in recorded." : "Liya checked in."}</b><small>08:30 · Bole branch</small></div><span className="hr-checkin-source">{checkedIn ? method.toUpperCase() : "APP CHECK-IN"}</span></div>}
    <div className="hr-hero-preview-note"><span>Interactive preview · Example data</span><span>Choose a view to explore <Icon name="arrowUp" size={12} /></span></div>
  </div>;
}
