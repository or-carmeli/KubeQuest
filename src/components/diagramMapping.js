// ── Diagram tag mapping ─────────────────────────────────────────────────────
// Single source of truth for which tags trigger diagrams.
// Tags follow the "domain-concept" naming convention.
//
// To add a diagram to a question: add the tag to the question's `tags` array
// in the content file + DB migration, then add an entry here.
//
// To remove a diagram: delete its entry. The tag can remain on questions
// (it will be silently ignored).

// ── Domain groups ───────────────────────────────────────────────────────────
// Tags are organised into domains for analytics and learning paths.
// A tag's domain is its prefix before the first hyphen.
export const TAG_DOMAINS = {
  workloads:   "Workloads & Pods",
  networking:  "Networking & Services",
  storage:     "Storage & Volumes",
  security:    "Config & Security",
  scheduling:  "Scheduling",
  gitops:      "ArgoCD & GitOps",
};

// domain prefix → human-readable domain
export function domainOf(tag) {
  const prefix = tag.split("-")[0];
  const map = {
    pod: "workloads", controller: "workloads", rolling: "workloads",
    daemonset: "workloads", statefulset: "workloads", hpa: "workloads",
    probe: "workloads",
    service: "networking", ingress: "networking", network: "networking",
    headless: "networking",
    storage: "storage", dynamic: "storage",
    rbac: "security", role: "security",
    taints: "scheduling", topology: "scheduling",
    gitops: "gitops",
  };
  return map[prefix] || "other";
}

// ── Tag → diagram config ────────────────────────────────────────────────────
// Each entry:
//   component – string key resolved at runtime by QuizDiagrams.jsx
//   score     – 1-5 relevance; only >= MIN_SCORE is rendered
//   domain    – for grouping / analytics (derived from tag if omitted)
//
// Naming convention: "domain-concept"
//   domain  = broad area (pod, controller, service, ingress, storage, …)
//   concept = specific relationship the diagram illustrates

export const MIN_SCORE = 4;

export const TAG_DIAGRAM_CONFIG = {
  // ── workloads (score 5 = multi-level nesting or progression) ────────────
  "pod-architecture":     { component: "PodDiagram",                 score: 5 },
  "controller-hierarchy": { component: "DeploymentHierarchyDiagram", score: 5 },
  "rolling-update":       { component: "RollingUpdateDiagram",       score: 5 },
  "statefulset-storage":  { component: "StatefulSetDiagram",         score: 5 },

  // ── workloads (score 4 = clear relationship / feedback loop) ────────────
  "daemonset-topology":   { component: "DaemonSetDiagram",           score: 4 },
  "hpa-scaling":          { component: "HpaDiagram",                 score: 4 },
  "probe-comparison":     { component: "ProbesDiagram",              score: 4 },

  // ── networking (score 5 = branching / layered flow) ─────────────────────
  "service-types":        { component: "ServiceTypesDiagram",        score: 5 },
  "ingress-routing":      { component: "IngressRoutingDiagram",      score: 5 },

  // ── networking (score 4) ────────────────────────────────────────────────
  "service-discovery":    { component: "ServiceEndpointsDiagram",    score: 4 },
  "ingress-vs-lb":        { component: "IngressVsLbDiagram",         score: 4 },
  "network-policy-flow":  { component: "NetworkPolicyDiagram",       score: 4 },
  "headless-dns":         { component: "HeadlessServiceDiagram",     score: 4 },

  // ── storage ─────────────────────────────────────────────────────────────
  "storage-binding":      { component: "PvPvcDiagram",               score: 4 },
  "dynamic-provisioning": { component: "DynamicProvisioningDiagram", score: 4 },

  // ── security ────────────────────────────────────────────────────────────
  "rbac-binding":         { component: "RbacDiagram",                score: 4 },
  "role-scope":           { component: "RoleScopeDiagram",           score: 4 },

  // ── scheduling ──────────────────────────────────────────────────────────
  "taints-tolerations":   { component: "TaintsTolerationsDiagram",   score: 4 },
  "topology-spread":      { component: "TopologySpreadDiagram",      score: 4 },

  // ── gitops ──────────────────────────────────────────────────────────────
  "gitops-sync":          { component: "ArgoCdSyncDiagram",          score: 4 },
};
