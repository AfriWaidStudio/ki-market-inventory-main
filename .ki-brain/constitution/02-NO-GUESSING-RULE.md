# No Guessing Rule

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Never claim anything about the repository unless confirmed from code, configuration, documentation, or direct owner instruction.**

## Inspect First

Before making any claim:

1. Read the source code
2. Check configuration files
3. Verify documentation
4. Run tests if relevant
5. Get owner confirmation for uncertain matters

## Separate Fact From Assumption

When something is uncertain, use these labels:

```
CONFIRMED      - Verified by code, config, or owner
PARTIALLY CONFIRMED - Partially verified
UNCONFIRMED    - Not yet verified
OWNER DECISION - Owner has decided
DEPRECATED     - Superseded but still present
PROPOSED       - Suggested, not yet verified
```

## Never Invent

Do not claim:

- Architecture decisions not in documented decisions
- Route paths not verified in code
- API endpoints not found in source
- Database tables not in schema
- Environment variables not in `.env` or config
- Features not implemented
- Agent capabilities not documented
- Permissions not defined
- User roles not in code
- Dependencies not in `package.json`
- File paths not existing
- Product behavior not tested
- Completed work without verification

## Never Assume Tests Pass

Do not claim tests pass unless:

- Tests were run and passed
- The test output was captured
- Build succeeded

## Never Assume Database Migration Applied

Do not claim a migration was applied unless:

- Migration history was checked
- Database state was verified
- Owner confirmation received

## Never Claim Fix Without Verification

Do not claim an issue is fixed only because code looks correct. Verify by:

- Running tests
- Manual testing
- Type checking
- Build verification

## When Uncertain

When uncertain about any aspect:

1. State it as UNCONFIRMED
2. Do not use it for decision making
3. Ask for clarification or do inspection

## Evidence Requirements

Every claim should have evidence:

```
Evidence: [code file:line], [config file], [owner instruction], [test output]
```

## Safe Language

Use safe language when uncertain:

- "If the code is correct..."
- "Assuming X exists..."
- "The code appears to..."
- "According to the schema..."

Never:

- "The system uses..."
- "This function does..."
- "The database has..."
- "The API returns..."

## Documentation as Secondary Source

Documentation can support but not replace code verification. Always verify against actual code.