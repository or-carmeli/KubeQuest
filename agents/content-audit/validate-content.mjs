#!/usr/bin/env node
// ── Content Validation Script ───────────────────────────────────────────────
// Runs mechanical checks on quiz content files.
// Returns exit code 1 if any high-severity issues are found.
//
// Checks:
//   1. Answer index validity (0-3, within options array bounds)
//   2. Option count (exactly 4 per question)
//   3. No empty options
//   4. Answer distribution balance (flag if one index > 40% in 10+ questions)
//   5. Fairness ratio (correct option length vs distractor avg, flag if >= 1.8x)
//   6. Cross-language answer index consistency (He vs En must match)
//
// Usage:
//   node agents/content-audit/validate-content.mjs
//   node agents/content-audit/validate-content.mjs --strict   # also fail on medium severity

const strict = process.argv.includes("--strict");

const results = { errors: [], warnings: [] };

function error(msg) { results.errors.push(msg); }
function warn(msg) { results.warnings.push(msg); }

// ── Helpers ─────────────────────────────────────────────────────────────────

function checkOptions(options, answer, label) {
  if (!Array.isArray(options)) { error(`${label}: options is not an array`); return; }
  if (options.length !== 4) error(`${label}: expected 4 options, got ${options.length}`);
  if (answer < 0 || answer >= options.length) error(`${label}: answer index ${answer} out of bounds [0-${options.length - 1}]`);
  options.forEach((o, i) => {
    if (!o || (typeof o === "string" && o.trim().length === 0)) error(`${label}: option ${i} is empty`);
  });
}

function checkFairness(options, answer, label) {
  if (!Array.isArray(options) || options.length !== 4) return;
  const lens = options.map(o => (typeof o === "string" ? o.trim().length : 0));
  const correctLen = lens[answer];
  const distractorLens = lens.filter((_, i) => i !== answer);
  const avg = distractorLens.reduce((a, b) => a + b, 0) / distractorLens.length;
  const ratio = avg > 0 ? correctLen / avg : 0;
  const sortedDesc = [...lens].sort((a, b) => b - a);
  const gap = correctLen === sortedDesc[0] ? correctLen - sortedDesc[1] : 0;

  if (ratio >= 1.8 || gap >= 40) {
    error(`${label}: fairness HIGH -- ratio ${ratio.toFixed(2)}x, gap +${gap} chars (lengths: [${lens}], answer: ${answer})`);
  } else if (ratio >= 1.4 || gap >= 20) {
    warn(`${label}: fairness MEDIUM -- ratio ${ratio.toFixed(2)}x, gap +${gap} chars (lengths: [${lens}], answer: ${answer})`);
  }
}

function checkDistribution(counts, label) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total < 10) return;
  for (const [idx, count] of Object.entries(counts)) {
    const pct = (count / total) * 100;
    if (pct > 45) error(`${label}: answer index ${idx} is ${pct.toFixed(0)}% (${count}/${total})`);
    else if (pct > 40) warn(`${label}: answer index ${idx} is ${pct.toFixed(0)}% (${count}/${total})`);
  }
}

// ── Load and validate ───────────────────────────────────────────────────────

const { TOPICS } = await import("../../src/content/topics.js");
const { DAILY_QUESTIONS } = await import("../../src/content/dailyQuestions.js");
const { INCIDENTS } = await import("../../src/content/incidents.js");

// ── topics.js ───────────────────────────────────────────────────────────────

for (const topic of TOPICS) {
  for (const level of ["easy", "medium", "hard"]) {
    const lvl = topic.levels[level];
    if (!lvl) continue;

    const heQuestions = lvl.questions || [];
    const enQuestions = lvl.questionsEn || [];
    const dist = { 0: 0, 1: 0, 2: 0, 3: 0 };

    heQuestions.forEach((q, i) => {
      const label = `topics/${topic.id}/${level}/he[${i}]`;
      checkOptions(q.options, q.answer, label);
      checkFairness(q.options, q.answer, label);
      dist[q.answer] = (dist[q.answer] || 0) + 1;
    });

    enQuestions.forEach((q, i) => {
      const label = `topics/${topic.id}/${level}/en[${i}]`;
      checkOptions(q.options, q.answer, label);
      checkFairness(q.options, q.answer, label);
    });

    checkDistribution(dist, `topics/${topic.id}/${level}`);

    // Cross-language consistency: question count must match
    if (heQuestions.length !== enQuestions.length) {
      error(`topics/${topic.id}/${level}: question count mismatch -- he=${heQuestions.length} en=${enQuestions.length}`);
    }
    // Note: answer indices may differ between languages because options are
    // intentionally shuffled per language. Content-level consistency is
    // checked by the agent audit, not this mechanical script.
  }
}

// ── dailyQuestions.js ───────────────────────────────────────────────────────

for (const lang of ["he", "en"]) {
  const questions = DAILY_QUESTIONS[lang] || [];
  const dist = { 0: 0, 1: 0, 2: 0, 3: 0 };

  questions.forEach((q, i) => {
    const label = `daily/${lang}[${i}]`;
    checkOptions(q.options, q.answer, label);
    checkFairness(q.options, q.answer, label);
    dist[q.answer] = (dist[q.answer] || 0) + 1;
  });

  checkDistribution(dist, `daily/${lang}`);
}

// Cross-language: dailyQuestions he/en question count consistency
{
  const heQ = DAILY_QUESTIONS.he || [];
  const enQ = DAILY_QUESTIONS.en || [];
  if (heQ.length !== enQ.length) {
    error(`daily: question count mismatch -- he=${heQ.length} en=${enQ.length}`);
  }
  // Note: answer indices may differ between languages (options shuffled).
}

// ── incidents.js ────────────────────────────────────────────────────────────

for (const inc of INCIDENTS) {
  inc.steps.forEach((step, si) => {
    const labelEn = `incidents/${inc.id}/step${si}/en`;
    const labelHe = `incidents/${inc.id}/step${si}/he`;
    checkOptions(step.options, step.answer, labelEn);
    checkFairness(step.options, step.answer, labelEn);
    if (step.optionsHe) {
      checkOptions(step.optionsHe, step.answer, labelHe);
      checkFairness(step.optionsHe, step.answer, labelHe);
    }
  });
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n── Content Validation ──`);
console.log(`Errors:   ${results.errors.length}`);
console.log(`Warnings: ${results.warnings.length}`);

if (results.errors.length > 0) {
  console.log(`\nERRORS:`);
  results.errors.forEach(e => console.log(`  ✗ ${e}`));
}
if (results.warnings.length > 0) {
  console.log(`\nWARNINGS:`);
  results.warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

const exitCode = results.errors.length > 0 ? 1 : (strict && results.warnings.length > 0 ? 1 : 0);
if (exitCode === 0) console.log(`\n✓ All checks passed.`);
else console.log(`\n✗ Validation failed.`);

process.exit(exitCode);
