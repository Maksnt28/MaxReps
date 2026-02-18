# Design System Backlog

> **Source:** `docs/design/AUDIT.md` (revised 2026-02-18)
> **Purpose:** Deferred gaps from the design audit. Each item needs its own session or plan before implementation. None of these block the current design sprint (plan.md Steps 2-10).

---

## Dedicated Sessions Needed

### GAP-01: Muscle Group Colors (11 groups, all TBD)

- **Spec refs:** `_design-tokens.yml:222-240`, `_component-anatomy.yml:310-315`, `_color-system.yml:232`
- **What:** Pick distinct colors for 11 muscle groups: Pectoraux, Dos, Epaules, Biceps, Triceps, Avant-bras, Quadriceps, Ischio-jambiers, Fessiers, Mollets, Abdominaux
- **Constraint:** Colors only appear on chips in the exercise library filter mode. In active workout, all chips remain neutral grey (`_color-system.yml` rule).
- **Proposal:** Hue-shifted variants at consistent saturation/lightness. Consider 6-7 color families with grouping (e.g., all arm muscles = one family). Must be distinct at chip size and accessible on both card and screen backgrounds.
- **Blocks:** Exercise library colored filter mode
- **Effort:** ~1 session

---

## Deferred to Future Feature Plans

### GAP-02: Momentum Bar

- **Spec refs:** `_design-principles.yml:46-53`, `_component-anatomy.yml:212-239`
- **Priority:** High (spec calls it "key differentiator, no competitor does this")
- **What:** Horizontal bar showing real-time workout momentum. Compares total volume vs. same point in last session.
- **Requires:** New hook (volume comparison at current progress point), new component (bar + label + percentage + fill direction), workout history data
- **Belongs to:** Separate feature plan after design sprint

### GAP-07: PR Detection + PR Card

- **Spec refs:** `_component-anatomy.yml:281-298`, `_design-principles.yml:161-171`
- **Priority:** High
- **What:** Detect personal records during workout, show inline PR card with gold accent bar, exercise name, record value, delta, mini chart
- **Requires:** PR comparison hook, 1RM estimation logic, gold accent card variant (tokens already exist: `semantic.pr = #FFD700`)
- **Belongs to:** Separate feature plan after design sprint

### GAP-08: Three-Tier Timer System

- **Spec refs:** `_design-principles.yml:142-159`, `_component-anatomy.yml:170-208`, `rest-timer-01/02/03/04.yml`
- **Priority:** High (bandeau + Live Activity), Medium (full-screen)
- **What:** Three timer presentations:
  1. Compact bandeau (inline strip at top of workout screen)
  2. Live Activity (iOS Dynamic Island / Lock Screen — requires native module)
  3. Full-screen countdown (dedicated screen)
- **Note:** The compact elapsed-time timer (`WorkoutTimer.tsx`) is covered in the design sprint (Step 6d). The three-tier rest timer system is a separate feature.
- **Belongs to:** Rest Timer feature plan (next in build order after design sprint)

### GAP-10: Weight Stepper Control

- **Spec refs:** `_design-principles.yml:134-135`
- **Priority:** Low
- **What:** Stepper control for weight input instead of (or in addition to) text input. Haptic feedback per step, stronger on long-press.
- **Note:** No component anatomy defined in spec. Current text inputs work fine. Revisit if user testing reveals friction with numeric input.
- **Belongs to:** UX refinement (no specific plan yet)

### GAP-11: Chart Library Decision

- **Spec refs:** `progress-stats-04.yml`, `progress-stats-05.yml`, `progress-stats-06.yml`
- **Priority:** Medium
- **What:** Choose charting library for progress/stats screens. Candidates: `react-native-chart-kit`, `victory-native`, `react-native-gifted-charts`. Needs gradient area fills, interactive touch points, heatmaps.
- **Belongs to:** Charts feature plan (after Rest Timer in build order)

### GAP-12: Light Mode

- **Spec refs:** `_design-tokens.yml` (light values for every category), `_design-principles.yml:38-40`
- **Priority:** Secondary
- **What:** Second Tamagui theme override in `tamagui.config.ts`. All tokens already exported from `lib/theme.ts` with light variants (`text.light`, `card.light`, `chip.light`, `separator.*.light`, `backgroundGradient.light`).
- **Belongs to:** Separate task after dark mode is fully polished

---

## Skip / Defer Indefinitely

### GAP-09: SVG Noise Texture on Cards

- **Spec refs:** `_component-anatomy.yml:32-35`
- **What:** SVG fractalNoise overlay (opacity 0.018, baseFrequency 0.85) on every card
- **Why skip:** React Native doesn't support SVG filters natively. The spec says "Users won't see it consciously." Revisit only if glass morphism cards feel too flat after implementation.
- **Fallback if needed:** Pre-rendered 1x1 tile PNG at 1.8% opacity via `ImageBackground`
