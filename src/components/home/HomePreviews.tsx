"use client";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";

const branchData = [
  { name: "Bole", total: 12, in: 10, color: "lilac", initials: "BO" },
  { name: "Kazanchis", total: 9, in: 8, color: "peach", initials: "KA" },
  { name: "Piassa", total: 7, in: 6, color: "mint", initials: "PI" },
];
const staff = [
  { name: "Liya Bekele", initials: "LB", role: "Operations", time: "08:30", state: "Checked in", color: "lilac" },
  { name: "Dawit Alemu", initials: "DA", role: "Team lead", time: "08:42", state: "Checked in", color: "peach" },
  { name: "Hana Tadesse", initials: "HT", role: "Customer care", time: "09:00", state: "On a break", color: "mint" },
];
function StaffRows({ compact = false }: { compact?: boolean }) {
  return <div className={`hr-staff-rows${compact ? " hr-rows-compact" : ""}`}>{staff.map((person) => <div className="hr-staff-row" key={person.name}><span className={`hr-avatar hr-avatar-${person.color}`}>{person.initials}</span><div><b>{person.name}</b><small>{person.role}</small></div><time>{person.time}</time><span className={`hr-state${person.state === "On a break" ? " hr-state-break" : ""}`}>{person.state}</span></div>)}</div>;
}
export { default as HeroWorkspace } from "./HeroWorkspace";
const capabilities: { id: string; label: string; icon: IconName; heading: string; copy: string; details: string[] }[] = [
  { id: "attendance", label: "Attendance", icon: "clock", heading: "Two ways in.\nOne record.", copy: "An app check-in or a supported biometric device. However the day begins, attendance stays in the same place.", details: ["Check-ins, check-outs and breaks", "Logged hours, ready to review"] },
  { id: "chat", label: "Team chat", icon: "chat", heading: "Keep the conversation\nwith the work.", copy: "A quick message to a colleague. A plan for the branch. Direct and group chats keep work conversations close to your team.", details: ["Direct messages and group conversations", "A shared place for company communication"] },
  { id: "payroll", label: "Payroll preparation", icon: "file", heading: "Month-end.\nMinus the scramble.", copy: "Start payroll preparation with organized staff records and attendance, not a search through different spreadsheets.", details: ["Staff records and attendance together", "A clearer handover for review"] },
  { id: "reports", label: "Reports", icon: "chart", heading: "See the detail.\nGet the picture.", copy: "Look beyond a busy day. Review attendance, logged hours and your team’s activity across branches.", details: ["Attendance and staff reporting", "Hours and activity across your team"] },
  { id: "branches", label: "Branches", icon: "building", heading: "Every location.\nOne place to look.", copy: "Keep people connected to the right branch, with a shared view of the organization that brings everyone together.", details: ["Staff organized by location", "A connected view of your business"] },
];
export function AttendancePreview() {
  const [method, setMethod] = useState("App check-in");
  return <><div className="hr-demo-title"><div><span>ATTENDANCE</span><h3>Today’s people. In view.</h3></div><Icon name="clock" size={25} /></div><div className="hr-attendance-top"><div className="hr-time-display"><small>MONDAY / CHECK-IN</small><b>08<span>:</span>30</b><div className="hr-methods" aria-label="Example check-in method">{["App check-in", "Biometric"].map((item) => <button key={item} aria-pressed={method === item} onClick={() => setMethod(item)}>{item}</button>)}</div></div><div className="hr-attendance-confirm" aria-live="polite"><span><Icon name="check" size={28} /></span><b>Attendance recorded</b><small>{method} · One shared record</small></div></div><div className="hr-demo-table-title"><b>Team attendance</b><span>Today</span></div><StaffRows /></>;
}
export function ChatPreview() {
  return <><div className="hr-demo-title"><div><span>TEAM CHAT</span><h3>Good work starts with a conversation.</h3></div><Icon name="chat" size={24} /></div><div className="hr-chat-layout"><aside><span>YOUR CONVERSATIONS</span>{[["HR Team", "Received, thank you.", "3"], ["Operations", "Monday’s schedule", "5"], ["Dawit Alemu", "See you at the meeting", "DA"]].map(([name, text, initials], index) => <div key={name} className={index === 0 ? "selected" : ""}><span className="hr-avatar hr-avatar-lilac">{initials}</span><div><b>{name}</b><small>{text}</small></div></div>)}</aside><div className="hr-chat-thread"><header><Icon name="users" size={22} /><span><b>HR Team</b><small>3 members · Group conversation</small></span></header><div className="hr-message"><small>Liya · 10:20</small>The updated branch schedule is ready.</div><div className="hr-message hr-message-out"><small>You · 10:22</small>Thanks! Let’s review it together.</div><div className="hr-message"><small>Dawit · 10:24</small>Received, thank you.</div><div className="hr-message-note"><Icon name="check" size={15} /> Direct messages. Group conversations. One place.</div></div></div></>;
}
export function PayrollPreview() {
  return <><div className="hr-demo-title"><div><span>PAYROLL PREPARATION</span><h3>A clearer close to the month.</h3></div><Icon name="file" size={24} /></div><div className="hr-payroll-summary"><span>MONTH-END REVIEW</span><b>September</b><small>Staff records + attendance</small><span className="hr-state">Ready for review</span></div><div className="hr-payroll-table"><header><span>Team member</span><span>Days</span><span>Hours</span></header>{[["Liya Bekele", "22", "176.0"], ["Dawit Alemu", "21", "168.5"], ["Hana Tadesse", "22", "174.0"]].map(([name, days, hours]) => <div key={name}><b>{name}</b><span>{days}</span><span>{hours}</span></div>)}</div><div className="hr-records-linked"><Icon name="users" size={20} /><span>Staff records</span><Icon name="check" size={16} /><Icon name="clock" size={20} /><span>Attendance</span><Icon name="check" size={16} /></div><p className="hr-demo-footnote">Organized records for payroll preparation.</p></>;
}
export function ReportsPreview() {
  return <><div className="hr-demo-title"><div><span>REPORTS</span><h3>The week. A little clearer.</h3></div><Icon name="chart" size={24} /></div><div className="hr-report-totals"><div><span>Logged hours</span><b>386<small>.5</small></b></div><div><span>Team members</span><b>12</b></div><div><span>Branches</span><b>3</b></div></div><div className="hr-report-chart" role="img" aria-label="Example attendance report: Monday 21, Tuesday 24, Wednesday 22, Thursday 26, Friday 25"><span>TEAM ATTENDANCE</span><div>{[21, 24, 22, 26, 25].map((value, index) => <div key={index} style={{ "--bar-height": `${value / 26 * 100}%` } as CSSProperties}><span>{value}</span><i /><small>{["MON", "TUE", "WED", "THU", "FRI"][index]}</small></div>)}</div></div><div className="hr-report-bottom"><span><Icon name="check" size={16} /> Attendance, staff and branches</span><span>Weekly view</span></div></>;
}
export function BranchesPreview() {
  return <><div className="hr-demo-title"><div><span>BRANCH MANAGEMENT</span><h3>One team, wherever they work.</h3></div><Icon name="building" size={24} /></div><div className="hr-branch-preview-list">{branchData.map((branch) => <div key={branch.name}><span className={`hr-avatar hr-avatar-${branch.color}`}><Icon name="building" size={24} /></span><div><h4>{branch.name}</h4><small>{branch.total} team members</small></div><span className="hr-state">{branch.in} in today</span></div>)}</div><div className="hr-branch-preview-total"><Icon name="users" size={28} /><div><b>28 people. 3 branches.</b><span>One shared HR workspace.</span></div></div></>;
}
export function FeatureWorkbench() {
  const [selected, setSelected] = useState(0);
  const item = capabilities[selected];
  return <div className="hr-feature-workbench"><div className="hr-feature-nav" aria-label="Explore HR features">{capabilities.map((feature, index) => <button key={feature.id} aria-pressed={selected === index} aria-controls="hr-feature-panel" onClick={() => setSelected(index)}><Icon name={feature.icon} size={21} /><span>{feature.label}</span><Icon name="arrow" size={18} /></button>)}</div><div id="hr-feature-panel" className="hr-feature-panel"><div className="hr-feature-copy"><span className="hr-kicker">0{selected + 1} / {item.label.toUpperCase()}</span><h3>{item.heading.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3><p>{item.copy}</p><ul>{item.details.map((detail) => <li key={detail}><Icon name="check" size={16} />{detail}</li>)}</ul><Link href={`/services#${item.id}`} className="hr-secondary">Explore {item.label.toLowerCase()} <Icon name="arrow" size={17} /></Link></div><div className="hr-feature-canvas"><div className="hr-demo-screen" key={item.id}>{item.id === "attendance" ? <AttendancePreview /> : item.id === "chat" ? <ChatPreview /> : item.id === "payroll" ? <PayrollPreview /> : item.id === "reports" ? <ReportsPreview /> : <BranchesPreview />}</div><span className="hr-visual-caption">Illustrative workspace · Example data</span></div></div></div>;
}
export function BranchNetwork() {
  const [selected, setSelected] = useState(0);
  const branch = branchData[selected];
  return <div className="hr-network"><div className="hr-network-root"><Icon name="building" size={28} /><span>aspio <b>HR</b></span><small>ONE SHARED WORKSPACE</small></div><div className="hr-network-lines" aria-hidden="true"><i /><i /><i /></div><div className="hr-network-nodes" aria-label="Preview a branch">{branchData.map((item, index) => <button key={item.name} aria-pressed={selected === index} onClick={() => setSelected(index)}><span className={`hr-avatar hr-avatar-${item.color}`}><Icon name="building" size={25} /></span><b>{item.name}</b><small>{item.total} people</small><span className="hr-node-dot" /></button>)}</div><div className="hr-network-summary" aria-live="polite"><span className={`hr-avatar hr-avatar-${branch.color}`}>{branch.initials}</span><div><b>{branch.name} branch</b><small>{branch.in} checked in · {branch.total} team members</small></div><span><Icon name="check" size={17} /> Connected</span></div><div className="hr-network-caption"><span>Example branches & attendance</span><span>Select a branch above <Icon name="arrowUp" size={12} /></span></div></div>;
}
