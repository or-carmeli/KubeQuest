/**
 * Regression tests for bidi (bidirectional) rendering utilities.
 *
 * These tests guard against the Hebrew↔English slash rendering bug where
 * patterns like "משתמש/ServiceAccount" were incorrectly rendered as a
 * "/ServiceAccount" badge because the regex captured them as slash-paths.
 *
 * If you're modifying renderBidi, renderBidiInner, or their regex patterns,
 * run these tests first: `npm test`
 */
import { describe, it, expect } from "vitest";
import {
  hasHebrew,
  getTermKind,
  renderBidiInner,
  renderHebrewPrefixTerms,
  renderBidi,
  renderBidiBlock,
  CLI_COMMAND_RE,
} from "./bidi";
import { TerminalBlock } from "../components/CodeBlocks";

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Recursively extract plain text from React elements / arrays / strings. */
function flattenText(node) {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  // React element - recurse into children
  if (node.props?.children != null) return flattenText(node.props.children);
  return "";
}

/** Collect all <span> / <code> elements matching a predicate. */
function findElements(node, predicate) {
  const results = [];
  function walk(n) {
    if (n == null || typeof n === "string" || typeof n === "number") return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.props) {
      if (predicate(n)) results.push(n);
      if (n.props.children) walk(n.props.children);
    }
  }
  walk(node);
  return results;
}

/** Find all dir="ltr" spans and return their text content. */
function ltrTexts(node) {
  return findElements(node, (el) => el.props?.dir === "ltr")
    .map((el) => flattenText(el).replace(/[\u2066\u2069\u200F\u200E]/g, "").trim());
}

/** Check that NO element has text matching a given string. */
function hasNoElementWithText(node, text) {
  const all = findElements(node, () => true);
  return !all.some((el) => flattenText(el).includes(text));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("hasHebrew", () => {
  it("detects Hebrew characters", () => {
    expect(hasHebrew("שלום")).toBe(true);
    expect(hasHebrew("hello")).toBe(false);
    expect(hasHebrew("hello שלום")).toBe(true);
    expect(hasHebrew(null)).toBe(false);
    expect(hasHebrew("")).toBe(false);
  });
});

describe("getTermKind", () => {
  it("classifies K8s concepts", () => {
    expect(getTermKind("Pod")).toBe("concept");
    expect(getTermKind("ServiceAccount")).toBe("concept");
    expect(getTermKind("Namespace")).toBe("concept");
    expect(getTermKind("Role")).toBe("concept");
    expect(getTermKind("ClusterRole")).toBe("concept");
  });

  it("classifies code terms", () => {
    expect(getTermKind("kubectl")).toBe("code");
    expect(getTermKind("etcd")).toBe("code");
    expect(getTermKind("--namespace")).toBe("code");
    expect(getTermKind("/api/v1")).toBe("code");
    expect(getTermKind("spec.containers")).toBe("code");
  });

  it("returns null for unknown terms", () => {
    expect(getTermKind("banana")).toBe(null);
    expect(getTermKind("hello")).toBe(null);
  });
});

// ─── REGRESSION: Hebrew↔Latin slash normalization ─────────────────────────────

describe("slash normalization regression", () => {
  describe("Hebrew/Latin slash patterns MUST be separated", () => {
    it("משתמש/ServiceAccount → renders ServiceAccount as separate LTR token, not /ServiceAccount", () => {
      const result = renderBidi("משתמש/ServiceAccount", "he");
      const text = flattenText(result);

      // Must contain both words
      expect(text).toContain("משתמש");
      expect(text).toContain("ServiceAccount");

      // Must NOT contain "/ServiceAccount" as a single badge
      const ltrs = ltrTexts(result);
      const hasSlashBadge = ltrs.some((t) => t === "/ServiceAccount");
      expect(hasSlashBadge).toBe(false);

      // ServiceAccount should appear as its own LTR span
      expect(ltrs).toContain("ServiceAccount");
    });

    it("Pod/תהליך → renders Pod without trailing slash", () => {
      const result = renderBidi("Pod/תהליך", "he");
      const ltrs = ltrTexts(result);

      // Pod should be its own LTR span without trailing slash
      expect(ltrs).toContain("Pod");
      const hasPodSlash = ltrs.some((t) => t === "Pod/");
      expect(hasPodSlash).toBe(false);

      // Hebrew text should still be present
      const text = flattenText(result);
      expect(text).toContain("תהליך");
    });

    it("full RBAC answer text renders correctly", () => {
      const input = "חיבור בין Role למשתמש/ServiceAccount בתוך Namespace";
      const result = renderBidi(input, "he");
      const ltrs = ltrTexts(result);

      // All three English terms should be separate LTR spans
      expect(ltrs).toContain("Role");
      expect(ltrs).toContain("ServiceAccount");
      expect(ltrs).toContain("Namespace");

      // No /ServiceAccount badge
      expect(ltrs.some((t) => t === "/ServiceAccount")).toBe(false);
    });

    it("ServiceAccount question text renders correctly", () => {
      const input = "זהות לPod/תהליך בתוך הCluster לאימות מול API server";
      const result = renderBidi(input, "he");
      const ltrs = ltrTexts(result);

      expect(ltrs).toContain("Pod");
      expect(ltrs.some((t) => t === "Pod/")).toBe(false);

      const text = flattenText(result);
      expect(text).toContain("תהליך");
      expect(text).toContain("Cluster");
    });
  });

  describe("Latin/Latin slash patterns MUST remain unchanged", () => {
    it("CPU/Memory stays as single token", () => {
      const result = renderBidiInner("CPU/Memory", "he", "t");
      const ltrs = ltrTexts(result);
      // CPU/Memory should be captured together (both Latin, no Hebrew boundary)
      expect(ltrs.some((t) => t.includes("CPU") && t.includes("Memory"))).toBe(true);
    });

    it("kube-dns/CoreDNS stays as single token", () => {
      const result = renderBidiInner("kube-dns/CoreDNS", "he", "t");
      const ltrs = ltrTexts(result);
      expect(ltrs.some((t) => t.includes("kube-dns") && t.includes("CoreDNS"))).toBe(true);
    });

    it("/api/v1 is treated as a valid slash-path", () => {
      const result = renderBidiInner("/api/v1", "he", "t");
      const ltrs = ltrTexts(result);
      expect(ltrs.some((t) => t.includes("/api/v1"))).toBe(true);
    });

    it("Secret/ConfigMap stays as single token (both Latin)", () => {
      const result = renderBidiInner("Secret/ConfigMap חסר", "he", "t");
      const ltrs = ltrTexts(result);
      expect(ltrs.some((t) => t.includes("Secret/ConfigMap"))).toBe(true);
    });

    it("/tmp. trailing dot excluded from path (sentence punctuation)", () => {
      const result = renderBidiInner("הצרכנים הגדולים הם /var/log או /tmp.", "he", "t");
      const ltrs = ltrTexts(result);

      // Paths should be captured without trailing dot
      expect(ltrs.some((t) => t.includes("/var/log"))).toBe(true);
      expect(ltrs.some((t) => t.includes("/tmp"))).toBe(true);
      // The dot should NOT be inside an LTR span (it's sentence punctuation)
      expect(ltrs.some((t) => t.endsWith("."))).toBe(false);
    });

    it("/var/log/app.log keeps internal dots", () => {
      const result = renderBidiInner("/var/log/app.log", "he", "t");
      const ltrs = ltrTexts(result);
      expect(ltrs.some((t) => t.includes("/var/log/app.log"))).toBe(true);
    });
  });
});

// ─── Hebrew prefix terms ─────────────────────────────────────────────────────

describe("Hebrew prefix terms", () => {
  it("ל-Pod renders prefix attached to LTR term", () => {
    const result = renderHebrewPrefixTerms("ל-Pod", "he", "t");
    expect(result).not.toBeNull();
    const text = flattenText(result);
    expect(text).toContain("ל");
    expect(text).toContain("Pod");

    // Pod should be in a dir="ltr" span
    const ltrs = ltrTexts(result);
    expect(ltrs).toContain("Pod");
  });

  it("ה-Cluster renders prefix attached to LTR term", () => {
    const result = renderHebrewPrefixTerms("ה-Cluster", "he", "t");
    expect(result).not.toBeNull();
    const ltrs = ltrTexts(result);
    expect(ltrs).toContain("Cluster");
  });

  it("ב-Namespace renders prefix attached to LTR term", () => {
    const result = renderHebrewPrefixTerms("ב-Namespace", "he", "t");
    expect(result).not.toBeNull();
    const ltrs = ltrTexts(result);
    expect(ltrs).toContain("Namespace");
  });

  it("returns null for English mode", () => {
    expect(renderHebrewPrefixTerms("ל-Pod", "en", "t")).toBeNull();
  });

  it("returns null when no prefix pattern exists", () => {
    expect(renderHebrewPrefixTerms("שלום עולם", "he", "t")).toBeNull();
  });

  it("LTR word before prefix term has space outside isolation (Pods ב-StatefulSet)", () => {
    const result = renderHebrewPrefixTerms("Pods ב-StatefulSet מקבלים שמות", "he", "t");
    expect(result).not.toBeNull();
    const text = flattenText(result);
    expect(text).toContain("Pods");
    expect(text).toContain("StatefulSet");

    // "Pods" LTR span should NOT contain a trailing space (space must be outside isolation)
    const ltrs = ltrTexts(result);
    expect(ltrs).toContain("Pods");
    // Ensure no LTR span has "Pods " with trailing space
    expect(ltrs.some((t) => t === "Pods ")).toBe(false);
  });
});

// ─── Mixed Hebrew/English rendering ──────────────────────────────────────────

describe("mixed Hebrew/English rendering", () => {
  it("renders correct RBAC answer with all English terms isolated", () => {
    const input = "חיבור בין Role למשתמש או ServiceAccount בתוך Namespace";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("Role");
    expect(ltrs).toContain("ServiceAccount");
    expect(ltrs).toContain("Namespace");
  });

  it("handles prefix terms and multi-word English in one sentence", () => {
    const input = "זהות ל-Pod או תהליך בתוך ה-Cluster לאימות מול API server";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("Pod");
    expect(ltrs).toContain("Cluster");
    // "API server" should be grouped as one LTR span
    expect(ltrs.some((t) => t.includes("API") && t.includes("server"))).toBe(true);
  });

  it("English terms get dir=ltr with unicodeBidi isolate", () => {
    const input = "חיבור בין Role";
    const result = renderBidi(input, "he");
    const ltrSpans = findElements(result, (el) => el.props?.dir === "ltr");

    expect(ltrSpans.length).toBeGreaterThan(0);
    ltrSpans.forEach((span) => {
      expect(span.props.style?.unicodeBidi).toBe("isolate");
    });
  });
});

// ─── Edge cases ──────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("returns null/empty unchanged", () => {
    expect(renderBidi(null, "he")).toBe(null);
    expect(renderBidi("", "he")).toBe("");
    expect(renderBidi(undefined, "he")).toBe(undefined);
  });

  it("returns text unchanged for English mode", () => {
    const text = "some English text";
    expect(renderBidi(text, "en")).toBe(text);
  });

  it("returns pure Hebrew text processed through renderBidiInner", () => {
    // Pure Hebrew with no Latin should return the text as-is from renderBidiInner
    const result = renderBidi("שלום עולם", "he");
    // renderBidiInner returns text unchanged if no Latin chars
    expect(result).toBe("שלום עולם");
  });

  it("DNS/FQDN patterns render as single LTR code span", () => {
    const result = renderBidi("my-svc.default.svc.cluster.local", "he");
    expect(result.props?.dir).toBe("ltr");
    const text = flattenText(result);
    expect(text).toContain("my-svc.default.svc.cluster.local");
  });
});

// ─── renderBidiBlock delegation ──────────────────────────────────────────────

describe("renderBidiBlock", () => {
  it("delegates to renderBidi for Hebrew text without CLI", () => {
    const input = "חיבור בין Role למשתמש או ServiceAccount בתוך Namespace";
    const blockResult = renderBidiBlock(input, "he");
    const directResult = renderBidi(input, "he");

    // Both should produce the same text content
    expect(flattenText(blockResult)).toBe(flattenText(directResult));
  });

  it("returns null/empty unchanged", () => {
    expect(renderBidiBlock(null, "he")).toBe(null);
    expect(renderBidiBlock("", "he")).toBe("");
  });

  it("handles CLI commands in Hebrew text", () => {
    const input = "הרץ kubectl get pods כדי לראות";
    const result = renderBidiBlock(input, "he");
    const text = flattenText(result);

    expect(text).toContain("kubectl get pods");
    expect(text).toContain("הרץ");
  });
});

// ─── Rendering path integrity ────────────────────────────────────────────────

describe("rendering path integrity", () => {
  it("renderBidi applies slash normalization before Hebrew prefix handling", () => {
    // If a prefix-like pattern contains a slash, normalization should fire first
    const input = "ב-Pod/תהליך";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    // Pod should be in its own LTR span (not Pod/)
    expect(ltrs).toContain("Pod");
    expect(ltrs.some((t) => t === "Pod/")).toBe(false);
  });

  it("renderBidiInner also applies slash normalization independently", () => {
    // Even if called directly (bypassing renderBidi), the defense still works
    const input = "משתמש/ServiceAccount בתוך Namespace";
    const result = renderBidiInner(input, "he", "t");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("ServiceAccount");
    expect(ltrs.some((t) => t === "/ServiceAccount")).toBe(false);
  });

  it("backtick code path still goes through slash normalization", () => {
    const input = "משתמש/ServiceAccount עם `kubectl get pods`";
    const result = renderBidi(input, "he");
    const text = flattenText(result);

    expect(text).toContain("ServiceAccount");
    expect(text).toContain("kubectl get pods");
    // No /ServiceAccount badge
    const ltrs = ltrTexts(result);
    expect(ltrs.some((t) => t === "/ServiceAccount")).toBe(false);
  });

  it("CLI command path still goes through slash normalization", () => {
    const input = "משתמש/ServiceAccount הרץ kubectl get pods";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs.some((t) => t === "/ServiceAccount")).toBe(false);
    expect(ltrs.some((t) => t.includes("kubectl"))).toBe(true);
  });
});

// ─── REGRESSION: CLI colon-separator handling ────────────────────────────────

describe("CLI colon-separator regression", () => {
  it("kubectl describe: renders as inline keyword, not TerminalBlock", () => {
    const input = "kubectl describe: events ומידע מפורט על resource";
    const result = renderBidiBlock(input, "he");
    const text = flattenText(result);

    // Command and description text should both be present
    expect(text).toContain("kubectl describe");
    expect(text).toContain("events");

    // "command: description" patterns render inline (keyword handler), not as TerminalBlock
    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(0);

    // The command should be in an LTR span without trailing colon
    const ltrs = ltrTexts(result);
    expect(ltrs).toContain("kubectl describe");
  });

  it("kubectl logs: renders as inline keyword, not TerminalBlock", () => {
    const input = "kubectl logs: לוגים של קונטיינר";
    const result = renderBidiBlock(input, "he");

    // Should be inline, not TerminalBlock
    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(0);

    const ltrs = ltrTexts(result);
    expect(ltrs).toContain("kubectl logs");
  });

  it("kubectl get pods -A: renders as inline keyword, not TerminalBlock", () => {
    const input = "kubectl get pods -A: כל ה-Pods בכל ה-Namespaces";
    const result = renderBidiBlock(input, "he");

    // Should be inline keyword, not TerminalBlock
    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(0);

    const ltrs = ltrTexts(result);
    expect(ltrs.some((t) => t.includes("kubectl get pods"))).toBe(true);
  });

  it("port numbers with colon (8080:80) are still captured correctly in renderBidi", () => {
    const input = "הרץ kubectl port-forward pod/my-pod 8080:80 לגישה";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    // The port-forward command with port mapping should be together
    expect(ltrs.some((t) => t.includes("8080:80"))).toBe(true);
  });
});

// ─── REGRESSION: CLI tool name inside longer words ───────────────────────────

describe("CLI tool name inside longer words regression", () => {
  // @regression - "liveness probe" was split into "livene" + CLI match "ss probe"
  // because "ss" is a CLI tool and the regex had no word-boundary lookbehind.
  it("liveness probe is NOT split by CLI_COMMAND_RE", () => {
    expect(CLI_COMMAND_RE.test("liveness probe")).toBe(false);
  });

  it("readiness probe is NOT split by CLI_COMMAND_RE", () => {
    expect(CLI_COMMAND_RE.test("readiness probe")).toBe(false);
  });

  it("renderBidi keeps 'liveness probe' intact in Hebrew text", () => {
    const input = "מה liveness probe עושה";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);
    expect(ltrs.some((t) => t.includes("liveness probe"))).toBe(true);
    // "ss probe" should only appear as part of "liveness probe", never standalone
    expect(ltrs.some((t) => t.includes("ss probe") && !t.includes("liveness probe"))).toBe(false);
  });

  it("renderBidiBlock keeps 'readiness probe' intact in Hebrew text", () => {
    const input = "מה readiness probe עושה";
    const result = renderBidiBlock(input, "he");
    const text = flattenText(result);
    expect(text).toContain("readiness probe");
    // Should NOT create a TerminalBlock for "ss probe"
    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(0);
  });

  it("standalone ss command still works", () => {
    expect(CLI_COMMAND_RE.test("ss -tulnp")).toBe(true);
  });
});

// ─── REGRESSION: Hebrew prefix term with trailing English words ──────────────

describe("Hebrew prefix term with trailing English words regression", () => {
  // @regression - "מה-CNI plugin" was rendered as "pluginCNI" because
  // HE_PREFIX_TERM_RE captured "ה-CNI" but left "plugin" as a separate
  // LTR span that got visually reversed in RTL context.
  it("CNI plugin stays together after Hebrew prefix", () => {
    const input = "מגבלת קצב הרשת שה-Pod מקבל מה-CNI plugin";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);
    // "CNI plugin" should be in the same LTR span, not split
    expect(ltrs.some((t) => t.includes("CNI plugin"))).toBe(true);
    // "plugin" should NOT appear alone as a separate LTR span
    expect(ltrs.some((t) => t === "plugin")).toBe(false);
  });
});

// ─── REGRESSION: Leading keyword bidi isolation ──────────────────────────────

describe("leading keyword bidi isolation", () => {
  it("Always: keyword is isolated from Kubernetes in LTR span", () => {
    const input = "Always: Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    // "Always" should be its own isolated LTR span (colon stays outside for correct RTL placement)
    expect(ltrs).toContain("Always");
    // "Kubernetes" should be a separate LTR span (not grouped with Always)
    expect(ltrs.some((t) => t === "Always: Kubernetes")).toBe(false);
  });

  it("OnFailure: keyword is isolated", () => {
    const input = "OnFailure: Kubernetes מפעיל מחדש רק אם exit code שגוי";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("OnFailure");
    expect(ltrs.some((t) => t === "OnFailure: Kubernetes")).toBe(false);
  });

  it("ClusterIP: keyword is isolated in service type options", () => {
    const input = "ClusterIP: מספק IP פנימי שנגיש מכל Node ב-Cluster";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("ClusterIP");
    // Hebrew text should still be present
    const text = flattenText(result);
    expect(text).toContain("מספק");
    expect(text).toContain("IP");
  });

  it("does not activate for pure English text (no Hebrew in rest)", () => {
    const input = "Always: Kubernetes always restarts a stopped container";
    // lang=he but no Hebrew in the rest - should not use keyword isolation
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    // The whole text is Latin, so it should be rendered as one LTR unit
    expect(ltrs.some((t) => t === "Always:")).toBe(false);
  });

  it("LimitRange: keyword is isolated in mixed text", () => {
    const input = "LimitRange: ברירות מחדל per-container. ResourceQuota: מגבלות לכל ה-Namespace";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("LimitRange");
  });

  it("multi-word keyword: Helm Chart: is isolated", () => {
    const input = "Helm Chart: חבילה של Kubernetes manifests";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("Helm Chart");
  });

  it("multi-word keyword: External Secrets Operator: is isolated", () => {
    const input = "External Secrets Operator: מסנכרן מ-AWS";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("External Secrets Operator");
  });
});

// ─── REGRESSION: U+200E stripping in renderBidiBlock ─────────────────────────

describe("U+200E LTR mark stripping", () => {
  it("strips U+200E so keyword regex matches", () => {
    const input = "CrashLoopBackOff:\u200E קונטיינר קורס שוב ושוב";
    const result = renderBidiBlock(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("CrashLoopBackOff");
  });

  it("strips U+200E for multi-word terms", () => {
    const input = "Helm Chart:\u200E חבילה של Kubernetes manifests";
    const result = renderBidiBlock(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs).toContain("Helm Chart");
  });

  it("does not strip U+200E in English mode", () => {
    const input = "Term:\u200E some text";
    const result = renderBidiBlock(input, "en");
    const text = flattenText(result);

    expect(text).toContain("Term:");
  });
});

// ─── REGRESSION: Linux CLI commands in Hebrew text ──────────────────────────

describe("Linux CLI commands bidi rendering", () => {
  it("ps aux --sort=-%mem renders as single LTR unit in renderBidi", () => {
    const input = "ps aux --sort=-%mem ממיין תהליכים לפי שימוש בזיכרון";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    // The entire command should be in one LTR span, not fragmented
    expect(ltrs.some((t) => t.includes("ps aux") && t.includes("--sort=-%mem"))).toBe(true);
  });

  it("lsof +D /var/log renders as single LTR unit in renderBidi", () => {
    const input = "lsof +D /var/log עוזר לזהות איזה תהליך מחזיק את הקובץ";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs.some((t) => t.includes("lsof") && t.includes("/var/log"))).toBe(true);
  });

  it("ss -tlnp | grep 8080 renders as single LTR unit in renderBidi", () => {
    const input = "ss -tlnp | grep 8080 כדי לבדוק אם יש תהליך שמאזין";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs.some((t) => t.includes("ss -tlnp") && t.includes("grep 8080"))).toBe(true);
  });

  it("du -sh /* renders as single LTR unit in renderBidi", () => {
    const input = "du -sh /* שמציגה את הגודל של כל תיקייה";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs.some((t) => t.includes("du -sh /*"))).toBe(true);
  });

  it("systemctl restart kubelet renders as TerminalBlock in renderBidiBlock", () => {
    const input = "הרץ systemctl restart kubelet כדי לאתחל";
    const result = renderBidiBlock(input, "he");

    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(1);
    const cliText = flattenText(termBlocks[0]).trim();
    expect(cliText).toBe("systemctl restart kubelet");
  });

  it("tail -f /var/log/syslog renders as single LTR unit", () => {
    const input = "tail -f /var/log/syslog עוקב אחרי לוגים בזמן אמת";
    const result = renderBidi(input, "he");
    const ltrs = ltrTexts(result);

    expect(ltrs.some((t) => t.includes("tail -f /var/log/syslog"))).toBe(true);
  });

  it("ps aux: description renders colon correctly (theory card format)", () => {
    const input = "ps aux: תמונת מצב של כל התהליכים הרצים במערכת";
    const result = renderBidiBlock(input, "he");
    const text = flattenText(result);

    // Command and description should both be present
    expect(text).toContain("ps aux");
    expect(text).toContain("תמונת מצב");

    // Should be inline keyword, not TerminalBlock (colon means label format)
    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(0);

    // "ps aux" should be in an LTR span
    const ltrs = ltrTexts(result);
    expect(ltrs.some((t) => t.includes("ps aux"))).toBe(true);
  });

  it("free -h: description renders colon correctly (theory card format)", () => {
    const input = "free -h: סיכום שימוש בזיכרון";
    const result = renderBidiBlock(input, "he");

    const termBlocks = findElements(result, (el) => el.type === TerminalBlock);
    expect(termBlocks.length).toBe(0);

    const ltrs = ltrTexts(result);
    expect(ltrs.some((t) => t.includes("free -h"))).toBe(true);
  });

  it("renderBidiInner merges adjacent LTR parts into single span", () => {
    // Even when CLI_COMMAND_RE doesn't match, adjacent Latin+flag parts should merge
    const input = "האופציה +D מחפשת קבצים פתוחים";
    const result = renderBidiInner(input, "he", "t");
    const ltrs = ltrTexts(result);

    // +D should be in an LTR span
    expect(ltrs.some((t) => t.includes("+D") || t.includes("D"))).toBe(true);
  });

  // @regression - colon+space between two LTR tokens must merge them
  // Without this fix, "runAsNonRoot: true" splits into two LTR islands
  // with ": " in RTL flow, causing bidi reversal to "true :runAsNonRoot".
  it("key: value pair stays together: runAsNonRoot: true", () => {
    const input = "ההגדרה runAsNonRoot: true מבטיחה";
    const result = renderBidiInner(input, "he", "t");
    const ltrs = ltrTexts(result);

    // "runAsNonRoot: true" should be a single LTR span
    expect(ltrs.some((t) => t.includes("runAsNonRoot: true"))).toBe(true);
  });

  // @regression - flag with numeric argument must stay in same LTR span
  // Without this fix, "-n 50" renders as "50 -n" because the number is left
  // as neutral text that gets bidi-reordered in RTL context.
  it("flag with numeric argument stays together: -n 50", () => {
    const input = "האופציה -n 50 מגבילה את הפלט";
    const result = renderBidiInner(input, "he", "t");
    const ltrs = ltrTexts(result);

    // -n 50 should be captured as a single LTR span
    expect(ltrs.some((t) => t.includes("-n 50"))).toBe(true);
  });
});
