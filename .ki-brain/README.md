# KI Matrix Brain

## What This Is

The `.ki-brain` directory is the permanent project intelligence and governance layer for the **KI Market Inventory** repository.

It serves as **shared memory** for AI development agents (Kilo Code, Codex, Claude Code, Cursor, Windsurf, Gemini CLI, Roo Code, Aider, GitHub Copilot, and future agents) and human developers.

## Why It Exists

1. **Reduce repeated codebase scanning** - Agents can read documented facts instead of searching
2. **Reduce token usage** - Structured context is more efficient than full code scans
3. **Prevent architectural mistakes** - Centralized decisions prevent conflicting changes
4. **Preserve project decisions** - Historical context is preserved
5. **Make every agent follow the same rules** - Governance is explicit, not implicit

## Project: KI Market Inventory

**Purpose**: A tracking, analysis, paper-trading, journaling, and read-only intelligence system for cryptocurrency trading.

**Key Features**:
- Opportunity Scanner - P2P price comparison
- Paper Trading - Simulate trades without risk
- Profit Analytics - Daily/weekly profit tracking
- KI Intelligence - AI chat for trading insights
- Risk Management - Capital flow and risk tracking
- Trade Journal - Document lessons learned

**Security Requirements**:
- Never execute real trades
- Never request withdrawal permissions
- Never request trading permissions
- Never release P2P assets

## Tool Independence

This system uses **only Markdown files**. No JSON, YAML, or proprietary formats. This ensures:

- Any text editor can read it
- No runtime dependencies
- No parsing complexity
- Maximum compatibility

## Markdown as Source of Truth

The Brain documentation is the **authoritative reference** for:

- Architecture decisions
- Workflows
- Registry entries
- Current state

However, **application code remains the final technical evidence**. When Brain states conflict with code, the code takes precedence unless explicitly documented otherwise.

## Authority Order

When conflicts arise, this hierarchy determines truth:

```
1. Explicit owner instruction
2. Security and legal constraints
3. Current verified application code
4. Accepted architecture decisions
5. Brain documentation
6. Agent assumptions
```

Lower sources cannot override higher ones without explicit verification.

## Agent Responsibility

Agents must:

1. Read the Brain before making changes
2. Update the Brain after verified changes
3. Never put secrets in Markdown files
4. Respect the no-delete rule
5. Follow the constitution

## No Secrets Policy

Never include in Brain documents:

- API keys
- Passwords
- Service role keys
- Database connection strings
- Tokens
- Any credential-like values

Store credentials only in:

- `.env` files (git-ignored)
- Deployment secrets
- CI/CD secret stores

## Getting Started

See `00-START-HERE.md` for the bootstrap sequence.