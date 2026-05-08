# Agent Template

Use this template when creating new agents. Copy and customize for your specific agent.

---

## Template

```markdown
---
name: <agent_name>
description: <one-line description of what this agent does>
tools: <comma-separated list of tools this agent can use>
model: <haiku|sonnet|opus>
---

# <Agent Name> Agent

## CRITICAL: [Any Mandatory Rules]

**YOU MUST [rule]:**
- Rule 1
- Rule 2

**NEVER [anti-pattern]:**
- Anti-pattern 1
- Anti-pattern 2

---

## Your Mission

<2-3 sentences describing the core purpose of this agent>

---

## When You Are Invoked

The orchestrator invokes you when:
- Condition 1
- Condition 2
- Condition 3

---

## Context Inputs

You will receive:
- Input 1: <description>
- Input 2: <description>
- Optional: <description>

---

## Workflow

### 1. <First Step Name>

<Description of what to do>

### 2. <Second Step Name>

<Description of what to do>

### 3. <Final Step Name>

<Description of what to do>

---

## Output Contract

**File**: `<output file path>`
**Format**: <markdown|json|code>
**Max Size**: <lines or bytes>

**Sections**:
- Section 1: <description>
- Section 2: <description>

---

## Acceptance Criteria

- Given <precondition>, when <action>, then <expected result>
- Given <precondition>, when <action>, then <expected result>
- Given <precondition>, when <action>, then <expected result>

---

## Error Handling

| Error Type | Action |
|------------|--------|
| <error 1> | <action> |
| <error 2> | <action> |
| Unknown | Invoke `stuck` agent |

---

## Success Criteria

- <Measurable outcome 1>
- <Measurable outcome 2>
- <Measurable outcome 3>
```

---

## Required Sections Checklist

When creating a new agent, ensure you have:

- [ ] **YAML frontmatter** with name, description, tools, model
- [ ] **Critical rules** if any (mandatory constraints)
- [ ] **Mission statement** (2-3 sentences)
- [ ] **Invocation conditions** (when orchestrator calls this agent)
- [ ] **Context inputs** (what the agent receives)
- [ ] **Workflow** (numbered steps)
- [ ] **Output contract** (file path, format, max size)
- [ ] **Acceptance criteria** (Given/When/Then format)
- [ ] **Error handling** (what to do on failures)
- [ ] **Success criteria** (measurable outcomes)

---

## Model Selection Guide

| Model | Use For | Token Budget |
|-------|---------|--------------|
| haiku | Fast, simple tasks. Compression, formatting, simple edits. | Up to 100k |
| sonnet | Most tasks. Coding, research, analysis. | Up to 150k |
| opus | Complex reasoning, architecture, critical decisions. | Up to 180k |

---

## Tool Declaration Patterns

### Research Agents
```yaml
tools: JinaMCP(search_web,read_url,parallel_read_url), RefMCP(docs.fetch), Read, Write, Task
```

### Coding Agents
```yaml
tools: Serena, Read, Write, Edit, Glob, Grep, Bash, Task, memory, fetch
```

### Validation Agents
```yaml
tools: mcp__sequentialthinking__sequentialthinking, memory, Read
```

### Testing Agents
```yaml
tools: Task, Read, Bash, ChromeDevToolsMCP(*)
```

---

## Escalation Pattern

Every agent should include this pattern:

```markdown
## On Error

If you encounter an error you cannot resolve:
1. Classify using error taxonomy (see `.claude/agents/kb/error_taxonomy.md`)
2. Route to appropriate agent:
   - BUILD errors → troubleshooter
   - LOGIC errors → debugger
   - INFRASTRUCTURE errors → stuck
3. Include full context in handoff
4. Do NOT attempt workarounds without classification
```
