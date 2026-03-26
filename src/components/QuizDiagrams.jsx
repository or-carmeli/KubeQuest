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
// DIAGRAM COMPONENTS -19 kept (score >= 4)
//
// Removed 9 low-value diagrams:
//   PortTargetPortDiagram  (score 2) -trivial port mapping, text sufficient
//   CsiDiagram             (score 2) -just a vendor list, no architecture
//   AdmissionWebhookDiagram(score 2) -linear pipeline, text sufficient
//   QosDiagram             (score 2) -just ordering 3 items
//   LimitRangeVsQuotaDiagram(score 2)— simple comparison, text sufficient
//   PdbDiagram             (score 2) -"min 2, can evict 1" obvious from text
//   SyncWavesDiagram       (score 2) -sequential 3-step list
//   NodeDrainDiagram       (score 3) -simple before/after, 2 nodes
//   CoreDnsDiagram         (score 3) -simple 3-node chain
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
      <div style={caption({ maxWidth: 260 })}>Eviction blocked - PDB requires at least 2 Pods available</div>
    </div>
  );
}

// ── OOMKilled Flow ──────────────────────────────────────────────────
function OomKilledDiagram() {
  const steps = [
    { text: "Container memory usage",  color: C.green,  bg: C.greenBg,  textColor: C.greenText },
    { text: "Exceeds limits.memory",   color: C.amber,  bg: C.amberBg,  textColor: C.amberText },
    { text: "OOM Killer triggered",    color: C.red,    bg: C.redBg,    textColor: C.redText },
    { text: "Exit Code 137",           color: C.red,    bg: C.redBg,    textColor: C.redText },
    { text: "CrashLoopBackOff",        color: C.purple, bg: C.purpleBg, textColor: C.purpleText },
  ];

  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{
              ...smallBox(s.color, s.bg, s.textColor, {
                width: "100%", padding: "7px 14px", fontSize: 11,
              }),
            }}>
              {s.text}
            </div>
            {i < steps.length - 1 && (
              <div style={{ textAlign: "center", padding: "2px 0" }}>
                <span style={arrow({ fontSize: 11 })}>&#8595;</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={caption()}>cgroup limit → kernel kills process → Pod restarts</div>
    </div>
  );
}

// ── Requests vs Limits ───────────────────────────────────────────────
function RequestsLimitsDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={{ width: "100%", position: "relative", height: 60, marginBottom: 6 }}>
          {/* Bar background */}
          <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
          {/* Requests zone */}
          <div style={{ position: "absolute", top: 14, left: 0, width: "40%", height: 32, borderRadius: "8px 0 0 8px", background: C.greenBg, borderTop: `1.5px solid ${C.green}`, borderBottom: `1.5px solid ${C.green}`, borderLeft: `1.5px solid ${C.green}` }} />
          {/* Limits marker */}
          <div style={{ position: "absolute", top: 12, left: "70%", width: 2, height: 36, background: C.redText, borderRadius: 1 }} />
          {/* Labels */}
          <div style={{ position: "absolute", top: 0, left: "40%", transform: "translateX(-100%)", ...label(C.greenText, { fontSize: 8 }) }}>requests</div>
          <div style={{ position: "absolute", top: 0, left: "70%", transform: "translateX(-50%)", ...label(C.redText, { fontSize: 8 }) }}>limits</div>
          {/* Usage arrow */}
          <div style={{ position: "absolute", top: 50, left: "10%", fontSize: 8, fontFamily: MONO, color: C.amberText }}>◀ scheduled here</div>
          <div style={{ position: "absolute", top: 50, right: "5%", fontSize: 8, fontFamily: MONO, color: C.redText }}>killed ▶</div>
        </div>
      </div>
      <div style={caption()}>requests = scheduling guarantee | limits = hard ceiling</div>
    </div>
  );
}

// ── ConfigMap vs Secret ─────────────────────────────────────────────
function ConfigMapVsSecretDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, alignItems: "stretch" })}>
        <div style={box(C.cyan, C.cyanBg, { flex: 1, padding: "8px 10px" })}>
          <div style={label(C.cyanText, { fontSize: 10, marginBottom: 4 })}>ConfigMap</div>
          <div style={subLabel({ fontSize: 8, lineHeight: 1.4 })}>plain text<br />not encrypted<br />config data</div>
        </div>
        <div style={box(C.amber, C.amberBg, { flex: 1, padding: "8px 10px" })}>
          <div style={label(C.amberText, { fontSize: 10, marginBottom: 4 })}>Secret</div>
          <div style={subLabel({ fontSize: 8, lineHeight: 1.4 })}>base64 encoded<br />access-controlled<br />sensitive data</div>
        </div>
      </div>
      <div style={{ ...dashed, width: "100%", maxWidth: 280, marginTop: 6, marginBottom: 2 }} />
      <div style={subLabel({ textAlign: "center", fontSize: 8 })}>both mount as env vars or volume files</div>
      <div style={caption()}>Secrets are base64-encoded, not encrypted by default</div>
    </div>
  );
}

// ── LimitRange vs ResourceQuota ─────────────────────────────────────
function LimitRangeVsQuotaDiagram() {
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { width: "100%", maxWidth: 280 })}>
        <div style={label(C.indigoText, { marginBottom: 8 })}>Namespace</div>
        <div style={col({ gap: 6, width: "100%" })}>
          <div style={smallBox(C.amber, C.amberBg, C.amberText, { width: "100%", padding: "6px 10px", textAlign: "left" })}>
            <span style={{ fontWeight: 700 }}>LimitRange</span>
            <span style={{ fontSize: 8, opacity: 0.7 }}> - per Pod/container</span>
          </div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { width: "100%", padding: "6px 10px", textAlign: "left" })}>
            <span style={{ fontWeight: 700 }}>ResourceQuota</span>
            <span style={{ fontSize: 8, opacity: 0.7 }}> - total namespace</span>
          </div>
        </div>
      </div>
      <div style={caption()}>LimitRange = per-object defaults | Quota = namespace-wide cap</div>
    </div>
  );
}

// ── DNS Resolution Path ─────────────────────────────────────────────
function DnsResolutionDiagram() {
  const steps = [
    { text: "Pod", color: C.green, bg: C.greenBg, textColor: C.greenText },
    { text: "CoreDNS", color: C.cyan, bg: C.cyanBg, textColor: C.cyanText },
    { text: "Service IP", color: C.indigo, bg: C.indigoBg, textColor: C.indigoText },
  ];
  return (
    <div style={wrap}>
      <div style={row({ gap: 6, width: "100%", maxWidth: 280, flexWrap: "nowrap", alignItems: "center" })}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={arrow({ fontSize: 12 })}>&rarr;</span>}
            <div style={smallBox(s.color, s.bg, s.textColor, { flex: 1, padding: "7px 8px", fontSize: 9, minWidth: 0 })}>
              {s.text}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={subLabel({ textAlign: "center", fontSize: 8, marginTop: 4 })}>
        svc.namespace.svc.cluster.local
      </div>
      <div style={caption()}>CoreDNS resolves Service names to cluster IPs</div>
    </div>
  );
}

// ── CrashLoopBackOff Flow ───────────────────────────────────────────
function CrashLoopDiagram() {
  const steps = [
    { text: "Container starts",    color: C.green,  bg: C.greenBg,  textColor: C.greenText },
    { text: "Crashes immediately",  color: C.red,    bg: C.redBg,    textColor: C.redText },
    { text: "Kubelet restarts it",  color: C.amber,  bg: C.amberBg,  textColor: C.amberText },
    { text: "Back-off delay grows", color: C.purple, bg: C.purpleBg, textColor: C.purpleText },
  ];
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={smallBox(s.color, s.bg, s.textColor, { width: "100%", padding: "6px 14px", fontSize: 10 })}>
              {s.text}
            </div>
            {i < steps.length - 1 && (
              <div style={{ textAlign: "center", padding: "1px 0" }}>
                <span style={arrow({ fontSize: 10 })}>{i === steps.length - 2 ? "↻" : "↓"}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={caption()}>10s → 20s → 40s … up to 5 min between restarts</div>
    </div>
  );
}

// ── ImagePullBackOff Flow ───────────────────────────────────────────
function ImagePullDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={smallBox(C.indigo, C.indigoBg, C.indigoText, { width: "100%", padding: "7px 14px", fontSize: 10 })}>
          kubelet pulls image
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 10 })}>&#8595;</span>
        </div>
        <div style={smallBox(C.red, C.redBg, C.redText, { width: "100%", padding: "7px 14px", fontSize: 10 })}>
          Pull fails
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 10 })}>&#8595;</span>
        </div>
        <div style={row({ gap: 6, width: "100%" })}>
          <div style={smallBox(C.amber, C.amberBg, C.amberText, { flex: 1, padding: "6px 8px", fontSize: 9 })}>
            wrong name/tag
          </div>
          <div style={smallBox(C.amber, C.amberBg, C.amberText, { flex: 1, padding: "6px 8px", fontSize: 9 })}>
            missing pull secret
          </div>
        </div>
      </div>
      <div style={caption()}>two most common causes of ImagePullBackOff</div>
    </div>
  );
}

// ── Kubelet Role ────────────────────────────────────────────────────
function KubeletDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280, alignItems: "center" })}>
        <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "7px 20px", fontSize: 10 })}>
          API Server
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 10 })}>&#8595; PodSpec</span>
        </div>
        <div style={box(C.indigo, C.indigoBg, { width: "100%", padding: "8px 14px" })}>
          <div style={label(C.indigoText, { marginBottom: 6 })}>Node</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { width: "100%", padding: "6px 10px", fontSize: 10, marginBottom: 4 })}>
            kubelet
          </div>
          <div style={smallBox(C.amber, C.amberBg, C.amberText, { width: "100%", padding: "5px 10px", fontSize: 9, marginBottom: 6 })}>
            container runtime (containerd)
          </div>
          <div style={box(C.purple, C.purpleBg, { width: "100%", padding: "6px 8px" })}>
            <div style={label(C.purpleText, { marginBottom: 4, fontSize: 9 })}>Pod</div>
            <div style={row({ gap: 6 })}>
              <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { flex: 1, padding: "4px 6px", fontSize: 9, border: `1px solid ${C.purple}` })}>container</div>
              <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { flex: 1, padding: "4px 6px", fontSize: 9, border: `1px solid ${C.purple}` })}>container</div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption()}>kubelet ensures containers match the desired PodSpec</div>
    </div>
  );
}

// ── kube-proxy routing ──────────────────────────────────────────────
function KubeProxyDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 260, alignItems: "center" })}>
        <div style={smallBox(C.amber, C.amberBg, C.amberText, { padding: "6px 18px", fontSize: 10 })}>
          Client
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 10 })}>{"\u2193"}</span>
        </div>
        <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { width: "100%", padding: "6px 10px", fontSize: 10 })}>
          Service (virtual IP)
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 10 })}>{"\u2193"}</span>
        </div>
        <div style={box(C.indigo, C.indigoBg, { width: "100%", padding: "8px 12px" })}>
          <div style={label(C.indigoText, { marginBottom: 2, fontSize: 10 })}>kube-proxy</div>
          <div style={subLabel({ textAlign: "center", fontSize: 8 })}>iptables / IPVS</div>
        </div>
        <div style={{ textAlign: "center", padding: "2px 0", display: "flex", justifyContent: "center", gap: 20 }}>
          <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
          <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
          <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
        </div>
        <div style={row({ gap: 6 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "5px 10px", fontSize: 9 })}>Pod</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "5px 10px", fontSize: 9 })}>Pod</div>
          <div style={smallBox(C.green, C.greenBg, C.greenText, { padding: "5px 10px", fontSize: 9 })}>Pod</div>
        </div>
      </div>
      <div style={caption()}>kube-proxy routes Service traffic to Pods</div>
    </div>
  );
}

// ── etcd Restore Flow ───────────────────────────────────────────────
function EtcdRestoreDiagram() {
  const step = (text) => (
    <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { width: "100%", padding: "5px 10px", fontSize: 9 })}>{text}</div>
  );
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 220, alignItems: "center" })}>
        {step("snapshot")}
        <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
        {step("etcdctl snapshot restore")}
        <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
        {step("new data directory")}
        <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
        {step("update etcd static pod")}
        <span style={arrow({ fontSize: 9 })}>{"\u2193"}</span>
        {step("kubelet restarts etcd")}
      </div>
    </div>
  );
}

// ── CNI NotReady ────────────────────────────────────────────────────
function CniNotReadyDiagram() {
  const stateBox = (text, color, bg, borderColor, icon) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, border: `1px solid ${borderColor}`, background: bg, fontSize: 9, fontWeight: 600, fontFamily: MONO, color }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  );
  return (
    <div style={wrap}>
      <div style={row({ gap: 14, width: "100%", maxWidth: 280, alignItems: "stretch" })}>
        <div style={col({ gap: 4, flex: 1 })}>
          <div style={subLabel({ textAlign: "center", fontSize: 9, fontWeight: 700 })}>Before CNI</div>
          <div style={box(C.amber, C.amberBg, { padding: "8px 10px", flex: 1 })}>
            <div style={label(C.amberText, { fontSize: 9, marginBottom: 6 })}>Node</div>
            {stateBox("NotReady", C.amberText, C.amberBg, C.amber, "\u2718")}
            <div style={{ marginTop: 5, fontSize: 8, color: "rgba(255,255,255,0.4)", textAlign: "center", fontFamily: MONO }}>Pod network {"\u2718"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={arrow({ fontSize: 14 })}>{"\u2192"}</span>
        </div>
        <div style={col({ gap: 4, flex: 1 })}>
          <div style={subLabel({ textAlign: "center", fontSize: 9, fontWeight: 700 })}>After CNI</div>
          <div style={box(C.green, C.greenBg, { padding: "8px 10px", flex: 1 })}>
            <div style={label(C.greenText, { fontSize: 9, marginBottom: 6 })}>Node</div>
            {stateBox("Ready", C.greenText, C.greenBg, C.green, "\u2714")}
            <div style={{ marginTop: 5, fontSize: 8, color: "rgba(255,255,255,0.4)", textAlign: "center", fontFamily: MONO }}>Pod network {"\u2714"}</div>
          </div>
        </div>
      </div>
      <div style={{ ...caption(), marginTop: 8 }}>
        <span style={{ fontSize: 9, opacity: 0.7 }}>Calico / Flannel / Cilium</span>
      </div>
    </div>
  );
}

// ── etcd Data Store ─────────────────────────────────────────────────
function EtcdDataDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280, alignItems: "center" })}>
        <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { padding: "7px 20px", fontSize: 10 })}>
          API Server
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 10 })}>&#8595; read/write</span>
        </div>
        <div style={box(C.green, C.greenBg, { width: "100%", padding: "8px 14px" })}>
          <div style={label(C.greenText, { marginBottom: 6 })}>etcd</div>
          <div style={row({ gap: 4, flexWrap: "wrap" })}>
            {["Pods", "Services", "Secrets", "ConfigMaps"].map((r) => (
              <div key={r} style={smallBox(C.indigo, C.indigoBg, C.indigoText, { padding: "3px 8px", fontSize: 8 })}>{r}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={caption()}>etcd is the single source of truth for all cluster state</div>
    </div>
  );
}

// ── Control Plane Components ─────────────────────────────────────────
function ControlPlaneDiagram() {
  const roleLabel = (text) => ({
    fontSize: 8, color: "rgba(255,255,255,0.4)", fontFamily: MONO,
    textAlign: "center", marginTop: 2, lineHeight: 1.2,
  });
  return (
    <div style={wrap}>
      <div style={box(C.indigo, C.indigoBg, { width: "100%", maxWidth: 300 })}>
        <div style={label(C.indigoText, { marginBottom: 10 })}>Control Plane</div>
        <div style={col({ gap: 8, width: "100%" })}>
          {/* API Server - entry point */}
          <div style={col({ gap: 2, width: "100%" })}>
            <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { width: "100%", padding: "7px 10px" })}>
              API Server
            </div>
            <div style={roleLabel()}>all requests go through here</div>
          </div>
          {/* Arrow */}
          <div style={arrow({ textAlign: "center", fontSize: 13, margin: "-2px 0" })}>↓</div>
          {/* 3 components */}
          <div style={row({ gap: 6, width: "100%", alignItems: "flex-start" })}>
            <div style={col({ gap: 2, flex: 1 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText, { width: "100%", padding: "6px 4px" })}>
                etcd
              </div>
              <div style={roleLabel()}>state store</div>
            </div>
            <div style={col({ gap: 2, flex: 1 })}>
              <div style={smallBox(C.amber, C.amberBg, C.amberText, { width: "100%", padding: "6px 4px" })}>
                Scheduler
              </div>
              <div style={roleLabel()}>Pod placement</div>
            </div>
            <div style={col({ gap: 2, flex: 1 })}>
              <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { width: "100%", padding: "6px 4px" })}>
                Controller<br/>Manager
              </div>
              <div style={roleLabel()}>control loops</div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption()}>API Server is the single entry point - all components communicate through it</div>
    </div>
  );
}

// ── Static Pod vs API-managed Pod ───────────────────────────────────
function StaticPodDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={row({ gap: 6, width: "100%", alignItems: "stretch" })}>
          <div style={box(C.amber, C.amberBg, { flex: 1, padding: "8px 10px" })}>
            <div style={label(C.amberText, { fontSize: 10, marginBottom: 4 })}>Static Pod</div>
            <div style={subLabel({ fontSize: 8, lineHeight: 1.4 })}>
              manifest file<br />→ kubelet
            </div>
          </div>
          <div style={box(C.green, C.greenBg, { flex: 1, padding: "8px 10px" })}>
            <div style={label(C.greenText, { fontSize: 10, marginBottom: 4 })}>Regular Pod</div>
            <div style={subLabel({ fontSize: 8, lineHeight: 1.4 })}>
              API Server<br />→ Scheduler → kubelet
            </div>
          </div>
        </div>
        <div style={{ ...dashed, marginTop: 8, marginBottom: 4 }} />
        <div style={subLabel({ textAlign: "center", fontSize: 8 })}>
          /etc/kubernetes/manifests/
        </div>
      </div>
      <div style={caption()}>kubelet manages Static Pods directly from manifest files</div>
    </div>
  );
}

// ── etcd Quorum ─────────────────────────────────────────────────────
function EtcdQuorumDiagram() {
  const members = [
    { ok: true }, { ok: true }, { ok: false },
  ];
  const nodeStyle = (ok) => ({
    width: 38, height: 38, borderRadius: 10,
    border: `1.5px solid ${ok ? C.green : C.red}`,
    background: ok ? C.greenBg : C.redBg,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 700, fontFamily: MONO,
    color: ok ? C.greenText : C.redText,
  });

  return (
    <div style={wrap}>
      <div style={col({ gap: 6, width: "100%", maxWidth: 280 })}>
        <div style={subLabel({ textAlign: "center", fontSize: 10 })}>3 members - quorum: 2</div>
        <div style={row({ gap: 10 })}>
          {members.map((m, i) => (
            <div key={i} style={col({ gap: 2, alignItems: "center" })}>
              <div style={nodeStyle(m.ok)}>{m.ok ? "etcd" : "etcd"}</div>
              <span style={{ fontSize: 8, fontFamily: MONO, color: m.ok ? C.greenText : C.redText }}>
                {m.ok ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
        <div style={smallBox(C.green, C.greenBg, C.greenText, { width: "100%", padding: "5px 10px", fontSize: 9, textAlign: "center" })}>
          quorum maintained - cluster operational
        </div>
      </div>
      <div style={caption()}>odd number prevents split-brain | 3 tolerates 1 failure</div>
    </div>
  );
}

// ── Stacked vs External etcd ────────────────────────────────────────
function StackedVsExternalEtcdDiagram() {
  const cpItem = (text, sz = 8) => (
    <div style={smallBox(C.indigo, C.indigoBg, C.indigoText, { padding: "3px 6px", fontSize: sz, width: "100%" })}>{text}</div>
  );
  const etcdItem = (sz = 8) => (
    <div style={smallBox(C.purple, C.purpleBg, C.purpleText, { padding: "3px 6px", fontSize: sz, width: "100%" })}>etcd</div>
  );
  return (
    <div style={wrap}>
      <div style={row({ gap: 8, width: "100%", maxWidth: 290, alignItems: "flex-start" })}>
        <div style={col({ gap: 4, flex: 1 })}>
          <div style={subLabel({ textAlign: "center", fontSize: 9, fontWeight: 700 })}>Stacked</div>
          <div style={box(C.amber, C.amberBg, { padding: "6px 6px", width: "100%" })}>
            <div style={label(C.amberText, { fontSize: 8, marginBottom: 4 })}>CP Node</div>
            {cpItem("API Server")}
            {cpItem("Scheduler")}
            {cpItem("Controller Mgr")}
            {etcdItem()}
          </div>
          <div style={box(C.amber, C.amberBg, { padding: "6px 6px", width: "100%" })}>
            <div style={label(C.amberText, { fontSize: 8, marginBottom: 4 })}>CP Node</div>
            {cpItem("API Server")}
            {cpItem("Scheduler")}
            {cpItem("Controller Mgr")}
            {etcdItem()}
          </div>
          <div style={subLabel({ marginTop: 2, textAlign: "center", fontSize: 7 })}>simpler setup</div>
        </div>
        <div style={col({ gap: 4, flex: 1 })}>
          <div style={subLabel({ textAlign: "center", fontSize: 9, fontWeight: 700 })}>External</div>
          <div style={box(C.green, C.greenBg, { padding: "6px 6px", width: "100%" })}>
            <div style={label(C.greenText, { fontSize: 8, marginBottom: 4 })}>CP Node</div>
            {cpItem("API Server")}
            {cpItem("Scheduler")}
            {cpItem("Controller Mgr")}
          </div>
          <div style={{ ...dashed, width: "80%", alignSelf: "center" }} />
          <div style={box(C.purple, C.purpleBg, { padding: "6px 6px", width: "100%" })}>
            <div style={label(C.purpleText, { fontSize: 8, marginBottom: 4 })}>etcd Cluster</div>
            {etcdItem()}
            {etcdItem()}
            {etcdItem()}
          </div>
          <div style={subLabel({ marginTop: 2, textAlign: "center", fontSize: 7 })}>higher resilience</div>
        </div>
      </div>
      <div style={caption()}>external etcd survives Control Plane node failure</div>
    </div>
  );
}

// ── Kubeadm Upgrade Flow ────────────────────────────────────────────
function KubeadmUpgradeDiagram() {
  const steps = [
    { text: "drain Node",         color: C.amber,  bg: C.amberBg,  textColor: C.amberText },
    { text: "upgrade kubeadm",    color: C.indigo,  bg: C.indigoBg,  textColor: C.indigoText },
    { text: "upgrade kubelet",    color: C.indigo,  bg: C.indigoBg,  textColor: C.indigoText },
    { text: "restart kubelet",    color: C.purple, bg: C.purpleBg, textColor: C.purpleText },
    { text: "uncordon Node",      color: C.green,  bg: C.greenBg,  textColor: C.greenText },
  ];

  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={smallBox(s.color, s.bg, s.textColor, { width: "100%", padding: "6px 14px", fontSize: 10 })}>
              {s.text}
            </div>
            {i < steps.length - 1 && (
              <div style={{ textAlign: "center", padding: "1px 0" }}>
                <span style={arrow({ fontSize: 10 })}>&#8595;</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={caption()}>repeat for each Worker Node after Control Plane upgrade</div>
    </div>
  );
}

// ── Restart Policy Comparison ────────────────────────────────────────
function RestartPolicyDiagram() {
  const policies = [
    { name: "Always",    desc: "restart always",      color: C.green,  bg: C.greenBg,  text: C.greenText, badge: "default" },
    { name: "OnFailure", desc: "restart if exit ≠ 0", color: C.amber,  bg: C.amberBg,  text: C.amberText, badge: null },
    { name: "Never",     desc: "no restart",          color: C.red,    bg: C.redBg,    text: C.redText,   badge: null },
  ];

  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={smallBox(C.indigo, C.indigoBg, C.indigoText, { width: "100%", padding: "7px 14px", fontSize: 11 })}>
          Container exits
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 11 })}>&#8595;</span>
        </div>
        <div style={col({ gap: 6, width: "100%" })}>
          {policies.map((p) => (
            <div key={p.name} style={{
              ...box(p.color, p.bg, {
                width: "100%", padding: "6px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }),
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={label(p.text, { fontSize: 11 })}>{p.name}</span>
                {p.badge && (
                  <span style={{
                    fontSize: 8, fontWeight: 700, color: p.text, fontFamily: MONO,
                    background: p.bg, border: `1px solid ${p.color}`,
                    borderRadius: 4, padding: "1px 5px", letterSpacing: 0.3,
                  }}>
                    {p.badge}
                  </span>
                )}
              </div>
              <span style={subLabel({ fontSize: 9 })}>{p.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={caption()}>most Deployments use Always</div>
    </div>
  );
}

// ── Service Stable IP ────────────────────────────────────────────────
function ServiceStableIpDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ width: "100%", maxWidth: 280, alignItems: "stretch" })}>
        <div style={{ ...box(C.red, C.redBg), flex: 1 }}>
          <div style={label(C.redText, { marginBottom: 6 })}>Pod restarts</div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: C.redText, textAlign: "center", lineHeight: 1.6 }}>
            <span style={{ textDecoration: "line-through", opacity: 0.5 }}>10.0.1.5</span>
            <span style={arrow({ margin: "0 4px" })}>&rarr;</span>
            10.0.1.9
          </div>
          <div style={subLabel({ marginTop: 4, textAlign: "center" })}>IP changes</div>
        </div>
        <div style={{ ...box(C.green, C.greenBg), flex: 1 }}>
          <div style={label(C.greenText, { marginBottom: 6 })}>Service</div>
          <div style={{ fontSize: 10, fontFamily: MONO, color: C.greenText, textAlign: "center" }}>
            10.96.0.10
          </div>
          <div style={subLabel({ marginTop: 4, textAlign: "center" })}>stable IP</div>
        </div>
      </div>
      <div style={caption()}>Pod IPs change on restart -- Service IP stays stable</div>
    </div>
  );
}

// ── Ingress Hostname Routing ─────────────────────────────────────────
function IngressHostnameDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={smallBox(C.indigo, C.indigoBg, C.indigoText, { width: "100%" })}>
          Client
        </div>
        <div style={{ textAlign: "center", padding: "2px 0" }}>
          <span style={arrow({ fontSize: 11 })}>&#8595;</span>
        </div>
        <div style={{ ...box(C.cyan, C.cyanBg, { width: "100%", padding: "10px 10px 8px" }) }}>
          <div style={label(C.cyanText, { marginBottom: 8 })}>Ingress Controller</div>
          <div style={col({ gap: 4, width: "100%" })}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 10, fontFamily: MONO }}>
              <span style={{ color: C.amberText }}>api.example.com</span>
              <span style={arrow()}>&rarr;</span>
              <span style={{ color: C.greenText }}>api-svc</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 10, fontFamily: MONO }}>
              <span style={{ color: C.amberText }}>web.example.com</span>
              <span style={arrow()}>&rarr;</span>
              <span style={{ color: C.greenText }}>web-svc</span>
            </div>
          </div>
        </div>
      </div>
      <div style={caption()}>hostname routing -- one IP, multiple domains</div>
    </div>
  );
}

// ── StatefulSet vs Deployment ────────────────────────────────────────
function StatefulSetVsDeploymentDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ width: "100%", maxWidth: 290, alignItems: "stretch" })}>
        <div style={{ ...box(C.indigo, C.indigoBg), flex: 1 }}>
          <div style={label(C.indigoText, { marginBottom: 6 })}>Deployment</div>
          <div style={col({ gap: 4 })}>
            <div style={smallBox(C.indigo, C.indigoBg, C.indigoText)}>pod-xk2f</div>
            <div style={smallBox(C.indigo, C.indigoBg, C.indigoText)}>pod-m9z1</div>
          </div>
          <div style={{ ...smallBox(C.purple, C.purpleBg, C.purpleText), marginTop: 6, width: "100%" }}>PVC (shared)</div>
        </div>
        <div style={{ ...box(C.green, C.greenBg), flex: 1 }}>
          <div style={label(C.greenText, { marginBottom: 6 })}>StatefulSet</div>
          <div style={col({ gap: 4 })}>
            <div style={col({ gap: 2 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText)}>pod-0</div>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { fontSize: 9 })}>pvc-0</div>
            </div>
            <div style={col({ gap: 2 })}>
              <div style={smallBox(C.green, C.greenBg, C.greenText)}>pod-1</div>
              <div style={smallBox(C.cyan, C.cyanBg, C.cyanText, { fontSize: 9 })}>pvc-1</div>
            </div>
          </div>
        </div>
      </div>
      <div style={caption({ maxWidth: 280 })}>random names + shared storage vs stable names + dedicated PVCs</div>
    </div>
  );
}

// ── WaitForFirstConsumer ─────────────────────────────────────────────
function WaitForConsumerDiagram() {
  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={subLabel({ textAlign: "center", marginBottom: 6, fontSize: 10 })}>Immediate</div>
        <div style={row({ gap: 4 })}>
          <div style={smallBox(C.amber, C.amberBg, C.amberText)}>PVC created</div>
          <span style={arrow()}>&rarr;</span>
          <div style={smallBox(C.amber, C.amberBg, C.amberText)}>PV bound (any zone)</div>
        </div>
        <div style={{ ...dashed, width: "100%", margin: "10px 0" }} />
        <div style={subLabel({ textAlign: "center", marginBottom: 6, fontSize: 10 })}>WaitForFirstConsumer</div>
        <div style={row({ gap: 4 })}>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>PVC created</div>
          <span style={arrow()}>&rarr;</span>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>Pod scheduled</div>
          <span style={arrow()}>&rarr;</span>
          <div style={smallBox(C.green, C.greenBg, C.greenText)}>PV bound (same zone)</div>
        </div>
      </div>
      <div style={caption()}>WaitForFirstConsumer ensures PV and Pod are co-located</div>
    </div>
  );
}

// ── Pod Status Phases ────────────────────────────────────────────────
function PodStatusPhasesDiagram() {
  return (
    <div style={wrap}>
      <div style={row({ width: "100%", maxWidth: 280 })}>
        <div style={{ ...box(C.amber, C.amberBg), flex: 1, textAlign: "center" }}>
          <div style={label(C.amberText, { marginBottom: 4 })}>Running</div>
          <div style={subLabel({ textAlign: "center" })}>container active</div>
          <div style={{ fontSize: 9, color: C.redText, marginTop: 4, fontFamily: MONO }}>not in endpoints</div>
        </div>
        <span style={arrow({ fontSize: 14 })}>&rarr;</span>
        <div style={{ ...box(C.green, C.greenBg), flex: 1, textAlign: "center" }}>
          <div style={label(C.greenText, { marginBottom: 4 })}>Ready</div>
          <div style={subLabel({ textAlign: "center" })}>probe passed</div>
          <div style={{ fontSize: 9, color: C.greenText, marginTop: 4, fontFamily: MONO }}>in Service endpoints &#10003;</div>
        </div>
      </div>
      <div style={caption({ maxWidth: 260 })}>Running &#8800; Ready -- readiness probe gates traffic</div>
    </div>
  );
}

// ── QoS Eviction Order ──────────────────────────────────────────────
function QosEvictionDiagram() {
  const qosClasses = [
    { name: "BestEffort",  color: C.red,    bg: C.redBg,    text: C.redText,    desc: "no requests/limits" },
    { name: "Burstable",   color: C.amber,  bg: C.amberBg,  text: C.amberText,  desc: "partial limits" },
    { name: "Guaranteed",  color: C.green,  bg: C.greenBg,  text: C.greenText,  desc: "requests = limits" },
  ];

  return (
    <div style={wrap}>
      <div style={col({ gap: 0, width: "100%", maxWidth: 280 })}>
        <div style={subLabel({ textAlign: "center", marginBottom: 8, fontSize: 10 })}>
          Eviction priority (high → low)
        </div>
        {qosClasses.map((qos, i) => (
          <React.Fragment key={qos.name}>
            <div style={{
              ...box(qos.color, qos.bg, {
                width: "100%", padding: "8px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }),
            }}>
              <div style={label(qos.text, { fontSize: 11 })}>{qos.name}</div>
              <div style={subLabel({ fontSize: 9 })}>{qos.desc}</div>
            </div>
            {i < qosClasses.length - 1 && (
              <div style={{ textAlign: "center", padding: "2px 0" }}>
                <span style={arrow({ fontSize: 11 })}>&#8595;</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={caption()}>first to be evicted → last to be evicted</div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAZY RENDERING -only mount diagram when scrolled into view
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
    <div ref={ref} className="quiz-diagram" style={{ minHeight: visible ? "auto" : 130 }}>
      {visible ? children : null}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYTICS -track shown / skipped per diagram
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
// DIAGRAM REGISTRY -explicit per-question mapping (replaces regex)
//
// Each diagram has a unique ID, a relevance score (1–5), and a
// component reference. Only diagrams with score >= 4 are registered.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT REGISTRY -resolves config string keys to React components
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
  QosEvictionDiagram,
  OomKilledDiagram,
  RestartPolicyDiagram,
  RequestsLimitsDiagram,
  ConfigMapVsSecretDiagram,
  LimitRangeVsQuotaDiagram,
  DnsResolutionDiagram,
  CrashLoopDiagram,
  ImagePullDiagram,
  KubeletDiagram,
  KubeProxyDiagram,
  EtcdRestoreDiagram,
  CniNotReadyDiagram,
  EtcdDataDiagram,
  ControlPlaneDiagram,
  StaticPodDiagram,
  EtcdQuorumDiagram,
  StackedVsExternalEtcdDiagram,
  KubeadmUpgradeDiagram,
  ServiceStableIpDiagram,
  IngressHostnameDiagram,
  StatefulSetVsDeploymentDiagram,
  WaitForConsumerDiagram,
  PodStatusPhasesDiagram,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEV VALIDATION -warn about misconfigured tags (dev only)
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
 * Uses ONLY the question's tags array -no string matching.
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

// Tags that intentionally have no diagram -suppress dev warnings
const _knownInfoTags = new Set([
  "port-mapping", "traffic-policy", "admission-control",
  "resource-limits", "node-lifecycle", "storage-interface",
  "storage-zone", "image-pull", "dns-resolution",
  "kubeadm-join", "kubeadm-init",
  "certificate-management", "controlplane-troubleshooting",
  "etcd-backup", "kubeconfig-context", "etcd-restore",
  "kubelet-troubleshooting", "certificate-csr",
]);
