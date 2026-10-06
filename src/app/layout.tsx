import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
const geist = localFont({ src: "../../public/fonts/geist-latin.woff2", variable: "--font-geist", display: "swap", weight: "100 900" });
export const metadata: Metadata = {
  title: { default: "Aspio HR — A better workday, for everyone", template: "%s | Aspio HR" },
  description: "Attendance, staff records, team chat, payroll preparation and branch management. Bring your people and everyday HR into one shared workspace with Aspio HR.",
  icons: { icon: "/favicon.png" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={geist.variable}><body><a href="#main-content" className="skip-link">Skip to content</a><Header /><main id="main-content">{children}</main><Footer /></body></html>;
}
