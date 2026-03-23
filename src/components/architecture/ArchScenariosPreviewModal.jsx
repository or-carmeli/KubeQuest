import { useState, useEffect } from "react";
import { Brain } from "lucide-react";

const PREVIEW_OPTIONS = [
  {
    en: "Scale pods", he: "הגדל פודים",
    hintEn: "Increase replica count to handle load", hintHe: "הגדל את מספר הרפליקות לטיפול בעומס",
    correct: true,
    feedbackEn: "Horizontal pod autoscaling is the fastest response to a traffic spike, adding capacity in seconds without provisioning new nodes",
    feedbackHe: "Horizontal Pod Autoscaling הוא התגובה המהירה ביותר לעליית תעבורה, מוסיף קיבולת בשניות בלי להקצות נודים חדשים",
    impactEn: [{ label: "Latency", dir: "\u2193", c: "74,222,128" }, { label: "Reliability", dir: "\u2191", c: "74,222,128" }, { label: "Cost", dir: "\u2191", c: "250,204,21" }],
    impactHe: [{ label: "Latency", dir: "\u2193", c: "74,222,128" }, { label: "אמינות", dir: "\u2191", c: "74,222,128" }, { label: "עלות", dir: "\u2191", c: "250,204,21" }],
  },
  {
    en: "Add node group", he: "הוסף קבוצת נודים",
    hintEn: "Expand cluster capacity", hintHe: "הרחב את קיבולת האשכול",
    correct: false,
    feedbackEn: "Adding a node group takes minutes to provision and is better suited for sustained growth, not immediate spikes",
    feedbackHe: "הוספת קבוצת נודים לוקחת דקות להקצאה ומתאימה יותר לצמיחה מתמשכת, לא לעליות פתאומיות",
    impactEn: [{ label: "Scalability", dir: "\u2191", c: "192,132,252" }, { label: "Cost", dir: "\u2191\u2191", c: "239,68,68" }, { label: "Latency", dir: "\u2194", c: "250,204,21" }],
    impactHe: [{ label: "סקאלביליות", dir: "\u2191", c: "192,132,252" }, { label: "עלות", dir: "\u2191\u2191", c: "239,68,68" }, { label: "Latency", dir: "\u2194", c: "250,204,21" }],
  },
  {
    en: "Introduce caching", he: "הוסף שכבת קאש",
    hintEn: "Reduce backend pressure", hintHe: "הפחת עומס על ה-backend",
    correct: false,
    feedbackEn: "Caching reduces backend load but won't help if the bottleneck is CPU or memory on existing pods",
    feedbackHe: "קאש מפחית עומס על ה-backend אבל לא יעזור אם צוואר הבקבוק הוא CPU או זיכרון בפודים הקיימים",
    impactEn: [{ label: "Latency", dir: "\u2193", c: "74,222,128" }, { label: "Cost", dir: "\u2194", c: "250,204,21" }, { label: "Reliability", dir: "\u2194", c: "250,204,21" }],
    impactHe: [{ label: "Latency", dir: "\u2193", c: "74,222,128" }, { label: "עלות", dir: "\u2194", c: "250,204,21" }, { label: "אמינות", dir: "\u2194", c: "250,204,21" }],
  },
];

const CONTEXT_ITEMS = [
  { labelEn: "Cluster", labelHe: "אשכול", valueEn: "Kubernetes", valueHe: "Kubernetes" },
  { labelEn: "Traffic spike", labelHe: "עליית תעבורה", valueEn: "5\u00d7", valueHe: "5\u00d7" },
  { labelEn: "Region", labelHe: "אזור", valueEn: "us-east-1", valueHe: "us-east-1" },
];

/**
 * Architecture Scenarios preview modal.
 * Simulates the real scenario UI while gating the full feature behind a waitlist.
 */
export default function ArchScenariosPreviewModal({
  lang = "en",
  dir = "ltr",
  supabase,
  user,
  isGuest,
  onBack,
}) {
  const [interestCount, setInterestCount] = useState(null);
  const [registered, setRegistered] = useState(() => {
    try { return localStorage.getItem("arch_scenarios_interest_v1") === "1"; } catch { return false; }
  });
  const [sending, setSending] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.rpc("get_arch_scenarios_interest_count").then(({ data }) => {
      if (data?.count != null) setInterestCount(data.count);
    }).catch(() => {});
    if (!isGuest && user?.id && user.id !== "guest") {
      supabase.rpc("check_arch_scenarios_interest").then(({ data }) => {
        if (data?.registered) {
          setRegistered(true);
          try { localStorage.setItem("arch_scenarios_interest_v1", "1"); } catch {}
        }
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccess = () => {
    setRegistered(true);
    try { localStorage.setItem("arch_scenarios_interest_v1", "1"); } catch {}
    setToast({ msg: lang === "en" ? "Subscribed" : "נרשמת לעדכון", isError: false });
    setTimeout(() => setToast(null), 3000);
    supabase?.rpc("get_arch_scenarios_interest_count").then(({ data }) => {
      if (data?.count != null) setInterestCount(data.count);
    });
  };

  const onError = () => {
    setToast({ msg: lang === "en" ? "Registration failed - try again" : "ההרשמה נכשלה - נסו שוב", isError: true });
    setTimeout(() => setToast(null), 4000);
  };

  const handleNotify = () => {
    if (registered || sending) return;
    window.va?.track?.("arch_scenarios_interest_clicked", {
      user_id: user?.id || null,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.PROD ? "prod" : "dev",
    });
    if (!isGuest && user && supabase) {
      setSending(true);
      supabase.rpc("register_arch_scenarios_interest", { user_email: null }).then(({ error }) => {
        setSending(false);
        if (!error) onSuccess(); else onError();
      }).catch(() => { setSending(false); onError(); });
    } else if (supabase) {
      setEmailModal(true);
    } else {
      onError();
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const val = email.trim();
    if (!val || !val.includes("@") || !val.includes(".")) return;
    if (!supabase) return;
    setSending(true);
    supabase.rpc("register_arch_scenarios_interest", { user_email: val }).then(({ error }) => {
      setSending(false);
      if (!error) {
        setEmailModal(false);
        setEmail("");
        onSuccess();
      } else onError();
    }).catch(() => { setSending(false); onError(); });
  };

  const isEn = lang === "en";
  const sel = selectedOption !== null ? PREVIEW_OPTIONS[selectedOption] : null;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 20px", animation: "fadeIn 0.3s ease", direction: dir }}>
      {/* Back button */}
      <button onClick={onBack} style={{ background: "var(--glass-4)", border: "1px solid var(--glass-9)", color: "var(--text-secondary)", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <span aria-hidden="true">{dir === "rtl" ? "\u2192" : "\u2190"}</span>
      </button>

      {/* Main card */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 4px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.07) 0%, var(--glass-3) 50%, rgba(168,85,247,0.05) 100%)",
          border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: 20,
          padding: "22px 20px 20px",
          maxWidth: 460,
          width: "100%",
          position: "relative",
          boxShadow: "0 0 60px rgba(168,85,247,0.08), 0 0 20px rgba(168,85,247,0.04), 0 8px 32px rgba(0,0,0,0.3)",
        }}>
          {/* Header row: icon + badge */}
          <div style={{ marginBottom: 6 }}>
            <Brain size={32} strokeWidth={1.3} style={{ color: "#C084FC", filter: "drop-shadow(0 0 8px rgba(168,85,247,0.3))" }} />
          </div>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.08) 100%)",
            color: "#C084FC", fontSize: 9, fontWeight: 700, padding: "3px 12px",
            borderRadius: 20, letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase",
            border: "1px solid rgba(168,85,247,0.15)",
          }}>
            {isEn ? "Advanced Lab" : "מעבדה מתקדמת"}
          </div>

          <h2 style={{ margin: "0 0 3px", color: "var(--text-bright)", fontSize: 20, fontWeight: 900 }}>
            {isEn ? "Architecture Scenarios" : "תרחישי ארכיטקטורה"}
          </h2>
          <p style={{ margin: "0 0 1px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}>
            {isEn ? "Train real infrastructure decision making" : "אימון קבלת החלטות תשתית אמיתיות"}
          </p>
          <p style={{ margin: "0 0 10px", color: "var(--text-dim)", fontSize: 10, opacity: 0.5 }}>
            {isEn ? "Designed for DevOps and SRE engineers" : "מיועד למהנדסי DevOps ו-SRE"}
          </p>

          {/* ── Scenario simulation block ── */}
          <div style={{
            background: "rgba(168,85,247,0.03)",
            border: "1px solid rgba(168,85,247,0.12)",
            borderRadius: 14,
            padding: "12px 14px 10px",
            marginBottom: 10,
            textAlign: dir === "rtl" ? "right" : "left",
            boxShadow: "inset 0 1px 12px rgba(168,85,247,0.04)",
          }}>
            {/* Progress indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#C084FC", letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.8 }}>
                {isEn ? "Scenario Preview" : "תצוגה מקדימה"}
              </span>
              <span style={{ fontSize: 9, color: "var(--text-dim)", opacity: 0.5, fontWeight: 600 }}>
                {isEn ? "Scenario 1 of 5" : "תרחיש 1 מתוך 5"}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 2, background: "var(--glass-4)", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ width: "20%", height: "100%", background: "linear-gradient(90deg, #C084FC, rgba(168,85,247,0.4))", borderRadius: 2 }} />
            </div>

            {/* System context */}
            <div style={{
              background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 8,
              padding: "8px 10px", marginBottom: 10,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5, opacity: 0.6 }}>
                {isEn ? "System context" : "הקשר מערכתי"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
                {CONTEXT_ITEMS.map((item, i) => (
                  <span key={i} style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.6 }}>
                    <span style={{ opacity: 0.5 }}>{isEn ? item.labelEn : item.labelHe}: </span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600, fontFamily: "monospace", fontSize: 10 }}>
                      {isEn ? item.valueEn : item.valueHe}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Scenario title */}
            <p style={{ margin: "0 0 2px", color: "var(--text-bright)", fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>
              {isEn ? "K8s traffic spike hitting your cluster" : "עומס תעבורה פוגע באשכול ה-K8s שלך"}
            </p>
            <p style={{ margin: "0 0 8px", color: "var(--text-dim)", fontSize: 11, opacity: 0.55 }}>
              {isEn ? "Choose the best architectural response" : "בחר את התגובה הארכיטקטונית הטובה ביותר"}
            </p>

            {/* Options */}
            {PREVIEW_OPTIONS.map((opt, i) => {
              const isSelected = selectedOption === i;
              const hasSelection = selectedOption !== null;
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
                    padding: "7px 11px",
                    marginBottom: i < PREVIEW_OPTIONS.length - 1 ? 4 : 0,
                    cursor: hasSelection ? "default" : "pointer",
                    transition: "all 0.2s",
                    opacity: hasSelection && !isSelected ? 0.4 : 1,
                    boxShadow: isSelected
                      ? `0 0 12px ${isCorrect ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.08)"}`
                      : "none",
                  }}
                  onMouseEnter={hasSelection ? undefined : e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.35)"; e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
                  onMouseLeave={hasSelection ? undefined : e => { e.currentTarget.style.borderColor = "var(--glass-6)"; e.currentTarget.style.background = "var(--glass-3)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: 4,
                      border: isSelected
                        ? `2px solid ${isCorrect ? "rgba(74,222,128,0.7)" : "rgba(239,68,68,0.6)"}`
                        : "1px solid rgba(168,85,247,0.25)",
                      background: isSelected
                        ? (isCorrect ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.15)")
                        : "rgba(168,85,247,0.06)",
                      flexShrink: 0, transition: "all 0.2s",
                    }} />
                    <span style={{ color: isSelected ? "var(--text-bright)" : "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>
                      {isEn ? opt.en : opt.he}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 10, opacity: 0.45, marginTop: 1, paddingLeft: dir === "rtl" ? 0 : 22, paddingRight: dir === "rtl" ? 22 : 0 }}>
                    {isEn ? opt.hintEn : opt.hintHe}
                  </div>
                </div>
              );
            })}

            {/* ── Decision analysis panel ── */}
            {sel && (
              <div style={{
                marginTop: 8, padding: "10px 12px", borderRadius: 10,
                background: sel.correct ? "rgba(74,222,128,0.05)" : "rgba(239,68,68,0.04)",
                border: `1px solid ${sel.correct ? "rgba(74,222,128,0.18)" : "rgba(239,68,68,0.13)"}`,
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                    color: sel.correct ? "#4ADE80" : "#EF4444",
                  }}>
                    {isEn ? "Decision analysis" : "ניתוח החלטה"}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                    color: sel.correct ? "#4ADE80" : "#EF4444", opacity: 0.7,
                  }}>
                    {sel.correct
                      ? (isEn ? "Best choice" : "בחירה מיטבית")
                      : (isEn ? "Not optimal" : "לא אופטימלי")}
                  </span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                  {isEn ? sel.feedbackEn : sel.feedbackHe}
                </p>

                {/* Impact indicators tied to selected option */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(isEn ? sel.impactEn : sel.impactHe).map((imp, i) => (
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
            )}
          </div>

          {/* ── CTA ── */}
          <button
            disabled={registered || sending}
            onClick={handleNotify}
            style={{
              padding: "9px 30px",
              background: registered ? "var(--glass-2)" : "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.1) 100%)",
              border: `1px solid ${registered ? "var(--glass-6)" : "rgba(168,85,247,0.3)"}`,
              borderRadius: 10,
              color: registered ? "var(--text-dim)" : "#C084FC",
              fontSize: 13, fontWeight: 700,
              cursor: registered || sending ? "default" : "pointer",
              transition: "all 0.2s",
              opacity: registered ? 0.6 : sending ? 0.5 : 1,
              boxShadow: registered ? "none" : "0 0 16px rgba(168,85,247,0.1)",
            }}
            onMouseEnter={registered || sending ? undefined : e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.15) 100%)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(168,85,247,0.15)"; }}
            onMouseLeave={registered || sending ? undefined : e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.1) 100%)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(168,85,247,0.1)"; }}
          >
            {sending ? "..."
              : registered ? (isEn ? "Subscribed" : "נרשמת")
              : (isEn ? "Notify me" : "הירשם לעדכון")}
          </button>

          {/* Waitlist line */}
          {interestCount != null && interestCount > 0 ? (
            <p style={{ margin: "8px 0 0", color: "var(--text-dim)", fontSize: 11, opacity: 0.55 }}>
              {isEn
                ? `${interestCount} engineer${interestCount === 1 ? "" : "s"} waiting`
                : `${interestCount} ממתינים`}
            </p>
          ) : (
            <p style={{ margin: "8px 0 0", color: "var(--text-dim)", fontSize: 11, opacity: 0.45 }}>
              {isEn ? "Join the early access waitlist" : "הצטרפו לרשימת הגישה המוקדמת"}
            </p>
          )}

          {/* Toast */}
          {toast && (
            <div style={{
              position: "absolute", bottom: -48, left: "50%", transform: "translateX(-50%)",
              background: toast.isError ? "rgba(239,68,68,0.15)" : "var(--bg-card)",
              border: `1px solid ${toast.isError ? "rgba(239,68,68,0.3)" : "var(--glass-9)"}`,
              borderRadius: 10, padding: "8px 16px", fontSize: 12,
              color: toast.isError ? "#EF4444" : "var(--text-secondary)",
              whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              animation: "fadeIn 0.3s ease",
            }}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>

      {/* Email modal for guest users */}
      {emailModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20, animation: "fadeIn 0.2s ease" }}
          onClick={e => { if (e.target === e.currentTarget) { setEmailModal(false); setEmail(""); } }}
        >
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-8)", borderRadius: 16, padding: "28px 24px", maxWidth: 340, width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} dir={dir}>
            <h3 style={{ margin: "0 0 20px", color: "var(--text-bright)", fontSize: 16, fontWeight: 800 }}>
              {isEn ? "Get notified" : "קבלו עדכון כשהפיצ'ר ייפתח"}
            </h3>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email" name="email" inputMode="email" autoComplete="email" required autoFocus
                placeholder={isEn ? "Email" : "אימייל"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "var(--glass-3)", border: "1px solid var(--glass-9)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12, direction: "ltr", textAlign: "left" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--glass-9)"; }}
              />
              <button type="submit" disabled={sending}
                style={{ width: "100%", padding: "10px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 8, color: "#C084FC", fontSize: 13, fontWeight: 700, cursor: sending ? "wait" : "pointer", transition: "all 0.2s", opacity: sending ? 0.5 : 1 }}
                onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = "rgba(168,85,247,0.25)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; }}
              >{sending ? "..." : (isEn ? "Subscribe" : "הרשמה")}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
