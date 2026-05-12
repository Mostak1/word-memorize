import{u as U,c as E,r as o,t as i,j as e}from"./app-DJLCB9zT.js";import{F as _,M as $,S as v,t as M}from"./AppLayout-C-D6NNoA.js";import{X as L}from"./dialog-ClF4U1D4.js";import{L as W}from"./lock-open-DAOQhaPU.js";import{S as X}from"./share-2-E3-vMTXo.js";function q({listName:d,onDismiss:k}){const{t:a}=U(),{assetUrl:j}=E().props,[I,C]=o.useState(!1),[S,b]=o.useState(!1),[f,R]=o.useState(!1),[u,g]=o.useState(!1),[w,T]=o.useState(!1),p=o.useRef(null);o.useEffect(()=>{const t=setTimeout(()=>T(!0),50);return()=>clearTimeout(t)},[]);const m=()=>{R(!0),setTimeout(()=>k(),500)},l=window.location.origin,n=a("achievements.overlay.unlocked_share_text",{name:d}),z=[{name:a("achievements.overlay.facebook"),icon:_,color:"linear-gradient(135deg,#1877F2,#0d5fd4)",action:()=>Y("facebook")},{name:a("achievements.overlay.whatsapp"),icon:$,color:"linear-gradient(135deg,#25D366,#128C7E)",action:()=>window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(n+" "+l)}`,"_blank")},{name:a("achievements.overlay.telegram"),icon:v,color:"linear-gradient(135deg,#0088cc,#006aaa)",action:()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(l)}&text=${encodeURIComponent(n)}`,"_blank")},{name:S?"Copied!":a("achievements.overlay.copy_link"),icon:v,color:"linear-gradient(135deg,#475569,#334155)",action:()=>{navigator.clipboard.writeText(`${n} ${l}`),b(!0),setTimeout(()=>b(!1),2e3)}}],Y=async(t=null)=>{if(!p.current)return;g(!0);const r=i.loading(a("achievements.overlay.generating"));try{await new Promise(c=>setTimeout(c,150));const s=await M(p.current,{cacheBust:!0,backgroundColor:document.documentElement.classList.contains("dark")?"#020a14":"#ffffff",style:{borderRadius:"32px"},fontEmbedCSS:""}),x=await(await fetch(s)).blob(),h=`unlocked-${d.toLowerCase().replace(/\s+/g,"-")}.png`,y=new File([x],h,{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[y]}))await navigator.share({files:[y],title:a("achievements.overlay.wordlist_unlocked_title"),text:n}),i.success(a("achievements.overlay.shared"),{id:r});else{const c=document.createElement("a");if(c.download=h,c.href=s,c.click(),t==="facebook")try{await navigator.clipboard.write([new ClipboardItem({"image/png":x})]),window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l)}&quote=${encodeURIComponent(n)}`,"_blank"),i.success(a("achievements.overlay.downloaded")+" & Image copied!",{id:r,duration:6e3})}catch{window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l)}&quote=${encodeURIComponent(n)}`,"_blank"),i.success(a("achievements.overlay.downloaded"),{id:r})}else i.success(a("achievements.overlay.downloaded"),{id:r})}}catch{i.error(a("achievements.overlay.failed"),{id:r})}finally{g(!1)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
                @keyframes wu-backdropIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes wu-backdropOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes wu-cardIn {
                    0%   { opacity: 0; transform: scale(0.78) translateY(40px); filter: blur(8px); }
                    60%  { transform: scale(1.04) translateY(-6px); filter: blur(0); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes wu-cardOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(0.88) translateY(28px); filter: blur(6px); }
                }
                @keyframes wu-iconIn {
                    0%   { opacity: 0; transform: scale(0.2) rotate(-30deg); filter: blur(14px); }
                    55%  { transform: scale(1.18) rotate(6deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0); filter: blur(0); }
                }
                @keyframes wu-shackle {
                    0%   { transform: rotate(0deg) translateY(0); opacity: 1; }
                    40%  { transform: rotate(-20deg) translateY(-6px); opacity: 0.8; }
                    100% { transform: rotate(-40deg) translateY(-12px); opacity: 0; }
                }
                @keyframes wu-pulse {
                    0%, 100% { transform: scale(1);    opacity: 0.4; }
                    50%      { transform: scale(1.16); opacity: 0.15; }
                }
                @keyframes wu-scanline {
                    0%   { top: -100%; }
                    100% { top: 200%; }
                }
                @keyframes wu-float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50%      { transform: translateY(-7px) rotate(1deg); }
                }
                @keyframes wu-shimmer {
                    0%   { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(280%) skewX(-20deg); }
                }
                @keyframes wu-slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes wu-labelIn {
                    from { opacity: 0; letter-spacing: 0.45em; }
                    to   { opacity: 1; letter-spacing: 0.22em; }
                }
                @keyframes wu-titleIn {
                    from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
                    to   { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes wu-btnPulse {
                    0%, 100% { box-shadow: 0 8px 28px var(--wu-btn-glow), 0 0 0 1px rgba(255,255,255,0.15) inset; }
                    50%      { box-shadow: 0 8px 28px var(--wu-btn-glow), 0 0 0 8px rgba(59,130,246,0.18), 0 0 0 1px rgba(255,255,255,0.15) inset; }
                }
                @keyframes wu-fadeInRow {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes wu-orbita {
                    from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
                }
                @keyframes wu-orbitb {
                    from { transform: rotate(220deg) translateX(46px) rotate(-220deg); }
                    to   { transform: rotate(580deg) translateX(46px) rotate(-580deg); }
                }
                @keyframes wu-particle {
                    0%   { transform: translate(0,0) scale(1); opacity: 1; }
                    100% { transform: translate(var(--px),var(--py)) scale(0); opacity: 0; }
                }
                @keyframes wu-keyGlow {
                    0%, 100% { filter: drop-shadow(0 0 6px var(--wu-aura)); }
                    50%      { filter: drop-shadow(0 0 18px var(--wu-aura)); }
                }

                /* ── Light tokens ── */
                .wu-root {
                    --wu-backdrop:       rgba(203,213,225,0.78);
                    --wu-card-bg:        #ffffff;
                    --wu-card-border:    rgba(59,130,246,0.15);
                    --wu-card-shadow:    0 28px 80px rgba(59,130,246,0.16), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(59,130,246,0.05) inset;
                    --wu-top-wash:       linear-gradient(180deg, rgba(59,130,246,0.09) 0%, transparent 70%);
                    --wu-ring:           rgba(59,130,246,0.22);
                    --wu-aura:           rgba(59,130,246,0.2);
                    --wu-icon-bg:        rgba(219,234,254,0.9);
                    --wu-icon-color:     #2563eb;
                    --wu-orbit-a:        rgba(59,130,246,0.65);
                    --wu-orbit-b:        rgba(96,165,250,0.45);
                    --wu-label-color:    #1d4ed8;
                    --wu-title-color:    #0f172a;
                    --wu-body-color:     #64748b;
                    --wu-footer-bg:      rgba(239,246,255,0.9);
                    --wu-footer-border:  rgba(59,130,246,0.1);
                    --wu-close-bg:       rgba(241,245,249,0.9);
                    --wu-close-hover:    rgba(219,234,254,1);
                    --wu-close-color:    #94a3b8;
                    --wu-btn-bg:         linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
                    --wu-btn-glow:       rgba(59,130,246,0.45);
                    --wu-btn-text:       #ffffff;
                    --wu-beam-color:     rgba(59,130,246,0.06);
                }
                /* ── Dark tokens ── */
                .dark .wu-root {
                    --wu-backdrop:       rgba(2,6,18,0.88);
                    --wu-card-bg:        linear-gradient(160deg, rgba(5,10,28,0.99) 0%, rgba(3,7,20,0.99) 100%);
                    --wu-card-border:    rgba(59,130,246,0.24);
                    --wu-card-shadow:    0 32px 100px rgba(0,0,0,0.82), 0 0 0 1px rgba(255,255,255,0.04) inset;
                    --wu-top-wash:       linear-gradient(180deg, rgba(59,130,246,0.14) 0%, transparent 70%);
                    --wu-ring:           rgba(96,165,250,0.28);
                    --wu-aura:           rgba(59,130,246,0.28);
                    --wu-icon-bg:        rgba(59,130,246,0.14);
                    --wu-icon-color:     #60a5fa;
                    --wu-orbit-a:        rgba(96,165,250,0.75);
                    --wu-orbit-b:        rgba(147,197,253,0.5);
                    --wu-label-color:    #60a5fa;
                    --wu-title-color:    #ffffff;
                    --wu-body-color:     rgba(148,163,184,0.8);
                    --wu-footer-bg:      rgba(255,255,255,0.03);
                    --wu-footer-border:  rgba(255,255,255,0.07);
                    --wu-close-bg:       rgba(255,255,255,0.07);
                    --wu-close-hover:    rgba(255,255,255,0.12);
                    --wu-close-color:    rgba(148,163,184,0.8);
                    --wu-btn-bg:         linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
                    --wu-btn-glow:       rgba(59,130,246,0.55);
                    --wu-btn-text:       #ffffff;
                    --wu-beam-color:     rgba(59,130,246,0.08);
                }
            `}),e.jsx("div",{className:"wu-root fixed inset-0 z-[200] flex items-center justify-center p-4",style:{background:"var(--wu-backdrop)",backdropFilter:"blur(18px) saturate(1.1)",animation:f?"wu-backdropOut 0.5s ease forwards":"wu-backdropIn 0.35s ease forwards"},onClick:m,children:e.jsxs("div",{ref:p,onClick:t=>t.stopPropagation(),style:{position:"relative",width:"100%",maxWidth:"360px",background:"var(--wu-card-bg)",border:"1px solid var(--wu-card-border)",borderRadius:"32px",boxShadow:"var(--wu-card-shadow)",overflow:"hidden",animation:f?"wu-cardOut 0.5s cubic-bezier(0.4,0,1,1) forwards":w?"wu-cardIn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards":"none",opacity:w?void 0:0,fontFamily:"'Plus Jakarta Sans', sans-serif"},children:[e.jsx("div",{style:{position:"absolute",inset:0,background:"var(--wu-top-wash)",pointerEvents:"none",zIndex:0}}),e.jsx("div",{style:{position:"absolute",left:0,right:0,height:"30%",background:"linear-gradient(180deg, transparent, var(--wu-beam-color), transparent)",animation:"wu-scanline 4s 1s linear infinite",pointerEvents:"none",zIndex:1}}),e.jsx("div",{style:{position:"absolute",top:22,left:28,zIndex:20,opacity:u?1:0,pointerEvents:"none",transition:"opacity 0.3s"},children:e.jsx("img",{src:`${j}/img/logo.png`,alt:"Logo",style:{height:30,width:"auto"}})}),!u&&e.jsx("button",{onClick:m,style:{position:"absolute",top:20,right:20,zIndex:20,width:36,height:36,borderRadius:"50%",background:"var(--wu-close-bg)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s, transform 0.15s"},onMouseEnter:t=>{t.currentTarget.style.background="var(--wu-close-hover)",t.currentTarget.style.transform="scale(1.08)"},onMouseLeave:t=>{t.currentTarget.style.background="var(--wu-close-bg)",t.currentTarget.style.transform="scale(1)"},children:e.jsx(L,{size:15,style:{color:"var(--wu-close-color)"}})}),e.jsxs("div",{style:{padding:"44px 32px 0",textAlign:"center",position:"relative",zIndex:2},children:[e.jsx("div",{style:{animation:"wu-labelIn 0.5s 0.2s ease both",color:"var(--wu-label-color)",fontSize:10,fontWeight:800,letterSpacing:"0.22em",textTransform:"uppercase",marginBottom:10},children:a("achievements.overlay.content_unlocked")}),e.jsx("h2",{style:{animation:"wu-titleIn 0.5s 0.35s ease both",color:"var(--wu-title-color)",fontSize:30,fontWeight:900,lineHeight:1.15,margin:0},children:d}),e.jsx("p",{style:{animation:"wu-slideUp 0.5s 0.5s ease both",color:"var(--wu-body-color)",fontSize:13,marginTop:8,fontWeight:500},children:a("achievements.overlay.new_list_available")})]}),e.jsxs("div",{style:{position:"relative",display:"flex",justifyContent:"center",alignItems:"center",padding:"30px 0 26px",zIndex:2},children:[e.jsx("div",{style:{position:"absolute",width:156,height:156,borderRadius:"50%",border:"2px solid var(--wu-ring)",animation:"wu-pulse 3s ease-in-out infinite"}}),e.jsx("div",{style:{position:"absolute",width:196,height:196,borderRadius:"50%",border:"1px solid var(--wu-ring)",animation:"wu-pulse 3s 0.5s ease-in-out infinite"}}),e.jsx("div",{style:{position:"absolute",width:140,height:140,borderRadius:"50%",background:"var(--wu-aura)",filter:"blur(38px)"}}),e.jsx("div",{style:{position:"absolute",width:8,height:8,borderRadius:"50%",background:"var(--wu-orbit-a)",boxShadow:"0 0 8px 2px var(--wu-orbit-a)",animation:"wu-orbita 5s linear infinite"}}),e.jsx("div",{style:{position:"absolute",width:5,height:5,borderRadius:"50%",background:"var(--wu-orbit-b)",animation:"wu-orbitb 7.5s linear infinite"}}),[{"--px":"-40px","--py":"-30px"},{"--px":"38px","--py":"-35px"},{"--px":"-35px","--py":"32px"},{"--px":"42px","--py":"28px"},{"--px":"0px","--py":"-48px"},{"--px":"0px","--py":"50px"}].map((t,r)=>e.jsx("div",{style:{position:"absolute",width:r%2===0?8:5,height:r%2===0?8:5,borderRadius:"50%",background:"var(--wu-orbit-a)",...t,animation:`wu-particle 0.8s ${.6+r*.1}s ease-out both`,zIndex:3}},r)),e.jsx("div",{style:{position:"relative",zIndex:10,width:100,height:100,borderRadius:"50%",background:"var(--wu-icon-bg)",display:"flex",alignItems:"center",justifyContent:"center",animation:"wu-iconIn 0.8s 0.5s cubic-bezier(0.34,1.56,0.64,1) both, wu-float 4s 1.5s ease-in-out infinite, wu-keyGlow 2.5s 1.5s ease-in-out infinite"},children:e.jsx(W,{size:52,style:{color:"var(--wu-icon-color)"},strokeWidth:1.5})})]}),!u&&e.jsx("div",{style:{padding:"14px 16px 16px",background:"var(--wu-footer-bg)",borderTop:"1px solid var(--wu-footer-border)",animation:"wu-slideUp 0.5s 0.95s ease both"},children:I?e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,animation:"wu-fadeInRow 0.3s ease both"},children:z.map((t,r)=>e.jsxs("button",{onClick:t.action,title:t.name,style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 4px",borderRadius:"16px",background:t.color,border:"none",cursor:"pointer",boxShadow:"0 4px 14px rgba(0,0,0,0.2)",transition:"transform 0.15s",animation:`wu-fadeInRow 0.3s ${r*.06}s ease both`},onMouseEnter:s=>{s.currentTarget.style.transform="scale(1.06) translateY(-2px)"},onMouseLeave:s=>{s.currentTarget.style.transform="scale(1)"},children:[e.jsx(t.icon,{size:16,color:"#fff"}),e.jsx("span",{style:{color:"#fff",fontSize:7.5,fontWeight:800,marginTop:5,letterSpacing:"0.06em",textTransform:"uppercase"},children:t.name})]},t.name))}):e.jsxs("button",{onClick:()=>C(!0),style:{width:"100%",padding:"15px 24px",background:"var(--wu-btn-bg)",border:"none",borderRadius:"20px",color:"var(--wu-btn-text)",fontSize:13,fontWeight:800,letterSpacing:"0.04em",cursor:"pointer",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 8px 28px var(--wu-btn-glow), 0 0 0 1px rgba(255,255,255,0.15) inset",animation:"wu-btnPulse 2.8s 1.5s ease-in-out infinite",transition:"transform 0.15s"},onMouseEnter:t=>{t.currentTarget.style.transform="scale(1.025)"},onMouseLeave:t=>{t.currentTarget.style.transform="scale(1)"},onMouseDown:t=>{t.currentTarget.style.transform="scale(0.975)"},onMouseUp:t=>{t.currentTarget.style.transform="scale(1.025)"},children:[e.jsx("span",{style:{position:"absolute",top:0,left:0,width:"38%",height:"100%",background:"rgba(255,255,255,0.18)",animation:"wu-shimmer 2.8s 1.2s ease-in-out infinite",pointerEvents:"none"}}),e.jsx(X,{size:16}),a("achievements.overlay.share_progress")]})})]})})]})}export{q as W};
