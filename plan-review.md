# Review: Deferred Polish Sprint

> **Date:** 2026-02-25
> **Status:** review-round-6
> **Reviewer:** Review pane (independent Claude Code session)

## Summary Verdict
**READY** — all prior issues resolved. Plan is well-specified, codebase-verified, and ready for implementation. One minor note below (cosmetic comment inaccuracy, not a code issue).

## Round 5 Resolution Check

All three previous minor notes addressed in the updated plan:
1. ~~`viewOffset` sign wrong~~ → Now positive `SECTION_HEADER_HEIGHT` with correct explanation (line 167-168)
2. ~~Section `key` field missing~~ → Explicitly called out as a sub-step in 4a (line 159)
3. ~~`repsTarget: null` chain~~ → Documented in Open Questions #8 (line 219)

---

## Critical Issues (must fix)

None.

---

## Improvements (should fix)

None.

---

## Minor Notes

### 1. Step 3b bullet 4 — invalidation comment is slightly inaccurate

The plan says:
> `queryClient.invalidateQueries({ queryKey: ['workout-sessions'] })` — ensures history list is fresh (new session row exists in DB immediately after creation)

The `useWorkoutSessions` query filters with `.not('finished_at', 'is', null)` (line 27 of the hook), so in-progress sessions never appear in the history list. The newly created repeat session has `finished_at: null` and won't show up until it's finished (at which point `useFinishWorkout` already handles invalidation).

The invalidation call is harmless (just triggers a refetch that returns the same data), and it's fine as defensive coding. But the comment could say something like "ensures stale cache is cleared" rather than implying the new session will appear immediately.

Not a code issue — just a comment that could mislead the implementer into expecting to see the new session in the history list.

---

## Questions for the Author

None — plan is ready for implementation.
