# Review: Home Screen — Merge Progress Dashboard + Missing Tests

> **Date:** 2026-02-19
> **Status:** review-round-8 (final)
> **Reviewer:** Review pane (independent Claude Code session)

## Summary Verdict

**READY** — no remaining issues. Approve and execute.

All 3 improvements and 2 minor notes from round 7 have been addressed with concrete changes:

| Round 7 Issue | Resolution in Plan |
|--------------|-------------------|
| **I1** Test count wrong (35→28) | Fixed to "28 (19 formulas + 9 PR)" and total target ~154 |
| **I2** Hook tests need pure extraction | New Step 4: extract into `lib/chartTransforms.ts` before testing |
| **I3** Tab icon should change | Step 2 updated: `home-outline` → `stats-chart-outline` |
| **N1** Volume includes warmups | Step 4 adds `.eq('is_warmup', false)` fix |
| **N2** Tab/header label mismatch | Acknowledged as intentional — correct UX decision |

The plan is tight and surgical — 8 steps for a well-defined migration with no architectural risk. The pure function extraction (Step 4) is the right pattern, matching the existing `prDetection.ts` / `prDetection.test.ts` precedent.

---

## Critical Issues (must fix)

None.

## Improvements (should fix)

None.

## Minor Notes (nice to have)

None — all prior notes addressed.

## Questions for the Author

None. Ship it.
