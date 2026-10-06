import { permanentRedirect } from "next/navigation";

// The campus preview became the landing page.
export default function HomeLab() {
  permanentRedirect("/");
}
