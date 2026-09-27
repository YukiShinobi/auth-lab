import http from 'node:http';
import { authenticate, createSession, createUser, requireRole, resolveSession, revokeSession } from './auth.js';

const PORT = Number(process.env.PORT ?? 8080);

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function bearer(req) {
  const value = req.headers.authorization ?? '';
  return value.startsWith('Bearer ') ? value.slice(7) : null;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') return json(res, 200, { ok: true });

    if (req.method === 'POST' && req.url === '/register') {
      const input = await body(req);
      const user = createUser({ email: input.email ?? '', password: input.password ?? '' });
      return json(res, 201, { user });
    }

    if (req.method === 'POST' && req.url === '/login') {
      const input = await body(req);
      const user = authenticate(input.email ?? '', input.password ?? '');
      if (!user) return json(res, 401, { error: 'Invalid credentials' });
      const token = createSession(user.id);
      return json(res, 200, { user, token });
    }

    const token = bearer(req);
    const user = resolveSession(token);

    if (req.method === 'GET' && req.url === '/me') {
      if (!user) return json(res, 401, { error: 'Authentication required' });
      return json(res, 200, { user });
    }

    if (req.method === 'POST' && req.url === '/logout') {
      if (!token) return json(res, 400, { error: 'No session supplied' });
      revokeSession(token);
      return json(res, 200, { ok: true });
    }

    if (req.method === 'GET' && req.url === '/admin') {
      if (!user) return json(res, 401, { error: 'Authentication required' });
      if (!requireRole(user, 'admin')) return json(res, 403, { error: 'Admin role required' });
      return json(res, 200, { message: 'Restricted admin surface', user });
    }

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    return json(res, 400, { error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => console.log(`Auth Lab listening on http://localhost:${PORT}`));
}

export { server };
