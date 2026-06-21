import{r as l,c as E,b as v,j as e,H as B,L as S}from"./app-BlAVxJdw.js";import"./app-plSyhqFI.js";function L({categories:t=[],freeWordsCount:f=0}){const[o,y]=l.useState("en"),{referral:p}=E().props,w=s=>{if(!s)return"img/landing/personal_word.webp";const n=s.toLowerCase();return n.includes("academic")||n.includes("ielts")?"img/landing/academic.webp":n.includes("basic")?"img/landing/basic.webp":n.includes("advanced")?"img/landing/advanced_essantial_words.webp":n.includes("phrase")||n.includes("idiom")?"img/landing/phrases_idioms.webp":n.includes("master")||n.includes("iba")||n.includes("gre")||n.includes("sat")?"img/landing/master_vocab.webp":"img/landing/personal_word.webp"},k=["Bagerhat","Bandarban","Barguna","Barisal","Bhola","Bogura","Brahmanbaria","Chandpur","Chapai Nawabganj","Chattogram","Chuadanga","Cumilla","Cox's Bazar","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokathi","Jhenaidah","Joypurhat","Khagrachari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon","Expat"],[c,d]=l.useState("register"),[m,z]=l.useState(!1),[r,x]=l.useState(null),a=v({name:"",email:"",password:"",phone_number:"",learning_goal:"",location:"",referral_code:p?.prefill_code??""}),i=v({email:"",password:"",remember:!1}),F=s=>{s.preventDefault(),a.post(route("register"),{onSuccess:()=>a.reset("password")})},A=s=>{s.preventDefault(),i.post(route("login"),{onSuccess:()=>i.reset("password")})};l.useEffect(()=>{o==="bn"?(document.body.classList.remove("lang-en"),document.body.classList.add("lang-bn")):(document.body.classList.remove("lang-bn"),document.body.classList.add("lang-en"))},[o]),l.useEffect(()=>{const s=new IntersectionObserver(n=>{n.forEach(N=>{N.isIntersecting&&N.target.classList.add("vis")})},{threshold:.1});return document.querySelectorAll(".sr").forEach(n=>s.observe(n)),()=>s.disconnect()},[]);const b=s=>s?.name?.toLowerCase().includes("advanced essential"),u=s=>{const n=s?.name?.toLowerCase()??"";return n.includes("master vocabulary")||n.includes("iba")&&n.includes("gre")&&n.includes("gmat")&&n.includes("sat")},h=t.find(b),g=t.find(u),j=h&&g?t.filter(s=>!u(s)).map(s=>b(s)?{...s,id:`${h.id}-${g.id}`,name:"Advanced Essential + Master Vocabulary",description:"Advanced GRE essentials plus extended IBA / GRE / GMAT / SAT master vocabulary.",price:599,words_count:(Number(h.words_count)||0)+(Number(g.words_count)||0),is_combo:!0}:s):t;return e.jsxs("div",{className:o==="bn"?"lang-bn":"lang-en",children:[e.jsx(B,{children:e.jsx("title",{children:"VocabPix — Learn Vocabulary Scientifically"})}),e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&display=swap');

        @font-face {
            font-family: 'Aileron';
            src: url('/fonts/aileron/Aileron-Regular.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('/fonts/aileron/Aileron-SemiBold.otf') format('opentype');
            font-weight: 600;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('/fonts/aileron/Aileron-Bold.otf') format('opentype');
            font-weight: 700;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('/fonts/aileron/Aileron-Heavy.otf') format('opentype');
            font-weight: 800;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('/fonts/aileron/Aileron-Black.otf') format('opentype');
            font-weight: 900;
            font-style: normal;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        :root {
            --red: #E8192C;
            --red2: #C0111F;
            --red3: #FF4D5E;
            --dark: #1C1B1F;
            --body: #3D3D3D;
            --muted: #7A7A8A;
            --bg: #F8F9FC;
            --white: #FFFFFF;
            --green: #1DB954;
            --yellow: #FFB800;
            --blue: #2563EB;
            --border: #E5E7EB;
        }

        body {
            font-family: 'Aileron', 'Noto Sans Bengali', sans-serif;
            color: var(--body);
            background: var(--bg);
            overflow-x: hidden;
        }

        /* ── Language toggle ── */
        .t-bn {
            display: none;
        }

        body.lang-bn .t-en {
            display: none;
        }

        body.lang-bn .t-bn {
            display: inline;
        }

        body.lang-bn div.t-bn,
        body.lang-bn p.t-bn,
        body.lang-bn li.t-bn {
            display: block;
        }

        body.lang-bn {
            font-family: 'Noto Sans Bengali', 'Aileron', sans-serif;
        }

        /* ── Topbar ── */
        .topbar {
            background: var(--red);
            color: #fff;
            text-align: center;
            padding: 9px 16px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: .02em;
        }

        .topbar span {
            background: rgba(255, 255, 255, .25);
            padding: 2px 10px;
            border-radius: 20px;
            margin-left: 8px;
            font-size: 12px;
        }

        /* ── Nav ── */
        nav {
            position: sticky;
            top: 0;
            z-index: 200;
            background: #fff;
            border-bottom: 1.5px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 48px;
            height: 64px;
        }

        .nav-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }

        .nav-logo-mark {
            background: var(--red);
            color: #fff;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 900;
        }

        .nav-logo-text {
            font-weight: 900;
            font-size: 1.15rem;
            color: var(--dark);
        }

        .nav-logo-text sup {
            font-size: .55rem;
            background: var(--red);
            color: #fff;
            padding: 1px 5px;
            border-radius: 4px;
            margin-left: 2px;
            vertical-align: super;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 28px;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--muted);
            font-weight: 600;
            font-size: .9rem;
            transition: color .2s;
        }

        .nav-links a:hover {
            color: var(--red);
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Language toggle button */
        .lang-toggle-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--bg);
            border: 1.5px solid var(--border);
            border-radius: 20px;
            padding: 5px 14px;
            font-size: .82rem;
            font-weight: 700;
            cursor: pointer;
            transition: all .2s;
            font-family: inherit;
            color: var(--dark);
        }

        .lang-toggle-btn:hover {
            border-color: var(--red);
            color: var(--red);
        }

        /* Hamburger */
        .hamburger {
            display: none;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 6px;
        }

        .hamburger span {
            display: block;
            width: 24px;
            height: 2.5px;
            background: var(--dark);
            border-radius: 2px;
            transition: all .3s;
        }

        .hamburger.open span:nth-child(1) {
            transform: translateY(7.5px) rotate(45deg);
        }

        .hamburger.open span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
            transform: translateY(-7.5px) rotate(-45deg);
        }

        /* Mobile nav drawer */
        .mobile-nav {
            display: none;
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            bottom: 0;
            background: #fff;
            z-index: 199;
            padding: 24px;
            flex-direction: column;
            gap: 0;
            overflow-y: auto;
            border-top: 1.5px solid var(--border);
        }

        .mobile-nav.open {
            display: flex;
        }

        .mobile-nav a,
        .mobile-nav button.mobile-nav-link {
            padding: 16px 0;
            border-bottom: 1px solid var(--border);
            text-decoration: none;
            color: var(--dark);
            font-weight: 700;
            font-size: 1rem;
            display: block;
            background: none;
            border-left: none;
            border-right: none;
            border-top: none;
            text-align: left;
            cursor: pointer;
            font-family: inherit;
        }

        .mobile-nav-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 24px;
        }

        .btn-ghost {
            padding: 9px 20px;
            border: 2px solid var(--border);
            border-radius: 10px;
            font-weight: 700;
            font-size: .88rem;
            text-decoration: none;
            color: var(--dark);
            transition: all .2s;
            background: #fff;
            cursor: pointer;
        }

        .btn-ghost:hover {
            border-color: var(--red);
            color: var(--red);
        }

        .btn-red {
            padding: 9px 22px;
            background: var(--red);
            color: #fff;
            border-radius: 10px;
            font-weight: 800;
            font-size: .88rem;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all .2s;
        }

        .btn-red:hover {
            background: var(--red2);
            transform: translateY(-1px);
        }

        /* ── Hero ── */
        .hero {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 24px 60px;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 20px;
            background: #FFF0F1;
            border: 1.5px solid #FFCDD1;
            color: var(--red);
            padding: 5px 14px;
            border-radius: 30px;
            font-size: .8rem;
            font-weight: 800;
            letter-spacing: .04em;
        }

        .hero h1 {
            font-size: clamp(2rem, 4.5vw, 3.4rem);
            font-weight: 900;
            line-height: 1.15;
            color: var(--dark);
            margin-bottom: 18px;
        }

        .hero h1 em {
            font-style: normal;
            color: var(--red);
        }

        .hero-sub {
            color: var(--muted);
            font-size: 1.05rem;
            line-height: 1.75;
            margin-bottom: 28px;
            max-width: 480px;
        }

        .hero-exam-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 32px;
        }

        .exam-tag {
            background: #fff;
            border: 1.5px solid var(--border);
            border-radius: 8px;
            padding: 5px 12px;
            font-size: .78rem;
            font-weight: 700;
            color: var(--body);
        }

        .hero-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 32px;
        }

        .btn-hero {
            padding: 14px 30px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 1rem;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all .2s;
        }

        .btn-hero-primary {
            background: var(--red);
            color: #fff;
            box-shadow: 0 6px 24px rgba(232, 25, 44, .28);
        }

        .btn-hero-primary:hover {
            background: var(--red2);
            transform: translateY(-2px);
        }

        .btn-hero-secondary {
            background: #fff;
            color: var(--dark);
            border: 2px solid var(--border);
        }

        .btn-hero-secondary:hover {
            border-color: var(--red);
            color: var(--red);
        }

        .hero-trust {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: .82rem;
            color: var(--muted);
            font-weight: 600;
        }

        .trust-avatars {
            display: flex;
        }

        .trust-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid #fff;
            margin-right: -8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            color: #fff;
        }

        /* Hero visual / video */
        .hero-visual {
            position: relative;
            display: flex;
            justify-content: flex-end;
            align-items: flex-start;
            margin-top: 10%;
        }

        .hero-video-wrap {
            width: 100%;
            padding: 10px;
            background: #fff;
            border: 1.5px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 22px 70px rgba(28, 27, 31, .14);
            aspect-ratio: 16 / 9;
            align-self: flex-start;
        }

        .hero-video-wrap iframe {
            width: 100%;
            height: 100%;
            border-radius: 16px;
            display: block;
        }

        /* (card stack kept but hidden) */
        .card-stack {
            position: relative;
            width: 320px;
            height: 420px;
        }

        .word-card {
            position: absolute;
            background: #fff;
            border-radius: 20px;
            border: 1.5px solid var(--border);
            padding: 24px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, .1);
        }

        .wc-main {
            width: 300px;
            left: 10px;
            top: 20px;
            z-index: 3;
            animation: float 4s ease-in-out infinite;
        }

        .wc-back1 {
            width: 290px;
            left: 25px;
            top: 8px;
            height: 420px;
            z-index: 2;
            transform: rotate(3deg);
            opacity: .7;
            background: #FFF8F8;
        }

        .wc-back2 {
            width: 280px;
            left: 30px;
            top: 0;
            height: 420px;
            z-index: 1;
            transform: rotate(6deg);
            opacity: .45;
            background: #FFF3F3;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0)
            }

            50% {
                transform: translateY(-10px)
            }
        }

        /* ── Stats ── */
        .stats-row {
            background: var(--dark);
            padding: 36px 24px;
            display: flex;
            justify-content: center;
            gap: 0;
            flex-wrap: wrap;
        }

        .stat-item {
            text-align: center;
            padding: 0 48px;
            border-right: 1px solid rgba(255, 255, 255, .1);
        }

        .stat-item:last-child {
            border-right: none;
        }

        .stat-n {
            font-size: 2.4rem;
            font-weight: 900;
            color: #fff;
        }

        .stat-n span {
            color: var(--red);
        }

        .stat-l {
            font-size: .8rem;
            color: rgba(255, 255, 255, .5);
            font-weight: 600;
            margin-top: 2px;
        }

        /* ── Sections shared ── */
        .section-eyebrow {
            font-size: .75rem;
            font-weight: 800;
            letter-spacing: .1em;
            text-transform: uppercase;
            color: var(--red);
            margin-bottom: 10px;
        }

        .section-title {
            font-size: clamp(1.8rem, 3.5vw, 2.6rem);
            font-weight: 900;
            color: var(--dark);
            line-height: 1.15;
            margin-bottom: 12px;
        }

        .section-sub {
            color: var(--muted);
            font-size: 1rem;
            line-height: 1.7;
            max-width: 500px;
            margin-bottom: 28px;
        }

        /* ── Exams ── */
        .exams-section {
            max-width: 1140px;
            margin: 0 auto;
            padding: 80px 24px;
        }

        .exams-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
            max-width: 1040px;
            margin: 0 auto;
            justify-content: center;
        }

        .exam-card {
            background: #fff;
            border: 1.5px solid var(--border);
            border-radius: 16px;
            padding: 24px 20px;
            text-align: center;
            transition: all .25s;
            cursor: pointer;
            text-decoration: none;
            display: block;
        }

        .exam-card:hover {
            border-color: var(--red);
            transform: translateY(-3px);
            box-shadow: 0 10px 32px rgba(232, 25, 44, .1);
        }

        .exam-icon {
            font-size: 2rem;
            margin-bottom: 12px;
        }

        .exam-name {
            font-weight: 900;
            font-size: 1.05rem;
            color: var(--dark);
            margin-bottom: 4px;
        }

        .exam-words {
            font-size: .78rem;
            color: var(--muted);
            font-weight: 600;
        }

        /* ── How It Works ── */
        .how-section {
            background: #fff;
            padding: 80px 24px;
        }

        .how-inner {
            max-width: 1140px;
            margin: 0 auto;
        }

        .how-steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 32px;
            position: relative;
        }

        .how-step {
            background: #fff;
            border-radius: 24px;
            padding: 24px 24px;
            position: relative;
            border: 1.5px solid var(--border);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: all 0.3s ease;
        }

        .how-step:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            border-color: var(--red);
        }

        .how-step-num {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--red);
            color: #fff;
            font-weight: 900;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(232, 25, 44, 0.3);
        }

        .how-step-icon {
            margin-bottom: 28px;
            width: 100%;
            display: flex;
            justify-content: center;
            position: relative;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .how-step-icon img {
            width: 190px;
            height: auto;
            border-radius: 22px;
            border: 7px solid #1C1B1F;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            background: #fff;
            position: relative;
            z-index: 2;
            transition: box-shadow 0.4s ease;
        }

        .how-step-icon::before {
            content: "";
            position: absolute;
            top: 7px; /* Adjusted to sit better on the frame */
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 12px;
            background: #1C1B1F;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
            z-index: 10;
        }

        .how-step-icon::after {
            content: "";
            position: absolute;
            top: 7px;
            left: 50%;
            transform: translateX(-50%);
            width: 190px;
            height: 100%; /* Use 100% to match image height */
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%);
            pointer-events: none;
            z-index: 11;
            border-radius: 22px;
        }

        .how-step:hover .how-step-icon {
            transform: translateY(-12px) scale(1.05) rotate(-2deg);
        }

        .how-step:hover .how-step-icon img {
            box-shadow: 0 30px 60px rgba(232, 25, 44, 0.2);
        }

        .how-step h3 {
            font-weight: 900;
            font-size: 1.2rem;
            color: var(--dark);
            margin-bottom: 12px;
        }

        .how-step p {
            font-size: .95rem;
            color: var(--muted);
            line-height: 1.6;
        }

        .how-step-arrow {
            position: absolute;
            right: -20px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--red);
            font-size: 1.4rem;
            font-weight: 900;
            z-index: 1;
        }

        /* ── Features ── */
        .feat-section {
            max-width: 1140px;
            margin: 0 auto;
            padding: 80px 24px;
        }

        .feat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .feat-card {
            background: #fff;
            border: 1.5px solid var(--border);
            border-radius: 20px;
            padding: 32px;
            transition: all .25s;
        }

        .feat-card:hover {
            border-color: var(--red);
            box-shadow: 0 8px 32px rgba(232, 25, 44, .08);
        }

        .feat-card.big {
            grid-row: span 2;
        }

        .feat-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: #FFF0F1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 20px;
        }

        .feat-card h3 {
            font-weight: 900;
            font-size: 1.1rem;
            color: var(--dark);
            margin-bottom: 10px;
        }

        .feat-card p {
            font-size: .9rem;
            color: var(--muted);
            line-height: 1.7;
        }

        .feat-pill-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
        }

        .feat-pill {
            background: #F3F4F6;
            border-radius: 8px;
            padding: 4px 12px;
            font-size: .78rem;
            font-weight: 700;
            color: var(--body);
        }

        /* ── Bangla Section ── */
        .bangla-section {
            background: linear-gradient(135deg, #1C1B1F 0%, #2D1F2A 100%);
            padding: 80px 24px;
            color: #fff;
        }

        .bangla-inner {
            max-width: 1140px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: center;
        }

        .bangla-section .section-eyebrow {
            color: #FF8A94;
        }

        .bangla-section .section-title {
            color: #fff;
        }

        .bangla-section .section-sub {
            color: rgba(255, 255, 255, .55);
        }

        .bangla-card {
            background: rgba(255, 255, 255, .07);
            border: 1px solid rgba(255, 255, 255, .15);
            border-radius: 20px;
            padding: 28px;
            font-family: 'Noto Sans Bengali', sans-serif;
        }

        .bangla-word {
            font-size: 1.8rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 6px;
        }

        .bangla-eng {
            font-size: 1rem;
            color: rgba(255, 255, 255, .6);
            margin-bottom: 16px;
            font-family: 'Aileron', sans-serif;
        }

        .bangla-def-label {
            font-size: .72rem;
            font-weight: 600;
            color: #FF8A94;
            text-transform: uppercase;
            letter-spacing: .06em;
            margin-bottom: 6px;
        }

        .bangla-def {
            font-size: .95rem;
            color: rgba(255, 255, 255, .8);
            line-height: 1.7;
            background: rgba(255, 255, 255, .05);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 16px;
        }

        .bangla-syn {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .bangla-syn span {
            background: rgba(255, 255, 255, .1);
            border-radius: 6px;
            padding: 3px 10px;
            font-size: .78rem;
            color: rgba(255, 255, 255, .7);
            font-family: 'Aileron', sans-serif;
        }

        .bangla-perks {
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-top: 32px;
        }

        .bangla-perk {
            display: flex;
            align-items: flex-start;
            gap: 14px;
        }

        .perk-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--red);
            margin-top: 6px;
            flex-shrink: 0;
        }

        .perk-text {
            font-size: .9rem;
            color: rgba(255, 255, 255, .7);
            line-height: 1.6;
        }

        .perk-text strong {
            color: #fff;
        }

        /* ── Testimonials ── */
        .testi-section {
            max-width: 1140px;
            margin: 0 auto;
            padding: 80px 24px;
        }

        .testi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 56px;
        }

        .testi-card {
            background: #fff;
            border: 1.5px solid var(--border);
            border-radius: 20px;
            padding: 28px;
            transition: all .25s;
        }

        .testi-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 36px rgba(0, 0, 0, .08);
        }

        .testi-stars {
            color: var(--yellow);
            font-size: 1rem;
            margin-bottom: 14px;
        }

        .testi-quote {
            font-size: .9rem;
            color: var(--body);
            line-height: 1.75;
            margin-bottom: 20px;
            font-style: italic;
        }

        .testi-person {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .testi-av {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: var(--red);
            color: #fff;
            font-weight: 900;
            font-size: .9rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .testi-name {
            font-weight: 800;
            font-size: .88rem;
            color: var(--dark);
        }

        .testi-role {
            font-size: .76rem;
            color: var(--muted);
        }

        /* ── Pricing ── */
        .pricing-section {
            background: #fff;
            padding: 80px 24px;
        }

        .pricing-inner {
            max-width: 1140px;
            margin: 0 auto;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
        }

        .price-card {
            border: 2px solid var(--border);
            border-radius: 20px;
            padding: 28px 24px;
            background: #fff;
            position: relative;
        }

        .price-card.featured {
            border-color: var(--red);
        }

        .price-badge {
            position: absolute;
            top: -14px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--red);
            color: #fff;
            padding: 4px 18px;
            border-radius: 20px;
            font-size: .75rem;
            font-weight: 800;
            letter-spacing: .04em;
            white-space: nowrap;
        }

        .price-plan {
            font-weight: 900;
            font-size: 1.1rem;
            color: var(--dark);
            margin-bottom: 8px;
        }

        .price-amount {
            font-size: 2.8rem;
            font-weight: 900;
            color: var(--dark);
            margin-bottom: 4px;
        }

        .price-amount sub {
            font-size: 1rem;
            font-weight: 600;
            vertical-align: super;
        }

        .price-period {
            font-size: .82rem;
            color: var(--muted);
            margin-bottom: 24px;
        }

        .price-features {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 28px;
        }

        .price-features li {
            font-size: .88rem;
            color: var(--body);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .price-features li::before {
            content: "✓";
            color: #10B981;
            font-weight: 900;
        }

        .pricing-footer-note {
            background: #fff;
            border-radius: 32px;
            padding: 48px;
            max-width: 960px;
            margin-left: auto;
            margin-right: auto;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.03);
            text-align: left;
            overflow: hidden;
            position: relative;
        }

        .pfn-inner {
            display: flex;
            align-items: center;
            gap: 48px;
        }

        .pfn-image {
            flex: 0 0 320px;
            position: relative;
            z-index: 1;
        }

        .pfn-image::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            height: 350px;
            background: radial-gradient(
                circle,
                rgba(232, 25, 44, 0.25) 0%,
                rgba(232, 25, 44, 0) 70%
            );
            z-index: -1;
            filter: blur(50px);
            border-radius: 50%;
            animation: pfn-glow 4s ease-in-out infinite alternate;
        }

        @keyframes pfn-glow {
            0% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.4;
            }
            100% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 0.8;
            }
        }

        .pfn-image img {
            width: 100%;
            height: auto;
            display: block;
            filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.1));
        }

        .pfn-content {
            flex: 1;
        }

        .pfn-title {
            font-size: 2.25rem;
            font-weight: 900;
            color: var(--dark);
            margin-bottom: 20px;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }

        .pfn-title .t-bn {
            font-family: 'Hind Siliguri', sans-serif;
        }

        .pfn-text {
            font-size: 1.15rem;
            color: var(--body);
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .pfn-text .t-bn {
            font-family: 'Hind Siliguri', sans-serif;
            font-size: 1.25rem;
        }

        .text-red {
            color: var(--red);
        }

        .pfn-btn {
            display: inline-flex !important;
            align-items: center;
            padding: 16px 40px !important;
            font-size: 1.1rem !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 20px rgba(232, 25, 44, 0.15);
            text-decoration: none !important;
            font-weight: 800 !important;
        }

        @media (max-width: 900px) {
            .pricing-footer-note {
                padding: 32px 24px;
            }
            .pfn-inner {
                flex-direction: column;
                text-align: center;
                gap: 32px;
            }
            .pfn-image {
                flex: 0 0 200px;
            }
            .pfn-title {
                font-size: 1.8rem;
            }
            .pfn-text {
                font-size: 1rem;
            }
        }

        .price-features li.no::before {
            content: "✗";
            color: #CBD5E1;
        }

        .price-features li.no {
            color: var(--muted);
        }

        /* ── Enroll ── */
        .enroll-section {
            background: linear-gradient(135deg, #E8192C 0%, #9B111E 100%);
            padding: 80px 24px;
        }

        .enroll-inner {
            max-width: 700px;
            margin: 0 auto;
        }

        .enroll-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 900;
            color: #fff;
            text-align: center;
            margin-bottom: 10px;
            line-height: 1.15;
        }

        .enroll-sub {
            color: rgba(255, 255, 255, .75);
            text-align: center;
            font-size: 1rem;
            line-height: 1.7;
            margin-bottom: 40px;
        }

        .enroll-form {
            background: #fff;
            border-radius: 24px;
            padding: 40px;
        }

        .form-tabs {
            display: flex;
            gap: 0;
            margin-bottom: 28px;
            border-radius: 10px;
            overflow: hidden;
            border: 1.5px solid var(--border);
        }

        .form-tab {
            flex: 1;
            padding: 10px;
            text-align: center;
            font-weight: 800;
            font-size: .85rem;
            cursor: pointer;
            border: none;
            background: #F9FAFB;
            color: var(--muted);
            transition: all .2s;
            font-family: 'Aileron', sans-serif;
        }

        .form-tab.active {
            background: var(--red);
            color: #fff;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .fg {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }

        .fg label {
            font-size: .75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--muted);
        }

        .fg input,
        .fg select {
            border: 1.5px solid var(--border);
            border-radius: 10px;
            padding: 13px 14px;
            font-size: .95rem;
            font-family: 'Aileron', sans-serif;
            outline: none;
            transition: border-color .2s;
            color: var(--dark);
            background: #fff;
            -webkit-appearance: none;
        }

        .fg input:focus,
        .fg select:focus {
            border-color: var(--red);
        }

        .fg input::placeholder {
            color: #CBD5E1;
        }

        .goal-chips {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .goal-chip {
            padding: 9px 6px;
            border-radius: 9px;
            border: 1.5px solid var(--border);
            background: #F9FAFB;
            color: var(--muted);
            font-size: .75rem;
            font-weight: 700;
            cursor: pointer;
            text-align: center;
            transition: all .2s;
            font-family: 'Aileron', sans-serif;
        }

        .goal-chip.active,
        .goal-chip:hover {
            border-color: var(--red);
            background: #FFF0F1;
            color: var(--red);
        }

        .form-submit {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            background: var(--red);
            color: #fff;
            border: none;
            font-family: 'Aileron', sans-serif;
            font-size: 1rem;
            font-weight: 900;
            cursor: pointer;
            margin-top: 8px;
            transition: all .2s;
            box-shadow: 0 4px 20px rgba(232, 25, 44, .3);
        }

        .form-submit:hover {
            background: var(--red2);
            transform: translateY(-1px);
        }

        .form-note {
            text-align: center;
            font-size: .75rem;
            color: var(--muted);
            margin-top: 12px;
        }

        .success-msg {
            display: none;
            text-align: center;
            padding: 24px 0;
        }

        .success-msg .s-icon {
            font-size: 3rem;
            margin-bottom: 12px;
        }

        .success-msg h3 {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--dark);
            margin-bottom: 8px;
        }

        .success-msg p {
            color: var(--muted);
            font-size: .9rem;
            margin-bottom: 20px;
        }

        /* ── FAQ ── */
        .faq-section {
            max-width: 760px;
            margin: 0 auto;
            padding: 80px 24px;
        }

        .faq-item {
            border-bottom: 1.5px solid var(--border);
        }

        .faq-q {
            width: 100%;
            text-align: left;
            padding: 20px 0;
            font-weight: 800;
            font-size: .95rem;
            color: var(--dark);
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Aileron', sans-serif;
        }

        .faq-icon {
            color: var(--red);
            font-size: 1.3rem;
            font-weight: 900;
            transition: transform .2s;
        }

        .faq-icon.open {
            transform: rotate(45deg);
        }

        .faq-a {
            display: none;
            padding: 0 0 20px;
            font-size: .9rem;
            color: var(--muted);
            line-height: 1.75;
        }

        .faq-a.open {
            display: block;
        }

        /* ── Footer ── */
        footer {
            background: var(--dark);
            color: rgba(255, 255, 255, .5);
            padding: 60px 24px 36px;
        }

        .footer-inner {
            max-width: 1140px;
            margin: 0 auto;
        }

        .footer-top {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 40px;
            margin-bottom: 48px;
        }

        .footer-brand p {
            font-size: .85rem;
            line-height: 1.7;
            margin: 14px 0 20px;
        }

        .footer-heading {
            font-weight: 800;
            font-size: .85rem;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: #fff;
            margin-bottom: 16px;
        }

        .footer-links-col {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .footer-links-col a {
            text-decoration: none;
            color: rgba(255, 255, 255, .5);
            font-size: .85rem;
            transition: color .2s;
        }

        .footer-links-col a:hover {
            color: #fff;
        }

        .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, .1);
            padding-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: .8rem;
            flex-wrap: wrap;
            gap: 12px;
        }

        .footer-logo-text {
            font-weight: 900;
            font-size: 1.1rem;
            color: #fff;
        }

        /* ── Scroll reveal ── */
        .sr {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity .6s ease, transform .6s ease;
        }

        .sr.vis {
            opacity: 1;
            transform: none;
        }

        /* ════════════════════════════════
           MOBILE — max 768px
        ════════════════════════════════ */
        @media(max-width:768px) {

            /* Nav */
            nav {
                padding: 0 16px;
            }

            .nav-links {
                display: none;
            }

            .nav-right .btn-ghost,
            .nav-right .btn-red {
                display: none;
            }

            .nav-right .lang-toggle-btn {
                display: flex;
            }

            .hamburger {
                display: flex;
            }

            /* Hero */
            .hero {
                grid-template-columns: 1fr;
                gap: 32px;
                padding: 40px 16px 32px;
            }

            .hero h1 {
                font-size: clamp(1.8rem, 7vw, 2.4rem);
            }

            .hero-sub {
                font-size: .95rem;
                max-width: 100%;
            }

            .hero-visual {
                display: flex;
                justify-content: center;
                min-height: auto;
            }

            .hero-video-wrap {
                max-width: 100%;
                border-radius: 18px;
                padding: 6px;
            }

            .hero-actions {
                flex-direction: column;
                gap: 10px;
            }

            .btn-hero {
                width: 100%;
                text-align: center;
                padding: 14px 20px;
            }

            /* Stats */
            .stats-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
            }

            .stat-item {
                padding: 20px 12px;
                border-right: 1px solid rgba(255, 255, 255, .1);
                border-bottom: 1px solid rgba(255, 255, 255, .1);
            }

            .stat-item:nth-child(2n) {
                border-right: none;
            }

            .stat-item:nth-last-child(-n+2) {
                border-bottom: none;
            }

            .stat-n {
                font-size: 1.9rem;
            }

            /* Exams */
            .exams-section {
                padding: 48px 16px;
            }

            .exams-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            /* How it works */
            .how-section {
                padding: 48px 16px;
            }

            .how-steps {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .how-step-arrow {
                display: none;
            }

            .how-step {
                padding: 24px 20px;
            }

            /* Features */
            .feat-section {
                padding: 48px 16px;
            }

            .feat-grid {
                grid-template-columns: 1fr;
            }

            .feat-card.big {
                grid-row: auto;
            }

            .feat-card {
                padding: 24px;
            }

            /* Bangla */
            .bangla-section {
                padding: 48px 16px;
            }

            .bangla-inner {
                grid-template-columns: 1fr;
                gap: 32px;
            }

            /* Testimonials */
            .testi-section {
                padding: 48px 16px;
            }

            .testi-grid {
                grid-template-columns: 1fr;
            }

            /* Pricing */
            .pricing-section {
                padding: 48px 16px;
            }

            .pricing-grid {
                grid-template-columns: 1fr;
            }

            .price-card {
                padding: 28px 20px;
            }

            /* Enroll */
            .enroll-section {
                padding: 48px 16px;
            }

            .enroll-form {
                padding: 24px 16px;
                border-radius: 16px;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .goal-chips {
                grid-template-columns: repeat(2, 1fr);
            }

            /* FAQ */
            .faq-section {
                padding: 48px 16px;
            }

            /* Footer */
            footer {
                padding: 40px 16px 24px;
            }

            .footer-top {
                grid-template-columns: 1fr;
                gap: 32px;
            }

            .footer-bottom {
                flex-direction: column;
                text-align: center;
            }

            /* Sections */
            .section-title {
                font-size: clamp(1.5rem, 6vw, 2rem);
            }

            .section-sub {
                margin-bottom: 28px;
            }
        }

        /* Tablet 769–900px */
        @media(min-width:769px) and (max-width:900px) {
            nav {
                padding: 0 24px;
            }

            .nav-links {
                gap: 16px;
            }

            .hero {
                gap: 32px;
                padding: 60px 24px 40px;
            }

            .feat-grid {
                grid-template-columns: 1fr;
            }

            .feat-card.big {
                grid-row: auto;
            }

            .bangla-inner {
                grid-template-columns: 1fr;
                gap: 32px;
            }

            .pricing-grid {
                grid-template-columns: 1fr;
            }

            .footer-top {
                grid-template-columns: 1fr 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `}),e.jsxs("div",{className:"topbar",children:[e.jsx("span",{className:"t-en",children:"🎓 GRE, IELTS, BBA, SAT & more — All in one place"}),e.jsx("span",{className:"t-bn",children:"🎓 GRE, IELTS, BBA, SAT ও আরও — সব এক জায়গায়"}),e.jsxs("span",{children:[e.jsx("span",{className:"t-en",children:"Free to Start"}),e.jsx("span",{className:"t-bn",children:"বিনামূল্যে শুরু করুন"})]})]}),e.jsxs("nav",{children:[e.jsxs("a",{className:"nav-logo",href:"#",children:[e.jsx("div",{className:"nav-logo-mark",children:"V"}),e.jsxs("span",{className:"nav-logo-text",children:["VocabPix ",e.jsx("sup",{children:"BETA"})]})]}),e.jsxs("div",{className:"nav-links",children:[e.jsxs("a",{href:"#exams",children:[e.jsx("span",{className:"t-en",children:"Word Lists"}),e.jsx("span",{className:"t-bn",children:"শব্দ তালিকা"})]}),e.jsxs("a",{href:"#features",children:[e.jsx("span",{className:"t-en",children:"Features"}),e.jsx("span",{className:"t-bn",children:"ফিচার"})]}),e.jsxs("a",{href:"#bangla",children:[e.jsx("span",{className:"t-en",children:"Bangla"}),e.jsx("span",{className:"t-bn",children:"বাংলা"})]}),e.jsxs("a",{href:"#pricing",children:[e.jsx("span",{className:"t-en",children:"Pricing"}),e.jsx("span",{className:"t-bn",children:"মূল্য"})]}),e.jsxs("a",{href:"#faq",children:[e.jsx("span",{className:"t-en",children:"FAQ"}),e.jsx("span",{className:"t-bn",children:"প্রশ্নোত্তর"})]})]}),e.jsxs("div",{className:"nav-right",children:[e.jsxs("button",{className:"lang-toggle-btn",onClick:()=>y(o==="en"?"bn":"en"),id:"lang-btn",children:[e.jsx("span",{className:"t-en",children:"🇧🇩 বাংলা"}),e.jsx("span",{className:"t-bn",children:"🇬🇧 English"})]}),e.jsxs("a",{href:"https://vocabpix.fluento.org",className:"btn-ghost",target:"_blank",children:[e.jsx("span",{className:"t-en",children:"Login"}),e.jsx("span",{className:"t-bn",children:"লগইন"})]}),e.jsxs("a",{href:"#enroll",className:"btn-red",children:[e.jsx("span",{className:"t-en",children:"Register Free →"}),e.jsx("span",{className:"t-bn",children:"বিনামূল্যে নিবন্ধন →"})]})]}),e.jsxs("button",{className:`hamburger ${m?"open":""}`,id:"hamburger",onClick:()=>z(!m),"aria-label":"Menu",children:[e.jsx("span",{}),e.jsx("span",{}),e.jsx("span",{})]})]}),e.jsxs("div",{className:`mobile-nav ${m?"open":""}`,id:"mobile-nav",children:[e.jsxs("a",{href:"#exams",onClick:s=>s.preventDefault(),children:[e.jsx("span",{className:"t-en",children:"Word Lists"}),e.jsx("span",{className:"t-bn",children:"শব্দ তালিকা"})]}),e.jsxs("a",{href:"#features",onClick:s=>s.preventDefault(),children:[e.jsx("span",{className:"t-en",children:"Features"}),e.jsx("span",{className:"t-bn",children:"ফিচার"})]}),e.jsxs("a",{href:"#bangla",onClick:s=>s.preventDefault(),children:[e.jsx("span",{className:"t-en",children:"Bangla"}),e.jsx("span",{className:"t-bn",children:"বাংলা"})]}),e.jsxs("a",{href:"#pricing",onClick:s=>s.preventDefault(),children:[e.jsx("span",{className:"t-en",children:"Pricing"}),e.jsx("span",{className:"t-bn",children:"মূল্য"})]}),e.jsxs("a",{href:"#faq",onClick:s=>s.preventDefault(),children:[e.jsx("span",{className:"t-en",children:"FAQ"}),e.jsx("span",{className:"t-bn",children:"প্রশ্নোত্তর"})]}),e.jsxs("div",{className:"mobile-nav-actions",children:[e.jsxs("a",{href:"https://vocabpix.fluento.org",className:"btn-ghost",target:"_blank",style:{textAlign:"center"},children:[e.jsx("span",{className:"t-en",children:"Login"}),e.jsx("span",{className:"t-bn",children:"লগইন"})]}),e.jsxs("a",{href:"#enroll",className:"btn-red",onClick:s=>s.preventDefault(),style:{textAlign:"center",display:"block",padding:"12px"},children:[e.jsx("span",{className:"t-en",children:"Register Free →"}),e.jsx("span",{className:"t-bn",children:"বিনামূল্যে নিবন্ধন →"})]})]})]}),e.jsx("section",{children:e.jsxs("div",{className:"hero",children:[e.jsxs("div",{className:"hero-left",children:[e.jsxs("div",{className:"hero-badge",children:["🔬"," ",e.jsx("span",{className:"t-en",children:"Scientific Vocabulary Learning"}),e.jsx("span",{className:"t-bn",children:"বৈজ্ঞানিক শব্দ শিক্ষা"})]}),e.jsxs("h1",{children:[e.jsxs("span",{className:"t-en",children:["Learn English Vocabulary ",e.jsx("em",{children:"Fast & Smart"})," — in Bangla & English"]}),e.jsxs("span",{className:"t-bn",children:["বাংলায় শিখুন ইংরেজি শব্দ —"," ",e.jsx("em",{children:"দ্রুত ও স্মার্টভাবে"})]})]}),e.jsx("p",{className:"hero-sub t-en",children:"VocabPix uses visual memory techniques, spaced repetition, and Bangla-English bilingual support to help you master 10,000+ words for exams and everyday fluency."}),e.jsx("p",{className:"hero-sub t-bn",children:"VocabPix ভিজ্যুয়াল মেমরি কৌশল, স্পেসড রিপিটিশন এবং বাংলা-ইংরেজি দ্বিভাষিক সহায়তা ব্যবহার করে ১০,০০০+ শব্দ আয়ত্ত করতে সাহায্য করে।"}),e.jsxs("div",{className:"hero-exam-tags",children:[e.jsx("span",{className:"exam-tag",children:"📝 GRE"}),e.jsx("span",{className:"exam-tag",children:"🎓 IELTS"}),e.jsx("span",{className:"exam-tag",children:"💼 BBA"}),e.jsx("span",{className:"exam-tag",children:"📐 SAT"})]}),e.jsxs("div",{className:"hero-actions",children:[e.jsxs("a",{href:"#enroll",className:"btn-hero btn-hero-primary",children:["🚀"," ",e.jsx("span",{className:"t-en",children:"Start Learning Free"}),e.jsx("span",{className:"t-bn",children:"বিনামূল্যে শেখা শুরু করুন"})]}),e.jsxs("a",{href:"https://vocabpix.fluento.org",className:"btn-hero btn-hero-secondary",target:"_blank",children:["👀 ",e.jsx("span",{className:"t-en",children:"Explore App"}),e.jsx("span",{className:"t-bn",children:"অ্যাপ দেখুন"})]})]}),e.jsxs("div",{className:"hero-trust",children:[e.jsxs("div",{className:"trust-avatars",children:[e.jsx("div",{className:"trust-avatar",style:{background:"#E8192C"},children:"R"}),e.jsx("div",{className:"trust-avatar",style:{background:"#2563EB"},children:"T"}),e.jsx("div",{className:"trust-avatar",style:{background:"#1DB954"},children:"M"}),e.jsx("div",{className:"trust-avatar",style:{background:"#FF6B00"},children:"S"})]}),e.jsxs("span",{children:[e.jsxs("span",{className:"t-en",children:["Joined by ",e.jsx("strong",{children:"5,000+"})," learners this month"]}),e.jsxs("span",{className:"t-bn",children:["এই মাসে ",e.jsx("strong",{children:"৫,০০০+"})," শিক্ষার্থী যোগ দিয়েছেন"]})]})]})]}),e.jsxs("div",{className:"hero-visual",children:[e.jsx("div",{className:"card-stack",style:{display:"none"}}),e.jsx("div",{className:"hero-video-wrap",children:e.jsx("iframe",{src:"https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",title:"VocabPix Demo",frameBorder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowFullScreen:!0})})]})]})}),e.jsxs("div",{className:"stats-row",children:[e.jsxs("div",{className:"stat-item",children:[e.jsxs("div",{className:"stat-n",children:["10",e.jsx("span",{children:"K+"})]}),e.jsxs("div",{className:"stat-l",children:[e.jsx("span",{className:"t-en",children:"Curated Words"}),e.jsx("span",{className:"t-bn",children:"বাছাইকৃত শব্দ"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"stat-n",children:"122"}),e.jsxs("div",{className:"stat-l",children:[e.jsx("span",{className:"t-en",children:"Word Lists"}),e.jsx("span",{className:"t-bn",children:"শব্দ তালিকা"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"stat-n",children:"6"}),e.jsxs("div",{className:"stat-l",children:[e.jsx("span",{className:"t-en",children:"Exam Categories"}),e.jsx("span",{className:"t-bn",children:"পরীক্ষার বিভাগ"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsxs("div",{className:"stat-n",children:["95",e.jsx("span",{children:"%"})]}),e.jsxs("div",{className:"stat-l",children:[e.jsx("span",{className:"t-en",children:"Retention Rate"}),e.jsx("span",{className:"t-bn",children:"ধারণ হার"})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsxs("div",{className:"stat-n",children:["5",e.jsx("span",{children:"K+"})]}),e.jsxs("div",{className:"stat-l",children:[e.jsx("span",{className:"t-en",children:"Active Learners"}),e.jsx("span",{className:"t-bn",children:"সক্রিয় শিক্ষার্থী"})]})]})]}),e.jsxs("section",{className:"exams-section sr",id:"exams",children:[e.jsxs("div",{className:"section-eyebrow",children:["📚 ",e.jsx("span",{className:"t-en",children:"Word Lists"}),e.jsx("span",{className:"t-bn",children:"শব্দ তালিকা"})]}),e.jsxs("h2",{className:"section-title",children:[e.jsx("span",{className:"t-en",children:"Master English Vocabulary for Every Goal"}),e.jsx("span",{className:"t-bn",children:"আপনার প্রয়োজন অনুযায়ী শব্দভাণ্ডার আয়ত্ত করুন"})]}),e.jsx("p",{className:"section-sub t-en",children:"Whether you're preparing for competitive exams like IELTS and GRE or building everyday fluency — our curated word lists are designed to help you succeed faster."}),e.jsx("p",{className:"section-sub t-bn",children:"IELTS, GRE বা দৈনন্দিন দক্ষতা — আপনার লক্ষ্যের জন্য প্রতিটি শব্দ তালিকা সাজানো এবং শেখার জন্য প্রস্তুত।"}),e.jsxs("div",{className:"exams-grid",children:[t.map(s=>e.jsxs("a",{className:"exam-card",href:`/wordlist-categories/${s.id}/wordlists`,style:{padding:"0",overflow:"hidden",display:"flex",flexDirection:"column",border:"1.5px solid var(--border)",borderRadius:"16px"},children:[e.jsx("div",{style:{position:"relative",width:"100%",background:"#F8F9FC"},children:e.jsx("img",{src:w(s.name),alt:s.name,style:{width:"100%",height:"auto",display:"block"}})}),e.jsxs("div",{style:{padding:"20px"},children:[e.jsx("div",{className:"exam-name",style:{textAlign:"left",marginBottom:"8px"},children:s.name}),e.jsxs("div",{className:"exam-words",style:{textAlign:"left",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"})}),s.word_lists_count," ",e.jsx("span",{className:"t-en",children:"Word Lists"}),e.jsx("span",{className:"t-bn",children:"শব্দ তালিকা"})]}),e.jsxs("div",{className:"exam-words",style:{textAlign:"left",display:"flex",alignItems:"center",gap:"6px",marginTop:"4px",fontSize:"0.85rem",color:"var(--muted)"},children:[e.jsxs("span",{className:"t-en",children:[s.words_count," Words"]}),e.jsxs("span",{className:"t-bn",children:[s.words_count,"টি শব্দ"]})]})]})]},s.id)),e.jsxs("a",{className:"exam-card",href:"#enroll",style:{padding:"0",overflow:"hidden",display:"flex",flexDirection:"column",border:"1.5px solid var(--border)",borderRadius:"16px"},children:[e.jsx("div",{style:{position:"relative",width:"100%",background:"#F8F9FC"},children:e.jsx("img",{src:"img/landing/personal_word.webp",alt:"Personal Wordlist",style:{width:"100%",height:"auto",display:"block"}})}),e.jsxs("div",{style:{padding:"20px"},children:[e.jsxs("div",{className:"exam-name",style:{textAlign:"left",marginBottom:"8px"},children:[e.jsx("span",{className:"t-en",children:"Personal Word List"}),e.jsx("span",{className:"t-bn",children:"ব্যক্তিগত শব্দ তালিকা"})]}),e.jsxs("div",{className:"exam-words",style:{textAlign:"left",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx("span",{className:"t-en",style:{fontSize:"0.9rem",color:"var(--muted)"},children:"Build your own custom vocabulary collection"}),e.jsx("span",{className:"t-bn",style:{fontSize:"0.95rem",color:"var(--muted)"},children:"আপনার নিজস্ব কাস্টম শব্দ সংগ্রহ তৈরি করুন"})]})]})]}),t.length===0&&e.jsxs("div",{style:{padding:"20px",textAlign:"center",color:"var(--muted)",width:"100%",gridColumn:"1 / -1"},children:[e.jsx("span",{className:"t-en",children:"No word lists available at the moment."}),e.jsx("span",{className:"t-bn",children:"এই মুহূর্তে কোনো শব্দ তালিকা উপলব্ধ নেই।"})]})]})]}),e.jsx("div",{className:"how-section",children:e.jsxs("div",{className:"how-inner sr",children:[e.jsxs("div",{className:"section-eyebrow",children:["🗺️ ",e.jsx("span",{className:"t-en",children:"How It Works"}),e.jsx("span",{className:"t-bn",children:"কিভাবে কাজ করে"})]}),e.jsxs("h2",{className:"section-title",children:[e.jsx("span",{className:"t-en",children:"From Zero to Fluent in 4 Steps"}),e.jsx("span",{className:"t-bn",children:"৪ ধাপে শূন্য থেকে দক্ষ"})]}),e.jsx("p",{className:"section-sub t-en",children:"No complicated setup. Open the app and start in under 60 seconds."}),e.jsx("p",{className:"section-sub t-bn",children:"কোনো জটিল সেটআপ নেই। অ্যাপ খুলুন এবং ৬০ সেকেন্ডের মধ্যে শুরু করুন।"}),e.jsxs("div",{className:"how-steps",children:[e.jsxs("div",{className:"how-step",children:[e.jsx("div",{className:"how-step-num",children:"1"}),e.jsx("div",{className:"how-step-icon",children:e.jsx("img",{src:"img/landing/how_works/mobile_wordlist.png",alt:"Pick a List"})}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Pick a List"}),e.jsx("span",{className:"t-bn",children:"তালিকা বেছে নিন"})]}),e.jsx("p",{className:"t-en",children:"Choose IELTS & Academic Writing, Basic to Fluent, Advanced Essentials, or your own list. Each split into 60-word sub-lists."}),e.jsx("p",{className:"t-bn",children:"IELTS & Academic Writing, Basic to Fluent, Advanced Essentials বা নিজের তালিকা বেছে নিন। প্রতিটি ৬০-শব্দের সাব-লিস্টে ভাগ করা।"}),e.jsx("div",{className:"how-step-arrow",children:"›"})]}),e.jsxs("div",{className:"how-step",children:[e.jsx("div",{className:"how-step-num",children:"2"}),e.jsx("div",{className:"how-step-icon",children:e.jsx("img",{src:"img/landing/how_works/mobile_learn_from_img.png",alt:"Learn with Images"})}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Learn with Images"}),e.jsx("span",{className:"t-bn",children:"ছবির সাথে শিখুন"})]}),e.jsx("p",{className:"t-en",children:"Each word card shows an image, pronunciation, Bangla definition, synonyms, antonyms & collocations."}),e.jsx("p",{className:"t-bn",children:"প্রতিটি শব্দ কার্ডে ছবি, উচ্চারণ, বাংলা সংজ্ঞা, সমার্থক ও বিপরীতার্থক শব্দ দেখুন।"}),e.jsx("div",{className:"how-step-arrow",children:"›"})]}),e.jsxs("div",{className:"how-step",children:[e.jsx("div",{className:"how-step-num",children:"3"}),e.jsx("div",{className:"how-step-icon",children:e.jsx("img",{src:"img/landing/how_works/mobile_rate_memory.png",alt:"Rate Your Memory"})}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Rate Your Memory"}),e.jsx("span",{className:"t-bn",children:"স্মৃতি মূল্যায়ন করুন"})]}),e.jsx("p",{className:"t-en",children:`Tap "I Know" or "I Don't Know." Hard words resurface automatically. Track your mastered count.`}),e.jsx("p",{className:"t-bn",children:'"জানি" বা "জানি না" ট্যাপ করুন। কঠিন শব্দ স্বয়ংক্রিয়ভাবে ফিরে আসে। আয়ত্ত শব্দ গণনা করুন।'}),e.jsx("div",{className:"how-step-arrow",children:"›"})]}),e.jsxs("div",{className:"how-step",children:[e.jsx("div",{className:"how-step-num",children:"4"}),e.jsx("div",{className:"how-step-icon",children:e.jsx("img",{src:"img/landing/how_works/mobile_xp.png",alt:"Earn XP & Unlock Rewards"})}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Earn XP & Unlock Rewards"}),e.jsx("span",{className:"t-bn",children:"XP অর্জন করুন এবং পুরস্কার আনলক করুন"})]}),e.jsx("p",{className:"t-en",children:"Daily sessions build your streak. Earn XP for sessions, mastered words, and completed lists."}),e.jsx("p",{className:"t-bn",children:"দৈনিক সেশনে স্ট্রিক গড়ুন। সেশন, আয়ত্ত শব্দ ও সম্পূর্ণ তালিকার জন্য XP অর্জন করুন।"})]})]})]})}),e.jsxs("section",{className:"feat-section sr",id:"features",children:[e.jsxs("div",{className:"section-eyebrow",children:["✨ ",e.jsx("span",{className:"t-en",children:"Features"}),e.jsx("span",{className:"t-bn",children:"ফিচার"})]}),e.jsxs("h2",{className:"section-title",children:[e.jsx("span",{className:"t-en",children:"Everything You Need to Master Words"}),e.jsx("span",{className:"t-bn",children:"শব্দ আয়ত্ত করতে যা দরকার সবকিছু"})]}),e.jsx("p",{className:"section-sub t-en",children:"Not flashcards. Not a dictionary. A complete vocabulary system."}),e.jsx("p",{className:"section-sub t-bn",children:"শুধু ফ্ল্যাশকার্ড নয়। শুধু অভিধান নয়। একটি সম্পূর্ণ শব্দভান্ডার সিস্টেম।"}),e.jsxs("div",{className:"feat-grid",children:[e.jsxs("div",{className:"feat-card big",children:[e.jsx("div",{className:"feat-icon",children:"🖼️"}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Picture-Memory Learning"}),e.jsx("span",{className:"t-bn",children:"ছবি-স্মৃতি শিক্ষা"})]}),e.jsxs("div",{className:"t-en",children:[e.jsx("p",{children:"Every word is anchored to a vivid, contextual image. Visual memory increases retention by up to 65% compared to plain text — your brain never forgets an image it has truly seen."}),e.jsx("br",{}),e.jsx("p",{children:"Our image-word pairing engine ensures the picture matches the word's meaning, tone, and usage."})]}),e.jsxs("div",{className:"t-bn",children:[e.jsx("p",{children:"প্রতিটি শব্দ একটি প্রাণবন্ত ছবির সাথে যুক্ত। ভিজ্যুয়াল মেমরি সাধারণ টেক্সটের তুলনায় ৬৫% বেশি ধারণ ক্ষমতা বাড়ায় — মস্তিষ্ক একটি সত্যিকারের দেখা ছবি কখনো ভোলে না।"}),e.jsx("br",{}),e.jsx("p",{children:"আমাদের ছবি-শব্দ পেয়ারিং ইঞ্জিন নিশ্চিত করে যে ছবিটি শব্দের অর্থ, স্বর এবং ব্যবহারের সাথে মেলে।"})]}),e.jsxs("div",{className:"feat-pill-row",children:[e.jsxs("span",{className:"feat-pill",children:[e.jsx("span",{className:"t-en",children:"65% better retention"}),e.jsx("span",{className:"t-bn",children:"৬৫% বেশি ধারণ"})]}),e.jsxs("span",{className:"feat-pill",children:[e.jsx("span",{className:"t-en",children:"Contextual images"}),e.jsx("span",{className:"t-bn",children:"প্রাসঙ্গিক ছবি"})]}),e.jsxs("span",{className:"feat-pill",children:[e.jsx("span",{className:"t-en",children:"Visual anchors"}),e.jsx("span",{className:"t-bn",children:"ভিজ্যুয়াল অ্যাংকার"})]})]})]}),e.jsxs("div",{className:"feat-card",children:[e.jsx("div",{className:"feat-icon",children:"🔊"}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Audio + Phonetic Pronunciation"}),e.jsx("span",{className:"t-bn",children:"অডিও ও ধ্বনিগত উচ্চারণ"})]}),e.jsx("p",{className:"t-en",children:"Hear every word spoken aloud. Get phonetic spelling in English and Bangla transliteration so you know exactly how to say it."}),e.jsx("p",{className:"t-bn",children:"প্রতিটি শব্দ উচ্চস্বরে শুনুন। বাংলা লিপ্যন্তরসহ ধ্বনিগত বানান পান যাতে সঠিক উচ্চারণ জানতে পারেন।"})]}),e.jsxs("div",{className:"feat-card",children:[e.jsx("div",{className:"feat-icon",children:"🔄"}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Synonyms, Antonyms & Collocations"}),e.jsx("span",{className:"t-bn",children:"সমার্থক, বিপরীতার্থক ও কোলোকেশন"})]}),e.jsx("p",{className:"t-en",children:"See how words connect — synonyms, antonyms, and real sentence collocations so you learn words in context, not in isolation."}),e.jsx("p",{className:"t-bn",children:"শব্দের সংযোগ দেখুন — সমার্থক, বিপরীতার্থক এবং বাস্তব বাক্যে কোলোকেশন, যাতে বিচ্ছিন্নভাবে নয়, প্রসঙ্গে শিখতে পারেন।"})]}),e.jsxs("div",{className:"feat-card",children:[e.jsx("div",{className:"feat-icon",children:"⚡"}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"XP & Gamified Streaks"}),e.jsx("span",{className:"t-bn",children:"XP ও গেমিফাইড স্ট্রিক"})]}),e.jsx("p",{className:"t-en",children:"Earn XP for sessions, mastered words, and completed lists. Build daily streaks. Hit milestones. Stay hooked on learning."}),e.jsx("p",{className:"t-bn",children:"সেশন, আয়ত্ত শব্দ ও সম্পূর্ণ তালিকার জন্য XP অর্জন করুন। দৈনিক স্ট্রিক গড়ুন। মাইলস্টোন অর্জন করুন।"})]}),e.jsxs("div",{className:"feat-card",children:[e.jsx("div",{className:"feat-icon",children:"📝"}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Custom Word Collections"}),e.jsx("span",{className:"t-bn",children:"কাস্টম শব্দ সংগ্রহ"})]}),e.jsx("p",{className:"t-en",children:"Add any word you encounter — in class, reading, or exams. Build personal lists and practice them anytime."}),e.jsx("p",{className:"t-bn",children:"ক্লাসে, পড়ায় বা পরীক্ষায় যেকোনো শব্দ যোগ করুন। ব্যক্তিগত তালিকা তৈরি করুন এবং যেকোনো সময় অনুশীলন করুন।"})]})]})]}),e.jsx("div",{className:"bangla-section",children:e.jsxs("div",{className:"bangla-inner sr",id:"bangla",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"section-eyebrow",children:["🇧🇩 ",e.jsx("span",{className:"t-en",children:"Bangla Support"}),e.jsx("span",{className:"t-bn",children:"বাংলা সহায়তা"})]}),e.jsxs("h2",{className:"section-title",children:[e.jsxs("span",{className:"t-en",children:["Learn in Bangla,",e.jsx("br",{}),"Win in English"]}),e.jsxs("span",{className:"t-bn",children:["শিখুন বাংলায়,",e.jsx("br",{}),"জিতুন ইংরেজিতে"]})]}),e.jsx("p",{className:"section-sub t-en",children:"The only vocabulary app built with Bengali learners in mind — definitions, pronunciation guides, and memory cues all available in Bangla."}),e.jsx("p",{className:"section-sub t-bn",children:"বাংলাভাষী শিক্ষার্থীদের কথা মাথায় রেখে তৈরি একমাত্র শব্দভান্ডার অ্যাপ — সংজ্ঞা, উচ্চারণ গাইড এবং স্মৃতি সংকেত সবকিছু বাংলায়।"}),e.jsxs("div",{className:"bangla-perks",children:[e.jsxs("div",{className:"bangla-perk",children:[e.jsx("div",{className:"perk-dot"}),e.jsxs("div",{className:"perk-text",children:[e.jsxs("strong",{children:[e.jsx("span",{className:"t-en",children:"Bangla definitions"}),e.jsx("span",{className:"t-bn",children:"বাংলা সংজ্ঞা"})]})," ","—",e.jsx("span",{className:"t-en",children:"understand word meaning in your native language first, then internalize the English."}),e.jsx("span",{className:"t-bn",children:"প্রথমে মাতৃভাষায় শব্দের অর্থ বুঝুন, তারপর ইংরেজি আত্মস্থ করুন।"})]})]}),e.jsxs("div",{className:"bangla-perk",children:[e.jsx("div",{className:"perk-dot"}),e.jsxs("div",{className:"perk-text",children:[e.jsxs("strong",{children:[e.jsx("span",{className:"t-en",children:"Bengali phonetic guide"}),e.jsx("span",{className:"t-bn",children:"বাংলা ধ্বনি নির্দেশিকা"})]})," ","—",e.jsx("span",{className:"t-en",children:"every word has a Bangla script pronunciation (অক·যউ·অট·ই) so you say it correctly from day one."}),e.jsx("span",{className:"t-bn",children:"প্রতিটি শব্দে বাংলা লিপিতে উচ্চারণ (অক·যউ·অট·ই) আছে যাতে প্রথম দিন থেকেই সঠিকভাবে বলতে পারেন।"})]})]}),e.jsxs("div",{className:"bangla-perk",children:[e.jsx("div",{className:"perk-dot"}),e.jsxs("div",{className:"perk-text",children:[e.jsxs("strong",{children:[e.jsx("span",{className:"t-en",children:"Exam-focused lists"}),e.jsx("span",{className:"t-bn",children:"পরীক্ষা-কেন্দ্রিক তালিকা"})]})," ","—",e.jsx("span",{className:"t-en",children:"GRE, IELTS, BBA and SAT words for focused exam preparation and everyday fluency."}),e.jsx("span",{className:"t-bn",children:"GRE, IELTS, BBA ও SAT শব্দ, পরীক্ষার প্রস্তুতি ও দৈনন্দিন দক্ষতার জন্য।"})]})]})]})]}),e.jsx("div",{children:e.jsxs("div",{className:"bangla-card",children:[e.jsx("div",{className:"bangla-word",children:"acuity"}),e.jsxs("div",{className:"bangla-eng",children:["noun · uhk-YOO-uht-ee ·"," ",e.jsx("span",{style:{fontSize:".82rem",color:"#FF8A94"},children:"অক·যউ·অট·ই"})]}),e.jsxs("div",{className:"bangla-def-label",children:[e.jsx("span",{className:"t-en",children:"English Definition"}),e.jsx("span",{className:"t-bn",children:"ইংরেজি সংজ্ঞা"})]}),e.jsx("div",{className:"bangla-def t-en",children:"Sharpness or keenness of thought, vision, or hearing"}),e.jsx("div",{className:"bangla-def-label",children:"বাংলা সংজ্ঞা"}),e.jsx("div",{className:"bangla-def",children:"চিন্তাশক্তি, দৃষ্টিশক্তি বা শ্রবণশক্তির তীক্ষ্ণতা বা প্রখরতা। কোনো বিষয়কে স্পষ্ট ও সূক্ষ্মভাবে বোঝার ক্ষমতা।"}),e.jsxs("div",{className:"bangla-def-label",children:[e.jsx("span",{className:"t-en",children:"Synonyms"}),e.jsx("span",{className:"t-bn",children:"সমার্থক শব্দ"})]}),e.jsxs("div",{className:"bangla-syn",children:[e.jsx("span",{children:"sharpness"}),e.jsx("span",{children:"keenness"}),e.jsx("span",{children:"perception"}),e.jsx("span",{children:"astuteness"})]})]})})]})}),e.jsxs("section",{className:"testi-section sr",id:"testimonials",children:[e.jsxs("div",{className:"section-eyebrow",children:["💬 ",e.jsx("span",{className:"t-en",children:"Reviews"}),e.jsx("span",{className:"t-bn",children:"পর্যালোচনা"})]}),e.jsxs("h2",{className:"section-title",children:[e.jsx("span",{className:"t-en",children:"Learners Love VocabPix"}),e.jsx("span",{className:"t-bn",children:"শিক্ষার্থীরা VocabPix ভালোবাসেন"})]}),e.jsx("p",{className:"section-sub t-en",children:"Real feedback from real students — from Dhaka to diaspora."}),e.jsx("p",{className:"section-sub t-bn",children:"ঢাকা থেকে প্রবাসী পর্যন্ত — বাস্তব শিক্ষার্থীদের বাস্তব মতামত।"}),e.jsxs("div",{className:"testi-grid",children:[e.jsxs("div",{className:"testi-card",children:[e.jsx("div",{className:"testi-stars",children:"★★★★★"}),e.jsx("div",{className:"testi-quote",children:'"I scored 162 on GRE Verbal after 6 weeks on VocabPix. The image anchoring is genuinely different — I could picture every word during the exam."'}),e.jsxs("div",{className:"testi-person",children:[e.jsx("div",{className:"testi-av",style:{background:"#E8192C"},children:"RS"}),e.jsxs("div",{children:[e.jsx("div",{className:"testi-name",children:"Rahul S."}),e.jsxs("div",{className:"testi-role",children:["GRE Prep ·"," ",e.jsx("span",{className:"t-en",children:"scored 162 Verbal"}),e.jsx("span",{className:"t-bn",children:"GRE Verbal ১৬২ পেয়েছেন"})]})]})]})]}),e.jsxs("div",{className:"testi-card",children:[e.jsx("div",{className:"testi-stars",children:"★★★★★"}),e.jsx("div",{className:"testi-quote",children:'"বাংলায় সংজ্ঞা পাওয়াটা সত্যিই অসাধারণ। ইংরেজি শব্দ এখন মাথায় থাকে! 23-day streak চলছে।"'}),e.jsxs("div",{className:"testi-person",children:[e.jsx("div",{className:"testi-av",style:{background:"#2563EB"},children:"TF"}),e.jsxs("div",{children:[e.jsx("div",{className:"testi-name",children:"Tasfia F."}),e.jsxs("div",{className:"testi-role",children:[e.jsx("span",{className:"t-en",children:"University Student"}),e.jsx("span",{className:"t-bn",children:"বিশ্ববিদ্যালয় শিক্ষার্থী"})," ","· Dhaka"]})]})]})]}),e.jsxs("div",{className:"testi-card",children:[e.jsx("div",{className:"testi-stars",children:"★★★★★"}),e.jsx("div",{className:"testi-quote",children:'"As an English teacher I recommend this to every student. The collocation examples and synonym groupings are exactly how vocabulary should be taught."'}),e.jsxs("div",{className:"testi-person",children:[e.jsx("div",{className:"testi-av",style:{background:"#1DB954"},children:"MK"}),e.jsxs("div",{children:[e.jsx("div",{className:"testi-name",children:"Mohammad K."}),e.jsxs("div",{className:"testi-role",children:[e.jsx("span",{className:"t-en",children:"English Teacher"}),e.jsx("span",{className:"t-bn",children:"ইংরেজি শিক্ষক"})," ","· Chittagong"]})]})]})]})]})]}),e.jsx("div",{className:"pricing-section sr",id:"pricing",children:e.jsxs("div",{className:"pricing-inner",children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"48px"},children:[e.jsxs("div",{className:"section-eyebrow",style:{textAlign:"center"},children:["💳 ",e.jsx("span",{className:"t-en",children:"Pricing"}),e.jsx("span",{className:"t-bn",children:"মূল্য"})]}),e.jsxs("h2",{className:"section-title",style:{textAlign:"center"},children:[e.jsx("span",{className:"t-en",children:"Simple, Honest Pricing"}),e.jsx("span",{className:"t-bn",children:"সহজ, সৎ মূল্য নির্ধারণ"})]}),e.jsxs("p",{className:"section-sub",style:{margin:"0 auto",textAlign:"center"},children:[e.jsx("span",{className:"t-en",children:"Get lifetime access to our scientifically designed word lists with a one-time purchase."}),e.jsx("span",{className:"t-bn",children:"এককালীন ক্রয়ের মাধ্যমে আমাদের বৈজ্ঞানিকভাবে ডিজাইন করা শব্দ তালিকায় আজীবন প্রবেশাধিকার পান।"})]})]}),e.jsx("div",{className:"pricing-grid",children:j.length>0?j.map((s,n)=>e.jsxs("div",{className:`price-card ${n===2?"featured":""}`,children:[n===2&&e.jsxs("div",{className:"price-badge",children:["🔥"," ",e.jsx("span",{className:"t-en",children:"Most Popular"}),e.jsx("span",{className:"t-bn",children:"সবচেয়ে জনপ্রিয়"})]}),e.jsxs("div",{className:"price-plan",children:[e.jsx("span",{className:"t-en",children:s.name}),e.jsx("span",{className:"t-bn",children:s.name})]}),e.jsxs("div",{className:"price-amount",children:[e.jsx("sub",{children:"৳"}),parseInt(s.price)]}),e.jsxs("div",{className:"price-period",children:[e.jsx("span",{className:"t-en",children:"One-time purchase"}),e.jsx("span",{className:"t-bn",children:"এককালীন ক্রয়"})]}),e.jsxs("ul",{className:"price-features",children:[s.name&&s.name.includes("Basic to Fluent")&&e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Based on the Oxford 3000"}),e.jsx("span",{className:"t-bn",children:"অক্সফোর্ড ৩০০০ ভিত্তিক"})]}),s.description&&e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:s.description}),e.jsx("span",{className:"t-bn",children:s.description})]}),e.jsxs("li",{children:[e.jsxs("span",{className:"t-en",children:[s.words_count," Words"]}),e.jsxs("span",{className:"t-bn",children:[s.words_count," শব্দ"]})]}),e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Image-based Learning"}),e.jsx("span",{className:"t-bn",children:"ছবির মাধ্যমে শিক্ষা"})]}),e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Audio Pronunciation"}),e.jsx("span",{className:"t-bn",children:"অডিও উচ্চারণ"})]}),e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Bangla Meaning & Synonyms"}),e.jsx("span",{className:"t-bn",children:"বাংলা অর্থ ও সমার্থক শব্দ"})]}),e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Smart Review System"}),e.jsx("span",{className:"t-bn",children:"স্মার্ট রিভিউ সিস্টেম"})]}),e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Scientific Memory Anchoring"}),e.jsx("span",{className:"t-bn",children:"বৈজ্ঞানিক মেমোরি অ্যাঙ্করিং"})]}),e.jsxs("li",{children:[e.jsx("span",{className:"t-en",children:"Lifetime Access"}),e.jsx("span",{className:"t-bn",children:"আজীবন প্রবেশাধিকার"})]})]}),e.jsxs("a",{href:s.is_combo?"/shop":`/wordlist-categories/${s.id}/wordlists`,className:n===2?"btn-red":"btn-ghost",style:{display:"block",textAlign:"center",padding:"13px",borderRadius:n===2?"12px":""},children:[e.jsx("span",{className:"t-en",children:"View Details →"}),e.jsx("span",{className:"t-bn",children:"বিস্তারিত দেখুন →"})]})]},s.id)):e.jsxs("div",{style:{textAlign:"center",gridColumn:"1 / -1",color:"var(--muted)"},children:[e.jsx("span",{className:"t-en",children:"No pricing plans available."}),e.jsx("span",{className:"t-bn",children:"কোনো মূল্য পরিকল্পনা উপলব্ধ নেই।"})]})}),e.jsx("div",{className:"pricing-footer-note",children:e.jsxs("div",{className:"pfn-inner",children:[e.jsx("div",{className:"pfn-image",children:e.jsx("img",{src:"img/landing/book-icon.webp",alt:"Book Icon"})}),e.jsxs("div",{className:"pfn-content",children:[e.jsxs("h3",{className:"pfn-title",children:[e.jsxs("span",{className:"t-en",children:["Not sure"," ",e.jsx("span",{className:"text-red",children:"where to start?"})]}),e.jsxs("span",{className:"t-bn",children:["কোথা থেকে"," ",e.jsx("span",{className:"text-red",children:"শুরু করবেন?"})]})]}),e.jsxs("p",{className:"pfn-text",children:[e.jsxs("span",{className:"t-en",children:["VocabPix provides over"," ",e.jsxs("span",{className:"text-red",children:[f,"+"]})," ","words for free, so you can start learning and practicing and understand which level is best suited for you."]}),e.jsxs("span",{className:"t-bn",children:["VocabPix-এ"," ",e.jsxs("span",{className:"text-red",children:[f,"+"]})," ","শব্দ"," ",e.jsx("span",{className:"text-red",children:"বিনামূল্যে"})," ","শেখা ও অনুশীলন শুরু করুন এবং আপনার জন্য কোন লেভেলটি সবচেয়ে উপযোগী তা বুঝে নিন।"]})]}),e.jsxs(S,{href:route("wordlistcategory.index"),className:"btn-red pfn-btn",children:[e.jsx("span",{className:"t-en",style:{color:"#fff"},children:"Start Practicing Now! →"}),e.jsx("span",{className:"t-bn",style:{color:"#fff"},children:"এখনই অনুশীলন শুরু করুন! →"})]})]})]})})]})}),e.jsx("div",{className:"enroll-section",id:"enroll",children:e.jsxs("div",{className:"enroll-inner sr",children:[e.jsxs("h2",{className:"enroll-title",children:[e.jsx("span",{className:"t-en",children:"Start Today. For Free."}),e.jsx("span",{className:"t-bn",children:"শুরু করুন আজই। বিনামূল্যে।"})]}),e.jsxs("p",{className:"enroll-sub",children:[e.jsx("span",{className:"t-en",children:"Create your free account and access all word lists, quizzes, and your personal vocabulary journal instantly."}),e.jsx("span",{className:"t-bn",children:"আজই বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং সমস্ত শব্দ তালিকা, কুইজ ও ব্যক্তিগত শব্দভান্ডার জার্নালে তাৎক্ষণিক প্রবেশাধিকার পান।"})]}),e.jsxs("div",{className:"enroll-form",children:[e.jsxs("div",{id:"form-body",children:[e.jsxs("div",{className:"form-tabs",children:[e.jsxs("button",{className:`form-tab ${c==="register"?"active":""}`,onClick:()=>d("register"),children:[e.jsx("span",{className:"t-en",children:"Register"}),e.jsx("span",{className:"t-bn",children:"নিবন্ধন"})]}),e.jsxs("button",{className:`form-tab ${c==="login"?"active":""}`,onClick:()=>d("login"),children:[e.jsx("span",{className:"t-en",children:"Login"}),e.jsx("span",{className:"t-bn",children:"লগইন"})]})]}),c==="register"&&e.jsxs("form",{onSubmit:F,id:"tab-register",children:[e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Your Name"}),e.jsx("span",{className:"t-bn",children:"আপনার নাম"})]}),e.jsx("input",{type:"text",value:a.data.name,onChange:s=>a.setData("name",s.target.value),placeholder:"Your name",required:!0}),a.errors.name&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:a.errors.name})]}),e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Email Address"}),e.jsx("span",{className:"t-bn",children:"ইমেইল ঠিকানা"})]}),e.jsx("input",{type:"email",value:a.data.email,onChange:s=>a.setData("email",s.target.value),placeholder:"you@example.com",required:!0}),a.errors.email&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:a.errors.email})]}),e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Password"}),e.jsx("span",{className:"t-bn",children:"পাসওয়ার্ড"})]}),e.jsx("input",{type:"password",value:a.data.password,onChange:s=>a.setData("password",s.target.value),placeholder:"Min. 8 characters",required:!0}),a.errors.password&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:a.errors.password})]}),e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Your Learning Goal"}),e.jsx("span",{className:"t-bn",children:"আপনার শেখার লক্ষ্য"})]}),e.jsx("div",{className:"goal-chips",children:[{id:"GRE",labelEn:"📝 GRE",labelBn:"📝 GRE"},{id:"IELTS",labelEn:"🎓 IELTS",labelBn:"🎓 IELTS"},{id:"BBA",labelEn:"💼 BBA",labelBn:"💼 BBA"},{id:"Other",labelEn:"✏️ Other",labelBn:"✏️ অন্যান্য"}].map(s=>e.jsxs("button",{type:"button",className:`goal-chip ${a.data.learning_goal===s.id?"active":""}`,onClick:()=>a.setData("learning_goal",s.id),children:[e.jsx("span",{className:"t-en",children:s.labelEn}),e.jsx("span",{className:"t-bn",children:s.labelBn})]},s.id))})]}),e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"WhatsApp Number"}),e.jsx("span",{className:"t-bn",children:"হোয়াটসঅ্যাপ নম্বর"})]}),e.jsx("input",{type:"text",value:a.data.phone_number,onChange:s=>a.setData("phone_number",s.target.value),placeholder:"e.g. 01712345678",required:!0}),a.errors.phone_number&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:a.errors.phone_number})]}),e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Location (where you are joining from)"}),e.jsx("span",{className:"t-bn",children:"স্থান (আপনি যেখান থেকে যুক্ত হচ্ছেন)"})]}),e.jsxs("select",{value:a.data.location,onChange:s=>a.setData("location",s.target.value),required:!0,children:[e.jsx("option",{value:"",children:"Choose location..."}),k.map(s=>e.jsx("option",{value:s,children:s},s))]})]}),p?.enabled&&e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Referral Code (optional)"}),e.jsx("span",{className:"t-bn",children:"à¦°à§‡à¦«à¦¾à¦°à§‡à¦² à¦•à§‹à¦¡ (à¦à¦šà§à¦›à¦¿à¦•)"})]}),e.jsx("input",{type:"text",value:a.data.referral_code,onChange:s=>a.setData("referral_code",s.target.value.toUpperCase()),placeholder:"VPX8F3K2",style:{textTransform:"uppercase"}}),e.jsxs("p",{style:{color:"var(--muted)",fontSize:"0.78rem",marginTop:"6px"},children:[e.jsxs("span",{className:"t-en",children:["Get"," ",p.new_user_discount_percent,"% off your first paid order."]}),e.jsx("span",{className:"t-bn",children:"à¦ªà§à¦°à¦¥à¦® à¦ªà§‡à¦‡à¦¡ à¦…à¦°à§à¦¡à¦¾à¦°à§‡ à¦›à¦¾à§œ à¦ªà¦¾à¦¨à¥¤"})]}),a.errors.referral_code&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:a.errors.referral_code})]}),e.jsx("button",{type:"submit",className:"form-submit",disabled:a.processing,children:a.processing?e.jsx("span",{className:"t-en",children:"Processing..."}):e.jsxs(e.Fragment,{children:["🚀"," ",e.jsx("span",{className:"t-en",children:"Create Free Account"}),e.jsx("span",{className:"t-bn",children:"বিনামূল্যে অ্যাকাউন্ট তৈরি করুন"})]})})]}),c==="login"&&e.jsxs("form",{onSubmit:A,id:"tab-login",children:[e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Email"}),e.jsx("span",{className:"t-bn",children:"ইমেইল"})]}),e.jsx("input",{type:"email",value:i.data.email,onChange:s=>i.setData("email",s.target.value),placeholder:"you@example.com",required:!0}),i.errors.email&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:i.errors.email})]}),e.jsxs("div",{className:"fg",children:[e.jsxs("label",{children:[e.jsx("span",{className:"t-en",children:"Password"}),e.jsx("span",{className:"t-bn",children:"পাসওয়ার্ড"})]}),e.jsx("input",{type:"password",value:i.data.password,onChange:s=>i.setData("password",s.target.value),placeholder:"Your password",required:!0}),i.errors.password&&e.jsx("div",{style:{color:"var(--red)",fontSize:"0.75rem",marginTop:"4px"},children:i.errors.password})]}),e.jsx("button",{type:"submit",className:"form-submit",disabled:i.processing,children:i.processing?e.jsx("span",{className:"t-en",children:"Logging in..."}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"t-en",children:"Login to VocabPix →"}),e.jsx("span",{className:"t-bn",children:"VocabPix-এ লগইন করুন →"})]})}),e.jsxs("p",{className:"form-note",style:{marginTop:"12px"},children:[e.jsxs("span",{className:"t-en",children:["No account?"," ",e.jsx("button",{type:"button",onClick:()=>d("register"),style:{color:"var(--red)",fontWeight:"700",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit"},children:"Register free"})]}),e.jsxs("span",{className:"t-bn",children:["অ্যাকাউন্ট নেই?"," ",e.jsx("button",{type:"button",onClick:()=>d("register"),style:{color:"var(--red)",fontWeight:"700",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit"},children:"বিনামূল্যে নিবন্ধন করুন"})]})]})]}),e.jsxs("p",{className:"form-note",children:[e.jsx("span",{className:"t-en",children:"No credit card needed. Free forever on core features."}),e.jsx("span",{className:"t-bn",children:"কোনো ক্রেডিট কার্ড প্রয়োজন নেই। মূল ফিচারগুলো চিরকাল বিনামূল্যে।"})]})]}),e.jsxs("div",{className:"success-msg",id:"success-msg",children:[e.jsx("div",{className:"s-icon",children:"🎉"}),e.jsxs("h3",{children:[e.jsx("span",{className:"t-en",children:"Welcome to VocabPix!"}),e.jsx("span",{className:"t-bn",children:"VocabPix-এ স্বাগতম!"})]}),e.jsxs("p",{children:[e.jsx("span",{className:"t-en",children:"Your account is ready. Check your email to verify and start learning."}),e.jsx("span",{className:"t-bn",children:"আপনার অ্যাকাউন্ট প্রস্তুত। যাচাই করতে ইমেইল চেক করুন এবং শেখা শুরু করুন।"})]}),e.jsxs("a",{href:"https://vocabpix.fluento.org",target:"_blank",className:"btn-red",style:{display:"inline-block",padding:"14px 28px",borderRadius:"12px"},children:[e.jsx("span",{className:"t-en",children:"Open VocabPix App →"}),e.jsx("span",{className:"t-bn",children:"VocabPix অ্যাপ খুলুন →"})]})]})]})]})}),e.jsxs("section",{className:"faq-section sr",id:"faq",children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"48px"},children:[e.jsxs("div",{className:"section-eyebrow",style:{textAlign:"center"},children:["❓ ",e.jsx("span",{className:"t-en",children:"FAQ"}),e.jsx("span",{className:"t-bn",children:"প্রশ্নোত্তর"})]}),e.jsxs("h2",{className:"section-title",style:{textAlign:"center"},children:[e.jsx("span",{className:"t-en",children:"Common Questions"}),e.jsx("span",{className:"t-bn",children:"সাধারণ প্রশ্নসমূহ"})]})]}),e.jsxs("div",{className:"faq-item",children:[e.jsxs("button",{className:"faq-q",onClick:()=>x(r===0?null:0),"aria-expanded":r===0,children:[e.jsx("span",{className:"t-en",children:"Is VocabPix really free?"}),e.jsx("span",{className:"t-bn",children:"VocabPix কি সত্যিই বিনামূল্যে?"}),e.jsx("span",{className:`faq-icon ${r===0?"open":""}`,children:"+"})]}),e.jsxs("div",{className:`faq-a ${r===0?"open":""}`,children:[e.jsx("span",{className:"t-en",children:"Yes — all public word lists (IELTS & Academic Writing Vocabulary, Basic to Fluent Vocabulary, Spoken English Phrases & Idioms, Advanced Essential + Master Vocabulary), images, audio, Bangla definitions, XP tracking and quizzes are completely free. Pro adds custom collections, streak protection, and offline mode."}),e.jsx("span",{className:"t-bn",children:"হ্যাঁ — সব পাবলিক শব্দ তালিকা (IELTS & Academic Writing Vocabulary, Basic to Fluent Vocabulary, Spoken English Phrases & Idioms, Advanced Essential + Master Vocabulary), ছবি, অডিও, বাংলা সংজ্ঞা, XP ট্র্যাকিং ও কুইজ সম্পূর্ণ বিনামূল্যে। Pro-তে কাস্টম সংগ্রহ, স্ট্রিক সুরক্ষা ও অফলাইন মোড আছে।"})]})]}),e.jsxs("div",{className:"faq-item",children:[e.jsxs("button",{className:"faq-q",onClick:()=>x(r===1?null:1),"aria-expanded":r===1,children:[e.jsx("span",{className:"t-en",children:"Why does VocabPix use images?"}),e.jsx("span",{className:"t-bn",children:"VocabPix কেন ছবি ব্যবহার করে?"}),e.jsx("span",{className:`faq-icon ${r===1?"open":""}`,children:"+"})]}),e.jsxs("div",{className:`faq-a ${r===1?"open":""}`,children:[e.jsx("span",{className:"t-en",children:'Visual memory is one of the strongest memory systems in the brain. Pairing a word with a vivid image creates a "memory anchor." Studies show picture-word pairing improves long-term retention by 40–65% over text-only methods.'}),e.jsx("span",{className:"t-bn",children:'ভিজ্যুয়াল মেমরি মস্তিষ্কের সবচেয়ে শক্তিশালী স্মৃতি ব্যবস্থাগুলির মধ্যে একটি। একটি শব্দের সাথে একটি প্রাণবন্ত ছবি যুক্ত করলে "মেমরি অ্যাংকার" তৈরি হয়। গবেষণায় দেখা গেছে ছবি-শব্দ পেয়ারিং শুধু টেক্সট পদ্ধতির চেয়ে ৪০-৬৫% বেশি দীর্ঘমেয়াদী ধারণ উন্নত করে।'})]})]}),e.jsxs("div",{className:"faq-item",children:[e.jsxs("button",{className:"faq-q",onClick:()=>x(r===2?null:2),"aria-expanded":r===2,children:[e.jsx("span",{className:"t-en",children:"Can I add my own words?"}),e.jsx("span",{className:"t-bn",children:"আমি কি নিজের শব্দ যোগ করতে পারি?"}),e.jsx("span",{className:`faq-icon ${r===2?"open":""}`,children:"+"})]}),e.jsxs("div",{className:`faq-a ${r===2?"open":""}`,children:[e.jsx("span",{className:"t-en",children:'Yes! "Add New Word" lets you create personal word entries with definition, pronunciation, and part of speech.'}),e.jsx("span",{className:"t-bn",children:'হ্যাঁ! "নতুন শব্দ যোগ করুন" দিয়ে সংজ্ঞা, উচ্চারণ ও পদ পরিচয়সহ ব্যক্তিগত শব্দ এন্ট্রি তৈরি করুন।'})]})]})]}),e.jsx("footer",{children:e.jsxs("div",{className:"footer-inner",children:[e.jsxs("div",{className:"footer-top",children:[e.jsxs("div",{className:"footer-brand",children:[e.jsx("div",{className:"footer-logo-text",children:"🔴 VocabPix"}),e.jsxs("p",{children:[e.jsx("span",{className:"t-en",children:"A Fluento product · Learn vocabulary the fast and proven way — both in Bangla and English. Built for GRE, IELTS, BBA, SAT, and everyday learners."}),e.jsx("span",{className:"t-bn",children:"একটি Fluento পণ্য · দ্রুত ও প্রমাণিত উপায়ে শব্দভান্ডার শিখুন — বাংলা ও ইংরেজি উভয়ে। GRE, IELTS, BBA, SAT ও দৈনন্দিন শিক্ষার্থীদের জন্য তৈরি।"})]}),e.jsxs("a",{href:"https://vocabpix.fluento.org",target:"_blank",className:"btn-red",style:{display:"inline-block",padding:"10px 20px",fontSize:".85rem"},children:[e.jsx("span",{className:"t-en",children:"Open App →"}),e.jsx("span",{className:"t-bn",children:"অ্যাপ খুলুন →"})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"footer-heading",children:[e.jsx("span",{className:"t-en",children:"Word Lists"}),e.jsx("span",{className:"t-bn",children:"শব্দ তালিকা"})]}),e.jsxs("div",{className:"footer-links-col",children:[e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"IELTS & Academic Writing"}),e.jsx("span",{className:"t-bn",children:"IELTS ও একাডেমিক রাইটিং"})]}),e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Basic to Fluent"}),e.jsx("span",{className:"t-bn",children:"বেসিক থেকে ফ্লুয়েন্ট"})]}),e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Advanced Essentials"}),e.jsx("span",{className:"t-bn",children:"অ্যাডভান্সড এসেনশিয়ালস"})]})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"footer-heading",children:[e.jsx("span",{className:"t-en",children:"Product"}),e.jsx("span",{className:"t-bn",children:"পণ্য"})]}),e.jsxs("div",{className:"footer-links-col",children:[e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Features"}),e.jsx("span",{className:"t-bn",children:"ফিচার"})]}),e.jsxs("a",{href:"#pricing",children:[e.jsx("span",{className:"t-en",children:"Pricing"}),e.jsx("span",{className:"t-bn",children:"মূল্য"})]}),e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Quiz Mode"}),e.jsx("span",{className:"t-bn",children:"কুইজ মোড"})]}),e.jsx("a",{href:"#",children:"XP Shop"})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"footer-heading",children:[e.jsx("span",{className:"t-en",children:"Company"}),e.jsx("span",{className:"t-bn",children:"কোম্পানি"})]}),e.jsxs("div",{className:"footer-links-col",children:[e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"About Fluento"}),e.jsx("span",{className:"t-bn",children:"Fluento সম্পর্কে"})]}),e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Privacy Policy"}),e.jsx("span",{className:"t-bn",children:"গোপনীয়তা নীতি"})]}),e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Terms"}),e.jsx("span",{className:"t-bn",children:"শর্তাবলী"})]}),e.jsxs("a",{href:"#",children:[e.jsx("span",{className:"t-en",children:"Contact"}),e.jsx("span",{className:"t-bn",children:"যোগাযোগ"})]})]})]})]}),e.jsxs("div",{className:"footer-bottom",children:[e.jsxs("span",{children:["© 2026 Fluento."," ",e.jsx("span",{className:"t-en",children:"All rights reserved."}),e.jsx("span",{className:"t-bn",children:"সর্বস্বত্ব সংরক্ষিত।"})]}),e.jsxs("span",{children:[e.jsx("span",{className:"t-en",children:"Made with ❤️ for Bangladeshi learners"}),e.jsx("span",{className:"t-bn",children:"বাংলাদেশি শিক্ষার্থীদের জন্য ❤️ দিয়ে তৈরি"})]})]})]})})]})}export{L as default};
