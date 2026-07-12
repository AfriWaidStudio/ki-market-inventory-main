# Current Goals

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: None

## Immediate Goals

1. **Complete independent custom authentication database foundation**
   - Configure DATABASE_URL for PostgreSQL
   - Run `prisma validate` successfully
   - Run `prisma migrate dev --name init_custom_auth`
   - Test database connection

2. **Connect registration function to Prisma database**
   - Modify `src/lib/auth/functions.ts` register function
   - Hash passwords securely
   - Store in new `users` table
   - Create auth identities

3. **Connect login function to Prisma database**
   - Modify `src/lib/auth/functions.ts` login function
   - Verify password hash
   - Create sessions in `sessions` table
   - Return session token

4. **Test authentication flow**
   - User registration works
   - User login works
   - Session management works
   - OAuth flow works

5. **Enable email verification** (after step 4)
   - Configure SMTP in Supabase
   - Enable email confirmation

## Near-Term Goals

1. **Database Migration**
   - Generate Prisma migrations
   - Apply migrations to independent database
   - Verify schema matches requirements

2. **Session Management**
   - Create session table in Prisma
   - Implement session token generation
   - Implement session validation
   - Implement session invalidation

3. **User Data Migration**
   - Plan migration from Supabase to Prisma
   - Migrate existing users (optional)
   - Test data integrity

4. **Security Hardening**
   - Implement secure password hashing
   - Validate all inputs
   - Add rate limiting
   - Implement audit logging

## Long-Term Goals

1. **Complete Authentication Migration**
   - Remove Supabase auth dependency
   - Update all auth functions
   - Test all auth flows
   - Deploy to production

2. **Exchange Integration**
   - Binance read-only connection
   - Bybit read-only connection
   - Transaction import
   - Opportunity detection

3. **Trading Features**
   - Paper trading workflow
   - Manual trade tracking
   - Trade journal
   - Analytics

4. **KI Intelligence**
   - AI chat integration
   - Profit analysis
   - Trade recommendations
   - Performance insights

## Non-Goals

1. Do not execute real trades
2. Do not request withdrawal permissions
3. Do not request trading permissions
4. Do not release P2P assets
5. Do not delete existing Supabase auth code (comment out with standard format)
6. Do not change routes or APIs without testing
7. Do not deploy to production without owner approval
8. Do not migrate production data without backup

## Owner Priorities

Based on AGENTS.md and maiplan.md:

1. **Priority 1**: Independent PostgreSQL with Prisma foundation
2. **Priority 2**: Database connection and migration
3. **Priority 3**: Connect registration/login to new database
4. **Priority 4**: Test authentication flow
5. **Priority 5**: Exchange synchronization (Binance, Bybit)
6. **Priority 6**: Paper trading workflow
7. **Priority 7**: Analytics and reporting

## Success Criteria

The independent authentication foundation is complete when:

- [ ] DATABASE_URL is provided and valid
- [ ] `prisma validate` passes
- [ ] `npx prisma migrate dev --name init_custom_auth` succeeds
- [ ] Registration function works with Prisma database
- [ ] Login function works with Prisma database
- [ ] Session management works with Prisma database
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No data loss from existing system

## Current Blocker

**DATABASE_URL is not yet configured.**

This blocks:
- Database connection
- Migration
- Prisma validation
- Authentication migration