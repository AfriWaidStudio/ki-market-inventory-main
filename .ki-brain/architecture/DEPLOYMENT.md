# Deployment

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Overview

This document describes the deployment setup and process for KI Market Inventory.

## Current Environment

**Status**: Local development

### Local Setup

- Node.js
- npm
- Vite dev server
- Supabase CLI
- Prisma CLI

### Configuration

- `.env` file (git-ignored)
- Supabase project
- Local database

## Target Production Environment

**Status**: NOT DEPLOYED

### Suspected Platform

**Vercel** - Based on AGENTS.md common setups

### Deployment Types

1. **Frontend**: Static + serverless functions
2. **Backend**: Remix server-side functions
3. **Database**: Supabase PostgreSQL

## Build Process

### Commands

| Command | Purpose | Status |
| ------- | ------- | ------ |
| `npm run build` | Production build | VERIFIED |
| `npm run dev` | Development server | VERIFIED |
| `npm run typecheck` | TypeScript check | VERIFIED |
| `npm run lint` | Linting | UNKNOWN |
| `npx prisma migrate dev` | Database migration | PENDING |

### Build Output

- `build/` directory
- Server and client bundles
- Static assets

## Environment Variables

### Required

| Variable | Purpose | Location | Status |
| -------- | ------- | -------- | ------ |
| DATABASE_URL | Custom auth database | Server only | PENDING |
| SUPABASE_URL | Supabase connection | Server/Client | CONFIRMED |
| SUPABASE_ANON_KEY | Public key | Server/Client | CONFIRMED |
| SUPABASE_SERVICE_ROLE_KEY | Server key | Server only | CONFIRMED |
| OAUTH_CLIENT_ID | Google OAuth | Server only | SUSPECTED |
| OAUTH_CLIENT_SECRET | Google OAuth | Server only | SUSPECTED |

### Not in Browser

These must NEVER be exposed to the browser:
- DATABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- OAUTH_CLIENT_SECRET

## Database Deployment

### Supabase Database

**Status**: ACTIVE

**Deployment**: Via Supabase dashboard
**Migrations**: SQL files or Supabase migrations

### New Auth Database

**Status**: PENDING

**Requirements**:
- PostgreSQL instance
- DATABASE_URL configured
- Migrations applied

**Migration Steps**:
1. Create PostgreSQL database
2. Set DATABASE_URL environment variable
3. Run `npx prisma migrate dev --name init_custom_auth`
4. Verify migration success

## OAuth Configuration

### Google OAuth

**Status**: CONFIGURED (suspected)

**Required Settings**:
- OAuth client ID/secret in environment
- Redirect URL: `https://your-app.vercel.app/auth/callback`
- Google Cloud Console configuration

### Redirect URL

**Format**: `https://[your-domain]/auth/callback`

**Vercel**: `https://your-app.vercel.app/auth/callback`

## CI/CD

**Status**: UNKNOWN

### Suspected Platforms

- Vercel (primary)
- GitHub Actions
- Supabase

## Deployment Checklist

- [ ] Build passes
- [ ] Type-check passes
- [ ] Tests pass
- [ ] DATABASE_URL configured
- [ ] Migrations applied
- [ ] Environment variables set
- [ ] OAuth configured
- [ ] DNS configured
- [ ] SSL certificate
- [ ] Rate limiting configured

## Rollback Process

### Database

1. Backup before migration
2. Restore if needed
3. Revert code changes

### Application

1. Deploy previous version
2. Monitor
3. Verify

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository connected
- Environment variables configured in Vercel

### Steps

1. Connect repository to Vercel
2. Set environment variables
3. Configure build settings
4. Deploy

## Monitoring

### Required

- Error tracking
- Performance monitoring
- Database monitoring
- Exchange sync monitoring

### Suspected Tools

- Sentry (error tracking)
- Vercel Analytics (performance)
- Supabase monitoring (database)

## Last Verified

2026-07-11

## Evidence

- `package.json` - Build scripts
- `vite.config.ts` - Build configuration
- `.env` (if exists) - Environment
- AGENTS.md - Deployment hints
- maiplan.md - Requirements