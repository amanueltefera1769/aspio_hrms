import { test } from "node:test";
import assert from "node:assert/strict";
import { validateContact } from "../src/lib/contact-validation.ts";
const enquiry = { name: "Liya Bekele", email: "liya@example.com", phone: "+251911234567", company: "Example company", teamSize: "11–50 people", interest: "Request a demo", message: "We want to connect attendance across two branches.", website: "", consent: true };
test("valid enquiry is accepted and surrounding whitespace is normalized", () => {
  const result = validateContact({ ...enquiry, name: "  Liya Bekele  " });
  assert.equal(result.ok, true);
  assert.equal(result.data.name, "Liya Bekele");
});
test("rejects malformed email, missing consent, unknown choices and a honeypot submission", () => {
  for (const override of [{ email: "not-an-email" }, { consent: false }, { interest: "injected" }, { teamSize: "other" }, { website: "https://bot.example" }]) assert.equal(validateContact({ ...enquiry, ...override }).ok, false);
});
test("rejects excessive input and missing company details", () => {
  assert.equal(validateContact({ ...enquiry, message: "a".repeat(3001) }).ok, false);
  assert.equal(validateContact({ ...enquiry, company: "" }).ok, false);
  assert.equal(validateContact(null).ok, false);
});
test("demo requests do not require a description or agreement checkbox", () => {
  const { message, consent, ...demo } = enquiry;
  assert.ok(message);
  assert.equal(consent, true);
  const result = validateContact({ ...demo, formType: "demo" });
  assert.equal(result.ok, true);
  assert.equal(result.data.formType, "demo");
  assert.equal(result.data.message, "");
  assert.equal(result.data.consent, false);
  assert.equal(validateContact({ ...demo, formType: "demo", message: "   " }).ok, true);
});
test("demo requests never record a separate checkbox agreement, including stale clients", () => {
  for (const consent of [undefined, false, true]) {
    const result = validateContact({ ...enquiry, formType: "demo", consent });
    assert.equal(result.ok, true);
    assert.equal(result.data.consent, false);
  }
});
test("Contact still requires an explicit agreement, including enquiries with a demo interest", () => {
  for (const formType of [undefined, "contact"]) {
    for (const consent of [undefined, false, "true"]) {
      assert.equal(validateContact({ ...enquiry, formType, consent }).ok, false);
    }
    assert.equal(validateContact({ ...enquiry, formType, consent: true }).ok, true);
  }
});
test("Contact still requires a description, including enquiries with a demo interest", () => {
  for (const formType of [undefined, "contact"]) {
    assert.equal(validateContact({ ...enquiry, formType, message: "" }).ok, false);
    assert.equal(validateContact({ ...enquiry, formType, message: "short" }).ok, false);
  }
});
test("demo requests retain field validation, message size and honeypot protection", () => {
  const demo = { ...enquiry, formType: "demo", message: "" };
  for (const override of [{ email: "bad" }, { company: "" }, { name: "" }, { teamSize: "other" }, { website: "bot" }, { message: "a".repeat(3001) }, { formType: "unknown" }, { formType: 1 }]) {
    assert.equal(validateContact({ ...demo, ...override }).ok, false);
  }
});
