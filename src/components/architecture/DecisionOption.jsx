import { getLocalizedField } from "../../utils/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function DecisionOption({ option, index, selected, revealed, lang, onSelect, interviewMode = false }) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const text = getLocalizedField(option, "text", lang);
  const isSelected = selected === index;

  let borderColor = "var(--glass-8)";
  let bgColor = "var(--glass-2)";
  let glowShadow = "none";

  if (revealed && isSelected) {
    if (interviewMode) {
      borderColor = "rgba(168,85,247,0.5)";
      bgColor = "rgba(168,85,247,0.08)";
    } else {
      const netImpact = (option.impact.performance || 0) + (option.impact.cost || 0) + (option.impact.reliability || 0);
      if (netImpact > 10) {
        borderColor = "rgba(16,185,129,0.5)";
        bgColor = "rgba(16,185,129,0.08)";
        glowShadow = "0 0 16px rgba(16,185,129,0.12)";
      } else if (netImpact < -5) {
        borderColor = "rgba(239,68,68,0.5)";
        bgColor = "rgba(239,68,68,0.08)";
        glowShadow = "0 0 16px rgba(239,68,68,0.12)";
      } else {
        borderColor = "rgba(245,158,11,0.5)";
        bgColor = "rgba(245,158,11,0.08)";
        glowShadow = "0 0 16px rgba(245,158,11,0.12)";
      }
    }
  } else if (isSelected) {
    borderColor = "rgba(168,85,247,0.5)";
    bgColor = "rgba(168,85,247,0.06)";
    glowShadow = "0 0 12px rgba(168,85,247,0.1)";
  }

  const labels = ["A", "B", "C", "D"];

  return (
    <button
      onClick={() => !revealed && onSelect(index)}
      disabled={revealed}
      style={{
        width: "100%",
        textAlign: dir === "rtl" ? "right" : "left",
        direction: dir,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: revealed ? "default" : "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: glowShadow,
        opacity: revealed && !isSelected ? 0.35 : 1,
      }}
      onMouseEnter={e => {
        if (!revealed) {
          e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
          e.currentTarget.style.background = "rgba(168,85,247,0.05)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        if (!revealed && !isSelected) {
          e.currentTarget.style.borderColor = "var(--glass-8)";
          e.currentTarget.style.background = "var(--glass-2)";
          e.currentTarget.style.transform = "translateY(0)";
        } else if (!revealed && isSelected) {
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* Label badge */}
      <span style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: 8,
        background: isSelected ? "rgba(168,85,247,0.2)" : "var(--glass-6)",
        color: isSelected ? "#A855F7" : "var(--text-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800,
        transition: "all 0.2s ease",
        border: isSelected ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
      }}>
        {labels[index]}
      </span>

      {/* Text */}
      <span style={{
        flex: 1, fontSize: 13.5, color: isSelected ? "var(--text-bright)" : "var(--text-primary)",
        lineHeight: 1.6, fontWeight: isSelected ? 600 : 400,
        transition: "color 0.15s",
      }}>
        {text}
      </span>

      {/* Action arrow (visible on selection) */}
      {isSelected && !revealed && (
        dir === "rtl"
          ? <ChevronLeft size={16} style={{ color: "#A855F7", flexShrink: 0, opacity: 0.6, animation: "fadeIn 0.2s ease" }} />
          : <ChevronRight size={16} style={{ color: "#A855F7", flexShrink: 0, opacity: 0.6, animation: "fadeIn 0.2s ease" }} />
      )}
    </button>
  );
}
