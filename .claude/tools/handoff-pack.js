#!/usr/bin/env node
// Generate a compact handoff packet for the next agent.
// Usage:
//   node .claude/tools/handoff-pack.js \
//     --todo "Implement X" \
//     --context docs/distilled_context.md \
//     [--acceptance docs/acceptance.md] \
//     [--files "src/a.ts,src/b.ts"] \
//     [--out docs/handoffs/2025-10-30T18-30-00_handoff_packet.md]

const fs = require('fs');
const path = require('path');

function parseArgs(argv){
  const args = { _: [] };
  for (let i=2;i<argv.length;i++){
    const a = argv[i];
    if (a.startsWith('--')){
      const k = a.slice(2);
      const v = (argv[i+1] && !argv[i+1].startsWith('--')) ? argv[++i] : true;
      args[k] = v;
    } else {
      args._.push(a);
    }
  }
  return args;
}

function readIfExists(p, maxLines=200){
  if (!p) return null;
  if (!fs.existsSync(p)) return null;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).slice(0, maxLines);
  return lines.join('\n');
}

function nowStamp(){
  return new Date().toISOString().replace(/[:]/g,'-').replace(/\..+$/,'');
}

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }

function main(){
  const args = parseArgs(process.argv);
  const todo = args.todo;
  const contextPath = args.context || 'docs/distilled_context.md';
  const acceptancePath = args.acceptance || null;
  const filesCsv = args.files || '';
  const out = args.out || path.join('docs','handoffs', `${nowStamp()}_handoff_packet.md`);
  const outJson = args.json || out.replace(/\.md$/i, '.json');

  if (!todo){
    console.error('Missing --todo');
    process.exit(1);
  }

  const envNotes = [];
  if (process.env.APP_URL) envNotes.push(`APP_URL: ${process.env.APP_URL}`);
  if (process.env.ROUTE_UNDER_TEST) envNotes.push(`ROUTE_UNDER_TEST: ${process.env.ROUTE_UNDER_TEST}`);

  const distilledExists = fs.existsSync(contextPath);
  const acceptance = readIfExists(acceptancePath, 120);

  const filesList = filesCsv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(f => `- ${f}`)
    .join('\n');

  const lines = [];
  lines.push('# Handoff Packet');
  lines.push('');
  lines.push('Task Summary');
  lines.push('');
  lines.push(`- ${todo}`);
  lines.push('');
  lines.push('Acceptance Criteria (Given/When/Then)');
  lines.push('');
  if (acceptance){
    lines.push(acceptance);
  } else {
    lines.push('- Given [...]\n- When [...]\n- Then [...]');
  }
  lines.push('');
  lines.push('Key Files / Paths');
  lines.push('');
  lines.push(filesList || '- [fill in during implementation]');
  lines.push('');
  lines.push('Artifacts');
  lines.push('');
  lines.push(distilledExists ? `- Distilled context: \
\`\`${contextPath}\`\`` : '- Distilled context: not found');
  lines.push('- Additional: [optional links]');
  lines.push('');
  if (envNotes.length){
    lines.push('Environment Notes');
    lines.push('');
    envNotes.forEach(note => lines.push(`- ${note}`));
    lines.push('');
  }
  lines.push('Constraints / Gotchas');
  lines.push('');
  lines.push('- Keep changes minimal and cohesive');
  lines.push('- Use ONLY this packet and distilled context as inputs');
  lines.push('');
  lines.push('Tools Used (fill by agent)');
  lines.push('');
  lines.push('- [e.g., Serena.findSymbols: 3, Read: 1]');
  lines.push('');

  const outDir = path.dirname(out);
  ensureDir(outDir);
  const content = lines.join('\n');

  // Hard cap ~120 lines to keep tiny handoff packets
  const limited = content.split(/\r?\n/).slice(0, 120).join('\n');

  fs.writeFileSync(out, limited, 'utf8');
  // Also emit a compact JSON capsule for programmatic use
  const capsule = {
    createdAt: new Date().toISOString(),
    todo,
    acceptance: acceptance || null,
    files: filesList ? filesList.split('\n').map(s => s.replace(/^\-\s+/, '').trim()).filter(Boolean) : [],
    artifacts: { distilledContext: distilledExists ? contextPath : null, additional: [] },
    env: { APP_URL: process.env.APP_URL || null, ROUTE_UNDER_TEST: process.env.ROUTE_UNDER_TEST || null },
    constraints: ['Keep changes minimal and cohesive','Use ONLY packet + distilled context as inputs']
  };
  try { fs.writeFileSync(outJson, JSON.stringify(capsule, null, 2), 'utf8'); } catch {}
  process.stdout.write(JSON.stringify({ ok: true, out, json: outJson }));
}

main();
