import crypto from 'node:crypto';

const users = new Map();
const sessions = new Map();

function scrypt(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createUser({ email, password, role = 'user' }) {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) throw new Error('Invalid email');
  if (password.length < 10) throw new Error('Password must be at least 10 characters');
  if (users.has(normalized)) throw new Error('Account already exists');
  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID(),
    email: normalized,
    role,
    salt,
    passwordHash: scrypt(password, salt),
    createdAt: new Date().toISOString()
  };
  users.set(normalized, user);
  return publicUser(user);
}

export function authenticate(email, password) {
  const user = users.get(email.trim().toLowerCase());
  if (!user) return null;
  const candidate = Buffer.from(scrypt(password, user.salt), 'hex');
  const expected = Buffer.from(user.passwordHash, 'hex');
  if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) return null;
  return publicUser(user);
}

export function createSession(userId, ttlMs = 1000 * 60 * 60 * 8) {
  const token = crypto.randomBytes(32).toString('base64url');
  const session = {
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    userId,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now()
  };
  sessions.set(session.tokenHash, session);
  return token;
}

export function resolveSession(token) {
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const session = sessions.get(tokenHash);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(tokenHash);
    return null;
  }
  const user = [...users.values()].find(item => item.id === session.userId);
  return user ? publicUser(user) : null;
}

export function revokeSession(token) {
  if (!token) return false;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return sessions.delete(tokenHash);
}

export function requireRole(user, ...roles) {
  return Boolean(user && roles.includes(user.role));
}

export function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
}

export function resetForTests() {
  users.clear();
  sessions.clear();
}
