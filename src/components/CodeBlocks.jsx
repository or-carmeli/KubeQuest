import React from "react";

// ── Shared terminal constants ────────────────────────────────────────────────
export const MONO_FONT = "'JetBrains Mono','Fira Code','Cascadia Code','SF Mono',monospace";
export const TERM_BG = "#0d1117";
export const TERM_BORDER = "rgba(255,255,255,0.06)";
export const TERM_TEXT = "#c9d1d9";
export const TERM_DIM = "#8b949e";
export const TERM_CMD = "#79c0ff";
export const TERM_PROMPT = "#484f58";
export const TERM_ERROR = "#f85149";
export const TERM_ERROR_BG = "rgba(248,81,73,0.06)";

/**
 * Minimal, matte terminal block. Designed to look like a real CLI,
 * not a glowing UI card.
 *
 * Variants:
 *   (default) - command block with optional $ prompt detection
 *   "output"  - neutral output text
 *   "error"   - red-tinted error output
 *   "yaml"    - YAML/config with key:value highlighting
 */
export function TerminalBlock({ children, variant, label }) {
  const isOutput = variant === "output";
  const isError = variant === "error";
  const isYaml = variant === "yaml";
  const lines = (children || "").split("\n");

  const bg = isError ? TERM_ERROR_BG : TERM_BG;
  const border = isError ? `1px solid rgba(248,81,73,0.12)` : `1px solid ${TERM_BORDER}`;

  // Minimal header label - only shown if there's a label or variant provides one
  let headerLabel = label;
  if (!headerLabel) {
    if (isError) headerLabel = "error";
    else if (isYaml) headerLabel = "yaml";
  }

  return (
    <div
      dir="ltr"
      style={{
        background: bg,
        border,
        borderRadius: 6,
        overflow: "hidden",
        direction: "ltr",
        unicodeBidi: "isolate",
        margin: "4px 0",
      }}
    >
      {headerLabel && (
        <div
          style={{
            padding: "4px 12px",
            fontSize: 10,
            fontWeight: 600,
            fontFamily: MONO_FONT,
            color: isError ? TERM_ERROR : TERM_DIM,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            borderBottom: `1px solid ${TERM_BORDER}`,
            userSelect: "none",
          }}
        >
          {headerLabel}
        </div>
      )}
      <div style={{ padding: "10px 14px" }}>
        <pre
          style={{
            margin: 0,
            fontFamily: MONO_FONT,
            fontSize: 12.5,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            textAlign: "left",
            color: TERM_TEXT,
          }}
        >
          {lines.map((line, i) => {
            // YAML highlighting
            if (isYaml) {
              return <React.Fragment key={i}>{renderYamlLine(line)}{i < lines.length - 1 ? "\n" : ""}</React.Fragment>;
            }
            // Command detection (non-output, non-error)
            const isCmd =
              !isOutput &&
              !isError &&
              /^(\$\s*)?(?:kubectl|helm|docker|kubeadm|crictl|etcdctl|curl|wget|apt|yum|pip|npm|go|make|df|free|top|ps|ss|systemctl|journalctl|dmesg|strace|perf|sar|iostat|lsof|uptime|tail|grep|awk|sed|cat|ls|find|sysctl|iptables|netstat|tcpdump|mount|umount)\s/.test(
                line.trim()
              );
            if (isCmd) {
              const cmd = line.trim().replace(/^\$\s*/, "");
              return (
                <React.Fragment key={i}>
                  <span style={{ color: TERM_PROMPT }}>$ </span>
                  <span style={{ color: TERM_CMD }}>{cmd}</span>
                  {i < lines.length - 1 ? "\n" : ""}
                </React.Fragment>
              );
            }
            // Error or output text
            return (
              <React.Fragment key={i}>
                <span style={{ color: isError ? TERM_ERROR : TERM_TEXT }}>{line}</span>
                {i < lines.length - 1 ? "\n" : ""}
              </React.Fragment>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

/**
 * YAML-specific block. Convenience wrapper around TerminalBlock.
 */
export function YamlBlock({ children }) {
  return <TerminalBlock variant="yaml">{children}</TerminalBlock>;
}

// ── YAML line highlighting ─────────────────────────────────────────────────
function renderYamlLine(line) {
  const m = line.match(/^(\s*)([\w.\-/]+)(:)(.*)$/);
  if (m) {
    const [, indent, key, colon, value] = m;
    return (
      <>
        <span style={{ color: TERM_DIM }}>{indent}</span>
        <span style={{ color: "#79c0ff" }}>{key}</span>
        <span style={{ color: TERM_DIM }}>{colon}</span>
        <span style={{ color: TERM_TEXT }}>{value}</span>
      </>
    );
  }
  // Comment lines
  if (line.trimStart().startsWith("#")) {
    return <span style={{ color: TERM_DIM }}>{line}</span>;
  }
  return <span style={{ color: TERM_TEXT }}>{line}</span>;
}
