# Content Audit Agent

A minimal Claude Code agent that audits KubeQuest quiz and incident content for quality issues.

## Folder structure

```
agents/content-audit/
  CLAUDE.md        -- Agent system prompt (quality checks, rules, output format)
  run-audit.md     -- Reusable prompt to trigger a full audit
  README.md        -- This file
  reports/         -- Generated reports (gitignored)
    audit-report.md
```

## How to run

### Option A: From the project root with Claude Code

```bash
claude --agent-prompt agents/content-audit/CLAUDE.md "$(cat agents/content-audit/run-audit.md)"
```

### Option B: Inside a Claude Code session

Paste or reference the prompt from `run-audit.md`:

```
Read agents/content-audit/CLAUDE.md for instructions, then run a full content audit.
Read all files under src/content/ and produce a report at agents/content-audit/reports/audit-report.md.
```

### Option C: Using the Claude Code Agent tool

From another Claude Code session, launch a subagent:

```
Use the Agent tool to run a content audit.
Prompt: the contents of agents/content-audit/run-audit.md
```

## What it checks

| # | Category | Description |
|---|----------|-------------|
| 1 | ambiguity | Unclear or confusing question/answer wording |
| 2 | fairness | Correct answer noticeably longer than distractors |
| 3 | weak_distractor | Obviously wrong options that anyone could eliminate |
| 4 | hint_leakage | Hints that reveal the correct answer |
| 5 | explanation_clarity | Explanations that are too long, vague, or confusing |
| 6 | technical_accuracy | Incorrect Kubernetes/Linux/DevOps statements |
| 7 | duplicate_content | Near-duplicate questions testing the same concept |

## Design notes

- **Report only** -- the agent never modifies source files
- **Conservative** -- flags real issues, not stylistic preferences
- **Hebrew-aware** -- preserves RTL readability, keeps K8s terms in English
- **Minimal** -- no frameworks, no dependencies, just a system prompt and a run prompt
- The CLAUDE.md file serves as both documentation and the agent's system prompt
- Reports are written to a separate directory to keep source clean

## Suggested improvements for v2

- **Scope filtering:** Add flags to audit only a specific file or topic (e.g., `--file topics.js --topic networking`)
- **Diff mode:** Compare current content against the last audit report and only flag new/changed issues
- **CI integration:** Run the audit on PRs that touch `src/content/` and post findings as PR comments
- **Severity thresholds:** Fail CI if any high-severity findings exist
- **Answer distribution analysis:** Check if correct answers cluster on a specific index (e.g., always option 2)
- **Cross-language consistency:** Compare Hebrew and English versions of the same question for drift
- **Machine-readable output:** Add JSON output alongside markdown for programmatic consumption
