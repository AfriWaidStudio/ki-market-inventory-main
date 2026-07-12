# Security First

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Security takes precedence over convenience.**

## Secrets Policy

Never include in Brain documents or logs:

- API keys
- Passwords
- Service role keys
- Database connection strings
- Tokens
- Any credential-like values

## Logging Policy

Never log:

- Passwords
- Tokens
- Session IDs
- API keys
- User credentials
- Private keys
- Database URLs

Safe logging:

- Log events, not data
- Mask sensitive values
- Use structured logging
- Sanitize error messages

## Service Keys

Service keys must:

- Never be in browser code
- Never be committed to git
- Never be in documentation
- Only be in server-side environment
- Be rotated regularly

## Frontend Security

Browser code must not contain:

- Secret keys
- Database credentials
- Admin tokens
- Service account keys

## Input Validation

All inputs must be:

- Validated server-side
- Sanitized before use
- Checked for type
- Checked for length
- Checked for format

## Password Security

Passwords must:

- Be hashed with bcrypt/scrypt/argon2
- Never be stored in plain text
- Never be logged
- Never be returned in responses
- Have minimum length requirements

## Session Tokens

Session tokens must:

- Be cryptographically random
- Be hashed before storage
- Have expiration
- Be invalidated on logout
- Be single-use where appropriate

## Access Control

Implement:

- Least privilege
- Role-based access
- Permission checks
- Audit logging
- Admin verification

## Dependency Security

Report:

- Known vulnerabilities
- Outdated packages
- Security advisories
- Risk levels

Update:

- Dependencies regularly
- Only after testing

## Error Messages

Errors must:

- Not reveal sensitive data
- Not expose stack traces to users
- Be logged server-side
- Return generic messages to clients

## Security Review

Before any change affecting:

- Authentication
- Authorization
- Data access
- External services
- Secrets

Perform:

- Threat modeling
- Access review
- Input validation check
- Output sanitization check

## Security Testing

Security features must be:

- Tested
- Verified
- Reviewed
- Documented