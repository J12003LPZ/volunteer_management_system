#!/usr/bin/env node
// Preflight context/performance checks to keep agent windows clean and fast.
// - Ensures Serena MCP URL is configured and reachable (optional soft check)
// - Validates distilled_context.md ≤ 250 lines
// - Validates latest handoff packet ≤ 120 lines
// - Validates docs/.memory entries ≤ 4KB
// Exits 0 on pass, non-zero on failure.

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function readJson(p){ try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function linesCount(p){ if (!fs.existsSync(p)) return 0; return fs.readFileSync(p, 'utf8').split(/\r?\n/).length; }
function latestFile(dir){
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.md')).map(f => ({ f, t: fs.statSync(path.join(dir,f)).mtimeMs }));
  if (!files.length) return null;
  files.sort((a,b) => b.t - a.t);
  return path.join(dir, files[0].f);
}

function checkSerenaUrlFromMcp(){
  const mcpPath = path.join('.mcp.json');
  const cfg = readJson(mcpPath);
  const envUrl = process.env.SERENA_MCP_URL;
  let url = envUrl || (cfg && cfg.mcpServers && cfg.mcpServers.Serena && cfg.mcpServers.Serena.transport && cfg.mcpServers.Serena.transport.url);
  return url || null;
}

function ping(url){
  return new Promise((resolve) => {
    try{
      const u = new URL(url);
      const mod = u.protocol === 'https:' ? https : http;
      const opts = { method: 'HEAD', hostname: u.hostname, port: u.port, path: '/', timeout: 1500 };
      const req = mod.request(opts, (res) => { resolve({ ok: true, status: res.statusCode }); });
      req.on('error', () => resolve({ ok: false }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
      req.end();
    } catch {
      resolve({ ok: false });
    }
  });
}

function parseArgs(argv){
  const args = { _: [] };
  for (let i=2;i<argv.length;i++){
    const a = argv[i];
    if (a.startsWith('--')){
      const k = a.slice(2);
      const v = (argv[i+1] && !argv[i+1].startsWith('--')) ? argv[++i] : true;
      args[k] = v;
    } else { args._.push(a); }
  }
  return args;
}

async function main(){
  const args = parseArgs(process.argv);
  const strictSerena = !!args['strict-serena'];
  const strictPrompts = !!args['strict-prompts'];
  const errors = [];
  const warnings = [];

  // Distilled context lines
  const ctxPath = path.join('docs','distilled_context.md');
  const ctxLines = linesCount(ctxPath);
  if (ctxLines === 0) warnings.push(`Missing distilled_context.md at ${ctxPath}`);
  if (ctxLines > 0 && ctxLines > 250) errors.push(`distilled_context.md too long: ${ctxLines} lines (max 250)`);

  // Handoff packet lines
  const hoDir = path.join('docs','handoffs');
  const ho = latestFile(hoDir);
  if (!ho) warnings.push(`No handoff packet found in ${hoDir}`);
  if (ho){
    const hoLines = linesCount(ho);
    if (hoLines > 120) errors.push(`handoff packet too long: ${ho} has ${hoLines} lines (max 120)`);
  }

  // Memory entries size
  const memDir = path.join('docs','.memory');
  if (fs.existsSync(memDir)){
    const channels = fs.readdirSync(memDir);
    for (const ch of channels){
      const chDir = path.join(memDir, ch);
      if (!fs.statSync(chDir).isDirectory()) continue;
      const files = fs.readdirSync(chDir).filter(f => f.endsWith('.json'));
      for (const f of files){
        const p = path.join(chDir, f);
        const size = fs.statSync(p).size;
        if (size > 4096) errors.push(`memory entry too large: ${p} = ${size} bytes (>4096)`);
      }
    }
  }

  // Serena reachability (soft)
  const sUrl = checkSerenaUrlFromMcp();
  if (!sUrl){
    const msg = 'Serena MCP URL not configured; set SERENA_MCP_URL or .mcp.json.mcpServers.Serena.transport.url';
    if (strictSerena) errors.push(msg); else warnings.push(msg);
  } else {
    const pong = await ping(sUrl);
    if (!pong.ok){
      const msg = `Serena not reachable at ${sUrl}; coding agents must invoke 'stuck' to start it.`;
      if (strictSerena) errors.push(msg); else warnings.push(msg);
    }
  }

  // Agent prompt budgets (non-blank lines ≤ 400 by default)
  const agentDir = path.join('.claude','agents');
  if (fs.existsSync(agentDir)){
    const files = [];
    (function walk(p){
      for (const f of fs.readdirSync(p)){
        const fp = path.join(p,f);
        const st = fs.statSync(fp);
        if (st.isDirectory()) walk(fp); else if (f.endsWith('.md')) files.push(fp);
      }
    })(agentDir);
    for (const f of files){
      const content = fs.readFileSync(f,'utf8');
      const nb = content.split(/\r?\n/).filter(l => l.trim().length > 0).length;
      if (nb > 400){
        const msg = `Agent prompt too long (${nb} non-blank lines): ${f} (>400)`;
        if (strictPrompts) errors.push(msg); else warnings.push(msg);
      }
    }
  }

  const report = { ok: errors.length === 0, errors, warnings, ctxLines, handoff: ho || null };
  const code = report.ok ? 0 : 1;
  process.stdout.write(JSON.stringify(report, null, 2));
  process.exit(code);
}

main();
