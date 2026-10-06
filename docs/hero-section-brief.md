# Aspio Staff App — Interactive Campus Hero Brief

## What we are trying to achieve

Create a visually impressive landing-page hero that explains Aspio Staff App through one connected architectural campus. Visitors should immediately understand the message:

> Different branches. One connected team.

Each building represents a real product capability. Selecting a building brings the visitor closer to that capability and shows a small, understandable example of how it works. The goal is to make attendance, team communication and staff records feel connected—not to build an actual HR application inside the website.

The experience should stay close to the supplied visual references: realistic architecture, warm office interiors, people, generous white space and Aspio purple.

## Project scope

- Work on the duplicate landing page at `/home-lab` in the standalone `aspio-hr` project.
- Replace only the experimental hero; preserve the sections below it.
- Leave the original homepage at `/` unchanged.
- Keep the experiment out of the sitemap and marked noindex until a later decision to publish it.
- Do not change the Ethiopia website, its backend or live HR data.

Local preview: `http://localhost:3020/home-lab`.

## Chosen approach: free image-based motion graphics

We moved away from the reconstructed real-time 3D campus because its appearance did not match the references closely enough. Paid video generation is also outside the chosen approach.

Instead, derive matching camera keyframes from the supplied references and animate them in the browser:

1. Start with the distant campus overview.
2. The visitor selects a building or its feature control.
3. Pan and zoom through that route's progressively closer keyframes.
4. Briefly blend adjacent, anchor-aligned views until reaching the matching close-up.
5. Hold the close-up while live text and a small product example appear.
6. Let the visitor replay the example, explore the service or return to the overview.

The implementation provides three interactive browser-animation sequences plus three standalone WebM previews. The runtime animation and clip export need no paid video subscription or API key. Matching still assets were created with the built-in image generator, subject to the product's normal usage allowance; do not claim image generation consumes no allowance.

**Important limitation:** this is 2D motion, not a genuine camera flying through a 3D environment. Matching intermediate views, measured anchors and short blends reduce the destination jump, but generated architecture and figure details still drift. People and architecture remain still; interface elements provide feature-specific animation. Do not describe it as generated video footage or a perfectly continuous spatial camera move.

### Current camera transition

Each building is one move: the overview pushes in toward the building with depth parallax (nearer ground grows faster than the subject, from an offline depth map), a single zoom-blur and bloom cut lands on the close-up, and the close-up keeps easing forward to rest. In-between images were removed: each was redrawn from a different angle, so blending them read as a stack of pictures. The depth layer is a small WebGL canvas drawn only during a move; without WebGL or the depth map, the same move plays on the plain pictures.

Files: `src/components/home/campus-sequence.ts` (timing and shader values), `src/components/home/campus-depth.ts` (depth layer), depth maps in `public/images/campus/sequences-v1/depth/` (regenerate with `scripts/prepare-campus-depth.mjs`).

## Visual direction

- Photographic architectural artwork, not toy-like 3D models or generic dashboard illustrations.
- White concrete, clear glass, slim dark window frames and warm oak interiors.
- Realistic business people and recognizable working spaces.
- Thin purple ground connections between buildings and the central Aspio mark.
- The actual Aspio logo in the navigation—not a text approximation.
- Large, readable live headings with purple emphasis.
- Quiet negative space behind copy; artwork must not compete with readability.
- Feature labels anchored to the relevant buildings and implemented as real controls.
- Stable navigation, a visible demo action and an easy return path.

Do not present a complete screenshot as the website. Use clean artwork without baked page UI, and implement website text, navigation, buttons and product examples separately. The supplied originals must remain untouched.

## The three feature sequences

| Sequence | Destination | Feature-specific motion | Current status |
| --- | --- | --- | --- |
| Attendance | Reception and check-in kiosk | Check-in results arrive, followed by an attendance confirmation | Working preview |
| Team communication | Meeting room | Sara's update arrives, a typing indicator, then Daniel's reply | Working preview |
| Staff records | Staff records office | Sara's profile, then Personal details and Attendance history disclosures with a week of check-ins | Working preview |

All three start from the same overview and follow the same interaction language. Features can also be reached from each other (toolbar or "Next"): the camera returns through the shared overview before approaching the next building, avoiding a direct room-to-room image swap.

### Campus overview

Heading:

> Different branches.  
> One connected team.

Supporting text:

> Explore how attendance, team conversations and staff records work together.

Primary action: **Request a demo**.

The overview invites visitors to choose a building (**Choose a building to explore**) and shows how many of the three have been explored.

### Connected campus summary

After all three features are visited, returning to the overview shows the summary state from `Connected campus, one team-4.png`: kicker **ONE CONNECTED WORKSPACE**, supporting text **Attendance, team conversations and staff records, connected through Aspio.**, a check on each building label, and **Explore again**. The staff-records view leads here through **See the connected campus**.

### 01 — Attendance

Heading:

> Every check-in.  
> In one place.

Supporting text:

> See attendance across your branches in one shared workspace.

Example: Sara checks in at 08:30 and Daniel at 08:42. A confirmation shows that attendance has been recorded. Clearly label the panel as **Example data**.

Explain **app check-in or a supported biometric device**. Do not imply compatibility with every biometric machine.

Actions: **Explore attendance**, **Replay check-in**, **Back to overview**.

### 02 — Team communication

Heading:

> Keep conversations  
> with your team.

Supporting text:

> A shared place for team updates and everyday conversations.

Implemented example: a short team update followed by a typing indicator and reply. Messages appear progressively and remain readable. It is labelled as an example conversation, not a live chat session.

Actions: **Explore team communication**, a replay control if useful, and **Back to overview**.

### 03 — Staff records

Heading:

> Staff information.  
> Kept together.

Supporting text:

> Keep staff records and attendance together for payroll preparation.

Implemented example: a staff profile with personal details and attendance history. Progressive disclosure avoids a dense dashboard; information is clearly labelled as example data.

Refer to **payroll preparation**, not an unsupported claim that the product is a full payroll engine.

Actions: **Explore staff records**, a replay control if useful, and **Back to overview**.

## Motion and interaction rules

- Motion is triggered by the visitor; do not force an automatic tour.
- Keep normal page scrolling. Do not trap scrolling to advance the hero.
- Each keyframe hop lasts 620ms: Attendance takes 3.1 seconds, Team and Records 2.48 seconds, excluding initial asset preparation.
- Concentrate motion on the push-in, transition and feature example.
- Hold the selected close-up after arrival rather than looping continuously.
- Returning to the overview should reverse smoothly, including when selected mid-transition.
- Rapid input must not leave the scene, selected control and text out of sync.
- Replay repeats the example feedback without changing or submitting real data.
- The request-a-demo action continues to the existing contact/demo page.

## Mobile, accessibility and loading

- On mobile, show the product message and primary action before the scene.
- Use compact, reachable controls rather than shrinking desktop UI to unreadable sizes.
- Preserve native keyboard operation, visible focus and meaningful control names.
- Respect reduced-motion preferences and provide a motion-off option.
- With motion disabled, show the destination and all example feedback immediately.
- Make hidden scene controls unavailable to keyboard navigation.
- Load intermediate assets on route selection, with a preparation status; if a bridge image fails, show the destination and a readable notice.
- If artwork fails to load, preserve useful text, service links and demo access.
- Provide a route to Attendance details without JavaScript.
- Use local optimized image assets. Avoid model downloads, video payloads and unnecessary continuous rendering.

## Reference artwork

The supplied references establish the composition and feature environments:

- `One connected team campus-1.png` — opening campus overview.
- `Aspio attendance check-in reception-3.png` — Attendance close-up.
- `Aspio team communication room-2.png` — Team communication close-up.
- `Aspio staff records office-5.png` — Staff records close-up.
- `Connected campus, one team-4.png` — connected-campus summary reference.

The current preview uses 14 generated PNG review masters derived from these references: a six-view Attendance sequence and five-view Team/Records sequences sharing the same overview. Optimized local WebPs serve the website. Original crops and earlier 3D assets are retained but unused by this hero. See the [complete gallery, prompts and clips](../artifacts/campus-keyframes-v1/README.md).

## What exists today

- Overview, all three feature scenes and the connected-campus summary, with live HTML copy and controls.
- Clickable live labels and building hotspots for all three buildings, over clean artwork without baked captions.
- Reversible, anchor-aligned 2D pan/zoom through generated intermediate views, feature switching through the shared overview, and mid-motion retargeting.
- Reference-style toolbar: Back to overview, 01/02/03 feature switcher, Next / See the connected campus, explored progress and the motion toggle.
- Animated, replayable examples for all three features, each labelled as example data or an example conversation.
- Motion toggle, reduced-motion handling and loading/error fallbacks.
- Stacked layout up to 900px (copy and CTA first), and links back to the original homepage.

Implementation files:

- `src/components/home/MotionCampusHero.tsx`
- `src/components/home/campus-sequence.ts` (routes, camera anchors and animation frames)
- `src/components/home/motion-campus.css`
- `src/app/home-lab/page.tsx`
- `public/images/campus/sequences-v1/` (optimized current keyframes)
- `artifacts/campus-keyframes-v1/` (PNG masters, prompts, reports and WebM previews)
- `scripts/prepare-campus-sequences.mjs` (optimizes saved masters)
- `scripts/record-campus-sequences.mjs` (exports review clips)
- `scripts/verify-campus-sequences.mjs` and `scripts/verify-campus-videos.mjs`

For asset provenance and implementation details, see [motion-campus-preview.md](motion-campus-preview.md).

## Next steps and acceptance criteria

Review all three sequences and the summary together for visual fidelity, motion quality and readability before considering the original homepage.

The hero is successful when:

- Its artwork resembles the supplied references and feels cohesive across scenes.
- Visitors understand what each building represents and can explore it without instructions becoming the main content.
- Motion feels intentional, with no broken states or claims of real 3D/video movement.
- Text and controls remain readable and usable on desktop and mobile.
- Demo, service, replay and return actions work as expected.
- Examples are clearly illustrative and no live HR records are changed.
- Reduced motion and failure states still offer a useful experience.
- Runtime motion and clip export do not require a paid video service; built-in image asset generation follows the product's usage allowance.
- The original homepage stays unchanged until explicitly approved for replacement.

Completed checks cover 320–1920px layouts, keyboard interaction, lazy image loading, reversible/interrupted motion, replay, reduced-motion changes, bridge-image and whole-artwork fallbacks, and navigation. Run `node scripts/verify-campus-sequences.mjs` with the local server running, alongside lint, type checks, tests and a production build after implementation changes. All passed against a production build on 2026-10-06; the three exported clips also passed decoding, dimension and duration checks.
