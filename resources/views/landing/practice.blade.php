<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VocabPix — Learn Vocabulary Scientifically</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <style>
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
            font-family: 'Nunito', sans-serif;
            color: var(--body);
            background: var(--bg);
            overflow-x: hidden;
        }

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
            font-size: clamp(2.2rem, 4.5vw, 3.4rem);
            font-weight: 900;
            line-height: 1.1;
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

        .hero-visual {
            position: relative;
            display: flex;
            justify-content: center;
        }

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
            z-index: 2;
            transform: rotate(3deg);
            opacity: .7;
            background: #FFF8F8;
        }

        .wc-back2 {
            width: 280px;
            left: 30px;
            top: 0;
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

        .wc-label {
            font-size: .7rem;
            color: var(--muted);
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .wc-word {
            font-size: 2rem;
            font-weight: 900;
            color: var(--dark);
        }

        .wc-pos {
            background: #F3F4F6;
            border-radius: 5px;
            padding: 2px 8px;
            font-size: .7rem;
            font-weight: 700;
            color: var(--muted);
            margin-left: 6px;
        }

        .wc-phonetic {
            font-size: .82rem;
            color: var(--red);
            margin: 6px 0 14px;
        }

        .wc-img {
            width: 100%;
            height: 130px;
            border-radius: 12px;
            background: linear-gradient(135deg, #FFF0F1, #FFE4E6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3.5rem;
            margin-bottom: 14px;
        }

        .wc-def {
            font-size: .82rem;
            color: var(--body);
            line-height: 1.6;
            background: #F9FAFB;
            border-radius: 10px;
            padding: 10px 12px;
        }

        .wc-actions {
            display: flex;
            gap: 8px;
            margin-top: 14px;
        }

        .wc-btn-no {
            flex: 1;
            padding: 9px;
            border-radius: 10px;
            border: 1.5px solid #FFCDD1;
            background: #FFF5F5;
            color: var(--red);
            font-weight: 700;
            font-size: .8rem;
            cursor: pointer;
        }

        .wc-btn-yes {
            flex: 1;
            padding: 9px;
            border-radius: 10px;
            background: var(--green);
            color: #fff;
            font-weight: 700;
            font-size: .8rem;
            border: none;
            cursor: pointer;
        }

        .float-badge {
            position: absolute;
            background: #fff;
            border-radius: 12px;
            padding: 10px 14px;
            border: 1.5px solid var(--border);
            box-shadow: 0 4px 20px rgba(0, 0, 0, .08);
            font-size: .78rem;
            font-weight: 700;
            white-space: nowrap;
        }

        .badge-streak {
            right: -20px;
            top: 30px;
            color: #FF6B00;
        }

        .badge-mastered {
            left: -30px;
            bottom: 60px;
            color: var(--green);
        }

        .badge-xp {
            right: -10px;
            bottom: 100px;
            color: var(--blue);
        }

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

        .exams-section {
            max-width: 1140px;
            margin: 0 auto;
            padding: 80px 24px;
        }

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
            font-family: 'Hind Siliguri', sans-serif;
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
            font-family: 'Nunito', sans-serif;
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
            font-family: 'Nunito', sans-serif;
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

        .pricing-section {
            background: #fff;
            padding: 80px 24px;
        }

        .pricing-inner {
            max-width: 900px;
            margin: 0 auto;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .price-card {
            border: 2px solid var(--border);
            border-radius: 20px;
            padding: 36px;
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
            font-family: 'Nunito', sans-serif;
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
            font-family: 'Nunito', sans-serif;
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
            font-family: 'Nunito', sans-serif;
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
            font-family: 'Nunito', sans-serif;
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
            font-family: 'Nunito', sans-serif;
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

        .sr {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity .6s ease, transform .6s ease;
        }

        .sr.vis {
            opacity: 1;
            transform: none;
        }

        @media(max-width:900px) {
            nav {
                padding: 0 20px;
            }

            .nav-links {
                display: none;
            }

            .hero {
                grid-template-columns: 1fr;
                gap: 40px;
                padding: 60px 20px 40px;
            }

            .hero-visual {
                display: none;
            }

            .feat-grid {
                grid-template-columns: 1fr;
            }

            .feat-card.big {
                grid-row: auto;
            }

            .bangla-inner {
                grid-template-columns: 1fr;
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

            .stat-item {
                padding: 20px 28px;
                border-right: none;
                border-bottom: 1px solid rgba(255, 255, 255, .1);
            }
        }
    </style>
</head>

<body>
    <div class="topbar">🎓 GRE, IELTS, BCS, SAT, Medical & more — All in one place <span>Free to Start</span></div>
    <nav>
        <a class="nav-logo" href="#">
            <div class="nav-logo-mark">V</div><span class="nav-logo-text">VocabPix <sup>BETA</sup></span>
        </a>
        <div class="nav-links"><a href="#exams">Word Lists</a><a href="#features">Features</a><a
                href="#bangla">Bangla</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
        <div class="nav-right"><a href="https://vocabpix.fluento.org" class="btn-ghost" target="_blank">Login</a><a
                href="#enroll" class="btn-red">Register Free →</a></div>
    </nav>
    <section>
        <div class="hero">
            <div class="hero-left">
                <div class="hero-badge">🔬 Scientific Vocabulary Learning</div>
                <h1>Learn English Vocabulary <em>Fast & Smart</em> — in Bangla & English</h1>
                <p class="hero-sub">VocabPix uses visual memory techniques, spaced repetition, and Bangla-English
                    bilingual support to help you master 10,000+ words for exams and everyday fluency.</p>
                <div class="hero-exam-tags"><span class="exam-tag">📝 GRE</span><span class="exam-tag">🎓
                        IELTS</span><span class="exam-tag">📖 BCS</span><span class="exam-tag">💼 BBA</span><span
                        class="exam-tag">🏥 Medical</span><span class="exam-tag">📐 SAT</span></div>
                <div class="hero-actions"><a href="#enroll" class="btn-hero btn-hero-primary">🚀 Start Learning
                        Free</a><a href="https://vocabpix.fluento.org" class="btn-hero btn-hero-secondary"
                        target="_blank">👀 Explore App</a></div>
                <div class="hero-trust">
                    <div class="trust-avatars">
                        <div class="trust-avatar" style="background:#E8192C">R</div>
                        <div class="trust-avatar" style="background:#2563EB">T</div>
                        <div class="trust-avatar" style="background:#1DB954">M</div>
                        <div class="trust-avatar" style="background:#FF6B00">S</div>
                    </div>
                    <span>Joined by <strong>5,000+</strong> learners this month</span>
                </div>
            </div>
            <div class="hero-visual">
                <div class="card-stack">
                    <div class="word-card wc-back2"></div>
                    <div class="word-card wc-back1"></div>
                    <div class="word-card wc-main">
                        <div class="wc-label">GRE Extended — Sub-List 2</div>
                        <div><span class="wc-word">acuity</span><span class="wc-pos">noun</span></div>
                        <div class="wc-phonetic">uhk-YOO-uht-ee | অক·যউ·অট·ই</div>
                        <div class="wc-img">🔬</div>
                        <div class="wc-def">Sharpness or keenness of thought, vision, or hearing<br><em
                                style="font-size:.75rem;color:#aaa;">চিন্তা বা দৃষ্টিশক্তির তীক্ষ্ণতা</em></div>
                        <div class="wc-actions"><button class="wc-btn-no">✕ Don't Know</button><button
                                class="wc-btn-yes">✓ I Know!</button></div>
                    </div>
                    <div class="float-badge badge-streak">🔥 14-Day Streak</div>
                    <div class="float-badge badge-mastered">✓ 340 Mastered</div>
                    <div class="float-badge badge-xp">⚡ 1,250 XP</div>
                </div>
            </div>
        </div>
    </section>
    <div class="stats-row">
        <div class="stat-item">
            <div class="stat-n">10<span>K+</span></div>
            <div class="stat-l">Curated Words</div>
        </div>
        <div class="stat-item">
            <div class="stat-n">122</div>
            <div class="stat-l">Word Lists</div>
        </div>
        <div class="stat-item">
            <div class="stat-n">6</div>
            <div class="stat-l">Exam Categories</div>
        </div>
        <div class="stat-item">
            <div class="stat-n">95<span>%</span></div>
            <div class="stat-l">Retention Rate</div>
        </div>
        <div class="stat-item">
            <div class="stat-n">5<span>K+</span></div>
            <div class="stat-l">Active Learners</div>
        </div>
    </div>
    <section class="exams-section sr" id="exams">
        <div class="section-eyebrow">📚 Word Lists</div>
        <h2 class="section-title">Curated for Your Exam Goal</h2>
        <p class="section-sub">Whether it's GRE, IELTS, BCS, or everyday fluency — every word list is organized,
            level-tagged, and ready to learn.</p>
        <div class="exams-grid">
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">📘</div>
                <div class="exam-name">GRE 332</div>
                <div class="exam-words">17 Lists · 332 Words</div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🎓</div>
                <div class="exam-name">GRE Extended</div>
                <div class="exam-words">23 Lists · 1,380 Words</div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🌍</div>
                <div class="exam-name">Oxford 3000</div>
                <div class="exam-words">72 Lists · 3,000 Words</div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🏛️</div>
                <div class="exam-name">Academic Word List</div>
                <div class="exam-words">10 Lists · 570 Words</div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">📝</div>
                <div class="exam-name">IELTS Essentials</div>
                <div class="exam-words">Coming Soon</div>
            </a>
            <a class="exam-card" href="https://vocabpix.fluento.org" target="_blank">
                <div class="exam-icon">🏥</div>
                <div class="exam-name">Medical Vocab</div>
                <div class="exam-words">Coming Soon</div>
            </a>
        </div>
    </section>
    <div class="how-section">
        <div class="how-inner sr">
            <div class="section-eyebrow">🗺️ How It Works</div>
            <h2 class="section-title">From Zero to Fluent in 4 Steps</h2>
            <p class="section-sub">No complicated setup. Open the app and start in under 60 seconds.</p>
            <div class="how-steps">
                <div class="how-step">
                    <div class="how-step-num">1</div>
                    <div class="how-step-icon">📋</div>
                    <h3>Pick a List</h3>
                    <p>Choose GRE, Oxford 3000, Academic, or your own list. Each split into 60-word sub-lists.</p>
                    <div class="how-step-arrow">›</div>
                </div>
                <div class="how-step">
                    <div class="how-step-num">2</div>
                    <div class="how-step-icon">🖼️</div>
                    <h3>Learn with Images</h3>
                    <p>Each word card shows an image, pronunciation, Bangla definition, synonyms, antonyms &
                        collocations.</p>
                    <div class="how-step-arrow">›</div>
                </div>
                <div class="how-step">
                    <div class="how-step-num">3</div>
                    <div class="how-step-icon">🧠</div>
                    <h3>Rate Your Memory</h3>
                    <p>Tap "I Know" or "I Don't Know." Hard words resurface automatically. Track your mastered count.
                    </p>
                    <div class="how-step-arrow">›</div>
                </div>
                <div class="how-step">
                    <div class="how-step-num">4</div>
                    <div class="how-step-icon">🏆</div>
                    <h3>Earn XP & Streak</h3>
                    <p>Daily sessions build your streak. Earn XP for sessions, mastered words, and completed lists.</p>
                </div>
            </div>
        </div>
    </div>
    <section class="feat-section sr" id="features">
        <div class="section-eyebrow">✨ Features</div>
        <h2 class="section-title">Everything You Need to Master Words</h2>
        <p class="section-sub">Not flashcards. Not a dictionary. A complete vocabulary system.</p>
        <div class="feat-grid">
            <div class="feat-card big">
                <div class="feat-icon">🖼️</div>
                <h3>Picture-Memory Learning</h3>
                <p>Every word is anchored to a vivid, contextual image. Visual memory increases retention by up to 65%
                    compared to plain text — your brain never forgets an image it has truly seen.</p>
                <br>
                <p>Our image-word pairing engine ensures the picture matches the word's meaning, tone, and usage — not
                    just a generic stock photo.</p>
                <div class="feat-pill-row"><span class="feat-pill">65% better retention</span><span
                        class="feat-pill">Contextual images</span><span class="feat-pill">Visual anchors</span></div>
            </div>
            <div class="feat-card">
                <div class="feat-icon">🔊</div>
                <h3>Audio + Phonetic Pronunciation</h3>
                <p>Hear every word spoken aloud. Get phonetic spelling in English and Bangla transliteration so you know
                    exactly how to say it.</p>
            </div>
            <div class="feat-card">
                <div class="feat-icon">🔄</div>
                <h3>Synonyms, Antonyms & Collocations</h3>
                <p>See how words connect — synonyms, antonyms, and real sentence collocations so you learn words in
                    context, not in isolation.</p>
            </div>
            <div class="feat-card">
                <div class="feat-icon">⚡</div>
                <h3>XP & Gamified Streaks</h3>
                <p>Earn XP for sessions, mastered words, and completed lists. Build daily streaks. Hit milestones. Stay
                    hooked on learning.</p>
            </div>
            <div class="feat-card">
                <div class="feat-icon">📝</div>
                <h3>Custom Word Collections</h3>
                <p>Add any word you encounter — in class, reading, or exams. Build personal lists and practice them
                    anytime.</p>
            </div>
        </div>
    </section>
    <div class="bangla-section">
        <div class="bangla-inner sr" id="bangla">
            <div>
                <div class="section-eyebrow">🇧🇩 Bangla Support</div>
                <h2 class="section-title" style="color:#fff">শিখুন বাংলায়,<br>জিতুন ইংরেজিতে</h2>
                <p class="section-sub">The only vocabulary app built with Bengali learners in mind — definitions,
                    pronunciation guides, and memory cues all available in Bangla.</p>
                <div class="bangla-perks">
                    <div class="bangla-perk">
                        <div class="perk-dot"></div>
                        <div class="perk-text"><strong>Bangla definitions</strong> — understand word meaning in your
                            native language first, then internalize the English.</div>
                    </div>
                    <div class="bangla-perk">
                        <div class="perk-dot"></div>
                        <div class="perk-text"><strong>Bengali phonetic guide</strong> — every word has a Bangla script
                            pronunciation (অক·যউ·অট·ই) so you say it correctly from day one.</div>
                    </div>
                    <div class="bangla-perk">
                        <div class="perk-dot"></div>
                        <div class="perk-text"><strong>Exam-focused lists</strong> — GRE, IELTS, BCS, BBA, SAT and
                            Medical words used in Bangladesh's top competitive exams.</div>
                    </div>
                </div>
            </div>
            <div>
                <div class="bangla-card">
                    <div class="bangla-word">acuity</div>
                    <div class="bangla-eng">noun · uhk-YOO-uht-ee · <span
                            style="font-size:.82rem;color:#FF8A94">অক·যউ·অট·ই</span></div>
                    <div class="bangla-def-label">বাংলা সংজ্ঞা</div>
                    <div class="bangla-def">চিন্তাশক্তি, দৃষ্টিশক্তি বা শ্রবণশক্তির তীক্ষ্ণতা বা প্রখরতা। কোনো বিষয়কে
                        স্পষ্ট ও সূক্ষ্মভাবে বোঝার ক্ষমতা।</div>
                    <div class="bangla-def-label">সমার্থক শব্দ</div>
                    <div class="bangla-syn">
                        <span>sharpness</span><span>keenness</span><span>perception</span><span>astuteness</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <section class="testi-section sr" id="testimonials">
        <div class="section-eyebrow">💬 Reviews</div>
        <h2 class="section-title">Learners Love VocabPix</h2>
        <p class="section-sub">Real feedback from real students — from Dhaka to diaspora.</p>
        <div class="testi-grid">
            <div class="testi-card">
                <div class="testi-stars">★★★★★</div>
                <div class="testi-quote">"I scored 162 on GRE Verbal after 6 weeks on VocabPix. The image anchoring is
                    genuinely different — I could picture every word during the exam."</div>
                <div class="testi-person">
                    <div class="testi-av" style="background:#E8192C">RS</div>
                    <div>
                        <div class="testi-name">Rahul S.</div>
                        <div class="testi-role">GRE Prep · scored 162 Verbal</div>
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
                        <div class="testi-role">University Student · Dhaka</div>
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
                        <div class="testi-role">English Teacher · Chittagong</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <div class="pricing-section sr" id="pricing">
        <div class="pricing-inner">
            <div style="text-align:center;margin-bottom:48px">
                <div class="section-eyebrow" style="text-align:center">💳 Pricing</div>
                <h2 class="section-title" style="text-align:center">Simple, Honest Pricing</h2>
                <p class="section-sub" style="margin:0 auto;text-align:center">Start free. Upgrade when you're ready.
                </p>
            </div>
            <div class="pricing-grid">
                <div class="price-card">
                    <div class="price-plan">Free</div>
                    <div class="price-amount"><sub>৳</sub>0</div>
                    <div class="price-period">Forever free</div>
                    <ul class="price-features">
                        <li>All public word lists</li>
                        <li>Image + audio for every word</li>
                        <li>Bangla definitions & phonetics</li>
                        <li>XP & streak tracking</li>
                        <li>Basic quiz mode</li>
                        <li class="no">Custom word collections</li>
                        <li class="no">Streak freeze protection</li>
                        <li class="no">Offline mode</li>
                    </ul>
                    <a href="#enroll" class="btn-ghost" style="display:block;text-align:center;padding:13px">Start
                        Free →</a>
                </div>
                <div class="price-card featured">
                    <div class="price-badge">🔥 Most Popular</div>
                    <div class="price-plan">Pro</div>
                    <div class="price-amount"><sub>৳</sub>299</div>
                    <div class="price-period">per month · cancel anytime</div>
                    <ul class="price-features">
                        <li>Everything in Free</li>
                        <li>Unlimited custom collections</li>
                        <li>Streak freeze protection</li>
                        <li>Offline mode</li>
                        <li>Advanced quiz analytics</li>
                        <li>Early access to new lists</li>
                        <li>Ad-free experience</li>
                    </ul>
                    <a href="#enroll" class="btn-red"
                        style="display:block;text-align:center;padding:13px;border-radius:12px;font-size:.95rem">Get
                        Pro — ৳299/mo →</a>
                </div>
            </div>
        </div>
    </div>
    <div class="enroll-section" id="enroll">
        <div class="enroll-inner sr">
            <h2 class="enroll-title">শুরু করুন আজই। বিনামূল্যে।</h2>
            <p class="enroll-sub">Create your free account and access all word lists, quizzes, and your personal
                vocabulary journal instantly.</p>
            <div class="enroll-form">
                <div id="form-body">
                    <div class="form-tabs"><button class="form-tab active"
                            onclick="setTab(this,'register')">Register</button><button class="form-tab"
                            onclick="setTab(this,'login')">Login</button></div>
                    <div id="tab-register">
                        <div class="form-row">
                            <div class="fg"><label>First Name</label><input type="text" id="fn" placeholder="Your name">
                            </div>
                            <div class="fg"><label>Last Name</label><input type="text" id="ln" placeholder="Last name">
                            </div>
                        </div>
                        <div class="fg"><label>Email Address</label><input type="email" id="em"
                                placeholder="you@example.com"></div>
                        <div class="fg"><label>Password</label><input type="password" id="pw"
                                placeholder="Min. 6 characters"></div>
                        <div class="fg"><label>Your Learning Goal</label>
                            <div class="goal-chips"><button class="goal-chip" onclick="toggleChip(this)">📝
                                    GRE</button><button class="goal-chip" onclick="toggleChip(this)">🎓
                                    IELTS</button><button class="goal-chip" onclick="toggleChip(this)">📖
                                    BCS</button><button class="goal-chip" onclick="toggleChip(this)">💼
                                    BBA</button><button class="goal-chip" onclick="toggleChip(this)">🏥
                                    Medical</button><button class="goal-chip" onclick="toggleChip(this)">✏️
                                    Other</button></div>
                        </div>
                        <div class="fg"><label>Daily Word Target</label><select id="dg">
                                <option value="">Choose daily goal...</option>
                                <option>20 words/day — Casual</option>
                                <option>40 words/day — Steady</option>
                                <option>60 words/day — Intensive</option>
                                <option>80+ words/day — Expert</option>
                            </select></div>
                        <button class="form-submit" onclick="doRegister()">🚀 Create Free Account</button>
                    </div>
                    <div id="tab-login" style="display:none">
                        <div class="fg"><label>Email</label><input type="email" placeholder="you@example.com">
                        </div>
                        <div class="fg"><label>Password</label><input type="password" placeholder="Your password"></div>
                        <button class="form-submit" onclick="window.open('https://vocabpix.fluento.org','_blank')">Login
                            to VocabPix →</button>
                        <p class="form-note" style="margin-top:12px">No account? <a href="#"
                                onclick="switchToRegister()" style="color:var(--red);font-weight:700">Register
                                free</a></p>
                    </div>
                    <p class="form-note">No credit card needed. Free forever on core features.</p>
                </div>
                <div class="success-msg" id="success-msg">
                    <div class="s-icon">🎉</div>
                    <h3>Welcome to VocabPix!</h3>
                    <p>Your account is ready. Check your email to verify and start learning.</p><a
                        href="https://vocabpix.fluento.org" target="_blank" class="btn-red"
                        style="display:inline-block;padding:14px 28px;border-radius:12px">Open VocabPix App →</a>
                </div>
            </div>
        </div>
    </div>
    <section class="faq-section sr" id="faq">
        <div style="text-align:center;margin-bottom:48px">
            <div class="section-eyebrow" style="text-align:center">❓ FAQ</div>
            <h2 class="section-title" style="text-align:center">Common Questions</h2>
        </div>
        <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Is VocabPix really free? <span
                    class="faq-icon">+</span></button>
            <div class="faq-a">Yes — all public word lists (GRE, Oxford 3000, Academic), images, audio, Bangla
                definitions, XP tracking and quizzes are completely free. Pro adds custom collections, streak
                protection, and offline mode.</div>
        </div>
        <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Why does VocabPix use images? <span
                    class="faq-icon">+</span></button>
            <div class="faq-a">Visual memory is one of the strongest memory systems in the brain. Pairing a word with
                a vivid image creates a "memory anchor." Studies show picture-word pairing improves long-term retention
                by 40–65% over text-only methods.</div>
        </div>
        <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Does it work for BCS and local
                Bangladesh exams? <span class="faq-icon">+</span></button>
            <div class="faq-a">Yes. BCS and Medical vocabulary lists are in development. GRE Extended and Academic
                Word List already have significant overlap with BCS English sections.</div>
        </div>
        <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">How is this different from Quizlet or
                Anki? <span class="faq-icon">+</span></button>
            <div class="faq-a">Quizlet and Anki are general tools — you build your own content. VocabPix is
                purpose-built for South Asian English learners, with professionally curated lists, contextual images,
                Bangla support, collocations, and a gamification system all built in.</div>
        </div>
        <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">Can I add my own words? <span
                    class="faq-icon">+</span></button>
            <div class="faq-a">Yes! "Add New Word" lets you create personal word entries with definition,
                pronunciation, and part of speech. Pro unlocks unlimited custom collections with full image and audio
                support.</div>
        </div>
    </section>
    <footer>
        <div class="footer-inner">
            <div class="footer-top">
                <div class="footer-brand">
                    <div class="footer-logo-text">🔴 VocabPix</div>
                    <p>A Fluento product · Learn vocabulary the fast and proven way — both in Bangla and English. Built
                        for GRE, IELTS, BCS, BBA, Medical, and SAT learners.</p><a href="https://vocabpix.fluento.org"
                        target="_blank" class="btn-red"
                        style="display:inline-block;padding:10px 20px;font-size:.85rem">Open App →</a>
                </div>
                <div>
                    <div class="footer-heading">Word Lists</div>
                    <div class="footer-links-col"><a href="#">GRE 332</a><a href="#">GRE Extended</a><a href="#">Oxford
                            3000</a><a href="#">Academic Word List</a></div>
                </div>
                <div>
                    <div class="footer-heading">Product</div>
                    <div class="footer-links-col"><a href="#">Features</a><a href="#pricing">Pricing</a><a href="#">Quiz
                            Mode</a><a href="#">XP Shop</a></div>
                </div>
                <div>
                    <div class="footer-heading">Company</div>
                    <div class="footer-links-col"><a href="#">About Fluento</a><a href="#">Privacy
                            Policy</a><a href="#">Terms</a><a href="#">Contact</a></div>
                </div>
            </div>
            <div class="footer-bottom"><span>© 2026 Fluento. All rights reserved.</span><span>Made with ❤️ for
                    Bangladeshi learners</span></div>
        </div>
    </footer>
    <script>
        const obs = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('vis');
        }), {
            threshold: .1
        });
        document.querySelectorAll('.sr').forEach(el => obs.observe(el));

        function toggleFaq(btn) {
            const a = btn.nextElementSibling,
                icon = btn.querySelector('.faq-icon');
            a.classList.toggle('open');
            icon.classList.toggle('open');
        }

        function toggleChip(el) {
            el.classList.toggle('active');
        }

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
            if (!fn || !em || !pw) {
                alert('Please fill in your name, email, and password.');
                return;
            }
            if (!em.includes('@')) {
                alert('Please enter a valid email address.');
                return;
            }
            if (pw.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
            }
            document.getElementById('form-body').style.display = 'none';
            document.getElementById('success-msg').style.display = 'block';
        }
    </script>
</body>

</html>