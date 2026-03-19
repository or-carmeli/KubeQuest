import React from "react";

const MONO = "'JetBrains Mono','Fira Code','Cascadia Code','SF Mono',monospace";

export default function PodDiagram() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 12px 10px", margin: "4px 0 2px",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12, maxWidth: 300, width: "100%", alignSelf: "center",
      boxSizing: "border-box", overflow: "hidden",
    }}>
      {/* Pod outer box */}
      <div style={{
        border: "1.5px solid rgba(99,102,241,0.45)",
        borderRadius: 10,
        padding: "10px 14px 8px",
        minWidth: 200, maxWidth: 260, width: "100%",
        background: "rgba(99,102,241,0.04)",
      }}>
        {/* Pod label */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#818CF8",
          fontFamily: MONO, letterSpacing: 0.5,
          marginBottom: 8, textAlign: "center",
        }}>
          Pod
        </div>
        {/* Containers row */}
        <div style={{
          display: "flex", gap: 8, justifyContent: "center",
        }}>
          {["Container", "Container"].map((label, i) => (
            <div key={i} style={{
              border: "1px solid rgba(16,185,129,0.35)",
              borderRadius: 7,
              padding: "6px 12px",
              background: "rgba(16,185,129,0.04)",
              fontSize: 10, fontWeight: 600, color: "#6EE7B7",
              fontFamily: MONO, letterSpacing: 0.3,
              textAlign: "center", whiteSpace: "nowrap",
            }}>
              {label}
            </div>
          ))}
        </div>
        {/* Shared resources */}
        <div style={{
          display: "flex", gap: 10, justifyContent: "center",
          marginTop: 8, paddingTop: 7,
          borderTop: "1px dashed rgba(255,255,255,0.08)",
        }}>
          {["IP", "Network", "Volumes"].map((r) => (
            <span key={r} style={{
              fontSize: 9, color: "var(--text-muted)", fontFamily: MONO,
              letterSpacing: 0.2, opacity: 0.7,
            }}>
              {r}
            </span>
          ))}
        </div>
      </div>
      {/* Caption */}
      <div style={{
        fontSize: 10, color: "var(--text-dim)", marginTop: 6,
        textAlign: "center", opacity: 0.6,
      }}>
        shared resources
      </div>
    </div>
  );
}
