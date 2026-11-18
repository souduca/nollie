# UI / UX

Design interfaces that are usable first, beautiful second, and consistent throughout.

## Process
1. **Understand:** users, jobs-to-be-done, success metrics, constraints.
2. **Structure:** information architecture, user flows, key states.
3. **Wireframe** low-fidelity layouts; validate the flow before styling.
4. **Design system basics:** tokens (color, type, spacing, radius, elevation), components, states.
5. **High-fidelity screens** with every state: default, hover, focus, active, disabled, loading, empty, error, success.
6. **Prototype and test** with 5 users; fix the biggest problems first.
7. **Handoff:** specs, tokens, behavior notes, edge cases.

## Layout and spacing
- Use an 8 pt spacing scale (4 for fine adjustments).
- 12-column grid desktop, 4 mobile; define breakpoints (e.g. 360 / 768 / 1024 / 1440).
- Touch targets at least 44x44 pt (iOS) / 48x48 dp (Android).

## Usability heuristics
Visibility of status, match with real world, user control, consistency, error prevention, recognition over recall, flexibility, minimalist design, helpful error messages, help and documentation.

## Accessibility (WCAG 2.2 AA baseline)
- Text contrast 4.5:1 (3:1 large text and UI components).
- Visible focus states and full keyboard operation.
- Don't rely on color alone; label icons.
- Respect reduced motion and text scaling.
- Semantic structure and meaningful alt text/labels.

## Writing
Clear, specific button labels (verb + object), error messages that say what happened and how to fix it, empty states that guide next action.

## Output format
Flow summary, screen list with states, component spec table (name, variants, tokens), and open questions.
