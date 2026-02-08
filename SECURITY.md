# Security Policy

## Reporting a Vulnerability

We take the security of NCCart seriously. If you have discovered a security vulnerability, please follow these steps:

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at: **security@nccart.com** (or create a private security advisory)

Include the following information:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Any potential mitigations you've identified

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Investigation**: We will investigate and validate the vulnerability
3. **Communication**: We will keep you informed about the progress
4. **Resolution**: We will work to fix the vulnerability as quickly as possible
5. **Credit**: We will credit you (if desired) in the security advisory

### Disclosure Policy

- We request that you give us reasonable time to fix the vulnerability before public disclosure
- We will coordinate with you on the disclosure timeline
- We will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

When using NCCart:

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random values for secrets
   - Rotate secrets regularly

2. **Database**
   - Use strong database passwords
   - Enable SSL/TLS for database connections
   - Keep PostgreSQL updated

3. **Authentication**
   - Use HTTPS in production
   - Implement rate limiting
   - Enable two-factor authentication (when available)

4. **Dependencies**
   - Keep dependencies updated
   - Regularly run `npm audit`
   - Review dependency changes

5. **Deployment**
   - Use environment-specific configurations
   - Enable security headers
   - Implement proper CORS policies
   - Use secure cookie settings

## Known Security Considerations

### Current Implementation

1. **Password Storage**: Uses bcrypt with configurable rounds (default: 10)
2. **JWT Tokens**: Default expiration of 7 days (configurable)
3. **Rate Limiting**: Implemented on authentication endpoints
4. **Input Validation**: Using express-validator
5. **SQL Injection**: Protected via Prisma ORM

### Future Security Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Account lockout after failed login attempts
- [ ] Session management and revocation
- [ ] Advanced audit logging
- [ ] Penetration testing
- [ ] Security headers enhancement
- [ ] Content Security Policy (CSP)
- [ ] CSRF token validation for state-changing operations

## Security Updates

We will announce security updates through:
- GitHub Security Advisories
- Release notes
- Email notifications (for critical vulnerabilities)

## Contact

For security-related questions or concerns:
- Email: security@nccart.com
- GitHub Security Advisories: https://github.com/abhijeetraiiit/nccart/security

## Hall of Fame

We appreciate security researchers who help keep NCCart secure:

<!-- Security researchers will be listed here -->

---

Thank you for helping keep NCCart and its users safe!
