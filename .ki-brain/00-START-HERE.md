# Start Here

This is the bootstrap sequence for any AI agent entering this repository.

## Bootstrap Sequence

1. Read `BRAIN-MANIFEST.md`.
2. Read the Constitution index (`constitution/README.md`).
3. Read `context/CURRENT-STATE.md`.
4. Read `context/CURRENT-GOALS.md`.
5. Read `context/CURRENT-BLOCKERS.md`.
6. Read `context/ACTIVE-WORK.md`.
7. Read relevant architecture documents.
8. Read accepted decisions related to the task.
9. Read the relevant workflow (`workflows/BEFORE-WORK.md`, `DURING-WORK.md`, `AFTER-WORK.md`).
10. Inspect the actual code before making claims.
11. Announce the files expected to change.
12. Make the smallest safe change.
13. Run appropriate checks.
14. Update the Brain only with verified results.
15. Produce a handoff report.

## Task Classification

Identify the task class before editing:

```
INSPECTION    - Code analysis, documentation, research
BUG FIX       - Fixing a confirmed defect
FEATURE       - Adding new functionality
REFACTOR      - Improving code structure without changing behavior
DATABASE      - Database schema, migrations, queries
AUTH          - Authentication, sessions, passwords
SECURITY      - Security controls, access, encryption
UI            - User interface, components, styling
DEPLOYMENT    - Build, CI/CD, hosting, environment
DOCUMENTATION - Brain updates, comments, README
```

Mark your task class in your response.

## Stop Conditions

Stop and ask for approval if:

- Missing required context that cannot be safely inferred
- Destructive operation requested without approval
- Database reset required (DROP/TRUNCATE/DELETE)
- Secret exposure risk detected
- Ambiguous ownership of a component
- Conflicting architecture decisions exist
- Unverified migration state (cannot confirm if migration applied)
- Broad rewrite when narrow fix is possible
- No-delete rule would be violated

However, when work can safely continue without destructive action, the agent should make the safest narrow progress instead of abandoning the task.

## Quick Navigation

| Document | Purpose |
| -------- | ------- |
| `BRAIN-MANIFEST.md` | Brain system overview |
| `BRAIN-INDEX.md` | Navigation index |
| `constitution/` | Governance rules |
| `context/` | Current project state |
| `architecture/` | System design |
| `decisions/` | Architecture decisions |
| `workflows/` | How to work |
| `reports/` | Reporting templates |
| `registry/` | Indexes of agents, skills, etc. |