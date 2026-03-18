// ── Public Topic Metadata & Achievements ────────────────────────────────────
// This file is intentionally public. It contains only topic shells (no questions,
// answers, or explanations) and achievement threshold definitions.
// Proprietary content lives in src/content/ (git-ignored).

export const ACHIEVEMENTS = [
  {
    id: "streak3",
    icon: "flame",
    name: "3 ברצף",
    nameEn: "3 in a row",
    condition: (s) => s.max_streak >= 3,
  },
  {
    id: "streak5",
    icon: "flame",
    name: "5 ברצף",
    nameEn: "5 in a row",
    condition: (s) => s.max_streak >= 5,
  },
  {
    id: "streak10",
    icon: "flame",
    name: "10 ברצף",
    nameEn: "10 in a row",
    condition: (s) => s.max_streak >= 10,
  },
  {
    id: "score100",
    icon: "award",
    name: "100 נקודות",
    nameEn: "100 points",
    condition: (s) => s.total_score >= 100,
  },
  {
    id: "allEasy",
    icon: "star",
    name: "כל הנושאים ברמה קלה",
    nameEn: "All topics on easy",
    condition: (s, c) => Object.keys(c).filter((k) => k.endsWith("_easy")).length >= AVAILABLE_TOPIC_COUNT,
  },
  {
    id: "master",
    icon: "trophy",
    name: "מאסטר K8s",
    nameEn: "K8s Master",
    condition: (s, c) => Object.keys(c).filter((k) => k.endsWith("_hard")).length >= AVAILABLE_TOPIC_COUNT,
  },
];

// Topic shells - used for home screen rendering, roadmap, and navigation.
// The full topic objects (with levels.questions, theory, etc.) are loaded
// from src/content/topics.js at build time.
export const TOPIC_META = [
  {
    id: "workloads",
    icon: "workloads",
    name: "Workloads & Pods",
    color: "#00D4FF",
    description: "Pods · Deployments · Jobs · Scheduling",
    descriptionEn: "Pods · Deployments · Jobs · Scheduling",
  },
  {
    id: "networking",
    icon: "networking",
    name: "Networking & Services",
    color: "#A855F7",
    description: "Services · Ingress · DNS · NetworkPolicy",
    descriptionEn: "Services · Ingress · DNS · NetworkPolicy",
  },
  {
    id: "config",
    icon: "config",
    name: "Config & Secrets",
    color: "#F59E0B",
    description: "ConfigMaps · Secrets · RBAC · SA",
    descriptionEn: "ConfigMaps · Secrets · RBAC · SA",
  },
  {
    id: "storage",
    icon: "storage",
    name: "Storage & Helm",
    color: "#10B981",
    description: "PV · StorageClass · Helm · Operators",
    descriptionEn: "PV · StorageClass · Helm · Operators",
  },
  {
    id: "troubleshooting",
    icon: "troubleshooting",
    name: "Troubleshooting & Debugging",
    color: "#F97316",
    description: "Logs · Events · Probes · Observability",
    descriptionEn: "Logs · Events · Probes · Observability",
  },
  {
    id: "linux",
    icon: "linux",
    name: "OS & Linux Deep Dive",
    color: "#6366F1",
    description: "Processes · Memory · CPU · Networking",
    descriptionEn: "Processes · Memory · CPU · Networking",
    isNew: true,
  },
  {
    id: "argo",
    icon: "argo",
    name: "Argo & GitOps",
    color: "#EF7B45",
    description: "ArgoCD · Workflows · ApplicationSets · Rollouts",
    descriptionEn: "ArgoCD · Workflows · ApplicationSets · Rollouts",
    isComingSoon: true,
  },
];

/** Number of available (non-comingSoon) topics. Used by achievements. */
export const AVAILABLE_TOPIC_COUNT = TOPIC_META.filter(t => !t.isComingSoon).length;
