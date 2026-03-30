#!/usr/bin/env node
/**
 * Validates that quiz hints don't leak the correct answer.
 *
 * Usage:
 *   node scripts/validate-hints.mjs           # validate all
 *   node scripts/validate-hints.mjs --verbose  # show every hint checked
 *
 * Checks:
 *   1. Every question has a hint field
 *   2. Hint is not empty
 *   3. Hint is not too long (max 20 words)
 *   4. Hint doesn't share 3+ significant keywords with the correct answer
 *   5. Hint doesn't overlap >50% with the correct answer's key terms
 *
 * Exit code 0 = all pass, 1 = issues found
 */

import { readFileSync } from "fs";

const verbose = process.argv.includes("--verbose");

const HE_STOPWORDS = new Set(["של","על","את","עם","לא","גם","או","כל","אם","עד","כי","רק","הוא","היא","הם","הן","זה","מה","אל","בו","לו","כמו","אחד","יותר","ביותר","שלא","שיש","אין","שהוא","שהם","ללא","בין","כדי","לפי","כמה","אותו","אותה"]);
const EN_STOPWORDS = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","shall","should","may","might","must","can","could","and","but","or","nor","not","no","so","if","than","that","this","these","those","it","its","of","in","on","at","to","for","with","from","by","as","into","about","between","through","after","before","during","without","within","what","which","who","how","when","where","why","each","every","all","any","both","few","more","most","other","some","such","only","also","just","very","too"]);

let total = 0;
let issues = 0;
let missing = 0;

function getSignificantWords(text, isHebrew) {
  const stopwords = isHebrew ? HE_STOPWORDS : EN_STOPWORDS;
  return text
    .replace(/[^a-zA-Z\u0590-\u05FF0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopwords.has(w.toLowerCase()))
    .map((w) => w.toLowerCase());
}

function checkHint(q, hint, correctAnswer, file, line) {
  total++;
  const errors = [];

  if (!hint || !hint.trim()) {
    errors.push("EMPTY");
  } else {
    const words = hint.split(/\s+/).length;
    if (words > 20) errors.push(`TOO_LONG (${words} words)`);

    const isHebrew = /[\u0590-\u05FF]/.test(hint);
    const answerWords = getSignificantWords(correctAnswer, isHebrew);
    const hintWords = getSignificantWords(hint, isHebrew);

    const leaked = hintWords.filter((h) => answerWords.includes(h));
    const uniqueLeaked = [...new Set(leaked)];

    if (uniqueLeaked.length >= 3) {
      errors.push(`LEAKS_ANSWER: [${uniqueLeaked.join(", ")}]`);
    }

    if (answerWords.length > 0) {
      const overlapPct = uniqueLeaked.length / answerWords.length;
      if (overlapPct > 0.5) {
        errors.push(`HIGH_OVERLAP (${Math.round(overlapPct * 100)}%)`);
      }
    }
  }

  if (errors.length > 0) {
    issues++;
    console.log(`\n  FAIL  ${file}:${line}`);
    console.log(`    Q:      ${q.slice(0, 70)}`);
    console.log(`    Answer: ${correctAnswer.slice(0, 70)}`);
    console.log(`    Hint:   ${(hint || "(none)").slice(0, 70)}`);
    console.log(`    Issue:  ${errors.join(", ")}`);
  } else if (verbose) {
    console.log(`  OK    ${file}:${line}  ${hint.slice(0, 50)}`);
  }
}

// ── Parse topics.js (multi-line format) ──────────────────────────────────────
function parseTopics() {
  const content = readFileSync("src/content/topics.js", "utf8");
  const lines = content.split("\n");
  let currentQ = "", currentHint = "", currentOptions = [], inOptions = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qm = line.match(/q:\s*"([^"]+)"/);
    if (qm) { currentQ = qm[1]; currentOptions = []; currentHint = ""; }

    const hm = line.match(/hint:\s*"([^"]+)"/);
    if (hm) currentHint = hm[1];

    const om = line.match(/^\s*"([^"]{5,})"/);
    if (inOptions && om) currentOptions.push(om[1]);
    if (line.includes("options:")) { inOptions = true; currentOptions = []; }
    if (inOptions && line.includes("],")) inOptions = false;

    const am = line.match(/answer:\s*(\d)/);
    if (am && currentQ) {
      const ansIdx = parseInt(am[1]);
      const correctText = currentOptions[ansIdx] || "";

      if (!currentHint) {
        missing++;
        console.log(`\n  MISS  topics.js:${i + 1}  ${currentQ.slice(0, 60)}`);
      } else if (correctText) {
        checkHint(currentQ, currentHint, correctText, "topics.js", i + 1);
      }
      currentQ = "";
      currentHint = "";
    }
  }
}

// ── Parse dailyQuestions.js (compact + multi-line) ───────────────────────────
function parseDaily() {
  const content = readFileSync("src/content/dailyQuestions.js", "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Compact single-line format
    const cm = line.match(/q:"([^"]+)".*?options:\[([^\]]+)\].*?hint:"([^"]+)".*?answer:(\d)/);
    if (cm) {
      const opts = (cm[2].match(/"([^"]+)"/g) || []).map((s) => s.replace(/"/g, ""));
      const ansIdx = parseInt(cm[4]);
      if (opts[ansIdx]) checkHint(cm[1], cm[3], opts[ansIdx], "dailyQuestions.js", i + 1);
      continue;
    }

    // Single-line without hint
    if (line.includes(",answer:") && line.includes('q:"') && !line.includes("hint:")) {
      const qm = line.match(/q:"([^"]+)"/);
      missing++;
      console.log(`\n  MISS  dailyQuestions.js:${i + 1}  ${(qm?.[1] || "").slice(0, 60)}`);
    }

    // Multi-line questions
    if (line.match(/^\s*\{q:"/) && !line.includes("answer:")) {
      const qm = line.match(/q:"([^"]+)"/);
      if (!qm) continue;

      const block = lines.slice(i, Math.min(i + 8, lines.length)).join(" ");
      const bm = block.match(/hint:"([^"]+)".*?answer:(\d)/);
      const optM = block.match(/options:\[([^\]]+)\]/);

      if (!block.includes("hint:")) {
        missing++;
        console.log(`\n  MISS  dailyQuestions.js:${i + 1}  ${qm[1].slice(0, 60)}`);
      } else if (bm && optM) {
        const opts = (optM[1].match(/"([^"]+)"/g) || []).map((s) => s.replace(/"/g, ""));
        const ansIdx = parseInt(bm[2]);
        if (opts[ansIdx]) checkHint(qm[1], bm[1], opts[ansIdx], "dailyQuestions.js", i + 1);
      }
    }
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────
console.log("Validating quiz hints...\n");
parseTopics();
parseDaily();

console.log("\n" + "=".repeat(50));
console.log(`  Checked:  ${total}`);
console.log(`  Missing:  ${missing}`);
console.log(`  Failed:   ${issues}`);
console.log(`  Passed:   ${total - issues}`);
console.log("=".repeat(50));

if (issues > 0 || missing > 0) {
  console.log("\nFix the issues above and re-run.");
  process.exit(1);
} else {
  console.log("\nAll hints are valid!");
  process.exit(0);
}
