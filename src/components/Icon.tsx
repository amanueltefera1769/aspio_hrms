import type { CSSProperties } from "react";
export type IconName = "arrow" | "arrowUp" | "check" | "clock" | "chat" | "users" | "building" | "chart" | "file" | "calendar" | "org" | "folder" | "settings" | "dashboard" | "mail" | "pin" | "menu" | "close" | "chevron";
const paths: Record<IconName, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6", arrowUp: "M6 18 18 6M6 6h12v12", check: "m5 12 4 4L19 6",
  clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  chat: "M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  building: "M4 21V5h10v16M14 9h6v12M2 21h20M8 9h2m-2 4h2m-2 4h2m8-4h.01M18 17h.01",
  chart: "M4 3v18h17M8 16v-4m5 4V8m5 8V5", file: "M14 2H5v20h14V7l-5-5v5h5M8 12h8m-8 4h8",
  calendar: "M3 6h18v15H3V6m4-3v6m10-6v6M3 11h18M7 15h.01M12 15h.01M17 15h.01",
  org: "M9 3h6v5H9V3m-5 13h6v5H4v-5m10 0h6v5h-6v-5M12 8v4M7 16v-4h10v4",
  folder: "M3 5h6l2 3h10v13H3V5", settings: "m9 3 1-1h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3l-2-2 2-4 3 1 3-1M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  dashboard: "M3 3h7v7H3V3m11 0h7v7h-7V3M3 14h7v7H3v-7m11 0h7v7h-7v-7",
  mail: "M3 5h18v14H3V5m0 0 9 7 9-7", pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  menu: "M4 6h16M4 12h16M4 18h16", close: "m6 6 12 12M6 18 18 6", chevron: "m9 5 7 7-7 7",
};
export default function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
