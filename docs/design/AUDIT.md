# Design System Audit

> **Date:** 2026-02-18 (revision 3 — post-restructure)
> **Scope:** Cross-reference of 26 reference analyses against 4 system spec files + implementation code
> **Files:** `docs/design/system/` (4 specs), `docs/design/references/` (26 pairs), `lib/theme.ts`, `tamagui.config.ts`, `plan.md`

---

## 1 — Conflicts (References vs. System Files)

### 1.1 Resolved Implementation Conflicts

| # | Conflict | Resolution |
|---|----------|------------|
| 01 | Accent color: spec blue `#3B82F6` vs. old code violet `#6C63FF` | `lib/theme.ts:12` uses `#3B82F6`. |
| 02 | Card treatment: spec glass morphism vs. old solid `$gray2` | `lib/theme.ts:81-95` exports glass tokens. `plan.md` Step 3c. |
| 03 | Typography scale: incompatible sizes/weights | `plan.md` Step 2: 17 presets, spec weight hierarchy. |
| 04 | Semantic colors: different hex values, missing PR gold | `lib/theme.ts:59-63` uses spec values. |
| 05 | Text color scale: wrong gray anchors | Gray scale re-anchored (`lib/theme.ts:28-41`). |
| 07 | Completed sets: green tint vs. opacity dimming | `plan.md` Step 6a: opacity 0.38 + neutral checkmarks. |
| 08 | Border radius: generic vs. named | `lib/theme.ts:118-129`: named radii match spec. |
| 09 | Spacing: generous 20px vs. tight 12px | `lib/theme.ts:132-138`: spec spacing. |

### 1.2 Open Implementation Conflicts

**CONFLICT-06: Background gradient tokens defined, not yet rendered (MEDIUM)**
`lib/theme.ts:20-24` exports `backgroundGradient` tokens. `tamagui.config.ts:11` still uses flat `colors.gray1`. Planned for Step 5 (`LinearGradient` wrapper). No action needed until then.

**CONFLICT-10: Offline support (LOW)**
`design-principles.yml:184-186` says offline; CLAUDE.md says cloud-first. Updated with aspirational note. CLAUDE.md is authority.

### 1.3 Reference vs. System Conflicts

These are cases where reference `apply_to_maxreps` recommendations conflict with system-file decisions:

| Reference | Recommendation | System Decision | Resolution |
|-----------|---------------|-----------------|------------|
| `navigation-layout/01-alipay` | Card radius 16-20px | `design-tokens.yml`: 14px | **System wins.** 14px is spec. |
| `navigation-layout/03-equinox` | Card gap 16-20px | `design-tokens.yml`: 8px | **System wins.** Dense layout for gym. |
| `navigation-layout/03-equinox` | Image-heavy card backgrounds | Glass morphism, no images | **System wins.** Data-focused cards. |
| `active-workout/03-fitbod` | Exercise photo thumbnails | Muscle chips, no photos | **System wins.** Space-efficient. |
| `active-workout/01-hevy` | 3D anatomical body illustration | Not specified (TBD) | **Reference superseded.** Flat/stylized if implemented. |
| `rest-timer/04-open` | Full-screen timer as primary | Compact bandeau as primary | **System wins.** Full-screen = explicit expansion only. |
| `onboarding-setup/01-how-we-feel` | Gold outline chip borders | System chip tokens: no border | **System wins.** Modern chip treatment. |

---

## 2 — Gaps

### 2.1 System Features with NO Reference Backing

These features are defined in the system files but no reference screenshot analyzes or inspires them. They are MaxReps-original innovations designed from scratch.

| Feature | System File | Priority | Impact |
|---------|-------------|----------|--------|
| **Momentum bar** | principles + anatomy + color + tokens | High | Key differentiator. No competitor reference exists. |
| **Done/todo separator** | anatomy:110-122 | Medium | Blue accent line between completed/upcoming sets. |
| **Ghost values** | anatomy:140-166 | High | Last session weight/reps in parentheses on upcoming sets. |
| **Last session line** | anatomy:140-166, principles:55-61 | High | "Derniere fois : {weight} kg . {sets}x{reps}" inline. |
| **Contextual CTA** (4 states) | principles:63-68, anatomy:260-276 | High | Label changes based on workout progress. |
| **Noise texture** (SVG fractalNoise) | anatomy:32-35, tokens | Low | Imperceptible materiality layer. Deferred. |
| **Top-edge card highlight** | anatomy, tokens | Low | 1px relief at card top. |
| **PR mini chart** (in PR card) | anatomy:281-298 | Medium | Inline area chart in workout-flow PR card. |
| **Completed set opacity** (0.38) | anatomy:102-104 | Medium | Specific dimming value for completed rows. |
| **Column headers** (#, POIDS, REPS, delta) | anatomy | Low | Defined but not referenced. |
| **Active indicator** (2px blue bar) | anatomy (set row) | Medium | Current set indicator. |
| **Screen auto-lock prevention** | principles (gym context) | Medium | No reference. Platform feature. |
| **Weight stepper haptics** | principles:134-135 | Low | No component anatomy exists. |
| **Muscle group colors** | tokens:222-240 | High | 11 groups, all TBD. No reference defines actual colors. |

**Assessment:** The lack of references for these features is expected — they are intentional innovations. The 4 high-priority items (momentum, ghost values, last session, contextual CTA) are the app's differentiators and don't need external validation.

### 2.2 Reference Instructions with NO System Coverage

These are high/medium priority `apply_to_maxreps` instructions from references that have no corresponding component in the system spec files. Grouped by screen.

**Exercise Library (no system anatomy)**

| Reference | Instruction | Priority |
|-----------|-------------|----------|
| `exercise-library/02-bevel` | Search bar with accent icon | High |
| `exercise-library/02-bevel` | Horizontal filter chips (muscle + equipment) | High |
| `exercise-library/02-bevel` | Exercise row (name + equipment, alphabetical, sticky headers) | High |
| `exercise-selection/02-bevel` | Complete selection layout (search + filters + list + custom) | High |
| `exercise-selection/02-bevel` | Add/select toggle (+/checkmark with haptic) | High |
| `exercise-selection/02-bevel` | Custom exercise creation option | Medium |
| `exercise-library/01-peloton` | Muscle filter screen with anatomical thumbnails | High |
| `exercise-library/01-peloton` | Body region section grouping (Upper/Lower/Core) | Medium |
| `exercise-library/01-peloton` | Dynamic CTA with selection count | Medium |
| `exercise-selection/01-culture-trip` | Accent-colored search icon | Medium |

**Stats / Progress Dashboard (no system anatomy)**

| Reference | Instruction | Priority |
|-----------|-------------|----------|
| `progress-stats/02-rocket-money` | Analytics layout (tabs -> chart card -> detail cards) | High |
| `progress-stats/02-rocket-money` | Chart card with time range pills | High |
| `progress-stats/04-spotify` | Smooth area chart with gradient fill, interactive touch | High |
| `progress-stats/05-revolut` | Transparent stat cards, mixed card grid | High |
| `progress-stats/06-bevel` | Card-per-metric dashboard, activity heatmap | High |
| `progress-stats/06-bevel` | Stat card template (icon + title + metric + chart) | High |
| `progress-stats/01-hevy` | PR badge/celebration component | High |
| `progress-stats/05-revolut` | Inline mini charts / sparklines | Medium |
| `progress-stats/02-rocket-money` | Stats page header with tabs | Medium |

**Onboarding (no system anatomy)**

| Reference | Instruction | Priority |
|-----------|-------------|----------|
| `onboarding-setup/02-bevel` | Narrative header (bold question + muted context subtitle) | High |
| `onboarding-setup/02-bevel` | Goal option cards (icon + title + description + checkmark) | High |
| `onboarding-setup/01-how-we-feel` | Multi-section layout with selectable chips | High |
| `onboarding-setup/01-how-we-feel` | Flex-wrap selectable chips (selected/unselected states) | High |
| `onboarding-setup/03-runna` | Slider with stepped labels and accent values | High |
| `onboarding-setup/02-bevel` | Reassurance note below CTA | Medium |
| `onboarding-setup/03-runna` | Settings card with master toggle | Medium |
| `onboarding-setup/01-how-we-feel` | Compact numeric input with unit label | Medium |

**Navigation (no system anatomy)**

| Reference | Instruction | Priority |
|-----------|-------------|----------|
| `navigation-layout/02-whoop` | Tab bar design (lighter bg, outlined inactive, filled active) | Medium |
| `navigation-layout/01-alipay` | Section headers above cards ("Programme actif", etc.) | Medium |

**Workout (partial system coverage)**

| Reference | Instruction | Priority |
|-----------|-------------|----------|
| `active-workout/01-hevy` | Workout summary card layout | High |
| `active-workout/03-fitbod` | Muscle group thumbnail row at top of workout | High |
| `active-workout/02-bevel` | Card-level action buttons (superset, add set) | Medium |
| `active-workout/01-hevy` | Muscle group visualization on summaries | Medium |
| `program-builder/02-gymshark` | Drag handle, tabular sets, dual bottom CTAs | Medium |
| `active-workout/03-fitbod` | Superset visual grouping | Low |

**Timer (partial system coverage — only bandeau defined)**

| Reference | Instruction | Priority |
|-----------|-------------|----------|
| `rest-timer/03-apple-fitness` | Persistent compact timer (Live Activity / Dynamic Island) | High |
| `rest-timer/03-apple-fitness` | Expandable behavior (compact <-> expanded) | High |
| `rest-timer/01-fanatics` | Floating card overlay (not full-screen) | High |
| `rest-timer/01-fanatics` | Large countdown display with unit labels | High |
| `rest-timer/04-open` | Full-screen timer as explicit expansion mode | Medium |
| `rest-timer/02-peloton` | Header-positioned timer as minimized state | Medium |

**Assessment:** The system files (`component-anatomy.yml`) are heavily focused on the **active workout screen** (set row, exercise header, timer bandeau, CTA). They do NOT define anatomy for: exercise library, stats dashboard, onboarding, navigation, workout summary, or the full rest timer system. This is expected — the system spec was designed for the workout core. The reference files fill in the surrounding screens and should be consulted when building those features.

### 2.3 Implementation Gaps (from prior audit, still current)

These are tracked in detail in `BACKLOG.md`. Summary:

| Gap | Status |
|-----|--------|
| Muscle group colors (11 TBD) | Needs dedicated session |
| Momentum bar | Deferred — separate plan |
| PR card + detection | Deferred — separate plan |
| Three-tier timer | Deferred — Rest Timer plan |
| Weight stepper | Deferred indefinitely |
| Chart library decision | Deferred — Charts plan |
| Light mode | Deferred — after dark mode polish |
| Noise texture | Deferred indefinitely |
| Session header i18n key | Add during Step 6c |
| Input error states | Define during Step 3d/6a |
| Contrast ratio audit | Run after Steps 3-7 |

---

## 3 — Redundancies

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| 01 | Card properties in 4 places (tokens, anatomy, theme.ts, plan.md) | Low | All consistent now. `lib/theme.ts` is implementation authority. |
| 02 | Typography in 2 places (tokens, plan.md) | Low | Intentional: spec has reference sizes, plan has iOS-scaled sizes. |
| 03 | Accent hex `#3B82F6` literal in 3 spec files | Low | Spec-internal. No code change needed. |
| 04 | Checkmark spec in 3 spec files | Low | Spec-internal. Different detail levels. |
| 05 | "Use card-based layouts" in 5+ references | None | Already mandated by system spec. Harmless. |

---

## 4 — Recommendations

### Resolved

| # | Recommendation | Status |
|---|---------------|--------|
| REC-01 | Choose one accent color | Done — Blue `#3B82F6` |
| REC-02 | Choose one card treatment | Done — Glass morphism |
| REC-03 | Reconcile typography scale | Done — 4-tier system |
| REC-04 | Reconcile semantic colors | Done — Spec values |
| REC-14 | Remove `docs/design-references.md` | Done — Deleted |

### Still Actionable

**REC-05: Define muscle group colors.** (IMPORTANT — blocks exercise library filters)
Needs dedicated session. 11 groups, suggest 6-7 color families.

**REC-06: Test gradient background on device.** (IMPORTANT — Step 5)
Barely perceptible gradient. Verify visibility and performance.

**REC-07: Test completed set opacity on device.** (IMPORTANT — Step 6a)
0.38 may be too dim in gym lighting. May need 0.5.

**REC-08: Add session header subtitle i18n key.** (MINOR — Step 6c)

**REC-09: Resolve noise texture.** (LOW — skip unless cards feel flat)

**REC-10: Contrast ratio audit.** (IMPORTANT — after Steps 3-7)
Secondary text `#5C5C66` on `#08080A` is ~3.0:1 (below WCAG AA 4.5:1).

**REC-11: Test French text overflow.** (MINOR — after Step 9)

**REC-12: Define input error states.** (MINOR — Step 3d/6a)

**REC-13: Document edge cases.** (MINOR — during implementation)

**REC-15: Build component anatomy for non-workout screens.** (NEW — IMPORTANT)
The system spec only covers active workout components. When building exercise library, stats, and onboarding screens, use the reference analyses as the de facto spec. Consider writing anatomy entries for these screens if they become complex.

---

## 5 — Summary

| Metric | Count |
|--------|-------|
| Reference files audited | 26 |
| System spec files | 4 |
| Reference vs. system conflicts | 7 (all resolved — system wins) |
| Implementation conflicts | 10 total (8 resolved, 2 open) |
| System features with no reference | 14 (expected — original innovations) |
| Reference instructions with no system spec | ~38 (exercise library, stats, onboarding, navigation, timer) |
| Implementation gaps | 11 (tracked in `BACKLOG.md`) |
| Redundancies | 5 (all low severity, consistent) |
| Recommendations | 15 total (5 resolved, 10 actionable) |

### Coverage Map

| Screen / Feature | System Spec | Reference Coverage | Implementation Plan |
|-----------------|------------|-------------------|-------------------|
| Active workout (set row, exercise card, header) | Full | 3 references | `plan.md` Steps 6a-6g |
| Timer (bandeau only) | Partial | 4 references | Deferred (Rest Timer plan) |
| Exercise library | None | 5 references | `plan.md` Steps 6l-6n (basic retrofit) |
| Stats / progress | None | 6 references | Deferred (Charts plan) |
| Onboarding | None | 3 references | Deferred (Onboarding plan) |
| Program builder | Partial (exercise header) | 2 references | `plan.md` Steps 6h-6k |
| Navigation / tab bar | None | 3 references | `plan.md` Step 4 |
| Workout summary | None | 1 reference | Not yet planned |

### Assessment

The design system is **well-defined for the active workout core** and has **strong reference coverage for surrounding screens**. The gap is deliberate — the system spec was built for the most critical screen first. For non-workout screens, the reference files serve as the spec until formal anatomy entries are written.

All reference vs. system conflicts are resolved (system always wins). The 14 innovations without reference backing are intentional differentiators. The 38 uncovered reference instructions will become relevant as those features are built — they don't block the current design sprint.

Deferred gaps are tracked in [`BACKLOG.md`](BACKLOG.md). Reading guide and reference inventory in [`README.md`](README.md).
