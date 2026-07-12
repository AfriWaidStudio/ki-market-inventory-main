# Handoff

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Handoff Format

Use this format for all work completion reports.

---

## Task

Brief description of what was worked on.

## Status

- COMPLETE
- PARTIAL
- BLOCKED
- STOPPED

## What Changed

### Files Created

- [file path] - [purpose]
- [file path] - [purpose]

### Files Modified

- [file path]:[line] - [change description]
- [file path]:[line] - [change description]

### Files Commented

None (or list commented files with reason)

### Files Deleted

None (or list deleted files - should normally be none)

## Tests

- Unit: PASS/FAIL [count]
- Integration: PASS/FAIL [count]
- E2E: PASS/FAIL [count]
- Manual: PASS/FAIL [description]

## Build

- Development: PASS/FAIL
- Production: PASS/FAIL

## Type-Check

- Result: PASS/FAIL
- Errors: [list if any]

## Known Risks

- [risk]: [description]
- [risk]: [description]

## Next Safe Step

What can be done next:

1. [step 1]
2. [step 2]
3. [step 3]

## Approval Needed

List any approvals required:

- [approval type]: [description]
- [approval type]: [description]

---

## Evidence

- Build output: [result]
- Test output: [result]
- Type-check: [result]
- Verified against: [files]

## Last Step

Stop after producing this handoff report.

Do not begin next stage unless explicitly requested.