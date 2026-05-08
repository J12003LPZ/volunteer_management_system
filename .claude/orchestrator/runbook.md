# Orchestrator Runbook

1. Preflight & Planning

- **Invoke `project_manager`** to analyze the request and update `project_state.md`.
- Invoke `web_researcher`, `docs_researcher`, `kb_researcher` as needed based on the plan.
- Merge results into one `research_report.md`
- Invoke `prompt_optimizer` when agent prompts are added or changed and capture `docs/prompts/audit.md`
- Set/confirm runtime context for DevTools agents: `APP_URL` and optional `ROUTE_UNDER_TEST`
- Enable cache for eligible agents unless overridden:
  - Jina (web_researcher) TTL 48h; Ref (docs_researcher) TTL 7d
  - UI Token Snapshot TTL 1h (invalidate on CSS mtime change)
  - Static security scan keyed by commit SHA
  - Do not cache visual tests or performance traces
- Run preflight checks: `node .claude/tools/preflight-ctx.js` and address any errors before delegating

2. Distill

- Invoke `distiller` with research materials
- Produce `distilled_context.md` (≤250 lines)

3. Implement

- Build Handoff Packet: `node .claude/tools/handoff-pack.js --todo <todo-text> --context docs/distilled_context.md --out docs/handoffs/<timestamp>_handoff_packet.md`
- Update handoff index: `node .claude/tools/handoff-index.js`
- **Memory MCP**: Store handoff context:
  ```javascript
  memory.create_entities({
    entities: [
      {
        label: "HandoffPacket",
        name: "<todo-id>",
        properties: {
          handoff: "docs/handoffs/<timestamp>_handoff_packet.md",
          context: "docs/distilled_context.md",
        },
      },
    ],
  });
  ```
- Delegate ONE todo to `coder` with ONLY:
  - The todo text
  - `docs/distilled_context.md`
  - `docs/handoffs/<timestamp>_handoff_packet.md`
- Start a fresh chat/session for the coder (no prior history). Do not include research threads or earlier transcripts.
- If Serena is not reachable, do not proceed; invoke `stuck` to start it (mandatory for coding agents)
- Preflight (strict Serena for coding): `node .claude/tools/preflight-ctx.js --strict-serena`

4. Review & Polish

- **Invoke `code_reviewer`** to check for logic, quality, and best practices.
  - If critical issues found: Coder fixes → Review again.
- Invoke `ui_polisher` (if UI changed) to align visuals with existing tokens/components before testing.
- **Invoke `docs_maintainer`** to ensure documentation matches the new code.

5. Test

- **Invoke `test_data_generator`** (if needed) to populate the database with realistic data.
- Invoke `tester` (Chrome DevTools MCP) with a concise checklist
- Start a fresh chat/session for the tester; attach ONLY the checklist and URL/env notes (e.g., `APP_URL`, `ROUTE_UNDER_TEST`)
- Generate checklist automatically from the handoff capsule:
  - `node .claude/tools/test-checklist.js --from docs/handoffs/<timestamp>_handoff_packet.json --out docs/checklists/<timestamp>_test.md`

6. Iterate

- Update TodoWrite; repeat until all todos pass
- Archive droid sessions to `docs/artifacts/runs/` and keep only a 1–3 line summary in orchestrator memory
- **Memory MCP**: Update run status:
  ```javascript
  memory.create_entities({
    entities: [
      {
        label: "RunReport",
        name: "<todo-id>",
        properties: {
          status: "passed",
          report: "docs/artifacts/runs/<file>.md",
        },
      },
    ],
  });
  ```

7. Troubleshooting & Escalation

- **Level 1:** If an error occurs (build, test, dependency), invoke `troubleshooter`.
  - If `troubleshooter` finds a fix: Apply it (via Coder) and retry.
- **Level 2:** If logic is broken or tests fail mysteriously, invoke `debugger`.
  - `debugger` traces execution and proposes a fix.
- **Level 3:** If still stuck or ambiguous, invoke `stuck` for human intervention.

8. Pre‑Release Checks (Optional but Recommended)

- Invoke `sec_reviewer` to produce `docs/security/audit.md`
- Invoke `perf_analyst` to update `docs/perf/budget.md` and `docs/perf/findings.md`
- Invoke `observability_specialist` to install/verify Sentry and produce `docs/debug/sentry-setup.md` and `docs/debug/checklist.md` with a test event

9. MCP Usage Logging

- After each subagent completion, append a one‑line entry to `docs/artifacts/mcp-usage.md` including agent name, timestamp, and the agent‑reported “Tools Used” line

## Serena Quick Start (Docker)

- Run server:
  - Linux/macOS:
    - `docker run --rm -p 8765:8765 -v "$PWD:/workspace" ghcr.io/oraios/serena:latest mcp --mode http --port 8765 --project /workspace`
  - Windows PowerShell:
    - `docker run --rm -p 8765:8765 -v ${PWD}:/workspace ghcr.io/oraios/serena:latest mcp --mode http --port 8765 --project /workspace`
- Set env var before `claude`:
  - PowerShell: `$env:SERENA_MCP_URL = "http://127.0.0.1:8765"`
  - bash/zsh: `export SERENA_MCP_URL=http://127.0.0.1:8765`
- Launch orchestrator: `claude`

Token-Safe I/O Policy

- Prefer Grep/Glob → `Read` with `offset/limit`.
- For large files, use Serena’s symbol tools (find/replace at function/class scope).
- Do not retry failing full-file reads; reduce scope or switch to Serena.
