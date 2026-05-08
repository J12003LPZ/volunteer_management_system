#!/usr/bin/env node
// Generate a concise tester checklist from a handoff capsule JSON.
// Usage:
//   node .claude/tools/test-checklist.js --from docs/handoffs/<packet>.json --out docs/checklists/<timestamp>_<slug>.md

const fs = require('fs');
const path = require('path');

function parseArgs(argv){
  const args = { _: [] };
  for (let i=2;i<argv.length;i++){
    const a = argv[i];
    if (a.startsWith('--')){ const k=a.slice(2); const v=(argv[i+1]&&!argv[i+1].startsWith('--'))?argv[++i]:true; args[k]=v; }
    else args._.push(a);
  }
  return args;
}

function slugify(s){
  return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60) || 'task';
}

function main(){
  const args = parseArgs(process.argv);
  const from = args.from;
  if (!from || !fs.existsSync(from)){
    console.error('Missing or invalid --from <handoff.json>');
    process.exit(1);
  }
  const out = args.out || path.join('docs','checklists', `${new Date().toISOString().replace(/[:]/g,'-').replace(/\..+$/,'')}_${slugify(path.basename(from).replace(/\.json$/i,''))}.md`);
  const cap = JSON.parse(fs.readFileSync(from,'utf8'));

  const env = cap.env || {};
  const url = env.APP_URL || 'http://localhost:3000';
  const route = env.ROUTE_UNDER_TEST || '';
  const target = route ? `${url}${route}` : url;
  const todo = cap.todo || 'Implement assigned task';
  const files = cap.files || [];
  const distilled = cap.artifacts && cap.artifacts.distilledContext ? cap.artifacts.distilledContext : 'docs/distilled_context.md';
  const acceptance = (cap.acceptance || '').trim();

  const lines = [];
  lines.push(`# Tester Checklist`);
  lines.push('');
  lines.push(`Task: ${todo}`);
  lines.push('');
  lines.push('Target');
  lines.push('');
  lines.push(`- URL: ${target}`);
  if (route) lines.push(`- Route: ${route}`);
  lines.push('');
  lines.push('Acceptance Criteria (Given/When/Then)');
  lines.push('');
  if (acceptance){ lines.push(acceptance); } else { lines.push('- Given [...]\n- When [...]\n- Then [...]'); }
  lines.push('');
  lines.push('Visual Steps');
  lines.push('');
  lines.push('- Navigate to the target URL');
  lines.push('- Capture initial screenshot (desktop 1280px)');
  lines.push('- Verify key elements per acceptance criteria');
  lines.push('- If interactions are defined, perform them and capture screenshots');
  lines.push('- Capture mobile (360px) and tablet (768px) screenshots if layout applies');
  lines.push('- Check console for errors');
  lines.push('');
  if (files.length){
    lines.push('Relevant Files (for reference only)');
    lines.push('');
    for (const f of files){ lines.push(`- ${f}`); }
    lines.push('');
  }
  lines.push('Artifacts');
  lines.push('');
  lines.push(`- Distilled context: \`${distilled}\``);
  lines.push('- Screenshots: save under `docs/artifacts/screenshots/`');
  lines.push('');
  const outDir = path.dirname(out);
  fs.mkdirSync(outDir,{recursive:true});
  const content = lines.join('\n');
  const limited = content.split(/\r?\n/).slice(0, 140).join('\n');
  fs.writeFileSync(out, limited, 'utf8');
  process.stdout.write(JSON.stringify({ ok: true, out }));
}

main();

