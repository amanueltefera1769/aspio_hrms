# Free campus motion preview

## Product and scope

An isolated marketing hero at `/home-lab` for business owners, HR teams and multi-branch managers. The visitor understands the connected workspace, chooses Attendance, sees an illustrative check-in and follows the service or demo link. Back to overview provides recovery; the original-home comparison remains below the hero. On mobile, the product copy and primary CTA precede the scene. The route remains noindex and excluded from the sitemap.

All three sequences (Attendance, Team communication, Staff records) and the connected-campus summary are implemented for visual approval. All other Home sections remain in place. `src/app/page.tsx` is untouched.

## Direction and implementation

Preserve the photographic white-concrete/glass/oak architecture of the user's references. Use real Aspio branding, large live HTML headings, native controls and labeled example data. The supplied pictures are visual artwork, not live product captures or verified customers.

`src/components/home/MotionCampusHero.tsx` uses matching generated keyframes in one shared art box. Attendance has six views including the shared overview; Team communication and Staff records each have five. `campus-sequence.ts` aligns a measured subject anchor and apparent size between adjacent views, then animates a pan/zoom with a short blend into the next view. The outgoing image stays opaque beneath the incoming image to avoid a white flash. A hop lasts 620ms: overview ↔ Attendance takes 3.1 seconds, the other routes 2.48 seconds. Feature-to-feature navigation reverses to the shared overview before taking the new route, rather than directly swapping unrelated rooms.

Retargeting mid-leg reverses toward the requested end, or finishes at the nearer end and continues. This is 2D motion graphics, not a calibrated continuous 3D camera flight. Generated details still vary between views; people and architecture are still, while the feature examples animate as live UI. The hero downloads no 3D model or video file and adds no runtime dependency. Three separate WebM previews are available for review, not used as hero downloads.

The Back/Overview control reverses both layers from their current frame, including an interrupted transition. Animation ends hold their frames; there is no continuous rendering loop or automatic tour. Sample Sara/Daniel check-ins and the receipt animate once and can be replayed. Both rows stay present as labeled example data; no attendance data is stored or transmitted.

The motion toggle switches to instant image states. OS reduced-motion preferences do the same, show all example feedback immediately and finish an in-progress transition if the preference changes. Hidden building links and outgoing copy are inert; native buttons support keyboard use and visible focus. Normal scrolling is never captured. Intermediate images load only after their route is selected; the interface shows a preparation status. A failed intermediate image falls back to the selected destination with a readable notice. Image failures preserve copy, service links and demo access. A noscript link makes Attendance details reachable without JavaScript.

## Current assets and provenance

The complete [keyframe gallery and clips](../artifacts/campus-keyframes-v1/README.md) contains 14 unique PNG review masters, the actual image-generation prompts and source references, an optimization report, and three WebM motion previews. The built-in image generator produced matching architectural views from the user's references and shared clean overview. No external video subscription or API key was used; built-in image generation is subject to the product's normal usage allowance.

`node scripts/prepare-campus-sequences.mjs` uses the existing Sharp dependency for mechanical resizing and WebP conversion. Runtime assets live in `public/images/campus/sequences-v1/`. All fourteen WebPs total approximately 1.49MB; the four stable overview/destination planes total approximately 551KB before intermediate route loading. The generated clean views have no baked page headings, navigation or feature pills: those remain accessible HTML. The supplied originals are untouched.

## Original crop prototype — retained, no longer used here

The original supplied images are not modified:

- `One connected team campus-1.png`: crop x=730, y=88, width=942, height=764 → `overview.webp` (129,088 bytes). Starts below the baked nav and right of the baked headline; keeps the baked label connectors.
- `Aspio attendance check-in reception-3.png`: crop x=917, y=278, width=755, height=574 → `attendance.webp` (63,666 bytes).
- `Aspio team communication room-2.png`: crop x=852, y=228, width=820, height=624 → `team.webp` (86,792 bytes).
- `Aspio staff records office-5.png`: crop x=732, y=145, width=940, height=715 → `records.webp` (91,002 bytes).

`node scripts/prepare-campus-preview.mjs <reference-directory>` was the original mechanical crop workflow. Those WebPs remain available, but `/home-lab` now uses the generated sequence assets above. Production uses saved local assets and does not need the Downloads folder.

Earlier Three.js source/model assets and the earlier generated campus image are retained but unused by this route. The browser check asserts there are no canvas, GLB, MP4 or WebM downloads for this preview.

## Verification

Run `node scripts/verify-campus-sequences.mjs` with the local server running. `PREVIEW_URL` can point at a local production server; `CHROME_PATH` overrides the installed Chrome path. The earlier `verify-motion-campus.mjs` remains as a historical prototype check.

- 320, 390, 768, 1024, 1440, 1920px: source decoding, one H1, noindex, no overflow, keyboard selection, example labeling, service links, reduced motion, sample replay, mobile navigation, demo journey and original-home comparison.
- 390, 1440px: actual animated scale, generated intermediate view, finished state, reverse, interrupted reverse, feature changes through the overview, rapid retargeting, replay timing, motion toggle and changing reduced-motion preferences.
- Lazy intermediate loading, a blocked intermediate image, blocked artwork and JavaScript-disabled fallback.
- Page errors collected; no contact submissions or live HR changes.

Screenshots: `artifacts/campus-sequence-overview-<width>.png`, `campus-sequence-attendance-<width>.png`, `campus-sequence-push-in-<width>.png`, `campus-sequence-dissolve-<width>.png`, `campus-sequence-animated-attendance-<width>.png`, plus Team, Records and connected-summary views. Lint, types, six unit tests, production build and the production-server browser suite passed on 2026-10-06.

To regenerate the optional review clips, run `node --experimental-strip-types scripts/record-campus-sequences.mjs http://localhost:3020`. The script exports pure artwork motion using browser Canvas/MediaRecorder, not a paid video service. Run `node scripts/verify-campus-videos.mjs` to decode all three clips and capture midpoint/arrival evidence. Verified outputs are 1280×720: Attendance 4.226s, Team 3.590s, Records 3.594s, including starting/ending holds.

Review should prioritize faithful artwork, readable copy, reception identification, real controls, CTA access, image continuity and touch/keyboard recovery. Anchor alignment and short blends reduce the original abrupt destination swap, but they do not eliminate generated geometric drift. The original homepage is unchanged, and this experiment has not been deployed or promoted to `/`.
