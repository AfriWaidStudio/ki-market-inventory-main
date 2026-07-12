# Before Work

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Pre-Work Checklist

### 1. Read the Brain

- [ ] Read `00-START-HERE.md` (bootstrap sequence)
- [ ] Read `BRAIN-MANIFEST.md` (system definition)
- [ ] Read `BRAIN-INDEX.md` (navigation)
- [ ] Read relevant architecture documents
- [ ] Read `context/CURRENT-STATE.md`
- [ ] Read `context/CURRENT-GOALS.md`
- [ ] Read `context/CURRENT-BLOCKERS.md`
- [ ] Read `context/ACTIVE-WORK.md`
- [ ] Read accepted decisions in `decisions/`

### 2. Classify Task

Identify the task class:

```
[ ] INSPECTION    - Code analysis, documentation, research
[ ] BUG FIX       - Fixing a confirmed defect
[ ] FEATURE       - Adding new functionality
[ ] REFACTOR      - Improving code structure without changing behavior
[ ] DATABASE      - Database schema, migrations, queries
[ ] AUTH          - Authentication, sessions, passwords
[ ] SECURITY      - Security controls, access, encryption
[ ] UI            - User interface, components, styling
[ ] DEPLOYMENT    - Build, CI/CD, hosting, environment
[ ] DOCUMENTATION - Brain updates, comments, README
```

### 3. Inspect Code

- [ ] Search related files
- [ ] Trace callers and dependencies
- [ ] Inspect tests
- [ ] Inspect configuration
- [ ] Inspect environment-variable names
- [ ] Inspect database effects
- [ ] List planned file changes

### 4. Identify Risks

- [ ] Data loss risk
- [ ] Breaking change risk
- [ ] Security risk
- [ ] Dependency risk
- [ ] User impact

### 5. Identify Contracts

- [ ] API request contracts
- [ ] API response contracts
- [ ] Database contracts
- [ ] Component props
- [ ] Event payloads
- [ ] Environment variables
- [ ] Route paths
- [ ] Public exports

### 6. Identify Tests

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual test plan

### 7. List Intended Files

```
Files expected to change:
1. [file path] - [brief reason]
2. [file path] - [brief reason]
```

### 8. Confirm No-Delete Compliance

- [ ] No deletions planned
- [ ] If commenting out: standard format ready
- [ ] Dependencies checked
- [ ] Rollback path available

### 9. Confirm Approval Gates

- [ ] No approval-gated operations planned
- [ ] If any: owner approval obtained
- [ ] Migration approvals ready if needed

## Risk Assessment

Mark risk levels:

```
Risk Level:
[ ] LOW    - Minimal impact, easy rollback
[ ] MEDIUM - Moderate impact, some testing needed
[ ] HIGH   - Significant impact, careful testing
[ ] CRITICAL - Data/security impact, owner approval required
```

## Stop Conditions

Stop if:

- [ ] Missing required context
- [ ] Destructive operation without approval
- [ ] Database reset required
- [ ] Secret exposure risk
- [ ] Ambiguous ownership
- [ ] Conflicting decisions
- [ ] Unverified migration state
- [ ] Broad rewrite when narrow fix possible

## Proceed Confirmation

Only proceed when:

- [ ] All checklist items reviewed
- [ ] Risks assessed
- [ ] No-delete rule satisfied
- [ ] Approval gates cleared

## Start Work

Begin work only after this checklist is complete.