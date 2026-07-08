function json(data, status = 200) {
  return Response.json(data, { status });
}

export function requireAdminToken(request, env) {
  const expected = String(env.ADMIN_TOKEN ?? '').trim();
  if (!expected) return { error: json({ error: 'ADMIN_TOKEN not configured' }, 500) };

  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return { error: json({ error: 'Missing Authorization: Bearer token' }, 401) };

  const received = match[1].trim();
  if (received !== expected) {
    const debug = {
      receivedLength: received.length,
      expectedLength: expected.length,
      receivedHadWhitespace: received !== match[1],
    };
    console.error('[auth] token mismatch', debug);
    return { error: json({ error: 'Invalid token', debug }, 403) };
  }

  return { ok: true };
}

export function adminTokenDebugInfo(request, env) {
  const token = String(env.ADMIN_TOKEN ?? '').trim();
  const hostname = new URL(request.url).hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  return {
    configured: !!token,
    length: token.length,
    hostname,
    value: isLocal ? token : undefined,
  };
}
