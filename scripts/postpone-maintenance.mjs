#!/usr/bin/env node
// Postpones the most recent maintenance window by a given number of months.
// Usage: VITE_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/postpone-maintenance.mjs [months]
//   months defaults to 1

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const months = parseInt(process.argv[2] || "1", 10);
if (isNaN(months) || months < 1) {
  console.error("Invalid months value. Usage: node scripts/postpone-maintenance.mjs [months]");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch the most recent maintenance window
const { data: rows, error: fetchError } = await supabase
  .from("maintenance_windows")
  .select("*")
  .order("starts_at", { ascending: false })
  .limit(1);

if (fetchError) {
  console.error("Failed to fetch maintenance windows:", fetchError.message);
  process.exit(1);
}

if (!rows || rows.length === 0) {
  console.log("No maintenance windows found.");
  process.exit(0);
}

const mw = rows[0];
const oldStart = new Date(mw.starts_at);
const oldEnd = new Date(mw.ends_at);

const newStart = new Date(oldStart);
newStart.setMonth(newStart.getMonth() + months);
const newEnd = new Date(oldEnd);
newEnd.setMonth(newEnd.getMonth() + months);

console.log(`Maintenance window: "${mw.title}" (id=${mw.id})`);
console.log(`  Before: ${oldStart.toISOString()} -> ${oldEnd.toISOString()}`);
console.log(`  After:  ${newStart.toISOString()} -> ${newEnd.toISOString()}`);

const { error: updateError } = await supabase
  .from("maintenance_windows")
  .update({ starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() })
  .eq("id", mw.id);

if (updateError) {
  console.error("Failed to update:", updateError.message);
  process.exit(1);
}

console.log("Done — maintenance window postponed successfully.");
