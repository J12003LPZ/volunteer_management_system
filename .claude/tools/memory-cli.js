#!/usr/bin/env node
// DEPRECATED: This tool is being replaced by the native Memory MCP server.
// Please migrate to using the 'memory' tool in the MCP environment.
// See docs/memory/TAXONOMY.md for usage conventions.
//
// Minimal, explicit memory store for cross-agent handoffs.
// Keeps tiny JSON blobs under docs/.memory/<channel>/<key>.json
// Usage:
//  node .claude/tools/memory-cli.js put --channel handoff --key todo-123 --data-json '{"status":"done"}' [--ttl-hours 168]
//  node .claude/tools/memory-cli.js get --channel handoff --key todo-123 [--ttl-hours 168]
//  node .claude/tools/memory-cli.js del --channel handoff --key todo-123
//  node .claude/tools/memory-cli.js gc --channel handoff

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[k] = v;
    } else {
      args._.push(a);
    }
  }
  return args;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function nowIso() {
  return new Date().toISOString();
}

function channelDir(root, channel) {
  return path.join(root, ".memory", channel);
}

function keyToFile(dir, key) {
  // sanitize key for filename
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(dir, `${safe}.json`);
}

function isFresh(entry, ttlHours) {
  const ttl = Number.isFinite(Number(ttlHours))
    ? Number(ttlHours)
    : Number(entry.ttlHours) || 0;
  if (ttl <= 0) return true;
  const created = new Date(entry.createdAt).getTime();
  return Date.now() - created <= ttl * 3600 * 1000;
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0];
  const channel = args.channel;
  const key = args.key;
  const root = args["root"] || path.join("docs");
  const dir = channelDir(root, channel || "default");

  if (!cmd) {
    console.error("Missing command");
    process.exit(1);
  }

  if (cmd === "gc") {
    if (!fs.existsSync(dir)) process.exit(0);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    let removed = 0;
    for (const f of files) {
      try {
        const p = path.join(dir, f);
        const entry = JSON.parse(fs.readFileSync(p, "utf8"));
        if (!isFresh(entry, entry.ttlHours)) {
          fs.unlinkSync(p);
          removed++;
        }
      } catch {}
    }
    process.stdout.write(JSON.stringify({ ok: true, removed }));
    process.exit(0);
  }

  if (!channel) {
    console.error("Missing --channel");
    process.exit(1);
  }
  if (!key) {
    console.error("Missing --key");
    process.exit(1);
  }
  ensureDir(dir);
  const file = keyToFile(dir, key);

  if (cmd === "get") {
    if (!fs.existsSync(file)) process.exit(2);
    try {
      const entry = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!isFresh(entry, args["ttl-hours"])) process.exit(2);
      process.stdout.write(JSON.stringify(entry.data));
      process.exit(0);
    } catch (e) {
      console.error("Corrupt entry:", e.message);
      process.exit(3);
    }
  }

  if (cmd === "put") {
    let data;
    try {
      data = JSON.parse(args["data-json"] || "{}");
    } catch (e) {
      console.error("Invalid --data-json:", e.message);
      process.exit(1);
    }
    const payload = {
      createdAt: nowIso(),
      ttlHours: Number(args["ttl-hours"] || 0),
      channel,
      key,
      data,
    };
    const serialized = JSON.stringify(payload, null, 2);
    // Enforce small size (≤4KB) to keep memory tiny
    if (Buffer.byteLength(serialized, "utf8") > 4096) {
      console.error(
        "Memory entry too large (>4KB). Store references not blobs."
      );
      process.exit(4);
    }
    fs.writeFileSync(file, serialized, "utf8");
    process.stdout.write(JSON.stringify({ ok: true, file }));
    process.exit(0);
  }

  if (cmd === "del") {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    process.stdout.write(JSON.stringify({ ok: true }));
    process.exit(0);
  }

  console.error("Unknown command. Use put|get|del|gc");
  process.exit(1);
}

main();
