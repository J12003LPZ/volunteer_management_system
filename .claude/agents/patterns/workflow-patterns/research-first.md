# Research-First Workflow Pattern

Use this pattern when the task requires gathering information before implementation.

---

## When to Use

- New feature with unknown requirements
- Integration with unfamiliar API/library
- Upgrading to new version of dependency
- Implementing based on external standards

---

## Workflow

```
┌─────────────────┐
│  1. RESEARCH    │
│  (web/docs/kb)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. DISTILL     │
│  (≤250 lines)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. ARCHITECT   │
│  (design)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. VALIDATE    │
│  (reasoning)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. IMPLEMENT   │
│  (coder)        │
└─────────────────┘
```

---

## Step Details

### 1. Research Phase

**Agents**: `web_researcher`, `docs_researcher`, `kb_researcher`

**Output**: `docs/research_report.md` (≤120 lines)

**Tools**:
- Jina MCP: `mcp__jina__search_web`, `mcp__jina__read_url`
- Ref MCP: `mcp__Ref__docs.fetch`
- Serena MCP: semantic search in local KB

**Rules**:
- NEVER use WebSearch/WebFetch (use Jina MCP only)
- Cache results (TTL: Jina 48h, Ref 7d)
- Include citations for every claim

### 2. Distill Phase

**Agent**: `distiller`

**Input**: `docs/research_report.md` (potentially large)
**Output**: `docs/distilled_context.md` (≤250 lines)

**Rules**:
- Preserve code snippets verbatim
- Keep URLs and citations
- Prioritize actionable information
- Archive full research in Memory MCP

### 3. Architecture Phase

**Agent**: `architect`

**Input**: `docs/distilled_context.md` + requirements
**Output**: `docs/architecture.md`

**Rules**:
- Use Sequential Thinking for NFR trade-offs
- Include component diagram (text-based)
- Define API contracts
- List delegate-ready todos

### 4. Validation Phase

**Agent**: `reasoning_validator`

**Input**: `docs/architecture.md`
**Output**: Validation report with confidence score

**Rules**:
- Use Sequential Thinking MCP
- Query Memory for past lessons
- Check all assumptions
- Require confidence ≥70% to proceed

### 5. Implementation Phase

**Agent**: `coder`

**Input**: Distilled context + architecture + specific todo
**Output**: Working code

**Rules**:
- One todo at a time
- Test after each implementation
- Escalate on error (don't guess)

---

## Example Flow

```javascript
// 1. Research
Task("web_researcher", "Research Next.js 15 Server Actions best practices using Jina MCP")
// → produces docs/research_report.md

// 2. Distill
Task("distiller", "Compress research_report.md to ≤250 lines actionable context")
// → produces docs/distilled_context.md

// 3. Architecture
Task("architect", "Design Server Actions implementation based on distilled context")
// → produces docs/architecture.md with todos

// 4. Validate
Task("reasoning_validator", "Validate architecture.md for logical consistency")
// → returns confidence score, issues

// 5. Implement (if confidence ≥70%)
Task("coder", "Implement todo #1: Create Server Action for form submission")
// → implements code
```

---

## Failure Handling

| Phase | On Failure |
|-------|------------|
| Research | Invoke `stuck` if Jina/Ref unavailable |
| Distill | Cannot fail (best effort compression) |
| Architecture | Invoke `stuck` if requirements unclear |
| Validation | Return to Architect if confidence <70% |
| Implementation | Route via error taxonomy |
