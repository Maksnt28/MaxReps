# Gym Workout Tracking App — Definitive Project Plan v1.0

> Living reference document for the entire project lifecycle. Consolidates every decision from competitive analysis, project scoping, tech recommendations, two audit cycles, and strategic roadmap review. Designed to bootstrap CLAUDE.md and evolve alongside the build.

---

## 1. Product Vision

### What We're Building

A mobile-first gym workout tracking app that combines fast, friction-free session logging with intelligent progressive overload recommendations and AI-powered program generation. Targets the underserved intersection of **Strong's speed**, **Fitbod's intelligence**, and **first-class calisthenics support** — with French localization as a competitive edge.

### Target User

All gym-goers, with primary focus on **intermediate lifters** (1–3 years of training) who know their way around the gym but want smarter tracking, auto-progression, and structured programming. The onboarding flow also accommodates beginners with guided exercise instruction and equipment-aware program templates. Not targeting competitive athletes or powerlifters for MVP.

### Core Value Proposition

- **Log faster than a notebook** — pre-filled sets from last session, one-tap set completion, minimal interactions
- **Get smarter over time** — progressive overload engine auto-suggests weight increases based on performance + RPE
- **Programs that adapt** — AI-generated programming with auto-periodization, mesocycle management, and deload scheduling
- **Calisthenics as first-class** — not an afterthought appendix; bodyweight progressions, band-assisted variants, and proper bodyweight tracking
- **Bilingual (EN/FR)** — architecture from day 1, French content near-term

### Platform

iOS initial release. Cross-platform architecture (React Native) means Android-ready with minimal additional work. Web companion deferred to Phase 4+.

---

## 2. Tech Stack

Every choice optimized for solo-founder velocity with Claude Code, zero native module dependencies, and generous free tiers.

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **React Native + Expo (TypeScript)** | Best Claude Code compatibility. Cross-platform. Pure managed workflow — zero native modules, no ejection risk. OTA updates via EAS Update. |
| UI Framework | **Tamagui** | Design tokens, dark mode, responsive primitives. Code-first design with Figma for 3 complex screens only. |
| Navigation | **Expo Router** | File-based routing, modern Expo default. Deep linking support built-in for Phase 4+. |
| State (local) | **Zustand** | Minimal API, TypeScript-native, no boilerplate. 3 stores: useWorkoutStore, useUserStore, useExerciseStore. |
| State (server) | **@tanstack/react-query** | Supabase data fetching with caching, optimistic updates, background refresh. |
| Backend | **Supabase** | PostgreSQL + Auth + Edge Functions + Storage + Realtime. All in one platform. Free tier generous through launch. |
| Auth | **Supabase Auth** | Google Sign-In + Apple Sign-In. No email/password for MVP. |
| AI | **Claude API (Anthropic)** | Via Supabase Edge Functions. Provider-abstracted for model switching. Sonnet for generation, Haiku for coaching text. |
| Analytics | **PostHog Cloud (EU)** | 1M free events/mo. Event tracking, funnels, feature flags, A/B testing. Replaces custom feature flag table. |
| Crash Reporting | **Sentry** | Free tier (5K errors/mo). React Native SDK. Performance monitoring. |
| Payments | **RevenueCat** | App Store subscription management. Free until $2.5K MRR. Phase 3. |
| i18n | **i18next + react-i18next + expo-localization** | All UI strings via `t('key')` from commit #1. `/locales/en.json` + `/locales/fr.json`. |
| Testing | **Vitest (unit) + Maestro (E2E)** | Vitest: fast, TS-native. Maestro: YAML-based mobile E2E, free, no flaky selectors. |
| Haptics | **expo-haptics** | Zero native deps. Light on set completion, medium on PR, heavy on workout finish. |
| Build | **EAS Build + EAS Submit** | Cloud builds. No local Xcode needed. Free tier: 30 builds/mo. |

---

## 3. Architecture Overview

### High-Level Data Flow

**Client (Expo)** → authenticates via Supabase Auth → reads/writes workout data via Supabase Postgres (RLS-protected) → AI requests route through **Supabase Edge Functions** (server-side, keys never on client) → Claude API → response validated through 3-stage safety pipeline → cached → returned to client.

### Offline Strategy

**Cloud-first, online-required.** Single exception: the active workout session is persisted to AsyncStorage on every set log. If the app is killed or network drops mid-workout, the session is recoverable on reopen. Full offline mode (WatermelonDB, sync engine, conflict resolution) is explicitly excluded from scope.

### Database Schema (Core Tables)

```
users             — id, auth_id, display_name, experience_level, goal, equipment[],
                    schedule, limitations[], locale, created_at

exercises         — id, name_en, name_fr, muscle_primary, muscle_secondary[],
                    equipment, category, cues_en, cues_fr, animation_url, difficulty

programs          — id, user_id, name, type (custom|ai_generated),
                    source_prompt_version, is_active, created_at

program_days      — id, program_id, day_number, name, focus

program_exercises — id, program_day_id, exercise_id, order, sets_target,
                    reps_target, rpe_target, rest_seconds, notes

workout_sessions  — id, user_id, program_day_id?, started_at, finished_at,
                    duration_seconds, notes

workout_sets      — id, session_id, exercise_id, set_number, weight_kg, reps,
                    rpe, is_warmup, is_pr, completed_at

ai_generations    — id, user_id, prompt_version, model, input_hash, output_json,
                    cost_usd, created_at

prompt_versions   — id, name, system_prompt, user_template, model_default,
                    is_active, created_at
```

All tables protected by Row Level Security (RLS). Users can only read/write their own data. Edge Functions bypass RLS via service role key for admin operations.

### i18n Architecture

Every UI string uses `t('key')` from **i18next**. No hardcoded text anywhere. Locale files: `/locales/en.json` and `/locales/fr.json`. French translations can be empty initially — architecture exists from commit #1. Exercise content uses bilingual columns (`name_en`/`name_fr`) in Supabase. AI-generated coaching text: pass user locale to Claude API prompt so content is generated in the correct language natively.

---

## 4. Exercise Content & Visuals

### Exercise Metadata

**Self-built database** — not dependent on ExerciseDB (AGPL-licensed, GIF copyright unclear). Exercise metadata (names, muscle groups, equipment, instructions) is factual and not copyrightable. Build a Supabase schema, populate manually and with Claude-generated entries. Cross-reference wger, MuscleWiki, ACE exercise library, and NSCA resources for completeness.

**Target:** ≥800 exercises at launch covering all major muscle groups × equipment types (barbell, dumbbell, cable, machine, bodyweight, bands, kettlebell) × calisthenics progressions.

### Visual Assets

> **DECIDED:** Licensed 3D animation library — one-time purchase

Purchase a full commercial package from **Gym-Animations.com** or **Exercise Animatic** (~$300–600). Provides 2,000–7,000+ looping MP4/GIF animations: consistent grayscale anatomical model, muscle highlighting, male/female variants, clean white backgrounds. Explicit commercial license, lifetime, royalty-free. Covers barbell, dumbbell, cable, machine, AND bodyweight/calisthenics.

> **TO DECIDE:** Choose specific vendor — download free demos from both, evaluate visual quality, calisthenics coverage, file size, and price before Phase 1 begins.

**Visual Homogeneity Rule:** All exercise visuals must come from the same source/style. For exercises not covered by the purchased library, use AI-generated static illustrations (Midjourney/Flux) as supplementary fill with a clear "illustration" indicator — replace with matching animations when the vendor adds them. Never mix photographic GIFs with 3D animations in the same library.

### AI-Enriched Content

Claude generates per-exercise: form cues, common mistakes, beginner modifications, tempo recommendations, and muscle engagement descriptions. Stored as static text in Supabase. Dynamic coaching text (contextual to user performance) generated on-demand. Cache aggressively — most exercise-level content is reusable for 24h+.

---

## 5. AI Engine

Hybrid architecture: deterministic rules for real-time interactions (Phase 1), LLM for higher-order intelligence (Phase 2). Neither replaces the other.

### Phase 1 — Rules Engine (On-Device, $0)

- **Progressive overload:** If user completed all prescribed reps at RPE ≤ 7 for 2 consecutive sessions → suggest +2.5 kg upper body / +5 kg lower body. If RPE ≥ 9 for 2 sessions → suggest deload or reduce weight by 10%.
- **Periodization templates:** 4-week mesocycle blocks (3 weeks loading + 1 week deload). Volume progression: +1 set/exercise/week within block.
- **Recovery estimation:** Rules-based readiness score from: RPE trend (last 5 sessions per muscle group), volume vs. planned ratio, days since last training per muscle group, user-reported sleep quality (1–5 scale).

### Phase 2 — LLM Layer (Claude API via Edge Functions)

**Features:**
- **Program generation:** Full multi-week programs based on user profile + training history + RPE trends + equipment + schedule + goals
- **Auto-periodization:** Mesocycle design, deload scheduling, exercise rotation, volume/intensity wave patterns
- **Dynamic coaching text:** Contextual form cues, workout previews, session summaries, plateau-breaking suggestions
- **Recovery recommendations:** Training adjustments based on accumulated fatigue signals

**Safety Pipeline (3 Stages, Server-Side):**

1. **Schema validation (Zod):** Reject any response that doesn't match the expected JSON shape. Type-safe, no malformed data reaches the client.
2. **Domain rule enforcement:** Volume caps by experience level (beginner: ≤16 sets/muscle/week, intermediate: ≤20, advanced: ≤25). RPE ceilings (never prescribe RPE 10 for beginners). Equipment matching (don't suggest barbell if user only has dumbbells). Exercise existence (every exercise_id must exist in DB). Rest day spacing (min 1 rest day per 3 training days). Progressive overload bounds (max +10% weight increase per week).
3. **Coherence check:** Push/pull balance within a week. No duplicate exercises in same session. Periodization logic (volume varies across mesocycle weeks). Warm-up → compound → isolation exercise ordering.

**Provider Abstraction & Cost Control:**

Thin wrapper: `generateProgram(userContext, model?)`. Defaults to Claude Sonnet, switchable to GPT-4o / Gemini via env variable. Prompt templates versioned in Supabase `prompt_versions` table (not hardcoded). Rollback = set `is_active = false` on bad version, restore previous.

- **Rate limits:** Free tier: 2 generations/week. Premium: 10/week.
- **Budget cap:** Monthly ceiling at 150% of projected cost. Alert at 80%.
- **Caching:** Hash user context → cache output for 4-week TTL. Target ≥30% cache hit rate.
- **Model tiering:** Haiku for coaching text (~$0.003/call). Sonnet for full program generation (~$0.03–0.05/call).

**Fallback Strategy:**

12 pre-built template programs (3 experience levels × 4 goals: strength, hypertrophy, general fitness, body recomposition). Served on: API failure, timeout (>30s), or validation failure after 2 retries. Progressive loading UI: "Designing your program…" → "Selecting exercises…" → timeout → serve template with notification.

---

## 6. UX & Design

### Design Philosophy

Minimalist, practical, one-handed mobile use. Dark mode default (gym lighting). Optimal data density — related metrics visible at a glance without overwhelming. Blend Strong/Hevy logging speed with Fitbod/Alpha Progression intelligence. No clutter, no gamification gimmicks. The app should feel like a serious training tool, not a game.

### Design Workflow

Code-first with Tamagui design tokens. Figma reserved for 3 complex screen layouts (workout logger, program builder, analytics dashboard). Competitor screenshots (Strong, Hevy, Alpha Progression) as visual references for Claude Code. Dark theme via CSS variables / Tamagui tokens — light mode achievable later by swapping token values.

### Home Screen (Accueil)

The Home tab is the app's landing screen — what users see every time they open MaxReps. It serves as a **progress dashboard** that motivates continued training.

**MVP (Phase 1):**
- Progress dashboard with 5 sections: summary stats (2×2 grid), volume chart, strength progression chart, workout frequency heatmap, recent PRs
- Time range selector (1W, 1M, 3M, 6M, 1Y)
- Interactive chart tooltips
- Loading skeletons, error states, empty state ("Complete your first workout" CTA)

**Home Screen Enhancements — Phased Rollout:**

Enhancements are built progressively as the features they depend on come online.

| Phase | Enhancement | Description | Depends on |
|-------|------------|-------------|------------|
| Phase 1 (post-Onboarding) | Quick-start workout | "Start today's workout" button when a program day is scheduled | Programs (done) |
| Phase 1 (post-Onboarding) | Upcoming workout preview | Next scheduled program day with exercise list preview | Programs (done) |
| Phase 1 (post-Onboarding) | Weekly summary widget | Compact card: sessions this week vs target, volume trend arrow | Charts hooks (done) |
| Phase 1 (pre-launch polish) | Streak & consistency | Current streak (consecutive training weeks), longest streak, calendar dots | Workout history (done) |
| Phase 1 (pre-launch polish) | Milestone celebrations | "100th workout!", "1 year of training", "Bench press: 100 kg club" | Workout history (done) |
| Phase 2 (post-AI) | Personalized suggestions | "You haven't trained legs in 8 days" or "Bench press is due for a PR attempt" | AI layer |
| Phase 2 (post-AI) | Rest day intelligence | "Rest day — next session: Push Day tomorrow" when no workout is scheduled | AI layer + schedule |
| Phase 3+ (post-launch) | Motivational quote | Rotating daily training quotes (optional, toggle in settings) | None (low priority) |

> All enhancements are additive — each is an independent card/widget above or below the progress charts. None require architectural changes to the dashboard.

### Onboarding

5 screens, target ≤90 seconds median completion, ≥85% completion rate:

1. **Experience level** (beginner / intermediate / advanced)
2. **Primary goal** (strength / hypertrophy / general fitness / body recomp)
3. **Available equipment** (multi-select: barbell, dumbbells, cables, machines, bodyweight only, bands, kettlebells)
4. **Weekly schedule** (how many days, which days)
5. **Limitations** (injuries, mobility issues — optional, skip-friendly)

**Progressive profiling:** Body weight, age, and 1RM estimates collected after first 3 completed sessions (not during onboarding). Auto-calibration after 2–4 weeks adjusts self-reported experience level vs. actual performance data.

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App cold start | <3 seconds | Sentry Performance |
| Screen transitions | <300ms | RN Performance Monitor (dev) |
| Exercise search | <200ms | PostHog custom event timing |
| Save set (log) | <500ms | Sentry transaction |
| AI program generation | <15s (progressive loading) | Edge Function duration metric |
| Onboarding completion | ≤90 seconds median | PostHog funnel |

### Accessibility (MVP)

- `accessibilityLabel` on all interactive elements
- Dynamic Type support (test at 2× default size)
- WCAG AA contrast ratios (4.5:1 normal text, 3:1 large text)
- VoiceOver navigation order tested on workout logging flow
- Haptic feedback: light on set completion, medium on PR, heavy on workout finish

---

## 7. Infrastructure & DevOps

### Environments

Two Supabase projects: **dev** (free tier, development + testing) and **prod** (free tier → Pro $25/mo at launch). Environment variables in `app.config.ts` switch between them. All schema changes and Edge Function deployments go through dev first.

### CI/CD Pipeline

- **On push to main:** GitHub Actions → vitest → ESLint → TypeScript type-check → Expo bundle build (catches compilation errors)
- **On PR:** All above + EAS Build creates a preview build → test on physical device before merging
- **On git tag (v1.0.0):** EAS Build production binary → EAS Submit to TestFlight → manual App Store submission
- **Edge Functions:** Deployed via `supabase functions deploy` in the CI pipeline after tests pass

### Database Migrations

Supabase CLI workflow: `supabase db diff` to generate migration files locally → test in dev project → apply to prod via `supabase db push`. Migration files committed to the repo. Workflow documented in CLAUDE.md. Practiced at least twice during Phase 1.

### Backup & Recovery

- **Phase 1 (free tier):** Weekly manual `pg_dump` via Supabase CLI
- **Pre-launch (Pro tier):** Daily automated backups (Supabase Pro, $25/mo)
- **Exercise library seed data:** Version-controlled as JSON in the repo — database always rebuildable from scratch

### Versioning

Semantic versioning (MAJOR.MINOR.PATCH). Automated via `app.config.ts`. CHANGELOG.md in repo. "What's New" in App Store release notes.

### Cost Projections

| Scale | Monthly Cost | Breakdown |
|-------|-------------|-----------|
| 0–1K users | **$0** | All free tiers (Supabase, PostHog, Sentry, EAS) |
| 1K–10K users | **$25–75** | Supabase Pro ($25) + AI costs (~$50 at 10K users × 1 gen/week) |
| 10K–100K users | **$100–300** | Supabase Pro + PostHog paid + AI costs scaling |

---

## 8. Security

### API Key Management

- All LLM API calls via Supabase Edge Functions — keys stored as Supabase secrets, never exposed to client
- `gitleaks` pre-commit hook to catch accidental key commits
- Client uses only Supabase `anon` key (safe to embed, limited by RLS)

### Row Level Security (RLS)

Every table has explicit RLS policies. Users can only SELECT/INSERT/UPDATE/DELETE their own rows (`auth.uid() = user_id`). Edge Functions bypass RLS via service role key for admin-only operations. Automated cross-user access tests: attempt to read user A's data while authenticated as user B — must fail.

### Prompt Injection Protection

- User-supplied text (exercise notes, custom names) sanitized before inclusion in prompts
- System prompt and user input separated by clear delimiters
- Output validated through safety pipeline regardless of input — defense in depth

### Rate Limiting

10 requests/minute/user on API endpoints. AI generation endpoints require valid JWT. Supabase Edge Functions enforce rate limits server-side. Input sanitization: escape HTML entities on all user input before storage.

---

## 9. Testing & Quality

### 3-Tier Testing Strategy

**Tier 1 — AI Output + Unit Tests (Vitest, every push)**

- Golden dataset: 50+ test user profiles covering all combinations of experience × goal × equipment
- Every domain rule from the safety pipeline becomes a unit test
- Schema validation tests for all Zod schemas
- Progressive overload logic edge cases (0 reps, negative weight, 1000 reps)
- Runs in CI on every push to main

**Tier 2 — E2E Critical Paths (Maestro, pre-release)**

5 journeys:
1. Signup → onboarding → first program generation
2. Start workout → log 3 exercises → complete session → view summary
3. Receive overload suggestion → accept → next session pre-filled
4. Generate AI program → modify exercise → save
5. Delete account → confirm → verify data erasure

**Tier 3 — Manual QA + Beta**

20-item pre-release checklist covering: edge cases, payment flows, auth flows, UI on iPhone SE + 15 Pro Max + Dynamic Type 2×. Beta: ≥10 TestFlight users for ≥2 weeks before App Store submission.

### Error Handling

| Failure Mode | Response |
|-------------|----------|
| Claude API down | Serve template program + notification |
| AI response slow (>15s) | Progressive loading UI → template at 30s |
| AI output fails validation | 2 retries → template fallback |
| Supabase outage | "Temporarily unavailable" screen + auto-retry |
| Network loss mid-workout | AsyncStorage guard → auto-sync on reconnect |
| Auth token expired | Auto-refresh → sign-in redirect if refresh fails |

Global error boundary wraps the app root. Sentry captures all unhandled exceptions with release tags and user context (anonymized).

---

## 10. Legal & Compliance

### Privacy (GDPR + CCPA)

- Privacy policy: in-app + App Store listing
- Encryption at rest (Supabase default) and in transit (TLS)
- User data export: JSON/CSV via Edge Function (Settings → Export My Data)
- Account + data deletion: Settings → Delete Account → 48h grace period → full erasure
- Consent screen at signup. Minimal data collection
- **GDPR DPA:** Sign Supabase standard DPA + PostHog DPA before storing any EU user data
- **EU hosting:** Supabase project in EU region. PostHog EU Cloud instance

### App Store Compliance (6-Item Checklist)

1. Health disclaimer (§5.1.3) — "This app provides training suggestions, not medical advice"
2. Account deletion (§5.1.1v) — functional, in-app, accessible from Settings
3. Privacy Nutrition Label — accurate, submitted with app review
4. AI content disclosure (§5.6.3) — "Generated by AI" badge on all AI-produced content
5. No medical claims — use "training readiness estimate" not "recovery score"
6. Sign In with Apple (§4.8) — required since Google Sign-In is offered

### Terms of Service

AI-drafted + lawyer review ($200–500). Must cover: AI content is informational not medical, user assumes responsibility for exercise execution, shared programs carry no warranty, acceptable use, account termination rights. Host as web page (Vercel or GitHub Pages), link from app + App Store listing. Complete before Phase 3 submission.

### Content Licensing

- **3D animations:** Explicit commercial license, lifetime, royalty-free (from vendor purchase)
- **Exercise metadata:** Self-built from factual sources (not copyrightable)
- **AI-generated text:** Owned by creator under current interpretation
- **No AGPL or ambiguously-licensed dependencies**

---

## 11. Launch & Monetization

### Validation-First Approach

- **Pre-launch:** Landing page (Carrd/Framer, $0–20) with email capture. Target: 200 signups from French fitness communities.
- **Beta:** Survey after ≥10 completed workouts. Questions: most-used feature, willingness to pay, fair price point, "How disappointed would you be if this app disappeared?" Minimum 20 responses.
- **Post-launch:** 4–6 weeks with all features unlocked + PostHog tracking `premium_gate_hit` events. Gate only features users actually try to access.

### PMF Criteria (Gate Paywall on All Three)

- D7 retention ≥30%
- Weekly session completion ≥2 sessions/user
- ≥20% "very disappointed" on Sean Ellis test

**Do NOT activate paid tier until all three are met.**

### Monetization Architecture

Feature flags via PostHog + `subscription_tier` column in users table (free / pro). All users default to highest tier during beta. Gating activated without code refactoring (PostHog feature flags) once PMF is validated. RevenueCat handles App Store subscription management.

### Premium Gate Candidates

| Feature | Free | Premium |
|---------|------|---------|
| Active programs | 2–3 | Unlimited |
| AI program generation | 1 free generation | Unlimited |
| Advanced analytics | Basic (weight over time) | Full (muscle balance, volume trends, 1RM tracking, strength curves) |
| Auto-periodization | Manual rotation | AI-driven mesocycles + deloads |
| Recovery scoring | — | Training-data readiness estimate |
| Data export | — | CSV / JSON |

> **TO DECIDE:** Pricing — deferred until PMF validated. Market sweet spot: $4–5/mo or $25–30/yr with ~$80 lifetime for indie apps. If AI features are the primary draw: $8–12/mo. Final pricing based on beta survey data + premium_gate_hit analytics.

### Social (Light, MVP)

Share workout summaries as Instagram Story-formatted images. Coach-lite: share programs via in-app 6-character code. Deep-linked URLs deferred to Phase 4+.

### Analytics Events (6 Core)

1. `onboarding_completed` — with experience_level, goal, equipment count
2. `workout_started` — with program_id, day_number
3. `workout_completed` — with duration, exercises_count, sets_count, pr_count
4. `ai_generation_requested` — with prompt_version, model
5. `ai_generation_served` — with source (ai | template | cache), cost, latency
6. `premium_gate_hit` — with feature_name, user_tier

Funnel: install → onboard → first workout → D7 retention → premium gate hit. All tracked in PostHog.

---

## 12. Phased Roadmap

Time-boxed phases with hard decision gates. Assumes 25–35 hrs/week focused development with Claude Code.

### Pre-Phase 1 — Setup (1–2 days)

- **Purchase** 3D animation library (~$300–600). Evaluate demos, select vendor.
- **Sign** Supabase DPA + PostHog DPA. Confirm EU hosting regions.
- **Create** two Supabase projects (dev + prod). GitHub repo. CLAUDE.md with project conventions.
- **Scaffold** Expo project: TypeScript, Tamagui, Expo Router, i18next, Zustand, react-query, expo-haptics. All strings via `t('key')` from first commit.
- **Configure** CI: GitHub Actions (vitest + lint + type-check + build). EAS Build profile.
- **Seed** exercise database: initial batch of exercises with metadata + animation URLs.

### Phase 1 — Core Logger (Weeks 1–6, max 8)

**Build:**
- Workout session logging: start workout → select exercises → log sets (weight, reps, RPE) → complete
- Exercise library with search, filter by muscle group/equipment, animated previews
- 5-screen onboarding flow
- Program creation: custom routines, day/exercise ordering, set/rep targets
- Progressive overload rules engine (on-device, deterministic)
- Training-data recovery estimation
- Basic progress charts: weight over time per exercise, PR tracking, volume per session
- Rest timer (configurable, background notification)
- Auth: Google + Apple Sign-In via Supabase
- AsyncStorage workout guard (mid-session crash recovery)
- Haptic feedback on set completion, PRs, workout finish

**Gate:** 10 beta testers log workouts for 2 weeks · 0 critical bugs · onboarding ≥85% completion rate · 5 E2E Maestro tests passing · Supabase migration workflow practiced twice.

> ⚠️ **Hard Rule:** If Phase 1 takes >9 weeks → stop, reassess scope, or seek co-founder/contractor help.

### Phase 2 — AI Layer (Weeks 7–12, max 13)

**Build:**
- Claude API integration via Supabase Edge Functions
- 3-stage safety pipeline (Zod → domain rules → coherence)
- Provider abstraction wrapper (`generateProgram()`)
- Cost guardrails: rate limits, budget cap, caching, model tiering
- 12 fallback template programs
- Prompt versioning system in Supabase
- AI program generation UI with progressive loading
- Dynamic coaching text (form cues, session previews, plateau suggestions)
- Auto-periodization (mesocycles, deload scheduling)

**Gate:** 100% golden dataset pass rate · cost/generation <$0.05 · fallbacks functional · cache infrastructure ready.

> ⚠️ **Hard Rule:** If AI quality satisfaction <60% among beta testers → defer AI features, launch with rules-only progressive overload.

### Phase 3 — Launch Prep (Weeks 13–16)

**Build:**
- App Store submission (3-week review buffer)
- PostHog + Sentry instrumentation: 6 core events firing, funnels configured
- Privacy compliance: privacy policy page, data export, account deletion
- Terms of Service: AI-drafted, lawyer reviewed, hosted on web
- Premium gates (inactive, feature-flagged via PostHog — activated post-PMF)
- RevenueCat integration (subscription management plumbing)
- Instagram Story sharing (workout summaries)
- Program sharing via in-app 6-character codes

**Gate:** App Store approved · 6 analytics events firing correctly · data export + deletion tested · all 6 compliance items verified.

> ⚠️ **Rejection Contingency:** If >2 App Store rejections → hire compliance consultant ($500–1K). Pre-vet 2–3 consultants before first submission.

### Post-Launch — Validation (4–6 weeks)

- All features unlocked for all users
- PostHog dashboard reviewed weekly
- Beta survey deployed after ≥10 workouts per user (minimum 20 total responses)
- Monitor premium_gate_hit events to identify natural paywall boundaries
- PMF measurement: D7 retention ≥30% + weekly completion ≥2 sessions + ≥20% "very disappointed"
- **If PMF met → activate paid tier.** If not → iterate on core features before monetizing.

### Total Pre-Revenue Investment

| Item | Cost |
|------|------|
| 3D animation library | ~$400 |
| Apple Developer Program | $99/yr |
| Lawyer review (ToS) | ~$300 |
| Landing page (Carrd) | ~$20 |
| Infrastructure (free tiers) | $0 |
| **Total** | **~$820** |

**Time:** ~16 weeks at 25–35 hrs/week = ~480–560 hours of focused development.

---

## 13. Excluded Scope (Phase 4+ Backlog)

Everything below is explicitly out of scope for Phases 1–3. None enters scope until Phase 3 is complete and PMF is measured.

| Feature | Why Deferred | Revisit When |
|---------|-------------|-------------|
| **Apple Watch / wearables** | Requires native modules, Expo ejection, HRV pipeline. Training-data recovery covers ~70% of value. | PMF + user demand |
| **Full offline mode** | Requires WatermelonDB/SQLite, sync engine, conflict resolution. AsyncStorage guard covers critical path. | Recurring gym connectivity complaints |
| **Web companion** | Separate React codebase. Core value is mobile logging. | PMF + demand for desktop programming |
| **Social features (feed/leaderboard)** | High effort, secondary to core value. | Retention data suggests social would help |
| **Nutrition tracking** | Content-heavy, competitive (MFP dominates). Dilutes focus. | Explicit survey demand |
| **Deep linking / Universal Links** | AASA file hosting + config. In-app code sharing works for MVP. | Phase 4 standard |
| **Custom ML models** | Needs 50K+ users for meaningful training data. LLM covers needs until then. | ≥50K active users |
| **Progress photos** | Storage-heavy, privacy-sensitive, secondary to core tracking. | User demand post-launch |
| **Data export** | Natural premium gate. CSV/JSON via Edge Function. | Monetization activation |
| **Light mode** | Dark theme via tokens makes light mode trivially addable later. | User requests |

> ⚠️ **Anti-Scope-Creep Rule:** Every feature request during Phases 1–3 goes to a "Phase 4+ Backlog" document. None enters active scope until Phase 3 is complete and PMF is measured. If Phase 1 takes >9 weeks → mandatory reassessment.

---

## 14. Guiding Principles

Decision-making heuristics for when ambiguity arises during development.

### Product Principles

- **Speed over features.** A fast, reliable logger that does 5 things well beats a slow app that does 20 things poorly. If a feature adds latency to the core logging flow, it doesn't ship.
- **Validate before building.** No premium feature gets built unless there's signal it matters. Use PostHog events and beta surveys to drive decisions, not assumptions.
- **Rules before AI.** If a deterministic rule can solve the problem, don't use an LLM. AI is for judgment calls (program design, coaching). Math is for weight progressions.
- **French is a feature, not an afterthought.** i18n architecture from commit #1. Every string goes through `t()`. Bilingual exercise names in the schema. AI generates in the user's locale natively.

### Technical Principles

- **Zero native modules.** Stay in Expo managed workflow. If a feature requires ejection, defer it. This protects build simplicity and Claude Code compatibility.
- **Server-side AI, always.** No API keys on the client. All LLM calls go through Edge Functions. All outputs validated server-side before delivery.
- **Schema-first development.** Design the Supabase schema before writing UI code. Let the data model drive the feature, not the other way around.
- **Test the happy path and the failure path.** Every AI feature has a template fallback. Every network call has a timeout and retry. Every user action has a loading state.
- **Measure everything that matters, nothing that doesn't.** 6 core PostHog events. Sentry for crashes. No vanity metrics.

### Process Principles

- **Plan → Review → Execute.** Use Claude Code's plan mode for complex features. Review the plan before executing. Never rush into code without understanding the full scope of changes.
- **CLAUDE.md is the source of truth.** Project conventions, file structure, naming patterns, testing expectations — all documented in CLAUDE.md. Update it when conventions evolve.
- **Small commits, frequent pushes.** Each commit should be a logical unit. Push to trigger CI. Don't accumulate days of uncommitted changes.
- **Time-box everything.** Phase gates exist for a reason. If something is taking 2× longer than expected, stop and reassess the approach — don't grind.
