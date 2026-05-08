#!/usr/bin/env node
// Build/update docs/handoffs/HISTORY.md with recent handoff packets.

const fs = require('fs');
const path = require('path');

function listPackets(dir){
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('_handoff_packet.md'));
  return files.map(f => {
    const md = path.join(dir, f);
    const json = md.replace(/\.md$/i, '.json');
    const stat = fs.statSync(md);
    let createdAt = stat.mtime.toISOString();
    let todo = null;
    if (fs.existsSync(json)){
      try { const cap = JSON.parse(fs.readFileSync(json, 'utf8')); createdAt = cap.createdAt || createdAt; todo = cap.todo || null; } catch {}
    }
    return { md, json: fs.existsSync(json) ? json : null, createdAt, todo };
  }).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function main(){
  const dir = path.join('docs','handoffs');
  const items = listPackets(dir).slice(0, 50);
  const lines = [];
  lines.push('# Handoff History');
  lines.push('');
  if (!items.length){
    lines.push('No handoff packets found.');
  } else {
    for (const it of items){
      const name = path.basename(it.md);
      const todo = it.todo ? ` - ${it.todo}` : '';
      lines.push(`- ${it.createdAt} | ${name}${todo}`);
    }
  }
  const out = path.join(dir, 'HISTORY.md');
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
  process.stdout.write(JSON.stringify({ ok: true, out, count: items.length }));
}

main();

