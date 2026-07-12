# Document Every Decision

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Architecture decisions must be recorded in the decisions/ folder.**

## Decision Documents

Every significant decision must have an ADR (Architecture Decision Record).

## Decision Document Requirements

Decision documents need:

- **Context**: Why this decision was needed
- **Problem**: What problem is being solved
- **Decision**: What was chosen
- **Reasons**: Why this choice
- **Alternatives considered**: What other options existed
- **Consequences**: What happens after
- **Risks**: What could go wrong
- **Compatibility impact**: Breaking changes
- **Security impact**: Security implications
- **Migration plan**: How to transition
- **Rollback plan**: How to undo
- **Evidence**: What was verified
- **Approval**: Who approved

## Use the Template

Use `decisions/DECISION-TEMPLATE.md` for all decisions.

## Temporary Decisions

Temporary decisions must have:

- Review date
- Expiration
- Owner assigned
- Success criteria

## AI Agent Role

AI agents may:

- Propose decisions
- Create draft documents
- Suggest alternatives

AI agents must NOT:

- Mark major decisions as accepted without owner approval
- Implement breaking changes without approval
- Assume decisions are final

## Decision Status

Mark decisions with:

- PROPOSED - New, needs review
- ACCEPTED - Approved by owner
- DEPRECATED - Superseded
- REJECTED - Not chosen
- SUPERSEDED - Replaced by another decision

## Decision Process

1. Identify decision need
2. Create decision document
3. Consider alternatives
4. Document consequences
5. Get owner approval
6. Implement decision
7. Update affected systems
8. Close decision

## Major Decisions

Major decisions require:

- Full ADR document
- Owner approval
- Impact analysis
- Migration plan
- Testing strategy

## Minor Decisions

Minor decisions may use:

- Brief documentation
- Inline comments
- Simple records

Examples of minor decisions:

- Variable naming
- Comment style
- File organization
- Minor refactorings

## Decision Review

Review decisions when:

- Requirements change
- Technology evolves
- New information appears
- Owner requests review

## Decision Index

All decisions must be listed in `decisions/DECISION-INDEX.md`.

## Evidence Requirement

Every decision must have evidence:

```
Evidence:
- [code file:line] - what was verified
- [config file] - what was checked
- [test output] - what was run
- [owner instruction] - what was decided
```