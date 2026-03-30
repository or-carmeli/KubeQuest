// ── Question normalization ──────────────────────────────────────────────────
// Ensures a consistent object shape regardless of whether the question was
// loaded from local content files or from a Supabase RPC.
//
// Local questions have:   { q, options, answer, explanation, tags? }
// Server questions have:  { id, q, options, tags }  (no answer/explanation)
//
// After normalization both shapes share the same guaranteed fields so that
// rendering code (diagrams, difficulty badges, etc.) never needs to branch
// on the data source.

/**
 * @param {object} raw  - question object from any source
 * @param {string} [source="local"] - "local" | "server"
 * @returns {object} normalized question with guaranteed fields
 */
export function normalizeQuestion(raw, source = "local") {
  if (!raw) return raw;
  return {
    ...raw,
    id:      raw.id      ?? null,
    q:       raw.q       ?? "",
    options: Array.isArray(raw.options) ? raw.options : [],
    tags:    raw.tags     ?? [],
    level:   raw.level    ?? null,
    _source: source,
  };
}

/**
 * Normalize an array of questions, then pass through shuffleOptions.
 * Drop-in replacement for `shuffleOptions(rawQs || [])`.
 *
 * @param {Array}    rawQs   - raw question array (may be null/undefined)
 * @param {Function} shuffle - the shuffleOptions function
 * @param {string}   [source="local"]
 * @returns {Array} shuffled + normalized questions
 */
export function normalizeAndShuffle(rawQs, shuffle, source = "local") {
  const normalized = (rawQs || []).map(q => normalizeQuestion(q, source));
  return shuffle(normalized);
}
