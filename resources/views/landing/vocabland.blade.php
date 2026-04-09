<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VocabPix — Master English Vocabulary</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
        rel="stylesheet">
    <style>
        :root {
            --red: #E8192C;
            --red-dark: #C01020;
            --red-light: #FF4D5E;
            --yellow: #F5A623;
            --green: #22C55E;
            --bg: #F7F5F2;
            --dark: #1A1410;
            --mid: #6B6360;
            --white: #FFFFFF;
            --card: #FFFFFF;
            --border: rgba(26, 20, 16, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'DM Sans', sans-serif;
            background: var(--bg);
            color: var(--dark);
            overflow-x: hidden;
        }

        h1,
        h2,
        h3,
        h4 {
            font-family: 'Syne', sans-serif;
        }

        /* NAV */
        nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 48px;
            background: rgba(247, 245, 242, 0.92);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1.25rem;
            color: var(--dark);
            text-decoration: none;
        }

        .logo-badge {
            background: var(--red);
            color: white;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.05em;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 32px;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--mid);
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: var(--red);
        }

        .nav-cta {
            background: var(--red);
            color: white;
            padding: 10px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            transition: background 0.2s, transform 0.2s;
        }

        .nav-cta:hover {
            background: var(--red-dark);
            transform: translateY(-1px);
        }

        /* HERO */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 120px 24px 80px;
            position: relative;
            overflow: hidden;
        }

        .hero-bg {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232, 25, 44, 0.08) 0%, transparent 70%);
        }

        .hero-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(232, 25, 44, 0.08);
            border: 1px solid rgba(232, 25, 44, 0.2);
            color: var(--red);
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 28px;
            animation: fadeUp 0.6s ease both;
        }

        .hero h1 {
            font-size: clamp(2.8rem, 7vw, 5.5rem);
            font-weight: 800;
            line-height: 1.05;
            max-width: 820px;
            margin-bottom: 24px;
            animation: fadeUp 0.6s 0.1s ease both;
        }

        .hero h1 span {
            color: var(--red);
        }

        .hero p {
            font-size: clamp(1rem, 2vw, 1.2rem);
            color: var(--mid);
            max-width: 560px;
            line-height: 1.7;
            margin-bottom: 40px;
            animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
            animation: fadeUp 0.6s 0.3s ease both;
        }

        .btn-primary {
            background: var(--red);
            color: white;
            padding: 16px 36px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 1rem;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all 0.25s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 20px rgba(232, 25, 44, 0.3);
        }

        .btn-primary:hover {
            background: var(--red-dark);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(232, 25, 44, 0.4);
        }

        .btn-secondary {
            background: white;
            color: var(--dark);
            padding: 16px 36px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            text-decoration: none;
            border: 1.5px solid var(--border);
            transition: all 0.25s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-secondary:hover {
            border-color: var(--red);
            color: var(--red);
            transform: translateY(-2px);
        }

        /* STATS BAR */
        .stats-bar {
            display: flex;
            justify-content: center;
            gap: 48px;
            flex-wrap: wrap;
            padding: 48px 24px;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            background: white;
            animation: fadeUp 0.6s 0.4s ease both;
        }

        .stat {
            text-align: center;
        }

        .stat-num {
            font-family: 'Syne', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            color: var(--red);
        }

        .stat-label {
            font-size: 0.85rem;
            color: var(--mid);
            margin-top: 2px;
        }

        /* WORD LISTS SECTION */
        section {
            padding: 96px 24px;
            max-width: 1100px;
            margin: 0 auto;
        }

        .section-label {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--red);
            margin-bottom: 12px;
        }

        .section-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 16px;
        }

        .section-sub {
            color: var(--mid);
            font-size: 1.05rem;
            max-width: 520px;
            line-height: 1.7;
            margin-bottom: 56px;
        }

        .lists-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
        }

        .list-card {
            background: white;
            border-radius: 20px;
            padding: 28px 24px;
            border: 1.5px solid var(--border);
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .list-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--red);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s;
        }

        .list-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
        }

        .list-card:hover::before {
            transform: scaleX(1);
        }

        .list-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: rgba(232, 25, 44, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            margin-bottom: 20px;
        }

        .list-title {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 6px;
        }

        .list-meta {
            font-size: 0.82rem;
            color: var(--mid);
            margin-bottom: 16px;
        }

        .list-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .tag {
            padding: 3px 10px;
            border-radius: 50px;
            font-size: 0.72rem;
            font-weight: 600;
        }

        .tag-advanced {
            background: rgba(232, 25, 44, 0.1);
            color: var(--red);
        }

        .tag-words {
            background: rgba(0, 0, 0, 0.06);
            color: var(--mid);
        }

        /* FEATURES */
        .features-section {
            padding: 96px 24px;
            background: var(--dark);
            color: white;
        }

        .features-inner {
            max-width: 1100px;
            margin: 0 auto;
        }

        .features-section .section-label {
            color: #FF8A94;
        }

        .features-section .section-title {
            color: white;
        }

        .features-section .section-sub {
            color: rgba(255, 255, 255, 0.55);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .feature-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 32px;
            transition: background 0.3s, transform 0.3s;
        }

        .feature-card:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-4px);
        }

        .feature-icon {
            font-size: 2rem;
            margin-bottom: 20px;
        }

        .feature-title {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 1.15rem;
            margin-bottom: 10px;
            color: white;
        }

        .feature-desc {
            color: rgba(255, 255, 255, 0.55);
            font-size: 0.9rem;
            line-height: 1.7;
        }

        /* HOW IT WORKS */
        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 32px;
            margin-top: 56px;
        }

        .step {
            position: relative;
        }

        .step-num {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--red);
            color: white;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .step-title {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 8px;
        }

        .step-desc {
            color: var(--mid);
            font-size: 0.9rem;
            line-height: 1.7;
        }

        /* TESTIMONIALS */
        .testimonials {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 56px;
        }

        .testi-card {
            background: white;
            border-radius: 20px;
            padding: 28px;
            border: 1.5px solid var(--border);
        }

        .stars {
            color: var(--yellow);
            font-size: 1rem;
            margin-bottom: 16px;
        }

        .testi-text {
            font-size: 0.95rem;
            line-height: 1.7;
            color: var(--dark);
            margin-bottom: 20px;
            font-style: italic;
        }

        .testi-author {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .testi-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--red);
            color: white;
            font-weight: 700;
            font-family: 'Syne', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            flex-shrink: 0;
        }

        .testi-name {
            font-weight: 600;
            font-size: 0.9rem;
        }

        .testi-role {
            font-size: 0.78rem;
            color: var(--mid);
        }

        /* XP SECTION */
        .xp-section {
            padding: 96px 24px;
            background: linear-gradient(135deg, #FFF8E7 0%, #FFF3D4 100%);
            border-top: 1px solid rgba(245, 166, 35, 0.2);
            border-bottom: 1px solid rgba(245, 166, 35, 0.2);
        }

        .xp-inner {
            max-width: 1100px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: center;
        }

        .xp-content .section-label {
            color: var(--yellow);
        }

        .xp-rewards {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 32px;
        }

        .xp-reward {
            background: white;
            border-radius: 14px;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .xp-reward-label {
            font-size: 0.9rem;
            font-weight: 500;
        }

        .xp-reward-val {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            color: var(--yellow);
            font-size: 0.95rem;
        }

        .xp-visual {
            background: white;
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .xp-balance {
            font-family: 'Syne', sans-serif;
            font-size: 3rem;
            font-weight: 800;
            color: var(--yellow);
            margin-bottom: 8px;
        }

        .xp-sub {
            color: var(--mid);
            font-size: 0.85rem;
            margin-bottom: 24px;
        }

        .streak-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #FFF0D4;
            border: 1px solid rgba(245, 166, 35, 0.3);
            padding: 8px 18px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            color: #B07A00;
        }

        /* FORM SECTION */
        .form-section {
            padding: 96px 24px;
            background: var(--dark);
            color: white;
        }

        .form-inner {
            max-width: 680px;
            margin: 0 auto;
            text-align: center;
        }

        .form-section .section-label {
            color: #FF8A94;
        }

        .form-section .section-title {
            color: white;
            margin-bottom: 12px;
        }

        .form-section .section-sub {
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 48px;
            max-width: 100%;
        }

        .enroll-form {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px;
            text-align: left;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        }

        .form-group label {
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.6);
        }

        .form-group input,
        .form-group select {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 14px 16px;
            color: white;
            font-size: 0.95rem;
            font-family: 'DM Sans', sans-serif;
            outline: none;
            transition: border-color 0.2s;
            appearance: none;
            -webkit-appearance: none;
        }

        .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:focus,
        .form-group select:focus {
            border-color: var(--red-light);
        }

        .form-group select option {
            background: #2a2420;
            color: white;
        }

        .goals-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 4px;
        }

        .goal-btn {
            padding: 10px 8px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.78rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            font-family: 'DM Sans', sans-serif;
        }

        .goal-btn.active,
        .goal-btn:hover {
            background: rgba(232, 25, 44, 0.2);
            border-color: var(--red);
            color: white;
        }

        .form-submit {
            width: 100%;
            background: var(--red);
            color: white;
            border: none;
            padding: 18px;
            border-radius: 14px;
            font-family: 'Syne', sans-serif;
            font-size: 1.05rem;
            font-weight: 700;
            cursor: pointer;
            margin-top: 8px;
            transition: all 0.25s;
            box-shadow: 0 4px 20px rgba(232, 25, 44, 0.3);
        }

        .form-submit:hover {
            background: var(--red-dark);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(232, 25, 44, 0.4);
        }

        .form-note {
            text-align: center;
            font-size: 0.78rem;
            color: rgba(255, 255, 255, 0.35);
            margin-top: 16px;
        }

        .form-success {
            display: none;
            text-align: center;
            padding: 32px 0;
        }

        .success-icon {
            font-size: 3.5rem;
            margin-bottom: 16px;
        }

        .success-title {
            font-family: 'Syne', sans-serif;
            font-size: 1.6rem;
            font-weight: 800;
            color: white;
            margin-bottom: 8px;
        }

        .success-sub {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.95rem;
        }

        /* FOOTER */
        footer {
            background: #110E0C;
            padding: 48px 24px;
            text-align: center;
            color: rgba(255, 255, 255, 0.3);
            font-size: 0.85rem;
        }

        .footer-logo {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1.3rem;
            color: white;
            margin-bottom: 8px;
        }

        .footer-sub {
            margin-bottom: 24px;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
            margin-bottom: 32px;
        }

        .footer-links a {
            color: rgba(255, 255, 255, 0.4);
            text-decoration: none;
            transition: color 0.2s;
        }

        .footer-links a:hover {
            color: white;
        }

        /* ANIMATIONS */
        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(24px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .reveal {
            opacity: 0;
            transform: translateY(32px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            nav {
                padding: 14px 20px;
            }

            .nav-links {
                display: none;
            }

            .xp-inner {
                grid-template-columns: 1fr;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .goals-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .enroll-form {
                padding: 24px;
            }
        }

        /* WORD CARD PREVIEW */
        .word-preview-wrap {
            text-align: center;
            margin-top: 48px;
            animation: fadeUp 0.6s 0.5s ease both;
        }

        .word-card-demo {
            display: inline-block;
            background: white;
            border-radius: 24px;
            padding: 28px 36px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
            border: 1.5px solid var(--border);
            text-align: center;
            max-width: 340px;
            width: 100%;
            position: relative;
        }

        .word-card-demo .exercise-label {
            font-size: 0.72rem;
            color: var(--mid);
            margin-bottom: 12px;
        }

        .word-card-demo .the-word {
            font-family: 'Syne', sans-serif;
            font-size: 2rem;
            font-weight: 800;
        }

        .word-card-demo .pos {
            background: rgba(0, 0, 0, 0.07);
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 0.72rem;
            font-weight: 600;
            margin-left: 8px;
            color: var(--mid);
            vertical-align: middle;
        }

        .word-card-demo .pronunciation {
            font-size: 0.82rem;
            color: var(--red);
            margin: 8px 0 16px;
            letter-spacing: 0.03em;
        }

        .word-card-demo .definition {
            font-size: 0.88rem;
            color: var(--mid);
            line-height: 1.6;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 12px;
            padding: 12px;
        }

        .floating-badge {
            position: absolute;
            right: -20px;
            top: -16px;
            background: var(--green);
            color: white;
            border-radius: 50px;
            padding: 6px 14px;
            font-size: 0.75rem;
            font-weight: 700;
            box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
        }
    </style>
</head>

<body>

    <!-- NAV -->
    <nav>
        <a class="logo" href="#">
            <span class="logo-badge">Fluento</span>
            VocabPix
        </a>
        <div class="nav-links">
            <a href="#word-lists">Word Lists</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#testimonials">Reviews</a>
        </div>
        <a href="#enroll" class="nav-cta">Start for Free →</a>
    </nav>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-eyebrow">🎓 The Smartest Way to Learn Vocabulary</div>
        <h1>Master <span>10,000+ Words</span><br>With Visual Learning</h1>
        <p>VocabPix combines picture-based memory techniques, curated GRE & academic word lists, and gamified progress
            tracking — so words stick for good.</p>
        <div class="hero-actions">
            <a href="#enroll" class="btn-primary">🚀 Enroll Free Today</a>
            <a href="#word-lists" class="btn-secondary">📚 Browse Word Lists</a>
        </div>
        <div class="word-preview-wrap">
            <div class="word-card-demo">
                <span class="floating-badge">✓ I Know!</span>
                <div class="exercise-label">GRE Extended — Sub-List 2</div>
                <div>
                    <span class="the-word">acuity</span>
                    <span class="pos">noun</span>
                </div>
                <div class="pronunciation">uhk-YOO-uht-ee &nbsp;|&nbsp; /əˈkjuəti/</div>
                <div class="definition">Sharpness or keenness of thought, vision, or hearing<br><em
                        style="font-size:0.8rem;color:#aaa;">Synonyms: sharpness, keenness, perception</em></div>
            </div>
        </div>
    </section>

    <!-- STATS BAR -->
    <div class="stats-bar">
        <div class="stat">
            <div class="stat-num">10,000+</div>
            <div class="stat-label">Curated Vocabulary Words</div>
        </div>
        <div class="stat">
            <div class="stat-num">122</div>
            <div class="stat-label">Word Lists Available</div>
        </div>
        <div class="stat">
            <div class="stat-num">4</div>
            <div class="stat-label">Academic Collections</div>
        </div>
        <div class="stat">
            <div class="stat-num">95%</div>
            <div class="stat-label">Learner Retention Rate</div>
        </div>
    </div>

    <!-- WORD LISTS -->
    <section id="word-lists" class="reveal">
        <div class="section-label">📚 Word Lists</div>
        <h2 class="section-title">Curated Collections<br>For Every Goal</h2>
        <p class="section-sub">Whether you're preparing for GRE, building academic vocabulary, or expanding everyday
            English — we have the right list for you.</p>
        <div class="lists-grid">
            <div class="list-card">
                <div class="list-icon">📘</div>
                <div class="list-title">GRE 332</div>
                <div class="list-meta">17 Word Lists · 332 Essential GRE Words</div>
                <div class="list-tags">
                    <span class="tag tag-advanced">⭐ Advanced</span>
                    <span class="tag tag-words">332 words</span>
                </div>
            </div>
            <div class="list-card">
                <div class="list-icon">🎓</div>
                <div class="list-title">GRE Extended</div>
                <div class="list-meta">23 Word Lists · 1,380+ Words</div>
                <div class="list-tags">
                    <span class="tag tag-advanced">⭐ Advanced</span>
                    <span class="tag tag-words">1380 words</span>
                </div>
            </div>
            <div class="list-card">
                <div class="list-icon">🌍</div>
                <div class="list-title">Oxford 3000</div>
                <div class="list-meta">72 Word Lists · Essential English</div>
                <div class="list-tags">
                    <span class="tag tag-advanced">⭐ Core</span>
                    <span class="tag tag-words">3000 words</span>
                </div>
            </div>
            <div class="list-card">
                <div class="list-icon">🏛️</div>
                <div class="list-title">Academic Word List</div>
                <div class="list-meta">10 Word Lists · Academic English</div>
                <div class="list-tags">
                    <span class="tag tag-advanced">⭐ Academic</span>
                    <span class="tag tag-words">570 words</span>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <div class="features-section" id="features">
        <div class="features-inner reveal">
            <div class="section-label">✨ Why VocabPix</div>
            <h2 class="section-title">Built to Make Words<br>Actually Stick</h2>
            <p class="section-sub">Not flashcards. Not plain lists. A full learning system designed around how your
                brain works.</p>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🖼️</div>
                    <div class="feature-title">Picture-Backed Learning</div>
                    <div class="feature-desc">Every word comes with a vivid, contextual image that creates a strong
                        visual memory anchor — proven to improve retention by 65%.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔊</div>
                    <div class="feature-title">Pronunciation Guides</div>
                    <div class="feature-desc">Audio pronunciations, phonetic spelling, and syllable breakdowns — in
                        multiple formats including Bengali transliteration.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🧠</div>
                    <div class="feature-title">Contextual Collocations</div>
                    <div class="feature-desc">See each word used in real example sentences with collocations highlighted
                        — you learn how words actually work together.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">Know / Don't Know System</div>
                    <div class="feature-desc">Tap "I Know" or "I Don't Know" to track mastery. The app intelligently
                        resurfaces words you struggle with.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📝</div>
                    <div class="feature-title">Custom Word Collections</div>
                    <div class="feature-desc">Add your own words, build personal lists, and organize your vocabulary
                        the way you want. Your collection, your way.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🏆</div>
                    <div class="feature-title">Quiz & Practice Mode</div>
                    <div class="feature-desc">Reinforce learned words through targeted quizzes that adapt to your weak
                        spots. Mastery tracked across all sessions.</div>
                </div>
            </div>
        </div>
    </div>

    <!-- HOW IT WORKS -->
    <section id="how-it-works" class="reveal">
        <div class="section-label">🗺️ How It Works</div>
        <h2 class="section-title">From Zero to Fluent<br>in 4 Simple Steps</h2>
        <p class="section-sub">VocabPix removes the friction from vocabulary learning. Start immediately — no setup
            required.</p>
        <div class="steps-grid">
            <div class="step">
                <div class="step-num">1</div>
                <div class="step-title">Pick a Word List</div>
                <div class="step-desc">Choose from GRE, Oxford 3000, Academic Word List, or build your own. Each list
                    is organized into focused sub-lists of 60 words.</div>
            </div>
            <div class="step">
                <div class="step-num">2</div>
                <div class="step-title">Learn with Images</div>
                <div class="step-desc">Each word card shows an expressive image, pronunciation, definition, synonyms,
                    antonyms, and collocations in one view.</div>
            </div>
            <div class="step">
                <div class="step-num">3</div>
                <div class="step-title">Mark Your Progress</div>
                <div class="step-desc">As you go, mark words as "I Know" or "I Don't Know." Mastered words move to your
                    trophy collection automatically.</div>
            </div>
            <div class="step">
                <div class="step-num">4</div>
                <div class="step-title">Earn XP & Keep Streaks</div>
                <div class="step-desc">Complete sessions daily to maintain streaks, earn XP, and hit milestone rewards.
                    The gamified system keeps you coming back.</div>
            </div>
        </div>
    </section>

    <!-- XP GAMIFICATION -->
    <div class="xp-section">
        <div class="xp-inner reveal">
            <div class="xp-content">
                <div class="section-label">⚡ Gamified Learning</div>
                <h2 class="section-title">Earn XP. Build Streaks.<br>Stay Motivated.</h2>
                <p class="section-sub" style="margin-bottom:0;">Learning doesn't have to feel like work. VocabPix
                    rewards your consistency with experience points, milestone badges, and streak freezes to protect
                    your progress.</p>
                <div class="xp-rewards">
                    <div class="xp-reward"><span class="xp-reward-label">✅ Complete a session</span><span
                            class="xp-reward-val">+100 XP</span></div>
                    <div class="xp-reward"><span class="xp-reward-label">🧠 Master a word</span><span
                            class="xp-reward-val">+10 XP</span></div>
                    <div class="xp-reward"><span class="xp-reward-label">📋 Complete a word list</span><span
                            class="xp-reward-val">+50 XP</span></div>
                    <div class="xp-reward"><span class="xp-reward-label">🔥 7-day streak</span><span
                            class="xp-reward-val">+50 XP</span></div>
                    <div class="xp-reward"><span class="xp-reward-label">🏅 30-day streak</span><span
                            class="xp-reward-val">+200 XP</span></div>
                </div>
            </div>
            <div>
                <div class="xp-visual">
                    <div style="font-size:2.5rem;margin-bottom:8px;">⚡</div>
                    <div class="xp-balance">1,250 XP</div>
                    <div class="xp-sub">Your XP Balance</div>
                    <div class="streak-badge">🔥 14-Day Streak Active</div>
                    <div style="margin-top:24px;font-size:0.82rem;color:var(--mid);">Streak freeze: 1 owned · Unlock
                        more in XP Shop</div>
                </div>
            </div>
        </div>
    </div>

    <!-- TESTIMONIALS -->
    <section id="testimonials" class="reveal">
        <div class="section-label">💬 Reviews</div>
        <h2 class="section-title">Learners Love VocabPix</h2>
        <p class="section-sub">From GRE test-takers to English learners worldwide — real people, real results.</p>
        <div class="testimonials">
            <div class="testi-card">
                <div class="stars">★★★★★</div>
                <div class="testi-text">"I've tried Quizlet, Anki, Magoosh — nothing came close to VocabPix. The image
                    association method is genuinely different. I retained 80% of GRE words in 3 weeks."</div>
                <div class="testi-author">
                    <div class="testi-avatar">RS</div>
                    <div>
                        <div class="testi-name">Rahul S.</div>
                        <div class="testi-role">GRE Prep · scored 162 Verbal</div>
                    </div>
                </div>
            </div>
            <div class="testi-card">
                <div class="stars">★★★★★</div>
                <div class="testi-text">"The XP system got me hooked. I haven't broken a streak in 23 days! Learning 60
                    words per session feels manageable, not overwhelming."</div>
                <div class="testi-author">
                    <div class="testi-avatar">TF</div>
                    <div>
                        <div class="testi-name">Tasfia F.</div>
                        <div class="testi-role">University Student · Dhaka</div>
                    </div>
                </div>
            </div>
            <div class="testi-card">
                <div class="stars">★★★★★</div>
                <div class="testi-text">"The Bengali pronunciation transliteration is such a thoughtful touch. Finally
                    an app that considers South Asian learners. Oxford 3000 list is exceptional."</div>
                <div class="testi-author">
                    <div class="testi-avatar">MK</div>
                    <div>
                        <div class="testi-name">Mohammad K.</div>
                        <div class="testi-role">English Teacher · Chittagong</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ENROLL FORM -->
    <div class="form-section" id="enroll">
        <div class="form-inner reveal">
            <div class="section-label">🎯 Get Started</div>
            <h2 class="section-title">Start Learning Today.<br>It's Free.</h2>
            <p class="section-sub">Create your free account and get instant access to all word lists, quizzes, and your
                personal vocabulary collection.</p>

            <div class="enroll-form">
                <div id="enroll-form-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" id="firstName" placeholder="Your first name" />
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" id="lastName" placeholder="Your last name" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="email" placeholder="you@example.com" />
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" placeholder="Create a password" />
                    </div>
                    <div class="form-group">
                        <label>Your Learning Goal</label>
                        <div class="goals-grid" id="goals-grid">
                            <button class="goal-btn" onclick="toggleGoal(this)">📝 GRE Prep</button>
                            <button class="goal-btn" onclick="toggleGoal(this)">🎓 Academic English</button>
                            <button class="goal-btn" onclick="toggleGoal(this)">💼 Professional English</button>
                            <button class="goal-btn" onclick="toggleGoal(this)">🌍 General Fluency</button>
                            <button class="goal-btn" onclick="toggleGoal(this)">📖 IELTS/TOEFL</button>
                            <button class="goal-btn" onclick="toggleGoal(this)">✏️ Other</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>How many words per day?</label>
                        <select id="dailyGoal">
                            <option value="">Select daily goal...</option>
                            <option value="20">20 words/day (Casual)</option>
                            <option value="40">40 words/day (Steady)</option>
                            <option value="60">60 words/day (Intensive)</option>
                            <option value="80">80+ words/day (Expert Mode)</option>
                        </select>
                    </div>
                    <button class="form-submit" onclick="handleEnroll()">🚀 Create My Free Account</button>
                    <div class="form-note">No credit card required. Free forever on core features. By signing up you
                        agree to our Terms & Privacy Policy.</div>
                </div>
                <div class="form-success" id="form-success">
                    <div class="success-icon">🎉</div>
                    <div class="success-title">Welcome to VocabPix!</div>
                    <div class="success-sub">Your account is being created. Check your email to get started — your
                        vocabulary journey begins now.</div>
                    <div style="margin-top:24px;">
                        <a href="https://vocabpix.fluento.org" target="_blank" class="btn-primary"
                            style="display:inline-flex;">Open VocabPix App →</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- FOOTER -->
    <footer>
        <div class="footer-logo">🔴 VocabPix</div>
        <div class="footer-sub">A product by Fluento · Built for serious English learners</div>
        <div class="footer-links">
            <a href="https://vocabpix.fluento.org" target="_blank">App</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
        </div>
        <div>© 2026 Fluento. All rights reserved.</div>
    </footer>

    <script>
        // Scroll reveal
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });
        reveals.forEach(el => observer.observe(el));

        // Goal toggle
        function toggleGoal(btn) {
            btn.classList.toggle('active');
        }

        // Enroll handler
        function handleEnroll() {
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!firstName || !email || !password) {
                alert('Please fill in your name, email, and password to continue.');
                return;
            }
            if (!email.includes('@')) {
                alert('Please enter a valid email address.');
                return;
            }
            if (password.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
            }

            document.getElementById('enroll-form-content').style.display = 'none';
            document.getElementById('form-success').style.display = 'block';
        }
    </script>
</body>

</html>
