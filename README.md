# Auth Lab

A compact authentication reference project I built to practice the parts people usually skip when they say "add login": password hashing, session lifecycle, revocation, protected routes and role checks.

## Included

- `scrypt` password hashing with per-user salts
- timing-safe password comparison
- opaque random session tokens
- SHA-256 token storage instead of raw session tokens
- session expiry and revocation
- role-based access control
- small HTTP API using Node's native server
- tests for auth, sessions and RBAC

```bash
npm test
npm start
```

### API

`POST /register` · `POST /login` · `GET /me` · `POST /logout` · `GET /admin`

This is deliberately dependency-light so the authentication logic is visible instead of hidden behind a framework. The in-memory stores are for demonstration; a production version would move users/sessions to a database, add rate limiting, CSRF strategy where relevant, email verification and OAuth/OIDC.
