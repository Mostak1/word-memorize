import{r as n,u as h,j as e}from"./app-CMei67l9.js";import{X as y}from"./x-Bl5A9Bjo.js";import{F as g}from"./flame-Bg_jUKHe.js";import{Z as k,T as v}from"./ThemeToggle-D3tP4gnL.js";import{L as w}from"./loader-circle-CbLVmjWs.js";import{c as j}from"./createLucideIcon-DgPEYcJa.js";import{S}from"./sparkles-B0riov3d.js";import{L as C}from"./lock-SfCK9k4S.js";const T=[["path",{d:"M10.5 3 8 9l4 13 4-13-2.5-6",key:"b3dvk1"}],["path",{d:"M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z",key:"7w4byz"}],["path",{d:"M2 9h20",key:"16fsjt"}]],R=j("gem",T);function P({isOpen:o,onClose:d,prevStreak:r,xpBalance:m=0,onRepair:p}){const s=m>=5e3,[i,c]=n.useState(!1),{t:a}=h(),[u,b]=n.useState(o),[x,f]=n.useState(!1);return n.useEffect(()=>{if(o){b(!0);const t=setTimeout(()=>f(!0),50);return()=>clearTimeout(t)}else{f(!1);const t=setTimeout(()=>b(!1),600);return()=>clearTimeout(t)}},[o]),u?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
                /* ── Keyframes ─────────────────────────────────────────────── */
                @keyframes sl-fadeIn {
                    from { opacity: 0; } to { opacity: 1; }
                }
                @keyframes sl-scaleIn {
                    0%   { opacity: 0; transform: scale(0.5) translateY(50px); filter: blur(12px); }
                    55%  { transform: scale(1.08) translateY(-8px); filter: blur(0px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes sl-flameOut {
                    0%   { transform: scale(1) rotate(0deg);    opacity: 1;   filter: blur(0px); }
                    30%  { transform: scale(1.1) rotate(-4deg); opacity: 0.9; }
                    60%  { transform: scale(0.85) rotate(3deg); opacity: 0.6; filter: blur(2px); }
                    100% { transform: scale(0.7) rotate(-2deg); opacity: 0.55; filter: blur(4px); }
                }
                @keyframes sl-smoke {
                    0%   { transform: translateX(-50%) translateY(0) scale(0.6);     opacity: 0; }
                    20%  { opacity: 0.55; }
                    100% { transform: translateX(-50%) translateY(-88px) scale(2.3); opacity: 0; }
                }
                @keyframes sl-ember {
                    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
                    100% { transform: translate(var(--ex), var(--ey)) scale(0); opacity: 0; }
                }
                @keyframes sl-shimmer {
                    0%   { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(260%) skewX(-20deg); }
                }
                @keyframes sl-pulse-ring {
                    0%, 100% { transform: scale(1);    opacity: var(--sl-ring-opacity-hi); }
                    50%      { transform: scale(1.15); opacity: var(--sl-ring-opacity-lo); }
                }
                @keyframes sl-float {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-6px); }
                }
                @keyframes sl-numberIn {
                    0%   { opacity: 0; transform: scale(1.9) translateY(-18px); filter: blur(7px); }
                    100% { opacity: 1; transform: scale(1) translateY(0);        filter: blur(0px); }
                }
                @keyframes sl-slideUp {
                    0%   { opacity: 0; transform: translateY(22px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes sl-btnPulse {
                    0%, 100% { box-shadow: 0 8px 32px var(--sl-btn-shadow-base), 0 0 0 1px var(--sl-btn-inset) inset; }
                    50%      { box-shadow: 0 8px 32px var(--sl-btn-shadow-base), 0 0 0 9px rgba(99,102,241,0.2), 0 0 0 1px var(--sl-btn-inset) inset; }
                }
                @keyframes sl-repairPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(234, 179, 8, 0.3); }
                    50%      { transform: scale(1.02); box-shadow: 0 0 35px rgba(234, 179, 8, 0.6); }
                }
                @keyframes sl-spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }


                /* ── Light mode tokens (default) ──────────────────────────── */
                .sl-root {
                    --sl-backdrop-bg:       rgba(226, 232, 240, 0.84);
                    --sl-backdrop-filter:   blur(14px) saturate(0.9);
                    --sl-card-bg:           #ffffff;
                    --sl-card-border:       rgba(99, 102, 241, 0.18);
                    --sl-card-shadow:       0 24px 64px rgba(99,102,241,0.13), 0 6px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(99,102,241,0.05) inset;
                    --sl-top-wash:          linear-gradient(180deg, rgba(99,102,241,0.07) 0%, transparent 100%);
                    --sl-outer-glow:        rgba(99, 102, 241, 0.13);
                    --sl-ring-opacity-hi:   0.28;
                    --sl-ring-opacity-lo:   0.10;
                    --sl-aura-color:        rgba(99, 102, 241, 0.20);
                    --sl-smoke-color:       rgba(99, 102, 241, 0.18);
                    --sl-ember-color:       #818cf8;
                    --sl-ember-glow:        rgba(99, 102, 241, 0.50);
                    --sl-number-color:      #1e1b4b;
                    --sl-number-shadow:     0 4px 20px rgba(79,70,229,0.4), 0 0 40px rgba(99,102,241,0.18);
                    --sl-number-stroke:     rgba(79, 70, 229, 0.32);
                    --sl-days-label:        rgba(79, 70, 229, 0.72);
                    --sl-headline:          #1e1b4b;
                    --sl-body:              #64748b;
                    --sl-stat-bg:           rgba(99, 102, 241, 0.06);
                    --sl-stat-border:       rgba(99, 102, 241, 0.13);
                    --sl-stat-val:          #3730a3;
                    --sl-stat-lbl:          #94a3b8;
                    --sl-pill-bg:           rgba(99, 102, 241, 0.07);
                    --sl-pill-border:       rgba(99, 102, 241, 0.16);
                    --sl-pill-text:         #4338ca;
                    --sl-btn-shadow-base:   rgba(99, 102, 241, 0.40);
                    --sl-btn-shadow-hover:  rgba(99, 102, 241, 0.55);
                    --sl-btn-inset:         rgba(255, 255, 255, 0.25);
                }

                /* ── Dark mode token overrides ────────────────────────────── */
                .dark .sl-root {
                    --sl-backdrop-bg:       rgba(3, 7, 18, 0.88);
                    --sl-backdrop-filter:   blur(14px) saturate(0.6);
                    --sl-card-bg:           linear-gradient(160deg, rgba(15,18,35,0.98) 0%, rgba(10,12,28,0.99) 100%);
                    --sl-card-border:       rgba(99, 102, 241, 0.24);
                    --sl-card-shadow:       0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
                    --sl-top-wash:          linear-gradient(180deg, rgba(99,102,241,0.09) 0%, transparent 100%);
                    --sl-outer-glow:        rgba(99, 102, 241, 0.18);
                    --sl-ring-opacity-hi:   0.35;
                    --sl-ring-opacity-lo:   0.14;
                    --sl-aura-color:        rgba(99, 102, 241, 0.28);
                    --sl-smoke-color:       rgba(129, 140, 248, 0.32);
                    --sl-ember-color:       #a5b4fc;
                    --sl-ember-glow:        rgba(129, 140, 248, 0.60);
                    --sl-number-color:      #ffffff;
                    --sl-number-shadow:     0 6px 24px rgba(99,102,241,0.75), 0 0 60px rgba(129,140,248,0.4);
                    --sl-number-stroke:     rgba(165, 180, 252, 0.60);
                    --sl-days-label:        rgba(165, 180, 252, 0.80);
                    --sl-headline:          #ffffff;
                    --sl-body:              rgba(148, 163, 184, 0.85);
                    --sl-stat-bg:           rgba(255, 255, 255, 0.04);
                    --sl-stat-border:       rgba(255, 255, 255, 0.08);
                    --sl-stat-val:          rgba(199, 210, 254, 0.95);
                    --sl-stat-lbl:          rgba(148, 163, 184, 0.60);
                    --sl-pill-bg:           rgba(99, 102, 241, 0.12);
                    --sl-pill-border:       rgba(99, 102, 241, 0.22);
                    --sl-pill-text:         rgba(165, 180, 252, 0.85);
                    --sl-btn-shadow-base:   rgba(99, 102, 241, 0.45);
                    --sl-btn-shadow-hover:  rgba(99, 102, 241, 0.65);
                    --sl-btn-inset:         rgba(255, 255, 255, 0.10);
                }
            `}),e.jsx("div",{className:"sl-root fixed inset-0 z-[100] flex items-center justify-center p-4",style:{background:"var(--sl-backdrop-bg)",backdropFilter:"var(--sl-backdrop-filter)",WebkitBackdropFilter:"var(--sl-backdrop-filter)",animation:"sl-fadeIn 0.4s ease-out forwards",opacity:o?1:0,transition:"opacity 0.5s ease"},onClick:t=>t.target===t.currentTarget&&d(),children:e.jsxs("div",{style:{animation:x?"sl-scaleIn 0.65s cubic-bezier(0.34,1.45,0.64,1) forwards":"none",opacity:x?void 0:0,width:"100%",maxWidth:"420px",position:"relative"},children:[e.jsx("div",{style:{position:"absolute",inset:"-24px",borderRadius:"48px",background:"radial-gradient(ellipse at center, var(--sl-outer-glow) 0%, transparent 70%)",animation:"sl-pulse-ring 3s ease-in-out infinite",pointerEvents:"none"}}),e.jsxs("div",{style:{position:"relative",background:"var(--sl-card-bg)",borderRadius:"32px",border:"1px solid var(--sl-card-border)",boxShadow:"var(--sl-card-shadow)",overflow:"hidden",padding:"24px 24px 24px",textAlign:"center"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,height:"140px",background:"var(--sl-top-wash)",pointerEvents:"none"}}),e.jsx("button",{onClick:d,className:`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                                text-sm cursor-pointer transition-all
                                bg-black/[0.05] border border-black/[0.09] text-black/40
                                hover:bg-black/[0.10] hover:text-black/70
                                dark:bg-white/[0.06] dark:border-white/10 dark:text-white/40
                                dark:hover:bg-white/[0.13] dark:hover:text-white/80`,children:e.jsx(y,{size:16,strokeWidth:2.25})}),e.jsxs("div",{style:{position:"relative",display:"inline-block",marginBottom:"4px"},children:[e.jsx("div",{style:{position:"absolute",inset:"-16px",borderRadius:"50%",background:"radial-gradient(circle, var(--sl-aura-color) 0%, transparent 70%)",filter:"blur(10px)",animation:"sl-pulse-ring 2.5s ease-in-out infinite"}}),e.jsx("div",{style:{animation:"sl-float 4s ease-in-out infinite",position:"relative",zIndex:2},children:e.jsxs("svg",{width:"110",height:"110",viewBox:"0 0 100 120",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{animation:"sl-flameOut 0.9s 0.3s ease-out forwards",filter:"drop-shadow(0 0 18px rgba(99,102,241,0.45))"},children:[e.jsx("path",{d:"M50 10 C35 25,15 35,18 58 C20 75,30 90,50 100 C70 90,80 75,82 58 C85 35,65 25,50 10Z",fill:"url(#sl-cold-flame)"}),e.jsx("path",{d:"M50 38 C42 48,36 58,38 68 C40 78,45 86,50 90 C55 86,60 78,62 68 C64 58,58 48,50 38Z",fill:"url(#sl-ash-core)",opacity:"0.88"}),e.jsx("line",{x1:"34",y1:"44",x2:"66",y2:"76",stroke:"rgba(255,255,255,0.22)",strokeWidth:"2.5",strokeLinecap:"round"}),e.jsx("line",{x1:"66",y1:"44",x2:"34",y2:"76",stroke:"rgba(255,255,255,0.22)",strokeWidth:"2.5",strokeLinecap:"round"}),e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"sl-cold-flame",x1:"50",y1:"10",x2:"50",y2:"100",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#818cf8"}),e.jsx("stop",{offset:"50%",stopColor:"#6366f1"}),e.jsx("stop",{offset:"100%",stopColor:"#3730a3"})]}),e.jsxs("linearGradient",{id:"sl-ash-core",x1:"50",y1:"38",x2:"50",y2:"90",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"#c7d2fe"}),e.jsx("stop",{offset:"100%",stopColor:"#a5b4fc"})]})]})]})}),[{delay:"0s",left:"43%",w:"10px",dur:"2.8s"},{delay:"0.5s",left:"54%",w:"8px",dur:"3.2s"},{delay:"0.9s",left:"46%",w:"12px",dur:"3.0s"},{delay:"1.4s",left:"57%",w:"7px",dur:"2.5s"},{delay:"1.8s",left:"40%",w:"9px",dur:"3.4s"}].map((t,l)=>e.jsx("div",{style:{position:"absolute",bottom:"8px",left:t.left,width:t.w,height:t.w,borderRadius:"50%",background:"var(--sl-smoke-color)",filter:"blur(4px)",animationName:"sl-smoke",animationDuration:t.dur,animationDelay:t.delay,animationTimingFunction:"ease-out",animationIterationCount:"infinite"}},l)),[{ex:"-30px",ey:"-50px",delay:"0.20s"},{ex:"35px",ey:"-42px",delay:"0.55s"},{ex:"-22px",ey:"-62px",delay:"0.85s"},{ex:"26px",ey:"-54px",delay:"0.35s"}].map((t,l)=>e.jsx("div",{style:{position:"absolute",top:"32%",left:"50%",width:"4px",height:"4px",borderRadius:"50%",background:"var(--sl-ember-color)",boxShadow:"0 0 6px var(--sl-ember-glow)","--ex":t.ex,"--ey":t.ey,animationName:"sl-ember",animationDuration:"1.3s",animationDelay:t.delay,animationTimingFunction:"ease-out",animationIterationCount:"infinite"}},l))]}),e.jsxs("div",{style:{animation:"sl-numberIn 0.7s 0.5s cubic-bezier(0.34,1.56,0.64,1) both"},children:[e.jsx("div",{style:{fontSize:"72px",fontWeight:900,color:"var(--sl-number-color)",lineHeight:1,letterSpacing:"-4px",textShadow:"var(--sl-number-shadow)",WebkitTextStroke:"2px var(--sl-number-stroke)"},children:r}),e.jsx("div",{style:{color:"var(--sl-days-label)",fontSize:"13px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.25em",marginTop:"3px"},children:a("streak.days_lost_label","Day Streak Lost")})]}),e.jsx("h2",{style:{fontSize:"25px",fontWeight:800,color:"var(--sl-headline)",letterSpacing:"-0.5px",margin:"12px 0 6px",lineHeight:1.2,animation:"sl-slideUp 0.6s 0.7s ease-out both"},children:a("streak.broken_title","The Flame Went Out")}),e.jsx("p",{style:{color:"var(--sl-body)",fontSize:"14px",lineHeight:1.65,margin:"0 0 16px",animation:"sl-slideUp 0.6s 0.85s ease-out both"},children:a("streak.broken_desc",{count:r,defaultValue:`Your ${r}-day streak has turned to ash — but the ember is still yours to reignite.`})}),e.jsx("div",{style:{display:"flex",gap:"10px",marginBottom:"16px",animation:"sl-slideUp 0.6s 0.95s ease-out both"},children:[{Icon:g,iconColor:"#f97316",iconFillOpacity:.2,label:a("streak.stat_lost","Streak Lost"),value:`${r}d`},{Icon:k,iconColor:"#eab308",iconFillOpacity:.18,label:a("streak.stat_restart","Study Today"),value:a("streak.stat_restart_val","→ +1")},{Icon:v,iconColor:"#d97706",iconFillOpacity:.22,label:a("streak.stat_goal","New Record"),value:a("streak.stat_goal_val","Possible")}].map((t,l)=>e.jsxs("div",{style:{flex:1,padding:"8px 6px",background:"var(--sl-stat-bg)",border:"1px solid var(--sl-stat-border)",borderRadius:"16px",textAlign:"center"},children:[e.jsx("div",{style:{marginBottom:"4px",color:t.iconColor,display:"flex",justifyContent:"center"},children:e.jsx(t.Icon,{size:19,strokeWidth:2.4,fill:"currentColor",fillOpacity:t.iconFillOpacity})}),e.jsx("div",{style:{fontSize:"14px",fontWeight:700,color:"var(--sl-stat-val)"},children:t.value}),e.jsx("div",{style:{fontSize:"10px",color:"var(--sl-stat-lbl)",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:"2px"},children:t.label})]},l))}),r>0&&e.jsx("div",{style:{marginBottom:"16px",animation:"sl-slideUp 0.6s 1.0s ease-out both"},children:e.jsxs("button",{disabled:!s||i,onClick:async()=>{p&&(c(!0),await p(),c(!1))},style:{width:"100%",padding:"16px 20px",background:s?"linear-gradient(135deg, #f59e0b 0%, #d97706 100%)":"rgba(0,0,0,0.05)",border:s?"none":"1px dashed rgba(0,0,0,0.1)",borderRadius:"20px",color:s?"white":"#94a3b8",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:s?"pointer":"not-allowed",transition:"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",opacity:i?.7:1,position:"relative",overflow:"hidden",animation:s?"sl-repairPulse 3s infinite":"none"},onMouseEnter:t=>{s&&(t.currentTarget.style.transform="translateY(-2px)",t.currentTarget.style.filter="brightness(1.1)")},onMouseLeave:t=>{s&&(t.currentTarget.style.transform="translateY(0)",t.currentTarget.style.filter="brightness(1)")},children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{style:{width:"36px",height:"36px",borderRadius:"12px",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:s?"white":"#38bdf8"},children:i?e.jsx(w,{size:20,strokeWidth:2.4,style:{animation:"sl-spin-slow 1s linear infinite"}}):e.jsx(R,{size:20,strokeWidth:2.4,fill:"currentColor",fillOpacity:.16})}),e.jsxs("div",{className:"text-left",children:[e.jsx("div",{style:{fontWeight:800,fontSize:"14px",lineHeight:1.2},children:i?a("streak.repairing","Repairing..."):a("streak.repair_title","Repair Streak")}),e.jsx("div",{style:{fontSize:"11px",opacity:.8,fontWeight:600},children:s?a("streak.repair_cost",{cost:5e3,defaultValue:"Use 5000 XP to restore"}):a("streak.repair_insufficient",{cost:5e3,defaultValue:"Need 5000 XP"})})]})]}),e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:s?e.jsx(S,{size:20,strokeWidth:2.4,color:"#fde68a",fill:"#fde68a",fillOpacity:.18}):e.jsx(C,{size:20,strokeWidth:2.4,color:"#94a3b8"})}),s&&e.jsx("div",{style:{position:"absolute",inset:0,background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",transform:"translateX(-100%)",animation:"sl-shimmer 2s infinite"}})]})}),e.jsxs("div",{style:{animation:"sl-slideUp 0.6s 1.05s ease-out both"},children:[e.jsxs("button",{onClick:d,style:{width:"100%",padding:"12px 24px",background:"linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",border:"none",borderRadius:"18px",color:"white",fontSize:"15px",fontWeight:800,letterSpacing:"0.05em",cursor:"pointer",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",boxShadow:"0 8px 32px var(--sl-btn-shadow-base), 0 0 0 1px var(--sl-btn-inset) inset",animation:"sl-btnPulse 2.5s 1.5s ease-in-out infinite",transition:"transform 0.15s, box-shadow 0.15s"},onMouseEnter:t=>{t.currentTarget.style.transform="scale(1.025)",t.currentTarget.style.boxShadow="0 12px 40px var(--sl-btn-shadow-hover), 0 0 0 1px var(--sl-btn-inset) inset"},onMouseLeave:t=>{t.currentTarget.style.transform="scale(1)",t.currentTarget.style.boxShadow="0 8px 32px var(--sl-btn-shadow-base), 0 0 0 1px var(--sl-btn-inset) inset"},onMouseDown:t=>t.currentTarget.style.transform="scale(0.975)",onMouseUp:t=>t.currentTarget.style.transform="scale(1.025)",children:[e.jsx("span",{style:{position:"absolute",top:0,left:0,width:"40%",height:"100%",background:"rgba(255,255,255,0.18)",animation:"sl-shimmer 2.5s 1.2s ease-in-out infinite",pointerEvents:"none"}}),e.jsx(g,{size:18,strokeWidth:2.5,color:"#fed7aa",fill:"#f97316",fillOpacity:.9}),a("streak.start_again","Reignite My Streak Today")]}),e.jsx("div",{style:{marginTop:"13px",display:"inline-block",padding:"6px 16px",background:"var(--sl-pill-bg)",border:"1px solid var(--sl-pill-border)",borderRadius:"100px"},children:e.jsx("span",{style:{color:"var(--sl-pill-text)",fontSize:"11px",fontWeight:600,letterSpacing:"0.05em"},children:a("streak.encouragement","Every champion has fallen. Champions get back up.")})})]})]})]})})]}):null}export{P as S};
