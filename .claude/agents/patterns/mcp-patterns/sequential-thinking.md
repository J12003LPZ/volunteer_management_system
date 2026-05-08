# Sequential Thinking MCP Pattern

How to use the `mcp__sequentialthinking__sequentialthinking` tool effectively.

---

## Tool Signature

```javascript
mcp__sequentialthinking__sequentialthinking({
  thought: string,           // Current thinking step
  nextThoughtNeeded: boolean, // Continue thinking?
  thoughtNumber: number,      // Current thought (1-indexed)
  totalThoughts: number,      // Estimated total (can adjust)
  isRevision?: boolean,       // Revising previous thought?
  revisesThought?: number,    // Which thought being revised
  branchFromThought?: number, // Branching point
  branchId?: string,          // Branch identifier
  needsMoreThoughts?: boolean // Need to extend?
})
```

---

## When to Use

| Situation | Use Sequential Thinking? |
|-----------|-------------------------|
| Architecture decision with trade-offs | Yes |
| Complex debugging | Yes |
| Multi-step validation | Yes |
| Simple code change | No |
| Straightforward bug fix | No |
| File search | No |

---

## Basic Pattern

```javascript
// Start with clear problem statement
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 1: [Problem statement and constraints]",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 5  // Initial estimate
})

// Continue reasoning
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 2: [Analysis or options]",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 5
})

// ... more thoughts ...

// Final conclusion
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 5: [Final recommendation with justification]",
  nextThoughtNeeded: false,  // Done!
  thoughtNumber: 5,
  totalThoughts: 5
})
```

---

## Revision Pattern

When you realize a previous thought was wrong:

```javascript
// Original thought
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 2: Option A seems best because of X",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 5
})

// Later, revise it
mcp__sequentialthinking__sequentialthinking({
  thought: "Revising Thought 2: Actually, Option A has flaw Y. Option B is better.",
  nextThoughtNeeded: true,
  thoughtNumber: 4,
  totalThoughts: 6,  // Extended
  isRevision: true,
  revisesThought: 2
})
```

---

## Branching Pattern

When exploring alternative approaches:

```javascript
// Main analysis
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 3: Main approach using REST API",
  nextThoughtNeeded: true,
  thoughtNumber: 3,
  totalThoughts: 7
})

// Branch to explore alternative
mcp__sequentialthinking__sequentialthinking({
  thought: "Branch A: What if we used GraphQL instead?",
  nextThoughtNeeded: true,
  thoughtNumber: 4,
  totalThoughts: 8,
  branchFromThought: 3,
  branchId: "graphql-alternative"
})

// Continue branch
mcp__sequentialthinking__sequentialthinking({
  thought: "Branch A continued: GraphQL pros and cons...",
  nextThoughtNeeded: true,
  thoughtNumber: 5,
  totalThoughts: 8,
  branchId: "graphql-alternative"
})
```

---

## Budget Guidelines

| Complexity | Thoughts | Examples |
|------------|----------|----------|
| Simple | 3-5 | Single decision, clear options |
| Medium | 6-10 | Trade-off analysis, debugging |
| Complex | 10-15 | Architecture, multi-factor decisions |

**Never exceed 15 thoughts** - if you need more, the problem needs decomposition.

---

## Thought Templates

### Problem Statement (Thought 1)
```
"Thought 1: Problem statement
- What: [specific problem to solve]
- Constraints: [time, resources, compatibility]
- Success criteria: [how we know it's solved]"
```

### Options Analysis (Thoughts 2-N)
```
"Thought 2: Option A - [name]
- How it works: [brief description]
- Pros: [list]
- Cons: [list]
- Risk: [main risk]"
```

### Comparison (Mid-thoughts)
```
"Thought 4: Comparing options
| Criterion | Option A | Option B |
|-----------|----------|----------|
| Perf      | Good     | Excellent|
| Cost      | Low      | Medium   |
Winner on criteria: [analysis]"
```

### Final Decision (Last Thought)
```
"Thought N: Final recommendation
- Choose: [Option X]
- Primary reason: [key differentiator]
- Trade-offs accepted: [what we're giving up]
- Implementation notes: [guidance for coder]"
```

---

## Integration with Agents

### Architect Agent
```javascript
// Architecture decision
for (let i = 1; i <= 7; i++) {
  mcp__sequentialthinking__sequentialthinking({
    thought: architectureThoughts[i],
    nextThoughtNeeded: i < 7,
    thoughtNumber: i,
    totalThoughts: 7
  })
}
```

### Debugger Agent
```javascript
// Hypothesis testing
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 1: Symptom observed - [error description]",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 6
})

mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 2: Hypothesis A - [possible cause]",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 6
})

// Test hypothesis...
```

### Reasoning Validator
```javascript
// Validate assumptions
mcp__sequentialthinking__sequentialthinking({
  thought: "Thought 1: Proposal being validated - [summary]",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 7
})

// Check each assumption...
// Calculate confidence...
// Final recommendation
```

---

## Anti-Patterns

**Don't:**
- Use for simple decisions (overhead not worth it)
- Exceed 15 thoughts (decompose instead)
- Skip problem statement (Thought 1)
- Forget final conclusion
- Use without clear structure

**Do:**
- Start with clear problem statement
- Estimate thoughts upfront (can adjust)
- Use revision when learning new info
- End with actionable recommendation
- Reference templates in `.claude/agents/kb/reasoning-templates.md`
