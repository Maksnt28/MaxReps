# Review: Deferred Items — Apple Sign-In + Cross-User RLS Tests

> **Date:** 2026-02-24
> **Status:** review-round-4
> **Reviewer:** Review pane (independent Claude Code session)

## Summary Verdict
**READY** — Plan has been through three review rounds and is tight. All critical and improvement issues resolved. Validated assumptions against the actual codebase and Vitest 4 docs. Two minor items remain from round 3 that weren't incorporated, plus one new observation.

## Critical Issues (must fix)

None.

## Improvements (should fix)

None.

## Minor Notes (nice to have)

- **M1 — Stale `afterAll` description (carried from round 3):** Line 188 still says "FK-ordered deletion + auth user removal." Should read "Cascade deletion from `public.users` + auth user removal" to match step 10's corrected cascade approach.

- **M2 — Line number drift in plan text:** `signInWithApple()` is at lines 117-153 (plan says 113-153), and `handle_new_user()` starts at line 143 (plan says 142). Cosmetic only — doesn't affect execution.

- **M3 — `resolve.alias` inheritance with `extends: true`:** Vitest docs confirm `extends: true` merges "all options" but don't explicitly list `resolve.alias` as inherited. The plan correctly provides an explicit `resolve.alias` on the integration project (`extends: false`), so the only risk is on the unit project. If alias inheritance fails, unit tests would break immediately and obviously — easy to debug by adding explicit `resolve` to the unit project. Very low risk, but worth a mental note during step 7.

## Questions for the Author

None. Plan is approved for execution.
