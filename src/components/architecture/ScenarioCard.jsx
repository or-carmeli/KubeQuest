import { getLocalizedField } from "../../utils/i18n";

const DIFFICULTY_COLORS = {
  easy:   { bg: "rgba(16,185,129,0.12)", color: "#10B981", label: "Easy",   labelHe: "קל" },
  medium: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", label: "Medium", labelHe: "בינוני" },
  hard:   { bg: "rgba(239,68,68,0.12)",  color: "#EF4444", label: "Hard",   labelHe: "קשה" },
};

export default function ScenarioCard({ scenario, lang, onStart, bestScore, attempts, isDaily }) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const diff = DIFFICULTY_COLORS[scenario.difficulty] || DIFFICULTY_COLORS.medium;
  const title = getLocalizedField(scenario, "title", lang);
  const desc = getLocalizedField(scenario, "description", lang);

  return (
    <button
      onClick={onStart}
      style={{
        width: "100%",
        textAlign: dir === "rtl" ? "right" : "left",
        direction: dir,
        background: "var(--bg-card)",
        border: "1px solid var(--glass-8)",
        borderRadius: 16,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--glass-15)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--glass-8)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top row: icon + difficulty + time */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 28 }}>{scenario.icon}</span>
        <span style={{
          background: diff.bg, color: diff.color, fontSize: 11, fontWeight: 700,
          padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3,
        }}>
          {lang === "he" ? diff.labelHe : diff.label}
        </span>
        {isDaily && (
          <span style={{
            background: "rgba(245,158,11,0.1)", color: "#F59E0B", fontSize: 10, fontWeight: 700,
            padding: "2px 8px", borderRadius: 8, letterSpacing: 0.3,
          }}>
            {lang === "he" ? "יומי" : "DAILY"}
          </span>
        )}
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginInlineStart: "auto" }}>
          ⏱ {scenario.estimatedTime}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "var(--text-bright)", lineHeight: 1.4 }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {desc}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {scenario.tags.map(tag => (
          <span key={tag} style={{
            background: "var(--glass-4)", color: "var(--text-muted)", fontSize: 11,
            padding: "2px 8px", borderRadius: 8, fontWeight: 600,
          }}>
            {tag}
          </span>
        ))}
        {bestScore != null && (
          <span style={{
            marginInlineStart: "auto", fontSize: 11, fontWeight: 700,
            color: bestScore >= 70 ? "#10B981" : bestScore >= 50 ? "#F59E0B" : "#EF4444",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {lang === "he" ? "שיא" : "Best"}: {bestScore}
            {attempts > 1 && (
              <span style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: 10 }}>
                ({attempts} {lang === "he" ? "ניסיונות" : "attempts"})
              </span>
            )}
          </span>
        )}
      </div>
    </button>
  );
}
