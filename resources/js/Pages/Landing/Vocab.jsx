import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import dashboardImg from "/public/img/landing/dashboard.webp";
import exerciseImg from "/public/img/landing/exercise.webp";
import exerciseImg2 from "/public/img/landing/exercise2.webp";
import wordlistImg from "/public/img/landing/wordlist.webp";
import quizImg from "/public/img/landing/quiz.webp";
// import logo from "/public/img/logo.png";

function Phone({ src, alt, style = {} }) {
    return (
        <div
            className="phone-frame"
            style={{
                position: "relative",
                width: "220px",
                borderRadius: "36px",
                background: "#111",
                padding: "12px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 2px #333",
                flexShrink: 0,
                ...style,
            }}
        >
            <div
                style={{
                    borderRadius: "26px",
                    overflow: "hidden",
                    lineHeight: 0,
                    background: "#fff",
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{ width: "100%", display: "block" }}
                />
            </div>
        </div>
    );
}

export default function VocabPixLanding() {
    const [activeTab, setActiveTab] = useState("register");
    const [activeChips, setActiveChips] = useState([]);
    const [openFaqs, setOpenFaqs] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [lang, setLang] = useState("en");
    const [form, setForm] = useState({
        fn: "",
        ln: "",
        em: "",
        pw: "",
        dg: "",
    });

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add("vis");
                }),
            { threshold: 0.1 },
        );
        document.querySelectorAll(".sr").forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    const toggleChip = (chip) => {
        setActiveChips((prev) =>
            prev.includes(chip)
                ? prev.filter((c) => c !== chip)
                : [...prev, chip],
        );
    };

    const toggleFaq = (index) => {
        setOpenFaqs((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index],
        );
    };

    const switchToRegister = (e) => {
        e.preventDefault();
        setActiveTab("register");
    };

    const doRegister = () => {
        if (!form.fn || !form.em || !form.pw) {
            alert("Please fill in your name, email, and password.");
            return;
        }
        if (!form.em.includes("@")) {
            alert("Please enter a valid email address.");
            return;
        }
        if (form.pw.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        setShowSuccess(true);
    };

    const goalChips = [
        "📝 GRE",
        "🎓 IELTS",
        "📖 BCS",
        "💼 BBA",
        "🏥 Medical",
        "✏️ Other",
    ];

    const faqs = [
        {
            q: "Is VocabPix really free?",
            a: "Yes — the app is completely free, forever. There is no subscription. All app features (images, audio, Bangla definitions, XP, quizzes, offline mode, custom collections) are included at no cost. You only pay a one-time fee to unlock individual wordlists like GRE, IELTS, or BCS — and once purchased, they're yours forever.",
        },
        {
            q: "Why does VocabPix use images?",
            a: 'Visual memory is one of the strongest memory systems in the brain. Pairing a word with a vivid image creates a "memory anchor." Studies show picture-word pairing improves long-term retention by 40–65% over text-only methods.',
        },
        {
            q: "Does it work for BCS and local Bangladesh exams?",
            a: "Yes. BCS and Medical vocabulary lists are in development. GRE Extended and Academic Word List already have significant overlap with BCS English sections.",
        },
        {
            q: "How is this different from Quizlet or Anki?",
            a: "Quizlet and Anki are general tools — you build your own content. VocabPix is purpose-built for South Asian English learners, with professionally curated lists, contextual images, Bangla support, collocations, and a gamification system all built in.",
        },
        {
            q: "Can I add my own words?",
            a: '"Add New Word" lets you create personal word entries with definition, pronunciation, and part of speech. Pro unlocks unlimited custom collections with full image and audio support.',
        },
    ];

    const text = {
        pageTitle:
            lang === "en"
                ? "VocabPix — Learn Vocabulary Scientifically"
                : "VocabPix — বৈজ্ঞানিকভাবে শব্দভাণ্ডার শিখুন",
        topbar:
            lang === "en"
                ? "🎓 GRE, IELTS, BCS, SAT, Medical & more — All in one place"
                : "🎓 GRE, IELTS, BCS, SAT, Medical ও আরও — সব এক জায়গায়",
        nav: {
            login: lang === "en" ? "Login" : "লগইন",
            wordLists: lang === "en" ? "Word Lists" : "ওয়ার্ড লিস্ট",
            features: lang === "en" ? "Features" : "ফিচার",
            bangla: lang === "en" ? "Bangla" : "বাংলা",
            pricing: lang === "en" ? "Pricing" : "মূল্য",
            faq: lang === "en" ? "FAQ" : "প্রশ্ন",
        },
        hero: {
            title:
                lang === "en"
                    ? "Learn English Vocabulary"
                    : "ইংরেজি শব্দভাণ্ডার শিখুন",
            titleEm: lang === "en" ? "Fast & Smart" : "দ্রুত ও স্মার্ট",
            subtitle:
                lang === "en"
                    ? "VocabPix uses visual memory techniques, spaced repetition, and Bangla-English bilingual support to help you master 10,000+ words for exams and everyday fluency."
                    : "VocabPix ভিজ্যুয়াল মেমরি প্রযুক্তি, স্পেসড রিপিটিশন, এবং বাংলা-ইংরেজি দ্বিভাষিক সমর্থন ব্যবহার করে আপনাকে ১০০০০+ শব্দ দ্রুত ও স্থায়ীভাবে শিখতে সাহায্য করে।",
            startLearning:
                lang === "en" ? "Start Learning Free" : "ফ্রি শুরু করুন",
            exploreApp: lang === "en" ? "Explore App" : "অ্যাপ দেখুন",
            joined: lang === "en" ? "Joined by" : "যোগ করেছেন",
        },
        sections: {
            wordLists: lang === "en" ? "Word Lists" : "ওয়ার্ড লিস্ট",
            features: lang === "en" ? "Features" : "ফিচার",
            bangla: lang === "en" ? "Bangla Support" : "বাংলা সাপোর্ট",
            pricing: lang === "en" ? "Pricing" : "মূল্য",
            faqTitle: lang === "en" ? "Common Questions" : "সাধারণ প্রশ্ন",
        },
        pricingSubtitle:
            lang === "en"
                ? "The app is 100% free. Buy only the wordlists you need."
                : "অ্যাপটি সম্পূর্ণ বিনামূল্যে। শুধু প্রয়োজনীয় ওয়ার্ড লিস্ট কিনুন।",
        enrollTitle:
            lang === "en"
                ? "Start Today. Free forever."
                : "আজই শুরু করুন। বিনামূল্যে।",
        enrollSub:
            lang === "en"
                ? "Create your free account and access all word lists, quizzes, and your personal vocabulary journal instantly."
                : "আপনার ফ্রি অ্যাকাউন্ট তৈরি করুন এবং সব ওয়ার্ড লিস্ট, কুইজ, এবং ব্যক্তিগত শব্দভাণ্ডার জার্নালে সঙ্গে সঙ্গে প্রবেশ করুন।",
        register: lang === "en" ? "Register" : "রেজিস্টার",
        freeText: lang === "en" ? "Free →" : "ফ্রি →",
        freeToStart: lang === "en" ? "Free to Start" : "বিনামূল্যে শুরু করুন",
    };

    return (
        <>
            <Head>
                <title>{text.pageTitle}</title>
                <link
                    href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { scroll-behavior: smooth; }
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
                body { font-family: 'Nunito', sans-serif; color: var(--body); background: var(--bg); overflow-x: hidden; }
                .topbar { background: var(--red); color: #fff; text-align: center; padding: 9px 16px; font-size: 13px; font-weight: 700; letter-spacing: .02em; }
                .topbar span { background: rgba(255,255,255,.25); padding: 2px 10px; border-radius: 20px; margin-left: 8px; font-size: 12px; }
                nav { position: sticky; top: 0; z-index: 200; background: #fff; border-bottom: 1.5px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; }
                .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .nav-logo-mark { background: var(--red); color: #fff; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; }
                .nav-logo-text { font-weight: 900; font-size: 1.15rem; color: var(--dark); }
                .nav-logo-text sup { font-size: .55rem; background: var(--red); color: #fff; padding: 1px 5px; border-radius: 4px; margin-left: 2px; vertical-align: super; }
                .nav-links { display: flex; align-items: center; gap: 28px; }
                .nav-links a { text-decoration: none; color: var(--muted); font-weight: 600; font-size: .9rem; transition: color .2s; }
                .nav-links a:hover { color: var(--red); }
                .nav-menu-button { display: none; align-items: center; justify-content: center; width: 42px; height: 42px; border: 2px solid var(--border); border-radius: 12px; background: #fff; color: var(--dark); cursor: pointer; font-size: 1rem; font-weight: 700; }
                .nav-right { display: flex; align-items: center; gap: 12px; }
                .nav-links .nav-right-mobile { display: none; flex-direction: column; gap: 12px; padding: 16px 20px; align-items: center; }
                .nav-links .nav-right-mobile .lang-toggle-group { justify-content: center; }
                .nav-links .nav-right-mobile .btn-ghost,
                .nav-links .nav-right-mobile .btn-red { width: 100%; }
                .lang-toggle-group { display: inline-flex; gap: 6px; }
                .nav-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); opacity: 0; visibility: hidden; transition: opacity .2s ease, visibility .2s ease; z-index: 190; }
                .nav-backdrop.open { opacity: 1; visibility: visible; }
                .lang-toggle { padding: 7px 12px; border: 2px solid var(--border); border-radius: 10px; background: #fff; color: var(--dark); font-weight: 700; cursor: pointer; transition: all .2s; }
                .lang-toggle:hover { border-color: var(--red); color: var(--red); }
                .lang-toggle.active { border-color: var(--red); color: var(--red); background: rgba(232,25,44,.08); }
                .btn-ghost { padding: 9px 20px; border: 2px solid var(--border); border-radius: 10px; font-weight: 700; font-size: .88rem; text-decoration: none; color: var(--dark); transition: all .2s; background: #fff; cursor: pointer; }
                .btn-ghost:hover { border-color: var(--red); color: var(--red); }
                .btn-red { padding: 9px 22px; background: var(--red); color: #fff; border-radius: 10px; font-weight: 800; font-size: .88rem; text-decoration: none; border: none; cursor: pointer; transition: all .2s; }
                .btn-red:hover { background: var(--red2); transform: translateY(-1px); }
                .hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; max-width: 1140px; margin: 0 auto; padding: 80px 24px 60px; }
                .hero-badge { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; background: #FFF0F1; border: 1.5px solid #FFCDD1; color: var(--red); padding: 5px 14px; border-radius: 30px; font-size: .8rem; font-weight: 800; letter-spacing: .04em; }
                .hero h1 { font-size: clamp(2.2rem, 4.5vw, 3.4rem); font-weight: 900; line-height: 1.1; color: var(--dark); margin-bottom: 18px; }
                .hero h1 em { font-style: normal; color: var(--red); }
                .hero-sub { color: var(--muted); font-size: 1.05rem; line-height: 1.75; margin-bottom: 28px; max-width: 480px; }
                .hero-exam-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
                .exam-tag { background: #fff; border: 1.5px solid var(--border); border-radius: 8px; padding: 5px 12px; font-size: .78rem; font-weight: 700; color: var(--body); }
                .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
                .btn-hero { padding: 14px 30px; border-radius: 12px; font-weight: 800; font-size: 1rem; text-decoration: none; cursor: pointer; border: none; transition: all .2s; }
                .btn-hero-primary { background: var(--red); color: #fff; box-shadow: 0 6px 24px rgba(232,25,44,.28); }
                .btn-hero-primary:hover { background: var(--red2); transform: translateY(-2px); }
                .btn-hero-secondary { background: #fff; color: var(--dark); border: 2px solid var(--border); }
                .btn-hero-secondary:hover { border-color: var(--red); color: var(--red); }
                .hero-trust { display: flex; align-items: center; gap: 12px; font-size: .82rem; color: var(--muted); font-weight: 600; }
                .trust-avatars { display: flex; }
                .trust-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; margin-right: -8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; }
                .hero-visual { position: relative; display: flex; justify-content: center; }
                .card-stack { position: relative; width: 320px; height: 420px; }
                .word-card { position: absolute; background: #fff; border-radius: 20px; border: 1.5px solid var(--border); padding: 24px; box-shadow: 0 8px 40px rgba(0,0,0,.1); }
                .wc-main { width: 300px; left: 10px; top: 20px; z-index: 3; animation: float 4s ease-in-out infinite; }
                .wc-back1 { width: 290px; left: 25px; top: 8px; z-index: 2; transform: rotate(3deg); opacity: .7; background: #FFF8F8; }
                .wc-back2 { width: 280px; left: 30px; top: 0; z-index: 1; transform: rotate(6deg); opacity: .45; background: #FFF3F3; }
                @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
                .wc-label { font-size: .7rem; color: var(--muted); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 10px; }
                .wc-word { font-size: 2rem; font-weight: 900; color: var(--dark); }
                .wc-pos { background: #F3F4F6; border-radius: 5px; padding: 2px 8px; font-size: .7rem; font-weight: 700; color: var(--muted); margin-left: 6px; }
                .wc-phonetic { font-size: .82rem; color: var(--red); margin: 6px 0 14px; }
                .wc-img { width: 100%; height: 130px; border-radius: 12px; background: linear-gradient(135deg, #FFF0F1, #FFE4E6); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; margin-bottom: 14px; }
                .wc-def { font-size: .82rem; color: var(--body); line-height: 1.6; background: #F9FAFB; border-radius: 10px; padding: 10px 12px; }
                .wc-actions { display: flex; gap: 8px; margin-top: 14px; }
                .wc-btn-no { flex: 1; padding: 9px; border-radius: 10px; border: 1.5px solid #FFCDD1; background: #FFF5F5; color: var(--red); font-weight: 700; font-size: .8rem; cursor: pointer; }
                .wc-btn-yes { flex: 1; padding: 9px; border-radius: 10px; background: var(--green); color: #fff; font-weight: 700; font-size: .8rem; border: none; cursor: pointer; }
                .float-badge { position: absolute; background: #fff; border-radius: 12px; padding: 10px 14px; border: 1.5px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,.08); font-size: .78rem; font-weight: 700; white-space: nowrap; z-index: 10; }
                .badge-streak { right: -20px; top: 30px; color: #FF6B00; }
                .badge-mastered { left: -30px; bottom: 60px; color: var(--green); }
                .badge-xp { right: -10px; bottom: 100px; color: var(--blue); }
                .stats-row { background: var(--dark); padding: 36px 24px; display: flex; justify-content: center; gap: 0; flex-wrap: wrap; }
                .stat-item { text-align: center; padding: 0 48px; border-right: 1px solid rgba(255,255,255,.1); }
                .stat-item:last-child { border-right: none; }
                .stat-n { font-size: 2.4rem; font-weight: 900; color: #fff; }
                .stat-n span { color: var(--red); }
                .stat-l { font-size: .8rem; color: rgba(255,255,255,.5); font-weight: 600; margin-top: 2px; }
                .exams-section { max-width: 1140px; margin: 0 auto; padding: 80px 24px; }
                .section-eyebrow { font-size: .75rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--red); margin-bottom: 10px; }
                .section-title { font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 900; color: var(--dark); line-height: 1.15; margin-bottom: 12px; }
                .section-sub { color: var(--muted); font-size: 1rem; line-height: 1.7; max-width: 500px; margin-bottom: 48px; }
                .exams-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
                .exam-card { background: #fff; border: 1.5px solid var(--border); border-radius: 16px; padding: 24px 20px; text-align: center; transition: all .25s; cursor: pointer; text-decoration: none; display: block; }
                .exam-card:hover { border-color: var(--red); transform: translateY(-3px); box-shadow: 0 10px 32px rgba(232,25,44,.1); }
                .exam-icon { font-size: 2rem; margin-bottom: 12px; }
                .exam-name { font-weight: 900; font-size: 1.05rem; color: var(--dark); margin-bottom: 4px; }
                .exam-words { font-size: .78rem; color: var(--muted); font-weight: 600; }
                .how-section { background: #fff; padding: 80px 24px; }
                .how-inner { max-width: 1140px; margin: 0 auto; }
                .how-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; margin-top: 56px; position: relative; }
                .how-step { background: var(--bg); border-radius: 20px; padding: 32px 24px; position: relative; border: 1.5px solid var(--border); }
                .how-step-num { width: 44px; height: 44px; border-radius: 50%; background: var(--red); color: #fff; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .how-step-icon { font-size: 1.8rem; margin-bottom: 12px; }
                .how-step h3 { font-weight: 900; font-size: 1.05rem; color: var(--dark); margin-bottom: 8px; }
                .how-step p { font-size: .88rem; color: var(--muted); line-height: 1.7; }
                .how-step-arrow { position: absolute; right: -20px; top: 50%; transform: translateY(-50%); color: var(--red); font-size: 1.4rem; font-weight: 900; z-index: 1; }
                .feat-section { max-width: 1140px; margin: 0 auto; padding: 80px 24px; }
                .feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .feat-card { background: #fff; border: 1.5px solid var(--border); border-radius: 20px; padding: 32px; transition: all .25s; }
                .feat-card:hover { border-color: var(--red); box-shadow: 0 8px 32px rgba(232,25,44,.08); }
                .feat-card.big { grid-row: span 2; }
                .feat-icon { width: 52px; height: 52px; border-radius: 14px; background: #FFF0F1; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px; }
                .feat-card h3 { font-weight: 900; font-size: 1.1rem; color: var(--dark); margin-bottom: 10px; }
                .feat-card p { font-size: .9rem; color: var(--muted); line-height: 1.7; }
                .feat-pill-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
                .feat-pill { background: #F3F4F6; border-radius: 8px; padding: 4px 12px; font-size: .78rem; font-weight: 700; color: var(--body); }
                .bangla-section { background: linear-gradient(135deg, #1C1B1F 0%, #2D1F2A 100%); padding: 80px 24px; color: #fff; }
                .bangla-inner { max-width: 1140px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
                .bangla-section .section-eyebrow { color: #FF8A94; }
                .bangla-section .section-title { color: #fff; }
                .bangla-section .section-sub { color: rgba(255,255,255,.55); }
                .bangla-card { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15); border-radius: 20px; padding: 28px; font-family: 'Hind Siliguri', sans-serif; }
                .bangla-word { font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
                .bangla-eng { font-size: 1rem; color: rgba(255,255,255,.6); margin-bottom: 16px; font-family: 'Nunito', sans-serif; }
                .bangla-def-label { font-size: .72rem; font-weight: 600; color: #FF8A94; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
                .bangla-def { font-size: .95rem; color: rgba(255,255,255,.8); line-height: 1.7; background: rgba(255,255,255,.05); border-radius: 10px; padding: 12px; margin-bottom: 16px; }
                .bangla-syn { display: flex; flex-wrap: wrap; gap: 6px; }
                .bangla-syn span { background: rgba(255,255,255,.1); border-radius: 6px; padding: 3px 10px; font-size: .78rem; color: rgba(255,255,255,.7); font-family: 'Nunito', sans-serif; }
                .bangla-perks { display: flex; flex-direction: column; gap: 14px; margin-top: 32px; }
                .bangla-perk { display: flex; align-items: flex-start; gap: 14px; }
                .perk-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--red); margin-top: 6px; flex-shrink: 0; }
                .perk-text { font-size: .9rem; color: rgba(255,255,255,.7); line-height: 1.6; }
                .perk-text strong { color: #fff; }
                .testi-section { max-width: 1140px; margin: 0 auto; padding: 80px 24px; }
                .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 56px; }
                .testi-card { background: #fff; border: 1.5px solid var(--border); border-radius: 20px; padding: 28px; transition: all .25s; }
                .testi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,.08); }
                .testi-stars { color: var(--yellow); font-size: 1rem; margin-bottom: 14px; }
                .testi-quote { font-size: .9rem; color: var(--body); line-height: 1.75; margin-bottom: 20px; font-style: italic; }
                .testi-person { display: flex; align-items: center; gap: 12px; }
                .testi-av { width: 42px; height: 42px; border-radius: 50%; background: var(--red); color: #fff; font-weight: 900; font-size: .9rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .testi-name { font-weight: 800; font-size: .88rem; color: var(--dark); }
                .testi-role { font-size: .76rem; color: var(--muted); }
                .pricing-section { background: #fff; padding: 80px 24px; }
                .pricing-inner { max-width: 900px; margin: 0 auto; }
                .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .price-card { border: 2px solid var(--border); border-radius: 20px; padding: 36px; background: #fff; position: relative; }
                .price-card.featured { border-color: var(--red); }
                .price-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--red); color: #fff; padding: 4px 18px; border-radius: 20px; font-size: .75rem; font-weight: 800; letter-spacing: .04em; white-space: nowrap; }
                .price-plan { font-weight: 900; font-size: 1.1rem; color: var(--dark); margin-bottom: 8px; }
                .price-amount { font-size: 2.8rem; font-weight: 900; color: var(--dark); margin-bottom: 4px; }
                .price-amount sub { font-size: 1rem; font-weight: 600; vertical-align: super; }
                .price-period { font-size: .82rem; color: var(--muted); margin-bottom: 24px; }
                .price-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
                .price-features li { font-size: .88rem; color: var(--body); display: flex; align-items: center; gap: 10px; }
                .price-features li::before { content: "✓"; color: var(--green); font-weight: 900; font-size: 1rem; }
                .price-features li.no::before { content: "✗"; color: #CBD5E1; }
                .price-features li.no { color: var(--muted); }
                .price-plan-tag { display: inline-block; background: #F0FDF4; color: #16A34A; border: 1.5px solid #BBF7D0; border-radius: 20px; font-size: .72rem; font-weight: 800; padding: 3px 12px; margin-bottom: 14px; letter-spacing: .04em; }
                .price-amount-alt { font-size: 1.6rem; font-weight: 900; color: var(--dark); margin-bottom: 4px; }
                .price-amount-alt strong { color: var(--red); }
                .pricing-reassurance { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 28px; margin-top: 32px; padding-top: 28px; border-top: 1.5px solid var(--border); }
                .pricing-reassurance span { font-size: .82rem; font-weight: 700; color: var(--muted); }
                .enroll-section { background: linear-gradient(135deg, #E8192C 0%, #9B111E 100%); padding: 80px 24px; }
                .enroll-inner { max-width: 700px; margin: 0 auto; }
                .enroll-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: #fff; text-align: center; margin-bottom: 10px; line-height: 1.15; }
                .enroll-sub { color: rgba(255,255,255,.75); text-align: center; font-size: 1rem; line-height: 1.7; margin-bottom: 40px; }
                .enroll-form { background: #fff; border-radius: 24px; padding: 40px; }
                .form-tabs { display: flex; gap: 0; margin-bottom: 28px; border-radius: 10px; overflow: hidden; border: 1.5px solid var(--border); }
                .form-tab { flex: 1; padding: 10px; text-align: center; font-weight: 800; font-size: .85rem; cursor: pointer; border: none; background: #F9FAFB; color: var(--muted); transition: all .2s; font-family: 'Nunito', sans-serif; }
                .form-tab.active { background: var(--red); color: #fff; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
                .fg label { font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
                .fg input, .fg select { border: 1.5px solid var(--border); border-radius: 10px; padding: 13px 14px; font-size: .95rem; font-family: 'Nunito', sans-serif; outline: none; transition: border-color .2s; color: var(--dark); background: #fff; -webkit-appearance: none; }
                .fg input:focus, .fg select:focus { border-color: var(--red); }
                .fg input::placeholder { color: #CBD5E1; }
                .goal-chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
                .goal-chip { padding: 9px 6px; border-radius: 9px; border: 1.5px solid var(--border); background: #F9FAFB; color: var(--muted); font-size: .75rem; font-weight: 700; cursor: pointer; text-align: center; transition: all .2s; font-family: 'Nunito', sans-serif; }
                .goal-chip.active, .goal-chip:hover { border-color: var(--red); background: #FFF0F1; color: var(--red); }
                .form-submit { width: 100%; padding: 16px; border-radius: 12px; background: var(--red); color: #fff; border: none; font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 900; cursor: pointer; margin-top: 8px; transition: all .2s; box-shadow: 0 4px 20px rgba(232,25,44,.3); }
                .form-submit:hover { background: var(--red2); transform: translateY(-1px); }
                .form-note { text-align: center; font-size: .75rem; color: var(--muted); margin-top: 12px; }
                .success-msg { text-align: center; padding: 24px 0; }
                .success-msg .s-icon { font-size: 3rem; margin-bottom: 12px; }
                .success-msg h3 { font-size: 1.5rem; font-weight: 900; color: var(--dark); margin-bottom: 8px; }
                .success-msg p { color: var(--muted); font-size: .9rem; margin-bottom: 20px; }
                /* ── App Screenshots Section ── */
                .screens-section { background: linear-gradient(180deg, #F8F9FC 0%, #fff 100%); padding: 90px 24px; }
                .screens-inner { margin: 0 auto; }
                .screens-header { text-align: center; margin-bottom: 40px; }
                .screens-header .section-sub { margin: 0 auto; max-width: 520px; }
                .screens-scroll-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-top: 30px; }
                .screens-scroll-wrapper::-webkit-scrollbar { height: 4px; }
                .screens-scroll-wrapper::-webkit-scrollbar-track { background: #F0F0F0; border-radius: 4px; }
                .screens-scroll-wrapper::-webkit-scrollbar-thumb { background: var(--red); border-radius: 4px; }
                .screens-track { display: flex; gap: 24px; align-items: center; justify-content: center; flex-wrap: nowrap; min-width: max-content; padding: 16px 4px 24px; }
                .screen-item { display: flex; flex-direction: column; align-items: center; gap: 14px; flex-shrink: 0; }
                .screen-item .phone-frame { transition: transform .35s ease, box-shadow .35s ease; cursor: pointer; }
                .screen-item .phone-frame:hover { transform: translateY(-14px) scale(1.04); box-shadow: 0 48px 96px rgba(232,25,44,.22), 0 0 0 2px var(--red) !important; }
                .screen-label { font-size: .76rem; font-weight: 800; color: var(--muted); letter-spacing: .05em; text-transform: uppercase; text-align: center; }
                .screen-label span { display: inline-block; background: #FFF0F1; color: var(--red); border-radius: 6px; padding: 3px 10px; }
                .screens-bottom-cta { text-align: center; margin-top: 60px; }
                .screens-bottom-cta p { color: var(--muted); font-size: .95rem; margin-bottom: 20px; }
                @media(max-width:900px) {
                    .screens-section { padding: 60px 0 60px; }
                    .screens-header { padding: 0 24px; }
                    .screens-scroll-wrapper { padding: 0 20px 16px; }
                    .screens-track { justify-content: flex-start; gap: 14px; padding: 16px 4px 20px; }
                    .screens-bottom-cta { padding: 0 24px; margin-top: 40px; }
                }
                /* ── end App Screenshots ── */
                .faq-section { max-width: 760px; margin: 0 auto; padding: 80px 24px; }
                .faq-item { border-bottom: 1.5px solid var(--border); }
                .faq-q { width: 100%; text-align: left; padding: 20px 0; font-weight: 800; font-size: .95rem; color: var(--dark); background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'Nunito', sans-serif; }
                .faq-icon { color: var(--red); font-size: 1.3rem; font-weight: 900; transition: transform .2s; }
                .faq-icon.open { transform: rotate(45deg); }
                .faq-a { display: none; padding: 0 0 20px; font-size: .9rem; color: var(--muted); line-height: 1.75; }
                .faq-a.open { display: block; }
                footer { background: var(--dark); color: rgba(255,255,255,.5); padding: 60px 24px 36px; }
                .footer-inner { max-width: 1140px; margin: 0 auto; }
                .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
                .footer-brand p { font-size: .85rem; line-height: 1.7; margin: 14px 0 20px; }
                .footer-heading { font-weight: 800; font-size: .85rem; text-transform: uppercase; letter-spacing: .08em; color: #fff; margin-bottom: 16px; }
                .footer-links-col { display: flex; flex-direction: column; gap: 10px; }
                .footer-links-col a { text-decoration: none; color: rgba(255,255,255,.5); font-size: .85rem; transition: color .2s; }
                .footer-links-col a:hover { color: #fff; }
                .footer-bottom { border-top: 1px solid rgba(255,255,255,.1); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: .8rem; flex-wrap: wrap; gap: 12px; }
                .footer-logo-text { font-weight: 900; font-size: 1.1rem; color: #fff; }
                .sr { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }
                .sr.vis { opacity: 1; transform: none; }
                @media(max-width:900px) {
                    nav { padding: 0 20px; }
                    .nav-menu-button { display: inline-flex; }
                    .nav-links { display: flex; position: fixed; top: 0; bottom: 0; left: 0; width: 280px; max-width: 80vw; background: #fff; flex-direction: column; gap: 0; padding-top: 84px; transform: translateX(-100%); border-right: 1px solid var(--border); box-shadow: 12px 0 36px rgba(0,0,0,.16); transition: transform .3s ease; z-index: 200; }
                    .nav-links.open { transform: translateX(0); }
                    .nav-links a { padding: 16px 20px; border-top: 1px solid #F3F4F6; }
                    .nav-links .nav-right-mobile { display: flex; }
                    .nav-right { display: none; }
                    .hero { grid-template-columns: 1fr; gap: 40px; padding: 60px 20px 40px; }
                    .hero-visual { display: none; }
                    .feat-grid { grid-template-columns: 1fr; }
                    .feat-card.big { grid-row: auto; }
                    .bangla-inner { grid-template-columns: 1fr; }
                    .pricing-grid { grid-template-columns: 1fr; }
                    .footer-top { grid-template-columns: 1fr 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                    .fg select { display: none; }
                    .nav-logo-mark { display: none; }
                    .mobile-hide { display: none; }
                    .stat-item { padding: 20px 28px; border-right: none; border-bottom: 1px solid rgba(255,255,255,.1); }
                }
            `}</style>

            {/* Topbar */}
            <div className="topbar">
                {text.topbar}
                <span>{text.freeToStart}</span>
            </div>

            {/* Nav */}
            <nav>
                <Link className="nav-logo" href="#">
                    <div className="nav-logo-mark">V</div>
                    <span className="nav-logo-text">
                        VocabPix
                        <sup>BETA</sup>
                    </span>
                </Link>
                <button
                    type="button"
                    className="nav-menu-button"
                    onClick={() => setMobileNavOpen((prev) => !prev)}
                    aria-expanded={mobileNavOpen}
                >
                    ☰
                </button>
                <div className={`nav-links${mobileNavOpen ? " open" : ""}`}>
                    <Link href="#exams" onClick={() => setMobileNavOpen(false)}>
                        {text.nav.wordLists}
                    </Link>
                    <Link
                        href="#features"
                        onClick={() => setMobileNavOpen(false)}
                    >
                        {text.nav.features}
                    </Link>
                    <Link
                        href="#bangla"
                        onClick={() => setMobileNavOpen(false)}
                    >
                        {text.nav.bangla}
                    </Link>
                    <Link
                        href="#pricing"
                        onClick={() => setMobileNavOpen(false)}
                    >
                        {text.nav.pricing}
                    </Link>
                    <Link href="#faq" onClick={() => setMobileNavOpen(false)}>
                        {text.nav.faq}
                    </Link>
                    <div className="nav-right-mobile">
                        <div className="lang-toggle-group">
                            <button
                                type="button"
                                className={`lang-toggle ${lang === "en" ? "active" : ""}`}
                                onClick={() => setLang("en")}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                className={`lang-toggle ${lang === "bn" ? "active" : ""}`}
                                onClick={() => setLang("bn")}
                            >
                                BN
                            </button>
                        </div>
                        <a
                            href="https://vocabpix.fluento.org"
                            className="btn-ghost"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {text.nav.login}
                        </a>
                        <Link
                            href="#enroll"
                            className="btn-red"
                            onClick={() => setMobileNavOpen(false)}
                        >
                            <span style={{ color: "#fff" }}>
                                {text.register} {text.freeText}
                            </span>
                        </Link>
                    </div>
                </div>
                <div
                    className={`nav-backdrop${mobileNavOpen ? " open" : ""}`}
                    onClick={() => setMobileNavOpen(false)}
                ></div>
                <div className="nav-right">
                    <div className="lang-toggle-group">
                        <button
                            type="button"
                            className={`lang-toggle ${lang === "en" ? "active" : ""}`}
                            onClick={() => setLang("en")}
                        >
                            EN
                        </button>
                        <button
                            type="button"
                            className={`lang-toggle ${lang === "bn" ? "active" : ""}`}
                            onClick={() => setLang("bn")}
                        >
                            BN
                        </button>
                    </div>
                    <a
                        href="https://vocabpix.fluento.org"
                        className="btn-ghost"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {text.nav.login}
                    </a>
                    <Link href="#enroll" className="btn-red">
                        {text.register}{" "}
                        <span className="mobile-hide">{text.freeText}</span>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section>
                <div className="hero">
                    <div className="hero-left">
                        <div className="hero-badge">
                            🔬 Scientific Vocabulary Learning
                        </div>
                        <h1>
                            {text.hero.title} <em>{text.hero.titleEm}</em> — in
                            Bangla &amp; English
                        </h1>
                        <p className="hero-sub">{text.hero.subtitle}</p>
                        <div className="hero-exam-tags">
                            <span className="exam-tag">📝 GRE</span>
                            <span className="exam-tag">🎓 IELTS</span>
                            <span className="exam-tag">📖 BCS</span>
                            <span className="exam-tag">💼 BBA</span>
                            <span className="exam-tag">🏥 Medical</span>
                            <span className="exam-tag">📐 SAT</span>
                        </div>
                        <div className="hero-actions">
                            <Link
                                href="#enroll"
                                className="btn-hero btn-hero-primary"
                            >
                                🚀 {text.hero.startLearning}
                            </Link>
                            <a
                                href="https://vocabpix.fluento.org"
                                className="btn-hero btn-hero-secondary"
                                target="_blank"
                                rel="noreferrer"
                            >
                                👀 {text.hero.exploreApp}
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
                                {text.hero.joined} <strong>5,000+</strong>{" "}
                                learners this month
                            </span>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="card-stack">
                            <div className="word-card wc-back2"></div>
                            <div className="word-card wc-back1"></div>
                            <div className="word-card wc-main">
                                <div className="wc-label">
                                    GRE Extended — Sub-List 2
                                </div>
                                <div>
                                    <span className="wc-word">acuity</span>
                                    <span className="wc-pos">noun</span>
                                </div>
                                <div className="wc-phonetic">
                                    uhk-YOO-uht-ee | অক·যউ·অট·ই
                                </div>
                                <div className="wc-img">🔬</div>
                                <div className="wc-def">
                                    Sharpness or keenness of thought, vision, or
                                    hearing
                                    <br />
                                    <em
                                        style={{
                                            fontSize: ".75rem",
                                            color: "#aaa",
                                        }}
                                    >
                                        চিন্তা বা দৃষ্টিশক্তির তীক্ষ্ণতা
                                    </em>
                                </div>
                                <div className="wc-actions">
                                    <button className="wc-btn-no">
                                        ✕ Don't Know
                                    </button>
                                    <button className="wc-btn-yes">
                                        ✓ I Know!
                                    </button>
                                </div>
                            </div>
                            <div className="float-badge badge-streak">
                                🔥 14-Day Streak
                            </div>
                            <div className="float-badge badge-mastered">
                                ✓ 340 Mastered
                            </div>
                            <div className="float-badge badge-xp">
                                ⚡ 1,250 XP
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-item">
                    <div className="stat-n">
                        10<span>K+</span>
                    </div>
                    <div className="stat-l">Curated Words</div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">122</div>
                    <div className="stat-l">Word Lists</div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">6</div>
                    <div className="stat-l">Exam Categories</div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">
                        95<span>%</span>
                    </div>
                    <div className="stat-l">Retention Rate</div>
                </div>
                <div className="stat-item">
                    <div className="stat-n">
                        5<span>K+</span>
                    </div>
                    <div className="stat-l">Active Learners</div>
                </div>
            </div>

            {/* Exams Section */}
            <section className="exams-section sr" id="exams">
                <div className="section-eyebrow">
                    📚 {text.sections.wordLists}
                </div>
                <h2 className="section-title">Curated for Your Exam Goal</h2>
                <p className="section-sub">
                    Whether it's GRE, IELTS, BCS, or everyday fluency — every
                    word list is organized, level-tagged, and ready to learn.
                </p>
                <div className="exams-grid">
                    {[
                        {
                            icon: "📘",
                            name: "GRE 332",
                            words: "17 Lists · 332 Words",
                        },
                        {
                            icon: "🎓",
                            name: "GRE Extended",
                            words: "23 Lists · 1,380 Words",
                        },
                        {
                            icon: "🌍",
                            name: "Oxford 3000",
                            words: "72 Lists · 3,000 Words",
                        },
                        {
                            icon: "🏛️",
                            name: "Academic Word List",
                            words: "10 Lists · 570 Words",
                        },
                        {
                            icon: "📝",
                            name: "IELTS Essentials",
                            words: "Coming Soon",
                        },
                        {
                            icon: "🏥",
                            name: "Medical Vocab",
                            words: "Coming Soon",
                        },
                    ].map((exam) => (
                        <a
                            key={exam.name}
                            className="exam-card"
                            href="https://vocabpix.fluento.org"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div className="exam-icon">{exam.icon}</div>
                            <div className="exam-name">{exam.name}</div>
                            <div className="exam-words">{exam.words}</div>
                        </a>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <div className="how-section">
                <div className="how-inner sr">
                    <div className="section-eyebrow">🗺️ How It Works</div>
                    <h2 className="section-title">
                        From Zero to Fluent in 4 Steps
                    </h2>
                    <p className="section-sub">
                        No complicated setup. Open the app and start in under 60
                        seconds.
                    </p>
                    <div className="how-steps">
                        {[
                            {
                                num: "1",
                                icon: "📋",
                                title: "Pick a List",
                                desc: "Choose GRE, Oxford 3000, Academic, or your own list. Each split into 60-word sub-lists.",
                                arrow: true,
                            },
                            {
                                num: "2",
                                icon: "🖼️",
                                title: "Learn with Images",
                                desc: "Each word card shows an image, pronunciation, Bangla definition, synonyms, antonyms & collocations.",
                                arrow: true,
                            },
                            {
                                num: "3",
                                icon: "🧠",
                                title: "Rate Your Memory",
                                desc: 'Tap "I Know" or "I Don\'t Know." Hard words resurface automatically. Track your mastered count.',
                                arrow: true,
                            },
                            {
                                num: "4",
                                icon: "🏆",
                                title: "Earn XP & Streak",
                                desc: "Daily sessions build your streak. Earn XP for sessions, mastered words, and completed lists.",
                                arrow: false,
                            },
                        ].map((step) => (
                            <div key={step.num} className="how-step">
                                <div className="how-step-num">{step.num}</div>
                                <div className="how-step-icon">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                                {step.arrow && (
                                    <div className="how-step-arrow">›</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features */}
            <section className="feat-section sr" id="features">
                <div className="section-eyebrow">
                    ✨ {text.sections.features}
                </div>
                <h2 className="section-title">
                    Everything You Need to Master Words
                </h2>
                <p className="section-sub">
                    Not flashcards. Not a dictionary. A complete vocabulary
                    system.
                </p>
                <div className="feat-grid">
                    <div className="feat-card big">
                        <div className="feat-icon">🖼️</div>
                        <h3>Picture-Memory Learning</h3>
                        <p>
                            Every word is anchored to a vivid, contextual image.
                            Visual memory increases retention by up to 65%
                            compared to plain text — your brain never forgets an
                            image it has truly seen.
                        </p>
                        <br />
                        <p>
                            Our image-word pairing engine ensures the picture
                            matches the word's meaning, tone, and usage — not
                            just a generic stock photo.
                        </p>
                        <div className="feat-pill-row">
                            <span className="feat-pill">
                                65% better retention
                            </span>
                            <span className="feat-pill">Contextual images</span>
                            <span className="feat-pill">Visual anchors</span>
                        </div>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">🔊</div>
                        <h3>Audio + Phonetic Pronunciation</h3>
                        <p>
                            Hear every word spoken aloud. Get phonetic spelling
                            in English and Bangla transliteration so you know
                            exactly how to say it.
                        </p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">🔄</div>
                        <h3>Synonyms, Antonyms &amp; Collocations</h3>
                        <p>
                            See how words connect — synonyms, antonyms, and real
                            sentence collocations so you learn words in context,
                            not in isolation.
                        </p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">⚡</div>
                        <h3>XP &amp; Gamified Streaks</h3>
                        <p>
                            Earn XP for sessions, mastered words, and completed
                            lists. Build daily streaks. Hit milestones. Stay
                            hooked on learning.
                        </p>
                    </div>
                    <div className="feat-card">
                        <div className="feat-icon">📝</div>
                        <h3>Custom Word Collections</h3>
                        <p>
                            Add any word you encounter — in class, reading, or
                            exams. Build personal lists and practice them
                            anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bangla Section */}
            <div className="bangla-section">
                <div className="bangla-inner sr" id="bangla">
                    <div>
                        <div className="section-eyebrow">
                            🇧🇩 {text.sections.bangla}
                        </div>
                        <h2 className="section-title" style={{ color: "#fff" }}>
                            শিখুন বাংলায়,
                            <br />
                            জিতুন ইংরেজিতে
                        </h2>
                        <p className="section-sub">
                            The only vocabulary app built with Bengali learners
                            in mind — definitions, pronunciation guides, and
                            memory cues all available in Bangla.
                        </p>
                        <div className="bangla-perks">
                            <div className="bangla-perk">
                                <div className="perk-dot"></div>
                                <div className="perk-text">
                                    <strong>Bangla definitions</strong> —
                                    understand word meaning in your native
                                    language first, then internalize the
                                    English.
                                </div>
                            </div>
                            <div className="bangla-perk">
                                <div className="perk-dot"></div>
                                <div className="perk-text">
                                    <strong>Bengali phonetic guide</strong> —
                                    every word has a Bangla script pronunciation
                                    (অক·যউ·অট·ই) so you say it correctly from
                                    day one.
                                </div>
                            </div>
                            <div className="bangla-perk">
                                <div className="perk-dot"></div>
                                <div className="perk-text">
                                    <strong>Exam-focused lists</strong> — GRE,
                                    IELTS, BCS, BBA, SAT and Medical words used
                                    in Bangladesh's top competitive exams.
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
                            <div className="bangla-def-label">বাংলা সংজ্ঞা</div>
                            <div className="bangla-def">
                                চিন্তাশক্তি, দৃষ্টিশক্তি বা শ্রবণশক্তির
                                তীক্ষ্ণতা বা প্রখরতা। কোনো বিষয়কে স্পষ্ট ও
                                সূক্ষ্মভাবে বোঝার ক্ষমতা।
                            </div>
                            <div className="bangla-def-label">সমার্থক শব্দ</div>
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
                <div className="section-eyebrow">💬 Reviews</div>
                <h2 className="section-title">Learners Love VocabPix</h2>
                <p className="section-sub">
                    Real feedback from real students — from Dhaka to diaspora.
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
                                    GRE Prep · scored 162 Verbal
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
                                    University Student · Dhaka
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
                                    English Teacher · Chittagong
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
                            💳 {text.sections.pricing}
                        </div>
                        <h2
                            className="section-title"
                            style={{ textAlign: "center" }}
                        >
                            Simple, Honest Pricing
                        </h2>
                        <p
                            className="section-sub"
                            style={{ margin: "0 auto", textAlign: "center" }}
                        >
                            {text.pricingSubtitle}
                        </p>
                    </div>
                    <div className="pricing-grid">
                        {/* Free App */}
                        <div className="price-card">
                            <div className="price-plan-tag">🎉 Always Free</div>
                            <div className="price-plan">The App</div>
                            <div className="price-amount">
                                <sub>৳</sub>0
                            </div>
                            <div className="price-period">
                                Forever — no subscription ever
                            </div>
                            <ul className="price-features">
                                <li>Image + audio for every word</li>
                                <li>Bangla definitions &amp; phonetics</li>
                                <li>XP &amp; streak tracking</li>
                                <li>Quiz &amp; exercise modes</li>
                                <li>Custom word collections</li>
                                <li>Streak freeze protection</li>
                                <li>Offline mode</li>
                                <li>Ad-free experience</li>
                            </ul>
                            <a
                                href="#enroll"
                                className="btn-ghost"
                                style={{
                                    display: "block",
                                    textAlign: "center",
                                    padding: "13px",
                                }}
                            >
                                Get Started Free →
                            </a>
                        </div>
                        {/* Wordlist Packs */}
                        <div className="price-card featured">
                            <div className="price-badge">
                                📚 One-Time Purchase
                            </div>
                            <div className="price-plan">Wordlist Packs</div>
                            <div className="price-amount-alt">
                                From <strong>৳49</strong>
                            </div>
                            <div className="price-period">
                                Pay once · yours forever
                            </div>
                            <ul className="price-features">
                                <li>
                                    GRE 332 Core — <strong>৳499</strong>
                                </li>
                                <li>
                                    GRE Extended — <strong>৳499</strong>
                                </li>
                                <li>
                                    IELTS Academic — <strong>৳399</strong>
                                </li>
                                <li>
                                    Oxford 3000 — <strong>৳209</strong>
                                </li>
                                <li>
                                    BCS English — <strong>৳279</strong>
                                </li>
                                <li>
                                    Medical Vocabulary — <strong>৳399</strong>
                                </li>
                                <li>
                                    Academic Word List — <strong>৳299</strong>
                                </li>
                            </ul>
                            <a
                                href="#exams"
                                className="btn-red"
                                style={{
                                    display: "block",
                                    textAlign: "center",
                                    padding: "13px",
                                    borderRadius: "12px",
                                    fontSize: ".95rem",
                                }}
                            >
                                Browse All Wordlists →
                            </a>
                        </div>
                    </div>
                    {/* Reassurance strip */}
                    <div className="pricing-reassurance">
                        <span>✅ No subscription</span>
                        <span>✅ No hidden fees</span>
                        <span>✅ Keep your lists forever</span>
                        <span>✅ Free trial words in every list</span>
                    </div>
                </div>
            </div>

            {/* Enroll / Register Section */}
            <div className="enroll-section" id="enroll">
                <div className="enroll-inner sr">
                    <h2 className="enroll-title">{text.enrollTitle}</h2>
                    <p className="enroll-sub">{text.enrollSub}</p>
                    <div className="enroll-form">
                        {!showSuccess ? (
                            <div id="form-body">
                                {/* Tabs */}
                                <div className="form-tabs">
                                    <button
                                        className={`form-tab ${activeTab === "register" ? "active" : ""}`}
                                        onClick={() => setActiveTab("register")}
                                    >
                                        Register
                                    </button>
                                    <button
                                        className={`form-tab ${activeTab === "login" ? "active" : ""}`}
                                        onClick={() => setActiveTab("login")}
                                    >
                                        Login
                                    </button>
                                </div>

                                {/* Register Tab */}
                                {activeTab === "register" && (
                                    <div id="tab-register">
                                        <div className="form-row">
                                            <div className="fg">
                                                <label>First Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Your name"
                                                    value={form.fn}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            fn: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="fg">
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Last name"
                                                    value={form.ln}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            ln: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="fg">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={form.em}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        em: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="fg">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                placeholder="Min. 6 characters"
                                                value={form.pw}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        pw: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="fg">
                                            <label>Your Learning Goal</label>
                                            <div className="goal-chips">
                                                {goalChips.map((chip) => (
                                                    <button
                                                        key={chip}
                                                        className={`goal-chip ${activeChips.includes(chip) ? "active" : ""}`}
                                                        onClick={() =>
                                                            toggleChip(chip)
                                                        }
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="fg">
                                            <label>Daily Word Target</label>
                                            <select
                                                value={form.dg}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        dg: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Choose daily goal...
                                                </option>
                                                <option>
                                                    20 words/day — Casual
                                                </option>
                                                <option>
                                                    40 words/day — Steady
                                                </option>
                                                <option>
                                                    60 words/day — Intensive
                                                </option>
                                                <option>
                                                    80+ words/day — Expert
                                                </option>
                                            </select>
                                        </div>
                                        <button
                                            className="form-submit"
                                            onClick={doRegister}
                                        >
                                            🚀 Create Free Account
                                        </button>
                                    </div>
                                )}

                                {/* Login Tab */}
                                {activeTab === "login" && (
                                    <div id="tab-login">
                                        <div className="fg">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <div className="fg">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                placeholder="Your password"
                                            />
                                        </div>
                                        <button
                                            className="form-submit"
                                            onClick={() =>
                                                window.open(
                                                    "https://vocabpix.fluento.org",
                                                    "_blank",
                                                )
                                            }
                                        >
                                            Login to VocabPix →
                                        </button>
                                        <p
                                            className="form-note"
                                            style={{ marginTop: "12px" }}
                                        >
                                            No account?{" "}
                                            <a
                                                href="#"
                                                onClick={switchToRegister}
                                                style={{
                                                    color: "var(--red)",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Register free
                                            </a>
                                        </p>
                                    </div>
                                )}

                                <p className="form-note">
                                    No credit card needed. Free forever on core
                                    features.
                                </p>
                            </div>
                        ) : (
                            <div className="success-msg">
                                <div className="s-icon">🎉</div>
                                <h3>Welcome to VocabPix!</h3>
                                <p>
                                    Your account is ready. Check your email to
                                    verify and start learning.
                                </p>
                                <a
                                    href="https://vocabpix.fluento.org"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-red"
                                    style={{
                                        display: "inline-block",
                                        padding: "14px 28px",
                                        borderRadius: "12px",
                                    }}
                                >
                                    Open VocabPix App →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* App Screenshots */}
            <section className="screens-section sr" id="screenshots">
                <div className="screens-inner">
                    <div className="screens-header">
                        <div className="section-eyebrow">
                            📱 See It In Action
                        </div>
                        <h2 className="section-title">
                            Everything You Need, In One App
                        </h2>
                        <p className="section-sub">
                            From your daily dashboard to image-powered word
                            cards, quizzes, and curated word lists — VocabPix
                            keeps learning engaging every step of the way.
                        </p>
                    </div>

                    <div className="screens-scroll-wrapper">
                        <div className="screens-track">
                            {/* Screen 1 — Dashboard */}
                            <div className="screen-item">
                                <Phone
                                    src={dashboardImg}
                                    alt="VocabPix Dashboard"
                                />
                                <div className="screen-label">
                                    <span>Dashboard</span>
                                </div>
                            </div>

                            {/* Screen 2 — Word Card */}
                            <div className="screen-item">
                                <Phone
                                    src={exerciseImg}
                                    alt="Word Exercise Card"
                                />
                                <div className="screen-label">
                                    <span>Word Card</span>
                                </div>
                            </div>

                            {/* Screen 3 — Full Definition */}
                            <div className="screen-item">
                                <Phone
                                    src={exerciseImg2}
                                    alt="Word Definition & Collocations"
                                />
                                <div className="screen-label">
                                    <span>Full Definition</span>
                                </div>
                            </div>

                            {/* Screen 4 — Quiz */}
                            <div className="screen-item">
                                <Phone src={quizImg} alt="Synonym Quiz" />
                                <div className="screen-label">
                                    <span>Quiz Mode</span>
                                </div>
                            </div>

                            {/* Screen 5 — Word Lists */}
                            <div className="screen-item">
                                <Phone src={wordlistImg} alt="Word Lists" />
                                <div className="screen-label">
                                    <span>Word Lists</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="screens-bottom-cta">
                        <p>Ready to experience it yourself?</p>
                        <Link
                            href="#enroll"
                            className="btn-red"
                            style={{
                                display: "inline-block",
                                padding: "14px 32px",
                                borderRadius: "12px",
                                fontSize: "1rem",
                            }}
                        >
                            🚀 Get Started Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq-section sr" id="faq">
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <div
                        className="section-eyebrow"
                        style={{ textAlign: "center" }}
                    >
                        ❓ FAQ
                    </div>
                    <h2
                        className="section-title"
                        style={{ textAlign: "center" }}
                    >
                        Common Questions
                    </h2>
                </div>
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <button
                            className="faq-q"
                            onClick={() => toggleFaq(index)}
                        >
                            {faq.q}
                            <span
                                className={`faq-icon ${openFaqs.includes(index) ? "open" : ""}`}
                            >
                                +
                            </span>
                        </button>
                        <div
                            className={`faq-a ${openFaqs.includes(index) ? "open" : ""}`}
                        >
                            {faq.a}
                        </div>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-inner">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="footer-logo-text">🔴 VocabPix</div>
                            <p>
                                A Fluento product · Learn vocabulary the fast
                                and proven way — both in Bangla and English.
                                Built for GRE, IELTS, BCS, BBA, Medical, and SAT
                                learners.
                            </p>
                            <a
                                href="https://vocabpix.fluento.org"
                                target="_blank"
                                rel="noreferrer"
                                className="btn-red"
                                style={{
                                    display: "inline-block",
                                    padding: "10px 20px",
                                    fontSize: ".85rem",
                                }}
                            >
                                Open App →
                            </a>
                        </div>
                        <div>
                            <div className="footer-heading">Word Lists</div>
                            <div className="footer-links-col">
                                <a href="#">GRE 332</a>
                                <a href="#">GRE Extended</a>
                                <a href="#">Oxford 3000</a>
                                <a href="#">Academic Word List</a>
                            </div>
                        </div>
                        <div>
                            <div className="footer-heading">Product</div>
                            <div className="footer-links-col">
                                <a href="#">Features</a>
                                <Link href="#pricing">Pricing</Link>
                                <a href="#">Quiz Mode</a>
                                <a href="#">XP Shop</a>
                            </div>
                        </div>
                        <div>
                            <div className="footer-heading">Company</div>
                            <div className="footer-links-col">
                                <a href="#">About Fluento</a>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms</a>
                                <a href="#">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span>© 2026 Fluento. All rights reserved.</span>
                        <span>Made with ❤️ for Bangladeshi learners</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
