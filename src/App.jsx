import { useState, useEffect } from "react";

const TOPICS = [
  {
    id: "pods", icon: "📦", name: "Pods", color: "#00D4FF",
    description: "יחידת הריצה הבסיסית ב-Kubernetes",
    theory: `Pod הוא האובייקט הקטן ביותר שניתן לפרוס ב-Kubernetes.

🔹 כל Pod מכיל קונטיינר אחד או יותר
🔹 כל הקונטיינרים ב-Pod חולקים את אותה כתובת IP
🔹 Pods הם אפמריאלים – הם נולדים ומתים
🔹 בדרך כלל לא יוצרים Pods ישירות, אלא דרך Deployments

CODE:
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: web
    image: nginx:latest
    ports:
    - containerPort: 80`,
    questions: [
      { q: "מה הוא ה-Pod ב-Kubernetes?", options: ["מסד נתונים", "יחידת הריצה הקטנה ביותר", "כלי ניהול", "רשת וירטואלית"], answer: 1, explanation: "Pod הוא יחידת הריצה הבסיסית ב-Kubernetes. הוא יכול להכיל קונטיינר אחד או יותר שחולקים משאבים." },
      { q: "מה קורה כש-Pod מת?", options: ["הוא מתאושש לבד", "הנתונים שלו נשמרים תמיד", "הוא לא חוזר – Kubernetes יוצר Pod חדש", "המערכת קורסת"], answer: 2, explanation: "Pods הם אפמריאלים. כשהם מתים, Kubernetes יוצר Pod חדש עם IP חדש. לכן משתמשים ב-Services." },
      { q: "האם ניתן להריץ כמה קונטיינרים באותו Pod?", options: ["לא, רק קונטיינר אחד", "כן, והם חולקים IP ו-storage", "כן, אבל עם IPs שונים", "רק ב-production"], answer: 1, explanation: "ניתן להריץ כמה קונטיינרים ב-Pod. הם חולקים את אותה כתובת IP ויכולים לתקשר דרך localhost." }
    ]
  },
  {
    id: "deployments", icon: "🚀", name: "Deployments", color: "#FF6B35",
    description: "ניהול פריסה ועדכון של אפליקציות",
    theory: `Deployment מנהל קבוצת Pods זהים ומבטיח שמספר מסוים תמיד רץ.

🔹 מגדיר כמה replicas (עותקים) לרוץ
🔹 מאפשר rolling updates ללא downtime
🔹 מאפשר rollback לגרסה קודמת
🔹 עוטף ReplicaSet שעוטף Pods

CODE:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
      - name: web
        image: my-app:v2`,
    questions: [
      { q: "מה היתרון של Deployment על פני יצירת Pods ישירות?", options: ["זה זול יותר", "הוא מנהל replicas ומאפשר rolling updates", "הוא מהיר יותר", "אין הבדל"], answer: 1, explanation: "Deployment מנהל את מחזור חיי ה-Pods, מבטיח שמספר הרצוי של replicas רץ תמיד, ומאפשר עדכונים ללא downtime." },
      { q: "מה קורה כש-Pod נכשל ב-Deployment?", options: ["כל ה-Deployment נכשל", "Kubernetes מוחק אותו ויוצר Pod חדש", "המשתמש מקבל שגיאה", "המערכת מחכה"], answer: 1, explanation: "ה-Deployment Controller מגלה שיש חוסר ב-replicas ויוצר Pod חדש אוטומטית. זה ה-self-healing של Kubernetes!" },
      { q: "כיצד מבצעים rollback ב-Kubernetes?", options: ["kubectl delete deployment", "kubectl rollout undo deployment/my-app", "kubectl restart pod", "אין אפשרות לrollback"], answer: 1, explanation: "הפקודה kubectl rollout undo מחזירה את ה-Deployment לגרסה הקודמת. Kubernetes שומר היסטוריה של עדכונים." }
    ]
  },
  {
    id: "services", icon: "🌐", name: "Services", color: "#A855F7",
    description: "רשת יציבה לגישה ל-Pods",
    theory: `Service מספק כתובת IP יציבה וגישה לקבוצת Pods.

🔹 ClusterIP – גישה פנימית בתוך ה-cluster
🔹 NodePort – חשיפה על port בכל node
🔹 LoadBalancer – יוצר Load Balancer ב-cloud
🔹 משתמש ב-labels selectors למצוא Pods

CODE:
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP`,
    questions: [
      { q: "למה צריך Service אם יש לנו Pod עם IP?", options: ["לחיסכון בעלויות", "כי IP של Pod משתנה כשהוא מת, Service מספק IP יציב", "זה רק לחוץ לCluster", "אין סיבה"], answer: 1, explanation: "כל פעם שPod מת ונוצר מחדש, הוא מקבל IP חדש. Service מספק כתובת יציבה שמנתבת תנועה לPods הרלוונטיים." },
      { q: "איזה סוג Service מתאים לגישה מחוץ לCluster ב-cloud?", options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"], answer: 2, explanation: "LoadBalancer Service יוצר אוטומטית Load Balancer ב-cloud provider ומקצה IP חיצוני." },
      { q: "כיצד Service מוצא את הPods שלו?", options: ["לפי שם", "לפי כתובת IP", "לפי labels selectors", "לפי namespace"], answer: 2, explanation: "Service משתמש ב-label selectors – הוא מנתב תנועה לכל Pod שיש לו את הlabels המתאימים." }
    ]
  },
  {
    id: "namespaces", icon: "🏠", name: "Namespaces", color: "#10B981",
    description: "בידוד וארגון משאבים בCluster",
    theory: `Namespace הוא מנגנון לבידוד לוגי של משאבים בתוך Cluster.

🔹 כמו תיקיות בתוך ה-Cluster
🔹 מאפשר להפריד בין dev, staging, production
🔹 ניתן להגדיר ResourceQuotas לכל namespace
🔹 ברירת המחדל: default, kube-system, kube-public

CODE:
kubectl create namespace production
kubectl run nginx --image=nginx -n production
kubectl get pods -n production
kubectl get pods --all-namespaces`,
    questions: [
      { q: "מה מטרת ה-Namespace?", options: ["לאחסן קבצים", "לבדד ולארגן משאבים לוגית", "לניהול passwords", "לglobal DNS"], answer: 1, explanation: "Namespaces מספקים בידוד לוגי – ניתן להפריד בין צוותים, פרויקטים, או סביבות באותו Cluster." },
      { q: "מה Namespace ברירת המחדל לPods ללא ציון Namespace?", options: ["kube-system", "production", "default", "main"], answer: 2, explanation: "ה-Namespace 'default' הוא ברירת המחדל. kube-system משמש למשאבי המערכת של Kubernetes עצמו." }
    ]
  },
  {
    id: "configmaps", icon: "⚙️", name: "ConfigMaps & Secrets", color: "#F59E0B",
    description: "ניהול קונפיגורציה ומידע רגיש",
    theory: `ConfigMap מאחסן הגדרות קונפיגורציה. Secret לנתונים רגישים (מוצפן).

🔹 מאפשר להפריד קוד מקונפיגורציה
🔹 ניתן לטעון כenv variables או כvolumes
🔹 Secrets מוצפנים ומוגנים בגישה

CODE:
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_URL: "postgres://db:5432"
  MAX_CONNECTIONS: "100"`,
    questions: [
      { q: "מה ההבדל בין ConfigMap ל-Secret?", options: ["אין הבדל", "Secret מוצפן ומיועד לנתונים רגישים", "ConfigMap יותר מהיר", "Secret רק לpasswords"], answer: 1, explanation: "Secret מוצפן ומיועד לנתונים רגישים (passwords, tokens). ConfigMap לקונפיגורציה רגילה." },
      { q: "כיצד ניתן להשתמש ב-ConfigMap ב-Pod?", options: ["רק כקובץ", "רק כenv variable", "כenv variables או כvolume files", "לא ניתן"], answer: 2, explanation: "ConfigMap ניתן לטעון כenv variables, כvolume עם קבצים, או לגשת אליו דרך Kubernetes API." }
    ]
  }
];

const ACHIEVEMENTS = [
  { id: "first", icon: "🌱", name: "ראשית הדרך", condition: s => s.totalAnswered >= 1 },
  { id: "streak3", icon: "🔥", name: "שלושה ברצף", condition: s => s.maxStreak >= 3 },
  { id: "perfect", icon: "⭐", name: "ביצוע מושלם", condition: s => s.perfectTopics >= 1 },
  { id: "allTopics", icon: "🏆", name: "מאסטר K8s", condition: s => s.completedTopics >= 5 },
];

export default function K8sLearnApp() {
  const [screen, setScreen] = useState("home");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicScreen, setTopicScreen] = useState("theory");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [topicCorrect, setTopicCorrect] = useState(0);
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0, maxStreak: 0, currentStreak: 0, perfectTopics: 0, completedTopics: 0 });
  const [completedTopics, setCompletedTopics] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const newOnes = ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id) && a.condition(stats));
    if (newOnes.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newOnes.map(a => a.id)]);
      setNewAchievement(newOnes[0]);
      setTimeout(() => setNewAchievement(null), 3000);
    }
  }, [stats]);

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    const correct = idx === selectedTopic.questions[questionIndex].answer;
    if (correct) {
      setTopicCorrect(prev => prev + 1);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    setStats(prev => {
      const streak = correct ? prev.currentStreak + 1 : 0;
      return {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
        currentStreak: streak,
        maxStreak: Math.max(prev.maxStreak, streak)
      };
    });
  };

  const nextQuestion = () => {
    const isLast = questionIndex >= selectedTopic.questions.length - 1;
    if (isLast) {
      const lastCorrect = selectedAnswer === selectedTopic.questions[questionIndex].answer;
      const finalCorrect = topicCorrect + (lastCorrect ? 1 : 0);
      const allCorrect = finalCorrect === selectedTopic.questions.length;
      const newCompleted = { ...completedTopics, [selectedTopic.id]: { correct: finalCorrect, total: selectedTopic.questions.length } };
      setCompletedTopics(newCompleted);
      setStats(prev => ({
        ...prev,
        completedTopics: Object.keys(newCompleted).length,
        perfectTopics: allCorrect ? prev.perfectTopics + 1 : prev.perfectTopics
      }));
      setScreen("topicComplete");
    } else {
      setQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const startTopic = (topic) => {
    setSelectedTopic(topic);
    setTopicScreen("theory");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTopicCorrect(0);
    setScreen("topic");
  };

  const accuracy = stats.totalAnswered > 0 ? Math.round(stats.totalCorrect / stats.totalAnswered * 100) : 0;

  const renderTheory = (text) => {
    let inCode = false;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('CODE:')) {
        inCode = true;
        return <div key={i} style={{ color: "#00D4FF", fontSize: 10, fontWeight: 800, marginTop: 14, marginBottom: 6, letterSpacing: 2, opacity: 0.7 }}>YAML / BASH</div>;
      }
      if (inCode) {
        return <div key={i} style={{ fontFamily: "monospace", fontSize: 11, color: "#7dd3fc", lineHeight: 1.8, whiteSpace: "pre" }}>{line}</div>;
      }
      if (line.startsWith('🔹')) {
        return <div key={i} style={{ color: "#94a3b8", fontSize: 13, marginBottom: 5, paddingRight: 4 }}>{line}</div>;
      }
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{line}</div>;
    });
  };

  const hebrewLetters = ['א', 'ב', 'ג', 'ד'];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #020817 0%, #0f172a 60%, #020817 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      direction: "rtl",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0%,100% { transform:scale(1); } 50% { transform:scale(1.12); } }
        @keyframes toast { from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes correctFlash {
          0% { opacity:0; } 30% { opacity:1; } 100% { opacity:0; }
        }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-3px); }
        .opt-btn { transition: border-color 0.15s, background 0.15s, transform 0.1s; }
        .opt-btn:hover { transform: translateX(-2px); }
      `}</style>

      {/* BG subtle grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)",
        backgroundSize: "48px 48px"
      }} />

      {/* Correct answer flash */}
      {flash && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 800,
          background: "radial-gradient(circle at 50% 45%, rgba(16,185,129,0.14) 0%, transparent 60%)",
          animation: "correctFlash 0.6s ease forwards"
        }} />
      )}

      {/* Achievement toast */}
      {newAchievement && (
        <div style={{
          position: "fixed", top: 16, left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#1e293b,#0f172a)",
          border: "1px solid #00D4FF55",
          borderRadius: 14, padding: "12px 22px",
          display: "flex", alignItems: "center", gap: 12,
          zIndex: 9999, boxShadow: "0 0 40px rgba(0,212,255,0.3)",
          animation: "toast 0.4s ease"
        }}>
          <span style={{ fontSize: 26 }}>{newAchievement.icon}</span>
          <div>
            <div style={{ color: "#00D4FF", fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>הישג חדש נפתח!</div>
            <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>{newAchievement.name}</div>
          </div>
        </div>
      )}

      {/* HOME SCREEN */}
      {screen === "home" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 58, marginBottom: 10, display: "inline-block", animation: "popIn 3s ease infinite" }}>☸️</div>
            <h1 style={{
              fontSize: 42, fontWeight: 900, margin: "0 0 6px",
              background: "linear-gradient(90deg,#00D4FF,#A855F7,#FF6B35,#00D4FF)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundSize: "300% auto", animation: "shine 5s linear infinite"
            }}>K8s Quest</h1>
            <p style={{ color: "#475569", fontSize: 15, margin: 0 }}>למד Kubernetes בצורה כיפית ואינטראקטיבית</p>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
            {[
              { label: "נושאים", value: `${Object.keys(completedTopics).length}/${TOPICS.length}`, icon: "📚", color: "#00D4FF" },
              { label: "דיוק", value: `${accuracy}%`, icon: "🎯", color: "#10B981" },
              { label: "רצף", value: String(stats.currentStreak), icon: "🔥", color: "#FF6B35" }
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "14px 10px", textAlign: "center"
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Topic cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {TOPICS.map(topic => {
              const done = completedTopics[topic.id];
              const perfect = done && done.correct === done.total;
              return (
                <div key={topic.id} className="card-hover" onClick={() => startTopic(topic)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: done ? `rgba(255,255,255,0.04)` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${done ? topic.color + "44" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 14, padding: "16px 18px",
                  boxShadow: done ? `0 0 20px ${topic.color}14` : "none"
                }}>
                  <div style={{
                    fontSize: 26, width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: `${topic.color}14`, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${topic.color}22`
                  }}>{topic.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 15 }}>{topic.name}</span>
                      {done && (
                        <span style={{
                          fontSize: 11, color: perfect ? "#F59E0B" : topic.color,
                          background: perfect ? "rgba(245,158,11,0.15)" : `${topic.color}18`,
                          padding: "2px 8px", borderRadius: 20, fontWeight: 700
                        }}>
                          {perfect ? "⭐" : "✓"} {done.correct}/{done.total}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: "#475569", fontSize: 12 }}>{topic.description}</p>
                  </div>
                  <span style={{ color: topic.color, fontSize: 16, opacity: 0.7 }}>←</span>
                </div>
              );
            })}
          </div>

          {/* Achievements */}
          {unlockedAchievements.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 12, padding: "14px 18px"
            }}>
              <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>🏅 הישגים</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id)).map(a => (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.04)", borderRadius: 20,
                    padding: "5px 12px", fontSize: 12, color: "#94a3b8"
                  }}>
                    <span>{a.icon}</span>{a.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOPIC SCREEN */}
      {screen === "topic" && selectedTopic && (
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "28px 20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <button onClick={() => setScreen("home")} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              color: "#64748b", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13
            }}>→ חזור</button>
            <span style={{ fontSize: 20 }}>{selectedTopic.icon}</span>
            <h2 style={{ margin: 0, color: selectedTopic.color, fontSize: 18, fontWeight: 800 }}>{selectedTopic.name}</h2>
          </div>

          {topicScreen === "theory" ? (
            <div>
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "22px", marginBottom: 18
              }}>
                <div style={{ fontSize: 11, color: selectedTopic.color, fontWeight: 800, marginBottom: 16, letterSpacing: 1 }}>📖 תיאוריה</div>
                <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "16px 20px" }}>
                  {renderTheory(selectedTopic.theory)}
                </div>
              </div>
              <button onClick={() => setTopicScreen("quiz")} style={{
                width: "100%", padding: "15px",
                background: `linear-gradient(135deg, ${selectedTopic.color}dd, ${selectedTopic.color}77)`,
                border: "none", borderRadius: 12, color: "#fff",
                fontSize: 15, fontWeight: 800, cursor: "pointer",
                boxShadow: `0 6px 24px ${selectedTopic.color}44`
              }}>🎯 התחל חידון!</button>
            </div>
          ) : (
            <div>
              {/* Progress bar */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#475569", fontSize: 12 }}>שאלה {questionIndex + 1} / {selectedTopic.questions.length}</span>
                  <span style={{ color: stats.currentStreak > 0 ? "#FF6B35" : "#475569", fontSize: 12, fontWeight: stats.currentStreak > 0 ? 700 : 400 }}>
                    {stats.currentStreak > 0 ? `🔥 רצף: ${stats.currentStreak}` : "רצף: 0"}
                  </span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${(questionIndex / selectedTopic.questions.length) * 100}%`,
                    background: `linear-gradient(90deg, ${selectedTopic.color}, ${selectedTopic.color}88)`,
                    transition: "width 0.4s ease"
                  }} />
                </div>
              </div>

              {/* Question card */}
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "22px", marginBottom: 14
              }}>
                <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, lineHeight: 1.65 }}>
                  {selectedTopic.questions[questionIndex].q}
                </div>
              </div>

              {/* Answer options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
                {selectedTopic.questions[questionIndex].options.map((opt, i) => {
                  const isCorrect = i === selectedTopic.questions[questionIndex].answer;
                  const isChosen = i === selectedAnswer;
                  let borderColor = "rgba(255,255,255,0.09)";
                  let bg = "rgba(255,255,255,0.02)";
                  let color = "#94a3b8";
                  if (selectedAnswer !== null) {
                    if (isCorrect) { borderColor = "#10B981"; bg = "rgba(16,185,129,0.1)"; color = "#10B981"; }
                    else if (isChosen) { borderColor = "#EF4444"; bg = "rgba(239,68,68,0.1)"; color = "#EF4444"; }
                  }
                  return (
                    <button
                      key={i}
                      className={selectedAnswer === null ? "opt-btn" : ""}
                      onClick={() => handleAnswer(i)}
                      style={{
                        width: "100%", textAlign: "right", padding: "13px 16px",
                        background: bg, border: `1px solid ${borderColor}`,
                        borderRadius: 10, color, fontSize: 14,
                        cursor: selectedAnswer !== null ? "default" : "pointer",
                        fontFamily: "inherit", lineHeight: 1.5, display: "flex", alignItems: "center", gap: 10
                      }}
                    >
                      <span style={{ opacity: 0.4, fontSize: 12, flexShrink: 0 }}>{hebrewLetters[i]}.</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {selectedAnswer !== null && isCorrect && <span style={{ flexShrink: 0 }}>✓</span>}
                      {selectedAnswer !== null && isChosen && !isCorrect && <span style={{ flexShrink: 0 }}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <div style={{
                    background: selectedAnswer === selectedTopic.questions[questionIndex].answer ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${selectedAnswer === selectedTopic.questions[questionIndex].answer ? "#10B98130" : "#EF444430"}`,
                    borderRadius: 12, padding: "14px 16px", marginBottom: 12
                  }}>
                    <div style={{
                      fontWeight: 800, fontSize: 13, marginBottom: 6,
                      color: selectedAnswer === selectedTopic.questions[questionIndex].answer ? "#10B981" : "#EF4444"
                    }}>
                      {selectedAnswer === selectedTopic.questions[questionIndex].answer ? "✅ נכון!" : "❌ לא נכון"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
                      {selectedTopic.questions[questionIndex].explanation}
                    </div>
                  </div>
                  <button onClick={nextQuestion} style={{
                    width: "100%", padding: "14px",
                    background: `linear-gradient(135deg, ${selectedTopic.color}cc, ${selectedTopic.color}77)`,
                    border: "none", borderRadius: 12, color: "#fff",
                    fontSize: 14, fontWeight: 800, cursor: "pointer"
                  }}>
                    {questionIndex >= selectedTopic.questions.length - 1 ? "🎉 סיים נושא!" : "שאלה הבאה ←"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMPLETE SCREEN */}
      {screen === "topicComplete" && selectedTopic && (
        <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 20px", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
          {(() => {
            const result = completedTopics[selectedTopic.id];
            const perfect = result && result.correct === result.total;
            return (
              <>
                <div style={{ fontSize: 72, marginBottom: 14 }}>{perfect ? "🌟" : "✅"}</div>
                <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: selectedTopic.color }}>
                  {selectedTopic.name} – הושלם!
                </h2>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10,
                  background: "rgba(255,255,255,0.04)", borderRadius: 30, padding: "8px 20px"
                }}>
                  <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>
                    {result?.correct}/{result?.total} נכון
                  </span>
                  {perfect && <span style={{ color: "#F59E0B", fontSize: 13, fontWeight: 700 }}>⭐ מושלם!</span>}
                </div>
                <p style={{ color: "#475569", marginBottom: 28, fontSize: 14 }}>
                  {perfect ? "ביצוע מושלם! אתה בדרך הנכונה" : "כל אחד לומד בקצבו שלו – נסה שוב!"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => startTopic(selectedTopic)} style={{
                    padding: "13px", background: `${selectedTopic.color}18`,
                    border: `1px solid ${selectedTopic.color}40`, borderRadius: 12,
                    color: selectedTopic.color, fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}>🔄 נסה שוב</button>
                  <button onClick={() => setScreen("home")} style={{
                    padding: "13px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12,
                    color: "#e2e8f0", fontSize: 14, fontWeight: 700, cursor: "pointer"
                  }}>→ חזור לנושאים</button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
