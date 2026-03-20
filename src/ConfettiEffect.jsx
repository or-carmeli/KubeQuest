import React, { useMemo, useEffect, useState } from "react";

const PALETTES = {
  success: [
    "rgba(0,212,255,0.8)",   // cyan accent
    "rgba(99,102,241,0.7)",  // indigo
    "rgba(168,85,247,0.65)", // purple
    "rgba(56,189,248,0.7)",  // sky
    "rgba(129,140,248,0.6)", // light indigo
  ],
  subtle: [
    "rgba(0,212,255,0.5)",
    "rgba(99,102,241,0.45)",
    "rgba(129,140,248,0.4)",
    "rgba(56,189,248,0.45)",
  ],
  rare: [
    "rgba(0,212,255,0.9)",
    "rgba(168,85,247,0.85)",
    "rgba(99,102,241,0.8)",
    "rgba(56,189,248,0.85)",
    "rgba(129,140,248,0.75)",
    "rgba(196,181,253,0.7)", // lavender
  ],
};

const COUNTS = { success: 24, subtle: 14, rare: 32 };
const DURATIONS = { success: 1500, subtle: 1200, rare: 1800 };

function makeParticle(i, palette) {
  const color = palette[i % palette.length];
  const rand = () => Math.random();
  // Shape: 0=thin line, 1=dot, 2=soft rounded
  const shapeType = i % 3;
  let width, height, borderRadius;
  if (shapeType === 0) {
    // thin line
    width = 2;
    height = 10 + Math.round(rand() * 8);
    borderRadius = "1px";
  } else if (shapeType === 1) {
    // small dot
    const s = 3 + Math.round(rand() * 2);
    width = s;
    height = s;
    borderRadius = "50%";
  } else {
    // soft rounded
    const s = 4 + Math.round(rand() * 4);
    width = s;
    height = s;
    borderRadius = "40%";
  }

  const startX = Math.round(rand() * 100);
  const driftX = -30 + Math.round(rand() * 60);
  const fallDist = 60 + Math.round(rand() * 40); // vh
  const rotation = Math.round(rand() * 360);
  const delay = (rand() * 0.4).toFixed(3);
  const dur = (0.9 + rand() * 0.7).toFixed(3);

  return { color, width, height, borderRadius, startX, driftX, fallDist, rotation, delay, dur };
}

export default function ConfettiEffect({ variant = "success" }) {
  const palette = PALETTES[variant] || PALETTES.success;
  const count = COUNTS[variant] || COUNTS.success;
  const lifetime = DURATIONS[variant] || DURATIONS.success;

  const [visible, setVisible] = useState(true);

  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => makeParticle(i, palette)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count],
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), lifetime);
    return () => clearTimeout(t);
  }, [lifetime]);

  if (!visible) return null;

  const hasGlow = variant === "rare";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9000,
        overflow: "hidden",
      }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.startX}%`,
            top: "-2%",
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.borderRadius,
            boxShadow: hasGlow ? `0 0 6px ${p.color}` : "none",
            opacity: 0,
            willChange: "transform, opacity",
            animation: `confettiDrift ${p.dur}s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
            "--drift-x": `${p.driftX}px`,
            "--fall-y": `${p.fallDist}vh`,
            "--rot": `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
