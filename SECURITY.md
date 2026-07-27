# Security Policy — CoreFiles

**Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.**
**Developer: amdsaib96**

## Reporting a Vulnerability

Security vulnerabilities are taken seriously. If you discover a security
issue in CoreFiles, please report it responsibly:

1. **Do NOT open a public GitHub issue.**
2. Email: `security@hasanurjaya.com`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Affected versions
   - Potential impact
   - Suggested fix (if any)

You will receive a response within 48 hours. Reports are confidential
until a fix is released.

## Scope

The following are considered in-scope for security review:
- CoreFiles application code in this repository
- Authentication & authorization flows (JWT, RBAC, 2FA)
- File upload pipeline (validation, virus scan, storage)
- API route handlers under `/api/v1/*`
- Session management
- Audit log integrity

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✓         |
| < 1.0   | ✗         |

## Security Best Practices (Deployment)

When deploying CoreFiles:
1. **Never commit secrets** to the repository — use environment variables.
2. **Enable HTTPS** via Let's Encrypt + Nginx reverse proxy.
3. **Restrict MinIO access** to internal network only.
4. **Run ClamAV** daemon for virus scanning on every upload.
5. **Enforce 2FA** for all admin accounts.
6. **Rotate JWT secrets** quarterly.
7. **Back up PostgreSQL** daily with verified restores.
8. **Monitor audit logs** for unauthorized access attempts.

## Security Features

CoreFiles implements:
- AES-256 encryption at rest (MinIO SSE)
- JWT + refresh token authentication
- Role-based access control (RBAC) with 7 roles
- Optional two-factor authentication (TOTP)
- ClamAV virus scanning on every upload
- Signed download URLs with expiry
- Rate limiting (100 req/min default)
- CSRF + XSS + SQL injection protection
- Helmet security headers
- Content Security Policy (CSP)
- Immutable audit logs (WORM storage)
- Session invalidation on password change

## Contact

- Security: security@hasanurjaya.com
- General: hasan@hasanurjaya.com
- Developer: amdsaib96

© 2026 Hasanur Jaya Sdn. Bhd. All rights reserved.
