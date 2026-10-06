# Aspio HR website

A standalone Next.js / React website for Aspio HR. It has its own package.json, lockfile, node_modules, routes, assets, local font and contact endpoint. It does not import the Ethiopia website, its database, environment variables, backend or analytics.

## Run locally

Project location: `C:\Users\WOTO\Desktop\work\Aspio\aspio-hr`. This is a separate sibling project, not a subfolder of the Ethiopia website.

Requires Node.js 22.13 or newer.

```powershell
cd C:\Users\WOTO\Desktop\work\Aspio\aspio-hr
npm install
npm run dev
```

Open http://localhost:3020. For a production build, run `npm run build`, then `npm start`.

## Pages

- `/` — Home: an interactive HR dashboard, five code-native feature previews, a multi-branch network, staff profiles, FAQs and demo request. The campaign images are not used on the landing page.
- `/services` — Interactive workspace hero, numbered feature rail, biometric terminal and mobile check-in demo, product previews, everyday tools, FAQs and demo request.
- `/about` — A people-first editorial page with product purpose, principles, connected-workday feature links and both contact addresses. Home, Services and About do not use the campaign graphics.
- `/contact` — Enquiry form; `/contact?request=demo` selects a demo request.
- `/home-lab` — A separate Home duplicate with a free, image-based campus-to-Attendance preview: reversible push-in, deliberate dissolve to reception, sample check-ins, replay and reduced-motion controls. The other two campus labels link to Services until their sequences are approved. Original Home is unchanged; the experiment remains noindex with a comparison link.

The product preview uses explicitly labeled example data. This project is the marketing website, not the HR application itself. The existing Staff page remains in the Ethiopia project.

## Contact delivery

Copy `.env.example` to `.env.local`, then fill in:

```dotenv
SITE_URL=https://your-hr-website.example
RESEND_API_KEY=your-own-key
CONTACT_FROM_EMAIL=Aspio HR <hr@your-verified-domain.example>
CONTACT_TO_EMAIL=semere.e@aspio.se
```

`CONTACT_FROM_EMAIL` must be a sender on a domain verified in your Resend account. `CONTACT_TO_EMAIL` supports comma-separated recipients, e.g. `semere.e@aspio.se,team@example.com`. These values belong only to this project’s server environment. Both addresses appear on the website, matching the English and Amharic contacts in the existing Ethiopia website.

The form validates on the server, limits request size, checks the request origin, includes a honeypot and uses Resend idempotency keys to avoid sending the same retry twice. It only shows success after the provider accepts the message. If delivery is unavailable, fields are preserved and a link opens an email draft containing the enquiry. No messages were sent during development verification.

Resend integration reference: https://resend.com/docs/api-reference/emails/send-email

Optional: set `NEXT_PUBLIC_STAFF_APP_URL` to the HR app’s permanent HTTPS production address to enable a **Sign in** link. No temporary Vercel share token is included.

## Independent deployment

This folder can be copied to a separate repository as-is. For Vercel, import that repository (or select `aspio-hr` as the project root), choose Next.js, and set the variables above. Deploying this website does not require changing the Ethiopia deployment. Any Node host supporting Next.js can run `npm run build` and `npm start`.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
# With npm run dev running in another terminal:
npm run verify:browser
node scripts/verify-landing.mjs
node scripts/verify-hero.mjs
node scripts/verify-services.mjs
node scripts/verify-about.mjs
node scripts/verify-home-lab.mjs
```

Browser verification uses Playwright with the installed Chrome browser and writes screenshots to `artifacts/`. Set `CHROME_PATH` if Chrome is installed in a different place. It exercises navigation, responsive widths, preview switches, FAQs, and contact failure/success states without sending real email.

The landing-specific check covers 320, 390, 768, 1024, 1440 and 1920px widths, every feature panel, the branch selector and branch network, keyboard check-in method selection and the demo journey.

The hero-specific check verifies all seven screen views, logo loading, branch-filtered staff, search and empty results, profile disclosure, sample check-ins, preview-only chat, file selection and report periods at desktop, tablet and mobile widths. These actions do not change live HR data or send messages.

The Services-specific check covers six widths from 320 to 1920px, hero preview switches, feature anchor visibility below both sticky navigation bars, active-section updates, keyboard check-in buttons with usable touch targets, FAQs, logo loading and the demo journey.

The About-specific check covers the same six widths, the purpose anchor, campaign-free visuals, both contact addresses, feature links and demo navigation. It does not send email.

The experimental-home check covers six widths, Overview and Attendance, keyboard and mobile navigation, image loading, actual push-in/dissolve, interrupted reversing, replay, motion controls, changing reduced-motion preferences, image-failure and no-JavaScript fallbacks, original-home comparison and demo navigation. The current implementation is documented in `docs/motion-campus-preview.md`. It loads no model or video assets and needs no generation account, API key or credits.

## Assets

The five supplied graphics are optimized WebP files under `public/images`. The Aspio logo and favicon are local copies. The typeface is Geist, included locally with its license. No runtime downloads or dependencies on the old project’s files are needed.

To regenerate graphics from the originals, run `node scripts/prepare-assets.mjs <graphics-directory> <brand-directory> <font-file>`. The `brand-directory` should contain `assets/aspio-logo.png` and `aspio-favicon.png`. Regeneration is optional; production assets are already included.

Shared feature content and contact information live in `src/lib/site.ts`. Global layout rules live in `src/app/globals.css`; Home primitives live in `src/app/home.css`, Services layouts in `src/app/services/services.css`, and About layouts in `src/app/about/about.css`. Services hero and attendance illustrations own their styles under `src/components/services`.
