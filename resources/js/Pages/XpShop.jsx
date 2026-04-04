import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import {
    Zap,
    Snowflake,
    ShieldCheck,
    CheckCircle2,
    XCircle,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCsrf() {
    return decodeURIComponent(
        document.cookie
            .split("; ")
            .find((r) => r.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] ?? "",
    );
}

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            "X-XSRF-TOKEN": getCsrf(),
            Accept: "application/json",
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });
    return res.json();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function XpBalanceCard({ balance }) {
    return (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-3">
                <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-white/80">
                    Your XP Balance
                </p>
                <p className="text-4xl font-black tracking-tight">
                    {balance.toLocaleString()}
                    <span className="text-lg font-semibold ml-1 text-white/80">
                        XP
                    </span>
                </p>
            </div>
        </div>
    );
}

function StreakStatusCard({ streak }) {
    if (!streak) return null;

    const {
        current_streak,
        freeze_count,
        active_today,
        at_risk,
        is_frozen,
        is_broken,
    } = streak;

    const state = active_today
        ? {
              label: "Active today ✅",
              color: "text-green-600 bg-green-50 border-green-200",
          }
        : at_risk
          ? {
                label: "At risk — study today! ⚠️",
                color: "text-orange-600 bg-orange-50 border-orange-200",
            }
          : is_frozen
            ? {
                  label: "Frozen — you still have a chance 🧊",
                  color: "text-blue-600 bg-blue-50 border-blue-200",
              }
            : is_broken
              ? {
                    label: "Streak lost 💀",
                    color: "text-red-600 bg-red-50 border-red-200",
                }
              : {
                    label: "No streak yet",
                    color: "text-gray-500 bg-gray-50 border-gray-200",
                };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-orange-50 rounded-xl p-3">
                <span className="text-3xl">🔥</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 font-medium">
                    Current Streak
                </p>
                <p className="text-2xl font-black text-gray-800">
                    {current_streak}{" "}
                    <span className="text-base font-medium text-gray-500">
                        days
                    </span>
                </p>
                <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${state.color}`}
                >
                    {state.label}
                </span>
            </div>
            <div className="text-right shrink-0">
                <p className="text-xs text-gray-400 mb-1">Freezes owned</p>
                <div className="flex items-center gap-1 justify-end">
                    <Snowflake className="h-4 w-4 text-blue-400" />
                    <span className="text-lg font-bold text-blue-500">
                        {freeze_count}
                    </span>
                </div>
            </div>
        </div>
    );
}

function Toast({ toast }) {
    if (!toast) return null;
    const isSuccess = toast.type === "success";
    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
                isSuccess ? "bg-green-500" : "bg-red-500"
            }`}
        >
            {isSuccess ? (
                <CheckCircle2 className="h-5 w-5" />
            ) : (
                <XCircle className="h-5 w-5" />
            )}
            {toast.message}
        </div>
    );
}

// ── Shop Item Card ────────────────────────────────────────────────────────────

function ShopItemCard({
    title,
    description,
    icon: Icon,
    iconBg,
    cost,
    canAfford,
    purchasing,
    onBuy,
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`${iconBg} p-6 flex items-center gap-4`}>
                <div className="bg-white/30 rounded-xl p-3">
                    <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-white/80">{description}</p>
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                            Cost
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <span className="text-2xl font-black text-gray-800">
                                {cost.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                                XP
                            </span>
                        </div>
                    </div>

                    {!canAfford && (
                        <div className="text-right">
                            <p className="text-xs text-red-400 font-medium">
                                Not enough XP
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onBuy}
                    disabled={!canAfford || purchasing}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        canAfford && !purchasing
                            ? "bg-[#E5201C] hover:bg-red-700 text-white shadow-sm active:scale-95"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {purchasing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                            Purchasing…
                        </span>
                    ) : canAfford ? (
                        "Buy Now"
                    ) : (
                        "Insufficient XP"
                    )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                    Protects your streak for one missed day
                </p>
            </div>
        </div>
    );
}

// ── How XP Works section ──────────────────────────────────────────────────────

const XP_SOURCES = [
    { label: "Complete a session", xp: "+100 XP", note: "up to 2× per day" },
    { label: "Master a word", xp: "+10 XP", note: "per word" },
    { label: "Complete a word list", xp: "+50 XP", note: "one-time bonus" },
    { label: "7-day streak", xp: "+50 XP", note: "milestone reward" },
    { label: "14-day streak", xp: "+100 XP", note: "milestone reward" },
    { label: "30-day streak", xp: "+200 XP", note: "milestone reward" },
];

function HowXpWorks() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" /> How to earn XP
            </h3>
            <ul className="space-y-2.5">
                {XP_SOURCES.map((src) => (
                    <li
                        key={src.label}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="text-gray-600">{src.label}</span>
                        <div className="text-right">
                            <span className="font-bold text-yellow-500">
                                {src.xp}
                            </span>
                            <span className="text-gray-400 ml-1 text-xs">
                                ({src.note})
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function XpShop() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchStatus = useCallback(async () => {
        try {
            const data = await apiFetch(route("api.xp-shop.status"));
            setStatus(data);
        } catch {
            showToast("Failed to load shop data.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleBuyFreeze = async () => {
        setPurchasing(true);
        try {
            const data = await apiFetch(route("api.xp-shop.buy-freeze"), {
                method: "POST",
            });

            if (data.success) {
                setStatus({ xp: data.xp, streak: data.streak });
                showToast("Streak freeze purchased! 🧊");
            } else {
                showToast(data.error ?? "Purchase failed.", "error");
            }
        } catch {
            showToast("Something went wrong.", "error");
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <AppLayout>
            <Head title="XP Shop" />

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
                {/* Page title */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900">
                        XP Shop
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Spend your earned XP to protect your learning streak.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <svg
                            className="animate-spin h-8 w-8 text-[#E5201C]"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                    </div>
                ) : (
                    <>
                        {/* XP balance */}
                        <XpBalanceCard balance={status?.xp?.balance ?? 0} />

                        {/* Streak status */}
                        <StreakStatusCard streak={status?.streak} />

                        {/* Shop items */}
                        <div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                                Available items
                            </h2>
                            <ShopItemCard
                                title="Streak Freeze"
                                description="Skip one missed day without losing your streak."
                                icon={ShieldCheck}
                                iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                                cost={status?.xp?.next_freeze_cost ?? 1000}
                                canAfford={
                                    status?.xp?.can_afford_freeze ?? false
                                }
                                purchasing={purchasing}
                                onBuy={handleBuyFreeze}
                            />
                        </div>

                        {/* How XP works */}
                        <HowXpWorks />
                    </>
                )}
            </div>

            <Toast toast={toast} />
        </AppLayout>
    );
}
