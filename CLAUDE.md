# MaxReps — CLAUDE.md

## Project Summary
Mobile-first gym workout tracking app (iOS). Fast session logging + progressive overload engine + AI program generation via Claude API. Bilingual (EN/FR) from commit #1. Targets intermediate lifters. Built solo with Claude Code. Cloud-first, online-required — no full offline mode.

## Tech Stack
- **Frontend:** React Native + Expo (TypeScript), managed workflow
- **UI:** Tamagui (design tokens, dark mode default)
- **Navigation:** Expo Router (file-based) · **State:** Zustand + @tanstack/react-query
- **Backend:** Supabase (Postgres + Auth + Edge Functions). Two projects: dev and prod
- **Auth:** Supabase Auth — Google + Apple Sign-In only (no email/password)
- **AI:** Claude API via Edge Functions (Sonnet for generation, Haiku for coaching)
- **i18n:** i18next + react-i18next + expo-localization
- **Testing:** Vitest (unit) + Maestro (E2E) · **CI:** GitHub Actions
- **Infra:** PostHog (analytics, EU) · Sentry (crashes) · RevenueCat (Phase 3) · EAS Build/Submit

## Folder Structure
```
app/                  # Expo Router screens (file-based routing)
components/           # Shared UI components (Tamagui)
stores/               # Zustand stores (workout, user, exercise)
lib/                  # Utilities, Supabase client, AI helpers
hooks/                # Custom React hooks
locales/              # en.json, fr.json — all UI strings via t('key')
supabase/             # functions/ (Edge Functions), migrations/ (committed to repo)
assets/               # Images, animations, fonts
docs/                 # PROJECT_PLAN.md, architecture docs
```

## Key Commands
- `npx expo start --ios` — Run on iOS simulator
- `npx vitest` — Unit tests · `maestro test flows/` — E2E tests
- `npx tsc --noEmit && npx eslint .` — Type check + lint
- `eas build --profile preview` — Preview build
- `supabase db diff -f <name>` → test in dev → `supabase db push` — Migration workflow
- `supabase functions deploy <name>` — Deploy Edge Function

## Project Rules
- **IMPORTANT:** Every UI string must use `t('key')` — no hardcoded text. French can be empty initially.
- **IMPORTANT:** Zero native modules. Stay in Expo managed workflow. Defer features requiring ejection.
- **IMPORTANT:** All AI/LLM calls via Supabase Edge Functions. No API keys on the client. Ever.
- **IMPORTANT:** All tables must have RLS policies (`auth.uid() = user_id`). Test cross-user access fails.
- **IMPORTANT:** AI outputs validated through 3-stage pipeline: Zod schema → domain rules → coherence.
- **IMPORTANT:** Anti-scope-creep — features outside current phase go to Phase 4+ Backlog. No exceptions.
- Schema-first: design Supabase schema before UI. Rules before AI: deterministic logic first.
- Cloud-first: only active workout in AsyncStorage (crash recovery). No full offline mode.
- Prompts in `prompt_versions` table, not hardcoded. Rollback by toggling `is_active`.
- Weights in kg. Dark mode default. `accessibilityLabel` on all interactive elements.
- Perf targets: cold start <3s, transitions <300ms, save set <500ms, search <200ms.
- `gitleaks` pre-commit hook. Sanitize user input before AI prompts. Small commits, frequent pushes.
