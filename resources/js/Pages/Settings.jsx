import AppLayout from "@/Layouts/AppLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    Languages,
    ChevronLeft,
    CheckCircle2,
    Volume2,
    Moon,
    Lock,
    ShoppingBag,
    Gift,
    Copy,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { useTranslation } from "@/Contexts/LanguageContext";
import { useTheme } from "@/Components/ThemeProvider";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/Components/ui/dialog";

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center
                rounded-full border-2 border-transparent transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5201C]
                focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${checked ? "bg-[#E5201C]" : "bg-gray-200 dark:bg-slate-700"}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block h-5 w-5 rounded-full bg-white
                    shadow-md ring-0 transition-transform duration-200
                    ${checked ? "translate-x-5" : "translate-x-0"}
                `}
            />
        </button>
    );
}

// ── Setting Row ───────────────────────────────────────────────────────────────

function SettingRow({
    icon: Icon,
    iconBg,
    title,
    description,
    checked,
    onChange,
    saving,
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
                        {description}
                    </p>
                </div>
            </div>
            <Toggle checked={checked} onChange={onChange} disabled={saving} />
        </div>
    );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm px-5 mb-3">
            {title && (
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-4 pb-1">
                    {title}
                </p>
            )}
            {children}
        </div>
    );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ visible }) {
    const { t } = useTranslation();
    if (!visible) return null;
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 dark:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg dark:shadow-2xl animate-fade-in-up">
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            {t("settings.saved")}
        </div>
    );
}

// ── Settings Page ─────────────────────────────────────────────────────────────

export default function Settings({ settings: initialSettings }) {
    const { t, locale: currentLocale } = useTranslation();
    const { auth, referral } = usePage().props;
    const user = auth?.user ?? null;
    const { theme, setTheme, darkModeUnlocked, isAdmin } = useTheme();

    const [settings, setSettings] = useState({
        show_bangla: initialSettings?.show_bangla ?? true,
        sound_effects: initialSettings?.sound_effects ?? true,
        ui_language: initialSettings?.ui_language ?? currentLocale ?? "en",
    });
    const [saving, setSaving] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

    // Admin users always have dark mode unlocked
    const effectiveDarkModeUnlocked =
        user?.role === "admin" || isAdmin ? true : darkModeUnlocked;

    const save = (newSettings) => {
        setSaving(true);
        router.patch(route("settings.update"), newSettings, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 2500);
            },
            onError: () => setSaving(false),
        });
    };

    const handleToggle = (key) => (value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        save(updated);
    };

    const handleLanguageToggle = () => {
        const newLocale = settings.ui_language === "en" ? "bn" : "en";
        const updated = { ...settings, ui_language: newLocale };
        setSettings(updated);
        save(updated);
    };

    const handleThemeToggle = (checked) => {
        const newTheme = checked ? "dark" : "light";
        if (newTheme === "dark" && !effectiveDarkModeUnlocked) {
            setPurchaseDialogOpen(true);
            return;
        }
        setTheme(newTheme);
    };

    const referralLink =
        user?.referral_code && typeof window !== "undefined"
            ? `${window.location.origin}/register?ref=${user.referral_code}`
            : "";

    const copyReferralLink = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    };

    return (
        <AppLayout hideHeader={true}>
            <Head title={t("settings.title")} />

            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <div className="w-full max-w-2xl mx-auto px-4 py-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                        <Link
                            href={route("dashboard")}
                            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">
                                {t("settings.title")}
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {t("settings.subtitle")}
                            </p>
                        </div>
                    </div>

                    {/* Language Display */}
                    <SectionCard title={t("settings.language_display")}>
                        <SettingRow
                            icon={Languages}
                            iconBg="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                            title={t("settings.show_bangla")}
                            description={
                                settings.show_bangla
                                    ? t("settings.show_bangla_desc_on")
                                    : t("settings.show_bangla_desc_off")
                            }
                            checked={settings.show_bangla}
                            onChange={handleToggle("show_bangla")}
                            saving={saving}
                        />

                        {/* UI Language Toggle */}
                        <div className="border-t border-gray-50 dark:border-slate-800/50">
                            <SettingRow
                                icon={Languages}
                                iconBg="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                title={t("settings.ui_language")}
                                description={
                                    settings.ui_language === "bn"
                                        ? t("settings.ui_language_desc_bn")
                                        : t("settings.ui_language_desc_en")
                                }
                                checked={settings.ui_language === "bn"}
                                onChange={handleLanguageToggle}
                                saving={saving}
                            />
                        </div>
                    </SectionCard>

                    {/* Sound Effects */}
                    <SectionCard title={t("settings.sound_effects")}>
                        <SettingRow
                            icon={Volume2}
                            iconBg="bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400"
                            title={t("settings.sound_effects")}
                            description={
                                settings.sound_effects
                                    ? t("settings.sound_effects_desc_on")
                                    : t("settings.sound_effects_desc_off")
                            }
                            checked={settings.sound_effects}
                            onChange={handleToggle("sound_effects")}
                            saving={saving}
                        />
                    </SectionCard>

                    {/* Appearance */}
                    <SectionCard title={t("settings.appearance") || "Appearance"}>
                        <SettingRow
                            icon={Moon}
                            iconBg="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            title={t("settings.dark_mode") || "Dark Mode"}
                            description={
                                theme === "dark"
                                    ? t("settings.dark_mode_desc_on") ||
                                      "Dark theme is active"
                                    : t("settings.dark_mode_desc_off") ||
                                      "Light theme is active"
                            }
                            checked={theme === "dark"}
                            onChange={handleThemeToggle}
                            saving={false}
                        />
                    </SectionCard>

                    {referral?.enabled && user?.referral_code && (
                        <SectionCard title="Referral">
                            <div className="py-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/40 text-[#E5201C] flex items-center justify-center shrink-0">
                                        <Gift className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Invite friends to VocabPix
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
                                            They get{" "}
                                            {
                                                referral.new_user_discount_percent
                                            }
                                            % off, and you earn{" "}
                                            {
                                                referral.referrer_discount_percent
                                            }
                                            % off after they register.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gray-50 dark:bg-slate-800/70 p-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                        Your code
                                    </p>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-mono text-xl font-black text-gray-900 dark:text-gray-100">
                                            {user.referral_code}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copyReferralLink}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E5201C] px-3 py-2 text-xs font-bold text-white"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            Copy Link
                                        </button>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Available referral discounts:{" "}
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {referral.available_credits?.length ?? 0}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {/* Helper note */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 px-2">
                        {t("settings.changes_immediate")}
                    </p>
                </div>
            </div>

            <Dialog
                open={purchaseDialogOpen}
                onOpenChange={setPurchaseDialogOpen}
            >
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5 text-indigo-500" />
                            {t("theme.unlock_dark_mode")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center space-y-3">
                        <p className="text-sm text-gray-500">
                            {t("theme.dark_mode_desc")}
                        </p>
                        <Link
                            href={route("shop", { tab: "xp" })}
                            className="block w-full"
                        >
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                {t("theme.go_to_shop")}
                            </Button>
                        </Link>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full">
                                {t("theme.maybe_later")}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toast visible={toastVisible} />
        </AppLayout>
    );
}
