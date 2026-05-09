<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VocabPix — Learn Vocabulary Scientifically</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet">
    <style>
        @font-face {
            font-family: 'Aileron';
            src: url('{{ asset(' fonts/aileron/Aileron-Regular.otf') }}') format('opentype');
            font-weight: 400;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('{{ asset(' fonts/aileron/Aileron-SemiBold.otf') }}') format('opentype');
            font-weight: 600;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('{{ asset(' fonts/aileron/Aileron-Bold.otf') }}') format('opentype');
            font-weight: 700;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('{{ asset(' fonts/aileron/Aileron-Heavy.otf') }}') format('opentype');
            font-weight: 800;
            font-style: normal;
        }

        @font-face {
            font-family: 'Aileron';
            src: url('{{ asset(' fonts/aileron/Aileron-Black.otf') }}') format('opentype');
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
            font-size: 1.8rem;
            margin-bottom: 12px;
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
            color: var(--green);
            font-weight: 900;
            font-size: 1rem;
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
    </style>
</head>

<body class="lang-en">
    <!-- Topbar -->
    <div class="topbar">
        <span class="t-en">🎓 GRE, IELTS, BCS, SAT, Medical & more — All in one place</span>
        <span class="t-bn">🎓 GRE, IELTS, BCS, SAT, মেডিকেল ও আরও — সব এক জায়গায়</span>
        <span><span class="t-en">Free to Start</span><span class="t-bn">বিনামূল্যে শুরু করুন</span></span>
    </div>

    <!-- Nav -->
    <nav>
        <a class="nav-logo" href="#">
            <div class="nav-logo-mark">V</div>
            <span class="nav-logo-text">VocabPix <sup>BETA</sup></span>
        </a>
        <div class="nav-links">
            <a href="#exams"><span class="t-en">Word Lists</span><span class="t-bn">শব্দ তালিকা</span></a>
            <a href="#features"><span class="t-en">Features</span><span class="t-bn">ফিচার</span></a>
            <a href="#bangla"><span class="t-en">Bangla</span><span class="t-bn">বাংলা</span></a>
            <a href="#pricing"><span class="t-en">Pricing</span><span class="t-bn">মূল্য</span></a>
            <a href="#faq"><span class="t-en">FAQ</span><span class="t-bn">প্রশ্নোত্তর</span></a>
        </div>
        <div class="nav-right">
            <button class="lang-toggle-btn" onclick="toggleLang()" id="lang-btn">
                <span class="t-en">🇧🇩 বাংলা</span>
                <span class="t-bn">🇬🇧 English</span>
            </button>
            <a href="https://vocabpix.fluento.org" class="btn-ghost" target="_blank">
                <span class="t-en">Login</span><span class="t-bn">লগইন</span>
            </a>
            <a href="#enroll" class="btn-red">
                <span class="t-en">Register Free →</span><span class="t-bn">বিনামূল্যে নিবন্ধন →</span>
            </a>
        </div>
        <button class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu">
            <span></span><span></span><span></span>
        </button>
    </nav>

    <!-- Mobile nav drawer -->
    <div class="mobile-nav" id="mobile-nav">
        <a href="#exams" onclick="closeMenu()"><span class="t-en">Word Lists</span><span class="t-bn">শব্দ
                তালিকা</span></a>
        <a href="#features" onclick="closeMenu()"><span class="t-en">Features</span><span class="t-bn">ফিচার</span></a>
        <a href="#bangla" onclick="closeMenu()"><span class="t-en">Bangla</span><span class="t-bn">বাংলা</span></a>
        <a href="#pricing" onclick="closeMenu()"><span class="t-en">Pricing</span><span class="t-bn">মূল্য</span></a>
        <a href="#faq" onclick="closeMenu()"><span class="t-en">FAQ</span><span class="t-bn">প্রশ্নোত্তর</span></a>
        <div class="mobile-nav-actions">
            <a href="https://vocabpix.fluento.org" class="btn-ghost" target="_blank" style="text-align:center">
                <span class="t-en">Login</span><span class="t-bn">লগইন</span>
            </a>
            <a href="#enroll" class="btn-red" onclick="closeMenu()"
                style="text-align:center;display:block;padding:12px">
                <span class="t-en">Register Free →</span><span class="t-bn">বিনামূল্যে নিবন্ধন →</span>
            </a>
        </div>
    </div>

    <!-- Hero -->
    <section>
        <div class="hero">
            <div class="hero-left">
                <div class="hero-badge">
                    🔬 <span class="t-en">Scientific Vocabulary Learning</span><span class="t-bn">বৈজ্ঞানিক শব্দ
                        শিক্ষা</span>
                </div>
                <h1>
                    <span class="t-en">Learn English Vocabulary <em>Fast & Smart</em> — in Bangla & English</span>
                    <span class="t-bn">বাংলায় শিখুন ইংরেজি শব্দ — <em>দ্রুত ও স্মার্টভাবে</em></span>
                </h1>
                <p class="hero-sub t-en">VocabPix uses visual memory techniques, spaced repetition, and Bangla-English
                    bilingual support to help you master 10,000+ words for exams and everyday fluency.</p>
                <p class="hero-sub t-bn">VocabPix ভিজ্যুয়াল মেমরি কৌশল, স্পেসড রিপিটিশন এবং বাংলা-ইংরেজি দ্বিভাষিক
                    সহায়তা ব্যবহার করে ১০,০০০+ শব্দ আয়ত্ত করতে সাহায্য করে।</p>
                <div class="hero-exam-tags">
                    <span class="exam-tag">📝 GRE</span>
                    <span class="exam-tag">🎓 IELTS</span>
                    <span class="exam-tag">📖 BCS</span>
                    <span class="exam-tag">💼 BBA</span>
                    <span class="exam-tag">🏥 <span class="t-en">Medical</span><span class="t-bn">মেডিকেল</span></span>
                    <span class="exam-tag">📐 SAT</span>
                </div>
                <div class="hero-actions">
                    <a href="#enroll" class="btn-hero btn-hero-primary">
                        🚀 <span class="t-en">Start Learning Free</span><span class="t-bn">বিনামূল্যে শেখা শুরু
                            করুন</span>
                    </a>
                    <a href="https://vocabpix.fluento.org" class="btn-hero btn-hero-secondary" target="_blank">
                        👀 <span class="t-en">Explore App</span><span class="t-bn">অ্যাপ দেখুন</span>
                    </a>
                </div>
                <div class="hero-trust">
                    <div class="trust-avatars">
                        <div class="trust-avatar" style="background:#E8192C">R</div>
                        <div class="trust-avatar" style="background:#2563EB">T</div>
                        <div class="trust-avatar" style="background:#1DB954">M</div>
                        <div class="trust-avatar" style="background:#FF6B00">S</div>
                    </div>
                    <span>
                        <span class="t-en">Joined by <strong>5,000+</strong> learners this month</span>
                        <span class="t-bn">এই মাসে <strong>৫,০০০+</strong> শিক্ষার্থী যোগ দিয়েছেন</span>
                    </span>
                </div>
            </div>
            <div class="hero-visual">
                <div class="card-stack" style="display:none;"></div>
                <div class="hero-video-wrap">
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1" title="VocabPix Demo"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats -->
    <div class="stats-row">
        <div class="stat-item">
            <div class="stat-n">10<span>K+</span></div>
            <div class="stat-l"><span class="t-en">Curated Words</span><span class="t-bn">বাছাইকৃত শব্দ</span></div>
        </div>
        <div class="stat-item">
            <div class="stat-n">122</div>
            <div class="stat-l"><span class="t-en">Word Lists</span><span class="t-bn">শব্দ তালিকা</span></div>
        </div>
        <div class="stat-item">
            <div class="stat-n">6</div>
            <div class="stat-l"><span class="t-en">Exam Categories</span><span class="t-bn">পরীক্ষার বিভাগ</span></div>
        </div>
        <div class="stat-item">
            <div class="stat-n">95<span>%</span></div>
            <div class="stat-l"><span class="t-en">Retention Rate</span><span class="t-bn">ধারণ হার</span></div>
        </div>
        <div class="stat-item">
            <div class="stat-n">5<span>K+</span></div>
            <div class="stat-l"><span class="t-en">Active Learners</span><span class="t-bn">সক্রিয় শিক্ষার্থী</span>
            </div>
        </div>
    </div>

    <!-- Exams -->
    <section class="exams-section sr" id="exams">
        <div class="section-eyebrow">📚 <span class="t-en">Word Lists</span><span class="t-bn">শব্দ তালিকা</span></div>
        <h2 class="section-title">
            <span class="t-en">Curated for Your Exam Goal</span>
            <span class="t-bn">আপনার পরীক্ষার লক্ষ্য অনুযায়ী বাছাই করা</span>
        </h2>
        <p class="section-sub t-en">Whether it's GRE, IELTS, BCS, or everyday fluency — every word list is organized,
            level-tagged, and ready to learn.</p>
        <p class="section-sub t-bn">GRE, IELTS, BCS বা দৈনন্দিন দক্ষতা — প্রতিটি শব্দ তালিকা সংগঠিত, স্তর-চিহ্নিত এবং
            শেখার জন্য প্রস্তুত।</p>
        <div class="exams-grid">
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">📘</div>
                <div class="exam-name">GRE 332</div>
                <div class="exam-words">17 <span class="t-en">Lists</span><span class="t-bn">তালিকা</span> · 332 <span
                        class="t-en">Words</span><span class="t-bn">শব্দ</span></div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🎓</div>
                <div class="exam-name">GRE Extended</div>
                <div class="exam-words">23 <span class="t-en">Lists</span><span class="t-bn">তালিকা</span> · 1,380 <span
                        class="t-en">Words</span><span class="t-bn">শব্দ</span></div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🌍</div>
                <div class="exam-name">Oxford 3000</div>
                <div class="exam-words">72 <span class="t-en">Lists</span><span class="t-bn">তালিকা</span> · 3,000 <span
                        class="t-en">Words</span><span class="t-bn">শব্দ</span></div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🏛️</div>
                <div class="exam-name"><span class="t-en">Academic Word List</span><span class="t-bn">একাডেমিক শব্দ
                        তালিকা</span></div>
                <div class="exam-words">10 <span class="t-en">Lists</span><span class="t-bn">তালিকা</span> · 570 <span
                        class="t-en">Words</span><span class="t-bn">শব্দ</span></div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">📝</div>
                <div class="exam-name">IELTS Essentials</div>
                <div class="exam-words"><span class="t-en">Coming Soon</span><span class="t-bn">শীঘ্রই আসছে</span></div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🏥</div>
                <div class="exam-name"><span class="t-en">Medical Vocab</span><span class="t-bn">মেডিকেল
                        শব্দভান্ডার</span></div>
                <div class="exam-words"><span class="t-en">Coming Soon</span><span class="t-bn">শীঘ্রই আসছে</span></div>
            </a>
        </div>
    </section>

    <!-- How It Works -->
    <div class="how-section">
        <div class="how-inner sr">
            <div class="section-eyebrow">🗺️ <span class="t-en">How It Works</span><span class="t-bn">কিভাবে কাজ
                    করে</span></div>
            <h2 class="section-title">
                <span class="t-en">From Zero to Fluent in 4 Steps</span>
                <span class="t-bn">৪ ধাপে শূন্য থেকে দক্ষ</span>
            </h2>
            <p class="section-sub t-en">No complicated setup. Open the app and start in under 60 seconds.</p>
            <p class="section-sub t-bn">কোনো জটিল সেটআপ নেই। অ্যাপ খুলুন এবং ৬০ সেকেন্ডের মধ্যে শুরু করুন।</p>
            <div class="how-steps">
                <div class="how-step">
                    <div class="how-step-num">1</div>
                    <div class="how-step-icon">📋</div>
                    <h3><span class="t-en">Pick a List</span><span class="t-bn">তালিকা বেছে নিন</span></h3>
                    <p class="t-en">Choose GRE, Oxford 3000, Academic, or your own list. Each split into 60-word
                        sub-lists.</p>
                    <p class="t-bn">GRE, Oxford 3000, Academic বা নিজের তালিকা বেছে নিন। প্রতিটি ৬০-শব্দের সাব-লিস্টে
                        ভাগ করা।</p>
                    <div class="how-step-arrow">›</div>
                </div>
                <div class="how-step">
                    <div class="how-step-num">2</div>
                    <div class="how-step-icon">🖼️</div>
                    <h3><span class="t-en">Learn with Images</span><span class="t-bn">ছবির সাথে শিখুন</span></h3>
                    <p class="t-en">Each word card shows an image, pronunciation, Bangla definition, synonyms, antonyms
                        & collocations.</p>
                    <p class="t-bn">প্রতিটি শব্দ কার্ডে ছবি, উচ্চারণ, বাংলা সংজ্ঞা, সমার্থক ও বিপরীতার্থক শব্দ দেখুন।
                    </p>
                    <div class="how-step-arrow">›</div>
                </div>
                <div class="how-step">
                    <div class="how-step-num">3</div>
                    <div class="how-step-icon">🧠</div>
                    <h3><span class="t-en">Rate Your Memory</span><span class="t-bn">স্মৃতি মূল্যায়ন করুন</span></h3>
                    <p class="t-en">Tap "I Know" or "I Don't Know." Hard words resurface automatically. Track your
                        mastered count.</p>
                    <p class="t-bn">"জানি" বা "জানি না" ট্যাপ করুন। কঠিন শব্দ স্বয়ংক্রিয়ভাবে ফিরে আসে। আয়ত্ত শব্দ
                        গণনা করুন।</p>
                    <div class="how-step-arrow">›</div>
                </div>
                <div class="how-step">
                    <div class="how-step-num">4</div>
                    <div class="how-step-icon">🏆</div>
                    <h3><span class="t-en">Earn XP & Streak</span><span class="t-bn">XP ও স্ট্রিক অর্জন করুন</span></h3>
                    <p class="t-en">Daily sessions build your streak. Earn XP for sessions, mastered words, and
                        completed lists.</p>
                    <p class="t-bn">দৈনিক সেশনে স্ট্রিক গড়ুন। সেশন, আয়ত্ত শব্দ ও সম্পূর্ণ তালিকার জন্য XP অর্জন করুন।
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Features -->
    <section class="feat-section sr" id="features">
        <div class="section-eyebrow">✨ <span class="t-en">Features</span><span class="t-bn">ফিচার</span></div>
        <h2 class="section-title">
            <span class="t-en">Everything You Need to Master Words</span>
            <span class="t-bn">শব্দ আয়ত্ত করতে যা দরকার সবকিছু</span>
        </h2>
        <p class="section-sub t-en">Not flashcards. Not a dictionary. A complete vocabulary system.</p>
        <p class="section-sub t-bn">শুধু ফ্ল্যাশকার্ড নয়। শুধু অভিধান নয়। একটি সম্পূর্ণ শব্দভান্ডার সিস্টেম।</p>
        <div class="feat-grid">
            <div class="feat-card big">
                <div class="feat-icon">🖼️</div>
                <h3><span class="t-en">Picture-Memory Learning</span><span class="t-bn">ছবি-স্মৃতি শিক্ষা</span></h3>
                <div class="t-en">
                    <p>Every word is anchored to a vivid, contextual image. Visual memory increases retention by up to
                        65% compared to plain text — your brain never forgets an image it has truly seen.</p>
                    <br>
                    <p>Our image-word pairing engine ensures the picture matches the word's meaning, tone, and usage —
                        not just a generic stock photo.</p>
                </div>
                <div class="t-bn">
                    <p>প্রতিটি শব্দ একটি প্রাণবন্ত ছবির সাথে যুক্ত। ভিজ্যুয়াল মেমরি সাধারণ টেক্সটের তুলনায় ৬৫% বেশি
                        ধারণ ক্ষমতা বাড়ায় — মস্তিষ্ক একটি সত্যিকারের দেখা ছবি কখনো ভোলে না।</p>
                    <br>
                    <p>আমাদের ছবি-শব্দ পেয়ারিং ইঞ্জিন নিশ্চিত করে যে ছবিটি শব্দের অর্থ, স্বর এবং ব্যবহারের সাথে মেলে।
                    </p>
                </div>
                <div class="feat-pill-row">
                    <span class="feat-pill"><span class="t-en">65% better retention</span><span class="t-bn">৬৫% বেশি
                            ধারণ</span></span>
                    <span class="feat-pill"><span class="t-en">Contextual images</span><span class="t-bn">প্রাসঙ্গিক
                            ছবি</span></span>
                    <span class="feat-pill"><span class="t-en">Visual anchors</span><span class="t-bn">ভিজ্যুয়াল
                            অ্যাংকার</span></span>
                </div>
            </div>
            <div class="feat-card">
                <div class="feat-icon">🔊</div>
                <h3><span class="t-en">Audio + Phonetic Pronunciation</span><span class="t-bn">অডিও ও ধ্বনিগত
                        উচ্চারণ</span></h3>
                <p class="t-en">Hear every word spoken aloud. Get phonetic spelling in English and Bangla
                    transliteration so you know exactly how to say it.</p>
                <p class="t-bn">প্রতিটি শব্দ উচ্চস্বরে শুনুন। বাংলা লিপ্যন্তরসহ ধ্বনিগত বানান পান যাতে সঠিক উচ্চারণ
                    জানতে পারেন।</p>
            </div>
            <div class="feat-card">
                <div class="feat-icon">🔄</div>
                <h3><span class="t-en">Synonyms, Antonyms & Collocations</span><span class="t-bn">সমার্থক, বিপরীতার্থক ও
                        কোলোকেশন</span></h3>
                <p class="t-en">See how words connect — synonyms, antonyms, and real sentence collocations so you learn
                    words in context, not in isolation.</p>
                <p class="t-bn">শব্দের সংযোগ দেখুন — সমার্থক, বিপরীতার্থক এবং বাস্তব বাক্যে কোলোকেশন, যাতে বিচ্ছিন্নভাবে
                    নয়, প্রসঙ্গে শিখতে পারেন।</p>
            </div>
            <div class="feat-card">
                <div class="feat-icon">⚡</div>
                <h3><span class="t-en">XP & Gamified Streaks</span><span class="t-bn">XP ও গেমিফাইড স্ট্রিক</span></h3>
                <p class="t-en">Earn XP for sessions, mastered words, and completed lists. Build daily streaks. Hit
                    milestones. Stay hooked on learning.</p>
                <p class="t-bn">সেশন, আয়ত্ত শব্দ ও সম্পূর্ণ তালিকার জন্য XP অর্জন করুন। দৈনিক স্ট্রিক গড়ুন। মাইলস্টোন
                    অর্জন করুন।</p>
            </div>
            <div class="feat-card">
                <div class="feat-icon">📝</div>
                <h3><span class="t-en">Custom Word Collections</span><span class="t-bn">কাস্টম শব্দ সংগ্রহ</span></h3>
                <p class="t-en">Add any word you encounter — in class, reading, or exams. Build personal lists and
                    practice them anytime.</p>
                <p class="t-bn">ক্লাসে, পড়ায় বা পরীক্ষায় যেকোনো শব্দ যোগ করুন। ব্যক্তিগত তালিকা তৈরি করুন এবং যেকোনো
                    সময় অনুশীলন করুন।</p>
            </div>
        </div>
    </section>

    <!-- Bangla Section -->
    <div class="bangla-section">
        <div class="bangla-inner sr" id="bangla">
            <div>
                <div class="section-eyebrow">🇧🇩 <span class="t-en">Bangla Support</span><span class="t-bn">বাংলা
                        সহায়তা</span></div>
                <h2 class="section-title">
                    <span class="t-en">Learn in Bangla,<br>Win in English</span>
                    <span class="t-bn">শিখুন বাংলায়,<br>জিতুন ইংরেজিতে</span>
                </h2>
                <p class="section-sub t-en">The only vocabulary app built with Bengali learners in mind — definitions,
                    pronunciation guides, and memory cues all available in Bangla.</p>
                <p class="section-sub t-bn">বাংলাভাষী শিক্ষার্থীদের কথা মাথায় রেখে তৈরি একমাত্র শব্দভান্ডার অ্যাপ —
                    সংজ্ঞা, উচ্চারণ গাইড এবং স্মৃতি সংকেত সবকিছু বাংলায়।</p>
                <div class="bangla-perks">
                    <div class="bangla-perk">
                        <div class="perk-dot"></div>
                        <div class="perk-text">
                            <strong><span class="t-en">Bangla definitions</span><span class="t-bn">বাংলা
                                    সংজ্ঞা</span></strong> —
                            <span class="t-en">understand word meaning in your native language first, then internalize
                                the English.</span>
                            <span class="t-bn">প্রথমে মাতৃভাষায় শব্দের অর্থ বুঝুন, তারপর ইংরেজি আত্মস্থ করুন।</span>
                        </div>
                    </div>
                    <div class="bangla-perk">
                        <div class="perk-dot"></div>
                        <div class="perk-text">
                            <strong><span class="t-en">Bengali phonetic guide</span><span class="t-bn">বাংলা ধ্বনি
                                    নির্দেশিকা</span></strong> —
                            <span class="t-en">every word has a Bangla script pronunciation (অক·যউ·অট·ই) so you say it
                                correctly from day one.</span>
                            <span class="t-bn">প্রতিটি শব্দে বাংলা লিপিতে উচ্চারণ (অক·যউ·অট·ই) আছে যাতে প্রথম দিন থেকেই
                                সঠিকভাবে বলতে পারেন।</span>
                        </div>
                    </div>
                    <div class="bangla-perk">
                        <div class="perk-dot"></div>
                        <div class="perk-text">
                            <strong><span class="t-en">Exam-focused lists</span><span class="t-bn">পরীক্ষা-কেন্দ্রিক
                                    তালিকা</span></strong> —
                            <span class="t-en">GRE, IELTS, BCS, BBA, SAT and Medical words used in Bangladesh's top
                                competitive exams.</span>
                            <span class="t-bn">GRE, IELTS, BCS, BBA, SAT ও মেডিকেল শব্দ যা বাংলাদেশের শীর্ষ
                                প্রতিযোগিতামূলক পরীক্ষায় ব্যবহৃত হয়।</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="bangla-card">
                    <div class="bangla-word">acuity</div>
                    <div class="bangla-eng">noun · uhk-YOO-uht-ee · <span
                            style="font-size:.82rem;color:#FF8A94">অক·যউ·অট·ই</span></div>
                    <div class="bangla-def-label"><span class="t-en">English Definition</span><span class="t-bn">ইংরেজি
                            সংজ্ঞা</span></div>
                    <div class="bangla-def t-en">Sharpness or keenness of thought, vision, or hearing</div>
                    <div class="bangla-def-label">বাংলা সংজ্ঞা</div>
                    <div class="bangla-def">চিন্তাশক্তি, দৃষ্টিশক্তি বা শ্রবণশক্তির তীক্ষ্ণতা বা প্রখরতা। কোনো বিষয়কে
                        স্পষ্ট ও সূক্ষ্মভাবে বোঝার ক্ষমতা।</div>
                    <div class="bangla-def-label"><span class="t-en">Synonyms</span><span class="t-bn">সমার্থক
                            শব্দ</span></div>
                    <div class="bangla-syn">
                        <span>sharpness</span><span>keenness</span><span>perception</span><span>astuteness</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Testimonials -->
    <section class="testi-section sr" id="testimonials">
        <div class="section-eyebrow">💬 <span class="t-en">Reviews</span><span class="t-bn">পর্যালোচনা</span></div>
        <h2 class="section-title">
            <span class="t-en">Learners Love VocabPix</span>
            <span class="t-bn">শিক্ষার্থীরা VocabPix ভালোবাসেন</span>
        </h2>
        <p class="section-sub t-en">Real feedback from real students — from Dhaka to diaspora.</p>
        <p class="section-sub t-bn">ঢাকা থেকে প্রবাসী পর্যন্ত — বাস্তব শিক্ষার্থীদের বাস্তব মতামত।</p>
        <div class="testi-grid">
            <div class="testi-card">
                <div class="testi-stars">★★★★★</div>
                <div class="testi-quote">"I scored 162 on GRE Verbal after 6 weeks on VocabPix. The image anchoring is
                    genuinely different — I could picture every word during the exam."</div>
                <div class="testi-person">
                    <div class="testi-av" style="background:#E8192C">RS</div>
                    <div>
                        <div class="testi-name">Rahul S.</div>
                        <div class="testi-role">GRE Prep · <span class="t-en">scored 162 Verbal</span><span
                                class="t-bn">GRE Verbal ১৬২ পেয়েছেন</span></div>
                    </div>
                </div>
            </div>
            <div class="testi-card">
                <div class="testi-stars">★★★★★</div>
                <div class="testi-quote">"বাংলায় সংজ্ঞা পাওয়াটা সত্যিই অসাধারণ। ইংরেজি শব্দ এখন মাথায় থাকে! 23-day
                    streak চলছে।"</div>
                <div class="testi-person">
                    <div class="testi-av" style="background:#2563EB">TF</div>
                    <div>
                        <div class="testi-name">Tasfia F.</div>
                        <div class="testi-role"><span class="t-en">University Student</span><span
                                class="t-bn">বিশ্ববিদ্যালয় শিক্ষার্থী</span> · Dhaka</div>
                    </div>
                </div>
            </div>
            <div class="testi-card">
                <div class="testi-stars">★★★★★</div>
                <div class="testi-quote">"As an English teacher I recommend this to every student. The collocation
                    examples and synonym groupings are exactly how vocabulary should be taught."</div>
                <div class="testi-person">
                    <div class="testi-av" style="background:#1DB954">MK</div>
                    <div>
                        <div class="testi-name">Mohammad K.</div>
                        <div class="testi-role"><span class="t-en">English Teacher</span><span class="t-bn">ইংরেজি
                                শিক্ষক</span> · Chittagong</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <div class="pricing-section sr" id="pricing">
        <div class="pricing-inner">
            <div style="text-align:center;margin-bottom:48px">
                <div class="section-eyebrow" style="text-align:center">💳 <span class="t-en">Pricing</span><span
                        class="t-bn">মূল্য</span></div>
                <h2 class="section-title" style="text-align:center">
                    <span class="t-en">Simple, Honest Pricing</span>
                    <span class="t-bn">সহজ, সৎ মূল্য নির্ধারণ</span>
                </h2>
                <p class="section-sub" style="margin:0 auto;text-align:center">
                    <span class="t-en">Get lifetime access to our scientifically designed word lists with a one-time
                        purchase.</span>
                    <span class="t-bn">এককালীন ক্রয়ের মাধ্যমে আমাদের বৈজ্ঞানিকভাবে ডিজাইন করা শব্দ তালিকায় আজীবন
                        প্রবেশাধিকার পান।</span>
                </p>
            </div>
            <div class="pricing-grid">
                <!-- Oxford 3000 -->
                <div class="price-card">
                    <div class="price-plan"><span class="t-en">Oxford 3000</span><span class="t-bn">অক্সফোর্ড
                            ৩০০০</span>
                    </div>
                    <div class="price-amount"><sub>৳</sub>599</div>
                    <div class="price-period"><span class="t-en">One-time purchase</span><span class="t-bn">এককালীন
                            ক্রয়</span></div>
                    <ul class="price-features">
                        <li><span class="t-en">3000 Essential English Words</span><span class="t-bn">৩০০০টি প্রয়োজনীয়
                                ইংরেজি শব্দ</span></li>
                        <li><span class="t-en">Scientific Memory Anchoring</span><span class="t-bn">বৈজ্ঞানিক মেমোরি
                                অ্যাঙ্করিং</span></li>
                        <li><span class="t-en">Image + Audio for every word</span><span class="t-bn">প্রতিটি শব্দে ছবি +
                                অডিও</span></li>
                        <li><span class="t-en">Lifetime Access</span><span class="t-bn">আজীবন প্রবেশাধিকার</span></li>
                    </ul>
                    <a href="#enroll" class="btn-ghost" style="display:block;text-align:center;padding:13px">
                        <span class="t-en">Buy Now →</span><span class="t-bn">এখনই কিনুন →</span>
                    </a>
                </div>
                <!-- Academic -->
                <div class="price-card">
                    <div class="price-plan"><span class="t-en">Academic Word List</span><span class="t-bn">অ্যাকাডেমিক
                            শব্দ তালিকা</span>
                    </div>
                    <div class="price-amount"><sub>৳</sub>250</div>
                    <div class="price-period"><span class="t-en">One-time purchase</span><span class="t-bn">এককালীন
                            ক্রয়</span></div>
                    <ul class="price-features">
                        <li><span class="t-en">Essential Academic Vocabulary</span><span class="t-bn">প্রয়োজনীয়
                                অ্যাকাডেমিক শব্দভান্ডার</span></li>
                        <li><span class="t-en">University & Research Focus</span><span class="t-bn">বিশ্ববিদ্যালয় ও
                                গবেষণা ফোকাস</span></li>
                        <li><span class="t-en">Advanced Example Sentences</span><span class="t-bn">উন্নত উদাহরণ
                                বাক্য</span></li>
                        <li><span class="t-en">Lifetime Access</span><span class="t-bn">আজীবন প্রবেশাধিকার</span></li>
                    </ul>
                    <a href="#enroll" class="btn-ghost" style="display:block;text-align:center;padding:13px">
                        <span class="t-en">Buy Now →</span><span class="t-bn">এখনই কিনুন →</span>
                    </a>
                </div>
                <!-- GRE Extended -->
                <div class="price-card featured">
                    <div class="price-badge">🔥 <span class="t-en">Most Popular</span><span class="t-bn">সবচেয়ে
                            জনপ্রিয়</span></div>
                    <div class="price-plan"><span class="t-en">GRE Extended</span><span class="t-bn">জিআরই
                            এক্সটেন্ডেড</span></div>
                    <div class="price-amount"><sub>৳</sub>399</div>
                    <div class="price-period"><span class="t-en">One-time purchase</span><span class="t-bn">এককালীন
                            ক্রয়</span></div>
                    <ul class="price-features">
                        <li><span class="t-en">800+ High-Frequency Words</span><span class="t-bn">৮০০+
                                উচ্চ-ফ্রিকোয়েন্সি শব্দ</span></li>
                        <li><span class="t-en">Designed for GRE Verbal</span><span class="t-bn">জিআরই ভার্বাল এর জন্য
                                ডিজাইন করা</span></li>
                        <li><span class="t-en">Scientific Spaced Repetition</span><span class="t-bn">বৈজ্ঞানিক স্পেসড
                                রিপিটিশন</span></li>
                        <li><span class="t-en">Lifetime Access</span><span class="t-bn">আজীবন প্রবেশাধিকার</span></li>
                    </ul>
                    <a href="#enroll" class="btn-red"
                        style="display:block;text-align:center;padding:13px;border-radius:12px">
                        <span class="t-en">Buy Now →</span><span class="t-bn">এখনই কিনুন →</span>
                    </a>
                </div>
                <!-- GRE 332 -->
                <div class="price-card">
                    <div class="price-plan"><span class="t-en">GRE 332</span><span class="t-bn">জিআরই ৩৩২</span></div>
                    <div class="price-amount"><sub>৳</sub>399</div>
                    <div class="price-period"><span class="t-en">One-time purchase</span><span class="t-bn">এককালীন
                            ক্রয়</span></div>
                    <ul class="price-features">
                        <li><span class="t-en">332 Essential GRE Words</span><span class="t-bn">৩৩২টি প্রয়োজনীয় জিআরই
                                শব্দ</span></li>
                        <li><span class="t-en">Quick Prep Focused</span><span class="t-bn">দ্রুত প্রস্তুতি ফোকাসড</span>
                        </li>
                        <li><span class="t-en">Memory Cues in Bangla</span><span class="t-bn">বাংলায় মেমোরি কিউ</span>
                        </li>
                        <li><span class="t-en">Lifetime Access</span><span class="t-bn">আজীবন প্রবেশাধিকার</span></li>
                    </ul>
                    <a href="#enroll" class="btn-ghost" style="display:block;text-align:center;padding:13px">
                        <span class="t-en">Buy Now →</span><span class="t-bn">এখনই কিনুন →</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Enroll -->
    <div class="enroll-section" id="enroll">
        <div class="enroll-inner sr">
            <h2 class="enroll-title">
                <span class="t-en">Start Today. For Free.</span>
                <span class="t-bn">শুরু করুন আজই। বিনামূল্যে।</span>
            </h2>
            <p class="enroll-sub">
                <span class="t-en">Create your free account and access all word lists, quizzes, and your personal
                    vocabulary journal instantly.</span>
                <span class="t-bn">আজই বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং সমস্ত শব্দ তালিকা, কুইজ ও ব্যক্তিগত
                    শব্দভান্ডার জার্নালে তাৎক্ষণিক প্রবেশাধিকার পান।</span>
            </p>
            <div class="enroll-form">
                <div id="form-body">
                    <div class="form-tabs">
                        <button class="form-tab active" onclick="setTab(this,'register')">
                            <span class="t-en">Register</span><span class="t-bn">নিবন্ধন</span>
                        </button>
                        <button class="form-tab" onclick="setTab(this,'login')">
                            <span class="t-en">Login</span><span class="t-bn">লগইন</span>
                        </button>
                    </div>
                    <div id="tab-register">
                        <div class="form-row">
                            <div class="fg">
                                <label><span class="t-en">First Name</span><span class="t-bn">প্রথম নাম</span></label>
                                <input type="text" id="fn" placeholder="Your name">
                            </div>
                            <div class="fg">
                                <label><span class="t-en">Last Name</span><span class="t-bn">শেষ নাম</span></label>
                                <input type="text" id="ln" placeholder="Last name">
                            </div>
                        </div>
                        <div class="fg">
                            <label><span class="t-en">Email Address</span><span class="t-bn">ইমেইল ঠিকানা</span></label>
                            <input type="email" id="em" placeholder="you@example.com">
                        </div>
                        <div class="fg">
                            <label><span class="t-en">Password</span><span class="t-bn">পাসওয়ার্ড</span></label>
                            <input type="password" id="pw" placeholder="Min. 6 characters">
                        </div>
                        <div class="fg">
                            <label><span class="t-en">Your Learning Goal</span><span class="t-bn">আপনার শেখার
                                    লক্ষ্য</span></label>
                            <div class="goal-chips">
                                <button class="goal-chip" onclick="toggleChip(this)">📝 GRE</button>
                                <button class="goal-chip" onclick="toggleChip(this)">🎓 IELTS</button>
                                <button class="goal-chip" onclick="toggleChip(this)">📖 BCS</button>
                                <button class="goal-chip" onclick="toggleChip(this)">💼 BBA</button>
                                <button class="goal-chip" onclick="toggleChip(this)">🏥 <span
                                        class="t-en">Medical</span><span class="t-bn">মেডিকেল</span></button>
                                <button class="goal-chip" onclick="toggleChip(this)">✏️ <span
                                        class="t-en">Other</span><span class="t-bn">অন্যান্য</span></button>
                            </div>
                        </div>
                        <div class="fg">
                            <label><span class="t-en">WhatsApp Number</span><span class="t-bn">হোয়াটসঅ্যাপ
                                    নম্বর</span></label>
                            <input type="text" id="wa" placeholder="e.g. 01712345678">
                        </div>
                        @php
                        $districts = [
                        'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur',
                        'Chapai Nawabganj', 'Chattogram', 'Chuadanga', 'Cumilla', "Cox's Bazar", 'Dhaka', 'Dinajpur',
                        'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore',
                        'Jhalokathi', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram',
                        'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur',
                        'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi',
                        'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali',
                        'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur',
                        'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon', 'Expat'
                        ];
                        @endphp
                        <div class="fg">
                            <label><span class="t-en">Location (where you are joining from)</span><span
                                    class="t-bn">স্থান (আপনি যেখান থেকে যুক্ত হচ্ছেন)</span></label>
                            <select id="loc">
                                <option value="">Choose location...</option>
                                @foreach($districts as $district)
                                <option value="{{ $district }}">{{ $district }}</option>
                                @endforeach
                            </select>
                        </div>
                        <button class="form-submit" onclick="doRegister()">
                            🚀 <span class="t-en">Create Free Account</span><span class="t-bn">বিনামূল্যে অ্যাকাউন্ট
                                তৈরি করুন</span>
                        </button>
                    </div>
                    <div id="tab-login" style="display:none">
                        <div class="fg">
                            <label><span class="t-en">Email</span><span class="t-bn">ইমেইল</span></label>
                            <input type="email" placeholder="you@example.com">
                        </div>
                        <div class="fg">
                            <label><span class="t-en">Password</span><span class="t-bn">পাসওয়ার্ড</span></label>
                            <input type="password" placeholder="Your password">
                        </div>
                        <button class="form-submit" onclick="window.open('https://vocabpix.fluento.org','_blank')">
                            <span class="t-en">Login to VocabPix →</span><span class="t-bn">VocabPix-এ লগইন করুন
                                →</span>
                        </button>
                        <p class="form-note" style="margin-top:12px">
                            <span class="t-en">No account? <a href="#" onclick="switchToRegister()"
                                    style="color:var(--red);font-weight:700">Register free</a></span>
                            <span class="t-bn">অ্যাকাউন্ট নেই? <a href="#" onclick="switchToRegister()"
                                    style="color:var(--red);font-weight:700">বিনামূল্যে নিবন্ধন করুন</a></span>
                        </p>
                    </div>
                    <p class="form-note">
                        <span class="t-en">No credit card needed. Free forever on core features.</span>
                        <span class="t-bn">কোনো ক্রেডিট কার্ড প্রয়োজন নেই। মূল ফিচারগুলো চিরকাল বিনামূল্যে।</span>
                    </p>
                </div>
                <div class="success-msg" id="success-msg">
                    <div class="s-icon">🎉</div>
                    <h3><span class="t-en">Welcome to VocabPix!</span><span class="t-bn">VocabPix-এ স্বাগতম!</span></h3>
                    <p><span class="t-en">Your account is ready. Check your email to verify and start
                            learning.</span><span class="t-bn">আপনার অ্যাকাউন্ট প্রস্তুত। যাচাই করতে ইমেইল চেক করুন এবং
                            শেখা শুরু করুন।</span></p>
                    <a href="https://vocabpix.fluento.org" target="_blank" class="btn-red"
                        style="display:inline-block;padding:14px 28px;border-radius:12px">
                        <span class="t-en">Open VocabPix App →</span><span class="t-bn">VocabPix অ্যাপ খুলুন →</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- FAQ -->
    <section class="faq-section sr" id="faq">
        <div style="text-align:center;margin-bottom:48px">
            <div class="section-eyebrow" style="text-align:center">❓ <span class="t-en">FAQ</span><span
                    class="t-bn">প্রশ্নোত্তর</span></div>
            <h2 class="section-title" style="text-align:center">
                <span class="t-en">Common Questions</span>
                <span class="t-bn">সাধারণ প্রশ্নসমূহ</span>
            </h2>
        </div>
        <div class="faq-item">
            <button class="faq-q" onclick="toggleFaq(this)">
                <span class="t-en">Is VocabPix really free?</span><span class="t-bn">VocabPix কি সত্যিই
                    বিনামূল্যে?</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-a">
                <span class="t-en">Yes — all public word lists (GRE, Oxford 3000, Academic), images, audio, Bangla
                    definitions, XP tracking and quizzes are completely free. Pro adds custom collections, streak
                    protection, and offline mode.</span>
                <span class="t-bn">হ্যাঁ — সব পাবলিক শব্দ তালিকা (GRE, Oxford 3000, Academic), ছবি, অডিও, বাংলা সংজ্ঞা,
                    XP ট্র্যাকিং ও কুইজ সম্পূর্ণ বিনামূল্যে। Pro-তে কাস্টম সংগ্রহ, স্ট্রিক সুরক্ষা ও অফলাইন মোড
                    আছে।</span>
            </div>
        </div>
        <div class="faq-item">
            <button class="faq-q" onclick="toggleFaq(this)">
                <span class="t-en">Why does VocabPix use images?</span><span class="t-bn">VocabPix কেন ছবি ব্যবহার
                    করে?</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-a">
                <span class="t-en">Visual memory is one of the strongest memory systems in the brain. Pairing a word
                    with a vivid image creates a "memory anchor." Studies show picture-word pairing improves long-term
                    retention by 40–65% over text-only methods.</span>
                <span class="t-bn">ভিজ্যুয়াল মেমরি মস্তিষ্কের সবচেয়ে শক্তিশালী স্মৃতি ব্যবস্থাগুলির মধ্যে একটি। একটি
                    শব্দের সাথে একটি প্রাণবন্ত ছবি যুক্ত করলে "মেমরি অ্যাংকার" তৈরি হয়। গবেষণায় দেখা গেছে ছবি-শব্দ
                    পেয়ারিং শুধু টেক্সট পদ্ধতির চেয়ে ৪০-৬৫% বেশি দীর্ঘমেয়াদী ধারণ উন্নত করে।</span>
            </div>
        </div>
        <div class="faq-item">
            <button class="faq-q" onclick="toggleFaq(this)">
                <span class="t-en">Does it work for BCS and local Bangladesh exams?</span><span class="t-bn">BCS ও
                    বাংলাদেশের স্থানীয় পরীক্ষার জন্য কি কাজ করে?</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-a">
                <span class="t-en">Yes. BCS and Medical vocabulary lists are in development. GRE Extended and Academic
                    Word List already have significant overlap with BCS English sections.</span>
                <span class="t-bn">হ্যাঁ। BCS ও মেডিকেল শব্দভান্ডার তালিকা তৈরি হচ্ছে। GRE Extended এবং Academic Word
                    List ইতিমধ্যে BCS English অংশের সাথে উল্লেখযোগ্য মিল রয়েছে।</span>
            </div>
        </div>
        <div class="faq-item">
            <button class="faq-q" onclick="toggleFaq(this)">
                <span class="t-en">Can I add my own words?</span><span class="t-bn">আমি কি নিজের শব্দ যোগ করতে
                    পারি?</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-a">
                <span class="t-en">Yes! "Add New Word" lets you create personal word entries with definition,
                    pronunciation, and part of speech. Pro unlocks unlimited custom collections with full image and
                    audio support.</span>
                <span class="t-bn">হ্যাঁ! "নতুন শব্দ যোগ করুন" দিয়ে সংজ্ঞা, উচ্চারণ ও পদ পরিচয়সহ ব্যক্তিগত শব্দ
                    এন্ট্রি তৈরি করুন। Pro-তে সম্পূর্ণ ছবি ও অডিও সহায়তাসহ সীমাহীন কাস্টম সংগ্রহ আনলক হয়।</span>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="footer-inner">
            <div class="footer-top">
                <div class="footer-brand">
                    <div class="footer-logo-text">🔴 VocabPix</div>
                    <p>
                        <span class="t-en">A Fluento product · Learn vocabulary the fast and proven way — both in Bangla
                            and English. Built for GRE, IELTS, BCS, BBA, Medical, and SAT learners.</span>
                        <span class="t-bn">একটি Fluento পণ্য · দ্রুত ও প্রমাণিত উপায়ে শব্দভান্ডার শিখুন — বাংলা ও
                            ইংরেজি উভয়ে। GRE, IELTS, BCS, BBA, মেডিকেল ও SAT শিক্ষার্থীদের জন্য তৈরি।</span>
                    </p>
                    <a href="https://vocabpix.fluento.org" target="_blank" class="btn-red"
                        style="display:inline-block;padding:10px 20px;font-size:.85rem">
                        <span class="t-en">Open App →</span><span class="t-bn">অ্যাপ খুলুন →</span>
                    </a>
                </div>
                <div>
                    <div class="footer-heading"><span class="t-en">Word Lists</span><span class="t-bn">শব্দ
                            তালিকা</span></div>
                    <div class="footer-links-col">
                        <a href="#">GRE 332</a>
                        <a href="#">GRE Extended</a>
                        <a href="#">Oxford 3000</a>
                        <a href="#"><span class="t-en">Academic Word List</span><span class="t-bn">একাডেমিক শব্দ
                                তালিকা</span></a>
                    </div>
                </div>
                <div>
                    <div class="footer-heading"><span class="t-en">Product</span><span class="t-bn">পণ্য</span></div>
                    <div class="footer-links-col">
                        <a href="#"><span class="t-en">Features</span><span class="t-bn">ফিচার</span></a>
                        <a href="#pricing"><span class="t-en">Pricing</span><span class="t-bn">মূল্য</span></a>
                        <a href="#"><span class="t-en">Quiz Mode</span><span class="t-bn">কুইজ মোড</span></a>
                        <a href="#">XP Shop</a>
                    </div>
                </div>
                <div>
                    <div class="footer-heading"><span class="t-en">Company</span><span class="t-bn">কোম্পানি</span>
                    </div>
                    <div class="footer-links-col">
                        <a href="#"><span class="t-en">About Fluento</span><span class="t-bn">Fluento
                                সম্পর্কে</span></a>
                        <a href="#"><span class="t-en">Privacy Policy</span><span class="t-bn">গোপনীয়তা নীতি</span></a>
                        <a href="#"><span class="t-en">Terms</span><span class="t-bn">শর্তাবলী</span></a>
                        <a href="#"><span class="t-en">Contact</span><span class="t-bn">যোগাযোগ</span></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <span>© 2026 Fluento. <span class="t-en">All rights reserved.</span><span class="t-bn">সর্বস্বত্ব
                        সংরক্ষিত।</span></span>
                <span><span class="t-en">Made with ❤️ for Bangladeshi learners</span><span class="t-bn">বাংলাদেশি
                        শিক্ষার্থীদের জন্য ❤️ দিয়ে তৈরি</span></span>
            </div>
        </div>
    </footer>

    <script>
        // ── Scroll reveal ──
        const obs = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('vis');
        }), { threshold: .1 });
        document.querySelectorAll('.sr').forEach(el => obs.observe(el));

        // ── Language toggle ──
        function toggleLang() {
            const body = document.body;
            const isEn = body.classList.contains('lang-en');
            body.classList.toggle('lang-en', !isEn);
            body.classList.toggle('lang-bn', isEn);
            localStorage.setItem('vp-lang', isEn ? 'bn' : 'en');
        }
        // Restore saved language
        const saved = localStorage.getItem('vp-lang');
        if (saved === 'bn') {
            document.body.classList.remove('lang-en');
            document.body.classList.add('lang-bn');
        }

        // ── Mobile menu ──
        function toggleMenu() {
            const ham = document.getElementById('hamburger');
            const menu = document.getElementById('mobile-nav');
            ham.classList.toggle('open');
            menu.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        }
        function closeMenu() {
            document.getElementById('hamburger').classList.remove('open');
            document.getElementById('mobile-nav').classList.remove('open');
            document.body.style.overflow = '';
        }
        // Close on outside click
        document.getElementById('mobile-nav').addEventListener('click', function (e) {
            if (e.target === this) closeMenu();
        });

        // ── FAQ ──
        function toggleFaq(btn) {
            const a = btn.nextElementSibling, icon = btn.querySelector('.faq-icon');
            a.classList.toggle('open');
            icon.classList.toggle('open');
        }

        // ── Chips ──
        function toggleChip(el) { el.classList.toggle('active'); }

        // ── Form tabs ──
        function setTab(btn, tab) {
            document.querySelectorAll('.form-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-register').style.display = tab === 'register' ? '' : 'none';
            document.getElementById('tab-login').style.display = tab === 'login' ? '' : 'none';
        }
        function switchToRegister() {
            const tabs = document.querySelectorAll('.form-tab');
            tabs[0].classList.add('active');
            tabs[1].classList.remove('active');
            document.getElementById('tab-register').style.display = '';
            document.getElementById('tab-login').style.display = 'none';
        }
        function doRegister() {
            const fn = document.getElementById('fn').value.trim(),
                em = document.getElementById('em').value.trim(),
                pw = document.getElementById('pw').value.trim();
            const isBn = document.body.classList.contains('lang-bn');
            if (!fn || !em || !pw) {
                alert(isBn ? 'অনুগ্রহ করে নাম, ইমেইল ও পাসওয়ার্ড পূরণ করুন।' : 'Please fill in your name, email, and password.');
                return;
            }
            if (!em.includes('@')) {
                alert(isBn ? 'একটি বৈধ ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.');
                return;
            }
            if (pw.length < 6) {
                alert(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
                return;
            }
            document.getElementById('form-body').style.display = 'none';
            document.getElementById('success-msg').style.display = 'block';
        }
    </script>
</body>

</html>