/**
 * Shared empty state component — consistent messaging for no-data, delayed, and partial data.
 */
import { classifyDataState } from "../../utils/timeRange";

/**
 * Automatic empty state from data classification.
 * Pass hasData, lastUpdated, dataPoints and it picks the right message.
 */
export function AutoEmptyState({ hasData, lastUpdated, dataPoints }) {
  const state = classifyDataState({ hasData, lastUpdated, dataPoints });
  if (state.type === "ok") return null;
  return <EmptyState title={state.title} message={state.message} type={state.type} />;
}

/**
 * Manual empty state with explicit title/message.
 */
export default function EmptyState({ title, message, type = "no-data" }) {
  const borderColor = type === "delayed" ? "rgba(251,191,36,0.3)" : "var(--glass-6)";
  const borderStyle = type === "delayed" ? "solid" : "dashed";

  return (
    <div style={{
      padding: "28px 24px",
      textAlign: "center",
      background: "var(--glass-2)",
      border: `1px ${borderStyle} ${borderColor}`,
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
        {message}
      </div>
    </div>
  );
}
