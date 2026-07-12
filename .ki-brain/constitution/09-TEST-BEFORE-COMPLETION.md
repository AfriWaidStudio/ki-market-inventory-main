# Test Before Completion

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Never complete work without verification.**

## Verification Requirements

Before reporting completion:

### Run Available Tests

- Unit tests
- Integration tests
- E2E tests
- Manual tests (document results)

### Run Type-Check

- TypeScript compilation
- Type errors must be fixed
- Report type errors found

### Run Build

- Production build
- Development build
- Report build failures

### Run Lint

- ESLint
- Prettier
- Other linters

### Test Exact Changed Behavior

- Test the specific change
- Verify expected behavior
- Verify no regression

## Reporting Requirements

### Report Skipped Tests Honestly

- List skipped tests
- Explain why skipped
- Note risk level

### Report Pre-existing Failures

- Separate from new failures
- Document original state
- Do not hide issues

### Never Hide Failed Checks

All failures must be:

- Reported
- Documented
- Explained
- Tracked

## Verification Checklist

Before completing any work:

- [ ] Tests run (results documented)
- [ ] Type-check passed
- [ ] Build succeeded
- [ ] Lint passed
- [ ] Changed behavior tested
- [ ] No regressions introduced
- [ ] All failures reported

## Test Documentation

Document test results:

```
Tests:
- Unit: PASS/FAIL [count]
- Integration: PASS/FAIL [count]
- E2E: PASS/FAIL [count]
- Manual: PASS/FAIL [description]

Type-check: PASS/FAIL
Build: PASS/FAIL
Lint: PASS/FAIL
```

## Pre-existing Issues

Document separately:

```
Pre-existing issues:
- [issue]: [description]
- [file]:[line]
```

## New Issues

Document as bugs:

```
New issues:
- Bug ID: [ID]
- Description: [details]
- Severity: [high/medium/low]
- Fix needed: [yes/no]
```

## Verification Evidence

Record evidence:

```
Verification evidence:
- [test file]: [test name] - PASS/FAIL
- [command output] - type-check
- [build log] - build result
```

## Completion Criteria

Work is complete when:

1. All requested changes made
2. All tests pass (or failures documented)
3. Type-check passes
4. Build succeeds
5. No new regressions
6. Brain updated with verified results