---
name: reference-site-modernization
description: >-
  Modernizes a site’s UI to match a user-supplied reference URL by inspecting
  the reference (DevTools, network, fonts, motion) and porting look-and-feel
  into the existing stack while preserving content. Use when the user shares a
  reference website, asks to match another site’s design, typography, colors,
  scroll animations, or to use empty side margins for a bolder modern layout.
---

# Reference-site modernization

## When this applies

Use this skill when the user pastes **one or more reference URLs** and wants their **own site’s content unchanged** but the **visual language** (fonts, palette, spacing, scroll behavior, density) brought closer to the reference.

**Out of scope without explicit ask:** rewriting copy, changing information architecture, or replacing all content with the reference site’s text.

---

## Operating principles

1. **Content stays, chrome moves.** Preserve MDX/HTML copy, routes, and data; change layout components, global CSS, tokens, and motion layers.
2. **Inspect before imitating.** Do not guess fonts or animation libraries; **verify** in DevTools or equivalent.
3. **Match intent, respect rights.** Aim for a **look-alike** in *your* codebase using licensed fonts and original assets; do not hotlink or redistribute proprietary images from the reference unless the user owns rights.
4. **Prefer the project’s stack.** Implement motion and layout with dependencies already in the repo; add new libraries only when the reference clearly requires them and the user agrees to the bundle cost.

---

## Phase 1 — Deconstruct the reference

Work through this in order; skip steps only if the user already provided exports (e.g. Figma tokens).

### A. Tech signals

- **Network tab:** JS bundles often reveal **React/Vue/Svelte**, **Framer Motion**, **GSAP**, **Lenis**, **Locomotive Scroll**, **Tailwind**, etc.
- **Elements + Computed:** Confirm **font-family** stacks, **font-weight**, **letter-spacing**, **line-height**, **color** (RGB/OKLCH), **max-width** of text columns, **padding** on main containers.
- **Sources / build artifacts:** Sometimes show design tokens or CSS variable names (`--color-*`, `--font-*`).
- **Performance / Layers:** Heavy scroll sites may register **requestAnimationFrame** loops or **IntersectionObserver** (search minified sources if needed).

Document findings in a short bullet list: *framework hints, animation libs, font names, key colors, container widths.*

### B. Fonts

- Identify **exact family names** from Computed styles or `@font-face` rules.
- Check whether fonts are **Google Fonts**, **Adobe Fonts**, **self-hosted**, or **system stacks**.
- Plan to add the same families via **next/font** or **CSS `@import` / link** consistent with the project—**do not** assume Inter is “close enough” if the reference uses something else.

### C. Color and surfaces

- Sample **background**, **text primary/secondary**, **borders**, **accent**, **links**, **selection**.
- Note **dark mode** behavior if present (media query vs class on `html`).

### D. Motion

- Distinguish: **CSS transitions** on scroll-linked classes vs **JS-driven** scroll (smooth scroll libraries, parallax, reveal-on-scroll).
- Note **duration**, **easing**, **stagger**, and whether motion is **per-section** or **global**.

---

## Phase 2 — Map to the current codebase

1. Read **`app/layout.tsx`**, **`globals.css`** (or Tailwind config), and shared **layout components** (header, main width, prose container).
2. Identify what constrains width (e.g. `max-w-[680px]`, `container-content`) and what creates **empty side space**—usually **narrow max-width** + **centered column**.
3. Plan changes as **design tokens first** (CSS variables), then **component layout** (grid with side gutters, asymmetric columns, or wider `prose`).

---

## Phase 3 — Layout: use side space and modern type

When the user complains about **too much empty left/right**:

- **Widen readable column** carefully: increase `max-width` for article body *or* use a **two-column** layout on large screens (main + aside) so margins hold **purposeful** content, not dead air.
- **Fluid type:** `clamp()` for `font-size` on headings and body so scale feels **modern** without breaking mobile.
- **Bolder, modern text:** raise **font-weight** on headings and key UI labels where the reference does; adjust **letter-spacing** and **line-height** together—bolder weight often needs slightly looser line-height.
- **Hierarchy:** fewer font sizes, stronger contrast between **display** and **body** tiers (reference sites often use one serif/sans pairing and one accent weight pattern).

---

## Phase 4 — Mimic scroll animations faithfully

1. **Match the mechanism:** If the reference uses **CSS only** (`@keyframes` + scroll-driven animations or `animation-timeline` where supported), prefer that for parity and weight. If it uses **Framer Motion** / **GSAP**, align easing and stagger to observed behavior.
2. **Respect `prefers-reduced-motion`:** Mirror the reference’s level of motion **or** reduce intensity when the user prioritizes accessibility.
3. **Avoid layout thrash:** Animate **transform** and **opacity**; not `top`/`height` on large sections unless unavoidable.

---

## Phase 5 — Skills the user may need (communicate clearly)

Give an honest, short inventory tied to what the reference actually used:

| If the reference relies on… | User / teammate may need… |
|----------------------------|---------------------------|
| CSS variables + modern layout | CSS Grid, Flexbox, `clamp`, responsive breakpoints |
| Scroll-linked libraries | Basics of that library + bundle impact |
| Custom fonts licensing | How to add fonts in Next.js and comply with license |
| Complex motion | Easing, stagger, reduced-motion patterns |

Keep this **actionable**—name **one or two** learning resources or doc sections only if helpful, not a generic bootcamp list.

---

## Execution checklist (agent)

- [ ] Reference URL(s) captured; inspection notes include fonts, colors, motion stack signals.
- [ ] Current site tokens and layout constraints identified.
- [ ] Plan preserves **all user content**; only presentation changes.
- [ ] Fonts/colors applied via shared tokens (not one-off magic numbers scattered everywhere).
- [ ] Side margins addressed with intentional layout (wider column, grid, or side elements)—not random full-bleed text on ultra-wide screens without a max line length for body copy.
- [ ] Animations verified against reference behavior; reduced-motion considered.
- [ ] Build passes; no regressions on mobile width.

---

## Anti-patterns

- **Guessing** the reference font as system default.
- **Copy-pasting** minified third-party CSS wholesale—extract **values**, reimplement cleanly.
- **Ignoring** contrast or tap targets while chasing “bold.”
- **Expanding scope** into copy rewrites or new pages unless the user asked.

---

## Progressive disclosure

For a deeper DevTools inspection script (manual checklist only), extend this skill with `reference.md` in the same folder—keep **one level deep** from `SKILL.md`.
