# Review: Home Screen Enhancements

> **Date:** 2026-02-26
> **Status:** review-round-8
> **Reviewer:** Review pane (independent Claude Code session)

## Summary Verdict
**READY** — minor suggestions only

This plan has been through 7 prior review rounds and is comprehensive. I performed a fresh independent pass including full codebase verification of all referenced files, hooks, stores, and tokens. The plan's assumptions are accurate and the architecture is sound.

---

## Codebase Verification (Round 8)

| Assumption | Verified | Notes |
|-----------|----------|-------|
| `app/(tabs)/index.tsx` layout (pills outside ScrollView, `hasData` inside) | ✓ | Lines 74-88 pills, line 99 `hasData` ternary |
| `useFinishWorkout` invalidation in `hooks/useWorkoutMutations.ts` | ✓ | 8 query keys invalidated (lines 30-37) |
| `useDiscardWorkout` exists with `sessionId` param | ✓ | Line 143-153 |
| `useUpdateProgram` handles `is_active` | ✓ | Line 88: `is_active?: boolean` in params |
| `useDeleteProgram` exists | ✓ | Lines 104-120 |
| `app/program/[id].tsx` TODO at line 97 | ✓ | Uses `endWorkout()` instead of `discardWorkout` |
| `useWorkoutStore` exposes `isActive`, `programDayId`, `sessionId` | ✓ | Lines 26-28 |
| `queryClient` is module-level in `_layout.tsx` | ✓ | Lines 21-28 |
| Prefetch insertion: after `syncUserProfile()`, before `setIsLoading(false)` | ✓ | Lines 116-117 in `_layout.tsx` |
| `resetTimer()` pattern | ✓ | `[sessionId].tsx:34`: `const resetTimer = useRestTimerStore((s) => s.reset)` — plan matches existing alias pattern |
| `Divider` with `variant` prop | ✓ | `components/ui/Divider.tsx`, accepts `'neutral' | 'accent'` |
| Theme tokens (`gray3/5/7`, `accent`, `semantic.progress`) | ✓ | All present in `lib/theme.ts` |
| Repeat workout invalidates `month-sessions` | ✓ | `[sessionId].tsx:51` |

---

## Critical Issues (must fix)

None.

## Improvements (should fix)

None.

## Minor Notes (nice to have)

### 1. `sessionId` Param for `discardWorkout` (carried from round 7)

Line 99 describes the start flow with `discardWorkout.mutateAsync()` but doesn't explicitly show the `sessionId` argument. The component already reads `sessionId` from `useWorkoutStore` (line 95), so this is obvious during implementation. Just worth noting to not forget.

### 2. Prefetch Needs `queryClient` Import in Init Flow

The plan says to prefetch in the `getSession().then()` block (lines 112-118 of `_layout.tsx`). The `queryClient` is available as a module-level constant, so this works. However, the `useNextProgramDay` fetcher function will need to be importable as a standalone function (not just as part of the hook). Consider exporting `nextProgramDayQueryFn` from the hook file — same pattern as `monthSessionsQueryFn` in `hooks/useMonthSessions.ts`.

### 3. Duration Estimate Rounding

The formula `totalSets × (restSeconds + 40) / 60` rounded to nearest 5 min is reasonable. Edge case: a program day with 1 exercise, 1 set could estimate "~0 min" after rounding. Consider a minimum of 5 min (`Math.max(5, rounded)`).

---

## Questions for the Author

None. The plan is ready for implementation.
