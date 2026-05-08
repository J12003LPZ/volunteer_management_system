# Escalation Protocol

Standard protocol for when agents encounter errors they cannot resolve.

---

## Core Principle

**NO FALLBACKS. NO GUESSING. ESCALATE.**

When an agent encounters an error it cannot resolve with certainty, it MUST escalate. The `stuck` agent is the only agent authorized to ask the human for help.

---

## Escalation Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR OCCURS                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 0: SELF-CORRECT (within same agent)                  │
│  - Retry with different approach                            │
│  - Check error taxonomy for known fix                       │
│  - Max 1 retry                                              │
└─────────────────────────────────────────────────────────────┘
                           │ Failed
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 1: TROUBLESHOOTER                                    │
│  - Build errors, dependency issues                          │
│  - Simple test failures                                     │
│  - Configuration problems                                   │
└─────────────────────────────────────────────────────────────┘
                           │ Failed
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 2: DEBUGGER                                          │
│  - Logic errors, complex bugs                               │
│  - Race conditions, state issues                            │
│  - Performance problems                                     │
└─────────────────────────────────────────────────────────────┘
                           │ Failed
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 3: STUCK (Human Input Required)                      │
│  - Unknown errors                                           │
│  - MCP/infrastructure failures                              │
│  - Ambiguous requirements                                   │
│  - All retries exhausted                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## When to Invoke Each Level

### Level 0: Self-Correct

**Allowed**: One retry with modified approach
**NOT Allowed**: Multiple retries, guessing, workarounds

```javascript
// Example: Coder tries different import syntax
// First attempt
import { foo } from 'package'  // Failed

// Self-correct (ONE retry)
import foo from 'package'  // Try default import
```

### Level 1: Troubleshooter

Route to troubleshooter for:

| Error Type | Example |
|------------|---------|
| BUILD.COMPILE_ERROR | TypeScript errors |
| BUILD.DEPENDENCY_MISSING | `npm install` failures |
| BUILD.CONFIG_ERROR | Invalid tsconfig |
| TEST.ASSERTION_FAILED (simple) | Expected 3, got 4 |
| TEST.COVERAGE_LOW | Coverage under threshold |

### Level 2: Debugger

Route to debugger for:

| Error Type | Example |
|------------|---------|
| TEST.ASSERTION_FAILED (complex) | Flaky tests |
| TEST.TIMEOUT | Async operations hanging |
| RUNTIME.CRASH | Uncaught exceptions |
| LOGIC.EDGE_CASE_MISSED | Works mostly, fails edge cases |
| LOGIC.RACE_CONDITION | Intermittent failures |

### Level 3: Stuck

Route to stuck for:

| Error Type | Example |
|------------|---------|
| INFRASTRUCTURE.MCP_UNAVAILABLE | Jina/Serena down |
| INFRASTRUCTURE.PERMISSION_DENIED | Access denied |
| Unknown error | Never seen before |
| Ambiguous requirements | Need clarification |
| Retries exhausted | Troubleshooter + debugger failed |

---

## Escalation Handoff Format

When escalating, provide:

```markdown
## Escalation Report

**From Agent**: [agent name]
**To Agent**: [troubleshooter|debugger|stuck]
**Error Category**: [from error taxonomy]

### What Was Attempted
1. [First attempt and result]
2. [Self-correct attempt and result]

### Error Details
- Message: [exact error message]
- File: [path:line if applicable]
- Stack trace: [if available, abbreviated]

### Context
- What I was trying to do: [brief description]
- What I expected: [expected behavior]
- What happened: [actual behavior]

### Suggested Next Steps
- [Suggestion 1]
- [Suggestion 2]
```

---

## Retry Limits by Agent

| Agent | Self-Correct Retries | Before Escalating |
|-------|---------------------|-------------------|
| coder | 1 | troubleshooter or debugger |
| tester | 1 | debugger |
| troubleshooter | 2 | debugger |
| debugger | 1 | stuck |
| researcher | 0 | stuck (MCP failures) |

---

## NEVER Do These

1. **NEVER guess** at solutions without evidence
2. **NEVER use workarounds** that hide the real problem
3. **NEVER retry infinitely** - respect the limits
4. **NEVER skip escalation levels** (except for infrastructure errors → stuck)
5. **NEVER ask the user directly** - only `stuck` agent can do that

---

## MCP-Specific Escalation

For MCP tool failures:

| MCP Server | On Failure |
|------------|------------|
| Jina AI | → stuck (NEVER use WebSearch/WebFetch) |
| Serena | → stuck (suggest starting Docker container) |
| Memory | → stuck (data persistence at risk) |
| SQLite | → stuck (cache unavailable) |
| Chrome DevTools | → stuck (visual testing blocked) |

**No fallbacks to alternative tools. MCP failure = stuck.**

---

## Example Escalation Flow

```javascript
// Coder encounters type error
coder: "TypeScript error: Cannot find module '@types/lodash'"

// Self-correct attempt
coder: "Trying: npm install @types/lodash"
coder: "Still failing - network timeout"

// Escalate to Level 1
Task("troubleshooter", `
  ## Escalation Report
  **From Agent**: coder
  **To Agent**: troubleshooter
  **Error Category**: BUILD.DEPENDENCY_MISSING

  ### What Was Attempted
  1. Initial compile - failed with missing @types/lodash
  2. npm install @types/lodash - network timeout

  ### Error Details
  - Message: ETIMEDOUT
  - Context: npm registry unreachable

  ### Suggested Next Steps
  - Check network connectivity
  - Try different npm registry
  - Check if package exists
`)

// If troubleshooter fails
Task("stuck", `
  ## Escalation Report
  **From Agent**: troubleshooter
  **To Agent**: stuck
  **Error Category**: INFRASTRUCTURE.NETWORK_ERROR

  Troubleshooter attempts:
  1. Checked npm registry - unreachable
  2. Tried yarn - same issue
  3. Verified DNS - working

  Network appears blocked. Need human to check firewall/proxy.
`)
```
