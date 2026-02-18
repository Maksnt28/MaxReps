# MaxReps Design System

> **Last updated:** 2026-02-18
> **Status:** Token foundation complete (Steps 0-1). Component implementation starting (Step 2+).

---

## Start Here

Read the 4 system files in this order:

| # | File | What it defines |
|---|------|-----------------|
| 1 | `system/design-principles.yml` | Philosophy, priorities, innovations, gym-context requirements |
| 2 | `system/design-tokens.yml` | Concrete values — every hex, px, opacity, and font weight |
| 3 | `system/color-system.yml` | Where each color appears and where it must NEVER appear |
| 4 | `system/component-anatomy.yml` | Layer-by-layer structure of every component |

**Implementation files:** `lib/theme.ts` (tokens), `tamagui.config.ts` (Tamagui overrides), `plan.md` (build plan).

**Other docs:** `AUDIT.md` (spec vs. references cross-audit), `BACKLOG.md` (deferred gaps for future sessions).

---

## Key Design Decisions

- **Color palette:** 95% monochrome (12-step gray scale). Single chromatic accent: Blue Electrique `#3B82F6` (dark) / `#2563EB` (light).
- **Semantic colors:** Green `#34E8A0` (progression), Red `#FF5A6A` (regression), Gold `#FFD700` (PR), White/Black (neutral completion). Color = information, never decoration.
- **Card style:** Transparent glass — `rgba(255,255,255,0.035)` bg, `rgba(255,255,255,0.06)` border, optional 16px backdrop blur, 14px radius. Accent bar (2px, 60% opacity) on active/PR cards.
- **Background:** 3-stop gradient `#08080A` -> `#0C0C0F` -> `#0A0A0D` at 168deg. Never flat black.
- **Completion checkmark:** Neutral white/black. NEVER green. Green = measured improvement, not mere completion.
- **Completed sets:** Opacity 0.38 dimming. Not green-tinted.
- **Typography:** 4-tier hierarchy. Weight 800 for titles, 700 for data, 600 for secondary, 400 for context. `tabular-nums` on all numeric values.
- **Innovations:** Momentum indicator (real-time volume comparison), contextual last-session ghost values, contextual CTA (4 label states), progress dots, done/todo separator.
- **Timer:** Three-tier system — compact bandeau (inline strip), Live Activity (Dynamic Island), full-screen (distance readability).
- **Spacing:** Tight and dense — 12px screen padding, 8px card gap, 44pt min touch targets.

---

## References by Feature

### active-workout/ (3 references)

**Source apps:** Hevy, Bevel, Fitbod

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Hevy | Card-based layout as foundational pattern. Compact exercise list format. | 3D anatomical body illustration (dated). |
| 02 | Bevel | Card containers for exercise blocks with inline set rows. Horizontal set row structure. | Small exercise thumbnails (replace with muscle chips). |
| 03 | Fitbod | Compact muscle group thumbnail row at top of workout overview. | Large exercise photos (use compact illustrations). Red accent color (Fitbod-specific). |

### exercise-library/ (3 references)

**Source apps:** Peloton Strength+, Bevel (x2)

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Peloton | Muscle thumbnails + checkbox list for filtering. Body region grouping. | Yellow accent (Peloton-specific). Low-contrast anatomical illustrations. |
| 02 | Bevel | Search + filter chips + alphabetical list hierarchy. | Small illegible exercise illustrations. |
| 03 | Bevel | Card-based multi-select pattern. Simple and scannable. | Ambiguous disabled/empty CTA state. |

### exercise-selection/ (2 references)

**Source apps:** Culture Trip, Bevel

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Culture Trip | Accent-colored search icon as subtle polish. | Purple color (use our accent blue). Illustrated header (not relevant). |
| 02 | Bevel | Complete selection: search + filters + alphabetical + custom exercise creation. Toggle +/checkmark pattern. | Small exercise illustrations at selection size. |

### navigation-layout/ (3 references)

**Source apps:** Alipay, WHOOP, Equinox+

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Alipay | Card proportions and spacing set premium tone. Section headers above cards. | Busy card interiors (3D illustrations, gradient fills, multiple CTAs). |
| 02 | WHOOP | Subtle gradient dark theme > flat black. Depth through barely perceptible gradients. | Onboarding overlay style. Information-dense home screen. |
| 03 | Equinox+ | Gold standard card shape, radius, and spacing rhythm. | Image-heavy card backgrounds (not suited for data-focused cards). |

### onboarding-setup/ (3 references)

**Source apps:** How We Feel, Bevel, Runna

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | How We Feel | Multi-section single-screen layout with selectable chips. | Weak section title hierarchy. Dated chip border style. |
| 02 | Bevel | Narrative onboarding: question + context + options + reassurance. Best pattern seen. | Excessive vertical spacing (tighten slightly). |
| 03 | Runna | Settings cards with toggle-to-reveal. Slider with stepped labels and accent values. | Teal accent (Runna-specific). |

### program-builder/ (2 references)

**Source apps:** Eight Sleep, Gymshark

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Eight Sleep | Dark theme card polish. Uppercase section headers. Stepper pattern for weight input. | Unappealing font. Pink gradient (brand-specific). |
| 02 | Gymshark | Structural reference: drag handle, tabular sets, card-level actions, dual bottom CTAs. | Heavy uppercase throughout. Poor input contrast on dark cards. |

### progress-stats/ (6 references)

**Source apps:** Hevy, Rocket Money, Habitify, Spotify for Creators, Revolut, Bevel

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Hevy | PR badge/celebration component. Critical engagement feature. | Visually flat screen (only PR badge is worth extracting). |
| 02 | Rocket Money | Analytics layout hierarchy: tabs -> chart card -> detail cards. Time range pills. | Red/pink header (brand-specific). Financial progress bars. |
| 03 | Habitify | Minimal baseline. MaxReps needs significantly richer stats. | Overall presentation too simple. Basic non-interactive charts. |
| 04 | Spotify | Gold standard chart: smooth area chart, gradient fill, interactive data points, dual-series. | Horizontally cut-off stat cards. Purple accent. |
| 05 | Revolut | Semi-transparent card treatment on dark theme. Mixed card grid. Inline mini charts. | Financial color coding (define our own semantic colors). |
| 06 | Bevel | Best stats dashboard overall. Card-per-metric. Activity heatmap. Balanced insight cards. | Confusing multi-colored charts without labels. Single time range. |

### rest-timer/ (4 references)

**Source apps:** Fanatics Live, Peloton, Apple Fitness, Open

| # | Source | Key takeaway | Avoid |
|---|--------|-------------|-------|
| 01 | Fanatics | Floating card overlay (not full-screen takeover). Dismissible while counting. | Too-bold font weight. Slightly oversized card. |
| 02 | Peloton | Header-positioned timer as compact/minimized mode. Always visible without taking screen space. | Unappealing stop/pause button styling. |
| 03 | Apple Fitness | Persistent compact timer visible outside app. Live Activity/Dynamic Island is key gym UX. | Multi-metric cardio display (irrelevant for rest timer). |
| 04 | Open | Full-screen as maximum-visibility tier. Readable from distance on bench. | Full-screen as default (should be explicit expansion only). Too-minimal pause button. |

---

## Superseded Patterns

These patterns appear in reference files but have been explicitly decided against in the system files:

| Pattern | Reference | Decision | Rationale |
|---------|-----------|----------|-----------|
| Green checkmarks for completion | General pattern | **Neutral white/black only** | `color-system.yml`: green = measured improvement, not completion |
| Gradient buttons/text | Fitbod, Eight Sleep | **Solid accent blue only** | Monochrome-first. No decorative gradients. |
| Image-heavy card backgrounds | Equinox+, Fitbod | **Transparent glass cards** | Data-focused cards. Glass morphism over gradient bg. |
| 3D anatomical illustrations | Hevy | **Flat/stylized alternatives** | Dated aesthetic. Muscle chips preferred. |
| Full-screen timer as default | Open | **Compact bandeau as default** | Timer should not block workout content. |
| Card radius 16-20px | Alipay, Equinox+ | **14px** | `design-tokens.yml` specifies 14. |
| Card gap 16-20px | Equinox+ | **8px** | `design-tokens.yml` specifies 8. Dense layout for gym context. |

---

## File Inventory

| File | Source App | Feature | Priority Elements |
|------|-----------|---------|-------------------|
| `references/active-workout/01-hevy.yml` | Hevy | Workout summary | summary-card (H), exercise-list-format (H), muscle-highlight (M) |
| `references/active-workout/02-bevel.yml` | Bevel | Template editor | exercise-card (H), set-row-layout (H), workout-header (M) |
| `references/active-workout/03-fitbod.yml` | Fitbod | Workout overview | muscle-group-thumbnails (H), exercise-summary-row (M), superset-grouping (L) |
| `references/exercise-library/01-peloton.yml` | Peloton Strength+ | Muscle filter | muscle-filter-list (H), section-headers (M), dynamic-cta (M) |
| `references/exercise-library/02-bevel.yml` | Bevel | Exercise library | search-bar (H), filter-chips (H), exercise-row (H) |
| `references/exercise-library/03-bevel.yml` | Bevel | Exercise selection | exercise-selection-card (H), exercise-metadata (M) |
| `references/exercise-selection/01-culture-trip.yml` | Culture Trip | Search accent | search-bar-accent (M) |
| `references/exercise-selection/02-bevel.yml` | Bevel | Full selection flow | library-layout (H), filter-system (H), add-select-toggle (H), custom-exercise-option (M) |
| `references/navigation-layout/01-alipay.yml` | Alipay | Card proportions | card-shape (H), card-header (M) |
| `references/navigation-layout/02-whoop.yml` | WHOOP | Dark gradient theme | dark-theme-gradient (H), bottom-tab-bar (M) |
| `references/navigation-layout/03-equinox.yml` | Equinox+ | Card spacing rhythm | card-shape-and-radius (H), card-spacing (H), card-content-overlay (M) |
| `references/onboarding-setup/01-how-we-feel.yml` | How We Feel | Chip selection | multi-section-layout (H), selectable-chips (H), numeric-input (M) |
| `references/onboarding-setup/02-bevel.yml` | Bevel | Narrative onboarding | narrative-header (H), goal-option-cards (H), reassurance-note (M) |
| `references/onboarding-setup/03-runna.yml` | Runna | Settings/sliders | slider-with-labels (H), settings-card (M), dark-theme-presentation (M) |
| `references/program-builder/01-eight-sleep.yml` | Eight Sleep | Dark card polish | overall-layout (M) |
| `references/program-builder/02-gymshark.yml` | Gymshark | Builder structure | workout-builder-structure (M) |
| `references/progress-stats/01-hevy.yml` | Hevy | PR badge | pr-badge (H) |
| `references/progress-stats/02-rocket-money.yml` | Rocket Money | Analytics layout | analytics-layout (H), chart-card (H), header-structure (M) |
| `references/progress-stats/03-habitify.yml` | Habitify | Minimal progress | progress-bars (L) |
| `references/progress-stats/04-spotify.yml` | Spotify for Creators | Chart polish | area-chart (H) |
| `references/progress-stats/05-revolut.yml` | Revolut | Transparent cards | transparent-cards (H), card-grid-layout (M), inline-mini-charts (M) |
| `references/progress-stats/06-bevel.yml` | Bevel | Stats dashboard | dashboard-cards (H), activity-heatmap (H), summary-card-structure (H) |
| `references/rest-timer/01-fanatics.yml` | Fanatics Live | Floating timer | floating-timer-card (H), countdown-display (H) |
| `references/rest-timer/02-peloton.yml` | Peloton | Header timer | header-timer (M) |
| `references/rest-timer/03-apple-fitness.yml` | Apple Fitness | Persistent timer | compact-persistent-timer (H), expandable-behavior (H) |
| `references/rest-timer/04-open.yml` | Open | Full-screen timer | fullscreen-timer (M) |
| `system/design-principles.yml` | — | Philosophy & priorities | — |
| `system/design-tokens.yml` | — | Concrete values | — |
| `system/color-system.yml` | — | Color usage rules | — |
| `system/component-anatomy.yml` | — | Component structure | — |

**Total: 4 system files + 26 reference pairs (52 files: .yml + .png each) = 56 files**
