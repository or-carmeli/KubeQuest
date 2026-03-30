#!/usr/bin/env node
// ── Content Sync Verification Script ────────────────────────────────────────
// Compares local content files against the Supabase database to detect
// any mismatches between what is defined in code and what is stored in DB.
//
// Prerequisites:
//   Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY env vars
//
// Usage:
//   node scripts/verify-content-sync.mjs
//
// Exit codes:
//   0 = everything matches
//   1 = mismatches found

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Load content from JS files ──────────────────────────────────────────────
const { TOPICS } = await import("../src/content/topics.js");
const { DAILY_QUESTIONS } = await import("../src/content/dailyQuestions.js");
const { INCIDENTS } = await import("../src/content/incidents.js");

let hasMismatches = false;

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function reportFieldMismatch(context, field, localVal, dbVal) {
  hasMismatches = true;
  console.log(`  MISMATCH [${field}]`);
  console.log(`    Local: ${JSON.stringify(localVal)}`);
  console.log(`    DB:    ${JSON.stringify(dbVal)}`);
  console.log(`    Context: ${context}`);
  console.log();
}

function printHeader(title) {
  console.log();
  console.log("=".repeat(70));
  console.log(`  ${title}`);
  console.log("=".repeat(70));
  console.log();
}

// ── Fetch all rows from a table (handles pagination) ────────────────────────
async function fetchAll(table) {
  const rows = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      process.exit(1);
    }
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

// ── 1. Quiz Questions ───────────────────────────────────────────────────────
printHeader("QUIZ QUESTIONS");

// Build expected rows from TOPICS (same logic as seed script)
const expectedQuizRows = [];
const topicCounts = {};

for (const topic of TOPICS) {
  let topicCount = 0;
  for (const [level, data] of Object.entries(topic.levels)) {
    if (data.questions) {
      for (const q of data.questions) {
        expectedQuizRows.push({
          topic_id: topic.id,
          level,
          lang: "he",
          q: q.q,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          tags: q.tags || [],
        });
        topicCount++;
      }
    }
    if (data.questionsEn) {
      for (const q of data.questionsEn) {
        expectedQuizRows.push({
          topic_id: topic.id,
          level,
          lang: "en",
          q: q.q,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          tags: q.tags || [],
        });
        topicCount++;
      }
    }
  }
  topicCounts[topic.id] = topicCount;
}

const dbQuizRows = await fetchAll("quiz_questions");

console.log(`Total local: ${expectedQuizRows.length}`);
console.log(`Total DB:    ${dbQuizRows.length}`);
console.log();

// Per-topic counts
console.log("Per-topic counts (local):");
for (const [topicId, count] of Object.entries(topicCounts)) {
  const dbCount = dbQuizRows.filter((r) => r.topic_id === topicId).length;
  const marker = count !== dbCount ? " <-- MISMATCH" : "";
  console.log(`  ${topicId}: local=${count}, DB=${dbCount}${marker}`);
  if (count !== dbCount) hasMismatches = true;
}
console.log();

// Build DB lookup: key = topic_id|level|lang|q
const dbQuizMap = new Map();
for (const row of dbQuizRows) {
  const key = `${row.topic_id}|${row.level}|${row.lang}|${row.q}`;
  dbQuizMap.set(key, row);
}

// Check local -> DB
let quizMissing = 0;
let quizMismatched = 0;
for (const local of expectedQuizRows) {
  const key = `${local.topic_id}|${local.level}|${local.lang}|${local.q}`;
  const db = dbQuizMap.get(key);
  if (!db) {
    hasMismatches = true;
    quizMissing++;
    console.log(`  MISSING in DB: [${local.topic_id}/${local.level}/${local.lang}] "${local.q.substring(0, 60)}..."`);
    continue;
  }

  const context = `[${local.topic_id}/${local.level}/${local.lang}] "${local.q.substring(0, 50)}..."`;
  let rowHasMismatch = false;

  if (!deepEqual(local.options, db.options)) {
    reportFieldMismatch(context, "options", local.options, db.options);
    rowHasMismatch = true;
  }
  if (local.answer !== db.answer) {
    reportFieldMismatch(context, "answer", local.answer, db.answer);
    rowHasMismatch = true;
  }
  if (local.explanation !== db.explanation) {
    reportFieldMismatch(context, "explanation", local.explanation, db.explanation);
    rowHasMismatch = true;
  }
  if (!deepEqual(local.tags, db.tags)) {
    reportFieldMismatch(context, "tags", local.tags, db.tags);
    rowHasMismatch = true;
  }
  if (rowHasMismatch) quizMismatched++;

  // Remove from map to track orphans
  dbQuizMap.delete(key);
}

// Orphaned DB rows
let quizOrphaned = 0;
for (const [key, row] of dbQuizMap) {
  hasMismatches = true;
  quizOrphaned++;
  console.log(`  ORPHANED in DB: [${row.topic_id}/${row.level}/${row.lang}] "${row.q.substring(0, 60)}..."`);
}

console.log();
console.log(`Quiz questions summary: ${quizMissing} missing, ${quizOrphaned} orphaned, ${quizMismatched} with field mismatches`);

// ── 2. Daily Questions ──────────────────────────────────────────────────────
printHeader("DAILY QUESTIONS");

const expectedDailyRows = [];
for (const [lang, questions] of Object.entries(DAILY_QUESTIONS)) {
  for (const q of questions) {
    expectedDailyRows.push({
      lang,
      q: q.q,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      tags: q.tags || [],
    });
  }
}

const dbDailyRows = await fetchAll("daily_questions");

console.log(`Total local: ${expectedDailyRows.length}`);
console.log(`Total DB:    ${dbDailyRows.length}`);
console.log();

// Build DB lookup: key = lang|q
const dbDailyMap = new Map();
for (const row of dbDailyRows) {
  const key = `${row.lang}|${row.q}`;
  dbDailyMap.set(key, row);
}

let dailyMissing = 0;
let dailyMismatched = 0;
for (const local of expectedDailyRows) {
  const key = `${local.lang}|${local.q}`;
  const db = dbDailyMap.get(key);
  if (!db) {
    hasMismatches = true;
    dailyMissing++;
    console.log(`  MISSING in DB: [${local.lang}] "${local.q.substring(0, 60)}..."`);
    continue;
  }

  const context = `[${local.lang}] "${local.q.substring(0, 50)}..."`;
  let rowHasMismatch = false;

  if (!deepEqual(local.options, db.options)) {
    reportFieldMismatch(context, "options", local.options, db.options);
    rowHasMismatch = true;
  }
  if (local.answer !== db.answer) {
    reportFieldMismatch(context, "answer", local.answer, db.answer);
    rowHasMismatch = true;
  }
  if (local.explanation !== db.explanation) {
    reportFieldMismatch(context, "explanation", local.explanation, db.explanation);
    rowHasMismatch = true;
  }
  if (!deepEqual(local.tags, db.tags)) {
    reportFieldMismatch(context, "tags", local.tags, db.tags);
    rowHasMismatch = true;
  }
  if (rowHasMismatch) dailyMismatched++;

  dbDailyMap.delete(key);
}

let dailyOrphaned = 0;
for (const [key, row] of dbDailyMap) {
  hasMismatches = true;
  dailyOrphaned++;
  console.log(`  ORPHANED in DB: [${row.lang}] "${row.q.substring(0, 60)}..."`);
}

console.log();
console.log(`Daily questions summary: ${dailyMissing} missing, ${dailyOrphaned} orphaned, ${dailyMismatched} with field mismatches`);

// ── 3. Incident Steps ───────────────────────────────────────────────────────
printHeader("INCIDENT STEPS");

const expectedStepRows = [];
for (const incident of INCIDENTS) {
  for (let idx = 0; idx < incident.steps.length; idx++) {
    const step = incident.steps[idx];
    expectedStepRows.push({
      incident_id: incident.id,
      step_order: idx,
      prompt: step.prompt,
      prompt_he: step.promptHe,
      options: step.options,
      options_he: step.optionsHe,
      answer: step.answer,
      explanation: step.explanation,
      explanation_he: step.explanationHe,
      tags: step.tags || [],
    });
  }
}

const dbStepRows = await fetchAll("incident_steps");

console.log(`Total local: ${expectedStepRows.length}`);
console.log(`Total DB:    ${dbStepRows.length}`);
console.log();

// Build DB lookup: key = incident_id|step_order
const dbStepMap = new Map();
for (const row of dbStepRows) {
  const key = `${row.incident_id}|${row.step_order}`;
  dbStepMap.set(key, row);
}

let stepsMissing = 0;
let stepsMismatched = 0;
for (const local of expectedStepRows) {
  const key = `${local.incident_id}|${local.step_order}`;
  const db = dbStepMap.get(key);
  if (!db) {
    hasMismatches = true;
    stepsMissing++;
    console.log(`  MISSING in DB: [${local.incident_id}/step ${local.step_order}]`);
    continue;
  }

  const context = `[${local.incident_id}/step ${local.step_order}]`;
  let rowHasMismatch = false;

  for (const field of ["prompt", "prompt_he", "answer", "explanation", "explanation_he"]) {
    if (local[field] !== db[field]) {
      reportFieldMismatch(context, field, local[field], db[field]);
      rowHasMismatch = true;
    }
  }
  for (const field of ["options", "options_he", "tags"]) {
    if (!deepEqual(local[field], db[field])) {
      reportFieldMismatch(context, field, local[field], db[field]);
      rowHasMismatch = true;
    }
  }
  if (rowHasMismatch) stepsMismatched++;

  dbStepMap.delete(key);
}

let stepsOrphaned = 0;
for (const [key, row] of dbStepMap) {
  hasMismatches = true;
  stepsOrphaned++;
  console.log(`  ORPHANED in DB: [${row.incident_id}/step ${row.step_order}]`);
}

console.log();
console.log(`Incident steps summary: ${stepsMissing} missing, ${stepsOrphaned} orphaned, ${stepsMismatched} with field mismatches`);

// ── Final Report ────────────────────────────────────────────────────────────
printHeader("FINAL RESULT");

if (hasMismatches) {
  console.log("FAIL: Mismatches detected between local content and database.");
  console.log("Run the seed script with --reseed to synchronize.");
  process.exit(1);
} else {
  console.log("PASS: All local content matches the database.");
  process.exit(0);
}
