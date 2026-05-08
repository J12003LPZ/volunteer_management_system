#!/usr/bin/env node
/**
 * Token Budget Monitor for Claude Subagents
 *
 * CRITICAL: 200k context window is the HARD LIMIT for all agents.
 * This tool monitors token usage and triggers compression when needed.
 *
 * Usage:
 *   node token-monitor.js check --agent <name> --context <text|file>
 *   node token-monitor.js estimate --text <text>
 *   node token-monitor.js budgets
 */

const fs = require('fs');
const path = require('path');

// CRITICAL: 200k context window is the HARD LIMIT
const CONTEXT_WINDOW = 200000;

// Budget allocation respects 200k limit with output reserves
const BUDGETS = {
  coder: { input: 140000, output: 40000, description: 'Implementation specialist' },
  architect: { input: 120000, output: 30000, description: 'System design' },
  tester: { input: 80000, output: 20000, description: 'Visual verification' },
  researcher: { input: 100000, output: 20000, description: 'Web/docs research' },
  web_researcher: { input: 100000, output: 20000, description: 'Jina MCP research' },
  docs_researcher: { input: 100000, output: 20000, description: 'Ref MCP docs' },
  kb_researcher: { input: 80000, output: 20000, description: 'Local KB search' },
  file_interpreter: { input: 100000, output: 30000, description: 'File content extraction' },
  'context-compressor': { input: 160000, output: 20000, description: 'Context reduction' },
  'reasoning-validator': { input: 120000, output: 30000, description: 'Logic validation' },
  troubleshooter: { input: 100000, output: 20000, description: 'Error diagnosis' },
  debugger: { input: 120000, output: 30000, description: 'Deep analysis' },
  stuck: { input: 50000, output: 10000, description: 'Human escalation' },
  project_manager: { input: 100000, output: 20000, description: 'Task management' },
  distiller: { input: 150000, output: 20000, description: 'Context distillation' },
  default: { input: 120000, output: 30000, description: 'Default budget' }
};

// Heuristic: ~4 characters = 1 token (conservative estimate for English text)
// For code, use ~3.5 chars/token due to more symbols
function estimateTokens(text, isCode = false) {
  if (!text) return 0;
  const charsPerToken = isCode ? 3.5 : 4;
  return Math.ceil(text.length / charsPerToken);
}

function getBudget(agentName) {
  const normalizedName = agentName.toLowerCase().replace(/[_-]/g, '_');
  return BUDGETS[normalizedName] || BUDGETS[agentName] || BUDGETS.default;
}

function check(context, agentName) {
  const isCode = context.includes('function ') || context.includes('const ') ||
                 context.includes('class ') || context.includes('import ');
  const used = estimateTokens(context, isCode);
  const budget = getBudget(agentName);
  const remaining = budget.input - used;
  const ratio = used / budget.input;

  return {
    ok: ratio < 0.8,
    used,
    budget: budget.input,
    remaining,
    outputReserve: budget.output,
    total: budget.input + budget.output,
    ratio: Math.round(ratio * 100),
    shouldCompress: ratio >= 0.8,
    critical: ratio >= 0.95,
    hardLimit: CONTEXT_WINDOW,
    agent: agentName,
    recommendation: getRecommendation(ratio)
  };
}

function getRecommendation(ratio) {
  if (ratio < 0.5) return 'OK - Plenty of room';
  if (ratio < 0.8) return 'OK - Monitor usage';
  if (ratio < 0.95) return 'WARNING - Invoke context-compressor before delegation';
  return 'CRITICAL - Invoke stuck agent, context too large';
}

function formatResult(result) {
  const status = result.critical ? '🔴 CRITICAL' :
                 result.shouldCompress ? '🟡 WARNING' : '🟢 OK';

  return `
Token Budget Check: ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent: ${result.agent}
Used: ${result.used.toLocaleString()} tokens (${result.ratio}%)
Budget: ${result.budget.toLocaleString()} tokens (input)
Remaining: ${result.remaining.toLocaleString()} tokens
Output Reserve: ${result.outputReserve.toLocaleString()} tokens
Hard Limit: ${result.hardLimit.toLocaleString()} tokens

Recommendation: ${result.recommendation}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}

function showBudgets() {
  console.log('\nToken Budgets (200k Context Window)\n');
  console.log('Agent                  | Input    | Output   | Total    | Description');
  console.log('-----------------------|----------|----------|----------|------------------');

  for (const [name, budget] of Object.entries(BUDGETS)) {
    const input = budget.input.toLocaleString().padStart(8);
    const output = budget.output.toLocaleString().padStart(8);
    const total = (budget.input + budget.output).toLocaleString().padStart(8);
    const agentName = name.padEnd(22);
    console.log(`${agentName} | ${input} | ${output} | ${total} | ${budget.description}`);
  }
  console.log('');
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'check') {
  const agentIdx = args.indexOf('--agent');
  const contextIdx = args.indexOf('--context');

  if (agentIdx === -1 || contextIdx === -1) {
    console.error('Usage: node token-monitor.js check --agent <name> --context <text|file>');
    process.exit(1);
  }

  const agentName = args[agentIdx + 1];
  let context = args[contextIdx + 1];

  // Check if context is a file path
  if (fs.existsSync(context)) {
    context = fs.readFileSync(context, 'utf-8');
  }

  const result = check(context, agentName);
  console.log(formatResult(result));
  console.log(JSON.stringify(result, null, 2));

  // Exit with appropriate code
  if (result.critical) process.exit(2);
  if (result.shouldCompress) process.exit(1);
  process.exit(0);

} else if (command === 'estimate') {
  const textIdx = args.indexOf('--text');
  if (textIdx === -1) {
    console.error('Usage: node token-monitor.js estimate --text <text>');
    process.exit(1);
  }

  let text = args[textIdx + 1];
  if (fs.existsSync(text)) {
    text = fs.readFileSync(text, 'utf-8');
  }

  const tokens = estimateTokens(text);
  console.log(`Estimated tokens: ${tokens.toLocaleString()}`);
  console.log(`Characters: ${text.length.toLocaleString()}`);
  console.log(`Ratio of 200k window: ${Math.round((tokens / CONTEXT_WINDOW) * 100)}%`);

} else if (command === 'budgets') {
  showBudgets();

} else {
  console.log(`
Token Monitor - Claude Subagents Budget Tool

Commands:
  check     Check token usage against agent budget
            --agent <name>     Agent name (coder, architect, etc.)
            --context <text>   Context text or file path

  estimate  Estimate tokens for text
            --text <text>      Text or file path

  budgets   Show all agent budgets

Examples:
  node token-monitor.js check --agent coder --context "function hello() {}"
  node token-monitor.js estimate --text ./docs/distilled_context.md
  node token-monitor.js budgets
`);
}

// Export for use as module
module.exports = { check, estimateTokens, getBudget, BUDGETS, CONTEXT_WINDOW };
