# MaxReps — CLAUDE.md

## Project Summary
Mobile-first gym workout tracking app (iOS). Fast session logging + progressive overload engine + AI program generation via Claude API. Bilingual (EN/FR) from commit #1. Targets intermediate lifters. Built solo with Claude Code. Cloud-first, online-required — no full offline mode.

## Tech Stack
- **Frontend:** React Native 0.81.5 + Expo SDK 54 (TypeScript 5.9), managed workflow
- **UI:** Tamagui 2.0.0-rc.11 (v5 config, dark mode default) · Reanimated 4.1.1
- **Navigation:** Expo Router (file-based) · **State:** Zustand 5 + @tanstack/react-query 5
- **Backend:** Supabase (Postgres + Auth + Edge Functions) · Two projects: dev and prod
- **Auth:** Supabase Auth — Google + Apple Sign-In only (no email/password)
- **AI:** Claude API via Edge Functions (Sonnet for generation, Haiku for coaching)
- **i18n:** i18next 25 + react-i18next + expo-localization
- **Testing:** Vitest 4 (unit) + Maestro (E2E) · **CI:** GitHub Actions
- **Infra:** PostHog (analytics, EU) · Sentry (crashes) · RevenueCat (Phase 3) · EAS Build/Submit

## Folder Structure
app/                  # Expo Router: 12 screens + 6 layouts
components/           # ui/ (design system), workout/, program/, + shared at root
stores/               # Zustand: workout, user, exercise
lib/                  # theme.ts (design tokens), supabase, overload, auth, i18n
hooks/                # Data fetching, overload, mutations (6 hooks)
locales/              # en.json, fr.json — all UI strings via t('key')
supabase/             # migrations/ (committed), functions/ (Edge Functions)
docs/design/          # system/ (4 spec YMLs — authoritative), references/ (26 pairs)
assets/               # Fonts (Inter 5 weights), images

## Key Commands
- `npx expo start --ios` — Run on iOS simulator
- `npx vitest` — Unit tests · `maestro test flows/` — E2E tests
- `npx tsc --noEmit && npx eslint .` — Type check + lint
- `eas build --profile preview` · `supabase functions deploy <name>` — Build / deploy
- `supabase db diff -f <name>` → test in dev → `supabase db push` — Migration workflow

## Project Rules
- **IMPORTANT:** Every UI string must use `t('key')` — no hardcoded text. French can be empty initially.
- **IMPORTANT:** Zero native modules. Stay in Expo managed workflow. Defer features requiring ejection.
- **IMPORTANT:** All AI/LLM calls via Supabase Edge Functions. No API keys on the client. Ever.
- **IMPORTANT:** All tables must have RLS policies (`auth.uid() = user_id`). Test cross-user access fails.
- **IMPORTANT:** Anti-scope-creep — features outside current phase go to Phase 4+ Backlog. No exceptions.
- **IMPORTANT:** `lib/theme.ts` + `docs/design/system/*.yml` are the design source of truth. No hardcoded colors/spacing.
- Schema-first: design Supabase schema before UI. Rules before AI: deterministic logic first.
- Cloud-first: only active workout in AsyncStorage (crash recovery). No full offline mode.
- All screens use `headerShown: false` + custom View-based headers. No native React Navigation headers.
- Weights in kg. `accessibilityLabel` on all interactive elements.
- AI outputs: Zod schema → domain rules → coherence. Prompts in `prompt_versions` table (not hardcoded).
- Perf targets: cold start <3s, transitions <300ms, save set <500ms, search <200ms.
- Never commit secrets (.env, API keys, tokens). Sanitize user input before AI prompts.
