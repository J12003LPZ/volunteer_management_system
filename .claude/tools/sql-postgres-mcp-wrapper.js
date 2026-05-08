// Launches the SQL MCP database server for Postgres using a single connection URL.
// Reads DATABASE_URL (preferred) or PG_URL/POSTGRES_URL, waits for TCP reachability,
// parses credentials, and spawns: npx -y @executeautomation/database-server --postgresql ...

const { spawn } = require('child_process');
const net = require('net');

function getUrlFromEnv() {
  const url = process.env.DATABASE_URL || process.env.PG_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.error('[sql-postgres-wrapper] Missing DATABASE_URL (or PG_URL/POSTGRES_URL).');
    process.exit(1);
  }
  return url;
}

function parsePgUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    if (!/^postgres(ql)?:$/.test(u.protocol)) {
      console.error(`[sql-postgres-wrapper] Unsupported protocol: ${u.protocol}. Use postgres:// or postgresql://`);
      process.exit(1);
    }
    const host = u.hostname;
    const port = u.port || '5432';
    const database = (u.pathname || '').replace(/^\//, '');
    const user = decodeURIComponent(u.username || '');
    const password = decodeURIComponent(u.password || '');

    const params = new URLSearchParams(u.search || '');
    // Simple SSL detection
    const sslParam = params.get('ssl') || params.get('sslmode');
    const ssl = sslParam && /^(true|require|required|verify-full|verify-ca)$/i.test(String(sslParam));

    return { host, port, database, user, password, ssl };
  } catch (e) {
    console.error('[sql-postgres-wrapper] Failed to parse connection URL:', e.message);
    process.exit(1);
  }
}

function waitForTcp({ host, port, attempts = 60, delayMs = 1000 }) {
  return new Promise((resolve) => {
    let tries = 0;
    const tryOnce = () => {
      tries += 1;
      const socket = net.createConnection({ host, port: Number(port) }, () => {
        socket.end();
        return resolve(true);
      });
      socket.on('error', () => {
        if (tries >= attempts) return resolve(false);
        setTimeout(tryOnce, delayMs);
      });
    };
    tryOnce();
  });
}

(async () => {
  const url = getUrlFromEnv();
  const cfg = parsePgUrl(url);
  const reachable = await waitForTcp({ host: cfg.host, port: cfg.port });
  if (!reachable) {
    console.warn(`[sql-postgres-wrapper] Host ${cfg.host}:${cfg.port} not reachable after waiting; continuing anyway.`);
  }

  const args = [
    '-y',
    '@executeautomation/database-server',
    '--postgresql',
    '--host', cfg.host,
    '--database', cfg.database,
    '--port', String(cfg.port),
  ];
  if (cfg.user) {
    args.push('--user', cfg.user);
  }
  if (cfg.password) {
    args.push('--password', cfg.password);
  }
  if (cfg.ssl) {
    args.push('--ssl', 'true');
  }

  const child = spawn('npx', args, { stdio: 'inherit', env: process.env });
  child.on('close', (code) => process.exit(code ?? 1));
  child.on('error', (err) => {
    console.error('[sql-postgres-wrapper] Failed to start SQL MCP:', err.message);
    process.exit(1);
  });
})();

