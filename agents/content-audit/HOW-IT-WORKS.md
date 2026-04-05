# Content Audit Agent -- How It Works

## What is this

A quality assurance agent for KubeQuest quiz content. It scans all questions, incidents, and scenarios and produces a structured report of issues that could confuse learners or make the quiz unfair.

It runs as a Claude Code agent (no server, no API keys beyond Claude itself) and outputs both a human-readable markdown report and a machine-readable JSON file.

## Why it exists

Quiz content grows over time. Questions get reordered, hints get copy-pasted to the wrong place, correct answers accumulate extra detail that makes them guessable, and Hebrew/English versions drift apart. Manual review doesn't scale -- there are 700+ questions across 3 files.

This agent catches these problems mechanically and consistently.

## What it checks

### Content quality (checks 1-7)

| Check | What it catches | Example |
|-------|----------------|---------|
| **ambiguity** | Unclear or confusing wording | "What does X do" when X could mean two things |
| **fairness** | Correct answer is longer/more detailed than distractors | Correct: 80 chars, distractors: 30 chars avg |
| **weak_distractor** | An option is obviously wrong | "Delete the cluster" as a troubleshooting step |
| **hint_leakage** | Hint reveals the answer | Hint says "think about stable identity" when answer is "StatefulSet gives stable identity" |
| **explanation_clarity** | Explanation is too long or vague | 500-char wall of text with no structure |
| **technical_accuracy** | K8s statement is wrong | "Pods can reference ConfigMaps across namespaces" |
| **duplicate_content** | Same concept tested twice | Two questions both asking "what is the FQDN format" |

### Statistical checks (checks 8-9)

| Check | What it catches | Example |
|-------|----------------|---------|
| **answer_distribution** | Correct answer clusters on one index | 60% of answers in a topic are option 2 |
| **cross_language_consistency** | Hebrew and English versions diverge | Hebrew correct answer means "restart" but English says "scale" |

## How the fairness check works

This is the most mechanical check. For every question:

1. Count the character length of each option
2. Compute the average length of the 3 incorrect options
3. Compute the ratio: correct length / distractor average
4. Flag if ratio >= 1.4x, or correct is 20+ chars longer than 2nd longest

Severity thresholds:
- **high**: ratio >= 1.8x or gap >= 40 chars
- **medium**: ratio 1.4x-1.8x or gap 20-40 chars
- **low**: correct is longest but gap < 20 chars (only with specificity bias)

## How to run it

### Full audit

From a Claude Code session:
```
Read agents/content-audit/CLAUDE.md for instructions, then run a full content audit.
```

### Scoped audit

```
Run a content audit. --file dailyQuestions.js
Run a content audit. --topic networking --level hard
Run a content audit. --check fairness
Run a content audit. --check answer_distribution
```

### CI validation (no Claude needed)

```bash
node agents/content-audit/validate-content.mjs
node agents/content-audit/validate-content.mjs --strict
```

This runs automatically on PRs that touch `src/content/` via `.github/workflows/content-audit.yml`.

## Output

Two files in `agents/content-audit/reports/`:

- **audit-report.md** -- human-readable, grouped by severity, with answer distribution table and cross-language section
- **audit-report.json** -- machine-readable, same data in structured format

## Architecture

```
agents/content-audit/
  CLAUDE.md              -- System prompt (the agent's brain)
  AGENT.md               -- This file (how it works)
  run-audit.md           -- Reusable invocation prompt with scope filtering
  validate-content.mjs   -- Mechanical CI script (no LLM needed)
  README.md              -- Quick-start usage guide
  reports/               -- Generated output
```

The design is intentionally minimal:
- No frameworks or dependencies
- No database or state between runs
- CLAUDE.md serves as both documentation and the agent's instructions
- validate-content.mjs covers the mechanical checks that don't need an LLM
- The agent handles the qualitative checks (ambiguity, technical accuracy, hint leakage) that require understanding

## What it does NOT do

- It never modifies source files (report only)
- It does not rewrite content -- it suggests minimal fixes
- It does not check UI rendering or RTL layout
- It does not run the application or test user-facing behavior
- It does not replace human review -- it flags candidates for human attention
