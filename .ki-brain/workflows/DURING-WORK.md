# During Work

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Work Guidelines

### 1. Make Small Changes

- Work incrementally
- One change at a time
- Commit logical units
- Keep changes focused

### 2. Avoid Unrelated Edits

Do not:
- Fix style issues
- Rename variables unnecessarily
- Add comments unless requested
- Change formatting
- Refactor unrelated code

### 3. Continuous Validation

After each change:
- [ ] Run type-check
- [ ] Run relevant tests
- [ ] Run build
- [ ] Verify behavior

### 4. Preserve Old Behavior

Unless intentionally changing:
- Keep existing behavior
- Maintain contracts
- Preserve interfaces
- Keep backward compatibility

### 5. Update Findings

Document as you go:
- What you found
- What you changed
- What you verified
- What you're unsure about

### 6. Stop on Destructive Risk

If you encounter:
- Data loss risk
- Deletion requirement
- Breaking change risk

Stop and:
1. Document the risk
2. Ask for approval
3. Wait for guidance

## Change Documentation

Record each change:

```
Change:
- File: [path]
- Line: [number]
- Type: [edit/add/remove/comment]
- Reason: [why]
- Risk: [low/medium/high]
```

## Verification During Work

### Type Checking

```bash
npx tsc --noEmit
# or
npm run typecheck
```

### Tests

```bash
# Run specific test file
npx vitest run [file]

# Run all tests
npx vitest run
```

### Build

```bash
npm run build
```

## Code Quality

### Style

- Follow existing patterns
- Match indentation
- Use existing imports
- Keep line length reasonable

### Naming

- Use existing conventions
- Match surrounding code
- Be descriptive but concise

### Comments

- Add comments for complex logic
- Document new functions
- Remove outdated comments

## Risk Management

### High-Risk Changes

Require extra care:
- Database operations
- Authentication changes
- Security changes
- API changes

### Medium-Risk Changes

Standard care:
- New features
- Bug fixes
- Refactoring

### Low-Risk Changes

Minimal care:
- Typos
- Formatting
- Comments

## Stop Conditions

Stop if:

- Type errors appear
- Tests fail unexpectedly
- Build breaks
- Security issue found
- Data loss risk
- Owner requests stop

## Record Progress

Keep track of:

- What was done
- What was verified
- What is pending
- What is blocked

## Documentation

Update Brain when:
- Significant changes made
- New understanding gained
- Status changes
- Risks identified