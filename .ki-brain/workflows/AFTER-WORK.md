# After Work

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Post-Work Verification

### 1. Run Checks

**Type-Check**
```bash
npx tsc --noEmit
# or
npm run typecheck
```

**Tests**
```bash
# Run all tests
npx vitest run

# Run specific tests
npx vitest run [file]
```

**Build**
```bash
npm run build
```

**Lint**
```bash
npm run lint
```

### 2. Compare Expected vs Actual

- [ ] Did the change work as expected?
- [ ] Did I break anything?
- [ ] Are tests passing?
- [ ] Is the build clean?

### 3. Document Results

```
Results:
- Type-check: PASS/FAIL
- Tests: PASS/FAIL [count]
- Build: PASS/FAIL
- Lint: PASS/FAIL
```

### 4. Update Brain

Only with verified results:
- Update CURRENT-STATE.md
- Update FINISHED-FEATURES.md
- Update ACTIVE-WORK.md
- Update TECHNICAL-DEBT.md

### 5. Produce Handoff Report

Use `HANDOFF.md` format.

## Verification Checklist

- [ ] Type-check passed
- [ ] All tests passed (or failures documented)
- [ ] Build succeeded
- [ ] No new regressions
- [ ] Brain updated with verified results
- [ ] Handoff report produced

## Failed Checks

If checks fail:

1. Document the failure
2. Do not hide the failure
3. Analyze the cause
4. Fix or report as known issue

## Pre-existing Failures

Separate from new failures:

```
Pre-existing issues:
- [issue]: [description]
- [file]:[line]

New issues:
- [issue]: [description]
- [file]:[line]
```

## Brain Updates

Update only with verified facts:

```
Last verified: [date]
Verified against: [files/checks]
Evidence: [test output, build log]
```

## Stop

After verification and documentation, stop working.

Do not continue to "improve" or "clean up" unless specifically requested.