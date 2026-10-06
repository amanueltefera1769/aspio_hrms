import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { validateContact } from "@/lib/contact-validation";
import { site } from "@/lib/site";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const fail = (message: string, status: number) => NextResponse.json({ message }, { status });
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) return fail("Please send your enquiry from our contact page.", 403);
    } catch { return fail("Please send your enquiry from our contact page.", 403); }
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("Please check the form and try again.", 415);
  if (Number(request.headers.get("content-length") || 0) > 16000) return fail("Your message is too long. Please shorten it and try again.", 413);
  let body: unknown;
  try {
    // Bound the reader as well as Content-Length; chunked requests cannot bypass the limit.
    const reader = request.body?.getReader();
    if (!reader) return fail("Please check the form and try again.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16000) { await reader.cancel(); return fail("Your message is too long. Please shorten it and try again.", 413); }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return fail("Please check the form and try again.", 400); }
  const result = validateContact(body);
  if (!result.ok) return fail(result.message, 400);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !from) return fail(`Online sending is temporarily unavailable. Please email ${site.email}; your form details are still here.`, 503);
  const data = result.data;
  const recipients = (process.env.CONTACT_TO_EMAIL || site.email).split(",").map((email) => email.trim()).filter(Boolean);
  const text = [data.formType === "demo" ? "New Aspio HR demo request" : "New Aspio HR website enquiry", "", `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || "Not provided"}`, `Company: ${data.company}`, `Team size: ${data.teamSize}`, `Interest: ${data.interest}`, ...(data.message ? ["", data.message] : []), "", data.formType === "demo" ? "Contact details provided for arranging the requested demo." : "The sender agreed to be contacted about this enquiry."].join("\n");
  const idempotencyKey = createHash("sha256").update(JSON.stringify({ ...data, email: data.email.toLowerCase() })).digest("hex");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `hr-contact/${idempotencyKey}` },
      body: JSON.stringify({ from, to: recipients, reply_to: data.email, subject: `Aspio HR — ${data.interest}`, text }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return fail(`We couldn’t send your enquiry. Please try again or email ${site.email}.`, 502);
    return NextResponse.json({ message: "Your enquiry has been sent. Our team will be in touch." });
  } catch { return fail(`We couldn’t connect just now. Please try again or email ${site.email}.`, 502); }
}
