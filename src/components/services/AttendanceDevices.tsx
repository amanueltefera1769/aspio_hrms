"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import "./attendance-devices.css";

type Method = "Biometric" | "App check-in";
type Phase = "idle" | "working" | "done";
type PhonePhase = Phase | "popup";
const scanTime = 1500, sendTime = 700;

function Fingerprint({ size = 50 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true"><path d="M12 27C12 2 52 2 52 27v9M6 27C6-5 58-5 58 27v12M18 30v-3c0-18 28-18 28 0v10c0 8 3 14 6 17M24 36V26c0-10 16-10 16 0v12c0 10 4 16 7 21M31 24v17c0 10 2 16 5 20M11 34c0 10-2 14-5 18M18 37c0 10-3 18-6 22M24 43c0 8-2 14-4 18M58 47l3 6" /></svg>;
}

// Illustrative devices with example data: nothing is recorded or sent.
export default function AttendanceDevices() {
  const [terminal, setTerminal] = useState<Phase>("idle");
  const [phone, setPhone] = useState<PhonePhase>("idle");
  const [recorded, setRecorded] = useState<Method | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (delay: number, action: () => void) => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.push(window.setTimeout(action, reduced ? 0 : delay));
  };

  function scan() {
    if (terminal === "working") return;
    setTerminal("working");
    later(scanTime, () => { setTerminal("done"); setRecorded("Biometric"); });
  }
  function checkIn() {
    if (phone === "working") return;
    setPhone("working");
    later(sendTime, () => { setPhone("popup"); setRecorded("App check-in"); });
  }

  return <div className="att-experience" aria-label="Biometric machine and mobile app check-in preview">
    <div className="att-stage-label"><span>AT THE DOOR. ON YOUR PHONE.</span><span>08:30 · A NEW WORKDAY</span></div>
    <div className="att-devices">
      <div className="att-device-group">
        <div className="att-terminal" data-phase={terminal}>
          <div className="att-terminal-top"><span /><i /><i /></div>
          <div className="att-screen" aria-live="polite">
            {terminal === "done" ? <div className="att-screen-done">
              <span className="att-screen-check"><Icon name="check" size={26} /></span>
              <b>Checked in</b>
              <span>Liya Bekele</span>
              <small>08:30 · Bole branch</small>
            </div> : <>
              <div className="att-screen-head"><span>{terminal === "working" ? "Scanning…" : "Welcome to work"}</span><time>08:30</time></div>
              <div className="att-print">
                <span className="att-print-base"><Fingerprint size={62} /></span>
                <span className="att-print-fill"><Fingerprint size={62} /></span>
                <i className="att-scan-line" />
              </div>
              <div className="att-progress"><i /></div>
              <small>{terminal === "working" ? "Hold still for a moment" : "Place your finger on the reader"}</small>
            </>}
          </div>
          <div className="att-terminal-controls">
            <div className="att-keypad" aria-hidden="true">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "OK"].map(key => <span key={key}>{key}</span>)}</div>
            <button className="att-reader" aria-label="Biometric" aria-pressed={terminal !== "idle"} onClick={scan}><Fingerprint size={34} /><span>{terminal === "done" ? "Recognized" : "Touch to scan"}</span></button>
          </div>
          <div className="att-terminal-foot"><span /><small>BIOMETRIC CHECK-IN</small></div>
        </div>
        <span className="att-device-label">A touch at the terminal<span>Biometric machine</span></span>
      </div>

      <div className="att-device-group">
        <div className="att-phone" data-phase={phone}>
          <div className="att-phone-island" aria-hidden="true" />
          <div className="att-phone-status" aria-hidden="true"><b>8:30</b><span><i /><i /><i /></span></div>
          <header><Image src="/images/aspio-logo.webp" width={52} height={20} alt="Aspio" /><span className="att-phone-avatar">LB</span></header>
          <p className="att-phone-hello">Good morning,<b>Liya</b></p>
          <div className="att-shift"><span>TODAY</span><b>08:30 – 17:30</b><small><Icon name="pin" size={11} /> Bole branch · On site</small></div>
          <button className="att-checkin" aria-label="App check-in" aria-pressed={phone !== "idle"} onClick={checkIn} disabled={phone === "working"}>
            <span className="att-checkin-ring"><Icon name={phone === "idle" || phone === "working" ? "clock" : "check"} size={26} /></span>
            <b>{phone === "working" ? "Checking in…" : phone === "idle" ? "Check in" : "Checked in"}</b>
            <small>{phone === "idle" || phone === "working" ? "Tap to start your day" : "Since 08:30 · Bole"}</small>
          </button>
          <div className="att-phone-last"><span>Yesterday</span><b>08:27 – 17:34</b></div>
          {phone === "popup" && <div className="att-popup" role="dialog" aria-label="Check-in confirmed">
            <div className="att-popup-card">
              <span className="att-popup-check"><Icon name="check" size={24} /></span>
              <b>You’re checked in</b>
              <small>08:30 · Bole branch</small>
              <p>Have a good day, Liya.</p>
              <button onClick={() => setPhone("done")}>Done</button>
            </div>
          </div>}
          <span className="att-phone-home" aria-hidden="true" />
        </div>
        <span className="att-device-label">A tap in the app<span>Mobile check-in</span></span>
      </div>
    </div>
    <svg className="att-connectors" viewBox="0 0 600 55" fill="none" aria-hidden="true"><path d="M155 0v10q0 20 20 20h250q20 0 20-20V0M300 30v24" stroke="currentColor" strokeWidth="1.5" /><circle cx="300" cy="30" r="4" fill="currentColor" /></svg>
    <div className="att-record" data-recorded={Boolean(recorded)} aria-live="polite" aria-atomic="true">
      <span><Icon name={recorded ? "check" : "clock"} size={20} /></span>
      <div>{recorded ? <><b>Attendance recorded</b><small>{recorded} · Liya Bekele · 08:30</small></> : <><b>Waiting for a check-in</b><small>Try the reader or the app</small></>}</div>
      <span className="att-record-hours">One shared<br />attendance record</span>
    </div>
    <span className="att-caption">Illustrative devices & example data</span>
  </div>;
}
