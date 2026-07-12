# Playbook Registry

Status: PLANNED  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Purpose

Index of all playbooks (step-by-step procedures).

## Playbook Definition

| Playbook ID | Name | Trigger | Required approvals | Status |
| ----------- | ---- | ------- | ------------------ | ------ |

## Entry Format

```
| [ID] | [Name] | [Trigger] | [Approvals] | [Status] |
```

## Trigger Types

- TASK - Task start
- BUG - Bug report
- FEATURE - Feature request
- REVIEW - Code review
- DEPLOY - Deployment
- MIGRATION - Database migration
- SECURITY - Security issue

## Required Approvals

List any approvals needed before playbook runs:

- OWNER - Owner approval
- SECURITY - Security review
- TEST - Test review

## Status Labels

- ACTIVE - Currently available
- INACTIVE - Not currently used
- ARCHIVED - Historical reference
- PLANNED - To be created

## Stage 1

**Stage 1 foundation only.**  
Entries will be created in later stages.