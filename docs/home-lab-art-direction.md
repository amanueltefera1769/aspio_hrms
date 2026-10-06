# Connected workplace hero experiment

Historical direction for the earlier generated still-image experiment. The current `/home-lab` route uses the free reference-image Attendance preview documented in [motion-campus-preview.md](motion-campus-preview.md), not `ExperimentalHero` or the reconstructed Three.js campus. The generation provenance below is retained for the unused earlier asset.

## Scope and product brief

`/home-lab` duplicates Home, replacing only its hero. The original `src/app/page.tsx`, interactive workspace, Services, About and Contact are preserved. The experimental route is excluded from the sitemap and marked noindex; it is not a new primary navigation item. The comparison link returns to the original Home.

Surface: a marketing experiment within an existing standalone Next.js website. Visitors are business owners, HR teams and multi-branch managers. Their first decision is which everyday HR connection matters to them. Priority: Aspio identity, understandable HR capability, exploration, demo request. Recovery: choose another capability, pause motion, return to the original or contact the team. Mobile keeps the header demo action available and places feature exploration below the scene. The foundation remains React, native accessible buttons, Next Image, local Geist and the existing Aspio icons and styles; no new runtime dependency.

## Direction

A human-scale architectural workplace turns attendance, conversations, staff records and branches into one connected environment. The reference's full-bleed miniature composition and luminous routes are reinterpreted for people operations, not copied as an industrial scene. White architecture, soft sage planting and lilac pathways support Aspio purple and the existing display typography. Large live HTML copy sits over the quieter foreground; capability markers are real buttons, not baked graphics. Labels describe capabilities rather than pretending to show live customer activity. Payroll remains payroll preparation, and biometric support is qualified.

Motion is concentrated in a slow CSS camera drift, restrained pointer parallax, travelling SVG signals, marker float and a seven-second chapter tour. Manual selection pauses the tour. Pause/play controls all scene motion; hovering or focusing a marker steadies its camera and markers. IntersectionObserver suspends offscreen motion and timers. Reduced-motion preferences disable automatic motion and chapter cycling, while manual selection remains available. Live announcements follow only explicit selections, avoiding constant screen-reader interruptions.

Phone layouts crop into headquarters, show one selected signal and expose all five capabilities in stationary chapter buttons. Tablet marker positions stay inside the visible scene. Detail text and CTA remain live HTML. The architectural image is illustrative, not a screenshot of an operational product.

## Generated asset provenance

- Tool: built-in image generation, generate mode; one new asset, no reference image edit.
- Final asset: `public/images/connected-workplace.webp` (1672 × 941, 271,366 bytes).
- Original generation: `C:/Users/WOTO/.codex/generated_images/019fd202-642a-7bf3-b7b9-907648040198/exec-2b109cd5-2f0d-4b13-8ba3-c330e59764da.png`.
- Conversion: `node scripts/prepare-lab-scene.mjs <generated-png>`; Sharp resize without enlargement and WebP quality 88. No image regeneration is required to deploy.
- Next Image handles responsive delivery; the bitmap is preloaded. Motion adds only local SVG/CSS/React, not a WebGL library or video payload.
- The user's campaign graphics are feature references, not used as page assets.

### Exact generation prompt

Use case: stylized-concept.
Asset type: production-quality, immersive wide website hero background for Aspio HR. Landscape 16:9, high-resolution 3D miniature architectural diorama, absolutely no typography or logos or UI labels anywhere.
Primary request: a refined photorealistic 3D connected workplace, like a beautifully crafted physical scale model viewed from a high 40-degree oblique aerial camera. White and pearl-gray architecture, glass, fine realistic details, soft ambient occlusion, lilac accent lighting. This is an HR and staff management business, NOT a factory, NOT robotics, NOT an industrial plant.

Scene: a central two-story contemporary office headquarters with a partial cutaway roof exposing a warm white open-plan office, meeting table, small desks with monitors and chairs, plant pots, people working. In the top-left and top-right distance are two smaller branch offices, architectural siblings of the main office. Their windows have subtle warm interior light. A pedestrian entrance courtyard across the middle/front of the headquarters has a small clearly recognizable biometric fingerprint check-in terminal on a pillar near glass entry doors. An elegant smartphone-shaped app display stands as a small architectural kiosk on the left foreground. On the right is a small pavilion for people and record review, with neatly organized paper files and a tiny monitor, not giant floating paper. Include about 10 tiny realistically proportioned business people in cream, charcoal, muted lilac and sage clothing, walking or talking in pairs or working at desks. No robots. Low frosted perimeter fences, potted trees, small planter beds and a few steps add scale. The ground is a continuous matte off-white plane that disappears into a pale mist.

Composition: broad cinematic scene filling the upper 72% of the image, an interesting central office at center-right, smartphone and check-in entrance at middle-left, branch offices high left and high right. Camera sees roofs and fronts clearly, with precise miniature geometry and photographic three-dimensional depth. A sweeping network of understated glowing lavender-white pathways embedded in the ground connects offices and entrance across the image. Central HQ is the anchor. Lower 25% is pale clear floor and mist fading to near-white, with particularly clean negative space in the lower left for a large live HTML heading. Leave the top 10% soft and airy for site navigation. Do not render any words, text, charts with numbers, bubbles, captions, icons, logos or watermark. No visible UI overlays: these will be added with real interactive HTML later.

Mood and finish: a premium architectural visualization studio render, tasteful, intricate and believable. Soft daylight, shallow atmospheric haze at far edges, luminous white materials with lilac purple accent light in window edges and ground routes. White-gray neutrals dominate, touches of sage green plants and warm champagne interior lighting. Not plastic toy cartoon, not flat vector art, not blue tech sci-fi. Depth comes from exceptionally clean modeling, material lighting, contact shadows and architectural details. The overall scene should feel calm, human and alive.

## Verification

`node scripts/verify-home-lab.mjs` checks 320, 390, 768, 1024, 1440 and 1920px, image decoding, heading hierarchy, no overflow, noindex, all five chapter buttons, keyboard exploration, reduced-motion behavior, mobile navigation, original-page comparison and the demo journey. Motion checks cover travelling signals, pause/play, automatic chapter progression, manual selection and offscreen suspension. Screenshots are written to `artifacts/home-lab-hero-<width>.png`; full-page captures are also saved at 390 and 1440px. Inspect screenshots after significant layout changes.

Visual review should prioritize legible hero copy, clearly identified interactive markers, foreground contrast, tablet marker clipping, mobile CTA access and quiet space around the active detail. This is a reviewable experiment, not a replacement or deployment of the current homepage.
