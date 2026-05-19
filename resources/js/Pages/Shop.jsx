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
    Package,
    ShoppingBag,
    SunMoon,
    Tag,
    Copy,
    Check,
    Sparkles,
    AlertTriangle,
    ExternalLink,
    GraduationCap,
} from "lucide-react";
import PurchaseOrderDialog from "@/Components/PurchaseOrderDialog";
import XpPurchaseDialog from "@/Components/XpPurchaseDialog";
import { playXpPurchase } from "@/Utils/sounds";
import { useTranslation } from "@/Contexts/LanguageContext";
import FlameVisual from "@/Components/FlameVisual";

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
        { id: "rewards", label: t("shop.tabs.rewards"), icon: Tag },
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
                        className={`h-4 w-4 ${active === id && id === "xp" ? "text-yellow-400" : ""} ${active === id && id === "rewards" ? "text-green-500" : ""}`}
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
            <div className="px-3.5 py-3 h-[100px] flex flex-col justify-between">
                <h2
                    className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-3"
                    title={category.name}
                >
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

function AllCategoriesOfferCard({ offer, onClick }) {
    const { t } = useTranslation();
    if (!offer) return null;

    const isPending = offer.status === "pending";
    const isOwned = offer.status === "owned";
    const isBlocked = isPending || isOwned || !offer.category_ids?.length;
    const originalPrice = Number(offer.original_price ?? 0);
    const offerPrice = Number(offer.price ?? 0);
    const hasDiscount = originalPrice > offerPrice;
    const discountPercent =
        Number(offer.discount_percent ?? 0) ||
        (hasDiscount
            ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
            : 0);
    const thumbnailUrl = offer.thumbnail_url_full ?? "/img/all_wordlists.webp";

    return (
        <button
            type="button"
            onClick={() => !isBlocked && onClick(offer)}
            disabled={isBlocked}
            className={`w-full text-left rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-red-100 dark:border-red-900/40 transition-all ${
                isBlocked
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-md active:scale-[0.99]"
            }`}
            style={{
                animation: "fadeInUp 0.35s ease-out forwards",
                opacity: 0,
            }}
        >
            <div className="relative aspect-[16/9] bg-red-50 dark:bg-slate-800 overflow-hidden">
                <img
                    src={thumbnailUrl}
                    alt={offer.name}
                    className="h-full w-full object-cover"
                />
                {discountPercent > 0 && !isOwned && (
                    <div className="absolute left-3 top-3 rounded-full bg-[#E5201C] px-3 py-1 text-[11px] font-black text-white shadow-sm">
                        {discountPercent}% OFF
                    </div>
                )}
                <div className="absolute right-3 top-3 bg-black/65 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
                    <Lock className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-black text-white">
                        ৳{offerPrice.toFixed(0)}
                    </span>
                    {hasDiscount && (
                        <span className="text-[10px] font-bold text-white/70 line-through">
                            ৳{originalPrice.toFixed(0)}
                        </span>
                    )}
                </div>
            </div>
            <div className="bg-[#E5201C] px-4 py-3 text-white flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-black leading-tight">
                            {t("shop.bundle_title")}
                        </p>
                        <p className="text-xs text-white/80 mt-0.5">
                            {t("shop.bundle_category_count", {
                                count: offer.category_count,
                            })}
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-sm font-black leading-none">
                        ৳{offerPrice.toFixed(0)}
                    </p>
                    {hasDiscount && (
                        <p className="mt-0.5 text-[10px] font-bold text-white/70 line-through">
                            ৳{originalPrice.toFixed(0)}
                        </p>
                    )}
                </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        {offer.wordlists_count}{" "}
                        {offer.wordlists_count === 1
                            ? t("shop.word_list")
                            : t("shop.word_lists")}
                    </span>
                </div>
                {isOwned ? (
                    <span className="text-xs font-bold text-green-700 bg-green-100 rounded-full px-2.5 py-1">
                        {t("shop.status.owned")}
                    </span>
                ) : isPending ? (
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full px-2.5 py-1">
                        {t("shop.status.pending")}
                    </span>
                ) : (
                    <span className="text-xs font-bold text-[#E5201C]">
                        {t("shop.bundle_buy_all")}
                    </span>
                )}
            </div>
        </button>
    );
}

// ── Shop Tab ──────────────────────────────────────────────────────────────────

function ShopTab({
    wordListCategories,
    allCategoriesOffer = null,
    pendingCategoryIds = [],
    accessCategoryIds = [],
    availableCoupons = [],
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
            <AllCategoriesOfferCard
                offer={allCategoriesOffer}
                onClick={handleCardClick}
            />

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
                availableCoupons={availableCoupons}
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
              color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/30",
              icon: CheckCircle2,
          }
        : at_risk
          ? {
                label: t("shop.streak_status.at_risk"),
                color: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-900/30",
                icon: AlertTriangle,
            }
          : is_frozen
            ? {
                  label: t("shop.streak_status.frozen"),
                  color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30",
                  icon: Snowflake,
              }
            : is_broken
              ? {
                    label: t("shop.streak_status.lost"),
                    color: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30",
                    icon: XCircle,
                }
              : {
                    label: t("shop.streak_status.none"),
                    color: "text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-slate-800 dark:border-slate-700",
                    icon: Zap,
                };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4">
            <FlameVisual isBroken={is_broken} size={48} />
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
                    className={`inline-flex items-center gap-1.5 mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${state.color}`}
                >
                    {state.icon && <state.icon className="h-3.5 w-3.5 shrink-0" />}
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


// ── XP Shop Tab ───────────────────────────────────────────────────────────────

function XpShopTab() {
    const { t } = useTranslation();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [toast, setToast] = useState(null);

    const [selectedXpPackage, setSelectedXpPackage] = useState(null);
    const [xpDialogOpen, setXpDialogOpen] = useState(false);

    const handleBuyXpClick = (pkg) => {
        setSelectedXpPackage(pkg);
        setXpDialogOpen(true);
    };

    const handleXpDialogClose = () => {
        setXpDialogOpen(false);
        setTimeout(() => setSelectedXpPackage(null), 300);
    };

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

    const handleBuyDiscount = async () => {
        setPurchasing(true);
        try {
            const data = await apiFetch(route("api.xp-shop.buy-discount"), {
                method: "POST",
            });
            if (data.success) {
                setStatus({
                    ...status,
                    xp: data.xp,
                    streak: data.streak,
                    discount_purchased: data.discount_purchased,
                });

                playXpPurchase();
                showToast(data.message || "Discount coupon purchased successfully!");
                
                // Reload to get the new coupon in the rewards tab
                router.reload({
                    only: ["availableCoupons"],
                    preserveState: true,
                    preserveScroll: true,
                });
            } else {
                showToast(
                    data.error ?? "Purchase failed",
                    "error",
                );
            }
        } catch {
            showToast(t("shop.toasts.error") || "An error occurred", "error");
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

            {/* XP Packages Section */}
            <div className="space-y-3 pt-1">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Buy XP Packages (bKash)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { id: "starter", name: "Starter Kit", xp_amount: 5000, price: 50, color: "from-amber-400 to-orange-500", label: "Streak Save" },
                        { id: "booster", name: "Booster Pack", xp_amount: 12000, price: 100, color: "from-blue-400 to-indigo-500", label: "20% Bonus" },
                        { id: "legend", name: "Legend Bundle", xp_amount: 30000, price: 200, color: "from-purple-500 to-pink-500", label: "50% Bonus" },
                    ].map((pkg) => (
                        <div key={pkg.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between relative group hover:shadow-md transition duration-200">
                            {pkg.label && (
                                <span className="absolute top-2 right-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    {pkg.label}
                                </span>
                            )}
                            <div className="p-4 flex-1">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white font-black mb-3 shadow-[0_4px_10px_rgba(0,0,0,0.05)]`}>
                                    <Zap className="h-4.5 w-4.5 animate-pulse" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{pkg.name}</h3>
                                <p className="text-xl font-black text-[#E5201C] mt-0.5">৳{pkg.price} <span className="text-[10px] font-bold text-gray-400 uppercase">BDT</span></p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                                    Get {pkg.xp_amount.toLocaleString()} XP to repair streaks or spend in the shop.
                                </p>
                            </div>
                            <div className="px-4 pb-4">
                                <button
                                    onClick={() => handleBuyXpClick(pkg)}
                                    className="w-full py-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white dark:hover:from-amber-500 dark:hover:to-orange-500 dark:hover:text-white text-gray-800 dark:text-gray-200 text-xs font-bold transition active:scale-[0.97]"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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

                    {!status?.discount_purchased && (
                        <ShopItemCard
                            title={t("shop.items.discount_title")}
                            description={t("shop.items.discount_desc")}
                            icon={Tag}
                            iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                            cost={20000}
                            canAfford={(status?.xp?.balance ?? 0) >= 20000}
                            purchasing={purchasing}
                            onBuy={handleBuyDiscount}
                            footer={t("shop.items.discount_footer")}
                        />
                    )}

                    {status?.discount_purchased && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3">
                                    <Tag className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                        {t("shop.items.discount_title")}
                                    </h3>
                                    <p className="text-sm text-green-600 font-medium font-bengali">
                                        {t("shop.items.purchased")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>



            <Toast toast={toast} />

            <XpPurchaseDialog
                key={selectedXpPackage?.id ?? "empty-xp"}
                open={xpDialogOpen}
                onClose={handleXpDialogClose}
                packageData={selectedXpPackage}
            />
        </>
    );
}

// ── Rewards Tab ───────────────────────────────────────────────────────────────

function RewardsTab({ coupons = [], featuredCourses = [] }) {
    const { t } = useTranslation();
    const [copiedCode, setCopiedCode] = useState(null);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (coupons.length === 0 && featuredCourses.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-10 w-10 text-gray-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t("shop.rewards.no_rewards")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("shop.rewards.no_rewards_desc")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-xl p-3">
                        <Tag className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black">{t("shop.rewards.title")}</h2>
                        <p className="text-sm text-white/80">{t("shop.rewards.subtitle")}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3">
                {coupons.map((coupon, idx) => (
                    <div 
                        key={idx}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex"
                    >
                        <div className="bg-green-500 w-2 flex-shrink-0" />
                        <div className="p-4 flex-1 flex items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-black text-gray-900 dark:text-gray-100">
                                        {coupon.discount_percent}% OFF
                                    </span>
                                    {coupon.course_only ? (
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Course Only
                                        </span>
                                    ) : coupon.shop_only ? (
                                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Shop Only
                                        </span>
                                    ) : (
                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    {coupon.description}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 font-mono font-bold text-gray-800 dark:text-gray-200 border border-dashed border-gray-300 dark:border-slate-600">
                                    {coupon.code}
                                </div>
                                <button
                                    onClick={() => handleCopy(coupon.code)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                >
                                    {copiedCode === coupon.code ? (
                                        <><Check className="h-3.5 w-3.5" /> Copied</>
                                    ) : (
                                        <><Copy className="h-3.5 w-3.5" /> Copy Code</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-gray-400 text-center italic mt-2">
                {t("shop.rewards.tip")}
            </p>

            {featuredCourses.length > 0 && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                            Featured Courses
                        </h3>
                        <a 
                            href="https://vocabpix.fluento.org" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#E5201C] hover:underline flex items-center gap-1"
                        >
                            View All <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                    
                    <div className="grid gap-3">
                        {featuredCourses.map((course) => (
                            <div 
                                key={course.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-3 flex items-center gap-3 shadow-sm"
                            >
                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0">
                                    <img 
                                        src={course.thumbnail || "/images/course-placeholder.jpg"} 
                                        alt={course.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop";
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {course.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                                            ৳{course.price}
                                        </span>
                                        {course.discount > 0 && (
                                            <span className="text-[10px] text-gray-400 line-through">
                                                ৳{course.price + (course.price * (course.discount / 100))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <a 
                                    href={`https://vocabpix.fluento.org/courses/${course.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                    Details
                                </a>
                            </div>
                        ))}
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 flex gap-3">
                        <div className="bg-blue-500 rounded-lg p-2 shrink-0 h-fit">
                            <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                                Use your rewards on our partner platform!
                            </p>
                            <p className="text-[10px] text-blue-700/70 dark:text-blue-400/60 mt-0.5">
                                Your streak discount coupons are also valid for these courses. Simply copy the code and apply it at checkout on the Course platform.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Shop({
    wordListCategories = [],
    allCategoriesOffer = null,
    pendingCategoryIds = [],
    accessCategoryIds = [],
    availableCoupons = [],
    featuredCourses = [],
    defaultTab = "shop",
}) {
    const { t } = useTranslation();

    // Determine initial tab: from props, or from URL query parameter, or default to "shop"
    const getInitialTab = () => {
        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get("tab");
        if (tabFromUrl === "xp" || tabFromUrl === "shop" || tabFromUrl === "rewards") {
            return tabFromUrl;
        }
        // Fallback to prop value if valid
        if (defaultTab === "xp" || defaultTab === "shop" || defaultTab === "rewards") {
            return defaultTab;
        }
        // Default fallback
        return "shop";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    const getTitle = () => {
        if (activeTab === "shop") return t("shop.title");
        if (activeTab === "xp") return t("shop.xp_shop_title");
        return t("shop.rewards.title");
    };

    const getSubtitle = () => {
        if (activeTab === "shop") return t("shop.subtitle_shop");
        if (activeTab === "xp") return t("shop.subtitle_xp");
        return t("shop.rewards.subtitle");
    };

    return (
        <AppLayout hideHeader={true}>
            <Head title={getTitle()} />

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20 space-y-5">
                    {/* Page header */}
                    <div style={{ animation: "fadeInUp 0.3s ease-out" }}>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                            {getTitle()}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {getSubtitle()}
                        </p>
                    </div>

                    {/* Tab bar */}
                    <TabBar active={activeTab} onChange={setActiveTab} />

                    {/* Tab content */}
                    <div className="space-y-5">
                        {activeTab === "shop" && (
                            <ShopTab
                                wordListCategories={wordListCategories}
                                allCategoriesOffer={allCategoriesOffer}
                                pendingCategoryIds={pendingCategoryIds}
                                accessCategoryIds={accessCategoryIds}
                                availableCoupons={availableCoupons}
                            />
                        )}
                        {activeTab === "xp" && <XpShopTab />}
                        {activeTab === "rewards" && (
                            <RewardsTab 
                                coupons={availableCoupons} 
                                featuredCourses={featuredCourses} 
                            />
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
