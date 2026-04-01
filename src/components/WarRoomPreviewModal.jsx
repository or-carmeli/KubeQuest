import { useState } from "react";
import { Siren } from "lucide-react";

const PREVIEW_OPTIONS = [
  {
    en: "kubectl get pods -n production",
    correct: true,
    analysisEn: "Inspecting pods reveals crash states and restart counts before making changes. Safe first step",
    impact: [
      { label: "Observability", dir: "\u2191", c: "74,222,128" },
      { label: "Risk", dir: "\u2193", c: "74,222,128" },
      { label: "Downtime", dir: "\u2193", c: "74,222,128" },
    ],
  },
  {
    en: "kubectl rollout undo deploy/api-gw -n production",
    correct: false,
    analysisEn: "Rollback without root cause analysis is premature. Previous version may have the same issue if the problem is infra-related",
    impact: [
      { label: "Observability", dir: "\u2193", c: "239,68,68" },
      { label: "Risk", dir: "\u2191", c: "239,68,68" },
      { label: "Recovery", dir: "\u2191", c: "250,204,21" },
    ],
  },
  {
    en: "kubectl delete pods --all -n production",
    correct: false,
    analysisEn: "Mass-deleting pods causes full service disruption. All replicas go down simultaneously with no graceful drain",
    impact: [
      { label: "Downtime", dir: "\u2191", c: "239,68,68" },
      { label: "Risk", dir: "\u2191", c: "239,68,68" },
      { label: "Blast Radius", dir: "\u2191", c: "239,68,68" },
    ],
  },
];

const CONTEXT_ITEMS = [
  { label: "Cluster", value: "prod-us-east-1" },
  { label: "Namespace", value: "api" },
  { label: "Service", value: "api-gateway" },
];

// War Room accent: red/orange tones to distinguish from Architecture (purple)
const A = {
  glow: "239,68,68",
  accent: "#F87171",
  accentDim: "rgba(239,68,68,",
};

/**
 * War Room "Coming Soon" preview modal.
 * Mirrors the Architecture Scenarios preview card structure exactly.
 */
export default function WarRoomPreviewModal({
  lang = "en",
  dir = "ltr",
  supabase,
  user,
  isGuest,
  // existing War Room state - passed from App.jsx (do NOT create new state)
  warRoomInterestRegistered,
  setWarRoomInterestRegistered,
  warRoomInterestCount,
  setWarRoomInterestCount,
  warRoomEmailSending,
  setWarRoomEmailSending,
  warRoomEmailModal,
  setWarRoomEmailModal,
  warRoomEmail,
  setWarRoomEmail,
  warRoomNotifyToast,
  setWarRoomNotifyToast,
  onBack,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const isEn = lang === "en";

  const handleNotify = () => {
    if (warRoomInterestRegistered || warRoomEmailSending) return;
    window.va?.track?.("war_room_interest_clicked", {
      user_id: user?.id || null,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.PROD ? "prod" : "dev",
    });
    const onSuccess = () => {
      setWarRoomInterestRegistered(true);
      try { localStorage.setItem("warroom_interest_v1", "1"); } catch {}
      setWarRoomNotifyToast({ msg: isEn ? "Subscribed" : "נרשמת לעדכון", isError: false });
      setTimeout(() => setWarRoomNotifyToast(null), 3000);
      supabase?.rpc("get_war_room_interest_count").then(({ data }) => {
        if (data?.count != null) setWarRoomInterestCount(data.count);
      });
    };
    const onError = (err) => {
      console.error("[KubeQuest:warroom] Registration failed:", err?.message || "unknown");
      setWarRoomNotifyToast({ msg: isEn ? "Registration failed - try again" : "ההרשמה נכשלה - נסו שוב", isError: true });
      setTimeout(() => setWarRoomNotifyToast(null), 4000);
    };
    if (!isGuest && user && supabase) {
      setWarRoomEmailSending(true);
      supabase.rpc("register_war_room_interest", { user_email: null }).then(({ data, error }) => {
        setWarRoomEmailSending(false);
        if (!error) onSuccess(); else onError(error);
      }).catch(e => { setWarRoomEmailSending(false); onError(e); });
    } else if (supabase) {
      setWarRoomEmailModal(true);
    } else {
      onError("Supabase not available");
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const val = warRoomEmail.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return;
    if (!supabase) return;
    setWarRoomEmailSending(true);
    supabase.rpc("register_war_room_interest", { user_email: val }).then(({ error }) => {
      setWarRoomEmailSending(false);
      if (!error) {
        setWarRoomEmailModal(false);
        setWarRoomEmail("");
        setWarRoomInterestRegistered(true);
        try { localStorage.setItem("warroom_interest_v1", "1"); } catch {}
        setWarRoomNotifyToast({ msg: isEn ? "Subscribed" : "נרשמת לעדכון", isError: false });
        setTimeout(() => setWarRoomNotifyToast(null), 3000);
        supabase.rpc("get_war_room_interest_count").then(({ data: d }) => {
          if (d?.count != null) setWarRoomInterestCount(d.count);
        });
      } else {
        setWarRoomNotifyToast({ msg: isEn ? "Registration failed - try again" : "ההרשמה נכשלה - נסו שוב", isError: true });
        setTimeout(() => setWarRoomNotifyToast(null), 4000);
      }
    }).catch(() => {
      setWarRoomEmailSending(false);
      setWarRoomNotifyToast({ msg: isEn ? "Registration failed - try again" : "ההרשמה נכשלה - נסו שוב", isError: true });
      setTimeout(() => setWarRoomNotifyToast(null), 4000);
    });
  };

  const hasSelection = selectedOption !== null;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 20px", animation: "fadeIn 0.3s ease", direction: dir }}>
      {/* Back button */}
      <button onClick={onBack} style={{ background: "var(--glass-4)", border: "1px solid var(--glass-9)", color: "var(--text-secondary)", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <span aria-hidden="true">{dir === "rtl" ? "\u2192" : "\u2190"}</span>
      </button>

      {/* Main card */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 4px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${A.accentDim}0.07) 0%, var(--glass-3) 50%, ${A.accentDim}0.05) 100%)`,
          border: `1px solid ${A.accentDim}0.2)`,
          borderRadius: 20,
          padding: "22px 20px 20px",
          maxWidth: 460,
          width: "100%",
          position: "relative",
          boxShadow: `0 0 60px ${A.accentDim}0.08), 0 0 20px ${A.accentDim}0.04), 0 8px 32px rgba(0,0,0,0.3)`,
        }}>
          {/* Icon */}
          <div style={{ marginBottom: 6 }}>
            <Siren size={32} strokeWidth={1.3} style={{ color: A.accent, filter: `drop-shadow(0 0 8px ${A.accentDim}0.3))` }} />
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${A.accentDim}0.18) 0%, ${A.accentDim}0.08) 100%)`,
            color: A.accent, fontSize: 9, fontWeight: 700, padding: "3px 12px",
            borderRadius: 20, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase",
            border: `1px solid ${A.accentDim}0.15)`,
          }}>
            Incident Mode
          </div>

          {/* Title */}
          <h2 style={{ margin: "0 0 3px", color: "var(--text-bright)", fontSize: 20, fontWeight: 900 }}>
            {isEn ? "War Room" : "חדר מצב"}
          </h2>

          {/* Subtitle */}
          <p style={{ margin: "0 0 1px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}>
            {isEn
              ? "Practice real-time production incident management"
              : "תרגול ניהול תקלות פרודקשן בזמן אמת"}
          </p>
          <p style={{ margin: "0 0 10px", color: "var(--text-dim)", fontSize: 10, opacity: 0.7 }}>
            {isEn ? "Designed for DevOps and SRE engineers" : "מיועד למהנדסי DevOps ו-SRE"}
          </p>

          {/* ── Incident simulation block (always English / LTR) ── */}
          <div style={{
            background: `${A.accentDim}0.03)`,
            border: `1px solid ${A.accentDim}0.12)`,
            borderRadius: 14,
            padding: "12px 14px 10px",
            marginBottom: 10,
            textAlign: "left",
            direction: "ltr",
            boxShadow: `inset 0 1px 12px ${A.accentDim}0.04)`,
          }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: A.accent, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.8 }}>
                Incident Preview
              </span>
              <span style={{ fontSize: 9, color: "var(--text-dim)", opacity: 0.7, fontWeight: 600 }}>
                Step 1 of 4
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: "var(--glass-4)", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ width: "25%", height: "100%", background: `linear-gradient(90deg, ${A.accent}, ${A.accentDim}0.4))`, borderRadius: 2 }} />
            </div>

            {/* System context */}
            <div style={{
              background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 8,
              padding: "7px 10px", marginBottom: 8,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, opacity: 0.8 }}>
                System context
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px" }}>
                {CONTEXT_ITEMS.map((item, i) => (
                  <span key={i} style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.5 }}>
                    <span style={{ opacity: 0.7 }}>{item.label}: </span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600, fontFamily: "monospace", fontSize: 10 }}>
                      {item.value}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Incident title */}
            <p style={{ margin: "0 0 3px", color: "var(--text-bright)", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
              5xx Spike on API Gateway
            </p>

            {/* Metrics line */}
            <p style={{ margin: "0 0 6px", color: "var(--text-secondary)", fontSize: 10, opacity: 0.8, fontFamily: "monospace" }}>
              Error rate: 45% &middot; Baseline: 1.2% &middot; P95: 2.8s
            </p>

            {/* Prompt */}
            <p style={{ margin: "0 0 7px", color: "var(--text-secondary)", fontSize: 11, opacity: 0.85 }}>
              Where do you start?
            </p>

            {/* Options */}
            {PREVIEW_OPTIONS.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = opt.correct;
              const borderColor = isSelected
                ? (isCorrect ? "rgba(74,222,128,0.5)" : "rgba(239,68,68,0.4)")
                : hasSelection ? "var(--glass-4)" : "var(--glass-6)";
              const bg = isSelected
                ? (isCorrect ? "rgba(74,222,128,0.06)" : "rgba(239,68,68,0.05)")
                : "var(--glass-3)";
              return (
                <div
                  key={i}
                  onClick={hasSelection ? undefined : () => setSelectedOption(i)}
                  style={{
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 10,
                    padding: "6px 10px",
                    marginBottom: i < PREVIEW_OPTIONS.length - 1 ? 4 : 0,
                    cursor: hasSelection ? "default" : "pointer",
                    transition: "all 0.2s",
                    opacity: hasSelection && !isSelected ? 0.4 : 1,
                    boxShadow: isSelected
                      ? `0 0 12px ${isCorrect ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.08)"}`
                      : "none",
                  }}
                  onMouseEnter={hasSelection ? undefined : e => { e.currentTarget.style.borderColor = `${A.accentDim}0.35)`; e.currentTarget.style.background = `${A.accentDim}0.06)`; }}
                  onMouseLeave={hasSelection ? undefined : e => { e.currentTarget.style.borderColor = "var(--glass-6)"; e.currentTarget.style.background = "var(--glass-3)"; }}
                >
                  <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: 4,
                      border: isSelected
                        ? `2px solid ${isCorrect ? "rgba(74,222,128,0.7)" : "rgba(239,68,68,0.6)"}`
                        : `1px solid ${A.accentDim}0.25)`,
                      background: isSelected
                        ? (isCorrect ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.15)")
                        : `${A.accentDim}0.06)`,
                      flexShrink: 0, transition: "all 0.2s",
                    }} />
                    <span style={{ color: isSelected ? "var(--text-bright)" : "var(--text-secondary)", fontSize: 10.5, fontWeight: 600, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opt.en}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ── Decision analysis panel ── */}
            {selectedOption !== null && (() => {
              const sel = PREVIEW_OPTIONS[selectedOption];
              return (
                <div style={{
                  marginTop: 6, padding: "8px 10px", borderRadius: 10,
                  background: sel.correct ? "rgba(74,222,128,0.05)" : "rgba(239,68,68,0.04)",
                  border: `1px solid ${sel.correct ? "rgba(74,222,128,0.18)" : "rgba(239,68,68,0.13)"}`,
                  animation: "fadeIn 0.3s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                      color: sel.correct ? "#4ADE80" : "#EF4444",
                    }}>
                      Decision analysis
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                      color: sel.correct ? "#4ADE80" : "#EF4444", opacity: 0.7,
                    }}>
                      {sel.correct ? "Correct" : "Not optimal"}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                    {sel.analysisEn}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {sel.impact.map((imp, i) => (
                      <span key={i} style={{
                        fontSize: 10, fontWeight: 600,
                        color: `rgba(${imp.c},0.9)`,
                        background: `rgba(${imp.c},0.08)`,
                        border: `1px solid rgba(${imp.c},0.15)`,
                        padding: "2px 8px", borderRadius: 20,
                        boxShadow: `0 0 6px rgba(${imp.c},0.06)`,
                      }}>
                        {imp.label} {imp.dir}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── CTA ── */}
          <button
            disabled={warRoomInterestRegistered || warRoomEmailSending}
            onClick={handleNotify}
            style={{
              padding: "9px 30px",
              background: warRoomInterestRegistered ? "var(--glass-2)" : `linear-gradient(135deg, ${A.accentDim}0.2) 0%, ${A.accentDim}0.1) 100%)`,
              border: `1px solid ${warRoomInterestRegistered ? "var(--glass-6)" : `${A.accentDim}0.3)`}`,
              borderRadius: 10,
              color: warRoomInterestRegistered ? "var(--text-dim)" : A.accent,
              fontSize: 13, fontWeight: 700,
              cursor: warRoomInterestRegistered || warRoomEmailSending ? "default" : "pointer",
              transition: "all 0.2s",
              opacity: warRoomInterestRegistered ? 0.6 : warRoomEmailSending ? 0.5 : 1,
              boxShadow: warRoomInterestRegistered ? "none" : `0 0 16px ${A.accentDim}0.1)`,
            }}
            onMouseEnter={warRoomInterestRegistered || warRoomEmailSending ? undefined : e => { e.currentTarget.style.background = `linear-gradient(135deg, ${A.accentDim}0.3) 0%, ${A.accentDim}0.15) 100%)`; e.currentTarget.style.borderColor = `${A.accentDim}0.45)`; e.currentTarget.style.boxShadow = `0 0 24px ${A.accentDim}0.15)`; }}
            onMouseLeave={warRoomInterestRegistered || warRoomEmailSending ? undefined : e => { e.currentTarget.style.background = `linear-gradient(135deg, ${A.accentDim}0.2) 0%, ${A.accentDim}0.1) 100%)`; e.currentTarget.style.borderColor = `${A.accentDim}0.3)`; e.currentTarget.style.boxShadow = `0 0 16px ${A.accentDim}0.1)`; }}
          >
            {warRoomEmailSending ? "..."
              : warRoomInterestRegistered ? (isEn ? "Subscribed" : "נרשמת")
              : (isEn ? "Notify me" : "הירשם לעדכון")}
          </button>

          {/* Participants count - uses existing data */}
          {warRoomInterestCount != null && warRoomInterestCount > 0 ? (
            <p style={{ margin: "8px 0 0", color: "var(--text-dim)", fontSize: 11, opacity: 0.55 }}>
              {isEn
                ? `${warRoomInterestCount} waiting`
                : `${warRoomInterestCount} ממתינים`}
            </p>
          ) : (
            <p style={{ margin: "8px 0 0", color: "var(--text-dim)", fontSize: 11, opacity: 0.45 }}>
              {isEn ? "Join the early access waitlist" : "הצטרפו לרשימת הגישה המוקדמת"}
            </p>
          )}

          {/* Toast */}
          {warRoomNotifyToast && (
            <div style={{
              position: "absolute", bottom: -48, left: "50%", transform: "translateX(-50%)",
              background: warRoomNotifyToast.isError ? "rgba(239,68,68,0.15)" : "var(--bg-card)",
              border: `1px solid ${warRoomNotifyToast.isError ? "rgba(239,68,68,0.3)" : "var(--glass-9)"}`,
              borderRadius: 10, padding: "8px 16px", fontSize: 12,
              color: warRoomNotifyToast.isError ? "#EF4444" : "var(--text-secondary)",
              whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              animation: "fadeIn 0.3s ease",
            }}>
              {warRoomNotifyToast.msg}
            </div>
          )}
        </div>
      </div>

      {/* Email modal for guest users */}
      {warRoomEmailModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20, animation: "fadeIn 0.2s ease" }}
          onClick={e => { if (e.target === e.currentTarget) { setWarRoomEmailModal(false); setWarRoomEmail(""); } }}
        >
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-8)", borderRadius: 16, padding: "28px 24px", maxWidth: 340, width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} dir={dir}>
            <h3 style={{ margin: "0 0 20px", color: "var(--text-bright)", fontSize: 16, fontWeight: 800 }}>
              {isEn ? "Get notified" : "קבלו עדכון כשהפיצ'ר ייפתח"}
            </h3>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email" name="email" inputMode="email" autoComplete="email" required autoFocus
                placeholder={isEn ? "Email" : "אימייל"}
                value={warRoomEmail}
                onChange={e => setWarRoomEmail(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "var(--glass-3)", border: "1px solid var(--glass-9)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12, direction: "ltr", textAlign: "left" }}
                onFocus={e => { e.currentTarget.style.borderColor = `${A.accentDim}0.4)`; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--glass-9)"; }}
              />
              <button type="submit" disabled={warRoomEmailSending}
                style={{ width: "100%", padding: "10px", background: `${A.accentDim}0.15)`, border: `1px solid ${A.accentDim}0.3)`, borderRadius: 8, color: A.accent, fontSize: 13, fontWeight: 700, cursor: warRoomEmailSending ? "wait" : "pointer", transition: "all 0.2s", opacity: warRoomEmailSending ? 0.5 : 1 }}
                onMouseEnter={e => { if (!warRoomEmailSending) { e.currentTarget.style.background = `${A.accentDim}0.25)`; } }}
                onMouseLeave={e => { e.currentTarget.style.background = `${A.accentDim}0.15)`; }}
              >{warRoomEmailSending ? "..." : (isEn ? "Subscribe" : "הרשמה")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
