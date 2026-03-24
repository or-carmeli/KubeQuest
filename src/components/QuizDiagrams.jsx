import React, { useEffect, useRef, useState } from "react";
import PodDiagram from "./PodDiagram";
import { TAG_DIAGRAM_CONFIG, MIN_SCORE } from "./diagramMapping";

// ── shared constants ────────────────────────────────────────────────
const MONO = "'JetBrains Mono','Fira Code','Cascadia Code','SF Mono',monospace";

const C = {
  indigo:     "rgba(99,102,241,0.45)",
  indigoBg:   "rgba(99,102,241,0.04)",
  indigoText: "#818CF8",
  green:      "rgba(16,185,129,0.35)",
  greenBg:    "rgba(16,185,129,0.04)",
  greenText:  "#6EE7B7",
  amber:      "rgba(245,158,11,0.35)",
  amberBg:    "rgba(245,158,11,0.04)",
  amberText:  "#FCD34D",
  red:        "rgba(239,68,68,0.35)",
  redBg:      "rgba(239,68,68,0.04)",
  redText:    "#FCA5A5",
  cyan:       "rgba(6,182,212,0.35)",
  cyanBg:     "rgba(6,182,212,0.04)",
  cyanText:   "#67E8F9",
  purple:     "rgba(168,85,247,0.35)",
  purpleBg:   "rgba(168,85,247,0.04)",
  purpleText: "#C4B5FD",
  dim:        "var(--text-dim)",
  muted:      "var(--text-muted)",
};

// ── shared style helpers ────────────────────────────────────────────
const wrap = {
  display: "flex", flexDirection: "column", alignItems: "center",
  padding: "14px 12px 10px", margin: "4px 0 2px",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12, maxWidth: 300, width: "100%", alignSelf: "center",
  boxSizing: "border-box", overflow: "hidden",
  direction: "ltr",
};

const box = (border, bg, extra) => ({
  border: `1.5px solid ${border}`, borderRadius: 10,
  padding: "10px 14px 8px", background: bg,
  boxSizing: "border-box", ...extra,
});

const label = (color, extra) => ({
  fontSize: 11, fontWeight: 700, color, fontFamily: MONO,
  letterSpacing: 0.5, textAlign: "center", ...extra,
});

const smallBox = (border, bg, color, extra) => ({
  border: `1px solid ${border}`, borderRadius: 7,
  padding: "6px 12px", background: bg,
  fontSize: 10, fontWeight: 600, color, fontFamily: MONO,
  letterSpacing: 0.3, textAlign: "center", whiteSpace: "nowrap",
  boxSizing: "border-box", ...extra,
});

const caption = (extra) => ({
  fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 6,
  textAlign: "center", ...extra,
});

const arrow = (extra) => ({
  fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: MONO, ...extra,
});

const row = (extra) => ({
  display: "flex", gap: 8, justifyContent: "center", alignItems: "center",
  flexWrap: "wrap", ...extra,
});

const col = (extra) => ({
  display: "flex", flexDirection: "column", alignItems: "center", gap: 6, ...extra,
});

const dashed = { borderTop: "1px dashed rgba(255,255,255,0.10)" };

const subLabel = (extra) => ({
  fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: MONO,
  letterSpacing: 0.2, ...extra,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIAGRAM COMPONENTS — 19 kept (score >= 4)
//
// Removed 9 low-value diagrams:
//   PortTargetPortDiagram  (score 2) — trivial port mapping, text sufficient
//   CsiDiagram             (score 2) — just a vendor list, no architecture
//   AdmissionWebhookDiagram(score 2) — linear pipeline, text sufficient
//   QosDiagram             (score 2) — just ordering 3 items
//   LimitRangeVsQuotaDiagram(score 2)— simple comparison, text sufficient
//   PdbDiagram             (score 2) — "min 2, can evict 1" obvious from text
//   SyncWavesDiagram       (score 2) — sequential 3-step list
//   NodeDrainDiagram       (score 3) — simple before/after, 2 nodes
//   CoreDnsDiagram         (score 3) — simple 3-node chain
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 1. Deployment → ReplicaSet → Pods ───────────────────────────────
function DeploymentHierarchyDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { minWidth: 220, maxWidth: 280, width: "100%" })}>
        <div style={label(C.indigoText, { marginBottom: 8 })}>Deployment</div>
        <div style={box(C.purple, C.purpleBg, { padding: "8px 10px 6px" })}>
          <div style={label(C.purpleText, { marginBottom: 6, fontSize: 10 })}>ReplicaSet</div>
          <div style={row()}>
            {["Pod", "Pod", "Pod"].map((p, i) => (
              <div key={i} style={smallBox(C.green, C.greenBg, C.greenText)}>{p}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={caption()}>manages desired state</div>
    </div>
  );
}

// ── 2. Service type layers ──────────────────────────────────────────
function ServiceTypesDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 4, width: "100%", maxWidth: 260 })}>
        <div style={smallBox(C.amber, C.amberBg, C.amberText, { width: "100%" })}>Internet</div>
        <div style={arrow()}>|</div>
        <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { width: "100%" })}>LoadBalancer</div>
        <div style={arrow()}>|</div>
        <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { width: "100%" })}>NodePort</div>
        <div style={arrow()}>|</div>
        <div style={smallBox(C.indigo, C.indigoBg, C.indigoText, { width: "100%" })}>ClusterIP</div>
        <div style={arrow()}>|</div>
        <div style={row()}>
          {["Pod", "Pod"].map((p, i) => (
            <div key={i} style={smallBox(C.green, C.greenBg, C.greenText)}>{p}</div>
          ))}
        </div>
      </div>
      <div style={caption()}>each type builds on the previous</div>
    </div>
  );
}

// ── 3. Ingress path-based routing ───────────────────────────────────
function IngressRoutingDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 4, width: "100%", maxWidth: 280 })}>
        <div style={smallBox(C.amber, C.amberBg, C.amberText, { width: "100%" })}>Client</div>
        <div style={arrow()}>|</div>
        <div style={box(C.cyan, C.cyanBg, { width: "100%", padding: "8px 10px" })}>
          <div style={label(C.cyanText, { marginBottom: 6, fontSize: 10 })}>Ingress Controller</div>
          <div style={row({ gap: 6 })}>
            <div style={col({ gap: 3 })}>
              <span style={subLabel()}>/api</span>
              <div style={arrow()}>|</div>
              <div style={smallBox(C.indigo, C.indigoBg, C.indigoText)}>api-svc</div>
            </div>
            <div style={col({ gap: 3 })}>
              <span style={subLabel()}>/web</span>
              <div style={arrow()}>|</div>
              <div style={smallBox(C.green, C.greenBg, C.greenText)}>web-svc</div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption()}>single entry point, path-based routing</div>
    </div>
  );
}

// ── 4. Service → Endpoints → Pods ───────────────────────────────────
function ServiceEndpointsDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={col({ gap: 3, flex: "0 0 auto" })}>
          <div style={box(C.indigo, C.indigoBg, { padding: "8px 10px" })}>
            <div style={label(C.indigoText, { fontSize: 10 })}>Service</div>
            <div style={subLabel({ marginTop: 4 })}>selector: app=web</div>
          </div>
        </div>
        <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        <div style={col({ gap: 3, flex: "0 0 auto" })}>
          <div style={box(C.purple, C.purpleBg, { padding: "8px 10px" })}>
            <div style={label(C.purpleText, { fontSize: 10 })}>Endpoints</div>
          </div>
        </div>
        <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        <div style={col({ gap: 4, flex: "0 0 auto" })}>
          {["Pod", "Pod"].map((p, i) => (
            <div key={i} style={smallBox(C.green, C.greenBg, C.greenText, { padding: "4px 10px" })}>{p}</div>
          ))}
        </div>
      </div>
      <div style={caption()}>label selector populates endpoints</div>
    </div>
  );
}

// ── 5. PV ↔ PVC binding ────────────────────────────────────────────
function PvPvcDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 8, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={col({ gap: 3 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>Pod</div>
          <div style={arrow()}>|</div>
          <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px" })}>
            <div style={label(C.indigoText, { fontSize: 10 })}>PVC</div>
            <div style={subLabel({ marginTop: 3 })}>request</div>
          </div>
        </div>
        <div style={col({ gap: 3, justifyContent: "center" })}>
          <span style={{ fontSize: 10, color: C.amberText, fontFamily: MONO }}>bind</span>
          <div style={arrow({ fontSize: 13 })}>&harr;</div>
        </div>
        <div style={col({ gap: 3 })}>
          <div style={box(C.purple, C.purpleBg, { padding: "6px 10px" })}>
            <div style={label(C.purpleText, { fontSize: 10 })}>PV</div>
            <div style={subLabel({ marginTop: 3 })}>storage</div>
          </div>
          <div style={arrow()}>|</div>
          <div style={smallBox(C.amber, C.amberBg, C.amberText)}>Disk</div>
        </div>
      </div>
      <div style={caption()}>PVC requests storage, PV provides it</div>
    </div>
  );
}

// ── 6. Rolling Update progression ───────────────────────────────────
function RollingUpdateDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 5, width: "100%", maxWidth: 280 })}>
        <div style={row({ gap: 6 })}>
          <div style={smallBox(C.red, C.redBg, C.redText)}>v1</div>
          <div style={smallBox(C.red, C.redBg, C.redText)}>v1</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>v2</div>
        </div>
        <div style={arrow()}>|</div>
        <div style={row({ gap: 6 })}>
          <div style={smallBox(C.red, C.redBg, C.redText)}>v1</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>v2</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>v2</div>
        </div>
        <div style={arrow()}>|</div>
        <div style={row({ gap: 6 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>v2</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>v2</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>v2</div>
        </div>
      </div>
      <div style={caption()}>gradual replacement, zero downtime</div>
    </div>
  );
}

// ── 7. DaemonSet: one Pod per Node ──────────────────────────────────
function DaemonSetDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { width: "100%", maxWidth: 280 })}>
        <div style={label(C.indigoText, { marginBottom: 8 })}>Cluster</div>
        <div style={row({ gap: 6 })}>
          {["Node 1", "Node 2", "Node 3"].map((n) => (
            <div key={n} style={box(C.purple, C.purpleBg, { padding: "6px 8px", flex: 1, minWidth: 0 })}>
              <div style={label(C.purpleText, { fontSize: 9, marginBottom: 4 })}>{n}</div>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "4px 6px", fontSize: 9 })}>Pod</div>
            </div>
          ))}
        </div>
      </div>
      <div style={caption()}>one Pod per Node, guaranteed</div>
    </div>
  );
}

// ── 8. StatefulSet: ordered Pods with dedicated PVCs ────────────────
function StatefulSetDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { width: "100%", maxWidth: 280 })}>
        <div style={label(C.indigoText, { marginBottom: 8 })}>StatefulSet</div>
        <div style={row({ gap: 6 })}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={col({ gap: 3, flex: 1, minWidth: 0 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "4px 6px", fontSize: 9, width: "100%" })}>pod-{i}</div>
              <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { padding: "4px 6px", fontSize: 9, width: "100%" })}>pvc-{i}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={caption()}>stable names, dedicated storage</div>
    </div>
  );
}

// ── 9. RBAC: Subject ↔ RoleBinding ↔ Role ───────────────────────────
function RbacDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={box(C.green, C.greenBg, { padding: "6px 10px", flex: "0 0 auto" })}>
          <div style={label(C.greenText, { fontSize: 10 })}>Subject</div>
          <div style={subLabel({ marginTop: 3 })}>User / SA</div>
        </div>
        <div style={arrow({ fontSize: 13 })}>&larr;</div>
        <div style={box(C.amber, C.amberBg, { padding: "6px 10px", flex: "0 0 auto" })}>
          <div style={label(C.amberText, { fontSize: 10 })}>RoleBinding</div>
        </div>
        <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px", flex: "0 0 auto" })}>
          <div style={label(C.indigoText, { fontSize: 10 })}>Role</div>
          <div style={subLabel({ marginTop: 3 })}>permissions</div>
        </div>
      </div>
      <div style={caption()}>binding connects subject to permissions</div>
    </div>
  );
}

// ── 10. NetworkPolicy: allow/deny traffic ───────────────────────────
function NetworkPolicyDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 10, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={col({ gap: 4 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>Pod A</div>
          <div style={subLabel()}>frontend</div>
        </div>
        <div style={col({ gap: 2 })}>
          <span style={{ fontSize: 9, color: C.greenText, fontFamily: MONO }}>allowed</span>
          <div style={arrow({ fontSize: 13 })}>&rarr;</div>
          <div style={{ ...dashed, width: 40 }} />
          <span style={{ fontSize: 9, color: C.redText, fontFamily: MONO }}>denied</span>
        </div>
        <div style={col({ gap: 4 })}>
          <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px" })}>
            <div style={label(C.indigoText, { fontSize: 10, marginBottom: 4 })}>Policy</div>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "4px 8px", fontSize: 9 })}>Pod B</div>
          </div>
          <div style={subLabel()}>backend</div>
        </div>
      </div>
      <div style={caption()}>controls ingress/egress per Pod</div>
    </div>
  );
}

// ── 11. HPA: metrics → scale ────────────────────────────────────────
function HpaDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={col({ gap: 3 })}>
          <div style={smallBox(C.cyan, C.cyanBg, C.cyanText)}>metrics</div>
          <div style={arrow()}>|</div>
          <div style={box(C.amber, C.amberBg, { padding: "6px 10px" })}>
            <div style={label(C.amberText, { fontSize: 10 })}>HPA</div>
          </div>
        </div>
        <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        <div style={box(C.indigo, C.indigoBg, { padding: "8px 10px" })}>
          <div style={label(C.indigoText, { fontSize: 10, marginBottom: 4 })}>Deployment</div>
          <div style={row({ gap: 4 })}>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 6px", fontSize: 9 })}>Pod</div>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 6px", fontSize: 9 })}>Pod</div>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 6px", fontSize: 9, opacity: 0.5, borderStyle: "dashed" })}>Pod</div>
          </div>
        </div>
      </div>
      <div style={caption()}>scales replicas based on metrics</div>
    </div>
  );
}

// ── 12. Probes: Readiness vs Liveness ───────────────────────────────
function ProbesDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 10, width: "100%", maxWidth: 280 })}>
        <div style={col({ gap: 3, flex: 1 })}>
          <div style={label(C.greenText, { fontSize: 10 })}>Readiness</div>
          <div style={box(C.green, C.greenBg, { padding: "6px 8px", width: "100%" })}>
            <div style={subLabel({ textAlign: "center" })}>fail</div>
            <div style={arrow({ textAlign: "center" })}>|</div>
            <div style={subLabel({ textAlign: "center", color: C.amberText })}>remove from</div>
            <div style={subLabel({ textAlign: "center", color: C.amberText })}>endpoints</div>
          </div>
        </div>
        <div style={col({ gap: 3, flex: 1 })}>
          <div style={label(C.redText, { fontSize: 10 })}>Liveness</div>
          <div style={box(C.red, C.redBg, { padding: "6px 8px", width: "100%" })}>
            <div style={subLabel({ textAlign: "center" })}>fail</div>
            <div style={arrow({ textAlign: "center" })}>|</div>
            <div style={subLabel({ textAlign: "center", color: C.redText })}>restart</div>
            <div style={subLabel({ textAlign: "center", color: C.redText })}>container</div>
          </div>
        </div>
      </div>
      <div style={caption()}>different failure responses</div>
    </div>
  );
}

// ── 13. Taints & Tolerations ────────────────────────────────────────
function TaintsTolerationsDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 10, width: "100%", maxWidth: 280 })}>
        <div style={col({ gap: 4, flex: 1 })}>
          <div style={box(C.amber, C.amberBg, { padding: "6px 8px", width: "100%" })}>
            <div style={label(C.amberText, { fontSize: 10, marginBottom: 4 })}>Node</div>
            <div style={subLabel({ textAlign: "center" })}>taint: gpu=true</div>
          </div>
        </div>
        <div style={col({ gap: 6, flex: 1 })}>
          <div style={row({ gap: 4 })}>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "4px 6px", fontSize: 9 })}>Pod</div>
            <span style={{ fontSize: 9, color: C.greenText, fontFamily: MONO }}>toleration</span>
          </div>
          <div style={{ ...dashed, width: "100%" }} />
          <div style={row({ gap: 4 })}>
            <div style={smallBox(C.red, C.redBg, C.redText, { padding: "4px 6px", fontSize: 9 })}>Pod</div>
            <span style={{ fontSize: 9, color: C.redText, fontFamily: MONO }}>rejected</span>
          </div>
        </div>
      </div>
      <div style={caption()}>only tolerating Pods are scheduled</div>
    </div>
  );
}

// ── 15. Ingress vs multiple LoadBalancers ───────────────────────────
function IngressVsLbDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 12, width: "100%", maxWidth: 280 })}>
        <div style={col({ gap: 3, flex: 1 })}>
          <div style={label(C.redText, { fontSize: 9 })}>Multiple LBs</div>
          <div style={smallBox(C.red, C.redBg, C.redText, { fontSize: 8, padding: "3px 6px" })}>LB 1</div>
          <div style={smallBox(C.red, C.redBg, C.redText, { fontSize: 8, padding: "3px 6px" })}>LB 2</div>
          <div style={smallBox(C.red, C.redBg, C.redText, { fontSize: 8, padding: "3px 6px" })}>LB 3</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)", alignSelf: "stretch" }} />
        <div style={col({ gap: 3, flex: 1 })}>
          <div style={label(C.greenText, { fontSize: 9 })}>One Ingress</div>
          <div style={box(C.cyan, C.cyanBg, { padding: "4px 6px", width: "100%" })}>
            <div style={label(C.cyanText, { fontSize: 9 })}>Ingress</div>
          </div>
          <div style={row({ gap: 3 })}>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { fontSize: 8, padding: "3px 5px" })}>svc1</div>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { fontSize: 8, padding: "3px 5px" })}>svc2</div>
            <div style={smallBox(C.green, C.greenBg, C.greenText, { fontSize: 8, padding: "3px 5px" })}>svc3</div>
          </div>
        </div>
      </div>
      <div style={caption()}>cost-effective single entry point</div>
    </div>
  );
}

// ── 16. Headless Service ────────────────────────────────────────────
function HeadlessServiceDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={smallBox(C.amber, C.amberBg, C.amberText)}>DNS query</div>
        <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px" })}>
          <div style={label(C.indigoText, { fontSize: 10 })}>Headless Svc</div>
          <div style={subLabel({ marginTop: 3 })}>clusterIP: None</div>
        </div>
        <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        <div style={col({ gap: 3 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 8px", fontSize: 9 })}>10.0.1.2</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 8px", fontSize: 9 })}>10.0.1.3</div>
        </div>
      </div>
      <div style={caption()}>returns individual Pod IPs</div>
    </div>
  );
}

// ── 17. Topology Spread ─────────────────────────────────────────────
function TopologySpreadDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280 })}>
        {["Zone A", "Zone B", "Zone C"].map((z) => (
          <div key={z} style={box(C.indigo, C.indigoBg, { padding: "6px 8px", flex: 1, minWidth: 0 })}>
            <div style={label(C.indigoText, { fontSize: 9, marginBottom: 4 })}>{z}</div>
            <div style={row({ gap: 3 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 5px", fontSize: 8 })}>Pod</div>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 5px", fontSize: 8 })}>Pod</div>
            </div>
          </div>
        ))}
      </div>
      <div style={caption()}>even distribution across failure domains</div>
    </div>
  );
}

// ── 18. ArgoCD sync flow ────────────────────────────────────────────
function ArgoCdSyncDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={box(C.purple, C.purpleBg, { padding: "6px 10px" })}>
          <div style={label(C.purpleText, { fontSize: 10 })}>Git</div>
          <div style={subLabel({ marginTop: 3 })}>source of truth</div>
        </div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.cyanText, fontFamily: MONO }}>sync</span>
          <div style={arrow({ fontSize: 13 })}>&harr;</div>
        </div>
        <div style={box(C.cyan, C.cyanBg, { padding: "6px 10px" })}>
          <div style={label(C.cyanText, { fontSize: 10 })}>ArgoCD</div>
        </div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.greenText, fontFamily: MONO }}>deploy</span>
          <div style={arrow({ fontSize: 13 })}>&rarr;</div>
        </div>
        <div style={box(C.green, C.greenBg, { padding: "6px 10px" })}>
          <div style={label(C.greenText, { fontSize: 10 })}>Cluster</div>
        </div>
      </div>
      <div style={caption()}>GitOps: Git drives cluster state</div>
    </div>
  );
}

// ── 19. Role vs ClusterRole scope ───────────────────────────────────
function RoleScopeDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { width: "100%", maxWidth: 280 })}>
        <div style={label(C.indigoText, { marginBottom: 8 })}>Cluster</div>
        <div style={row({ gap: 6, marginBottom: 6 })}>
          <div style={box(C.green, C.greenBg, { padding: "6px 8px", flex: 1 })}>
            <div style={label(C.greenText, { fontSize: 9, marginBottom: 3 })}>Namespace A</div>
            <div style={smallBox(C.amber, C.amberBg, C.amberText, { padding: "3px 6px", fontSize: 8 })}>Role</div>
          </div>
          <div style={box(C.green, C.greenBg, { padding: "6px 8px", flex: 1 })}>
            <div style={label(C.greenText, { fontSize: 9 })}>Namespace B</div>
          </div>
        </div>
        <div style={{ ...dashed, marginBottom: 6 }} />
        <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { width: "100%", fontSize: 9 })}>ClusterRole (all namespaces)</div>
      </div>
      <div style={caption()}>Role = namespace, ClusterRole = cluster</div>
    </div>
  );
}

// ── 20. PSA Restricted Requirements ─────────────────────────────────
function PsaAdmissionDiagram() {
  const kvRow = (k, v, dim) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0 4px" }}>
      <span style={{ fontSize: dim ? 8.5 : 9, fontFamily: MONO, color: dim ? "rgba(255,255,255,0.32)" : "#FCA5A5", fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: dim ? 8.5 : 9, fontFamily: MONO, color: dim ? "rgba(255,255,255,0.32)" : "#6EE7B7", fontWeight: 700 }}>{v}</span>
    </div>
  );
  return (
    <div dir="ltr" style={{...wrap, direction: "ltr"}}>
      <div style={box("rgba(239,68,68,0.30)", "rgba(239,68,68,0.03)", { width: "100%", maxWidth: 280, padding: "10px 12px 8px" })}>
        <div style={{ fontSize: 9, fontFamily: MONO, fontWeight: 600, color: "rgba(252,165,165,0.7)", letterSpacing: 0.5, textAlign: "center", marginBottom: 8 }}>PSA: restricted</div>
        <div style={{ padding: "5px 6px", background: "rgba(239,68,68,0.05)", borderRadius: 5, border: "1px solid rgba(239,68,68,0.14)", marginBottom: 8 }}>
          {kvRow("allowPrivilegeEscalation", "false")}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 6 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: MONO, letterSpacing: 0.3, marginBottom: 4 }}>other restricted checks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {kvRow("runAsNonRoot", "true", true)}
            {kvRow("seccompProfile", "RuntimeDefault", true)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 6, width: "100%", maxWidth: 280, background: "rgba(248,81,73,0.06)", border: "1px solid rgba(248,81,73,0.12)", borderRadius: 5, padding: "4px 10px", fontFamily: MONO, fontSize: 9, color: "#f85149", lineHeight: 1.5 }}>Error: allowPrivilegeEscalation must be false</div>
    </div>
  );
}

// ── 21. ConfigMap / Secret → Pod mounting ────────────────────────────
function ConfigMapMountDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 4, width: "100%", maxWidth: 280 })}>
        <div style={row({ gap: 8 })}>
          <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px" })}>
            <div style={label(C.indigoText, { fontSize: 10 })}>ConfigMap</div>
          </div>
          <div style={box(C.amber, C.amberBg, { padding: "6px 10px" })}>
            <div style={label(C.amberText, { fontSize: 10 })}>Secret</div>
          </div>
        </div>
        <div style={row({ gap: 16 })}>
          <div style={col({ gap: 1 })}>
            <span style={subLabel()}>env vars</span>
            <div style={arrow()}>↓</div>
          </div>
          <div style={col({ gap: 1 })}>
            <span style={subLabel()}>volume</span>
            <div style={arrow()}>↓</div>
          </div>
        </div>
        <div style={box(C.green, C.greenBg, { padding: "8px 12px", width: "100%" })}>
          <div style={label(C.greenText, { fontSize: 10, marginBottom: 4 })}>Pod</div>
          <div style={row({ gap: 6 })}>
            <div style={smallBox(C.indigo, C.indigoBg, C.indigoText, { fontSize: 8, padding: "3px 6px" })}>$DB_HOST</div>
            <div style={smallBox(C.amber, C.amberBg, C.amberText, { fontSize: 8, padding: "3px 6px" })}>/secrets/</div>
          </div>
        </div>
      </div>
      <div style={caption()}>inject config as env vars or mounted files</div>
    </div>
  );
}

// ── 22. Dynamic Provisioning: StorageClass → PVC → PV ───────────────
function DynamicProvisioningDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 4, width: "100%", maxWidth: 280 })}>
        <div style={smallBox(C.green, C.greenBg, C.greenText, { width: "100%" })}>PVC (request: 10Gi)</div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.amberText, fontFamily: MONO }}>triggers</span>
          <div style={arrow()}>↓</div>
        </div>
        <div style={box(C.amber, C.amberBg, { padding: "6px 10px", width: "100%" })}>
          <div style={label(C.amberText, { fontSize: 10 })}>StorageClass</div>
          <div style={subLabel({ marginTop: 3 })}>provisioner: ebs.csi.aws.com</div>
        </div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.cyanText, fontFamily: MONO }}>creates</span>
          <div style={arrow()}>↓</div>
        </div>
        <div style={row({ gap: 6 })}>
          <div style={smallBox(C.purple, C.purpleBg, C.purpleText)}>PV</div>
          <div style={arrow({ fontSize: 13 })}>→</div>
          <div style={smallBox(C.cyan, C.cyanBg, C.cyanText)}>EBS Disk</div>
        </div>
      </div>
      <div style={caption()}>automatic provisioning, no manual PV needed</div>
    </div>
  );
}

// ── 23. Sealed Secrets flow ─────────────────────────────────────────
function SealedSecretsDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 4, width: "100%", maxWidth: 280 })}>
        <div style={row({ gap: 6, flexWrap: "nowrap" })}>
          <div style={smallBox(C.amber, C.amberBg, C.amberText)}>Secret</div>
          <div style={col({ gap: 1 })}>
            <span style={{ fontSize: 8, color: C.cyanText, fontFamily: MONO }}>kubeseal</span>
            <div style={arrow({ fontSize: 13 })}>→</div>
          </div>
          <div style={smallBox(C.cyan, C.cyanBg, C.cyanText)}>SealedSecret</div>
        </div>
        <div style={arrow()}>↓</div>
        <div style={box(C.purple, C.purpleBg, { padding: "6px 10px", width: "100%" })}>
          <div style={label(C.purpleText, { fontSize: 10 })}>Git repo</div>
          <div style={subLabel({ marginTop: 3 })}>safe to commit</div>
        </div>
        <div style={arrow()}>↓</div>
        <div style={row({ gap: 6, flexWrap: "nowrap" })}>
          <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px" })}>
            <div style={label(C.indigoText, { fontSize: 10 })}>Controller</div>
            <div style={subLabel({ marginTop: 3 })}>private key</div>
          </div>
          <div style={col({ gap: 1 })}>
            <span style={{ fontSize: 8, color: C.greenText, fontFamily: MONO }}>decrypt</span>
            <div style={arrow({ fontSize: 13 })}>→</div>
          </div>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>Secret</div>
        </div>
      </div>
      <div style={caption()}>encrypt for git, decrypt in cluster</div>
    </div>
  );
}

// ── 24. External Secrets Operator flow ──────────────────────────────
function ESODiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap" })}>
        <div style={col({ gap: 3 })}>
          <div style={box(C.amber, C.amberBg, { padding: "6px 10px" })}>
            <div style={label(C.amberText, { fontSize: 10 })}>AWS SM</div>
            <div style={subLabel({ marginTop: 3 })}>provider</div>
          </div>
        </div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.cyanText, fontFamily: MONO }}>sync</span>
          <div style={arrow({ fontSize: 13 })}>→</div>
        </div>
        <div style={col({ gap: 3 })}>
          <div style={box(C.cyan, C.cyanBg, { padding: "6px 8px" })}>
            <div style={label(C.cyanText, { fontSize: 10 })}>ESO</div>
          </div>
          <div style={subLabel()}>ExternalSecret</div>
        </div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.greenText, fontFamily: MONO }}>create</span>
          <div style={arrow({ fontSize: 13 })}>→</div>
        </div>
        <div style={col({ gap: 3 })}>
          <div style={box(C.green, C.greenBg, { padding: "6px 10px" })}>
            <div style={label(C.greenText, { fontSize: 10 })}>Secret</div>
            <div style={subLabel({ marginTop: 3 })}>K8s</div>
          </div>
        </div>
      </div>
      <div style={caption()}>values stay in provider, config in Git</div>
    </div>
  );
}

// ── 25. Helm Chart rendering flow ───────────────────────────────────
function HelmChartDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 4, width: "100%", maxWidth: 280 })}>
        <div style={box(C.indigo, C.indigoBg, { width: "100%", padding: "8px 10px" })}>
          <div style={label(C.indigoText, { marginBottom: 6, fontSize: 10 })}>Helm Chart</div>
          <div style={row({ gap: 6 })}>
            <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { fontSize: 8, padding: "3px 6px" })}>templates/</div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>+</span>
            <div style={smallBox(C.amber, C.amberBg, C.amberText, { fontSize: 8, padding: "3px 6px" })}>values.yaml</div>
          </div>
        </div>
        <div style={col({ gap: 1 })}>
          <span style={{ fontSize: 8, color: C.cyanText, fontFamily: MONO }}>helm install</span>
          <div style={arrow()}>↓</div>
        </div>
        <div style={row({ gap: 6 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { fontSize: 8, padding: "4px 6px" })}>Deploy</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { fontSize: 8, padding: "4px 6px" })}>Service</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { fontSize: 8, padding: "4px 6px" })}>ConfigMap</div>
        </div>
      </div>
      <div style={caption()}>templates + values = rendered K8s resources</div>
    </div>
  );
}

// ── 26. CronJob → Job → Pod ─────────────────────────────────────────
function CronJobDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.purple, C.purpleBg, { width: "100%", maxWidth: 280 })}>
        <div style={label(C.purpleText, { marginBottom: 4 })}>CronJob</div>
        <div style={subLabel({ marginBottom: 6 })}>schedule: "0 */6 * * *"</div>
        <div style={col({ gap: 4, width: "100%" })}>
          <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px", width: "100%" })}>
            <div style={label(C.indigoText, { fontSize: 10, marginBottom: 4 })}>Job (run 1)</div>
            <div style={row({ gap: 4 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 6px", fontSize: 9 })}>Pod ✓</div>
            </div>
          </div>
          <div style={box(C.indigo, C.indigoBg, { padding: "6px 10px", width: "100%", opacity: 0.5, borderStyle: "dashed" })}>
            <div style={label(C.indigoText, { fontSize: 10, marginBottom: 4 })}>Job (run 2)</div>
            <div style={row({ gap: 4 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "3px 6px", fontSize: 9, opacity: 0.6 })}>Pod</div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption()}>scheduled Jobs, each creates a Pod</div>
    </div>
  );
}

// ── 27. Namespace isolation ───────────────────────────────────────────
function NamespaceDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { width: "100%", maxWidth: 280 })}>
        <div style={label(C.indigoText, { marginBottom: 8 })}>Cluster</div>
        <div style={col({ gap: 6, width: "100%" })}>
          <div style={box(C.green, C.greenBg, { padding: "6px 10px", width: "100%" })}>
            <div style={label(C.greenText, { fontSize: 10, marginBottom: 4 })}>ns: dev</div>
            <div style={row({ gap: 4 })}>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "3px 6px", fontSize: 8 })}>Pod</div>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "3px 6px", fontSize: 8 })}>Svc</div>
            </div>
          </div>
          <div style={box(C.amber, C.amberBg, { padding: "6px 10px", width: "100%" })}>
            <div style={label(C.amberText, { fontSize: 10, marginBottom: 4 })}>ns: staging</div>
            <div style={row({ gap: 4 })}>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "3px 6px", fontSize: 8 })}>Pod</div>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "3px 6px", fontSize: 8 })}>Svc</div>
            </div>
          </div>
          <div style={box(C.red, C.redBg, { padding: "6px 10px", width: "100%" })}>
            <div style={label(C.redText, { fontSize: 10, marginBottom: 4 })}>ns: prod</div>
            <div style={row({ gap: 4 })}>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "3px 6px", fontSize: 8 })}>Pod</div>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "3px 6px", fontSize: 8 })}>Svc</div>
              <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { padding: "3px 6px", fontSize: 8 })}>Quota</div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption()}>each Namespace isolates its own resources</div>
    </div>
  );
}

// ── 28. PodDisruptionBudget ───────────────────────────────────────────
function PdbDiagram() {
  const pod = (ok, extra) => ({
    width: 44, height: 44, borderRadius: 10,
    border: `1.5px solid ${ok ? C.green : C.red}`,
    background: ok ? C.greenBg : C.redBg,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 2, ...extra,
  });
  const check = { fontSize: 13, color: C.greenText, fontWeight: 700 };
  const cross = { fontSize: 13, color: C.redText, fontWeight: 700 };
  const podLabel = (c) => ({ fontSize: 8, fontFamily: MONO, fontWeight: 600, color: c, letterSpacing: 0.3 });
  const phase = (text) => ({
    fontSize: 9, fontFamily: MONO, fontWeight: 600,
    color: "rgba(255,255,255,0.55)", letterSpacing: 0.3,
    textAlign: "center", marginBottom: 4,
  });

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 280 }}>
        <div style={subLabel({ textAlign: "center", marginBottom: 6 })}>replicas: 3 &nbsp; minAvailable: 2</div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 10 }}>
          <div style={{ textAlign: "center" }}>
            <div style={phase()}>Before drain</div>
            <div style={row({ gap: 6 })}>
              <div style={pod(true)}><span style={podLabel(C.greenText)}>Pod</span><span style={check}>&#10003;</span></div>
              <div style={pod(true)}><span style={podLabel(C.greenText)}>Pod</span><span style={check}>&#10003;</span></div>
              <div style={pod(true)}><span style={podLabel(C.greenText)}>Pod</span><span style={check}>&#10003;</span></div>
            </div>
          </div>
        </div>

        <div style={{ ...dashed, marginBottom: 10 }} />

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={phase()}>Node drain</div>
            <div style={row({ gap: 6 })}>
              <div style={pod(true)}><span style={podLabel(C.greenText)}>Pod</span><span style={check}>&#10003;</span></div>
              <div style={pod(true)}><span style={podLabel(C.greenText)}>Pod</span><span style={check}>&#10003;</span></div>
              <div style={pod(false, { borderStyle: "dashed" })}><span style={podLabel(C.redText)}>Pod</span><span style={cross}>&#10007;</span></div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption({ maxWidth: 260 })}>Eviction blocked — PDB requires at least 2 Pods available</div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAZY RENDERING — only mount diagram when scrolled into view
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LazyDiagram({ children, diagramId }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true); // fallback: render immediately
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          trackDiagramShown(diagramId);
          obs.disconnect();
        }
      },
      { rootMargin: "150px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [diagramId]);

  return (
    <div ref={ref} style={{ minHeight: visible ? "auto" : 130 }}>
      {visible ? children : null}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYTICS — track shown / skipped per diagram
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STATS_KEY = "k8s-diagram-stats";

function loadStats() {
  try { return JSON.parse(sessionStorage.getItem(STATS_KEY) || "{}"); }
  catch { return {}; }
}

function saveStats(stats) {
  try { sessionStorage.setItem(STATS_KEY, JSON.stringify(stats)); }
  catch { /* quota exceeded or private mode */ }
}

function trackDiagramShown(diagramId) {
  if (!diagramId) return;
  const stats = loadStats();
  if (!stats[diagramId]) stats[diagramId] = { shown: 0, skipped: 0 };
  stats[diagramId].shown++;
  saveStats(stats);
}

function trackDiagramSkipped(diagramId) {
  if (!diagramId) return;
  const stats = loadStats();
  if (!stats[diagramId]) stats[diagramId] = { shown: 0, skipped: 0 };
  stats[diagramId].skipped++;
  saveStats(stats);
}

/** Read diagram analytics. Call from console: getDiagramStats() */
export function getDiagramStats() { return loadStats(); }

// Expose to window for easy console access
if (typeof window !== "undefined") {
  window.__diagramStats = getDiagramStats;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIAGRAM REGISTRY — explicit per-question mapping (replaces regex)
//
// Each diagram has a unique ID, a relevance score (1–5), and a
// component reference. Only diagrams with score >= 4 are registered.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT REGISTRY — resolves config string keys to React components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COMPONENT_MAP = {
  PodDiagram,
  DeploymentHierarchyDiagram,
  ServiceTypesDiagram,
  IngressRoutingDiagram,
  ServiceEndpointsDiagram,
  PvPvcDiagram,
  RollingUpdateDiagram,
  DaemonSetDiagram,
  StatefulSetDiagram,
  RbacDiagram,
  NetworkPolicyDiagram,
  HpaDiagram,
  ProbesDiagram,
  TaintsTolerationsDiagram,
  IngressVsLbDiagram,
  HeadlessServiceDiagram,
  TopologySpreadDiagram,
  ArgoCdSyncDiagram,
  RoleScopeDiagram,
  PsaAdmissionDiagram,
  ConfigMapMountDiagram,
  DynamicProvisioningDiagram,
  SealedSecretsDiagram,
  ESODiagram,
  HelmChartDiagram,
  CronJobDiagram,
  NamespaceDiagram,
  PdbDiagram,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEV VALIDATION — warn about misconfigured tags (dev only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (process.env.NODE_ENV !== "production") {
  for (const [tag, cfg] of Object.entries(TAG_DIAGRAM_CONFIG)) {
    if (!COMPONENT_MAP[cfg.component]) {
      console.warn(
        `[QuizDiagrams] TAG_DIAGRAM_CONFIG["${tag}"] references unknown component "${cfg.component}". ` +
        `Add it to COMPONENT_MAP in QuizDiagrams.jsx or fix the config in diagramMapping.js.`
      );
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Returns a lazy-loaded diagram element for a question, or null.
 * Uses ONLY the question's tags array — no string matching.
 *
 * Selection: picks the tag with the highest diagram score (not first-match).
 * This avoids hidden priority bugs when questions carry multiple tags.
 *
 * - Only renders diagrams with relevance score >= MIN_SCORE
 * - Max 1 diagram per question (highest score wins; ties: first in tags order)
 * - Returns null if tags are absent, empty, or none map to a diagram
 * - Warns in dev mode when a tag has no mapping (possible typo)
 *
 * @param {string[]} [tags] - The question's tags array
 * @returns {React.ReactElement|null}
 */
export function getDiagramForQuestion(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

  // Find the highest-scoring tag that maps to a diagram
  let bestTag = null;
  let bestScore = -1;
  let BestComponent = null;

  for (const tag of tags) {
    const cfg = TAG_DIAGRAM_CONFIG[tag];
    if (!cfg) {
      // Tag exists on question but has no diagram mapping -- this is fine
      // (many tags are informational only, e.g. "dns", "port-mapping").
      // In dev mode, warn for unrecognised tags to catch typos.
      if (process.env.NODE_ENV !== "production" && !_knownInfoTags.has(tag)) {
        console.warn(
          `[QuizDiagrams] Tag "${tag}" has no diagram mapping. ` +
          `If intentional, add it to _knownInfoTags. Otherwise add it to diagramMapping.js.`
        );
      }
      continue;
    }

    const Comp = COMPONENT_MAP[cfg.component];
    if (!Comp) continue;

    if (cfg.score > bestScore) {
      bestTag = tag;
      bestScore = cfg.score;
      BestComponent = Comp;
    }
  }

  if (!bestTag || !BestComponent) return null;

  if (bestScore < MIN_SCORE) {
    trackDiagramSkipped(bestTag);
    return null;
  }

  return (
    <LazyDiagram diagramId={bestTag}>
      <BestComponent />
    </LazyDiagram>
  );
}

// Tags that intentionally have no diagram — suppress dev warnings
const _knownInfoTags = new Set([
  "dns", "port-mapping", "traffic-policy", "admission-control",
  "resource-limits", "qos-eviction", "node-lifecycle", "storage-interface",
  "storage-zone", "config-mount", "image-pull", "dns-resolution",
  "pod-disruption", "dynamic-provisioning",
]);
