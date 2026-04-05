# Content Audit Agent

A Claude Code agent that audits KubeQuest quiz and incident content for quality issues.

## Folder structure

```
agents/content-audit/
  CLAUDE.md              -- Agent system prompt (quality checks, rules, output format)
  run-audit.md           -- Reusable prompt to trigger audits (supports scope filtering)
  validate-content.mjs   -- Mechanical validation script (runs in CI)
  README.md              -- This file
  reports/               -- Generated reports (gitignored)
    audit-report.md
    audit-report.json
```

## How to run

### Full audit (Claude Code agent)

From a Claude Code session:

```
Read agents/content-audit/CLAUDE.md for instructions, then run a full content audit.
Read all files under src/content/ and produce reports at agents/content-audit/reports/.
```

### Scoped audit

```
Run a content audit. --file dailyQuestions.js
Run a content audit. --topic networking --level hard
Run a content audit. --check fairness,hint_leakage
Run a content audit. --check answer_distribution
Run a content audit. --check cross_language_consistency
```

### Mechanical validation (CI / local)

```bash
# Fails on high-severity issues (answer index out of bounds, 1.8x+ fairness ratio)
node agents/content-audit/validate-content.mjs

# Also fails on medium-severity issues
node agents/content-audit/validate-content.mjs --strict
```

### From the CLI (one-shot)

```bash
claude --agent-prompt agents/content-audit/CLAUDE.md "$(cat agents/content-audit/run-audit.md)"
```

## What it checks

| # | Category | Description |
|---|----------|-------------|
| 1 | ambiguity | Unclear or confusing question/answer wording |
| 2 | fairness | Correct answer noticeably longer than distractors (mechanical 1.4x ratio threshold) |
| 3 | weak_distractor | Obviously wrong options that anyone could eliminate |
| 4 | hint_leakage | Hints that reveal the correct answer |
| 5 | explanation_clarity | Explanations that are too long, vague, or confusing |
| 6 | technical_accuracy | Incorrect Kubernetes/Linux/DevOps statements |
| 7 | duplicate_content | Near-duplicate questions testing the same concept |
| 8 | answer_distribution | Correct answer index clustering (e.g., always option 2) |
| 9 | cross_language_consistency | Hebrew/English version drift (different correct answer, missing options) |

## CI integration

The workflow `.github/workflows/content-audit.yml` runs `validate-content.mjs` on every PR that touches `src/content/`. It checks:

- Answer indices within bounds (0-3)
- Exactly 4 non-empty options per question
- No high-severity fairness violations (1.8x+ ratio or 40+ char gap)
- Answer distribution not heavily skewed (>45% on one index)
- Question count matches between Hebrew and English

## Output formats

### Markdown (audit-report.md)
Human-readable report with findings grouped by severity, answer distribution table, and cross-language consistency section.

### JSON (audit-report.json)
Machine-readable output for programmatic consumption. Includes all findings, measurements, and metadata.

## Design notes

- **Report only** -- the agent never modifies source files
- **Conservative** -- flags real issues, not stylistic preferences
- **Hebrew-aware** -- preserves RTL readability, keeps K8s terms in English
- **Minimal** -- no frameworks, no dependencies, just a system prompt and a validation script
- Options are intentionally shuffled between Hebrew and English versions, so answer indices naturally differ between languages
