import AppLayout from "@/Layouts/AppLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Languages, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Link } from "@inertiajs/react";

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
    if (!visible) return null;
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 dark:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in-up">
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            Settings saved
        </div>
    );
}

// ── Settings Page ─────────────────────────────────────────────────────────────

export default function Settings({ settings: initialSettings }) {
    const [settings, setSettings] = useState({
        show_bangla: initialSettings?.show_bangla ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

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

    return (
        <AppLayout>
            <Head title="Settings" />

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
                                Settings
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                Personalise your learning experience
                            </p>
                        </div>
                    </div>

                    {/* Language Display */}
                    <SectionCard title="Language Display">
                        <SettingRow
                            icon={Languages}
                            iconBg="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                            title="Show Bangla"
                            description={
                                settings.show_bangla
                                    ? "Bangla meanings & pronunciations are visible in word cards, tables, and exercises."
                                    : "Bangla columns are hidden. Toggle on to see বাংলা meanings and pronunciations."
                            }
                            checked={settings.show_bangla}
                            onChange={handleToggle("show_bangla")}
                            saving={saving}
                        />
                    </SectionCard>

                    {/* Helper note */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 px-2">
                        Changes take effect immediately across the whole app.
                    </p>
                </div>
            </div>

            <Toast visible={toastVisible} />
        </AppLayout>
    );
}
