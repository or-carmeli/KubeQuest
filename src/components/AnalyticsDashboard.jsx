// ── Analytics Dashboard ─────────────────────────────────────────────────────
// DEV-only Vercel-inspired analytics view.
// Reads from analytics_events table only. Completely isolated.

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Users, Eye, BarChart3, Globe, Smartphone, Monitor, TrendingDown, Calendar, ChevronDown } from "lucide-react";
import { fetchAnalytics, fetchOnlineCount, TIME_RANGES } from "../api/analyticsQueries";

const MONO = "'Fira Code','Courier New',monospace";

// ── Vercel-style hover CSS (injected once) ──────────────────────────────────

const HOVER_CSS_ID = "analytics-hover-css";
function injectHoverCSS() {
  if (document.getElementById(HOVER_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = HOVER_CSS_ID;
  style.textContent = `
    .av-row { transition: background .15s ease-out; cursor: default; }
    .av-row:hover { background: rgba(255,255,255,0.06) !important; }
    .av-card { transition: border-color .2s, box-shadow .2s; }
    .av-card:hover { border-color: rgba(255,255,255,0.18) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.18) !important; }
    .av-btn { transition: background .15s ease-out, color .15s; }
    .av-btn:hover { background: rgba(255,255,255,0.08) !important; color: var(--text-primary) !important; }
    .av-dropdown-item { transition: background .12s ease-out; }
    .av-dropdown-item:hover { background: rgba(255,255,255,0.08) !important; }
    .av-back:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.08) !important; }
    .av-back { transition: background .15s, border-color .15s; }
    .av-trigger { transition: background .15s, border-color .15s; }
    .av-trigger:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.06) !important; }
    .av-chart-hover-line { pointer-events: none; }
    .av-summary { transition: border-color .2s, box-shadow .2s; }
    .av-summary:hover { border-color: rgba(255,255,255,0.15) !important; }
    .av-tab { transition: color .15s, border-color .15s; border-bottom: 2px solid transparent; cursor: pointer; }
    .av-tab:hover { color: var(--text-primary) !important; }
    .av-tab-active { border-bottom-color: var(--text-primary) !important; color: var(--text-primary) !important; }
  `;
  document.head.appendChild(style);
}

// ── Country flag emoji lookup ───────────────────────────────────────────────

const COUNTRY_FLAGS = {
  "Israel": "\u{1F1EE}\u{1F1F1}", "France": "\u{1F1EB}\u{1F1F7}", "India": "\u{1F1EE}\u{1F1F3}",
  "Morocco": "\u{1F1F2}\u{1F1E6}", "United States": "\u{1F1FA}\u{1F1F8}", "Canada": "\u{1F1E8}\u{1F1E6}",
  "Thailand": "\u{1F1F9}\u{1F1ED}", "Turkiye": "\u{1F1F9}\u{1F1F7}", "Turkey": "\u{1F1F9}\u{1F1F7}",
  "Germany": "\u{1F1E9}\u{1F1EA}", "United Kingdom": "\u{1F1EC}\u{1F1E7}", "Japan": "\u{1F1EF}\u{1F1F5}",
  "Brazil": "\u{1F1E7}\u{1F1F7}", "Australia": "\u{1F1E6}\u{1F1FA}", "Netherlands": "\u{1F1F3}\u{1F1F1}",
  "Spain": "\u{1F1EA}\u{1F1F8}", "Italy": "\u{1F1EE}\u{1F1F9}", "Sweden": "\u{1F1F8}\u{1F1EA}",
  "South Korea": "\u{1F1F0}\u{1F1F7}", "Russia": "\u{1F1F7}\u{1F1FA}", "China": "\u{1F1E8}\u{1F1F3}",
  "Mexico": "\u{1F1F2}\u{1F1FD}", "Argentina": "\u{1F1E6}\u{1F1F7}", "Poland": "\u{1F1F5}\u{1F1F1}",
  "Singapore": "\u{1F1F8}\u{1F1EC}", "Switzerland": "\u{1F1E8}\u{1F1ED}",
};

function countryFlag(name) {
  return COUNTRY_FLAGS[name] || "\u{1F310}";
}

// ── Referrer icon ───────────────────────────────────────────────────────────

function ReferrerIcon({ domain }) {
  if (!domain || domain === "(direct)") {
    return <span style={{ fontSize: 14, opacity: 0.5, width: 16, textAlign: "center", flexShrink: 0 }}>{"\u{1F310}"}</span>;
  }
  const host = domain.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`}
      alt="" width={16} height={16}
      style={{ borderRadius: 2, flexShrink: 0 }}
      onError={e => { e.target.style.display = "none"; }}
    />
  );
}

// ── Device icons ────────────────────────────────────────────────────────────

const DEVICE_ICONS = {
  "mobile": <Smartphone size={14} strokeWidth={1.5} />,
  "tablet": <Smartphone size={14} strokeWidth={1.5} />,
  "desktop": <Monitor size={14} strokeWidth={1.5} />,
};

// ── Guard ───────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard({ onBack, supabase = null, dir = "ltr" }) {
  if (!import.meta.env.DEV) return null;
  return <AnalyticsDashboardInner onBack={onBack} supabase={supabase} dir={dir} />;
}

// ── Inner ───────────────────────────────────────────────────────────────────

function AnalyticsDashboardInner({ onBack, supabase, dir }) {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState("visitors");
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => { injectHoverCSS(); }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [result, online] = await Promise.all([
      fetchAnalytics(supabase, TIME_RANGES.find(t => t.key === range).hours),
      fetchOnlineCount(supabase),
    ]);
    setData(result);
    setOnlineCount(online);
    setLoading(false);
  }, [supabase, range]);

  useEffect(() => { load(); }, [load]);

  // Refresh online count every 30s
  useEffect(() => {
    if (!supabase) return;
    const iv = setInterval(async () => {
      const n = await fetchOnlineCount(supabase);
      setOnlineCount(n);
    }, 30_000);
    return () => clearInterval(iv);
  }, [supabase]);

  return (
    <div className="page-pad" style={{
      maxWidth: 960, margin: "0 auto", padding: "12px 14px",
      animation: "fadeIn 0.3s ease", direction: "ltr",
      minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="back-btn av-back" onClick={onBack} style={{
          background: "var(--glass-3)", border: "1px solid var(--glass-6)",
          color: "var(--text-secondary)", padding: "7px 10px", borderRadius: 6,
          cursor: "pointer", display: "flex", alignItems: "center",
          order: dir === "rtl" ? 99 : 0,
        }}>
          <ArrowLeft size={16} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />
        </button>
        <BarChart3 size={18} strokeWidth={1.5} style={{ color: "#a78bfa", opacity: 0.7 }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Analytics</span>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
          background: "rgba(139,92,246,0.15)", color: "#a78bfa",
          border: "1px solid rgba(139,92,246,0.25)", letterSpacing: 0.5,
        }}>DEV</span>

        {/* Online indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          color: "var(--text-muted)", fontSize: 13,
          marginLeft: 4,
          borderLeft: "1px solid var(--glass-6)",
          paddingLeft: 12,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: onlineCount > 0 ? "#34d399" : "#64748b",
            boxShadow: onlineCount > 0 ? "0 0 6px rgba(52,211,153,0.5)" : "none",
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: MONO, fontWeight: 500 }}>{onlineCount}</span>
          <span>online</span>
        </div>

        <div style={{ flex: 1 }} />
        <TimeRangeSelector range={range} onChange={setRange} />
      </div>

      {/* Data source indicator */}
      {data && (data.hasSeededData || !data.hasLiveData) && (
        <div style={{
          fontSize: 10, color: "var(--text-dim)", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {data.hasSeededData && <span style={{
            background: "rgba(251,191,36,0.12)", color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.2)", borderRadius: 4,
            padding: "1px 6px", fontSize: 9, fontWeight: 600,
          }}>SEEDED DATA</span>}
          {!data.hasLiveData && <span>No live analytics collected yet. Showing seeded Vercel snapshot.</span>}
          {data.hasSeededData && data.hasLiveData && <span>Includes seeded Vercel snapshot data.</span>}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading analytics...</div>
      ) : !data || (data.totalVisitors === 0 && data.totalPageViews === 0) ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <SummaryCard icon={<Users size={14} />} label="Visitors" value={fmt(data.totalVisitors)} />
            <SummaryCard icon={<Eye size={14} />} label="Page Views" value={fmt(data.totalPageViews)} />
            <SummaryCard icon={<TrendingDown size={14} />} label="Bounce Rate" value={`${data.bounceRate}%`}
              sub={data.bounceRate > 70 ? "high" : data.bounceRate > 40 ? "moderate" : "low"}
              subColor={data.bounceRate > 70 ? "#f87171" : data.bounceRate > 40 ? "#fbbf24" : "#34d399"} />
            <SummaryCard icon={<BarChart3 size={14} />} label="Pages/Visit"
              value={data.totalVisitors > 0 ? (data.totalPageViews / data.totalVisitors).toFixed(1) : "0"} />
          </div>

          {/* Chart */}
          <div className="av-card" style={{
            background: "var(--glass-2)", border: "1px solid var(--glass-5)",
            borderRadius: 10, padding: "14px 16px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ChartToggle mode={chartMode} onChange={setChartMode} />
            </div>
            <AreaChart
              data={chartMode === "visitors" ? data.visitorsOverTime : data.pageViewsOverTime}
              color={chartMode === "visitors" ? "#a78bfa" : "#60a5fa"}
              rangeKey={range}
              metricLabel={chartMode === "visitors" ? "Visitors" : "Page Views"}
            />
          </div>

          {/* Breakdown grid — Vercel-style tabbed cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <TabbedBreakdownCard tabs={[
              { label: "Pages", items: data.topPages },
              { label: "Hostnames", items: data.hostnames },
            ]} />
            <TabbedBreakdownCard tabs={[
              { label: "Referrers", items: data.referrers, renderIcon: item => <ReferrerIcon domain={item.name} /> },
            ]} />
            <TabbedBreakdownCard tabs={[
              { label: "Countries", items: data.countries, renderIcon: item => <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{countryFlag(item.name)}</span> },
            ]} />
            <TabbedBreakdownCard tabs={[
              { label: "Devices", items: data.devices, renderIcon: item => <span style={{ color: "var(--text-dim)", flexShrink: 0, display: "flex" }}>{DEVICE_ICONS[item.name] || <Monitor size={14} />}</span> },
              { label: "Browsers", items: data.browsers },
            ]} />
            <TabbedBreakdownCard tabs={[
              { label: "Operating Systems", items: data.operatingSystems },
            ]} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Summary Card ────────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, sub, subColor }) {
  return (
    <div className="av-summary" style={{
      flex: 1, minWidth: 120,
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color: "var(--text-dim)", opacity: 0.6 }}>{icon}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, color: "var(--text-secondary)",
          textTransform: "uppercase", letterSpacing: 0.5,
        }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: MONO, color: "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <span style={{ fontSize: 10, color: subColor || "var(--text-dim)", fontWeight: 500 }}>{sub}</span>
      )}
    </div>
  );
}

// ── Time Range Dropdown (Vercel-style) ──────────────────────────────────────

function TimeRangeSelector({ range, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = TIME_RANGES.find(t => t.key === range);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button className="av-trigger" onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--glass-2)", border: "1px solid var(--glass-5)",
        borderRadius: 8, padding: "6px 12px", cursor: "pointer",
        color: "var(--text-primary)", fontSize: 13, fontWeight: 500,
      }}>
        <Calendar size={14} strokeWidth={1.5} style={{ color: "var(--text-dim)" }} />
        <span>{current?.label}</span>
        <ChevronDown size={14} strokeWidth={1.5} style={{
          color: "var(--text-dim)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)",
          background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 10, padding: "4px 0", minWidth: 180,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          zIndex: 100, animation: "fadeIn 0.12s ease",
        }}>
          {TIME_RANGES.map(t => (
            <button key={t.key} className="av-dropdown-item" onClick={() => { onChange(t.key); setOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center",
              padding: "8px 14px", border: "none", cursor: "pointer",
              background: t.key === range ? "rgba(255,255,255,0.1)" : "transparent",
              color: t.key === range ? "var(--text-bright)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: t.key === range ? 600 : 400,
              textAlign: "left",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chart Toggle ────────────────────────────────────────────────────────────

function ChartToggle({ mode, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 1, background: "var(--glass-3)",
      borderRadius: 6, padding: 2,
    }}>
      {[{ key: "visitors", label: "Visitors" }, { key: "pageViews", label: "Page Views" }].map(t => (
        <button key={t.key} className="av-btn" onClick={() => onChange(t.key)} style={{
          background: mode === t.key ? "var(--glass-8)" : "transparent",
          border: "none", color: mode === t.key ? "var(--text-primary)" : "var(--text-muted)",
          padding: "3px 10px", borderRadius: 5, cursor: "pointer",
          fontSize: 11, fontWeight: mode === t.key ? 600 : 400,
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── SVG Area Chart with hover tooltip ───────────────────────────────────────

function AreaChart({ data, color, rangeKey, metricLabel = "Visitors" }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length === 0) return <EmptyChart />;

  const W = 880;
  const H = 220;
  const PAD_LEFT = 40;
  const PAD_BOTTOM = 28;
  const PAD_TOP = 14;
  const chartW = W - PAD_LEFT;
  const chartH = H - PAD_BOTTOM - PAD_TOP;

  const max = Math.max(...data.map(d => d.count), 1);
  const step = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: PAD_LEFT + i * step,
    y: PAD_TOP + chartH - (d.count / max) * chartH,
    count: d.count,
    ts: d.ts,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = linePath + ` L${points[points.length - 1].x},${PAD_TOP + chartH} L${PAD_LEFT},${PAD_TOP + chartH} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * (yTicks - i)));

  const xLabelInterval = Math.max(1, Math.floor(data.length / 6));

  const formatDateShort = (ts) => {
    const d = new Date(ts);
    if (rangeKey === "24h") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatDateTooltip = (ts) => {
    const d = new Date(ts);
    if (rangeKey === "24h") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (rangeKey === "7d" || rangeKey === "30d") return d.toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" });
    return d.toLocaleDateString([], { month: "short", year: "2-digit" });
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((x - PAD_LEFT) / step);
    if (idx >= 0 && idx < points.length) setHoverIdx(idx);
    else setHoverIdx(null);
  };

  const hp = hoverIdx !== null ? points[hoverIdx] : null;

  // Tooltip positioning — keep inside chart bounds
  const TT_W = 120;
  const TT_H = 44;
  const ttX = hp ? Math.max(PAD_LEFT, Math.min(hp.x - TT_W / 2, W - TT_W - 4)) : 0;
  const ttAbove = hp && hp.y > TT_H + 16;
  const ttY = hp ? (ttAbove ? hp.y - TT_H - 12 : hp.y + 16) : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", cursor: "crosshair" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {/* Grid lines */}
      {yLabels.map((v, i) => {
        const y = PAD_TOP + (i / yTicks) * chartH;
        return (
          <g key={i}>
            <line x1={PAD_LEFT} y1={y} x2={W} y2={y} stroke="var(--glass-4)" strokeWidth={0.5} />
            <text x={PAD_LEFT - 6} y={y + 3} textAnchor="end" fill="var(--text-dim)" fontSize={9} fontFamily={MONO}>{v}</text>
          </g>
        );
      })}

      {/* Area + line */}
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />

      {/* Hover: solid white vertical line + dot + Vercel-style tooltip card */}
      {hp && (
        <g className="av-chart-hover-line">
          {/* Solid white vertical line — full height */}
          <line x1={hp.x} y1={PAD_TOP} x2={hp.x} y2={PAD_TOP + chartH}
            stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
          {/* Dot on data point — filled with outline */}
          <circle cx={hp.x} cy={hp.y} r={5} fill={color} stroke="#fff" strokeWidth={2} />

          {/* Tooltip card */}
          <rect x={ttX} y={ttY} width={TT_W} height={TT_H} rx={8}
            fill="#1a1a1a" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          {/* Row 1: color dot + label + value */}
          <circle cx={ttX + 12} cy={ttY + 16} r={4} fill={color} />
          <text x={ttX + 22} y={ttY + 20} fill="#a1a1a1" fontSize={11} fontFamily={MONO}>
            {metricLabel}
          </text>
          <text x={ttX + TT_W - 10} y={ttY + 20} textAnchor="end" fill="#ededed" fontSize={12} fontWeight={700} fontFamily={MONO}>
            {hp.count}
          </text>
          {/* Row 2: date */}
          <text x={ttX + TT_W / 2} y={ttY + 37} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily={MONO}>
            {formatDateTooltip(hp.ts)}
          </text>
        </g>
      )}

      {/* X-axis labels */}
      {data.map((d, i) => {
        if (i % xLabelInterval !== 0 && i !== data.length - 1) return null;
        const x = PAD_LEFT + i * step;
        return (
          <text key={i} x={x} y={H - 6} textAnchor="middle" fill="var(--text-dim)" fontSize={9} fontFamily={MONO}>
            {formatDateShort(d.ts)}
          </text>
        );
      })}

      {/* Hover x-axis label replacement */}
      {hp && (
        <text x={hp.x} y={H - 6} textAnchor="middle" fill="#ededed" fontSize={9} fontWeight={600} fontFamily={MONO}>
          {formatDateTooltip(hp.ts)}
        </text>
      )}
    </svg>
  );
}

function EmptyChart() {
  return (
    <div style={{
      height: 160, display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--text-dim)", fontSize: 12,
    }}>
      No data for this time range
    </div>
  );
}

// ── Tabbed Breakdown Card ────────────────────────────────────────────────────

function TabbedBreakdownCard({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = tabs[activeTab] || tabs[0];
  const { items, renderIcon } = current;
  const PREVIEW = 5;
  const hasMore = items.length > PREVIEW;
  const displayItems = expanded ? items : items.slice(0, PREVIEW);

  return (
    <div className="av-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "14px 16px", minWidth: 0,
    }}>
      {/* Tab header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0, marginBottom: 8,
        borderBottom: "1px solid var(--glass-4)",
      }}>
        <div style={{ display: "flex", gap: 16, flex: 1 }}>
          {tabs.map((tab, i) => (
            <button key={i}
              className={`av-tab ${i === activeTab ? "av-tab-active" : ""}`}
              onClick={() => { setActiveTab(i); setExpanded(false); }}
              style={{
                background: "none", border: "none", padding: "0 0 8px",
                fontSize: 13, fontWeight: i === activeTab ? 600 : 400,
                color: i === activeTab ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: MONO, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, paddingBottom: 8 }}>
          visitors
        </span>
      </div>

      {/* Rows */}
      {items.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>
          No data yet
        </div>
      ) : (
        <BreakdownRows items={displayItems} renderIcon={renderIcon} />
      )}

      {hasMore && (
        <button className="av-btn" onClick={() => setExpanded(e => !e)} style={{
          width: "100%", background: "none", border: "none",
          padding: "8px 0 0", color: "var(--text-muted)", fontSize: 12,
          cursor: "pointer", textAlign: "center",
        }}>
          {expanded ? "Show less" : "View all"}
        </button>
      )}
    </div>
  );
}

// ── Breakdown Rows ──────────────────────────────────────────────────────────

function BreakdownRows({ items, renderIcon }) {
  const max = items.length > 0 ? items[0].count : 1;
  const total = items.reduce((s, i) => s + i.count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {items.map((item, i) => {
        const pct = total > 0 ? (item.count / total) * 100 : 0;
        const pctLabel = pct >= 1 ? `${Math.round(pct)}%` : "<1%";
        const barPct = Math.max((item.count / max) * 100, 2);
        return (
          <div key={i} className="av-row" style={{
            position: "relative",
            borderBottom: i < items.length - 1 ? "1px solid var(--glass-3)" : "none",
            borderRadius: 4,
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${barPct}%`, background: "var(--glass-4)",
              borderRadius: 3, transition: "width 0.4s ease",
            }} />
            <div style={{
              position: "relative", display: "flex", alignItems: "center",
              padding: "7px 8px", gap: 8, zIndex: 1,
            }}>
              {renderIcon && renderIcon(item)}
              <span style={{
                flex: 1, fontSize: 12, color: "var(--text-primary)",
                fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", minWidth: 0,
              }}>
                {item.name}
              </span>
              <span style={{
                fontSize: 10, color: "var(--text-dim)", fontFamily: MONO,
                flexShrink: 0, minWidth: 28, textAlign: "right",
              }}>
                {pctLabel}
              </span>
              <span style={{
                fontSize: 12, color: "var(--text-primary)", fontFamily: MONO,
                fontWeight: 600, flexShrink: 0, minWidth: 30, textAlign: "right",
              }}>
                {fmt(item.count)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      padding: "48px 24px", textAlign: "center",
      background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 10,
    }}>
      <BarChart3 size={32} strokeWidth={1} style={{ color: "var(--text-dim)", marginBottom: 12 }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
        No analytics data yet
      </div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", maxWidth: 360, margin: "0 auto" }}>
        Analytics events will be collected automatically in production. You can also seed data from Vercel using the seed script.
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
