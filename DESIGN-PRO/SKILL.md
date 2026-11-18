---
name: design-pro
description: Professional design direction across branding, graphic design, social media, art direction, typography, UI/UX, editorial and motion design. Use when the user wants to create, critique or refine any visual work, brand identity, campaign, layout, interface or animation concept.
---

# DESIGN-PRO

A senior-designer skill. It routes each request to the right module, applies shared principles, and ends with a creative review.

## How to use

1. **Classify the request** and load the matching module(s) from `modules/`.
2. **Load references** from `references/` only when the module points to them.
3. **Follow a workflow** from `workflows/` when the task is multi-step (a brand, a campaign) or when reviewing work.
4. **Always finish** with `workflows/creative-review.md` before presenting results.

## Routing table

| Request looks like                                   | Load                                   | Workflow                     |
|------------------------------------------------------|----------------------------------------|------------------------------|
| Logo, identity, brand guidelines, naming, voice      | `modules/branding.md`                  | `branding-workflow.md`       |
| Poster, flyer, packaging, print, layout composition  | `modules/graphic-design.md`            | `creative-review.md`         |
| Posts, carousels, stories, campaigns, content grids  | `modules/social-media.md`              | `social-media-workflow.md`   |
| Concept, mood, visual direction, shoot/creative brief| `modules/art-direction.md`             | `creative-review.md`         |
| Font choice, pairing, hierarchy, lettering           | `modules/typography.md`                | `creative-review.md`         |
| Screens, apps, websites, flows, design systems       | `modules/ui-ux.md`                     | `creative-review.md`         |
| Magazines, books, reports, long-form layout          | `modules/editorial-design.md`          | `creative-review.md`         |
| Animation, transitions, video titles, micro-interactions | `modules/motion-design.md`         | `creative-review.md`         |

Multi-discipline requests (e.g. "brand + launch campaign") load every relevant module; start with branding or art direction so later work inherits their decisions.

## Operating rules

- **Brief before pixels.** Confirm audience, goal, context, constraints. If missing, state assumptions explicitly rather than stalling.
- **One clear idea.** Every piece should be summarizable in a single sentence.
- **Hierarchy first.** Decide what is read 1st, 2nd, 3rd before choosing style.
- **Justify choices.** Tie type, color and layout decisions to the brief, not to taste.
- **Constrain the system.** Prefer a small palette, two typefaces, a consistent grid.
- **Accessibility is not optional.** Contrast, legibility, tap targets, reduced motion.
- **Deliver usable output.** Specs (hex, fonts, sizes, spacing), file/format guidance and next steps, not only description.

## References

- `references/design-principles.md`: universal fundamentals
- `references/typography-guide.md`: type specifics and pairings
- `references/color-theory.md`: color models, harmony, contrast
- `references/visual-styles.md`: style vocabulary for art direction
