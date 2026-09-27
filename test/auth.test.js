import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticate, createSession, createUser, requireRole, resolveSession, revokeSession, resetForTests } from '../src/auth.js';

test.beforeEach(resetForTests);

test('creates and authenticates a user without exposing password data', () => {
  const user = createUser({ email: 'yuki@example.com', password: 'strong-pass-123' });
  assert.equal(user.email, 'yuki@example.com');
  assert.equal('passwordHash' in user, false);
  assert.equal(authenticate('yuki@example.com', 'strong-pass-123').id, user.id);
  assert.equal(authenticate('yuki@example.com', 'wrong-password'), null);
});

test('sessions resolve and revoke', () => {
  const user = createUser({ email: 'a@b.com', password: 'abcdefghijk' });
  const token = createSession(user.id);
  assert.equal(resolveSession(token).id, user.id);
  assert.equal(revokeSession(token), true);
  assert.equal(resolveSession(token), null);
});

test('rbac checks allowed roles', () => {
  assert.equal(requireRole({ role: 'admin' }, 'admin'), true);
  assert.equal(requireRole({ role: 'user' }, 'admin'), false);
});
