import React, { useState, useEffect, useRef } from "react";

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

// ── Reduced motion detection ─────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  });
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ── Typing animation hook ────────────────────────────────────────────────────
const TYPING_SPEED = 18; // ms per character
const OUTPUT_DELAY = 150; // ms after typing finishes before output appears

function useTypingAnimation(text, shouldAnimate) {
  const [charCount, setCharCount] = useState(shouldAnimate ? 0 : text.length);
  const [done, setDone] = useState(!shouldAnimate);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) {
      setCharCount(text.length);
      setDone(true);
      return;
    }
    setCharCount(0);
    setDone(false);
    startRef.current = performance.now();

    const step = (now) => {
      const elapsed = now - startRef.current;
      const chars = Math.min(Math.floor(elapsed / TYPING_SPEED), text.length);
      setCharCount(chars);
      if (chars < text.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [text, shouldAnimate]);

  return { displayText: text.slice(0, charCount), typingDone: done };
}

/**
 * Minimal, matte terminal block with optional typing animation.
 *
 * Props:
 *   children  - text content (command + output separated by content)
 *   variant   - "output" | "error" | "yaml" | undefined (command)
 *   label     - optional header label
 *   animate   - if true, command lines type in and output fades in
 *
 * Variants:
 *   (default) - command block with $ prompt detection
 *   "output"  - neutral output text
 *   "error"   - red-tinted error output
 *   "yaml"    - YAML/config with key:value highlighting
 */
export function TerminalBlock({ children, variant, label, animate }) {
  const isOutput = variant === "output";
  const isError = variant === "error";
  const isYaml = variant === "yaml";
  const prefersReduced = usePrefersReducedMotion();
  const rawText = children || "";

  // Split content into command lines and output lines
  const allLines = rawText.split("\n");
  const cmdRegex = /^(\$\s*)?(?:kubectl|helm|docker|kubeadm|crictl|etcdctl|curl|wget|apt|yum|pip|npm|go|make|df|free|top|ps|ss|systemctl|journalctl|dmesg|strace|perf|sar|iostat|lsof|uptime|tail|grep|awk|sed|cat|ls|find|sysctl|iptables|netstat|tcpdump|mount|umount)\s/;

  // For default variant, find command lines at the start
  let commandText = "";
  let outputLines = allLines;
  if (!isOutput && !isError && !isYaml) {
    const cmdLines = [];
    let i = 0;
    for (; i < allLines.length; i++) {
      if (cmdRegex.test(allLines[i].trim())) {
        cmdLines.push(allLines[i].trim().replace(/^\$\s*/, ""));
      } else break;
    }
    if (cmdLines.length > 0) {
      commandText = cmdLines.join("\n");
      outputLines = allLines.slice(i);
    }
  }

  const shouldAnimate = animate && !prefersReduced && commandText.length > 0;
  const { displayText: typedCmd, typingDone } = useTypingAnimation(commandText, shouldAnimate);

  // Output visibility: delayed after typing completes
  const [outputVisible, setOutputVisible] = useState(!shouldAnimate);
  useEffect(() => {
    if (!shouldAnimate) { setOutputVisible(true); return; }
    if (!typingDone) { setOutputVisible(false); return; }
    const t = setTimeout(() => setOutputVisible(true), OUTPUT_DELAY);
    return () => clearTimeout(t);
  }, [typingDone, shouldAnimate]);

  const bg = isError ? TERM_ERROR_BG : TERM_BG;
  const border = isError ? `1px solid rgba(248,81,73,0.12)` : `1px solid ${TERM_BORDER}`;

  let headerLabel = label;
  if (!headerLabel) {
    if (isError) headerLabel = "error";
    else if (isYaml) headerLabel = "yaml";
  }

  // Cursor: visible during typing, blinks after done
  const showCursor = shouldAnimate && commandText.length > 0;
  const cursorClass = typingDone ? "term-cursor term-cursor-blink" : "term-cursor";

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
      <div style={{ padding: "10px 14px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <pre
          style={{
            margin: 0,
            fontFamily: MONO_FONT,
            fontSize: 12.5,
            lineHeight: 1.7,
            whiteSpace: "pre",
            textAlign: "left",
            color: TERM_TEXT,
          }}
        >
          {/* Command lines with typing animation */}
          {commandText && (
            <>
              {(shouldAnimate ? typedCmd : commandText).split("\n").map((line, i, arr) => (
                <React.Fragment key={i}>
                  <span style={{ color: TERM_PROMPT }}>$ </span>
                  <span style={{ color: TERM_CMD }}>{line}</span>
                  {i === arr.length - 1 && showCursor && <span className={cursorClass} />}
                  {"\n"}
                </React.Fragment>
              ))}
            </>
          )}

          {/* Output lines - either instant or fade-in */}
          {outputLines.length > 0 && (outputLines.length > 1 || outputLines[0] !== "") && (
            <span
              className={shouldAnimate ? "term-output-reveal" : undefined}
              style={shouldAnimate && !outputVisible ? { opacity: 0, display: "inline" } : shouldAnimate ? { display: "inline" } : undefined}
            >
              {outputLines.map((line, i) => {
                if (isYaml) {
                  return <React.Fragment key={i}>{renderYamlLine(line)}{i < outputLines.length - 1 ? "\n" : ""}</React.Fragment>;
                }
                if (isError) {
                  return <React.Fragment key={i}><span style={{ color: TERM_ERROR }}>{line}</span>{i < outputLines.length - 1 ? "\n" : ""}</React.Fragment>;
                }
                // For default variant, remaining lines are output
                if (commandText && !isOutput) {
                  return <React.Fragment key={i}><span style={{ color: TERM_TEXT }}>{line}</span>{i < outputLines.length - 1 ? "\n" : ""}</React.Fragment>;
                }
                // Pure output variant or no command detected
                const isCmd = !isOutput && !isError && cmdRegex.test(line.trim());
                if (isCmd) {
                  const cmd = line.trim().replace(/^\$\s*/, "");
                  return <React.Fragment key={i}><span style={{ color: TERM_PROMPT }}>$ </span><span style={{ color: TERM_CMD }}>{cmd}</span>{i < outputLines.length - 1 ? "\n" : ""}</React.Fragment>;
                }
                return <React.Fragment key={i}><span style={{ color: TERM_TEXT }}>{line}</span>{i < outputLines.length - 1 ? "\n" : ""}</React.Fragment>;
              })}
            </span>
          )}
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
  if (line.trimStart().startsWith("#")) {
    return <span style={{ color: TERM_DIM }}>{line}</span>;
  }
  return <span style={{ color: TERM_TEXT }}>{line}</span>;
}
