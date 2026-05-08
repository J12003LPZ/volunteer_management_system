#!/usr/bin/env node
// Simple file-based cache helper for agents.
// Usage:
//  node .claude/tools/cache-cli.js get --agent web_researcher --key-json '{"query":"Next.js 15"}' --ttl-hours 48 [--commit auto|<sha>] [--version v1] [--full]
//  node .claude/tools/cache-cli.js put --agent web_researcher --key-json '{"query":"Next.js 15"}' --ttl-hours 48 --data-json '{"result":...}' [--commit auto|<sha>] [--version v1]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

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

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function nowIso() { return new Date().toISOString(); }

function getCommitSha(opt) {
  if (!opt || opt === 'none') return null;
  if (opt === 'auto') {
    try { return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
    catch { return null; }
  }
  return opt;
}

function buildKey({ agent, keyJson, commit, version, includeEnv = true }) {
  let inputs;
  try { inputs = keyJson ? JSON.parse(keyJson) : {}; } catch (e) { console.error('Invalid --key-json:', e.message); process.exit(1); }
  const env = includeEnv ? {
    APP_URL: process.env.APP_URL || null,
    ROUTE_UNDER_TEST: process.env.ROUTE_UNDER_TEST || null,
  } : undefined;
  const payload = { agent, inputs, env, commit: commit || null, version: version || null };
  const hash = crypto.createHash('sha1').update(stableStringify(payload)).digest('hex');
  return { hash, payload };
}

function readEntry(file) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function isFresh(entry, ttlHours, commit) {
  if (!entry) return false;
  if (commit && entry.commit && entry.commit !== commit) return false;
  const ttl = Number.isFinite(Number(ttlHours)) ? Number(ttlHours) : Number(entry.ttlHours) || 0;
  if (ttl <= 0) return true; // treat 0/negative as non-expiring
  const created = new Date(entry.createdAt).getTime();
  const ageMs = Date.now() - created;
  return ageMs <= ttl * 3600 * 1000;
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0];
  const agent = args.agent;
  const cacheDir = args['cache-dir'] || path.join('docs', '.cache');
  if (!agent) { console.error('Missing --agent'); process.exit(1); }

  const commit = getCommitSha(args.commit);
  const { hash, payload } = buildKey({ agent, keyJson: args['key-json'] || '{}', commit, version: args.version, includeEnv: args['no-env'] ? false : true });
  const agentDir = path.join(cacheDir, agent);
  const file = path.join(agentDir, `${hash}.json`);

  if (cmd === 'get') {
    const entry = readEntry(file);
    if (!entry || !isFresh(entry, args['ttl-hours'], commit)) {
      process.exit(2); // MISS
    }
    // Print either full entry or just the result
    const out = args.full ? entry : (entry.result !== undefined ? entry.result : entry);
    process.stdout.write(JSON.stringify(out));
    process.exit(0);
  }

  if (cmd === 'put') {
    let data;
    try { data = JSON.parse(args['data-json'] || '{}'); } catch (e) { console.error('Invalid --data-json:', e.message); process.exit(1); }
    const ttl = Number(args['ttl-hours'] || 0);
    const entry = {
      createdAt: nowIso(),
      ttlHours: Number.isFinite(ttl) ? ttl : 0,
      agent,
      inputs: payload.inputs,
      env: payload.env,
      commit,
      version: payload.version,
      result: data,
      evidencePaths: [],
      toolVersions: {},
      stale: false,
    };
    ensureDir(agentDir);
    fs.writeFileSync(file, JSON.stringify(entry, null, 2), 'utf8');
    process.stdout.write(JSON.stringify({ ok: true, file, hash }));
    process.exit(0);
  }

  console.error('Unknown command. Use get|put');
  process.exit(1);
}

main();

