#!/usr/bin/env node
/**
 * Adds hint fields to quiz questions in topics.js and dailyQuestions.js.
 *
 * Strategy: Generate interview-style hints that guide thinking without
 * revealing the answer. Uses question tags, question text keywords, and
 * the topic context to create short nudge-style hints.
 */

import { readFileSync, writeFileSync } from 'fs';

// ── Hint generation maps ─────────────────────────────────────────────────────
// Map from tags to Hebrew/English hint pairs
const TAG_HINTS = {
  // Workloads
  "pod-architecture":     ["חשבו על איך קונטיינרים מאורגנים ורצים יחד.", "Think about how containers are grouped and run together."],
  "controller-hierarchy": ["חשבו על מי אחראי לשמור על מספר העותקים הרצוי.", "Think about what ensures the desired number of copies keeps running."],
  "cronjob-hierarchy":    ["חשבו על ההבדל בין משימה חד-פעמית למשימה חוזרת.", "Think about one-time tasks vs. recurring schedules."],
  "restart-policy":       ["חשבו על מה קורה אחרי שקונטיינר מפסיק לרוץ.", "Think about what happens after a container stops."],
  "namespace-isolation":  ["חשבו על איך מפרידים בין סביבות וצוותים.", "Think about how environments and teams are separated."],
  "rolling-update":       ["חשבו על איך מעדכנים בלי להפיל את השירות.", "Think about updating without taking the service down."],
  "statefulset-vs-deployment": ["חשבו על עומסים שצריכים זהות קבועה לכל עותק.", "Think about workloads that need a stable identity per instance."],
  "pod-disruption":       ["חשבו על הגנה על זמינות בזמן תחזוקה.", "Think about protecting availability during maintenance."],
  "taints-tolerations":   ["חשבו על איך Node דוחה או מקבל Pods.", "Think about how a Node repels or accepts Pods."],
  "qos-eviction":         ["חשבו על סדר העדיפויות כשמשאבים אוזלים.", "Think about the priority order when resources run low."],
  "topology-spread":      ["חשבו על פיזור עומסים למניעת נקודת כשל.", "Think about spreading workloads to avoid a single point of failure."],
  "daemonset-topology":   ["חשבו על מה רץ בדיוק פעם אחת על כל Node.", "Think about what runs exactly once on every Node."],
  "hpa-scaling":          ["חשבו על מה מודד את העומס ומחליט מתי להרחיב.", "Think about what measures load and decides when to scale."],

  // Networking
  "service-discovery":    ["חשבו על איך Pods מגלים ומתחברים אחד לשני.", "Think about how Pods discover and connect to each other."],
  "dns-flow":             ["חשבו על מי מתרגם שמות שירותים לכתובות.", "Think about what translates service names into addresses."],
  "ingress-routing":      ["חשבו על איך בקשות מבחוץ מגיעות לשירות הנכון.", "Think about how external requests reach the right service."],
  "network-policy-flow":  ["חשבו על כללי allow/deny ברמת הרשת.", "Think about network-level allow/deny rules."],
  "service-types":        ["חשבו על איך שירותים נחשפים פנימית וחיצונית.", "Think about how services are exposed internally vs externally."],
  "cni-plugin":           ["חשבו על מי מנהל את הרשת בין Pods.", "Think about what manages networking between Pods."],

  // Cluster Ops
  "controlplane-components": ["חשבו על הרכיבים שמנהלים את ה-Cluster.", "Think about the components that manage the Cluster."],
  "etcd-ha":              ["חשבו על איך נשמר ה-state של ה-Cluster.", "Think about how the Cluster state is stored and protected."],
  "rbac-binding":         ["חשבו על חיבור בין הרשאות לזהויות.", "Think about connecting permissions to identities."],
  "kubeconfig-context":   ["חשבו על איך kubectl יודע לאיזה Cluster להתחבר.", "Think about how kubectl knows which Cluster to connect to."],
  "upgrade-strategy":     ["חשבו על סדר השדרוג של רכיבי ה-Cluster.", "Think about the order of upgrading Cluster components."],
  "drain-cordon":         ["חשבו על הכנת Node לתחזוקה.", "Think about preparing a Node for maintenance."],

  // Config & Security
  "config-mount":         ["חשבו על איך הגדרות מגיעות לתוך הקונטיינר.", "Think about how configuration gets into the container."],
  "configmap-vs-secret":  ["חשבו על ההבדל בין מידע רגיל למידע רגיש.", "Think about the difference between regular and sensitive data."],
  "imagepull-flow":       ["חשבו על מה צריך כדי למשוך image ממקור מוגן.", "Think about what is needed to pull an image from a private source."],
  "psa-admission":        ["חשבו על מי מאשר או דוחה Pods לפני יצירה.", "Think about what approves or rejects Pods before creation."],
  "limitrange-vs-quota":  ["חשבו על הגבלות ברמת ה-namespace.", "Think about namespace-level resource restrictions."],

  // Storage
  "storage-binding":      ["חשבו על הקשר בין בקשת אחסון להקצאת דיסק.", "Think about the relationship between a storage request and disk allocation."],
  "helm-chart":           ["חשבו על ניהול חבילות של משאבי Kubernetes.", "Think about managing packages of Kubernetes resources."],
  "reclaim-policy":       ["חשבו על מה קורה לדיסק כשמפסיקים להשתמש בו.", "Think about what happens to a disk when it is no longer used."],
  "volume-lifecycle":     ["חשבו על אורך החיים של אחסון ביחס ל-Pod.", "Think about how long storage lives relative to a Pod."],

  // Troubleshooting
  "probe-comparison":     ["חשבו על סוגי בדיקות בריאות ומה כל אחת גורמת.", "Think about the types of health checks and what each triggers."],
  "crashloop-flow":       ["חשבו על איך לחקור קונטיינר שקורס שוב ושוב.", "Think about how to investigate a container that keeps crashing."],
  "oom-killed":           ["חשבו על מה קורה כשקונטיינר צורך יותר מדי זיכרון.", "Think about what happens when a container uses too much memory."],
  "statefulset-storage":  ["חשבו על אתגרי אחסון כש-Pods זזים בין Nodes.", "Think about storage challenges when Pods move between Nodes."],

  // Linux
  "process-signals":      ["חשבו על איך מערכת ההפעלה מתקשרת עם תהליכים.", "Think about how the OS communicates with processes."],
  "file-permissions":     ["חשבו על מי יכול לקרוא, לכתוב, ולהריץ קבצים.", "Think about who can read, write, and execute files."],
  "systemd-management":   ["חשבו על מי מנהל שירותים ברמת המערכת.", "Think about what manages system-level services."],
  "network-diagnostics":  ["חשבו על כלים לאבחון בעיות רשת.", "Think about tools for diagnosing network issues."],
  "disk-management":      ["חשבו על ניהול שטח דיסק ומערכות קבצים.", "Think about managing disk space and file systems."],
  "memory-management":    ["חשבו על איך מערכת ההפעלה מנהלת זיכרון.", "Think about how the OS manages memory."],
  "linux-namespaces":     ["חשבו על בידוד תהליכים ברמת הקרנל.", "Think about kernel-level process isolation."],
  "cgroup-resources":     ["חשבו על הגבלת משאבים לקבוצות תהליכים.", "Think about limiting resources for groups of processes."],

  // Argo
  "argo-sync":            ["חשבו על סנכרון בין Git לבין ה-Cluster.", "Think about syncing Git state to the Cluster."],
  "argo-app-structure":   ["חשבו על איך ArgoCD מגדיר אפליקציה.", "Think about how ArgoCD defines an application."],
  "argo-health":          ["חשבו על איך ArgoCD מעריך את מצב המשאבים.", "Think about how ArgoCD evaluates resource status."],
  "argo-rollback":        ["חשבו על חזרה לגרסה קודמת דרך Git.", "Think about reverting to a previous version through Git."],
  "argo-multi-env":       ["חשבו על ניהול סביבות מרובות מ-repo אחד.", "Think about managing multiple environments from one repo."],
  "gitops-flow":          ["חשבו על Git כמקור האמת להגדרות.", "Think about Git as the source of truth for configuration."],
  "argo-projects":        ["חשבו על הגבלת גישה וסביבות ב-ArgoCD.", "Think about restricting access and environments in ArgoCD."],
  "argo-hooks":           ["חשבו על פעולות שרצות לפני או אחרי סנכרון.", "Think about actions that run before or after sync."],
  "argo-waves":           ["חשבו על סדר יצירת משאבים בסנכרון.", "Think about the order of resource creation during sync."],
};

// Generic question-pattern hints for questions without tags
const QUESTION_PATTERN_HINTS_HE = [
  [/liveness probe/i,     "חשבו על מה קורה כשקונטיינר מפסיק להגיב."],
  [/readiness probe/i,    "חשבו על מה קובע אם Pod מוכן לקבל בקשות."],
  [/resource request/i,   "חשבו על איך ה-Scheduler מחליט היכן למקם Pod."],
  [/resource limit/i,     "חשבו על מה קובע את התקרה לצריכת משאבים."],
  [/ephemeral container/i,"חשבו על איך עושים debug ל-Pod שכבר רץ."],
  [/init container/i,     "חשבו על מה שצריך לקרות לפני שה-Pod הראשי עולה."],
  [/sidecar/i,            "חשבו על דפוס של קונטיינרים שרצים לצד הראשי."],
  [/CrashLoopBackOff/i,   "חשבו על איך לחקור Pod שקורס שוב ושוב."],
  [/OOMKill/i,            "חשבו על מה קורה כשתהליך חורג ממגבלת הזיכרון."],
  [/ImagePull/i,          "חשבו על מה נדרש כדי להוריד image בהצלחה."],
  [/Pending/i,            "חשבו על מה מונע מה-Scheduler לשבץ את ה-Pod."],
  [/NotReady/i,           "חשבו על מה גורם ל-Node להפסיק לקבל עומסים."],
  [/Terminating/i,        "חשבו על מה מעכב את סיום מחיקת המשאב."],
  [/ConfigMap/i,          "חשבו על איך הגדרות חיצוניות מגיעות ל-Pod."],
  [/Secret/i,             "חשבו על אחסון והזרקה של מידע רגיש."],
  [/ServiceAccount/i,     "חשבו על זהות ה-Pod מול ה-API server."],
  [/RBAC/i,               "חשבו על חיבור בין הרשאות, תפקידים וזהויות."],
  [/NetworkPolicy/i,      "חשבו על כללי תעבורה ברמת הרשת בתוך Cluster."],
  [/Ingress/i,            "חשבו על ניתוב בקשות מבחוץ לשירותים פנימיים."],
  [/DNS/i,                "חשבו על תרגום שמות לכתובות בתוך ה-Cluster."],
  [/Service.*ClusterIP/i, "חשבו על חשיפה פנימית של שירותים בתוך ה-Cluster."],
  [/Service.*NodePort/i,  "חשבו על חשיפת שירות על port של ה-Node."],
  [/Service.*LoadBalancer/i,"חשבו על חשיפה חיצונית עם כתובת IP ייעודית."],
  [/PV|PersistentVolume/i,"חשבו על הקצאת אחסון שנשמר מעבר לחיי Pod."],
  [/PVC|PersistentVolumeClaim/i,"חשבו על בקשת אחסון מתוך ה-Pod."],
  [/StorageClass/i,       "חשבו על הגדרת סוג ואיכות האחסון."],
  [/Helm/i,               "חשבו על כלי לניהול חבילות של משאבי Kubernetes."],
  [/etcd/i,               "חשבו על מאגר המידע של ה-Cluster."],
  [/kubectl/i,            "חשבו על הפקודה ומה היא עושה מאחורי הקלעים."],
  [/DaemonSet/i,          "חשבו על עומס שחייב לרוץ על כל Node."],
  [/StatefulSet/i,        "חשבו על עומסים שצריכים זהות ואחסון קבועים."],
  [/HPA|autoscal/i,       "חשבו על התאמת כמות העותקים לפי עומס."],
  [/drain/i,              "חשבו על פינוי Node לתחזוקה."],
  [/taint/i,              "חשבו על סימון Node כדי להגביל מי רץ עליו."],
  [/affinity/i,           "חשבו על כללי העדפה למיקום Pods."],
  [/QoS/i,               "חשבו על סדר העדיפויות של Pods בלחץ משאבים."],
  [/PodDisruptionBudget/i,"חשבו על הבטחת זמינות מינימלית בזמן שינויים."],
  [/rollout|rollback/i,   "חשבו על ניהול גרסאות והחזרה לאחור."],
  [/Argo/i,               "חשבו על GitOps וסנכרון Git עם ה-Cluster."],
  [/securityContext/i,    "חשבו על הגדרות אבטחה ברמת הקונטיינר."],
  [/ResourceQuota/i,      "חשבו על מגבלות משאבים ברמת ה-namespace."],
  [/LimitRange/i,         "חשבו על ברירות מחדל ומגבלות לכל Pod חדש."],
  [/kubeconfig/i,         "חשבו על איך kubectl מתחבר ל-Cluster."],
  [/systemctl|systemd/i,  "חשבו על ניהול שירותים ברמת מערכת ההפעלה."],
  [/chmod|permission/i,   "חשבו על הרשאות קבצים ובעלות."],
  [/iptables|firewall/i,  "חשבו על סינון תעבורת רשת ברמת ה-kernel."],
  [/cgroup/i,             "חשבו על הגבלת משאבים לתהליכים."],
  [/namespace.*linux/i,   "חשבו על בידוד תהליכים ברמת ה-kernel."],
  [/signal|SIGTERM|SIGKILL/i, "חשבו על איך מערכת ההפעלה מבקשת מתהליך לצאת."],
  [/exit code/i,          "חשבו על מה מספר היציאה מספר על סיבת הסיום."],
];

const QUESTION_PATTERN_HINTS_EN = [
  [/liveness probe/i,     "Think about what happens when a container becomes unresponsive."],
  [/readiness probe/i,    "Think about what determines if a Pod can receive requests."],
  [/resource request/i,   "Think about how the Scheduler decides where to place a Pod."],
  [/resource limit/i,     "Think about what sets the ceiling on resource consumption."],
  [/ephemeral container/i,"Think about how to debug a running Pod without restarting it."],
  [/init container/i,     "Think about what must happen before the main container starts."],
  [/sidecar/i,            "Think about containers that run alongside the main workload."],
  [/CrashLoopBackOff/i,   "Think about how to investigate a Pod that keeps crashing."],
  [/OOMKill/i,            "Think about what happens when a process exceeds its memory limit."],
  [/ImagePull/i,          "Think about what is needed to successfully download an image."],
  [/Pending/i,            "Think about what prevents the Scheduler from placing the Pod."],
  [/NotReady/i,           "Think about what causes a Node to stop accepting workloads."],
  [/Terminating/i,        "Think about what blocks resource deletion from completing."],
  [/ConfigMap/i,          "Think about how external configuration reaches a Pod."],
  [/Secret/i,             "Think about storing and injecting sensitive data."],
  [/ServiceAccount/i,     "Think about the Pod's identity when talking to the API server."],
  [/RBAC/i,               "Think about linking permissions, roles, and identities."],
  [/NetworkPolicy/i,      "Think about network-level traffic rules inside the Cluster."],
  [/Ingress/i,            "Think about routing external requests to internal services."],
  [/DNS/i,                "Think about name-to-address translation inside the Cluster."],
  [/Service.*ClusterIP/i, "Think about internal service exposure within the Cluster."],
  [/Service.*NodePort/i,  "Think about exposing a service on a Node's port."],
  [/Service.*LoadBalancer/i,"Think about external exposure with a dedicated IP."],
  [/PV|PersistentVolume/i,"Think about storage that persists beyond a Pod's lifetime."],
  [/PVC|PersistentVolumeClaim/i,"Think about how a Pod requests storage."],
  [/StorageClass/i,       "Think about defining the type and quality of storage."],
  [/Helm/i,               "Think about a package manager for Kubernetes resources."],
  [/etcd/i,               "Think about the Cluster's data store."],
  [/kubectl/i,            "Think about what the command does behind the scenes."],
  [/DaemonSet/i,          "Think about a workload that must run on every Node."],
  [/StatefulSet/i,        "Think about workloads needing stable identity and storage."],
  [/HPA|autoscal/i,       "Think about adjusting replica count based on load."],
  [/drain/i,              "Think about evacuating a Node for maintenance."],
  [/taint/i,              "Think about marking a Node to restrict what runs on it."],
  [/affinity/i,           "Think about placement preference rules for Pods."],
  [/QoS/i,               "Think about Pod priority order under resource pressure."],
  [/PodDisruptionBudget/i,"Think about guaranteeing minimum availability during changes."],
  [/rollout|rollback/i,   "Think about managing versions and reverting changes."],
  [/Argo/i,               "Think about GitOps and syncing Git state with the Cluster."],
  [/securityContext/i,    "Think about security settings at the container level."],
  [/ResourceQuota/i,      "Think about namespace-level resource limits."],
  [/LimitRange/i,         "Think about defaults and constraints for new Pods."],
  [/kubeconfig/i,         "Think about how kubectl connects to a Cluster."],
  [/systemctl|systemd/i,  "Think about managing system-level services."],
  [/chmod|permission/i,   "Think about file permissions and ownership."],
  [/iptables|firewall/i,  "Think about kernel-level network traffic filtering."],
  [/cgroup/i,             "Think about limiting resources for processes."],
  [/namespace.*linux/i,   "Think about kernel-level process isolation."],
  [/signal|SIGTERM|SIGKILL/i, "Think about how the OS asks a process to exit."],
  [/exit code/i,          "Think about what the exit number tells you about the cause."],
];

function generateHint(questionText, tags, lang) {
  // 1. Try tag-based hint first
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      if (TAG_HINTS[tag]) {
        return TAG_HINTS[tag][lang === "en" ? 1 : 0];
      }
    }
  }

  // 2. Try question-pattern based hint
  const patterns = lang === "en" ? QUESTION_PATTERN_HINTS_EN : QUESTION_PATTERN_HINTS_HE;
  for (const [regex, hint] of patterns) {
    if (regex.test(questionText)) {
      return hint;
    }
  }

  // 3. Generic fallback
  return lang === "en"
    ? "Think carefully about what each option describes."
    : "חשבו בזהירות על מה כל אפשרות מתארת.";
}

// ── Process topics.js ─────────────────────────────────────────────────────────
function processTopicsFile() {
  let content = readFileSync('src/content/topics.js', 'utf8');
  let added = 0;

  // Process each question block - match questions that DON'T already have a hint field
  // Pattern: find {  (with possible whitespace) q: "..." and tags/options, then answer:
  // We insert hint right before `answer:`

  // Strategy: find each question object and add hint if missing
  // We'll use a regex to find question objects and insert hints

  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  let isEnglish = false; // track if we're in questionsEn section

  while (i < lines.length) {
    const line = lines[i];

    // Track if we're in English or Hebrew section
    if (line.includes('questionsEn:')) isEnglish = true;
    if (line.includes('questions:') && !line.includes('questionsEn:')) isEnglish = false;

    // Detect inline question format (compact, single line) - dailyQuestions style
    // Not used in topics.js, but handle it anyway

    // Detect multi-line question blocks
    if (line.match(/^\s*q:\s*"/) || line.match(/^\s*q:\s*`/)) {
      // Extract question text from this line
      const qMatch = line.match(/q:\s*"([^"]+)"/);
      const qText = qMatch ? qMatch[1] : '';

      // Look ahead to find tags and answer lines
      let tags = [];
      let hasHint = false;
      let answerLineIdx = -1;

      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        const ahead = lines[j];
        if (ahead.includes('hint:')) hasHint = true;
        const tagMatch = ahead.match(/tags:\s*\[([^\]]*)\]/);
        if (tagMatch) {
          tags = tagMatch[1].split(',').map(t => t.trim().replace(/"/g, '').replace(/'/g, ''));
        }
        if (ahead.match(/^\s*answer:\s*\d/) && answerLineIdx === -1) {
          answerLineIdx = j;
        }
      }

      if (!hasHint && answerLineIdx !== -1) {
        const lang = isEnglish ? "en" : "he";
        const hint = generateHint(qText, tags, lang);

        // Insert hint line before the answer line
        newLines.push(line);
        i++;
        while (i < answerLineIdx) {
          newLines.push(lines[i]);
          i++;
        }
        // Insert hint before answer line
        const indent = lines[answerLineIdx].match(/^(\s*)/)[1];
        newLines.push(`${indent}hint: "${hint.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",`);
        newLines.push(lines[i]); // the answer line
        i++;
        added++;
        continue;
      }
    }

    newLines.push(line);
    i++;
  }

  writeFileSync('src/content/topics.js', newLines.join('\n'));
  console.log(`topics.js: added ${added} hints`);
}

// ── Process dailyQuestions.js ──────────────────────────────────────────────────
function processDailyFile() {
  let content = readFileSync('src/content/dailyQuestions.js', 'utf8');
  let added = 0;

  // dailyQuestions.js uses compact single-line format:
  // {q:"...",options:[...],tags:[...],answer:N,explanation:"..."}
  // We need to insert hint:"..." before answer:N

  let isEnglish = false;

  content = content.replace(
    /(\{q:"[^"]*"(?:,\s*\n\s*options|\s*,options))((?:(?!answer:).)*?)(,?tags:\[([^\]]*)\])?((?:(?!answer:).)*?)(,answer:)(\d)/g,
    (match, qPart, middle, tagsBlock, tagsContent, afterTags, answerPrefix, answerNum) => {
      // This regex is too complex for single-line format. Let me use a different approach.
      return match;
    }
  );

  // Better approach: line by line for the compact format
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Track language
    if (line.match(/^\s*en:\s*\[/)) isEnglish = true;
    if (line.match(/^\s*he:\s*\[/) && !line.includes('en:')) isEnglish = false;

    // Match compact question format with answer field but no hint
    if (line.includes(',answer:') && line.includes('q:"') && !line.includes('hint:')) {
      const lang = isEnglish ? "en" : "he";

      // Extract question text
      const qMatch = line.match(/q:"([^"]+)"/);
      const qText = qMatch ? qMatch[1] : '';

      // Extract tags
      const tagsMatch = line.match(/tags:\[([^\]]*)\]/);
      const tags = tagsMatch
        ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '').replace(/'/g, ''))
        : [];

      const hint = generateHint(qText, tags, lang);

      // Insert hint before answer:
      line = line.replace(/,answer:/, `,hint:"${hint.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",answer:`);
      added++;
    }
    // Also handle multi-line questions in dailyQuestions
    else if (line.match(/^\s*q:"/) && !line.includes('answer:')) {
      // Multi-line question - look for the answer line
      const qMatch = line.match(/q:"([^"]+)"/);
      const qText = qMatch ? qMatch[1] : '';

      let foundAnswer = false;
      let hasHint = false;

      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('hint:')) hasHint = true;
        if (lines[j].includes(',answer:') || lines[j].match(/^\s*answer:/)) {
          foundAnswer = true;
          if (!hasHint && !lines[j].includes('hint:')) {
            const lang = isEnglish ? "en" : "he";
            const tagsMatch = lines.slice(i, j+1).join('').match(/tags:\[([^\]]*)\]/);
            const tags = tagsMatch
              ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '').replace(/'/g, ''))
              : [];
            const hint = generateHint(qText, tags, lang);
            // Insert hint into the line with answer
            if (lines[j].includes(',answer:')) {
              lines[j] = lines[j].replace(/,answer:/, `,hint:"${hint.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",answer:`);
            } else {
              lines[j] = lines[j].replace(/answer:/, `hint: "${hint.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",\n              answer:`);
            }
            added++;
          }
          break;
        }
      }
    }

    newLines.push(line);
  }

  writeFileSync('src/content/dailyQuestions.js', newLines.join('\n'));
  console.log(`dailyQuestions.js: added ${added} hints`);
}

processTopicsFile();
processDailyFile();
console.log("Done!");
