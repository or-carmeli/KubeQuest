Run a content quality audit of the KubeQuest quiz and incident content.

## Instructions

1. Read the agent instructions in `agents/content-audit/CLAUDE.md`
2. Parse any scope arguments provided after this prompt:
   - `--file <name>` limits to a specific content file
   - `--topic <id>` limits to a specific topic in topics.js
   - `--level <easy|medium|hard>` limits to a specific difficulty level
   - `--check <category>` limits to specific quality checks (comma-separated)
   - If no scope arguments, audit everything (full scan)
3. Read the content files in scope completely:
   - `src/content/topics.js`
   - `src/content/dailyQuestions.js`
   - `src/content/incidents.js`
   - All files in `src/content/scenarios/`
4. For every question and incident step in scope, evaluate against all quality checks (or only the specified checks)
5. Collect all findings and write reports:
   - Markdown: `agents/content-audit/reports/audit-report.md`
   - JSON: `agents/content-audit/reports/audit-report.json`
6. Create the reports directory if it does not exist: `mkdir -p agents/content-audit/reports`
7. Print a brief summary of findings to the console when done

Focus on real, actionable issues. Do not flag minor stylistic preferences.

## Example invocations

Full scan (default):
```
Run a full content audit.
```

Single file:
```
Run a content audit. --file dailyQuestions.js
```

Specific topic and level:
```
Run a content audit. --topic networking --level hard
```

Specific checks only:
```
Run a content audit. --check fairness,hint_leakage
```

Cross-language only:
```
Run a content audit. --check cross_language_consistency
```

Answer distribution only:
```
Run a content audit. --check answer_distribution
```
