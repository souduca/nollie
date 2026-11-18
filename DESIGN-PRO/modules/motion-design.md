# Motion Design

Motion explains, guides and gives personality. Never decoration alone.

## Principles
- **Purpose:** each animation should clarify a change, direct attention or add feedback.
- **Easing:** natural acceleration. Ease-out for entrances, ease-in for exits, ease-in-out for moves. Avoid linear except for continuous loops.
- **Timing:** micro-interactions 100-200 ms, UI transitions 200-400 ms, large/page transitions 400-600 ms, never block users.
- **Choreography:** stagger related elements 30-80 ms; lead the eye in reading order; keep one hero movement per moment.
- **Consistency:** shared duration and easing tokens across the product or brand.

## Classic animation principles applied
Squash and stretch (sparingly), anticipation, follow-through and overlap, arcs, secondary action, exaggeration scaled to brand tone.

## Video and titles
- Frame rate 24/25/30 fps (60 for UI captures); match project.
- Safe areas: keep text inside title-safe (~90%).
- Kinetic type: legible hold time of ~0.3 s per 2-3 words at minimum, longer for dense content.
- Sound: design with and without audio; always caption.

## Workflow
1. Script/storyboard key frames.
2. Animatic with timing.
3. Style frames at final fidelity.
4. Animate, refine easing curves, add sound.
5. Export presets per platform; test on device.

## Accessibility and performance
Honor `prefers-reduced-motion` (swap movement for fades), avoid flashing more than 3 times per second, prefer transform/opacity animation on web, keep Lottie/GIF weight low.

## Handoff
Provide duration, delay, easing curve (cubic-bezier values), properties animated, trigger, and reduced-motion alternative.
