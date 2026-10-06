export type ContactData = { name: string; email: string; phone: string; company: string; teamSize: string; interest: string; message: string; website: string; consent: boolean; formType: "contact" | "demo" };
export const interests = ["Request a demo", "Attendance & check-in", "Staff records & branches", "Chat & collaboration", "Payroll preparation & reports", "General question"];
export const teamSizes = ["1–10 people", "11–50 people", "51–200 people", "201+ people"];
export function validateContact(input: unknown): { ok: true; data: ContactData } | { ok: false; message: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, message: "Please check the form and try again." };
  const value = input as Record<string, unknown>;
  if (value.formType !== undefined && value.formType !== "contact" && value.formType !== "demo") return { ok: false, message: "Please check the form and try again." };
  const text = (key: string) => typeof value[key] === "string" ? (value[key] as string).trim() : "";
  const data: ContactData = { name: text("name"), email: text("email"), phone: text("phone"), company: text("company"), teamSize: text("teamSize"), interest: text("interest"), message: text("message"), website: text("website"), consent: value.formType !== "demo" && value.consent === true, formType: value.formType === "demo" ? "demo" : "contact" };
  if (data.website) return { ok: false, message: "We couldn’t send this message. Please contact our team by email." };
  if (data.name.length < 2 || data.name.length > 100) return { ok: false, message: "Please enter your name (2–100 characters)." };
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, message: "Please enter a valid email address." };
  if (data.phone.length > 40 || /[\r\n]/.test(data.phone)) return { ok: false, message: "Please check your phone number." };
  if (data.company.length < 2 || data.company.length > 160) return { ok: false, message: "Please enter your company or organization name." };
  if (!teamSizes.includes(data.teamSize)) return { ok: false, message: "Please choose your team size." };
  if (!interests.includes(data.interest)) return { ok: false, message: "Please choose what you’d like to talk about." };
  if (data.message.length > 3000 || ((data.formType === "contact" || data.message.length > 0) && data.message.length < 10)) return { ok: false, message: "Tell us a little about your needs (10–3,000 characters)." };
  if (data.formType === "contact" && !data.consent) return { ok: false, message: "Please confirm we can contact you about your enquiry." };
  return { ok: true, data };
}
