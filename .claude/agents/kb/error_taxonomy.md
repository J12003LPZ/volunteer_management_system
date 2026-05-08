# Error Classification Taxonomy

Use this taxonomy to classify errors and route them to the correct agent.

---

## Quick Reference

| Category | Subcategory | Route To |
|----------|-------------|----------|
| BUILD | * | troubleshooter |
| TEST | simple | troubleshooter |
| TEST | complex | debugger |
| RUNTIME | * | debugger |
| LOGIC | * | debugger |
| INFRASTRUCTURE | MCP_UNAVAILABLE | stuck |
| INFRASTRUCTURE | TOKEN_LIMIT | context-compressor → retry |

---

## BUILD Errors (→ troubleshooter)

Build-time errors that prevent compilation or bundling.

### BUILD.COMPILE_ERROR
**Description**: Syntax or compilation failures
**Examples**:
- TypeScript type errors
- Syntax errors in code
- Missing imports
- Incompatible type assignments

**Indicators**:
- `error TS2xxx`
- `SyntaxError:`
- `Cannot find module`
- Build process exits with non-zero code

### BUILD.DEPENDENCY_MISSING
**Description**: Package or module not found
**Examples**:
- `npm install` failed
- Package not in node_modules
- Peer dependency conflict
- Version mismatch

**Indicators**:
- `Module not found:`
- `Cannot resolve dependency`
- `ERESOLVE` errors
- `peer dep missing`

### BUILD.TYPE_ERROR
**Description**: Type mismatch or undefined type
**Examples**:
- Interface not matching implementation
- Generic type inference failure
- Missing type definitions (@types/*)

**Indicators**:
- `Type 'X' is not assignable to type 'Y'`
- `Property 'x' does not exist on type`
- `'x' is possibly 'undefined'`

### BUILD.CONFIG_ERROR
**Description**: Configuration file errors
**Examples**:
- Invalid tsconfig.json
- Malformed package.json
- webpack/vite config errors

**Indicators**:
- `Failed to load config`
- `Invalid configuration`
- JSON parse errors in config files

---

## TEST Errors (→ troubleshooter OR debugger)

### TEST.ASSERTION_FAILED (→ troubleshooter if simple, debugger if complex)
**Description**: Expected vs actual mismatch
**Examples**:
- Unit test expect() failures
- Snapshot mismatches
- Integration test failures

**Simple** (troubleshooter):
- Single assertion failure
- Obvious fix (typo, outdated snapshot)

**Complex** (debugger):
- Multiple related failures
- Flaky tests
- Race conditions in tests

**Indicators**:
- `Expected: X, Received: Y`
- `Snapshot mismatch`
- `AssertionError`

### TEST.TIMEOUT (→ debugger)
**Description**: Test exceeded time limit
**Examples**:
- Async operation never resolved
- Infinite loop
- External service timeout

**Indicators**:
- `Timeout - Async callback was not invoked`
- `exceeded timeout of Xms`

### TEST.VISUAL_MISMATCH (→ debugger)
**Description**: Screenshot diff detected
**Examples**:
- Component renders differently
- Layout shift
- Style regression

**Indicators**:
- Visual diff percentage > threshold
- Chrome DevTools comparison failure

### TEST.COVERAGE_LOW (→ troubleshooter)
**Description**: Insufficient test coverage
**Examples**:
- Branch coverage below threshold
- New code not tested

**Indicators**:
- `Coverage threshold not met`
- `Uncovered lines:`

---

## RUNTIME Errors (→ debugger)

Errors that occur during application execution.

### RUNTIME.CRASH
**Description**: Unhandled exception or panic
**Examples**:
- Uncaught TypeError
- Null pointer dereference
- Stack overflow

**Indicators**:
- `Uncaught Exception:`
- `Unhandled Promise Rejection`
- Process exit with crash

### RUNTIME.MEMORY_LEAK
**Description**: Memory growth detected
**Examples**:
- Heap size continuously growing
- Event listener not removed
- Circular references

**Indicators**:
- Memory profiler warnings
- `JavaScript heap out of memory`

### RUNTIME.PERFORMANCE_REGRESSION
**Description**: Metrics degraded significantly
**Examples**:
- Response time increased
- LCP/CLS/INP degraded
- Throughput decreased

**Indicators**:
- Benchmark comparison failure
- Performance budget exceeded

### RUNTIME.API_FAILURE
**Description**: External service error
**Examples**:
- HTTP 5xx from dependency
- Timeout calling external API
- Rate limit exceeded

**Indicators**:
- HTTP status codes 5xx, 429
- `ECONNREFUSED`, `ETIMEDOUT`

---

## LOGIC Errors (→ debugger)

Errors in business logic that don't cause crashes but produce wrong results.

### LOGIC.EDGE_CASE_MISSED
**Description**: Boundary condition not handled
**Examples**:
- Empty array not handled
- Null input causes wrong output
- Off-by-one errors

**Indicators**:
- Works for most inputs, fails for edge cases
- "It worked in development"

### LOGIC.RACE_CONDITION
**Description**: Concurrency issue
**Examples**:
- Data corrupted under load
- Intermittent failures
- Order-dependent bugs

**Indicators**:
- Flaky behavior
- Works sometimes, fails others
- "Cannot reproduce locally"

### LOGIC.STATE_CORRUPTION
**Description**: Application state became invalid
**Examples**:
- UI shows stale data
- Form loses user input
- Cache contains wrong data

**Indicators**:
- Works after refresh
- State inspection shows invalid values

---

## INFRASTRUCTURE Errors (→ stuck OR context-compressor)

System-level errors outside application code.

### INFRASTRUCTURE.MCP_UNAVAILABLE (→ stuck)
**Description**: MCP tool server not responding
**Examples**:
- Jina MCP timeout
- Serena MCP connection refused
- SQLite MCP not found

**Indicators**:
- MCP tool call fails
- `ECONNREFUSED` on localhost port
- `npx` command fails

**Action**: Invoke `stuck` immediately. Do NOT attempt fallbacks.

### INFRASTRUCTURE.TOKEN_LIMIT_EXCEEDED (→ context-compressor)
**Description**: Context window full
**Examples**:
- Agent context >80% of 200k
- Response truncated
- Tool call rejected

**Indicators**:
- Token monitor returns `shouldCompress: true`
- `context_length_exceeded` error
- Response ends abruptly

**Action**: Invoke `context-compressor` then retry.

### INFRASTRUCTURE.NETWORK_ERROR (→ troubleshooter)
**Description**: Network connectivity issues
**Examples**:
- DNS resolution failure
- SSL certificate error
- Firewall blocking

**Indicators**:
- `ENOTFOUND`
- `CERT_HAS_EXPIRED`
- Works with VPN/without VPN

### INFRASTRUCTURE.PERMISSION_DENIED (→ stuck)
**Description**: Access denied to resource
**Examples**:
- File system permission
- API authentication failure
- Database access denied

**Indicators**:
- `EACCES`
- HTTP 401/403
- `Access denied`

---

## Decision Tree

```
Error occurs
│
├── Is it a build/compile error?
│   └── YES → troubleshooter
│
├── Is it a test failure?
│   ├── Single, obvious fix? → troubleshooter
│   └── Complex/flaky? → debugger
│
├── Is it a runtime crash or API error?
│   └── YES → debugger
│
├── Is it wrong results (not crash)?
│   └── YES → debugger (LOGIC category)
│
├── Is MCP/tool unavailable?
│   └── YES → stuck (NO fallbacks!)
│
├── Is context too large?
│   └── YES → context-compressor → retry
│
└── Unknown error
    └── stuck (human decision)
```

---

## Logging Errors to Memory

When encountering an error, log it to Memory MCP:

```javascript
memory.create_entities({
  entities: [{
    name: `error_${timestamp}`,
    entityType: "ImplementationError",
    observations: [
      `Category: ${category}`,
      `Subcategory: ${subcategory}`,
      `Message: ${errorMessage}`,
      `File: ${filePath}:${lineNumber}`,
      `Routed to: ${targetAgent}`
    ]
  }]
})
```

This enables pattern detection and helps prevent recurring errors.
