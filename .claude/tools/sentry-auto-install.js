#!/usr/bin/env node
// Auto-install Sentry in a target project using sentry-cli and SDKs.
// Usage: node .claude/tools/sentry-auto-install.js --project <path>
// Requires: sentry-cli in PATH, env: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_DSN, ENVIRONMENT, RELEASE

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

function log(...a){ console.log('[sentry-auto-install]', ...a); }
function err(...a){ console.error('[sentry-auto-install]', ...a); }
function run(cmd, opts={}){
  log('run:', cmd);
  try { return execSync(cmd, { stdio: 'inherit', ...opts }); } catch(e){ throw e; }
}
function tryRun(cmd, opts={}){
  log('try:', cmd);
  try { return execSync(cmd, { stdio: 'inherit', ...opts }); } catch(e){ return null; }
}

function pkgManager(cwd){
  if (fs.existsSync(path.join(cwd,'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd,'yarn.lock'))) return 'yarn';
  return 'npm';
}

function addDeps(cwd, deps){
  const pm = pkgManager(cwd);
  const installCmd = pm === 'yarn' ? `yarn add ${deps.join(' ')}` : pm === 'pnpm' ? `pnpm add ${deps.join(' ')}` : `npm install ${deps.join(' ')}`;
  run(installCmd, { cwd });
}

function hasDep(pkgJson, name){
  return Boolean((pkgJson.dependencies && pkgJson.dependencies[name]) || (pkgJson.devDependencies && pkgJson.devDependencies[name]));
}

function loadPkgJson(cwd){
  const file = path.join(cwd, 'package.json');
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return null; }
}

function detectNodeStack(cwd){
  const pkg = loadPkgJson(cwd);
  if (!pkg) return null;
  const next = hasDep(pkg,'next');
  const express = hasDep(pkg,'express');
  const react = hasDep(pkg,'react');
  return { pkg, next, express, react };
}

function ensureEnv(names){
  const missing = names.filter(n => !process.env[n]);
  if (missing.length){
    err('Missing env:', missing.join(', '));
    process.exit(1);
  }
}

function checkSentryCli(){
  const res = spawnSync('sentry-cli', ['--version'], { stdio: 'inherit' });
  if (res.status !== 0){
    err('sentry-cli not found. Install it and ensure it has auth context.');
    process.exit(1);
  }
}

function runWizardNext(cwd){
  // Best-effort: Sentry wizard for Next.js (may prompt). We'll try non-interactive first; fallback to interactive.
  const cmd = 'npx -y @sentry/wizard@latest -i nextjs';
  tryRun(cmd, { cwd });
}

function injectExpress(cwd){
  addDeps(cwd, ['@sentry/node', '@sentry/profiling-node']);
  const candidates = ['src/index.js','src/server.js','index.js','server.js','app.js','src/app.js'];
  const target = candidates.map(p => path.join(cwd,p)).find(f => fs.existsSync(f));
  if (!target){ err('Could not find Express entry to patch. Please wire Sentry manually.'); return; }
  let src = fs.readFileSync(target,'utf8');
  if (!src.includes("@sentry/node")){
    src = `const Sentry = require('@sentry/node');\nconst { nodeProfilingIntegration } = require('@sentry/profiling-node');\n` + src;
  }
  if (!src.includes('Sentry.init(')){
    src = src.replace(/^(.*require\(['\"]express['\"]\).*$)/m, `$1\nSentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.ENVIRONMENT, release: process.env.RELEASE, tracesSampleRate: 1.0, profilesSampleRate: 1.0, integrations: [nodeProfilingIntegration()] });`);
  }
  if (src.includes('const app =') && !src.includes('Sentry.Handlers.requestHandler()')){
    src = src.replace(/(const\s+app\s*=\s*[^;]+;?)/, `$1\napp.use(Sentry.Handlers.requestHandler());\napp.use(Sentry.Handlers.tracingHandler());`);
  }
  if (!src.includes('Sentry.Handlers.errorHandler()')){
    // Append error handler near the end
    src += `\n// Sentry error handler must be last\napp.use(Sentry.Handlers.errorHandler());\n`;
  }
  fs.writeFileSync(target, src, 'utf8');
  log('Patched Express entry:', path.relative(cwd,target));
}

function main(){
  const idx = process.argv.indexOf('--project');
  if (idx === -1){ err('Usage: node .claude/tools/sentry-auto-install.js --project <path>'); process.exit(1); }
  const project = path.resolve(process.argv[idx+1]);
  if (!fs.existsSync(project)){ err('Project path not found:', project); process.exit(1); }

  checkSentryCli();
  // We will set up env files; do not require values at this moment to avoid blocking

  const nodeStack = detectNodeStack(project);
  if (nodeStack){
    log('Detected Node project');
    if (nodeStack.next){
      log('Next.js detected. Running Sentry wizard...');
      runWizardNext(project);
      tryRun(`${pkgManager(project)} add @sentry/nextjs`, { cwd: project });
    } else if (nodeStack.express){
      log('Express detected. Installing @sentry/node and injecting middleware...');
      injectExpress(project);
    } else if (nodeStack.react){
      log('React detected. Installing @sentry/react');
      addDeps(project, ['@sentry/react']);
      // Create a basic client config
      const cfg = `// Auto-generated Sentry init\nimport * as Sentry from '@sentry/react';\nSentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.ENVIRONMENT, release: process.env.RELEASE, tracesSampleRate: 1.0 });\n`;
      const srcDir = path.join(project,'src');
      if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir,'sentry.client.config.js'), cfg, 'utf8');
      log('Wrote src/sentry.client.config.js (ensure it is imported early in your app)');
    } else {
      log('Generic Node project. Installing @sentry/node');
      addDeps(project, ['@sentry/node']);
    }
  } else {
    err('Non-Node stacks are not yet automated by this script. Please instrument manually (Python: sentry-sdk).');
  }

  // Ensure .env and .env.example
  const envExample = path.join(project, '.env.example');
  const envFile = path.join(project, '.env');
  const lines = [
    'SENTRY_AUTH_TOKEN=',
    'SENTRY_ORG=',
    'SENTRY_PROJECT=',
    'SENTRY_DSN=',
    'ENVIRONMENT=development',
    'RELEASE='
  ];
  try {
    if (!fs.existsSync(envExample)){
      fs.writeFileSync(envExample, lines.join('\n') + '\n', 'utf8');
      log('Wrote .env.example (placeholders)');
    }
    if (!fs.existsSync(envFile)){
      fs.writeFileSync(envFile, lines.join('\n') + '\n', 'utf8');
      log('Created .env with placeholder keys (fill values locally)');
    }
  } catch (e) { err('Failed to write env files:', e.message); }

  // Create a basic debug doc if not present
  const docsDir = path.join(project, 'docs','debug');
  try { fs.mkdirSync(docsDir, { recursive: true }); } catch {}
  const setupFile = path.join(docsDir, 'sentry-setup.md');
  if (!fs.existsSync(setupFile)){
    fs.writeFileSync(setupFile, `# Sentry Setup (Auto)\n\n- DSN/env wired via ENVIRONMENT and RELEASE\n- Ensure importing Sentry init early in app bootstrap\n- Trigger a test error to verify ingestion\n`, 'utf8');
  }

  log('Done. Verify by starting the app and triggering a test error.');
}

main();
