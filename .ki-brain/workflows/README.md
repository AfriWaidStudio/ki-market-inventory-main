# Workflows

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Overview

This folder contains standard operating procedures for agents working on KI Market Inventory.

## Files

| File | Purpose | Status |
| ---- | ------- | ------ |
| `README.md` | Workflow overview | ACTIVE |
| `BEFORE-WORK.md` | Pre-work checklist | ACTIVE |
| `DURING-WORK.md` | During work guidelines | ACTIVE |
| `AFTER-WORK.md` | Post-work verification | ACTIVE |
| `HANDOFF.md` | Handoff format | ACTIVE |

## Workflow Sequence

1. Read Brain (`00-START-HERE.md`)
2. Classify task
3. Inspect code
4. Identify risks
5. Identify contracts
6. Identify tests
7. List intended files
8. Confirm no-delete compliance
9. Confirm approval gates
10. Make smallest safe change
11. Verify changes
12. Update Brain
13. Produce handoff

## Task Classification

Identify the task class before editing:

```
[ ] INSPECTION    - Code analysis, documentation, research
[ ] BUG FIX       - Fixing a confirmed defect
[ ] FEATURE       - Adding new functionality
[ ] REFACTOR      - Improving code structure
[ ] DATABASE      - Database schema, migrations, queries
[ ] AUTH          - Authentication, sessions, passwords
[ ] SECURITY      - Security controls, access, encryption
[ ] UI            - User interface, components, styling
[ ] DEPLOYMENT    - Build, CI/CD, hosting, environment
[ ] DOCUMENTATION - Brain updates, comments, README
```

## Stop Conditions

Stop and ask if:

- [ ] Missing required context
- [ ] Destructive operation without approval
- [ ] Database reset required
- [ ] Secret exposure risk
- [ ] Ambiguous ownership
- [ ] Conflicting decisions
- [ ] Unverified migration state
- [ ] Broad rewrite when narrow fix possible

## Risk Assessment

Mark risk levels:

```
Risk Level:
[ ] LOW    - Minimal impact, easy rollback
[ ] MEDIUM - Moderate impact, some testing needed
[ ] HIGH   - Significant impact, careful testing
[ ] CRITICAL - Data/security impact, owner approval required
```

## No-Delete Rule

From Constitution 01:
- Never delete without owner approval
- Comment out with standard format
- Document dependencies
- Provide rollback instructions

## Approval Gates

From Constitution 10 - Require approval before:

- Deleting code
- Dropping database data
- Resetting databases
- Replacing authentication architecture
- Changing payment behavior
- Changing wallet balances
- Changing billing rates
- Changing role permissions
- Disabling security controls
- Rotating secrets
- Migrating production data
- Removing public APIs
- Breaking existing contracts

## Last Updated

2026-07-11