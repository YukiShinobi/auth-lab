<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=200&text=AUTH%20LAB&fontAlignY=38&desc=SESSIONS%20%E2%80%A2%20RBAC%20%E2%80%A2%20REVOCATION&descAlignY=58&color=0:050505,55:202020,100:5a1616&fontColor=f5f5f5&descColor=d4d4d4" width="100%" />

![Node](https://img.shields.io/badge/Node.js-20%2B-111111?style=for-the-badge&logo=nodedotjs)
![Security](https://img.shields.io/badge/focus-auth%20security-2b2b2b?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-node:test-7a1f1f?style=for-the-badge)

**Authentication stripped back far enough that the security logic stays visible.**

</div>

---

## Why I built it

Most demos stop at “login works.” I wanted to practice the parts that actually decide whether an auth system survives real use: password storage, session lifecycle, revocation, protected routes and role checks.

## Included

- `scrypt` password hashing with per-user salts
- timing-safe password comparison
- opaque random session tokens
- SHA-256 token storage instead of raw session tokens
- session expiry and revocation
- role-based access control
- small HTTP API using Node's native server
- tests around auth, sessions and RBAC

## Flow

```txt
credentials
   ↓
password verification
   ↓
opaque session token
   ↓
hashed server-side token
   ↓
protected route + role check
```

## Run

```bash
npm test
npm start
```

### API

`POST /register` · `POST /login` · `GET /me` · `POST /logout` · `GET /admin`

## Production boundary

The in-memory stores are deliberate for this reference build. A production version needs durable storage, rate limiting, email verification, OAuth/OIDC where needed, CSRF strategy for cookie sessions and proper audit logging.

---

<div align="center"><sub>YukiShinobi // authentication is a system, not a login form.</sub></div>
