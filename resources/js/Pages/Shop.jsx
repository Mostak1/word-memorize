import AppLayout from "@/Layouts/AppLayout";
import { Head, router } from "@inertiajs/react";
import { toast } from "sonner";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Zap,
    Snowflake,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    BookOpen,
    Lock,
    ShoppingBag,
    SunMoon,
} from "lucide-react";
import PurchaseOrderDialog from "@/Components/PurchaseOrderDialog";
import { playXpPurchase } from "@/Utils/sounds";
import { useTranslation } from "@/Contexts/LanguageContext";

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

// ── Tab Bar ───────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }) {
    const { t } = useTranslation();
    const tabs = [
        { id: "shop", label: t("shop.tabs.shop"), icon: ShoppingBag },
        { id: "xp", label: t("shop.tabs.xp"), icon: Zap },
    ];

    return (
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        active === id
                            ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                    <Icon
                        className={`h-4 w-4 ${active === id && id === "xp" ? "text-yellow-400" : ""}`}
                    />
                    {label}
                </button>
            ))}
        </div>
    );
}

// ── Word List Category Card ───────────────────────────────────────────────────

function CategoryCard({ category, index, onClick, categoryStatus }) {
    const { t } = useTranslation();
    const isPending = categoryStatus === "pending";
    const isOwned = categoryStatus === "owned";
    const isBlocked = isPending || isOwned;

    return (
        <div
            onClick={() => !isBlocked && onClick(category)}
            className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col
                ${
                    isBlocked
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:shadow-md active:scale-[0.98] cursor-pointer"
                }`}
            style={{
                animationDelay: `${index * 0.07}s`,
                animation: "fadeInUp 0.4s ease-out forwards",
                opacity: 0,
            }}
        >
            {/* Thumbnail */}
            <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                {category.thumbnail_url_full ? (
                    <img
                        src={category.thumbnail_url_full}
                        alt={category.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 dark:from-red-950/30 to-red-100 dark:to-red-900/30">
                        <span className="text-4xl font-black text-[#E5201C]/40 dark:text-[#E5201C]/20 select-none">
                            {category.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Status badge — replaces or sits alongside the lock badge */}
                {isOwned ? (
                    <div className="absolute top-2 right-2 bg-green-600 rounded-lg px-2 py-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                        <span className="text-white text-[10px] font-bold">
                            {t("shop.status.owned")}
                        </span>
                    </div>
                ) : isPending ? (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-lg px-2 py-1 flex items-center gap-1">
                        <span className="text-white text-[10px] font-bold">
                            {t("shop.status.pending")}
                        </span>
                    </div>
                ) : category.is_locked ? (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-white" />
                        {category.price > 0 && (
                            <span className="text-white text-[10px] font-bold">
                                ৳{category.price}
                            </span>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Info */}
            <div className="px-3.5 py-3 h-[72px] flex flex-col justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                    {category.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        {category.wordlists_count}{" "}
                        {category.wordlists_count === 1
                            ? t("shop.word_list")
                            : t("shop.word_lists")}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Shop Tab ──────────────────────────────────────────────────────────────────

function ShopTab({
    wordListCategories,
    pendingCategoryIds = [],
    accessCategoryIds = [],
}) {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const getCategoryStatus = (id) => {
        if (accessCategoryIds.includes(id)) return "owned";
        if (pendingCategoryIds.includes(id)) return "pending";
        return null;
    };

    const handleCardClick = (category) => {
        setSelectedCategory(category);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setTimeout(() => setSelectedCategory(null), 300);
    };

    if (!wordListCategories || wordListCategories.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-10 w-10 text-gray-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t("shop.no_categories")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("shop.no_categories_desc")}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                {wordListCategories.map((category, index) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        index={index}
                        onClick={handleCardClick}
                        categoryStatus={getCategoryStatus(category.id)}
                    />
                ))}
            </div>

            <PurchaseOrderDialog
                key={selectedCategory?.id ?? "empty"}
                open={dialogOpen}
                onClose={handleClose}
                category={selectedCategory}
            />
        </>
    );
}

// ── XP Shop Sub-components ────────────────────────────────────────────────────

function XpBalanceCard({ balance }) {
    const { t } = useTranslation();
    return (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4">
            <div className="bg-white/20 rounded-xl p-3">
                <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-white/80">
                    {t("shop.xp_balance")}
                </p>
                <p className="text-4xl font-black tracking-tight">
                    {balance.toLocaleString()}
                    <span className="text-lg font-semibold ml-1 text-white/80">
                        {t("shop.xp")}
                    </span>
                </p>
            </div>
        </div>
    );
}

function StreakStatusCard({ streak }) {
    const { t } = useTranslation();
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
              label: t("shop.streak_status.active_today"),
              color: "text-green-600 bg-green-50 border-green-200",
          }
        : at_risk
          ? {
                label: t("shop.streak_status.at_risk"),
                color: "text-orange-600 bg-orange-50 border-orange-200",
            }
          : is_frozen
            ? {
                  label: t("shop.streak_status.frozen"),
                  color: "text-blue-600 bg-blue-50 border-blue-200",
              }
            : is_broken
              ? {
                    label: t("shop.streak_status.lost"),
                    color: "text-red-600 bg-red-50 border-red-200",
                }
              : {
                    label: t("shop.streak_status.none"),
                    color: "text-gray-500 bg-gray-50 border-gray-200",
                };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-3">
                <span className="text-3xl">🔥</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {t("streak.current")}
                </p>
                <p className="text-2xl font-black text-gray-800 dark:text-gray-100">
                    {current_streak}{" "}
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                        {t("streak.days")}
                    </span>
                </p>
                <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${state.color}`}
                >
                    {state.label}
                </span>
            </div>
            <div className="text-right shrink-0">
                <p className="text-xs text-gray-400 mb-1">
                    {t("shop.freezes_owned")}
                </p>
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

function ShopItemCard({
    title,
    description,
    icon: Icon,
    iconBg,
    cost,
    canAfford,
    purchasing,
    onBuy,
    footer,
}) {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className={`${iconBg} p-6 flex items-center gap-4`}>
                <div className="bg-white/30 rounded-xl p-3">
                    <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-white/80">{description}</p>
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                            {t("shop.actions.cost")}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <span className="text-2xl font-black text-gray-800 dark:text-gray-100">
                                {cost.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                                {t("shop.xp")}
                            </span>
                        </div>
                    </div>
                    {!canAfford && (
                        <div className="text-right">
                            <p className="text-xs text-red-400 font-medium">
                                {t("shop.actions.not_enough_xp")}
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
                            : "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
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
                            {t("shop.actions.purchasing")}
                        </span>
                    ) : canAfford ? (
                        t("shop.actions.buy_now")
                    ) : (
                        t("shop.actions.insufficient_xp")
                    )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                    {footer}
                </p>
            </div>
        </div>
    );
}

function HowXpWorks() {
    const { t } = useTranslation();

    const xpSources = useMemo(
        () => [
            {
                label: t("shop.sources.complete_session"),
                xp: "+100 XP",
                note: t("shop.notes.session"),
            },
            {
                label: t("shop.sources.pass_quiz"),
                xp: "+150 XP",
                note: t("shop.notes.pass"),
            },
            {
                label: t("shop.sources.perfect_quiz"),
                xp: "+200 XP",
                note: t("shop.notes.perfect"),
            },
            {
                label: t("shop.sources.master_word"),
                xp: "+10 XP",
                note: t("shop.notes.word"),
            },
            {
                label: t("shop.sources.complete_list"),
                xp: "+50 XP",
                note: t("shop.notes.list"),
            },
            {
                label: t("shop.sources.streak_7"),
                xp: "+50 XP",
                note: t("shop.notes.milestone"),
            },
            {
                label: t("shop.sources.streak_14"),
                xp: "+100 XP",
                note: t("shop.notes.milestone"),
            },
            {
                label: t("shop.sources.streak_30"),
                xp: "+200 XP",
                note: t("shop.notes.milestone"),
            },
        ],
        [t],
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />{" "}
                {t("shop.how_to_earn")}
            </h3>
            <ul className="space-y-2.5">
                {xpSources.map((src) => (
                    <li
                        key={src.label}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="text-gray-600 dark:text-gray-400">
                            {src.label}
                        </span>
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

// ── XP Shop Tab ───────────────────────────────────────────────────────────────

function XpShopTab() {
    const { t } = useTranslation();
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
            showToast(t("shop.toasts.failed_load"), "error");
        } finally {
            setLoading(false);
        }
    }, [t]);

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
                setStatus({
                    xp: data.xp,
                    streak: data.streak,
                    dark_mode_unlocked: data.dark_mode_unlocked,
                });
                showToast(t("shop.toasts.freeze_success"));
                playXpPurchase();
            } else {
                showToast(
                    data.error ?? t("shop.toasts.purchase_failed"),
                    "error",
                );
            }
        } catch {
            showToast(t("shop.toasts.error"), "error");
        } finally {
            setPurchasing(false);
        }
    };

    const handleBuyDarkMode = async () => {
        setPurchasing(true);
        try {
            const data = await apiFetch(route("api.xp-shop.buy-dark-mode"), {
                method: "POST",
            });
            if (data.success) {
                setStatus({
                    xp: data.xp,
                    streak: data.streak,
                    dark_mode_unlocked: data.dark_mode_unlocked,
                });

                // ✅ PERFECT NO-FLASH SOLUTION:
                // 1. Set localStorage FIRST - ThemeProvider watches this
                localStorage.setItem("admin-theme", "dark");
                playXpPurchase();

                // 2. Then reload shared props
                router.reload({
                    only: ["auth"],
                    preserveState: true,
                    preserveScroll: true,
                });

                // ThemeProvider will automatically detect localStorage change and enable dark mode by itself
                showToast(t("shop.toasts.dark_mode_success"));
            } else {
                showToast(
                    data.error ?? t("shop.toasts.purchase_failed"),
                    "error",
                );
            }
        } catch {
            showToast(t("shop.toasts.error"), "error");
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
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
        );
    }

    return (
        <>
            <XpBalanceCard balance={status?.xp?.balance ?? 0} />
            <StreakStatusCard streak={status?.streak} />

            <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t("shop.available_items")}
                </h2>
                <div className="grid gap-3">
                    <ShopItemCard
                        title={t("shop.items.freeze_title")}
                        description={t("shop.items.freeze_desc")}
                        icon={ShieldCheck}
                        iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                        cost={status?.xp?.next_freeze_cost ?? 1000}
                        canAfford={status?.xp?.can_afford_freeze ?? false}
                        purchasing={purchasing}
                        onBuy={handleBuyFreeze}
                        footer={t("shop.items.freeze_footer")}
                    />

                    {!status?.dark_mode_unlocked && (
                        <ShopItemCard
                            title={t("shop.items.dark_mode_title")}
                            description={t("shop.items.dark_mode_desc")}
                            icon={SunMoon}
                            iconBg="bg-gradient-to-br from-slate-700 to-slate-900"
                            cost={6000}
                            canAfford={(status?.xp?.balance ?? 0) >= 6000}
                            purchasing={purchasing}
                            onBuy={handleBuyDarkMode}
                            footer={t("shop.items.dark_mode_footer")}
                        />
                    )}

                    {status?.dark_mode_unlocked && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-3">
                                    <SunMoon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                        {t("shop.items.dark_mode_title")}
                                    </h3>
                                    <p className="text-sm text-green-600 font-medium font-bengali">
                                        {t("shop.items.unlocked")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <HowXpWorks />

            <Toast toast={toast} />
        </>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Shop({
    wordListCategories = [],
    pendingCategoryIds = [],
    accessCategoryIds = [],
    defaultTab = "shop",
}) {
    const { t } = useTranslation();

    // Determine initial tab: from props, or from URL query parameter, or default to "shop"
    const getInitialTab = () => {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get("tab");
        if (tabFromUrl === "xp" || tabFromUrl === "shop") {
            return tabFromUrl;
        }
        // Fallback to prop value if valid
        if (defaultTab === "xp" || defaultTab === "shop") {
            return defaultTab;
        }
        // Default fallback
        return "shop";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    return (
        <AppLayout>
            <Head
                title={
                    activeTab === "shop"
                        ? t("shop.title")
                        : t("shop.xp_shop_title")
                }
            />

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20 space-y-5">
                    {/* Page header */}
                    <div style={{ animation: "fadeInUp 0.3s ease-out" }}>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                            {activeTab === "shop"
                                ? t("shop.title")
                                : t("shop.xp_shop_title")}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {activeTab === "shop"
                                ? t("shop.subtitle_shop")
                                : t("shop.subtitle_xp")}
                        </p>
                    </div>

                    {/* Tab bar */}
                    <TabBar active={activeTab} onChange={setActiveTab} />

                    {/* Tab content */}
                    <div className="space-y-5">
                        {activeTab === "shop" ? (
                            <ShopTab
                                wordListCategories={wordListCategories}
                                pendingCategoryIds={pendingCategoryIds}
                                accessCategoryIds={accessCategoryIds}
                            />
                        ) : (
                            <XpShopTab />
                        )}
                    </div>
                </main>

                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(12px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
