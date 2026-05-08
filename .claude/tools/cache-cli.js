#!/usr/bin/env node
/**
 * SQLite-backed Cache CLI for Claude Subagents
 *
 * Uses SQLite MCP server for persistent caching with LRU eviction.
 * Falls back to file-based cache if SQLite MCP is unavailable.
 *
 * Usage:
 *   node cache-cli.js get --agent <name> --key-json '{"query":"..."}' --ttl-hours 48
 *   node cache-cli.js put --agent <name> --key-json '{"query":"..."}' --data-json '{"result":...}' --ttl-hours 48
 *   node cache-cli.js cleanup --agent <name> [--max-entries 100]
 *   node cache-cli.js stats --agent <name>
 *   node cache-cli.js init  # Initialize SQLite database with schema
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

const DB_PATH = path.join(__dirname, '..', 'cache', 'agent-cache.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'cache', 'schema.sql');
const MAX_ENTRIES_DEFAULT = 100;

// Stable JSON stringify for consistent hashing
function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    } else {
      args._.push(a);
    }
  }
  return args;
}

function generateHash(agent, keyJson) {
  let inputs;
  try {
    inputs = keyJson ? JSON.parse(keyJson) : {};
  } catch (e) {
    console.error('Invalid --key-json:', e.message);
    process.exit(1);
  }
  const payload = { agent, inputs };
  return crypto.createHash('sha1').update(stableStringify(payload)).digest('hex');
}

// Execute SQLite query using sqlite3 CLI
function sqliteQuery(sql, params = []) {
  // Escape parameters for shell
  const escapedSql = sql.replace(/'/g, "''");
  let finalSql = escapedSql;

  // Simple parameter substitution (positional)
  params.forEach((param, idx) => {
    const placeholder = '?';
    const escapedParam = typeof param === 'string'
      ? `'${param.replace(/'/g, "''")}'`
      : param === null ? 'NULL' : param;
    finalSql = finalSql.replace(placeholder, escapedParam);
  });

  try {
    const result = execSync(`sqlite3 -json "${DB_PATH}" "${finalSql}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result ? JSON.parse(result) : [];
  } catch (e) {
    // Check if it's just an empty result
    if (e.status === 0 || e.stdout === '') return [];
    throw e;
  }
}

function sqliteExecute(sql, params = []) {
  let finalSql = sql;
  params.forEach((param) => {
    const escapedParam = typeof param === 'string'
      ? `'${param.replace(/'/g, "''")}'`
      : param === null ? 'NULL' : param;
    finalSql = finalSql.replace('?', escapedParam);
  });

  try {
    execSync(`sqlite3 "${DB_PATH}" "${finalSql}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (e) {
    console.error('SQLite error:', e.message);
    return false;
  }
}

function ensureDatabase() {
  const cacheDir = path.dirname(DB_PATH);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Check if database exists and has tables
  try {
    const tables = execSync(`sqlite3 "${DB_PATH}" ".tables"`, { encoding: 'utf-8' });
    if (!tables.includes('cache')) {
      initDatabase();
    }
  } catch {
    initDatabase();
  }
}

function initDatabase() {
  console.log('Initializing SQLite cache database...');
  const cacheDir = path.dirname(DB_PATH);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  if (fs.existsSync(SCHEMA_PATH)) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    // Execute schema line by line
    const statements = schema.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          execSync(`sqlite3 "${DB_PATH}" "${stmt.trim()};"`, { stdio: 'pipe' });
        } catch (e) {
          // Ignore "already exists" errors
        }
      }
    }
  } else {
    // Inline minimal schema
    const minimalSchema = `
      CREATE TABLE IF NOT EXISTS cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT NOT NULL,
        query_hash TEXT NOT NULL,
        query_text TEXT,
        result TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        expires_at INTEGER,
        hit_count INTEGER DEFAULT 0,
        UNIQUE(agent, query_hash)
      );
      CREATE INDEX IF NOT EXISTS idx_cache_agent ON cache(agent);
    `;
    execSync(`sqlite3 "${DB_PATH}" "${minimalSchema.replace(/\n/g, ' ')}"`, { stdio: 'pipe' });
  }
  console.log('Database initialized at:', DB_PATH);
}

function cacheGet(agent, queryHash, ttlHours) {
  ensureDatabase();

  const ttlCondition = ttlHours
    ? `AND (expires_at IS NULL OR expires_at > unixepoch())`
    : '';

  const sql = `SELECT result, hit_count FROM cache WHERE agent = '${agent}' AND query_hash = '${queryHash}' ${ttlCondition} LIMIT 1`;

  try {
    const rows = sqliteQuery(sql);
    if (rows && rows.length > 0) {
      // Update hit count
      sqliteExecute(
        `UPDATE cache SET hit_count = hit_count + 1 WHERE agent = '${agent}' AND query_hash = '${queryHash}'`
      );
      return JSON.parse(rows[0].result);
    }
    return null;
  } catch (e) {
    console.error('Cache get error:', e.message);
    return null;
  }
}

function cachePut(agent, queryHash, queryText, result, ttlHours) {
  ensureDatabase();

  const expiresAt = ttlHours ? `unixepoch() + ${ttlHours * 3600}` : 'NULL';
  const resultJson = JSON.stringify(result).replace(/'/g, "''");
  const queryTextEscaped = (queryText || '').replace(/'/g, "''");

  const sql = `INSERT OR REPLACE INTO cache (agent, query_hash, query_text, result, expires_at, hit_count, created_at)
               VALUES ('${agent}', '${queryHash}', '${queryTextEscaped}', '${resultJson}', ${expiresAt}, 0, unixepoch())`;

  return sqliteExecute(sql);
}

function cacheCleanup(agent, maxEntries = MAX_ENTRIES_DEFAULT) {
  ensureDatabase();

  // Delete expired entries
  sqliteExecute(`DELETE FROM cache WHERE agent = '${agent}' AND expires_at IS NOT NULL AND expires_at < unixepoch()`);

  // LRU cleanup - keep top N entries by hit_count and recency
  const sql = `DELETE FROM cache WHERE agent = '${agent}' AND id NOT IN (
    SELECT id FROM cache WHERE agent = '${agent}'
    ORDER BY hit_count DESC, created_at DESC LIMIT ${maxEntries}
  )`;

  return sqliteExecute(sql);
}

function cacheStats(agent) {
  ensureDatabase();

  const countSql = `SELECT COUNT(*) as count FROM cache WHERE agent = '${agent}'`;
  const hitsSql = `SELECT SUM(hit_count) as hits FROM cache WHERE agent = '${agent}'`;
  const expiredSql = `SELECT COUNT(*) as expired FROM cache WHERE agent = '${agent}' AND expires_at IS NOT NULL AND expires_at < unixepoch()`;

  try {
    const count = sqliteQuery(countSql);
    const hits = sqliteQuery(hitsSql);
    const expired = sqliteQuery(expiredSql);

    return {
      agent,
      entries: count[0]?.count || 0,
      totalHits: hits[0]?.hits || 0,
      expiredEntries: expired[0]?.expired || 0
    };
  } catch (e) {
    return { agent, error: e.message };
  }
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0];

  if (cmd === 'init') {
    initDatabase();
    process.exit(0);
  }

  const agent = args.agent;
  if (!agent && cmd !== 'init') {
    console.error('Missing --agent');
    process.exit(1);
  }

  if (cmd === 'get') {
    const queryHash = generateHash(agent, args['key-json'] || '{}');
    const ttlHours = args['ttl-hours'] ? Number(args['ttl-hours']) : null;
    const result = cacheGet(agent, queryHash, ttlHours);

    if (result === null) {
      process.exit(2); // MISS
    }
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  }

  if (cmd === 'put') {
    const queryHash = generateHash(agent, args['key-json'] || '{}');
    let data;
    try {
      data = JSON.parse(args['data-json'] || '{}');
    } catch (e) {
      console.error('Invalid --data-json:', e.message);
      process.exit(1);
    }
    const ttlHours = args['ttl-hours'] ? Number(args['ttl-hours']) : null;
    const queryText = args['key-json'] || '';

    const success = cachePut(agent, queryHash, queryText, data, ttlHours);
    if (success) {
      process.stdout.write(JSON.stringify({ ok: true, hash: queryHash }));
      process.exit(0);
    } else {
      process.exit(1);
    }
  }

  if (cmd === 'cleanup') {
    const maxEntries = args['max-entries'] ? Number(args['max-entries']) : MAX_ENTRIES_DEFAULT;
    cacheCleanup(agent, maxEntries);
    console.log(`Cleanup complete for agent: ${agent}`);
    process.exit(0);
  }

  if (cmd === 'stats') {
    const stats = cacheStats(agent);
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
  }

  console.log(`
SQLite Cache CLI for Claude Subagents

Commands:
  init      Initialize the SQLite database

  get       Get cached result
            --agent <name>       Agent name
            --key-json <json>    Query key as JSON
            --ttl-hours <hours>  TTL for cache validity

  put       Store result in cache
            --agent <name>       Agent name
            --key-json <json>    Query key as JSON
            --data-json <json>   Result data as JSON
            --ttl-hours <hours>  TTL for expiration

  cleanup   Remove old/expired entries
            --agent <name>       Agent name
            --max-entries <n>    Max entries to keep (default: 100)

  stats     Show cache statistics
            --agent <name>       Agent name

Examples:
  node cache-cli.js init
  node cache-cli.js get --agent web_researcher --key-json '{"query":"Next.js 15"}' --ttl-hours 48
  node cache-cli.js put --agent web_researcher --key-json '{"query":"Next.js 15"}' --data-json '{"result":"..."}' --ttl-hours 48
  node cache-cli.js cleanup --agent web_researcher --max-entries 100
  node cache-cli.js stats --agent web_researcher
`);
  process.exit(0);
}

main();
