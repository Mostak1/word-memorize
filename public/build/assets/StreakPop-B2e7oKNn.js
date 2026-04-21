import{r,j as e}from"./app-vv9uIfaz.js";import{L as i,f as l}from"./FireStreakOrange-DT9zQ0-s.js";function c({streakCount:t,onComplete:a}){return r.useEffect(()=>{const s=setTimeout(()=>{a&&a()},2800);return()=>clearTimeout(s)},[a]),e.jsxs("div",{className:"fixed inset-0 z-[999] flex items-center justify-center pointer-events-none backdrop-blur-[2px] bg-black/40 animate-[fadeIn_0.3s_ease-out]",children:[e.jsxs("div",{className:"relative flex flex-col items-center",children:[e.jsxs("div",{className:"relative scale-110",children:[e.jsxs("div",{className:"absolute inset-0 flex items-center justify-center -z-10",children:[e.jsx("div",{className:"absolute w-[260px] h-[260px] bg-orange-600 rounded-full blur-[80px] opacity-60 animate-pulse"}),e.jsx("div",{className:"absolute w-[180px] h-[180px] bg-red-600 rounded-full blur-[60px] opacity-50 animate-pulse",style:{animationDelay:"1s"}})]}),e.jsx(i,{animationData:l,loop:!1,style:{width:340,height:340}}),e.jsxs("div",{className:"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center mt-2",children:[e.jsx("div",{className:"text-7xl font-black text-white tracking-tight animate-[streakPop_0.75s_cubic-bezier(0.34,1.56,0.64,1)_forwards]",style:{textShadow:"0 0 50px rgba(255, 149, 0, 0.9), 0 20px 60px rgba(255, 0, 0, 0.6), 0 0 100px rgba(255, 255, 255, 0.2)"},children:t}),e.jsx("div",{className:"text-white font-extrabold text-xl tracking-[4px] mt-1 drop-shadow-lg opacity-0 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards]",children:"DAY STREAK"})]})]}),e.jsx("div",{className:"mt-2 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]",children:e.jsx("div",{className:"px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-500 text-white font-black text-sm tracking-wide shadow-[0_10px_20px_rgba(234,88,12,0.4)] border border-orange-400/30",children:"YOU'RE ON FIRE!"})})]}),e.jsx("style",{children:`
                @keyframes streakPop {
                    0% {
                        opacity: 0;
                        transform: scale(0.2) translateY(60px);
                    }
                    40% {
                        transform: scale(1.15) translateY(-10px);
                    }
                    70% {
                        transform: scale(0.98) translateY(5px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `})]})}export{c as S};
