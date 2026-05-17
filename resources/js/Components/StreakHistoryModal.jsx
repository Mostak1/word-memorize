import React from "react";
import Modal from "./Modal";
import { Flame, Check, Snowflake } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";
import FlameVisual from "./FlameVisual";

export default function StreakHistoryModal({ show, onClose, streak }) {
    const { t } = useTranslation();
    if (!streak) return null;

    const { current_streak, weekly_history } = streak;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 flex flex-col items-center dark:bg-slate-900">
                {/* Header with Flame Icon */}
                <div className="relative mb-4 mt-4">
                    <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative z-10 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-xl">
                        <FlameVisual isBroken={streak.is_broken} size={64} />
                    </div>
                </div>

                {/* Streak Count */}
                <h2 className="text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">
                    {current_streak}
                </h2>
                <p className="text-orange-500 font-extrabold uppercase tracking-[0.2em] text-sm mb-10">
                    {t("streak.day_streak")}
                </p>

                {/* Weekly Grid */}
                <div className="w-full grid grid-cols-7 gap-3 mb-10">
                    {weekly_history?.map((day, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col items-center gap-3"
                        >
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${day.is_today ? "text-orange-500" : "text-gray-400 dark:text-gray-500"}`}
                            >
                                {day.short_day}
                            </span>
                            <div
                                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${
                                    day.is_active
                                        ? day.is_freeze
                                            ? "bg-blue-400 border-blue-400 shadow-lg shadow-blue-400/40 scale-110"
                                            : "bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/40 scale-110"
                                        : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                                }`}
                            >
                                {day.is_active ? (
                                    day.is_freeze ? (
                                        <Snowflake className="h-4 w-4 text-white animate-[spin_4s_linear_infinite]" />
                                    ) : (
                                        <Check className="h-5 w-5 text-white stroke-[4px]" />
                                    )
                                ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Text */}
                <p className="text-gray-600 dark:text-gray-400 text-center mb-10 font-semibold px-4 whitespace-pre-line">
                    {t("streak.history_message")}
                </p>

                {/* Continue / Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-5 bg-[#00A3FF] hover:bg-[#0082CC] text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all uppercase tracking-[0.15em] text-sm active:scale-[0.97]"
                >
                    {t("streak.continue")}
                </button>
            </div>
        </Modal>
    );
}
