/**
 * InfoTip — "?" icon with hover/click tooltip
 * Used next to chart and section titles to explain what a metric measures
 */
import { useState } from "react";

export default function InfoTip({ text }) {
  const [show, setShow] = useState(false);
  if (!text) return null;

  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help", padding: 2 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => { e.stopPropagation(); setShow(s => !s); }}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 16, height: 16, borderRadius: "50%",
        fontSize: 10, fontWeight: 700, lineHeight: 1,
        color: show ? "var(--text-primary)" : "var(--text-muted)",
        background: show ? "var(--glass-10)" : "var(--glass-5)",
        border: `1px solid ${show ? "var(--glass-10)" : "var(--glass-8)"}`,
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}>
        ?
      </span>
      {show && (
        <span style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          background: "#0f172a", color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.45,
          padding: "8px 11px", borderRadius: 6, border: "1px solid var(--glass-6)",
          whiteSpace: "normal", width: 230, zIndex: 200, pointerEvents: "none",
          textTransform: "none", fontWeight: 400, letterSpacing: 0,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          animation: "fadeIn 0.15s ease",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}
