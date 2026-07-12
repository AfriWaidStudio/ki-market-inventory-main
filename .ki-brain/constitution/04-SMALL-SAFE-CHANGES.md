# Small Safe Changes

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Make the smallest safe change that addresses the request.**

## Narrow Fixes First

When fixing a bug or implementing a feature:

1. Identify the root cause
2. Make the minimal change to address it
3. Verify the fix works
4. Do not refactor unrelated code

## One Problem at a Time

Work on one issue at a time:

- Do not fix multiple bugs in one change
- Do not add multiple features at once
- Do not refactor and fix simultaneously
- Complete one task before starting another

## Avoid Unrelated Refactors

**Do not** refactor code that:

- Is not broken
- Is not requested
- Is not causing problems
- Works correctly

## Avoid Large Rewrites

Large rewrites are dangerous because:

- They introduce many changes
- They are hard to review
- They may break unexpected things
- They are hard to rollback

If a large rewrite is necessary:

1. Get explicit owner approval
2. Create a branch
3. Make incremental commits
4. Run tests after each step

## Preserve Rollback Paths

Every change should be easily reversible:

- Use small commits
- Keep changes focused
- Document what was changed
- Note any breaking changes

## Stop After Requested Stage

When work is complete:

- Do not continue to "improve"
- Do not add "just one more thing"
- Stop when the request is satisfied
- Report completion

## Never "Improve Everything"

Bug fixes are not the time to:

- Rewrite the entire module
- Add new features
- Fix style issues
- Clean up code
- Optimize performance

These belong in separate work.

## Safe Change Pattern

```
Problem: [brief description]
File: [path]
Change: [specific change]
Reason: [why this change]
Risk: [low/medium/high]
Test: [how to verify]
```

## Change Size Guidelines

- **Low risk**: Single function, single file
- **Medium risk**: Multiple functions, related files
- **High risk**: Database changes, API changes, auth changes

## Progress Safely

When work can safely continue without destructive action:

- Make the safest narrow progress
- Do not abandon the task
- Document the limitation
- Ask for guidance if stuck