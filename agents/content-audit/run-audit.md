Run a full content quality audit of the KubeQuest quiz and incident content.

## Instructions

1. Read the agent instructions in `agents/content-audit/CLAUDE.md`
2. Read each content file completely:
   - `src/content/topics.js`
   - `src/content/dailyQuestions.js`
   - `src/content/incidents.js`
   - All files in `src/content/scenarios/`
3. For every question and incident step, evaluate against all 7 quality checks
4. Collect all findings and write a structured report to `agents/content-audit/reports/audit-report.md`
5. Create the reports directory if it does not exist: `mkdir -p agents/content-audit/reports`
6. Print a brief summary of findings to the console when done

Focus on real, actionable issues. Do not flag minor stylistic preferences.
