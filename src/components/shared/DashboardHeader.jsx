/**
 * Shared dashboard header — consistent layout for all observability dashboards.
 *
 * Layout: [back] [icon] [title] [DEV badge] [status slot] ... [freshness] [refresh]
 */
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getFreshnessState } from "../../utils/timeRange";

export default function DashboardHeader({
  title,
  icon: Icon,
  onBack,
  dir = "ltr",
  lastUpdated,
  onRefresh,
  showRefresh = true,
  children,
}) {
  const freshness = getFreshnessState(lastUpdated);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
      <button
        className="back-btn"
        onClick={onBack}
        style={{
          background: "var(--glass-3)", border: "1px solid var(--glass-6)",
          color: "var(--text-secondary)", padding: "7px 10px", borderRadius: 6,
          cursor: "pointer", display: "flex", alignItems: "center",
          order: dir === "rtl" ? 99 : 0,
        }}
      >
        <ArrowLeft size={16} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />
      </button>

      {Icon && <Icon size={22} strokeWidth={1.5} style={{ color: "var(--text-bright)" }} />}

      <span style={{ fontSize: 26, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.3 }}>{title}</span>

      <span style={{
        fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase",
        padding: "2px 7px", borderRadius: 5,
        background: "rgba(139,92,246,0.15)", color: "#a78bfa",
        border: "1px solid rgba(139,92,246,0.25)",
      }}>DEV</span>

      {/* Dashboard-specific slot (health badge, online count, etc.) */}
      {children}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: freshness.color, fontWeight: 500 }}>
          {freshness.label}
        </span>
        {showRefresh && onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              background: "var(--glass-3)", border: "1px solid var(--glass-6)",
              color: "var(--text-muted)", padding: "5px 8px", borderRadius: 6,
              cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center",
            }}
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
