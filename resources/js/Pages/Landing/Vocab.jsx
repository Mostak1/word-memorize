import React, { useState, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";

export default function VocabPixLanding({
    categories = [],
    freeWordsCount = 0,
}) {
    const [lang, setLang] = useState("en");

    const getCategoryImage = (name) => {
        if (!name) return "img/landing/personal_word.webp";
        const n = name.toLowerCase();
        if (n.includes("academic") || n.includes("ielts"))
            return "img/landing/academic.webp";
        if (n.includes("basic")) return "img/landing/basic.webp";
        if (n.includes("advanced"))
            return "img/landing/advanced_essantial_words.webp";
        if (
            n.includes("master") ||
            n.includes("iba") ||
            n.includes("gre") ||
            n.includes("sat")
        )
            return "img/landing/master_vocab.webp";
        return "img/landing/personal_word.webp";
    };

    const districts = [
        "Bagerhat",
        "Bandarban",
        "Barguna",
        "Barisal",
        "Bhola",
        "Bogura",
        "Brahmanbaria",
        "Chandpur",
        "Chapai Nawabganj",
        "Chattogram",
        "Chuadanga",
        "Cumilla",
        "Cox's Bazar",
        "Dhaka",
        "Dinajpur",
        "Faridpur",
        "Feni",
        "Gaibandha",
        "Gazipur",
        "Gopalganj",
        "Habiganj",
        "Jamalpur",
        "Jashore",
        "Jhalokathi",
        "Jhenaidah",
        "Joypurhat",
        "Khagrachari",
        "Khulna",
        "Kishoreganj",
        "Kurigram",
        "Kushtia",
        "Lakshmipur",
        "Lalmonirhat",
        "Madaripur",
        "Magura",
        "Manikganj",
        "Meherpur",
        "Moulvibazar",
        "Munshiganj",
        "Mymensingh",
        "Naogaon",
        "Narail",
        "Narayanganj",
        "Narsingdi",
        "Natore",
        "Netrokona",
        "Nilphamari",
        "Noakhali",
        "Pabna",
        "Panchagarh",
        "Patuakhali",
        "Pirojpur",
        "Rajbari",
        "Rajshahi",
        "Rangamati",
        "Rangpur",
        "Satkhira",
        "Shariatpur",
        "Sherpur",
        "Sirajganj",
        "Sunamganj",
        "Sylhet",
        "Tangail",
        "Thakurgaon",
        "Expat",
    ];

    const [activeTab, setActiveTab] = useState("register");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const registerForm = useForm({
        name: "",
        email: "",
        password: "",
        phone_number: "",
        learning_goal: "",
        location: "",
    });

    const loginForm = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleRegister = (e) => {
        e.preventDefault();
        registerForm.post(route("register"), {
            onSuccess: () => registerForm.reset("password"),
        });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        loginForm.post(route("login"), {
            onSuccess: () => loginForm.reset("password"),
        });
    };

    useEffect(() => {
        if (lang === "bn") {
            document.body.classList.remove("lang-en");
            document.body.classList.add("lang-bn");
        } else {
            document.body.classList.remove("lang-bn");
            document.body.classList.add("lang-en");
        }
    }, [lang]);

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add("vis");
                });
            },
            { threshold: 0.1 },
        );
        document.querySelectorAll(".sr").forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    return (
        <div className={lang === "bn" ? "lang-bn" : "lang-en"}>
            <Head>
                <title>VocabPix — Learn Vocabulary Scientifically</title>
            </Head>
            <style>{`
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
            align-items: center;
            gap: 60px;
            max-width: 1140px;
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
            justify-content: center;
        }

        .hero-video-wrap {
            width: 100%;
            max-width: 500px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, .15);
            aspect-ratio: 16 / 9;
            align-self: center;
        }

        .hero-video-wrap iframe {
            width: 100%;
            height: 100%;
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
            margin-bottom: 48px;
        }

        /* ── Exams ── */
        .exams-section {
            max-width: 1140px;
            margin: 0 auto;
            padding: 80px 24px;
        }

        .exams-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
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
            margin-top: 56px;
            position: relative;
        }

        .how-step {
            background: var(--bg);
            border-radius: 20px;
            padding: 32px 24px;
            position: relative;
            border: 1.5px solid var(--border);
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
            margin-bottom: 20px;
        }

        .how-step-icon {
            margin-bottom: 16px;
            display: flex;
            align-items: center;
        }

        .how-step-icon img {
            width: auto;
            object-fit: contain;
        }

        .how-step h3 {
            font-weight: 900;
            font-size: 1.05rem;
            color: var(--dark);
            margin-bottom: 8px;
        }

        .how-step p {
            font-size: .88rem;
            color: var(--muted);
            line-height: 1.7;
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
            }

            .hero-video-wrap {
                max-width: 100%;
                border-radius: 14px;
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
                margin-top: 32px;
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
    `}</style>

            {/* Topbar */}
            <div className="topbar">
                <span className="t-en">
                    🎓 GRE, IELTS, BCS, SAT, Medical & more — All in one place
                </span>
                <span className="t-bn">
                    🎓 GRE, IELTS, BCS, SAT, মেডিকেল ও আরও — সব এক জায়গায়
                </span>
                <span>
                    <span className="t-en">Free to Start</span>
                    <span className="t-bn">বিনামূল্যে শুরু করুন</span>
                </span>
            </div>

            {/* Nav */}
            <nav>
                <a className="nav-logo" href="#">
                    <div className="nav-logo-mark">V</div>
                    <span className="nav-logo-text">
                        VocabPix <sup>BETA</sup>
                    </span>
                </a>
                <div className="nav-links">
                    <a href="#exams">
                        <span className="t-en">Word Lists</span>
                        <span className="t-bn">শব্দ তালিকা</span>
                    </a>
                    <a href="#features">
                        <span className="t-en">Features</span>
                        <span className="t-bn">ফিচার</span>
                    </a>
                    <a href="#bangla">
                        <span className="t-en">Bangla</span>
                        <span className="t-bn">বাংলা</span>
                    </a>
                    <a href="#pricing">
                        <span className="t-en">Pricing</span>
                        <span className="t-bn">মূল্য</span>
                    </a>
                    <a href="#faq">
                        <span className="t-en">FAQ</span>
                        <span className="t-bn">প্রশ্নোত্তর</span>
                    </a>
                </div>
                <div className="nav-right">
                    <button
                        className="lang-toggle-btn"
                        onClick={() => setLang(lang === "en" ? "bn" : "en")}
                        id="lang-btn"
                    >
                        <span className="t-en">🇧🇩 বাংলা</span>
                        <span className="t-bn">🇬🇧 English</span>
                    </button>
                    <a
                        href="https://vocabpix.fluento.org"
                        className="btn-ghost"
                        target="_blank"
                    >
                        <span className="t-en">Login</span>
                        <span className="t-bn">লগইন</span>
                    </a>
                    <a href="#enroll" className="btn-red">
                        <span className="t-en">Register Free →</span>
                        <span className="t-bn">বিনামূল্যে নিবন্ধন →</span>
                    </a>
                </div>
                <button
                    className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
                    id="hamburger"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>

            {/* Mobile nav drawer */}
            <div
                className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}
                id="mobile-nav"
            >
                <a href="#exams" onClick={(e) => e.preventDefault()}>
                    <span className="t-en">Word Lists</span>
                    <span className="t-bn">শব্দ তালিকা</span>
                </a>
                <a href="#features" onClick={(e) => e.preventDefault()}>
                    <span className="t-en">Features</span>
                    <span className="t-bn">ফিচার</span>
                </a>
                <a href="#bangla" onClick={(e) => e.preventDefault()}>
                    <span className="t-en">Bangla</span>
                    <span className="t-bn">বাংলা</span>
                </a>
                <a href="#pricing" onClick={(e) => e.preventDefault()}>
                    <span className="t-en">Pricing</span>
                    <span className="t-bn">মূল্য</span>
                </a>
                <a href="#faq" onClick={(e) => e.preventDefault()}>
                    <span className="t-en">FAQ</span>
                    <span className="t-bn">প্রশ্নোত্তর</span>
                </a>
                <div className="mobile-nav-actions">
                    <a
                        href="https://vocabpix.fluento.org"
                        className="btn-ghost"
                        target="_blank"
                        style={{ textAlign: "center" }}
                    >
                        <span className="t-en">Login</span>
                        <span className="t-bn">লগইন</span>
                    </a>
                    <a
                        href="#enroll"
                        className="btn-red"
                        onClick={(e) => e.preventDefault()}
                        style={{
                            textAlign: "center",
                            display: "block",
                            padding: "12px",
                        }}
                    >
                        <span className="t-en">Register Free →</span>
                        <span className="t-bn">বিনামূল্যে নিবন্ধন →</span>
                    </a>
                </div>
            </div>

            {/* Hero */}
            <section>
                <div className="hero">
                    <div className="hero-left">
                        <div className="hero-badge">
                            🔬{" "}
                            <span className="t-en">
                                Scientific Vocabulary Learning
                            </span>
                            <span className="t-bn">বৈজ্ঞানিক শব্দ শিক্ষা</span>
                        </div>
                        <h1>
                            <span className="t-en">
                                Learn English Vocabulary <em>Fast & Smart</em> —
                                in Bangla & English
                            </span>
                            <span className="t-bn">
                                বাংলায় শিখুন ইংরেজি শব্দ —{" "}
                                <em>দ্রুত ও স্মার্টভাবে</em>
                            </span>
                        </h1>
                        <p className="hero-sub t-en">
                            VocabPix uses visual memory techniques, spaced
                            repetition, and Bangla-English bilingual support to
                            help you master 10,000+ words for exams and everyday
                            fluency.
                        </p>
                        <p className="hero-sub t-bn">
                            VocabPix ভিজ্যুয়াল মেমরি কৌশল, স্পেসড রিপিটিশন এবং
                            বাংলা-ইংরেজি দ্বিভাষিক সহায়তা ব্যবহার করে ১০,০০০+
                            শব্দ আয়ত্ত করতে সাহায্য করে।
                        </p>
                        <div className="hero-exam-tags">
                            <span className="exam-tag">📝 GRE</span>
                            <span className="exam-tag">🎓 IELTS</span>
                            <span className="exam-tag">📖 BCS</span>
                            <span className="exam-tag">💼 BBA</span>
                            <span className="exam-tag">
                                🏥 <span className="t-en">Medical</span>
                                <span className="t-bn">মেডিকেল</span>
                            </span>
                            <span className="exam-tag">📐 SAT</span>
                        </div>
                        <div className="hero-actions">
                            <a
                                href="#enroll"
                                className="btn-hero btn-hero-primary"
                            >
                                🚀{" "}
                                <span className="t-en">
                                    Start Learning Free
                                </span>
                                <span className="t-bn">
                                    বিনামূল্যে শেখা শুরু করুন
                                </span>
                            </a>
                            <a
                                href="https://vocabpix.fluento.org"
                                className="btn-hero btn-hero-secondary"
                                target="_blank"
                            >
                                👀 <span className="t-en">Explore App</span>
                                <span className="t-bn">অ্যাপ দেখুন</span>
                            </a>
                        </div>
                        <div className="hero-trust">
                            <div className="trust-avatars">
                                <div
                                    className="trust-avatar"
                                    style={{ background: "#E8192C" }}
                                >
                                    R
                                </div>
                                <div
                                    className="trust-avatar"
                                    style={{ background: "#2563EB" }}
                                >
                                    T
                                </div>
                                <div
                                    className="trust-avatar"
                                    style={{ background: "#1DB954" }}
                                >
                                    M
                                </div>
                                <div
                                    className="trust-avatar"
                                    style={{ background: "#FF6B00" }}
                                >
                                    S
                                </div>
                            </div>
                            <span>
                                <span className="t-en">
                                    Joined by <strong>5,000+</strong> learners
                                    this month
                                </span>
                                <span className="t-bn">
                                    এই মাসে <strong>৫,০০০+</strong> শিক্ষার্থী
                                    যোগ দিয়েছেন
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div
                            className="card-stack"
                            style={{ display: "none" }}
                        ></div>
                        <div className="hero-video-wrap">
                            <iframe
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                                title="VocabPix Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-item">
                    <div className="stat-n">
                        10<span>K+</span>
                    </div>
                    <div className="stat-l">
                        <span className="t-en">Curated Words</span>
                        <span className="t-bn">বাছাইকৃত শব্দ</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">122</div>
                    <div className="stat-l">
                        <span className="t-en">Word Lists</span>
                        <span className="t-bn">শব্দ তালিকা</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">6</div>
                    <div className="stat-l">
                        <span className="t-en">Exam Categories</span>
                        <span className="t-bn">পরীক্ষার বিভাগ</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">
                        95<span>%</span>
                    </div>
                    <div className="stat-l">
                        <span className="t-en">Retention Rate</span>
                        <span className="t-bn">ধারণ হার</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">
                        5<span>K+</span>
                    </div>
                    <div className="stat-l">
                        <span className="t-en">Active Learners</span>
                        <span className="t-bn">সক্রিয় শিক্ষার্থী</span>
                    </div>
                </div>
            </div>

            {/* Exams */}
            <section className="exams-section sr" id="exams">
                <div className="section-eyebrow">
                    📚 <span className="t-en">Word Lists</span>
                    <span className="t-bn">শব্দ তালিকা</span>
                </div>
                <h2 className="section-title">
                    <span className="t-en">
                        Master English Vocabulary for Every Goal
                    </span>
                    <span className="t-bn">
                        আপনার প্রয়োজন অনুযায়ী শব্দভাণ্ডার আয়ত্ত করুন
                    </span>
                </h2>
                <p className="section-sub t-en">
                    Whether you're preparing for competitive exams like IELTS
                    and GRE or building everyday fluency — our curated word
                    lists are designed to help you succeed faster.
                </p>
                <p className="section-sub t-bn">
                    IELTS, GRE বা দৈনন্দিন দক্ষতা — আপনার লক্ষ্যের জন্য প্রতিটি
                    শব্দ তালিকা সাজানো এবং শেখার জন্য প্রস্তুত।
                </p>
                <div className="exams-grid">
                    {categories.map((category) => (
                        <a
                            key={category.id}
                            className="exam-card"
                            href={`/wordlist-categories/${category.id}/wordlists`}
                            style={{
                                padding: "0",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                border: "1.5px solid var(--border)",
                                borderRadius: "16px",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    background: "#F8F9FC",
                                }}
                            >
                                <img
                                    src={getCategoryImage(category.name)}
                                    alt={category.name}
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block",
                                    }}
                                />
                            </div>
                            <div style={{ padding: "20px" }}>
                                <div
                                    className="exam-name"
                                    style={{
                                        textAlign: "left",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {category.name}
                                </div>
                                <div
                                    className="exam-words"
                                    style={{
                                        textAlign: "left",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                    </svg>
                                    {category.word_lists_count}{" "}
                                    <span className="t-en">Word Lists</span>
                                    <span className="t-bn">শব্দ তালিকা</span>
                                </div>
                                <div
                                    className="exam-words"
                                    style={{
                                        textAlign: "left",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        marginTop: "4px",
                                        fontSize: "0.85rem",
                                        color: "var(--muted)",
                                    }}
                                >
                                    <span className="t-en">
                                        {category.words_count} Words
                                    </span>
                                    <span className="t-bn">
                                        {category.words_count}টি শব্দ
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}

                    {/* Personal Wordlist Card */}
                    <a
                        className="exam-card"
                        href="#enroll"
                        style={{
                            padding: "0",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            border: "1.5px solid var(--border)",
                            borderRadius: "16px",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                background: "#F8F9FC",
                            }}
                        >
                            <img
                                src="img/landing/personal_word.webp"
                                alt="Personal Wordlist"
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    display: "block",
                                }}
                            />
                        </div>
                        <div style={{ padding: "20px" }}>
                            <div
                                className="exam-name"
                                style={{
                                    textAlign: "left",
                                    marginBottom: "8px",
                                }}
                            >
                                <span className="t-en">Personal Word List</span>
                                <span className="t-bn">ব্যক্তিগত শব্দ তালিকা</span>
                            </div>
                            <div
                                className="exam-words"
                                style={{
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <span className="t-en" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                                    Build your own custom vocabulary collection
                                </span>
                                <span className="t-bn" style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
                                    আপনার নিজস্ব কাস্টম শব্দ সংগ্রহ তৈরি করুন
                                </span>
                            </div>
                        </div>
                    </a>

                    {categories.length === 0 && (
                        <div
                            style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "var(--muted)",
                                width: "100%",
                                gridColumn: "1 / -1",
                            }}
                        >
                            <span className="t-en">
                                No word lists available at the moment.
                            </span>
                            <span className="t-bn">
                                এই মুহূর্তে কোনো শব্দ তালিকা উপলব্ধ নেই।
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <div className="how-section">
                <div className="how-inner sr">
                    <div className="section-eyebrow">
                        🗺️ <span className="t-en">How It Works</span>
                        <span className="t-bn">কিভাবে কাজ করে</span>
                    </div>
                    <h2 className="section-title">
                        <span className="t-en">
                            From Zero to Fluent in 4 Steps
                        </span>
                        <span className="t-bn">৪ ধাপে শূন্য থেকে দক্ষ</span>
                    </h2>
                    <p className="section-sub t-en">
                        No complicated setup. Open the app and start in under 60
                        seconds.
                    </p>
                    <p className="section-sub t-bn">
                        কোনো জটিল সেটআপ নেই। অ্যাপ খুলুন এবং ৬০ সেকেন্ডের মধ্যে
                        শুরু করুন।
                    </p>
                    <div className="how-steps">
                        <div className="how-step">
                            <div className="how-step-num">1</div>
                            <div className="how-step-icon">
                                <img
                                    src="img/landing/how_works/wordlists.png"
                                    alt="Pick a List"
                                />
                            </div>
                            <h3>
                                <span className="t-en">Pick a List</span>
                                <span className="t-bn">তালিকা বেছে নিন</span>
                            </h3>
                            <p className="t-en">
                                Choose IELTS & Academic Writing, Basic to
                                Fluent, Advanced Essentials, or your own list.
                                Each split into 60-word sub-lists.
                            </p>
                            <p className="t-bn">
                                IELTS & Academic Writing, Basic to Fluent,
                                Advanced Essentials বা নিজের তালিকা বেছে নিন।
                                প্রতিটি ৬০-শব্দের সাব-লিস্টে ভাগ করা।
                            </p>
                            <div className="how-step-arrow">›</div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">2</div>
                            <div className="how-step-icon">
                                <img
                                    src="img/landing/how_works/learn_from_image.png"
                                    alt="Learn with Images"
                                />
                            </div>
                            <h3>
                                <span className="t-en">Learn with Images</span>
                                <span className="t-bn">ছবির সাথে শিখুন</span>
                            </h3>
                            <p className="t-en">
                                Each word card shows an image, pronunciation,
                                Bangla definition, synonyms, antonyms &
                                collocations.
                            </p>
                            <p className="t-bn">
                                প্রতিটি শব্দ কার্ডে ছবি, উচ্চারণ, বাংলা সংজ্ঞা,
                                সমার্থক ও বিপরীতার্থক শব্দ দেখুন।
                            </p>
                            <div className="how-step-arrow">›</div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">3</div>
                            <div className="how-step-icon">
                                <img
                                    src="img/landing/how_works/rate_memory.png"
                                    alt="Rate Your Memory"
                                />
                            </div>
                            <h3>
                                <span className="t-en">Rate Your Memory</span>
                                <span className="t-bn">
                                    স্মৃতি মূল্যায়ন করুন
                                </span>
                            </h3>
                            <p className="t-en">
                                Tap "I Know" or "I Don't Know." Hard words
                                resurface automatically. Track your mastered
                                count.
                            </p>
                            <p className="t-bn">
                                "জানি" বা "জানি না" ট্যাপ করুন। কঠিন শব্দ
                                স্বয়ংক্রিয়ভাবে ফিরে আসে। আয়ত্ত শব্দ গণনা
                                করুন।
                            </p>
                            <div className="how-step-arrow">›</div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">4</div>
                            <div className="how-step-icon">
                                <img
                                    src="img/landing/how_works/gain_exp.png"
                                    alt="Earn XP & Streak"
                                />
                            </div>
                            <h3>
                                <span className="t-en">Earn XP & Streak</span>
                                <span className="t-bn">
                                    XP ও স্ট্রিক অর্জন করুন
                                </span>
                            </h3>
                            <p className="t-en">
                                Daily sessions build your streak. Earn XP for
                                sessions, mastered words, and completed lists.
                            </p>
                            <p className="t-bn">
                                দৈনিক সেশনে স্ট্রিক গড়ুন। সেশন, আয়ত্ত শব্দ ও
                                সম্পূর্ণ তালিকার জন্য XP অর্জন করুন।
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className="feat-section sr" id="features">
                <div className="section-eyebrow">
                    ✨ <span className="t-en">Features</span>
                    <span className="t-bn">ফিচার</span>
                </div>
                <h2 className="section-title">
                    <span className="t-en">
                        Everything You Need to Master Words
                    </span>
                    <span className="t-bn">
                        শব্দ আয়ত্ত করতে যা দরকার সবকিছু
                    </span>
                </h2>
                <p className="section-sub t-en">
                    Not flashcards. Not a dictionary. A complete vocabulary
                    system.
                </p>
                <p className="section-sub t-bn">
                    শুধু ফ্ল্যাশকার্ড নয়। শুধু অভিধান নয়। একটি সম্পূর্ণ
                    শব্দভান্ডার সিস্টেম।
                </p>
                <div className="feat-grid">
                    <div className="feat-card big">
                        <div className="feat-icon">🖼️</div>
                        <h3>
                            <span className="t-en">
                                Picture-Memory Learning
                            </span>
                            <span className="t-bn">ছবি-স্মৃতি শিক্ষা</span>
                        </h3>
                        <div className="t-en">
                            <p>
                                Every word is anchored to a vivid, contextual
                                image. Visual memory increases retention by up
                                to 65% compared to plain text — your brain never
                                forgets an image it has truly seen.
                            </p>
                            <br />
                            <p>
                                Our image-word pairing engine ensures the
                                picture matches the word's meaning, tone, and
                                usage — not just a generic stock photo.
                            </p>
                        </div>
                        <div className="t-bn">
                            <p>
                                প্রতিটি শব্দ একটি প্রাণবন্ত ছবির সাথে যুক্ত।
                                ভিজ্যুয়াল মেমরি সাধারণ টেক্সটের তুলনায় ৬৫%
                                বেশি ধারণ ক্ষমতা বাড়ায় — মস্তিষ্ক একটি
                                সত্যিকারের দেখা ছবি কখনো ভোলে না।
                            </p>
                            <br />
                            <p>
                                আমাদের ছবি-শব্দ পেয়ারিং ইঞ্জিন নিশ্চিত করে যে
                                ছবিটি শব্দের অর্থ, স্বর এবং ব্যবহারের সাথে মেলে।
                            </p>
                        </div>
                        <div className="feat-pill-row">
                            <span className="feat-pill">
                                <span className="t-en">
                                    65% better retention
                                </span>
                                <span className="t-bn">৬৫% বেশি ধারণ</span>
                            </span>
                            <span className="feat-pill">
                                <span className="t-en">Contextual images</span>
                                <span className="t-bn">প্রাসঙ্গিক ছবি</span>
                            </span>
                            <span className="feat-pill">
                                <span className="t-en">Visual anchors</span>
                                <span className="t-bn">
                                    ভিজ্যুয়াল অ্যাংকার
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">🔊</div>
                        <h3>
                            <span className="t-en">
                                Audio + Phonetic Pronunciation
                            </span>
                            <span className="t-bn">অডিও ও ধ্বনিগত উচ্চারণ</span>
                        </h3>
                        <p className="t-en">
                            Hear every word spoken aloud. Get phonetic spelling
                            in English and Bangla transliteration so you know
                            exactly how to say it.
                        </p>
                        <p className="t-bn">
                            প্রতিটি শব্দ উচ্চস্বরে শুনুন। বাংলা লিপ্যন্তরসহ
                            ধ্বনিগত বানান পান যাতে সঠিক উচ্চারণ জানতে পারেন।
                        </p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">🔄</div>
                        <h3>
                            <span className="t-en">
                                Synonyms, Antonyms & Collocations
                            </span>
                            <span className="t-bn">
                                সমার্থক, বিপরীতার্থক ও কোলোকেশন
                            </span>
                        </h3>
                        <p className="t-en">
                            See how words connect — synonyms, antonyms, and real
                            sentence collocations so you learn words in context,
                            not in isolation.
                        </p>
                        <p className="t-bn">
                            শব্দের সংযোগ দেখুন — সমার্থক, বিপরীতার্থক এবং বাস্তব
                            বাক্যে কোলোকেশন, যাতে বিচ্ছিন্নভাবে নয়, প্রসঙ্গে
                            শিখতে পারেন।
                        </p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">⚡</div>
                        <h3>
                            <span className="t-en">XP & Gamified Streaks</span>
                            <span className="t-bn">XP ও গেমিফাইড স্ট্রিক</span>
                        </h3>
                        <p className="t-en">
                            Earn XP for sessions, mastered words, and completed
                            lists. Build daily streaks. Hit milestones. Stay
                            hooked on learning.
                        </p>
                        <p className="t-bn">
                            সেশন, আয়ত্ত শব্দ ও সম্পূর্ণ তালিকার জন্য XP অর্জন
                            করুন। দৈনিক স্ট্রিক গড়ুন। মাইলস্টোন অর্জন করুন।
                        </p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">📝</div>
                        <h3>
                            <span className="t-en">
                                Custom Word Collections
                            </span>
                            <span className="t-bn">কাস্টম শব্দ সংগ্রহ</span>
                        </h3>
                        <p className="t-en">
                            Add any word you encounter — in class, reading, or
                            exams. Build personal lists and practice them
                            anytime.
                        </p>
                        <p className="t-bn">
                            ক্লাসে, পড়ায় বা পরীক্ষায় যেকোনো শব্দ যোগ করুন।
                            ব্যক্তিগত তালিকা তৈরি করুন এবং যেকোনো সময় অনুশীলন
                            করুন।
                        </p>
                    </div>
                </div>
            </section>

            {/* Bangla Section */}
            <div className="bangla-section">
                <div className="bangla-inner sr" id="bangla">
                    <div>
                        <div className="section-eyebrow">
                            🇧🇩 <span className="t-en">Bangla Support</span>
                            <span className="t-bn">বাংলা সহায়তা</span>
                        </div>
                        <h2 className="section-title">
                            <span className="t-en">
                                Learn in Bangla,
                                <br />
                                Win in English
                            </span>
                            <span className="t-bn">
                                শিখুন বাংলায়,
                                <br />
                                জিতুন ইংরেজিতে
                            </span>
                        </h2>
                        <p className="section-sub t-en">
                            The only vocabulary app built with Bengali learners
                            in mind — definitions, pronunciation guides, and
                            memory cues all available in Bangla.
                        </p>
                        <p className="section-sub t-bn">
                            বাংলাভাষী শিক্ষার্থীদের কথা মাথায় রেখে তৈরি একমাত্র
                            শব্দভান্ডার অ্যাপ — সংজ্ঞা, উচ্চারণ গাইড এবং স্মৃতি
                            সংকেত সবকিছু বাংলায়।
                        </p>
                        <div className="bangla-perks">
                            <div className="bangla-perk">
                                <div className="perk-dot"></div>
                                <div className="perk-text">
                                    <strong>
                                        <span className="t-en">
                                            Bangla definitions
                                        </span>
                                        <span className="t-bn">
                                            বাংলা সংজ্ঞা
                                        </span>
                                    </strong>{" "}
                                    —
                                    <span className="t-en">
                                        understand word meaning in your native
                                        language first, then internalize the
                                        English.
                                    </span>
                                    <span className="t-bn">
                                        প্রথমে মাতৃভাষায় শব্দের অর্থ বুঝুন,
                                        তারপর ইংরেজি আত্মস্থ করুন।
                                    </span>
                                </div>
                            </div>
                            <div className="bangla-perk">
                                <div className="perk-dot"></div>
                                <div className="perk-text">
                                    <strong>
                                        <span className="t-en">
                                            Bengali phonetic guide
                                        </span>
                                        <span className="t-bn">
                                            বাংলা ধ্বনি নির্দেশিকা
                                        </span>
                                    </strong>{" "}
                                    —
                                    <span className="t-en">
                                        every word has a Bangla script
                                        pronunciation (অক·যউ·অট·ই) so you say it
                                        correctly from day one.
                                    </span>
                                    <span className="t-bn">
                                        প্রতিটি শব্দে বাংলা লিপিতে উচ্চারণ
                                        (অক·যউ·অট·ই) আছে যাতে প্রথম দিন থেকেই
                                        সঠিকভাবে বলতে পারেন।
                                    </span>
                                </div>
                            </div>
                            <div className="bangla-perk">
                                <div className="perk-dot"></div>
                                <div className="perk-text">
                                    <strong>
                                        <span className="t-en">
                                            Exam-focused lists
                                        </span>
                                        <span className="t-bn">
                                            পরীক্ষা-কেন্দ্রিক তালিকা
                                        </span>
                                    </strong>{" "}
                                    —
                                    <span className="t-en">
                                        GRE, IELTS, BCS, BBA, SAT and Medical
                                        words used in Bangladesh's top
                                        competitive exams.
                                    </span>
                                    <span className="t-bn">
                                        GRE, IELTS, BCS, BBA, SAT ও মেডিকেল শব্দ
                                        যা বাংলাদেশের শীর্ষ প্রতিযোগিতামূলক
                                        পরীক্ষায় ব্যবহৃত হয়।
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="bangla-card">
                            <div className="bangla-word">acuity</div>
                            <div className="bangla-eng">
                                noun · uhk-YOO-uht-ee ·{" "}
                                <span
                                    style={{
                                        fontSize: ".82rem",
                                        color: "#FF8A94",
                                    }}
                                >
                                    অক·যউ·অট·ই
                                </span>
                            </div>
                            <div className="bangla-def-label">
                                <span className="t-en">English Definition</span>
                                <span className="t-bn">ইংরেজি সংজ্ঞা</span>
                            </div>
                            <div className="bangla-def t-en">
                                Sharpness or keenness of thought, vision, or
                                hearing
                            </div>
                            <div className="bangla-def-label">বাংলা সংজ্ঞা</div>
                            <div className="bangla-def">
                                চিন্তাশক্তি, দৃষ্টিশক্তি বা শ্রবণশক্তির
                                তীক্ষ্ণতা বা প্রখরতা। কোনো বিষয়কে স্পষ্ট ও
                                সূক্ষ্মভাবে বোঝার ক্ষমতা।
                            </div>
                            <div className="bangla-def-label">
                                <span className="t-en">Synonyms</span>
                                <span className="t-bn">সমার্থক শব্দ</span>
                            </div>
                            <div className="bangla-syn">
                                <span>sharpness</span>
                                <span>keenness</span>
                                <span>perception</span>
                                <span>astuteness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <section className="testi-section sr" id="testimonials">
                <div className="section-eyebrow">
                    💬 <span className="t-en">Reviews</span>
                    <span className="t-bn">পর্যালোচনা</span>
                </div>
                <h2 className="section-title">
                    <span className="t-en">Learners Love VocabPix</span>
                    <span className="t-bn">
                        শিক্ষার্থীরা VocabPix ভালোবাসেন
                    </span>
                </h2>
                <p className="section-sub t-en">
                    Real feedback from real students — from Dhaka to diaspora.
                </p>
                <p className="section-sub t-bn">
                    ঢাকা থেকে প্রবাসী পর্যন্ত — বাস্তব শিক্ষার্থীদের বাস্তব
                    মতামত।
                </p>
                <div className="testi-grid">
                    <div className="testi-card">
                        <div className="testi-stars">★★★★★</div>
                        <div className="testi-quote">
                            "I scored 162 on GRE Verbal after 6 weeks on
                            VocabPix. The image anchoring is genuinely different
                            — I could picture every word during the exam."
                        </div>
                        <div className="testi-person">
                            <div
                                className="testi-av"
                                style={{ background: "#E8192C" }}
                            >
                                RS
                            </div>
                            <div>
                                <div className="testi-name">Rahul S.</div>
                                <div className="testi-role">
                                    GRE Prep ·{" "}
                                    <span className="t-en">
                                        scored 162 Verbal
                                    </span>
                                    <span className="t-bn">
                                        GRE Verbal ১৬২ পেয়েছেন
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="testi-card">
                        <div className="testi-stars">★★★★★</div>
                        <div className="testi-quote">
                            "বাংলায় সংজ্ঞা পাওয়াটা সত্যিই অসাধারণ। ইংরেজি শব্দ
                            এখন মাথায় থাকে! 23-day streak চলছে।"
                        </div>
                        <div className="testi-person">
                            <div
                                className="testi-av"
                                style={{ background: "#2563EB" }}
                            >
                                TF
                            </div>
                            <div>
                                <div className="testi-name">Tasfia F.</div>
                                <div className="testi-role">
                                    <span className="t-en">
                                        University Student
                                    </span>
                                    <span className="t-bn">
                                        বিশ্ববিদ্যালয় শিক্ষার্থী
                                    </span>{" "}
                                    · Dhaka
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="testi-card">
                        <div className="testi-stars">★★★★★</div>
                        <div className="testi-quote">
                            "As an English teacher I recommend this to every
                            student. The collocation examples and synonym
                            groupings are exactly how vocabulary should be
                            taught."
                        </div>
                        <div className="testi-person">
                            <div
                                className="testi-av"
                                style={{ background: "#1DB954" }}
                            >
                                MK
                            </div>
                            <div>
                                <div className="testi-name">Mohammad K.</div>
                                <div className="testi-role">
                                    <span className="t-en">
                                        English Teacher
                                    </span>
                                    <span className="t-bn">ইংরেজি শিক্ষক</span>{" "}
                                    · Chittagong
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <div className="pricing-section sr" id="pricing">
                <div className="pricing-inner">
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <div
                            className="section-eyebrow"
                            style={{ textAlign: "center" }}
                        >
                            💳 <span className="t-en">Pricing</span>
                            <span className="t-bn">মূল্য</span>
                        </div>
                        <h2
                            className="section-title"
                            style={{ textAlign: "center" }}
                        >
                            <span className="t-en">Simple, Honest Pricing</span>
                            <span className="t-bn">সহজ, সৎ মূল্য নির্ধারণ</span>
                        </h2>
                        <p
                            className="section-sub"
                            style={{ margin: "0 auto", textAlign: "center" }}
                        >
                            <span className="t-en">
                                Get lifetime access to our scientifically
                                designed word lists with a one-time purchase.
                            </span>
                            <span className="t-bn">
                                এককালীন ক্রয়ের মাধ্যমে আমাদের বৈজ্ঞানিকভাবে
                                ডিজাইন করা শব্দ তালিকায় আজীবন প্রবেশাধিকার পান।
                            </span>
                        </p>
                    </div>
                    <div className="pricing-grid">
                        {categories.length > 0 ? (
                            categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`price-card ${index === 2 ? "featured" : ""}`}
                                >
                                    {index === 2 && (
                                        <div className="price-badge">
                                            🔥{" "}
                                            <span className="t-en">
                                                Most Popular
                                            </span>
                                            <span className="t-bn">
                                                সবচেয়ে জনপ্রিয়
                                            </span>
                                        </div>
                                    )}
                                    <div className="price-plan">
                                        <span className="t-en">
                                            {category.name}
                                        </span>
                                        <span className="t-bn">
                                            {category.name}
                                        </span>
                                    </div>
                                    <div className="price-amount">
                                        <sub>৳</sub>
                                        {parseInt(category.price)}
                                    </div>
                                    <div className="price-period">
                                        <span className="t-en">
                                            One-time purchase
                                        </span>
                                        <span className="t-bn">
                                            এককালীন ক্রয়
                                        </span>
                                    </div>
                                    <ul className="price-features">
                                        {category.name &&
                                            category.name.includes(
                                                "Basic to Fluent",
                                            ) && (
                                                <li>
                                                    <span className="t-en">
                                                        Based on the Oxford 3000
                                                    </span>
                                                    <span className="t-bn">
                                                        অক্সফোর্ড ৩০০০ ভিত্তিক
                                                    </span>
                                                </li>
                                            )}
                                        {category.description && (
                                            <li>
                                                <span className="t-en">
                                                    {category.description}
                                                </span>
                                                <span className="t-bn">
                                                    {category.description}
                                                </span>
                                            </li>
                                        )}
                                        <li>
                                            <span className="t-en">
                                                {category.words_count} Words
                                            </span>
                                            <span className="t-bn">
                                                {category.words_count} শব্দ
                                            </span>
                                        </li>
                                        <li>
                                            <span className="t-en">
                                                Image-based Learning
                                            </span>
                                            <span className="t-bn">
                                                ছবির মাধ্যমে শিক্ষা
                                            </span>
                                        </li>
                                        <li>
                                            <span className="t-en">
                                                Audio Pronunciation
                                            </span>
                                            <span className="t-bn">
                                                অডিও উচ্চারণ
                                            </span>
                                        </li>
                                        <li>
                                            <span className="t-en">
                                                Bangla Meaning & Synonyms
                                            </span>
                                            <span className="t-bn">
                                                বাংলা অর্থ ও সমার্থক শব্দ
                                            </span>
                                        </li>
                                        <li>
                                            <span className="t-en">
                                                Smart Review System
                                            </span>
                                            <span className="t-bn">
                                                স্মার্ট রিভিউ সিস্টেম
                                            </span>
                                        </li>
                                        <li>
                                            <span className="t-en">
                                                Scientific Memory Anchoring
                                            </span>
                                            <span className="t-bn">
                                                বৈজ্ঞানিক মেমোরি অ্যাঙ্করিং
                                            </span>
                                        </li>
                                        <li>
                                            <span className="t-en">
                                                Lifetime Access
                                            </span>
                                            <span className="t-bn">
                                                আজীবন প্রবেশাধিকার
                                            </span>
                                        </li>
                                    </ul>
                                    <a
                                        href={`/wordlist-categories/${category.id}/wordlists`}
                                        className={
                                            index === 2
                                                ? "btn-red"
                                                : "btn-ghost"
                                        }
                                        style={{
                                            display: "block",
                                            textAlign: "center",
                                            padding: "13px",
                                            borderRadius:
                                                index === 2 ? "12px" : "",
                                        }}
                                    >
                                        <span className="t-en">
                                            View Details →
                                        </span>
                                        <span className="t-bn">
                                            বিস্তারিত দেখুন →
                                        </span>
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    gridColumn: "1 / -1",
                                    color: "var(--muted)",
                                }}
                            >
                                <span className="t-en">
                                    No pricing plans available.
                                </span>
                                <span className="t-bn">
                                    কোনো মূল্য পরিকল্পনা উপলব্ধ নেই।
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="pricing-footer-note">
                        <div className="pfn-inner">
                            <div className="pfn-image">
                                <img
                                    src="img/landing/book-icon.webp"
                                    alt="Book Icon"
                                />
                            </div>
                            <div className="pfn-content">
                                <h3 className="pfn-title">
                                    <span className="t-en">
                                        Not sure{" "}
                                        <span className="text-red">
                                            where to start?
                                        </span>
                                    </span>
                                    <span className="t-bn">
                                        কোথা থেকে{" "}
                                        <span className="text-red">
                                            শুরু করবেন?
                                        </span>
                                    </span>
                                </h3>
                                <p className="pfn-text">
                                    <span className="t-en">
                                        VocabPix provides over{" "}
                                        <span className="text-red">
                                            {freeWordsCount}+
                                        </span>{" "}
                                        essential words for free, so you can
                                        start learning and practicing{" "}
                                        <span className="text-red">
                                            forever
                                        </span>{" "}
                                        at no cost.
                                    </span>
                                    <span className="t-bn">
                                        VocabPix-এ{" "}
                                        <span className="text-red">
                                            {freeWordsCount}+
                                        </span>{" "}
                                        শব্দ আজীবন{" "}
                                        <span className="text-red">
                                            বিনামূল্যে
                                        </span>{" "}
                                        শেখার এবং অনুশীলন করার সুযোগ রয়েছে।
                                    </span>
                                </p>
                                <Link
                                    href={route("wordlistcategory.index")}
                                    className="btn-red pfn-btn"
                                >
                                    <span
                                        className="t-en"
                                        style={{ color: "#fff" }}
                                    >
                                        Start Practicing Now! →
                                    </span>
                                    <span
                                        className="t-bn"
                                        style={{ color: "#fff" }}
                                    >
                                        এখনই অনুশীলন শুরু করুন! →
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enroll */}
            <div className="enroll-section" id="enroll">
                <div className="enroll-inner sr">
                    <h2 className="enroll-title">
                        <span className="t-en">Start Today. For Free.</span>
                        <span className="t-bn">শুরু করুন আজই। বিনামূল্যে।</span>
                    </h2>
                    <p className="enroll-sub">
                        <span className="t-en">
                            Create your free account and access all word lists,
                            quizzes, and your personal vocabulary journal
                            instantly.
                        </span>
                        <span className="t-bn">
                            আজই বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং সমস্ত শব্দ
                            তালিকা, কুইজ ও ব্যক্তিগত শব্দভান্ডার জার্নালে
                            তাৎক্ষণিক প্রবেশাধিকার পান।
                        </span>
                    </p>
                    <div className="enroll-form">
                        <div id="form-body">
                            <div className="form-tabs">
                                <button
                                    className={`form-tab ${activeTab === "register" ? "active" : ""}`}
                                    onClick={() => setActiveTab("register")}
                                >
                                    <span className="t-en">Register</span>
                                    <span className="t-bn">নিবন্ধন</span>
                                </button>
                                <button
                                    className={`form-tab ${activeTab === "login" ? "active" : ""}`}
                                    onClick={() => setActiveTab("login")}
                                >
                                    <span className="t-en">Login</span>
                                    <span className="t-bn">লগইন</span>
                                </button>
                            </div>
                            {activeTab === "register" && (
                                <form
                                    onSubmit={handleRegister}
                                    id="tab-register"
                                >
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                Your Name
                                            </span>
                                            <span className="t-bn">
                                                আপনার নাম
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={registerForm.data.name}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Your name"
                                            required
                                        />
                                        {registerForm.errors.name && (
                                            <div
                                                style={{
                                                    color: "var(--red)",
                                                    fontSize: "0.75rem",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {registerForm.errors.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                Email Address
                                            </span>
                                            <span className="t-bn">
                                                ইমেইল ঠিকানা
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            value={registerForm.data.email}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="you@example.com"
                                            required
                                        />
                                        {registerForm.errors.email && (
                                            <div
                                                style={{
                                                    color: "var(--red)",
                                                    fontSize: "0.75rem",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {registerForm.errors.email}
                                            </div>
                                        )}
                                    </div>
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                Password
                                            </span>
                                            <span className="t-bn">
                                                পাসওয়ার্ড
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            value={registerForm.data.password}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Min. 8 characters"
                                            required
                                        />
                                        {registerForm.errors.password && (
                                            <div
                                                style={{
                                                    color: "var(--red)",
                                                    fontSize: "0.75rem",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {registerForm.errors.password}
                                            </div>
                                        )}
                                    </div>
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                Your Learning Goal
                                            </span>
                                            <span className="t-bn">
                                                আপনার শেখার লক্ষ্য
                                            </span>
                                        </label>
                                        <div className="goal-chips">
                                            {[
                                                {
                                                    id: "GRE",
                                                    labelEn: "📝 GRE",
                                                    labelBn: "📝 GRE",
                                                },
                                                {
                                                    id: "IELTS",
                                                    labelEn: "🎓 IELTS",
                                                    labelBn: "🎓 IELTS",
                                                },
                                                {
                                                    id: "BCS",
                                                    labelEn: "📖 BCS",
                                                    labelBn: "📖 BCS",
                                                },
                                                {
                                                    id: "BBA",
                                                    labelEn: "💼 BBA",
                                                    labelBn: "💼 BBA",
                                                },
                                                {
                                                    id: "Medical",
                                                    labelEn: "🏥 Medical",
                                                    labelBn: "🏥 মেডিকেল",
                                                },
                                                {
                                                    id: "Other",
                                                    labelEn: "✏️ Other",
                                                    labelBn: "✏️ অন্যান্য",
                                                },
                                            ].map((goal) => (
                                                <button
                                                    key={goal.id}
                                                    type="button"
                                                    className={`goal-chip ${registerForm.data.learning_goal === goal.id ? "active" : ""}`}
                                                    onClick={() =>
                                                        registerForm.setData(
                                                            "learning_goal",
                                                            goal.id,
                                                        )
                                                    }
                                                >
                                                    <span className="t-en">
                                                        {goal.labelEn}
                                                    </span>
                                                    <span className="t-bn">
                                                        {goal.labelBn}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                WhatsApp Number
                                            </span>
                                            <span className="t-bn">
                                                হোয়াটসঅ্যাপ নম্বর
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                registerForm.data.phone_number
                                            }
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "phone_number",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 01712345678"
                                            required
                                        />
                                        {registerForm.errors.phone_number && (
                                            <div
                                                style={{
                                                    color: "var(--red)",
                                                    fontSize: "0.75rem",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {
                                                    registerForm.errors
                                                        .phone_number
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                Location (where you are joining
                                                from)
                                            </span>
                                            <span className="t-bn">
                                                স্থান (আপনি যেখান থেকে যুক্ত
                                                হচ্ছেন)
                                            </span>
                                        </label>
                                        <select
                                            value={registerForm.data.location}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "location",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        >
                                            <option value="">
                                                Choose location...
                                            </option>
                                            {districts.map((district) => (
                                                <option
                                                    key={district}
                                                    value={district}
                                                >
                                                    {district}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="form-submit"
                                        disabled={registerForm.processing}
                                    >
                                        {registerForm.processing ? (
                                            <span className="t-en">
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                🚀{" "}
                                                <span className="t-en">
                                                    Create Free Account
                                                </span>
                                                <span className="t-bn">
                                                    বিনামূল্যে অ্যাকাউন্ট তৈরি
                                                    করুন
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {activeTab === "login" && (
                                <form onSubmit={handleLogin} id="tab-login">
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">Email</span>
                                            <span className="t-bn">ইমেইল</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={loginForm.data.email}
                                            onChange={(e) =>
                                                loginForm.setData(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="you@example.com"
                                            required
                                        />
                                        {loginForm.errors.email && (
                                            <div
                                                style={{
                                                    color: "var(--red)",
                                                    fontSize: "0.75rem",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {loginForm.errors.email}
                                            </div>
                                        )}
                                    </div>
                                    <div className="fg">
                                        <label>
                                            <span className="t-en">
                                                Password
                                            </span>
                                            <span className="t-bn">
                                                পাসওয়ার্ড
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            value={loginForm.data.password}
                                            onChange={(e) =>
                                                loginForm.setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Your password"
                                            required
                                        />
                                        {loginForm.errors.password && (
                                            <div
                                                style={{
                                                    color: "var(--red)",
                                                    fontSize: "0.75rem",
                                                    marginTop: "4px",
                                                }}
                                            >
                                                {loginForm.errors.password}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="form-submit"
                                        disabled={loginForm.processing}
                                    >
                                        {loginForm.processing ? (
                                            <span className="t-en">
                                                Logging in...
                                            </span>
                                        ) : (
                                            <>
                                                <span className="t-en">
                                                    Login to VocabPix →
                                                </span>
                                                <span className="t-bn">
                                                    VocabPix-এ লগইন করুন →
                                                </span>
                                            </>
                                        )}
                                    </button>
                                    <p
                                        className="form-note"
                                        style={{ marginTop: "12px" }}
                                    >
                                        <span className="t-en">
                                            No account?{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("register")
                                                }
                                                style={{
                                                    color: "var(--red)",
                                                    fontWeight: "700",
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                Register free
                                            </button>
                                        </span>
                                        <span className="t-bn">
                                            অ্যাকাউন্ট নেই?{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("register")
                                                }
                                                style={{
                                                    color: "var(--red)",
                                                    fontWeight: "700",
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                বিনামূল্যে নিবন্ধন করুন
                                            </button>
                                        </span>
                                    </p>
                                </form>
                            )}
                            <p className="form-note">
                                <span className="t-en">
                                    No credit card needed. Free forever on core
                                    features.
                                </span>
                                <span className="t-bn">
                                    কোনো ক্রেডিট কার্ড প্রয়োজন নেই। মূল
                                    ফিচারগুলো চিরকাল বিনামূল্যে।
                                </span>
                            </p>
                        </div>
                        <div className="success-msg" id="success-msg">
                            <div className="s-icon">🎉</div>
                            <h3>
                                <span className="t-en">
                                    Welcome to VocabPix!
                                </span>
                                <span className="t-bn">
                                    VocabPix-এ স্বাগতম!
                                </span>
                            </h3>
                            <p>
                                <span className="t-en">
                                    Your account is ready. Check your email to
                                    verify and start learning.
                                </span>
                                <span className="t-bn">
                                    আপনার অ্যাকাউন্ট প্রস্তুত। যাচাই করতে ইমেইল
                                    চেক করুন এবং শেখা শুরু করুন।
                                </span>
                            </p>
                            <a
                                href="https://vocabpix.fluento.org"
                                target="_blank"
                                className="btn-red"
                                style={{
                                    display: "inline-block",
                                    padding: "14px 28px",
                                    borderRadius: "12px",
                                }}
                            >
                                <span className="t-en">
                                    Open VocabPix App →
                                </span>
                                <span className="t-bn">
                                    VocabPix অ্যাপ খুলুন →
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <section className="faq-section sr" id="faq">
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <div
                        className="section-eyebrow"
                        style={{ textAlign: "center" }}
                    >
                        ❓ <span className="t-en">FAQ</span>
                        <span className="t-bn">প্রশ্নোত্তর</span>
                    </div>
                    <h2
                        className="section-title"
                        style={{ textAlign: "center" }}
                    >
                        <span className="t-en">Common Questions</span>
                        <span className="t-bn">সাধারণ প্রশ্নসমূহ</span>
                    </h2>
                </div>
                <div className="faq-item">
                    <button
                        className="faq-q"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span className="t-en">Is VocabPix really free?</span>
                        <span className="t-bn">
                            VocabPix কি সত্যিই বিনামূল্যে?
                        </span>
                        <span className="faq-icon">+</span>
                    </button>
                    <div className="faq-a">
                        <span className="t-en">
                            Yes — all public word lists (GRE, Oxford 3000,
                            Academic), images, audio, Bangla definitions, XP
                            tracking and quizzes are completely free. Pro adds
                            custom collections, streak protection, and offline
                            mode.
                        </span>
                        <span className="t-bn">
                            হ্যাঁ — সব পাবলিক শব্দ তালিকা (GRE, Oxford 3000,
                            Academic), ছবি, অডিও, বাংলা সংজ্ঞা, XP ট্র্যাকিং ও
                            কুইজ সম্পূর্ণ বিনামূল্যে। Pro-তে কাস্টম সংগ্রহ,
                            স্ট্রিক সুরক্ষা ও অফলাইন মোড আছে।
                        </span>
                    </div>
                </div>
                <div className="faq-item">
                    <button
                        className="faq-q"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span className="t-en">
                            Why does VocabPix use images?
                        </span>
                        <span className="t-bn">
                            VocabPix কেন ছবি ব্যবহার করে?
                        </span>
                        <span className="faq-icon">+</span>
                    </button>
                    <div className="faq-a">
                        <span className="t-en">
                            Visual memory is one of the strongest memory systems
                            in the brain. Pairing a word with a vivid image
                            creates a "memory anchor." Studies show picture-word
                            pairing improves long-term retention by 40–65% over
                            text-only methods.
                        </span>
                        <span className="t-bn">
                            ভিজ্যুয়াল মেমরি মস্তিষ্কের সবচেয়ে শক্তিশালী স্মৃতি
                            ব্যবস্থাগুলির মধ্যে একটি। একটি শব্দের সাথে একটি
                            প্রাণবন্ত ছবি যুক্ত করলে "মেমরি অ্যাংকার" তৈরি হয়।
                            গবেষণায় দেখা গেছে ছবি-শব্দ পেয়ারিং শুধু টেক্সট
                            পদ্ধতির চেয়ে ৪০-৬৫% বেশি দীর্ঘমেয়াদী ধারণ উন্নত
                            করে।
                        </span>
                    </div>
                </div>
                <div className="faq-item">
                    <button
                        className="faq-q"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span className="t-en">
                            Does it work for BCS and local Bangladesh exams?
                        </span>
                        <span className="t-bn">
                            BCS ও বাংলাদেশের স্থানীয় পরীক্ষার জন্য কি কাজ করে?
                        </span>
                        <span className="faq-icon">+</span>
                    </button>
                    <div className="faq-a">
                        <span className="t-en">
                            Yes. BCS and Medical vocabulary lists are in
                            development. GRE Extended and Academic Word List
                            already have significant overlap with BCS English
                            sections.
                        </span>
                        <span className="t-bn">
                            হ্যাঁ। BCS ও মেডিকেল শব্দভান্ডার তালিকা তৈরি হচ্ছে।
                            GRE Extended এবং Academic Word List ইতিমধ্যে BCS
                            English অংশের সাথে উল্লেখযোগ্য মিল রয়েছে।
                        </span>
                    </div>
                </div>
                <div className="faq-item">
                    <button
                        className="faq-q"
                        onClick={(e) => e.preventDefault()}
                    >
                        <span className="t-en">Can I add my own words?</span>
                        <span className="t-bn">
                            আমি কি নিজের শব্দ যোগ করতে পারি?
                        </span>
                        <span className="faq-icon">+</span>
                    </button>
                    <div className="faq-a">
                        <span className="t-en">
                            Yes! "Add New Word" lets you create personal word
                            entries with definition, pronunciation, and part of
                            speech. Pro unlocks unlimited custom collections
                            with full image and audio support.
                        </span>
                        <span className="t-bn">
                            হ্যাঁ! "নতুন শব্দ যোগ করুন" দিয়ে সংজ্ঞা, উচ্চারণ ও
                            পদ পরিচয়সহ ব্যক্তিগত শব্দ এন্ট্রি তৈরি করুন। Pro-তে
                            সম্পূর্ণ ছবি ও অডিও সহায়তাসহ সীমাহীন কাস্টম সংগ্রহ
                            আনলক হয়।
                        </span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-inner">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="footer-logo-text">🔴 VocabPix</div>
                            <p>
                                <span className="t-en">
                                    A Fluento product · Learn vocabulary the
                                    fast and proven way — both in Bangla and
                                    English. Built for GRE, IELTS, BCS, BBA,
                                    Medical, and SAT learners.
                                </span>
                                <span className="t-bn">
                                    একটি Fluento পণ্য · দ্রুত ও প্রমাণিত উপায়ে
                                    শব্দভান্ডার শিখুন — বাংলা ও ইংরেজি উভয়ে।
                                    GRE, IELTS, BCS, BBA, মেডিকেল ও SAT
                                    শিক্ষার্থীদের জন্য তৈরি।
                                </span>
                            </p>
                            <a
                                href="https://vocabpix.fluento.org"
                                target="_blank"
                                className="btn-red"
                                style={{
                                    display: "inline-block",
                                    padding: "10px 20px",
                                    fontSize: ".85rem",
                                }}
                            >
                                <span className="t-en">Open App →</span>
                                <span className="t-bn">অ্যাপ খুলুন →</span>
                            </a>
                        </div>
                        <div>
                            <div className="footer-heading">
                                <span className="t-en">Word Lists</span>
                                <span className="t-bn">শব্দ তালিকা</span>
                            </div>
                            <div className="footer-links-col">
                                <a href="#">
                                    <span className="t-en">
                                        IELTS & Academic Writing
                                    </span>
                                    <span className="t-bn">
                                        IELTS ও একাডেমিক রাইটিং
                                    </span>
                                </a>
                                <a href="#">
                                    <span className="t-en">
                                        Basic to Fluent
                                    </span>
                                    <span className="t-bn">
                                        বেসিক থেকে ফ্লুয়েন্ট
                                    </span>
                                </a>
                                <a href="#">
                                    <span className="t-en">
                                        Advanced Essentials
                                    </span>
                                    <span className="t-bn">
                                        অ্যাডভান্সড এসেনশিয়ালস
                                    </span>
                                </a>
                            </div>
                        </div>
                        <div>
                            <div className="footer-heading">
                                <span className="t-en">Product</span>
                                <span className="t-bn">পণ্য</span>
                            </div>
                            <div className="footer-links-col">
                                <a href="#">
                                    <span className="t-en">Features</span>
                                    <span className="t-bn">ফিচার</span>
                                </a>
                                <a href="#pricing">
                                    <span className="t-en">Pricing</span>
                                    <span className="t-bn">মূল্য</span>
                                </a>
                                <a href="#">
                                    <span className="t-en">Quiz Mode</span>
                                    <span className="t-bn">কুইজ মোড</span>
                                </a>
                                <a href="#">XP Shop</a>
                            </div>
                        </div>
                        <div>
                            <div className="footer-heading">
                                <span className="t-en">Company</span>
                                <span className="t-bn">কোম্পানি</span>
                            </div>
                            <div className="footer-links-col">
                                <a href="#">
                                    <span className="t-en">About Fluento</span>
                                    <span className="t-bn">
                                        Fluento সম্পর্কে
                                    </span>
                                </a>
                                <a href="#">
                                    <span className="t-en">Privacy Policy</span>
                                    <span className="t-bn">গোপনীয়তা নীতি</span>
                                </a>
                                <a href="#">
                                    <span className="t-en">Terms</span>
                                    <span className="t-bn">শর্তাবলী</span>
                                </a>
                                <a href="#">
                                    <span className="t-en">Contact</span>
                                    <span className="t-bn">যোগাযোগ</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span>
                            © 2026 Fluento.{" "}
                            <span className="t-en">All rights reserved.</span>
                            <span className="t-bn">সর্বস্বত্ব সংরক্ষিত।</span>
                        </span>
                        <span>
                            <span className="t-en">
                                Made with ❤️ for Bangladeshi learners
                            </span>
                            <span className="t-bn">
                                বাংলাদেশি শিক্ষার্থীদের জন্য ❤️ দিয়ে তৈরি
                            </span>
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
