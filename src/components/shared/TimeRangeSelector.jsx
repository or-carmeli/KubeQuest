/**
 * Shared time range selector — horizontal pill strip.
 * Used by all dashboards to ensure consistent range selection.
 */
import { useTimeRange } from "../../hooks/useTimeRange";

export default function TimeRangeSelector({ exclude = [], size = "normal" }) {
  const { rangeKey, setRangeKey, ranges } = useTimeRange();
  const filtered = ranges.filter(r => !exclude.includes(r.key));

  const fontSize = size === "compact" ? 10 : 11;
  const padding = size === "compact" ? "3px 7px" : "5px 8px";
  const borderRadius = size === "compact" ? 4 : 5;
  const outerRadius = size === "compact" ? 6 : 8;

  return (
    <div style={{ display: "flex", gap: 1, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: outerRadius, padding: 2 }}>
      {filtered.map(r => (
        <button
          key={r.key}
          onClick={() => setRangeKey(r.key)}
          style={{
            background: r.key === rangeKey ? "var(--glass-10)" : "transparent",
            border: "none",
            color: r.key === rangeKey ? "var(--text-bright)" : "var(--text-muted)",
            padding,
            borderRadius,
            cursor: "pointer",
            fontSize,
            fontWeight: r.key === rangeKey ? 700 : 400,
            transition: "all 0.15s ease",
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
