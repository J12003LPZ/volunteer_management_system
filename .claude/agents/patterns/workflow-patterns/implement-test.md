# Implement-Test Workflow Pattern

Use this pattern for the core coding loop: implement → test → fix → repeat.

---

## When to Use

- Implementing features from architecture todos
- Fixing bugs with known cause
- Refactoring existing code
- Adding tests to existing code

---

## Workflow

```
┌─────────────────┐
│  1. IMPLEMENT   │
│  (coder)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. REVIEW      │
│  (code_reviewer)│
└────────┬────────┘
         │
    ┌────┴────┐
    │ Issues? │
    └────┬────┘
    YES  │  NO
    ▼    │
┌───────┐│
│ FIX   ││
└───┬───┘│
    └────┼────┐
         ▼    │
┌─────────────────┐
│  3. TEST        │
│  (tester)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Pass?   │
    └────┬────┘
    NO   │  YES
    ▼    │
┌───────┐│
│DEBUG  ││
└───┬───┘│
    └────┼────┐
         ▼
┌─────────────────┐
│  4. COMPLETE    │
│  (mark done)    │
└─────────────────┘
```

---

## Step Details

### 1. Implement Phase

**Agent**: `coder`

**Input**:
- ONE specific todo item
- `docs/distilled_context.md` (≤250 lines)
- Handoff packet (≤120 lines)

**Output**: Working code changes

**Rules**:
- Use Serena MCP for code navigation
- One feature/fix at a time
- Include inline comments only where non-obvious
- Do NOT add extra features

### 2. Review Phase

**Agent**: `code_reviewer`

**Input**: Code changes from coder

**Output**: Review report with issues

**Checks**:
- Logic correctness
- Error handling
- Security (no hardcoded secrets)
- Performance (obvious issues)
- Style consistency

**Rules**:
- Critical issues → back to coder
- Minor suggestions → note for future
- Use Memory to check for past mistakes

### 3. Test Phase

**Agent**: `tester`

**Input**: What was implemented + expected behavior

**Output**: Pass/fail with evidence (screenshots for UI)

**Tools**:
- Chrome DevTools MCP for visual verification
- Bash for running test commands
- Read for checking test output

**Rules**:
- Visual verification required for UI changes
- Run relevant test suites
- Check for regressions

### 4. Complete Phase

**Actions**:
- Mark todo as completed
- Update any documentation if needed
- Log to Memory MCP for future reference

---

## Error Routing

```
Test fails
│
├── BUILD error?
│   └── troubleshooter → coder
│
├── ASSERTION error (simple)?
│   └── troubleshooter → coder
│
├── ASSERTION error (complex)?
│   └── debugger → coder
│
├── LOGIC error?
│   └── debugger → coder
│
└── Unknown?
    └── stuck (human decides)
```

---

## Example Flow

```javascript
// 1. Implement
Task("coder", `
  Todo: Add email validation to signup form
  Context: See docs/distilled_context.md
  Acceptance: Given invalid email, when submitting, then show error message
`)
// → coder implements validation

// 2. Review
Task("code_reviewer", `
  Review changes to src/components/SignupForm.tsx
  Check: validation logic, error handling, XSS prevention
`)
// → reviewer approves or requests changes

// 3. Test
Task("tester", `
  Verify: Email validation on signup form
  Test cases:
  - Invalid email shows error
  - Valid email allows submission
  - Error message is styled correctly
  Use Chrome DevTools to capture screenshots
`)
// → tester reports pass/fail with screenshots

// 4. Complete (if pass)
TodoWrite({ todos: [{ content: "Add email validation", status: "completed" }] })
```

---

## Retry Limits

| Phase | Max Retries | Then |
|-------|-------------|------|
| Implement | 2 | debugger |
| Review | 1 | human review (stuck) |
| Test | 2 | debugger |
| Debug | 1 | stuck |

After retry limit reached, always escalate to `stuck` agent.
