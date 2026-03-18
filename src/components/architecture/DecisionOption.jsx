import { getLocalizedField } from "../../utils/i18n";

export default function DecisionOption({ option, index, selected, revealed, lang, onSelect }) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const text = getLocalizedField(option, "text", lang);
  const isSelected = selected === index;

  // After reveal, color based on impact quality
  let borderColor = "var(--glass-8)";
  let bgColor = "var(--glass-2)";
  let glowShadow = "none";

  if (revealed && isSelected) {
    const netImpact = (option.impact.performance || 0) + (option.impact.cost || 0) + (option.impact.reliability || 0);
    if (netImpact > 10) {
      borderColor = "rgba(16,185,129,0.5)";
      bgColor = "rgba(16,185,129,0.08)";
      glowShadow = "0 0 20px rgba(16,185,129,0.15)";
    } else if (netImpact < -5) {
      borderColor = "rgba(239,68,68,0.5)";
      bgColor = "rgba(239,68,68,0.08)";
      glowShadow = "0 0 20px rgba(239,68,68,0.15)";
    } else {
      borderColor = "rgba(245,158,11,0.5)";
      bgColor = "rgba(245,158,11,0.08)";
      glowShadow = "0 0 20px rgba(245,158,11,0.15)";
    }
  } else if (isSelected) {
    borderColor = "rgba(168,85,247,0.5)";
    bgColor = "rgba(168,85,247,0.08)";
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
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        boxShadow: glowShadow,
        opacity: revealed && !isSelected ? 0.4 : 1,
      }}
      onMouseEnter={e => {
        if (!revealed) {
          e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
          e.currentTarget.style.background = "rgba(168,85,247,0.05)";
        }
      }}
      onMouseLeave={e => {
        if (!revealed && !isSelected) {
          e.currentTarget.style.borderColor = "var(--glass-8)";
          e.currentTarget.style.background = "var(--glass-2)";
        }
      }}
    >
      <span style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: 8,
        background: isSelected ? "rgba(168,85,247,0.2)" : "var(--glass-6)",
        color: isSelected ? "#A855F7" : "var(--text-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 800,
      }}>
        {labels[index]}
      </span>
      <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, fontWeight: isSelected ? 600 : 400 }}>
        {text}
      </span>
    </button>
  );
}
