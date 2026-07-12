# Architecture Decision Records

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Overview

This folder contains Architecture Decision Records (ADRs).

## Purpose

Document architecture decisions with:

- Context and rationale
- Alternatives considered
- Consequences
- Approval status

## Decision Status

| Status | Meaning |
| ------ | ------- |
| PROPOSED | New, needs review |
| ACCEPTED | Approved by owner |
| DEPRECATED | Superseded |
| REJECTED | Not chosen |
| SUPERSEDED | Replaced |

## Decision Template

Use `DECISION-TEMPLATE.md` for all decisions.

## Decision ID Format

`DEC-[NUMBER]`

Examples:
- `DEC-001` - First decision
- `DEC-002` - Second decision

## Decision Index

See `DECISION-INDEX.md` for all decisions.

## When to Create a Decision

Create a decision record when:

- Choosing between alternatives
- Making architectural trade-offs
- Selecting technology
- Changing major behavior
- Any significant choice

## Decision Process

1. Identify decision need
2. Create decision document
3. Consider alternatives
4. Document consequences
5. Get owner approval
6. Implement
7. Update index

## Evidence Requirement

Each decision must include evidence:

```
Evidence:
- [code file:line]
- [config file]
- [test output]
- [owner instruction]
```

## Last Updated

2026-07-11