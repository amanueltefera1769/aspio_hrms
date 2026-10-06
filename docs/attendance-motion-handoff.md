# Aspio Staff App — Attendance Motion Video Handoff

## What we want to create

Create **one smooth, continuous video** that moves from a distant view of the Aspio campus toward the Attendance reception and check-in kiosk.

This is an Attendance-only proof for approval. Do not work on Team communication or Staff records yet, and do not replace the website hero before the video is approved.

The previous attempt zoomed still images and crossfaded them one after another. That was rejected. We need the scene to behave like one camera moving through the same physical space—not a slideshow, image morph, or a zoom followed by a destination-image swap.

## Project location

```text
C:\Users\WOTO\Desktop\work\Aspio\aspio-hr
```

All project paths below are relative to this folder.

## Main image files

| Purpose | File | How to use it |
| --- | --- | --- |
| Starting frame | `artifacts/campus-keyframes-v1/attendance/00-overview.png` | The shared wide campus view. Start the camera here. |
| Destination reference | `artifacts/campus-keyframes-v1/attendance/05-arrival.png` | The reception, woman and kiosk composition to approach. Do not cut or dissolve to this image. |

Both PNGs are 1672 × 941. They contain clean architectural artwork without website headings or navigation.

### Starting view

![Wide campus starting view](../artifacts/campus-keyframes-v1/attendance/00-overview.png)

### Intended destination

![Attendance reception destination](../artifacts/campus-keyframes-v1/attendance/05-arrival.png)

## Additional reference files

These existing views can help explain the intended approach. They are **reference material, not frames to display sequentially**. Generated details vary between them; do not treat them as exact camera geometry.

```text
artifacts/campus-keyframes-v1/attendance/01-departure.png
artifacts/campus-keyframes-v1/attendance/02-early-approach.png
artifacts/campus-keyframes-v1/attendance/03-mid-approach.png
artifacts/campus-keyframes-v1/attendance/04-near-approach.png
```

Original user references, outside the project:

```text
C:\Users\WOTO\Downloads\One connected team campus-1.png
C:\Users\WOTO\Downloads\Aspio attendance check-in reception-3.png
```

Important: the original reception close-up shows an extra floor that does not exist on the front-right reception in the wide campus. Use the current `05-arrival.png` as the destination reference and **keep this reception single-storey throughout the video**.

## Camera movement

Target duration: approximately 6–8 seconds, adjusted to the animation tool's supported duration. Landscape 16:9, silent, ideally 1920 × 1080 at 24 or 30fps.

1. **Establish the campus.** Briefly hold the distant view with all three buildings and purple courtyard connections visible.
2. **Approach Attendance.** Glide forward and slightly right toward the single-storey reception in the foreground-right. Gently lower from the elevated overview toward pedestrian eye level.
3. **Show real perspective movement.** Nearby objects move across the frame faster than the distant buildings. The central Aspio monolith and rear buildings leave view naturally through framing and occlusion—not by fading away.
4. **Arrive outside reception.** Decelerate smoothly toward the woman and white check-in kiosk, with the receptionist and pale desk visible behind the glass. Do not fly through glass or walls.
5. **Hold the destination.** End on a stable, readable composition with the kiosk's simple purple check visible. No abrupt final-frame replacement.

Use one coherent camera take. Human movement should be minimal and natural; the main motion is the camera.

## What must stay consistent

- The foreground-right reception is single-storey; both rear buildings are two-storey.
- White stone/concrete, dark straight window frames, clear glass and warm oak interiors.
- The woman has long dark hair, a grey blazer, dark trousers and a black shoulder bag.
- The kiosk is white, beside the woman, with a simple purple check on its screen.
- The pale reception counter and receptionist remain in the same room.
- Lighting, building positions, scale and architectural structure remain stable.
- No bending walls, melting furniture, ghosted people or windows changing position.

## Suggested video-generation prompt

> One uninterrupted cinematic architectural camera shot of the supplied connected office campus in soft daylight. Start at the supplied elevated wide view. Glide physically forward and slightly right across the courtyard toward the single-storey Attendance reception in the foreground-right, gently lowering to pedestrian eye level. Maintain coherent perspective and natural foreground/background parallax. The two rear office buildings remain fixed in their original positions and leave frame naturally as the camera approaches. Preserve the reception's single-storey roof, white stone facade, straight dark glass frames, warm oak interior, pale reception counter and white check-in kiosk. The woman with long dark hair, grey blazer, dark trousers and black shoulder bag remains beside the kiosk; the receptionist stays behind the desk. Minimal natural human movement. Slow smoothly to a stable view of the woman, kiosk and reception, with a simple purple check visible on the kiosk. Premium realistic architectural film, consistent daylight and materials. No cuts, dissolves, slideshow transitions, image morphs, teleporting, changing building height, warped windows, double-exposed people, captions, graphic overlays or soundtrack.

Use opening/end-image controls only if the chosen generator supports them. If an exact endpoint cannot be achieved coherently, review that limitation rather than attaching the destination still as a fake ending. Do not assume the prompt guarantees architectural consistency.

## Deliverables and approval

Save the new work separately in:

```text
artifacts/attendance-motion-v2/
```

Requested outputs — these files do not exist yet:

```text
attendance-continuous-v1.mp4       # Actual continuous-motion review video
attendance-poster-v1.jpg          # Poster frame
attendance-continuous-v1-notes.md # Tool/settings, references, prompt and known defects
```

Review the whole clip at normal speed and inspect several moments during the approach. It passes only when the move is continuous, the architecture remains believable, and the camera reaches the reception without a visible scene swap. A playable video file alone is not approval.

Do not overwrite the previous images or clips. Do not call the proof complete if it still looks like stacked images.

## Website integration — only after approval

Current related files:

```text
src/app/home-lab/page.tsx
src/components/home/MotionCampusHero.tsx
src/components/home/campus-sequence.ts
src/components/home/motion-campus.css
```

Experimental preview: `http://localhost:3020/home-lab`.

After approval, integrate the video into Attendance only: selecting its building plays the approach, the last frame holds, and live HTML feature text appears. Keep accessible controls, reduced-motion still imagery, loading/error recovery and an easy return to the overview. Evaluate a reverse camera clip or reverse-playback strategy separately; do not assume native video playback supports reversing.

Keep `/`, the Ethiopia website, the other feature routes and all live data unchanged. Do not deploy or push as part of this video proof.
