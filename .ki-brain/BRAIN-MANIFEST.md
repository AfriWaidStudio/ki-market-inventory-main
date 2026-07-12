# Brain Manifest

## Brain name

KI Matrix Brain

## Format

Markdown

## Repository scope

Current repository only

## Primary purpose

Shared memory, governance, architecture, workflows, and reusable intelligence for AI development agents and human developers.

## Runtime dependency

None

## Tool dependency

None

## Owner authority

Absolute within legal and security constraints

## Document status labels

```
DRAFT       - Initial draft, needs review
ACTIVE      - Currently valid
ACCEPTED    - Confirmed by owner
DEPRECATED  - Superseded, do not use
ARCHIVED    - Historical reference
BLOCKED     - Cannot be used until issue resolved
```

## Evidence labels

```
OWNER-CONFIRMED  - Confirmed by owner instruction
CODE-CONFIRMED   - Verified by reading source code
TEST-CONFIRMED   - Verified by running tests
RUNTIME-CONFIRMED - Verified by actual execution
DOCUMENT-CONFIRMED - Verified by documentation
UNCONFIRMED      - Not yet verified
```

## Freshness fields

Every important document should contain:

```markdown
Status: [label]
Last verified: [date]
Verified against: [code/config files]
Maintainer: [who last updated]
Scope: [what this covers]
```

## Stale Document Policy

Documents without recent verification must be treated as potentially outdated. Always verify against current code before relying on documented behavior.

## Update Protocol

After any verified change:

1. Update the relevant Brain document
2. Record the verification evidence
3. Update the last verified date
4. Notify any relevant maintainers

## Brain vs Code

- **Brain** = Context, decisions, policies
- **Code** = Executable implementation
- When they conflict, **code is truth** unless explicitly documented otherwise

## Ownership

The repository owner has absolute authority. All Brain governance serves the owner's intent.