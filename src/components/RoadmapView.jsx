import { useState } from "react";
import { getLocalizedField } from "../utils/i18n";

const STAGE_SUBTITLES = {
  workloads:       "Pods · Deployments · StatefulSets · Scheduling · Resources",
  networking:      "Services · Ingress · NetworkPolicy · DNS",
  config:          "ConfigMaps · Secrets · RBAC · ServiceAccounts",
  storage:         "PersistentVolumes · StorageClass · Helm · Operators",
  troubleshooting: "Debugging · Observability · Diagnosis · Tools",
  linux:            "Processes · Logs · CPU · Memory · Networking",
};

const LVL_ORDER = ["easy", "medium", "hard"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function stageProgress(topicId, completedTopics) {
  // Each level contributes equally (1/3). Unstarted levels count as 0.
  let score = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (!r || !r.total) return;
    score += r.retryComplete ? 1 : Math.min(r.correct ?? 0, r.total) / r.total;
  });
  const pct = LVL_ORDER.length > 0 ? Math.min(100, Math.round((score / LVL_ORDER.length) * 100)) : 0;
  return Number.isFinite(pct) ? pct : 0;
}

function isStageCompleted(topicId, completedTopics) {
  return LVL_ORDER.every(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    return r && r.total && (r.correct === r.total || r.retryComplete);
  });
}

function nextRecommendedLevel(topicId, completedTopics, isLevelLocked) {
  for (const lvl of LVL_ORDER) {
    if (isLevelLocked(topicId, lvl)) continue;
    const r = completedTopics[`${topicId}_${lvl}`];
    if (!r || (!r.retryComplete && r.correct < r.total)) return lvl;
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RoadmapView({
  topics, levelConfig, completedTopics, isLevelLocked,
  startTopic, lang, t, dir,
  isGuest, onSignup, onLogin,
}) {
  const [expandedStage, setExpandedStage] = useState(null);
  const rowDir = dir === "rtl" ? "row-reverse" : "row";

  const isRoadmapStageLocked = (idx) =>
    idx > 0 && !isStageCompleted(topics[idx - 1].id, completedTopics);

  const currentStageIdx = topics.findIndex(
    (topic, idx) => !isRoadmapStageLocked(idx) && !isStageCompleted(topic.id, completedTopics)
  );
  const allDone = currentStageIdx === -1;
  const currentStageNum = allDone ? topics.length : currentStageIdx + 1;

  // Overall path progress = completed difficulty levels / total levels (5 topics × 3 levels = 15)
  const overallProgress = (() => {
    const totalUnits = topics.length * LVL_ORDER.length;
    if (totalUnits === 0) return 0;
    let done = 0;
    topics.forEach(topic => {
      LVL_ORDER.forEach(lvl => {
        const r = completedTopics[`${topic.id}_${lvl}`];
        if (r && r.total && (r.correct === r.total || r.retryComplete)) done++;
      });
    });
    return Math.min(100, Math.round((done / totalUnits) * 100));
  })();

  return (
    <div style={{animation:"fadeIn 0.4s ease",direction:"ltr"}}>

      {/* ── Summary header ── */}
      <div style={{background:"var(--glass-2)",border:"1px solid var(--glass-7)",borderRadius:14,padding:"16px 18px",marginBottom:16,direction:dir}}>
        <div style={{fontWeight:800,color:"var(--text-primary)",fontSize:16,marginBottom:4}}>{t("roadmapTitle")}</div>
        <div style={{color:"var(--text-secondary)",fontSize:13,marginBottom:10}}>
          {allDone
            ? t("roadmapAllDone")
            : `${t("roadmapStage")} ${currentStageNum} ${t("roadmapStageOf")} ${topics.length}`}
        </div>
        <div style={{height:8,background:"var(--glass-6)",borderRadius:4,marginBottom:6,direction:"ltr",transform:dir==="rtl"?"scaleX(-1)":undefined}}>
          <div style={{height:"100%",borderRadius:4,width:`${overallProgress}%`,background:"linear-gradient(90deg,#00D4FF,#A855F7)",transition:"width 0.5s ease"}}/>
        </div>
        <div style={{fontSize:12,color:"var(--text-secondary)",textAlign:"center"}}>{overallProgress}% {t("roadmapCompletedPct")}</div>
      </div>

      {/* ── Roadmap path ── */}
      <div style={{display:"flex",flexDirection:"column"}}>
        {topics.map((topic, idx) => {
          const locked    = isRoadmapStageLocked(idx);
          const completed = isStageCompleted(topic.id, completedTopics);
          const isCurrent = idx === currentStageIdx;
          const isLast    = idx === topics.length - 1;
          const progress  = stageProgress(topic.id, completedTopics);
          const recLvl    = !locked ? nextRecommendedLevel(topic.id, completedTopics, isLevelLocked) : null;
          const isExpanded = expandedStage === topic.id && !locked;

          // Node visuals
          const nodeBorder = locked ? "2px solid var(--text-faint)" : completed ? "2px solid #10B981" : isCurrent ? `2px solid ${topic.color}` : "2px solid var(--text-disabled)";
          const nodeGlow   = isCurrent && !locked ? `0 0 24px ${topic.color}88` : "none";
          const nodeLabel  = completed ? "✓" : locked ? "🔒" : String(idx + 1);
          const nodeFg     = locked ? "var(--text-disabled)" : completed ? "#10B981" : isCurrent ? topic.color : "var(--text-dim)";

          // Connector line color
          const lineColor = completed
            ? `linear-gradient(to bottom,#10B981,${topics[idx + 1]?.color ?? "#10B981"}55)`
            : "var(--glass-12)";

          return (
            // Use flexDirection:row-reverse for RTL instead of direction:rtl
            // to avoid RTL flex overflow bugs in mobile browsers
            <div key={topic.id} className="roadmap-row" style={{display:"flex",flexDirection:rowDir,alignItems:"stretch",gap:14}}>

              {/* ── Node column ── */}
              <div className="roadmap-node-col" style={{display:"flex",flexDirection:"column",alignItems:"center",width:36,flexShrink:0,paddingTop:2}}>
                {/* Circle node */}
                <div className="roadmap-node-circle" style={{
                  width:36,height:36,borderRadius:"50%",
                  border:nodeBorder,
                  background:completed?"rgba(16,185,129,0.15)":isCurrent&&!locked?`${topic.color}20`:"var(--glass-4)",
                  boxShadow:nodeGlow,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:completed?17:locked?12:13,
                  fontWeight:800,color:nodeFg,
                  flexShrink:0,
                  transition:"box-shadow 0.3s",
                  animation:isCurrent&&!locked?`nodePulse 2.5s ease-in-out infinite`:undefined,
                  ["--nc"]:topic.color,
                }}>
                  {nodeLabel}
                </div>
                {/* Connector line */}
                {!isLast&&(
                  <div style={{
                    flex:1,width:2,minHeight:20,
                    background:lineColor,
                    marginTop:3,marginBottom:3,
                    borderRadius:2,
                  }}/>
                )}
              </div>

              {/* ── Stage card ── */}
              <div className="roadmap-card" style={{
                flex:1,
                minWidth:0,
                marginBottom: isLast ? 0 : 12,
                opacity: locked ? 0.45 : 1,
                background: isCurrent&&!locked ? `${topic.color}10` : "var(--glass-4)",
                border:`1px solid ${isCurrent&&!locked ? `${topic.color}40` : "var(--glass-10)"}`,
                borderRadius:14,
                padding:"12px 14px",
                transition:"opacity 0.2s,border-color 0.2s",
              }}>

                {/* Stage header */}
                <button
                  onClick={()=>{ if (!locked) setExpandedStage(isExpanded ? null : topic.id); }}
                  aria-expanded={!locked ? isExpanded : undefined}
                  aria-disabled={locked}
                  className="roadmap-card-header"
                  style={{cursor:locked?"default":"pointer",display:"flex",flexDirection:rowDir,alignItems:"center",gap:8,marginBottom:8,width:"100%",background:"none",border:"none",padding:0,textAlign:"center"}}>

                  {/* Icon */}
                  <div className="roadmap-icon" style={{fontSize:18,width:32,height:32,borderRadius:8,background:`${topic.color}14`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${topic.color}22`,flexShrink:0}}>
                    {topic.icon}
                  </div>

                  {/* Text - takes remaining space, clips instead of wrapping */}
                  <div style={{flex:1,minWidth:0,direction:"ltr",textAlign:"center"}}>
                    <div className="roadmap-title" style={{fontWeight:700,color:"var(--text-primary)",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                      {topic.isNew&&!completed&&<span style={{background:"rgba(99,102,241,0.25)",color:"#818CF8",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:0.5,flexShrink:0,border:"1px solid rgba(99,102,241,0.35)"}}>NEW</span>}
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{topic.name}</span>
                      {completed&&<span style={{flexShrink:0}}>✅</span>}
                    </div>
                    <div className="roadmap-subtitle" style={{color:"var(--text-muted)",fontSize:11,marginTop:1,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",lineHeight:1.4,textAlign:"center"}}>
                      {STAGE_SUBTITLES[topic.id]}
                    </div>
                  </div>

                  {/* Progress % + expand arrow */}
                  {!locked&&(
                    <div className="roadmap-pct" style={{flexShrink:0,textAlign:"center",minWidth:36}}>
                      <div style={{color:completed?"#10B981":isCurrent?topic.color:"var(--text-muted)",fontWeight:700,fontSize:12}}>{progress}%</div>
                      <div aria-hidden="true" style={{color:"var(--text-dim)",fontSize:10}}>{isExpanded?"▲":"▼"}</div>
                    </div>
                  )}
                </button>

                {/* Progress bar */}
                {!locked&&(
                  <div style={{height:6,background:"var(--glass-6)",borderRadius:3,marginBottom:10,direction:"ltr",transform:dir==="rtl"?"scaleX(-1)":undefined}}>
                    <div style={{height:"100%",borderRadius:3,width:`${progress}%`,background:`linear-gradient(90deg,${topic.color},${topic.color}88)`,transition:"width 0.5s ease"}}/>
                  </div>
                )}

                {/* CTA */}
                {locked ? (
                  <div style={{color:"var(--text-disabled)",fontSize:12,textAlign:"center",padding:"6px 0",direction:dir}}>
                    {t("roadmapLocked")}
                  </div>
                ) : completed ? (
                  <button disabled style={{width:"100%",padding:"8px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:10,color:"#10B981",fontSize:13,fontWeight:700,cursor:"default",opacity:0.8,direction:dir}}>
                    {t("roadmapDone")}
                  </button>
                ) : recLvl ? (
                  <button onClick={()=>startTopic(topic,recLvl)}
                    style={{width:"100%",padding:"8px",background:`linear-gradient(135deg,${topic.color}20,${topic.color}10)`,border:`1px solid ${topic.color}40`,borderRadius:10,color:topic.color,fontSize:13,fontWeight:700,cursor:"pointer",transition:"transform 0.15s",direction:dir,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                    <span>{t("roadmapContinueHere")}</span>
                    <span aria-hidden="true">{dir==="rtl"?"◀":"▶"}</span>
                  </button>
                ) : null}

                {/* Expanded difficulty grid */}
                {isExpanded&&(
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,direction:dir}}>
                    {Object.entries(levelConfig).filter(([lvl]) => lvl !== "mixed" && lvl !== "daily").map(([lvl, cfg]) => {
                      const key       = `${topic.id}_${lvl}`;
                      const done      = completedTopics[key];
                      const lvlLocked = isLevelLocked(topic.id, lvl);
                      return (
                        <button key={lvl} className={lvlLocked?"":"card-hover"}
                          onClick={()=>startTopic(topic,lvl)}
                          disabled={lvlLocked}
                          aria-label={`${getLocalizedField(cfg, "label", lang)}${done?` - ${done.correct}/${done.total}`:""}${lvlLocked?" (locked)":""}`}
                          style={{padding:"10px 8px",background:lvlLocked?"var(--glass-1)":done?`${cfg.color}12`:"var(--glass-3)",border:`1px solid ${lvlLocked?"var(--glass-4)":done?cfg.color+"44":"var(--glass-7)"}`,borderRadius:10,textAlign:"center",opacity:lvlLocked?0.45:1,cursor:lvlLocked?"not-allowed":"pointer"}}>
                          <div aria-hidden="true" style={{fontSize:16}}>{lvlLocked?"🔒":cfg.icon}</div>
                          <div style={{fontSize:12,fontWeight:700,color:lvlLocked?"var(--text-disabled)":done?cfg.color:"var(--text-muted)"}}>
                            {getLocalizedField(cfg, "label", lang)}
                          </div>
                          {done&&!lvlLocked&&<div aria-hidden="true" style={{fontSize:10,color:done.correct>0?cfg.color:"#EF4444"}}>{done.correct>0?"✓":""} {done.correct}/{done.total}</div>}
                          <div aria-hidden="true" style={{fontSize:10,color:lvlLocked?"var(--text-faint)":"var(--text-dim)"}}>+{cfg.points}{t("pts")}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Guest signup card ── */}
      {isGuest&&<div className="guest-banner" style={{background:"rgba(0,212,255,0.05)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:14,padding:"16px",marginTop:24,display:"flex",flexDirection:"column",alignItems:"center",gap:10,direction:dir}}>
        <span style={{color:"#4a9aba",fontSize:13,textAlign:"center"}}>{t("guestBanner")}</span>
        <button className="guest-banner-btn" onClick={onSignup} style={{width:"100%",padding:"10px 14px",background:"rgba(0,212,255,0.12)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:10,color:"#00D4FF",fontSize:14,fontWeight:700,cursor:"pointer",textAlign:"center"}}>{t("signupNow")}</button>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:-2,textAlign:"center",width:"100%"}}>{t("alreadyHaveAccount")}{" "}<span onClick={onLogin} style={{color:"#00D4FF",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>{t("loginNow")}</span></span>
      </div>}
    </div>
  );
}
