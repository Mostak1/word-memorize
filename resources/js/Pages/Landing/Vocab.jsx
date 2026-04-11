import { Link, Head } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import dashboardImg from "/public/img/landing/dashboard.webp";
import exerciseImg from "/public/img/landing/exercise.webp";
import exerciseImg2 from "/public/img/landing/exercise2.webp";
import wordlistImg from "/public/img/landing/wordlist.webp";
import quizImg from "/public/img/landing/quiz.webp";
import logo from "/public/img/logo.png";

// ── Icons ──────────────────────────────────────────────────────────────────
const Ico = {
    menu: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-6 h-6"
        >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    x: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-6 h-6"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    arrow: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
        >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    check: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    img: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
        >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    brain: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
        >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14Z" />
        </svg>
    ),
    zap: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    trophy: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    ),
    list: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
        >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    ),
    book: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    star: (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-yellow-400"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    lock: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    play: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    ),
    phone: (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
        >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    ),
};

// ── Animated counter ───────────────────────────────────────────────────────
function Counter({ end, suffix = "", decimal = false }) {
    const [n, setN] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting && !started.current) {
                    started.current = true;
                    const t0 = performance.now();
                    const tick = (now) => {
                        const p = Math.min((now - t0) / 1800, 1);
                        const ease = 1 - Math.pow(1 - p, 3);
                        setN(
                            decimal
                                ? +(ease * end).toFixed(1)
                                : Math.floor(ease * end),
                        );
                        if (p < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.5 },
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [end]);
    return (
        <span ref={ref}>
            {decimal ? n.toFixed(1) : n.toLocaleString()}
            {suffix}
        </span>
    );
}

// ── Phone frame component ──────────────────────────────────────────────────
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
                className="phone-inner"
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

// ── Wordlist card ──────────────────────────────────────────────────────────
function WordlistCard({ title, words, level, price, locked, featured }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "16px",
                border: featured ? "2px solid #e70013" : "1px solid #E5E7EB",
                padding: "24px",
                position: "relative",
                transition: "all 0.25s",
                cursor: locked ? "default" : "pointer",
                boxShadow: featured ? "0 8px 32px rgba(231,0,19,0.15)" : "none",
            }}
        >
            {featured && (
                <div
                    style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#e70013",
                        color: "#fff",
                        padding: "4px 16px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        letterSpacing: "0.05em",
                    }}
                >
                    MOST POPULAR
                </div>
            )}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 800,
                            fontSize: "1.05rem",
                            color: "#0F0F0F",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            fontSize: "0.82rem",
                            color: "#6B7280",
                            marginTop: "4px",
                            fontWeight: 600,
                        }}
                    >
                        {words} words · {level}
                    </div>
                </div>
                {locked ? (
                    <div style={{ color: "#9CA3AF" }}>{Ico.lock}</div>
                ) : (
                    <div
                        style={{
                            background: "#FEE2E2",
                            color: "#e70013",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            fontWeight: 800,
                        }}
                    >
                        {price}
                    </div>
                )}
            </div>
            <div
                style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                }}
            >
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        style={{
                            width: "100%",
                            height: "4px",
                            borderRadius: "2px",
                            background: locked
                                ? "#E5E7EB"
                                : i === 1
                                  ? "#e70013"
                                  : i <= 2
                                    ? "#FCA5A5"
                                    : "#E5E7EB",
                            flex: 1,
                        }}
                    />
                ))}
            </div>
            {locked ? (
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "0.85rem",
                        color: "#9CA3AF",
                        fontWeight: 600,
                        padding: "8px 0",
                    }}
                >
                    Complete previous list to unlock
                </div>
            ) : (
                <button
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: featured ? "#e70013" : "#0F0F0F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontFamily: "Nunito, sans-serif",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                    }}
                >
                    {Ico.play} Purchase & Start
                </button>
            )}
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Welcome({ auth }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const features = [
        {
            icon: Ico.img,
            color: "#e70013",
            bg: "#FEE2E2",
            title: "Image-Word Pairing",
            desc: "Every word comes with a vivid contextual image and a real-life sentence, burning it into visual memory naturally.",
        },
        {
            icon: Ico.brain,
            color: "#7C3AED",
            bg: "#EDE9FE",
            title: "Deep Word Intelligence",
            desc: "Definitions, phonetics, Bangla meanings, synonyms, antonyms, and collocations — all in one clean card.",
        },
        {
            icon: Ico.list,
            color: "#0369A1",
            bg: "#E0F2FE",
            title: "Curated Word Lists",
            desc: "From Academic Word List to IELTS, GRE, BCS — purchase only the lists you need. No subscription ever.",
        },
        {
            icon: Ico.trophy,
            color: "#D97706",
            bg: "#FEF3C7",
            title: "Track Mastery",
            desc: 'Mark words as "I Know" or "I Don\'t Know". Revisit weak words. Watch your mastered count grow every day.',
        },
        {
            icon: Ico.zap,
            color: "#059669",
            bg: "#D1FAE5",
            title: "Instant Quiz Mode",
            desc: 'Interactive exercises with "I Know" / "I Don\'t Know" feedback loop, perfectly tuned for active recall.',
        },
        {
            icon: Ico.book,
            color: "#e70013",
            bg: "#FEE2E2",
            title: "Bookmark & Review Later",
            desc: "Save tricky words with a tap. Review your personal bookmark list anytime — even without internet.",
        },
    ];

    const wordlists = [
        {
            title: "Academic Word List — Sublist 1",
            words: 60,
            level: "Intermediate",
            price: "Free",
            locked: false,
            featured: false,
        },
        {
            title: "Academic Word List — Sublist 2",
            words: 60,
            level: "Intermediate",
            price: "$1.99",
            locked: false,
            featured: true,
        },
        {
            title: "Academic Word List — Sublist 3",
            words: 60,
            level: "Intermediate",
            price: "$1.99",
            locked: false,
            featured: false,
        },
        {
            title: "IELTS Essential Vocabulary",
            words: 200,
            level: "Advanced",
            price: "$2.99",
            locked: false,
            featured: false,
        },
        {
            title: "GRE High-Frequency Words",
            words: 250,
            level: "Advanced",
            price: "$3.99",
            locked: false,
            featured: false,
        },
        {
            title: "BCS English Vocabulary",
            words: 300,
            level: "Advanced",
            price: "$2.99",
            locked: false,
            featured: false,
        },
    ];

    const testimonials = [
        {
            name: "Ayesha R.",
            role: "IELTS Candidate",
            text: "The image-based learning is a game-changer. I hit band 8.0 vocabulary after just 3 weeks with VocabPix.",
            avatar: "👩",
        },
        {
            name: "Tanvir H.",
            role: "University Student",
            text: "No subscription — I just bought the Academic Word List and studied at my own pace. Brilliant model.",
            avatar: "👨‍🎓",
        },
        {
            name: "Sabrina M.",
            role: "BCS Aspirant",
            text: "Collocations and synonyms all in one place. VocabPix saved me hours of dictionary-hopping every day.",
            avatar: "👩‍💼",
        },
    ];

    return (
        <>
            <Head title="VocabPix — Visual Vocabulary by Fluento">
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link
                    rel="icon"
                    href="/icons/icon-192x192.png"
                    type="image/png"
                />
            </Head>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --red: #e70013;
          --red-dark: #b50010;
          --black: #000000;
          --charcoal: #373737;
          --cream: #f3eee4;
          --ink: #0F0F0F;
          --ink-light: #555;
          --border: #E5E7EB;
          --white: #fff;
          --r: 16px;
          --sec-pad: clamp(56px, 8vw, 100px);
          --h-pad: clamp(16px, 5vw, 80px);
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Nunito', sans-serif; color: var(--ink); background: #fff; overflow-x: hidden; }
        a { text-decoration: none; }
        img { max-width: 100%; }

        /* ── NAV ── */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; display: flex; align-items: center; justify-content: space-between; padding: 0 var(--h-pad); height: 68px; transition: all 0.3s; }
        .nav.scrolled { background: rgba(255,255,255,0.96); backdrop-filter: blur(16px); box-shadow: 0 2px 20px rgba(0,0,0,0.1); border-bottom: 1px solid var(--border); }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-text { font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800; color: var(--ink); }
        .nav-logo-badge { background: var(--red); color: #fff; font-size: 0.6rem; font-weight: 800; padding: 3px 7px; border-radius: 4px; letter-spacing: 0.04em; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { font-weight: 700; color: var(--ink-light); font-size: 0.95rem; transition: color 0.2s; }
        .nav-links a:hover { color: var(--red); }
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .btn-outline { padding: 9px 20px; border: 2px solid var(--border); border-radius: 100px; font-weight: 700; font-size: 0.88rem; color: var(--ink); background: transparent; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.2s; display: inline-flex; }
        .btn-outline:hover { border-color: var(--red); color: var(--red); }
        .btn-red { padding: 9px 20px; background: var(--red); border: 2px solid var(--red); border-radius: 100px; font-weight: 800; font-size: 0.88rem; color: #fff; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-red:hover { background: var(--red-dark); border-color: var(--red-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(231,0,19,0.35); }
        .mob-btn { display: none; background: none; border: none; cursor: pointer; color: var(--ink); padding: 6px; }
        .mob-menu { display: none; }

        /* ── HERO ── */
        .hero {
          padding: 100px var(--h-pad) 0;
          background: linear-gradient(160deg, #fff 0%, var(--cream) 60%, #fff 100%);
          overflow: hidden; position: relative; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; width: 100%; max-width: 1100px; }
        .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: #FEE2E2; color: var(--red); border-radius: 100px; padding: 7px 16px; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 1.5rem; border: 1px solid #FECACA; }
        .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.8rem); font-weight: 800; line-height: 1.07; color: var(--ink); }
        .hero-title .red { color: var(--red); }
        .hero-sub { margin-top: 1.25rem; font-size: clamp(0.95rem, 2vw, 1.1rem); color: var(--ink-light); line-height: 1.7; max-width: 460px; }
        .hero-free-badge { display: inline-flex; align-items: center; gap: 10px; margin-top: 2rem; background: #fff; border: 2px solid var(--red); border-radius: 14px; padding: 14px 20px; }
        .hero-free-label { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; color: var(--red); }
        .hero-free-sub { font-size: 0.82rem; color: var(--ink-light); font-weight: 600; }
        .hero-actions { display: flex; gap: 14px; margin-top: 2rem; flex-wrap: wrap; }
        .btn-hero-red { display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; background: var(--red); color: #fff; border-radius: 100px; font-weight: 800; font-size: 1rem; border: 2px solid var(--red); transition: all 0.25s; box-shadow: 0 8px 24px rgba(231,0,19,0.3); font-family: 'Nunito', sans-serif; }
        .btn-hero-red:hover { background: var(--red-dark); transform: translateY(-3px); box-shadow: 0 14px 36px rgba(231,0,19,0.4); }
        .btn-hero-dark { display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; background: var(--black); color: #fff; border-radius: 100px; font-weight: 800; font-size: 1rem; border: 2px solid var(--black); transition: all 0.25s; font-family: 'Nunito', sans-serif; }
        .btn-hero-dark:hover { background: var(--charcoal); transform: translateY(-3px); }
        .hero-stats { display: flex; gap: 2rem; margin-top: 2.5rem;  margin-bottom: 2.5rem; padding-top: 2.5rem; border-top: 1px solid var(--border); flex-wrap: wrap; }
        .hero-stat-n { font-family: 'Syne', sans-serif; font-size: 1.7rem; font-weight: 800; color: var(--red); }
        .hero-stat-l { font-size: 0.82rem; font-weight: 700; color: var(--ink-light); }
        .hero-phones { position: relative; display: flex; justify-content: center; align-items: flex-end; gap: 16px; padding-bottom: 0; }

        /* ── RED STRIP ── */
        .red-strip { background: var(--red); color: #fff; padding: clamp(40px, 6vw, 56px) var(--h-pad); display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; max-width: 100%; }
        .strip-stat { text-align: center; }
        .strip-stat-n { font-family: 'Syne', sans-serif; font-size: clamp(1.6rem, 3.5vw, 2.8rem); font-weight: 800; }
        .strip-stat-l { font-size: 0.82rem; opacity: 0.8; margin-top: 4px; font-weight: 700; }

        /* ── SECTION ── */
        .sec { padding: var(--sec-pad) var(--h-pad); max-width: 1200px; margin: 0 auto; }
        .sec-full { padding: var(--sec-pad) var(--h-pad); }
        .sec-tag { display: inline-block; background: #FEE2E2; color: var(--red); padding: 5px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; }
        .sec-title { font-family: 'Syne', sans-serif; font-size: clamp(1.6rem, 3.2vw, 2.6rem); font-weight: 800; color: var(--ink); line-height: 1.15; }
        .sec-sub { font-size: 1.05rem; color: var(--ink-light); line-height: 1.7; max-width: 540px; margin-top: 0.75rem; }

        /* ── FEATURES GRID ── */
        .feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 20px; margin-top: 3rem; }
        .feat-card { background: #fff; border: 1px solid var(--border); border-radius: 18px; padding: 28px; transition: all 0.3s; }
        .feat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.09); border-color: transparent; }
        .feat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; flex-shrink: 0; }
        .feat-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem; color: var(--ink); margin-bottom: 0.6rem; }
        .feat-desc { font-size: 0.9rem; color: var(--ink-light); line-height: 1.65; }

        /* ── APP PREVIEW ── */
        .preview-section { background: var(--cream); }
        .preview-inner { max-width: 1200px; margin: 0 auto; padding: var(--sec-pad) var(--h-pad); }
        .preview-tabs { display: flex; gap: 8px; margin-top: 2.5rem; flex-wrap: wrap; }
        .preview-tab { padding: 9px 20px; border-radius: 100px; border: 2px solid var(--border); font-weight: 700; font-size: 0.88rem; cursor: pointer; background: #fff; color: var(--ink-light); transition: all 0.2s; font-family: 'Nunito', sans-serif; white-space: nowrap; }
        .preview-tab.active { background: var(--red); border-color: var(--red); color: #fff; }
        .preview-phones { display: flex; justify-content: center; gap: 24px; margin-top: 3rem; flex-wrap: wrap; align-items: flex-end; }

        /* ── HOW IT WORKS ── */
        .hiw-bg { background: var(--black); color: #fff; }
        .hiw-inner { max-width: 1200px; margin: 0 auto; padding: var(--sec-pad) var(--h-pad); }
        .hiw-bg .sec-tag { background: rgba(231,0,19,0.2); }
        .hiw-bg .sec-title { color: #fff; }
        .hiw-bg .sec-sub { color: rgba(255,255,255,0.6); }
        .hiw-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 20px; margin-top: 3rem; }
        .hiw-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 28px; transition: all 0.3s; }
        .hiw-card:hover { background: rgba(231,0,19,0.12); border-color: rgba(231,0,19,0.4); transform: translateY(-5px); }
        .hiw-num { font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 800; color: var(--red); letter-spacing: 0.1em; margin-bottom: 1rem; }
        .hiw-emoji { font-size: 2.4rem; margin-bottom: 1rem; }
        .hiw-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem; color: #fff; margin-bottom: 0.6rem; }
        .hiw-desc { font-size: 0.88rem; color: rgba(255,255,255,0.6); line-height: 1.65; }

        /* ── PRICING ── */
        .pricing-bg { background: #FAFAFA; }
        .pricing-notice { max-width: 560px; margin: 1rem auto 0; text-align: center; background: #FEE2E2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px 20px; font-size: 0.9rem; color: var(--red); font-weight: 700; }
        .wl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 20px; margin-top: 2.5rem; }

        /* ── SCREENSHOTS SHOWCASE ── */
        .showcase-bg { background: var(--charcoal); }
        .showcase-inner { max-width: 1200px; margin: 0 auto; padding: var(--sec-pad) 12px; }
        .showcase-bg .sec-tag { background: rgba(231,0,19,0.25); }
        .showcase-bg .sec-title { color: #fff; }
        .showcase-bg .sec-sub { color: rgba(255,255,255,0.6); }
        .showcase-phones { display: flex; gap: 12px; margin-top: 3rem; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; justify-content: center; }
        .showcase-phones::-webkit-scrollbar { height: 4px; }
        .showcase-phones::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .showcase-phones::-webkit-scrollbar-thumb { background: var(--red); border-radius: 2px; }

        /* ── TESTIMONIALS ── */
        .test-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(270px, 100%), 1fr)); gap: 20px; margin-top: 3rem; }
        .test-card { background: #fff; border: 1px solid var(--border); border-radius: 18px; padding: 28px; transition: all 0.3s; }
        .test-card:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(0,0,0,0.08); }
        .test-stars { display: flex; gap: 3px; margin-bottom: 1rem; }
        .test-quote { font-size: 0.95rem; color: var(--ink-light); line-height: 1.7; margin-bottom: 1.25rem; font-style: italic; }
        .test-author { display: flex; align-items: center; gap: 12px; }
        .test-avatar { width: 42px; height: 42px; background: linear-gradient(135deg, var(--red), #ff6b6b); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
        .test-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; color: var(--ink); }
        .test-role { font-size: 0.8rem; color: var(--ink-light); font-weight: 600; }

        /* ── CTA ── */
        .cta-bg { background: linear-gradient(135deg, var(--red) 0%, #b50010 100%); color: #fff; text-align: center; padding: var(--sec-pad) var(--h-pad); position: relative; overflow: hidden; }
        .cta-bg::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 60%); pointer-events: none; }
        .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(1.6rem, 3.5vw, 2.8rem); font-weight: 800; position: relative; }
        .cta-sub { font-size: 1.05rem; opacity: 0.9; margin: 1rem auto 0; max-width: 460px; position: relative; }
        .cta-free { display: inline-flex; align-items: center; gap: 10px; margin-top: 1.5rem; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 12px; padding: 12px 20px; font-weight: 700; font-size: 0.9rem; position: relative; }
        .cta-actions { display: flex; justify-content: center; gap: 14px; margin-top: 2.5rem; flex-wrap: wrap; position: relative; }
        .btn-white { display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; background: #fff; color: var(--red); border-radius: 100px; font-weight: 800; font-size: 1rem; transition: all 0.25s; font-family: 'Nunito', sans-serif; border: 2px solid #fff; }
        .btn-white:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
        .btn-woutline { display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; background: transparent; color: #fff; border-radius: 100px; font-weight: 800; font-size: 1rem; border: 2px solid rgba(255,255,255,0.5); transition: all 0.25s; font-family: 'Nunito', sans-serif; }
        .btn-woutline:hover { background: rgba(255,255,255,0.15); transform: translateY(-3px); }

        /* ── FLUENTO BAR ── */
        .fluento-bar { background: var(--black); padding: 20px var(--h-pad); display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; }
        .fluento-bar-text { color: rgba(255,255,255,0.5); font-size: 0.85rem; font-weight: 600; }
        .fluento-bar-link { color: #fff; font-weight: 800; font-size: 0.9rem; transition: color 0.2s; }
        .fluento-bar-link:hover { color: var(--red); }

        /* ── FOOTER ── */
        .footer { background: var(--black); color: rgba(255,255,255,0.55); padding: clamp(40px, 6vw, 60px) var(--h-pad) 32px; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
        .footer-logo-text { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 800; color: #fff; }
        .footer-desc { font-size: 0.88rem; line-height: 1.7; max-width: 260px; }
        .footer-col-h { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.9rem; color: #fff; margin-bottom: 1rem; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 9px; }
        .footer-links a { color: rgba(255,255,255,0.5); font-size: 0.88rem; font-weight: 600; transition: color 0.2s; }
        .footer-links a:hover { color: var(--red); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; flex-wrap: wrap; gap: 10px; font-size: 0.82rem; }
        .footer-fluento { color: rgba(255,255,255,0.5); }
        .footer-fluento a { color: var(--red); font-weight: 700; }

        /* ── RESPONSIVE: TABLET (≤1024px) ── */
        @media (max-width: 1024px) {
          .hero-inner { gap: 2.5rem; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }

        /* ── RESPONSIVE: MOBILE NAV (≤900px) ── */
        @media (max-width: 900px) {
          .nav-links, .nav-actions { display: none; }
          .mob-btn { display: flex; align-items: center; }
          .mob-menu { display: flex; flex-direction: column; gap: 0; position: fixed; top: 68px; left: 0; right: 0; background: #fff; border-bottom: 1px solid var(--border); z-index: 199; box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
          .mob-menu a { padding: 16px var(--h-pad); font-weight: 700; color: var(--ink); border-bottom: 1px solid var(--border); font-size: 1rem; display: block; }
          .mob-menu a:hover { color: var(--red); }
          .mob-menu-actions { padding: 16px var(--h-pad); display: flex; flex-direction: column; gap: 10px; }
          
          /* hero collapses to single col */
          .hero-inner { grid-template-columns: 1fr; text-align: center; }
          .hero-sub { max-width: 100%; margin-left: auto; margin-right: auto; }
          .hero-free-badge { justify-content: center; }
          .hero-actions { justify-content: center; }
          .hero-stats { justify-content: center; gap: 1.5rem; }
          .hero-phones { margin-top: 3rem; }

          /* red strip: 2x2 */
          .red-strip { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── RESPONSIVE: SMALL MOBILE (≤600px) ── */
        @media (max-width: 600px) {
          .hero { padding-top: 88px; min-height: auto; padding-bottom: 48px; }
          .hero-title { font-size: clamp(2rem, 8vw, 2.5rem); }
          .hero-phones { gap: 10px; }
          .hero-phones .phone-frame { width: 140px !important; border-radius: 26px !important; padding: 8px !important; }
          .hero-phones .phone-frame .phone-inner { border-radius: 20px !important; }
          .hero-free-badge { padding: 12px 16px; gap: 8px; }
          .hero-free-label { font-size: 0.9rem; }
          .btn-hero-red, .btn-hero-dark { padding: 13px 22px; font-size: 0.95rem; }
          .hero-stats { gap: 1rem; }
          .hero-stat-n { font-size: 1.4rem; }

          /* red strip: 2x2 compact */
          .red-strip { grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 36px var(--h-pad); }

          /* feat grid: single col on very small screens */
          .feat-grid { grid-template-columns: 1fr; }

          /* hiw: 2 col on small, fall to 1 if needed */
          .hiw-grid { grid-template-columns: 1fr; }

          /* wl: single col */
          .wl-grid { grid-template-columns: 1fr; }

          /* test: single col */
          .test-grid { grid-template-columns: 1fr; }

          /* footer: single col */
          .footer-top { grid-template-columns: 1fr; gap: 2rem; }
          .footer-desc { max-width: 100%; }

          /* cta buttons: stack */
          .cta-actions { flex-direction: column; align-items: center; }
          .btn-white, .btn-woutline { width: 100%; max-width: 320px; justify-content: center; }

          /* preview tabs scroll */
          .preview-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
          .preview-tabs::-webkit-scrollbar { height: 0; }

          /* app preview phone: shrink height on mobile */
          .preview-phones { height: 360px !important; }
          .preview-phones .phone-frame { width: 160px !important; }

          /* showcase: proper horizontal scroll on mobile */
          .showcase-inner { padding-left: 0 !important; padding-right: 0 !important; }
          .showcase-inner > div:first-child { padding: 0 16px; }
          .showcase-phones { justify-content: flex-start !important; padding-left: 16px; padding-right: 16px; scroll-padding-left: 16px; }
        }

        /* ── RESPONSIVE: EXTRA SMALL (≤400px) ── */
        @media (max-width: 400px) {
          .hero-phones .phone-frame { width: 120px !important; }
          .hero-tag { font-size: 0.72rem; padding: 6px 12px; }
          .strip-stat-n { font-size: 1.4rem; }
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.65s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      `}</style>

            {/* ── NAV ── */}
            <nav className={`nav${scrolled ? " scrolled" : ""}`}>
                <a href={route("home")} className="nav-logo">
                    {/* <div className="nav-logo-badge">FLUENTO</div> */}
                    <img src={logo} className="h-10" alt="Logo" />
                    <div className="nav-logo-text">VocabPix</div>
                </a>
                <ul className="nav-links">
                    <li>
                        <a href="#features">Features</a>
                    </li>
                    <li>
                        <a href="#app-preview">App Preview</a>
                    </li>
                    <li>
                        <a href="#wordlists">Word Lists</a>
                    </li>
                    <li>
                        <a href="#testimonials">Reviews</a>
                    </li>
                </ul>
                <div className="nav-actions">
                    {auth?.user ? (
                        <Link href={route("dashboard")} className="btn-red">
                            Dashboard {Ico.arrow}
                        </Link>
                    ) : (
                        <>
                            <Link href={route("login")} className="btn-outline">
                                Log In
                            </Link>
                            <Link href={route("register")} className="btn-red">
                                Try Free {Ico.arrow}
                            </Link>
                        </>
                    )}
                </div>
                <button className="mob-btn" onClick={() => setOpen(!open)}>
                    {open ? Ico.x : Ico.menu}
                </button>
            </nav>
            {open && (
                <div className="mob-menu">
                    <a href="#features" onClick={() => setOpen(false)}>
                        Features
                    </a>
                    <a href="#app-preview" onClick={() => setOpen(false)}>
                        App Preview
                    </a>
                    <a href="#wordlists" onClick={() => setOpen(false)}>
                        Word Lists
                    </a>
                    <a href="#testimonials" onClick={() => setOpen(false)}>
                        Reviews
                    </a>
                    <div className="mob-menu-actions">
                        <Link
                            href={route("login")}
                            className="btn-outline"
                            style={{ justifyContent: "center" }}
                        >
                            Log In
                        </Link>
                        <Link
                            href={route("register")}
                            className="btn-red"
                            style={{ justifyContent: "center" }}
                        >
                            Try Free
                        </Link>
                    </div>
                </div>
            )}

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-inner">
                    <div>
                        <div className="hero-tag fade-up">
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    background: "var(--red)",
                                    borderRadius: "50%",
                                    display: "inline-block",
                                }}
                            />
                            A Fluento Product — 100% Free to Use
                        </div>
                        <h1 className="hero-title fade-up delay-1">
                            Master English
                            <br />
                            Vocabulary with
                            <br />
                            <span className="red">Vivid Images</span>
                        </h1>
                        <p className="hero-sub fade-up delay-2">
                            VocabPix teaches words the way your brain actually
                            works — through striking images, real-life
                            sentences, and smart recall. Download free. Purchase
                            only the word lists you need.
                        </p>
                        <div className="hero-free-badge fade-up delay-2">
                            <div style={{ fontSize: "2rem" }}>🎉</div>
                            <div>
                                <div className="hero-free-label">
                                    Free Forever — No Subscription
                                </div>
                                <div className="hero-free-sub">
                                    Purchase individual word lists · Keep them
                                    for life
                                </div>
                            </div>
                        </div>
                        <div className="hero-actions fade-up delay-3">
                            <a
                                // href="https://vocabpix.fluento.org"
                                href={route("wordlistcategory.index")}
                                className="btn-hero-red"
                            >
                                {Ico.phone} Open App Free
                            </a>
                            <a
                                href={route("wordlistcategory.index")}
                                className="btn-hero-dark"
                            >
                                Browse Word Lists {Ico.arrow}
                            </a>
                        </div>
                        <div className="hero-stats fade-up delay-4">
                            <div>
                                <div className="hero-stat-n">
                                    <Counter end={10000} suffix="+" />
                                </div>
                                <div className="hero-stat-l">
                                    Active Learners
                                </div>
                            </div>
                            <div>
                                <div className="hero-stat-n">
                                    <Counter end={5000} suffix="+" />
                                </div>
                                <div className="hero-stat-l">
                                    Vocabulary Words
                                </div>
                            </div>
                            <div>
                                <div className="hero-stat-n">
                                    <Counter end={4.8} suffix="★" decimal />
                                </div>
                                <div className="hero-stat-l">User Rating</div>
                            </div>
                        </div>
                    </div>
                    <div className="hero-phones fade-up delay-2">
                        <Phone
                            // src={IMG.dashboardMobile}
                            src={dashboardImg}
                            alt="VocabPix Dashboard"
                            style={{
                                marginBottom: "40px",
                                animation: "floatY 4s ease-in-out infinite",
                            }}
                        />
                        <Phone
                            // src={IMG.wordImage}
                            src={exerciseImg}
                            alt="VocabPix Word Card"
                            style={{
                                marginTop: "40px",
                                animation:
                                    "floatY 4s ease-in-out 0.8s infinite",
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* ── RED STRIP ── */}
            <div className="red-strip">
                {[
                    { n: 10000, s: "+", l: "Words Learned Today" },
                    { n: 5000, s: "+", l: "Visual Flashcards" },
                    { n: 0, s: "$0", l: "App Cost — Free" },
                    { n: 12, s: "+", l: "Word List Categories" },
                ].map((s, i) => (
                    <div key={i} className="strip-stat">
                        <div className="strip-stat-n">
                            {s.s === "$0" ? (
                                "$0"
                            ) : (
                                <Counter end={s.n} suffix={s.s} />
                            )}
                        </div>
                        <div className="strip-stat-l">{s.l}</div>
                    </div>
                ))}
            </div>

            {/* ── FEATURES ── */}
            <section className="sec" id="features">
                <div
                    style={{
                        textAlign: "center",
                        maxWidth: 600,
                        margin: "0 auto",
                    }}
                >
                    <span className="sec-tag">Features</span>
                    <h2 className="sec-title">
                        Everything You Need to Build a Powerful Vocabulary
                    </h2>
                    <p className="sec-sub" style={{ margin: "0.75rem auto 0" }}>
                        Built on the science of visual memory and active recall
                        — proven to retain words 5× longer than traditional
                        study.
                    </p>
                </div>
                <div className="feat-grid">
                    {features.map((f) => (
                        <div key={f.title} className="feat-card">
                            <div
                                className="feat-icon"
                                style={{ background: f.bg, color: f.color }}
                            >
                                {f.icon}
                            </div>
                            <div className="feat-title">{f.title}</div>
                            <div className="feat-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── APP PREVIEW ── */}
            <section className="preview-section" id="app-preview">
                <div className="preview-inner">
                    <div
                        style={{
                            textAlign: "center",
                            maxWidth: 600,
                            margin: "0 auto",
                        }}
                    >
                        <span className="sec-tag">App Preview</span>
                        <h2 className="sec-title">
                            A Beautiful App Built for Real Learning
                        </h2>
                        <p
                            className="sec-sub"
                            style={{ margin: "0.75rem auto 0" }}
                        >
                            Clean, fast, and distraction-free. Everything you
                            need — nothing you don't.
                        </p>
                    </div>
                    <div className="preview-tabs">
                        {[
                            "Dashboard",
                            "Word Card",
                            "Word Detail",
                            "Word Lists",
                        ].map((t, i) => (
                            <button
                                key={t}
                                className={`preview-tab${activeTab === i ? " active" : ""}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    {/* All phones stay mounted — only opacity changes to avoid flicker */}
                    <div
                        className="preview-phones"
                        style={{ position: "relative", height: "480px" }}
                    >
                        {[
                            { src: dashboardImg, alt: "Dashboard" },
                            { src: exerciseImg, alt: "Word Card" },
                            { src: exerciseImg2, alt: "Word Detail" },
                            { src: wordlistImg, alt: "Word Lists" },
                        ].map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    opacity: activeTab === i ? 1 : 0,
                                    pointerEvents:
                                        activeTab === i ? "auto" : "none",
                                    transition: "opacity 250ms ease",
                                    animation:
                                        "floatY 4s ease-in-out 1s infinite",
                                }}
                            >
                                <Phone
                                    src={s.src}
                                    alt={s.alt}
                                    style={{ maxWidth: "min(220px, 65vw)" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="hiw-bg">
                <div className="hiw-inner">
                    <div
                        style={{
                            textAlign: "center",
                            maxWidth: 560,
                            margin: "0 auto",
                        }}
                    >
                        <span className="sec-tag">How It Works</span>
                        <h2 className="sec-title">
                            Four Steps to a Bigger Vocabulary
                        </h2>
                        <p
                            className="sec-sub"
                            style={{ margin: "0.75rem auto 0" }}
                        >
                            Open the app free. Browse word lists. Purchase what
                            you need. Learn at your own pace — forever.
                        </p>
                    </div>
                    <div className="hiw-grid">
                        {[
                            {
                                n: "01",
                                e: "📲",
                                t: "Open the App",
                                d: "Download VocabPix free. No sign-up wall, no trial period. Your first word list is on us.",
                            },
                            {
                                n: "02",
                                e: "📚",
                                t: "Browse Word Lists",
                                d: "Explore Academic Word List, IELTS, GRE, BCS and more. Each list is purchased once and yours forever.",
                            },
                            {
                                n: "03",
                                e: "🖼️",
                                t: "Learn with Images",
                                d: "Each word comes with a real photo, phonetics, Bangla pronunciation, definition, and collocations.",
                            },
                            {
                                n: "04",
                                e: "🧠",
                                t: "Track & Master",
                                d: 'Mark words as "I Know" or "I Don\'t Know". VocabPix brings back the tricky ones until they stick.',
                            },
                        ].map((s) => (
                            <div key={s.n} className="hiw-card">
                                <div className="hiw-num">STEP {s.n}</div>
                                <div className="hiw-emoji">{s.e}</div>
                                <div className="hiw-title">{s.t}</div>
                                <div className="hiw-desc">{s.d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WORDLISTS / PRICING ── */}
            <section className="pricing-bg sec-full" id="wordlists">
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        padding: "0 5vw",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            maxWidth: 600,
                            margin: "0 auto",
                        }}
                    >
                        <span className="sec-tag">Word Lists</span>
                        <h2 className="sec-title">
                            Purchase Only What You Need
                        </h2>
                        <p
                            className="sec-sub"
                            style={{ margin: "0.75rem auto 0" }}
                        >
                            No subscriptions. No recurring fees. Buy a word list
                            once and it's yours for life.
                        </p>
                    </div>
                    <div className="pricing-notice">
                        🎁 The app is completely free — you only pay for premium
                        word lists
                    </div>
                    <div className="wl-grid">
                        {wordlists.map((wl, i) => (
                            <WordlistCard key={i} {...wl} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SCREENSHOTS SHOWCASE ── */}
            <section className="showcase-bg">
                <div className="showcase-inner">
                    <div
                        style={{
                            textAlign: "center",
                            maxWidth: 600,
                            margin: "0 auto",
                        }}
                    >
                        <span className="sec-tag">Screenshots</span>
                        <h2 className="sec-title" style={{ color: "#fff" }}>
                            See Every Screen, Up Close
                        </h2>
                        <p className="sec-sub">
                            From the dashboard to word cards — a clean, focused
                            learning experience built for clarity.
                        </p>
                    </div>
                    <div className="showcase-phones">
                        {[
                            { src: dashboardImg, alt: "Dashboard" },
                            { src: exerciseImg, alt: "Word Card" },
                            { src: exerciseImg2, alt: "Word Detail" },
                            { src: wordlistImg, alt: "Word Lists" },
                            { src: quizImg, alt: "Quiz" },
                        ].map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    flexShrink: 0,
                                    scrollSnapAlign: "start",
                                }}
                            >
                                <Phone
                                    src={s.src}
                                    alt={s.alt}
                                    style={{ width: "180px" }}
                                />
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginTop: "12px",
                                        color: "rgba(255,255,255,0.6)",
                                        fontWeight: 700,
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {s.alt}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="sec" id="testimonials">
                <div
                    style={{
                        textAlign: "center",
                        maxWidth: 600,
                        margin: "0 auto",
                    }}
                >
                    <span className="sec-tag">Reviews</span>
                    <h2 className="sec-title">Learners Love VocabPix</h2>
                    <p className="sec-sub" style={{ margin: "0.75rem auto 0" }}>
                        Thousands of students and exam aspirants trust VocabPix
                        every day.
                    </p>
                </div>
                <div className="test-grid">
                    {testimonials.map((t) => (
                        <div key={t.name} className="test-card">
                            <div className="test-stars">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i}>{Ico.star}</span>
                                ))}
                            </div>
                            <p className="test-quote">"{t.text}"</p>
                            <div className="test-author">
                                <div className="test-avatar">{t.avatar}</div>
                                <div>
                                    <div className="test-name">{t.name}</div>
                                    <div className="test-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-bg">
                <h2 className="cta-title">
                    Start Learning Vocabulary
                    <br />
                    the Visual Way — Free
                </h2>
                <p className="cta-sub">
                    Open VocabPix now. No sign-up required to browse. Purchase a
                    word list when you're ready to go deep.
                </p>
                <div className="cta-free">
                    <span>✅</span> The app is free · Buy word lists once · Keep
                    them forever
                </div>
                <div className="cta-actions">
                    <a
                        // href="https://vocabpix.fluento.org"
                        href={route("home")}
                        className="btn-white"
                    >
                        Open App Free {Ico.arrow}
                    </a>
                    <a
                        href={route("wordlistcategory.index")}
                        className="btn-woutline"
                    >
                        Browse Word Lists
                    </a>
                </div>
            </section>

            {/* ── FLUENTO BAR ── */}
            <div className="fluento-bar">
                <div className="nav-logo-badge">FLUENTO</div>
                <span className="fluento-bar-text">
                    VocabPix is a product of
                </span>
                <a
                    href="https://fluento.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fluento-bar-link"
                >
                    fluento.org →
                </a>
            </div>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-top">
                    <div>
                        <div className="footer-logo">
                            <div className="nav-logo-badge">FLUENTO</div>
                            <div className="footer-logo-text">VocabPix</div>
                        </div>
                        <p className="footer-desc">
                            Learn vocabulary through vivid images and smart
                            recall. Free to use — purchase only the word lists
                            you need, and own them forever.
                        </p>
                    </div>
                    <div>
                        <div className="footer-col-h">Product</div>
                        <ul className="footer-links">
                            <li>
                                <a href="#features">Features</a>
                            </li>
                            <li>
                                <a href="#wordlists">Word Lists</a>
                            </li>
                            <li>
                                <a href="#app-preview">App Preview</a>
                            </li>
                            <li>
                                <a href="https://vocabpix.fluento.org">
                                    Open App
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="footer-col-h">Learn</div>
                        <ul className="footer-links">
                            <li>
                                <a href="#">Academic Word List</a>
                            </li>
                            <li>
                                <a href="#">IELTS Vocabulary</a>
                            </li>
                            <li>
                                <a href="#">GRE Word List</a>
                            </li>
                            <li>
                                <a href="#">BCS English</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="footer-col-h">Company</div>
                        <ul className="footer-links">
                            <li>
                                <a
                                    href="https://fluento.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Fluento
                                </a>
                            </li>
                            <li>
                                <a href="#">About</a>
                            </li>
                            <li>
                                <a href="#">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#">Terms of Use</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div>
                        © {new Date().getFullYear()} VocabPix. All rights
                        reserved.
                    </div>
                    <div className="footer-fluento">
                        A product of{" "}
                        <a
                            href="https://fluento.org"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Fluento
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
