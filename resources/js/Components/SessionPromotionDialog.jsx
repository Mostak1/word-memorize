import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    GraduationCap,
    ShoppingBag,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

const TYPE_META = {
    product: {
        icon: ShoppingBag,
        accent: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/30",
    },
    service: {
        icon: BookOpen,
        accent: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    course: {
        icon: GraduationCap,
        accent: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-950/30",
    },
};

const shuffled = (items) => [...items].sort(() => Math.random() - 0.5);

export default function SessionPromotionDialog({
    open,
    onOpenChange,
    promotions = [],
}) {
    const groups = useMemo(() => {
        const validPromotions = promotions.filter(
            (promotion) =>
                promotion?.id &&
                promotion?.type &&
                promotion?.title &&
                promotion?.href &&
                promotion?.cta,
        );

        return shuffled(
            ["product", "service", "course"]
                .map((type) => ({
                    key: type,
                    items: shuffled(
                        validPromotions.filter(
                            (promotion) => promotion.type === type,
                        ),
                    ),
                }))
                .filter((group) => group.items.length > 0),
        );
    }, [promotions]);

    const [activeGroupKey, setActiveGroupKey] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeGroup =
        groups.find((group) => group.key === activeGroupKey) ?? groups[0];
    const activePromotion = activeGroup?.items[activeIndex] ?? null;
    const meta = TYPE_META[activePromotion?.type] ?? TYPE_META.service;
    const PromotionIcon = meta.icon;

    useEffect(() => {
        if (!open || groups.length === 0) return;

        setActiveGroupKey(groups[0].key);
        setActiveIndex(0);
    }, [open, groups]);

    if (!activePromotion) return null;

    const showProduct = activePromotion.type === "product";
    const goPrevious = () => {
        setActiveIndex((index) =>
            index === 0 ? activeGroup.items.length - 1 : index - 1,
        );
    };
    const goNext = () => {
        setActiveIndex((index) => (index + 1) % activeGroup.items.length);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden border-0 bg-white p-0 shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
                <div className="p-5 pb-0">
                    <DialogHeader className="text-left">
                        <div className="flex items-center gap-3 pr-8">
                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.bg}`}
                            >
                                <PromotionIcon
                                    className={`h-5 w-5 ${meta.accent}`}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    Recommended for you
                                </p>
                                <DialogTitle className="mt-1 text-xl font-extrabold leading-tight text-gray-900 dark:text-white">
                                    {activePromotion.title}
                                </DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="pt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            {activePromotion.description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {activePromotion.ad_image_url ? (
                    <a
                        href={activePromotion.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-5 mt-4 block overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition hover:border-red-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-red-900/50 dark:hover:bg-slate-800"
                    >
                        <div className="relative aspect-[16/9] bg-white dark:bg-slate-950">
                            <img
                                src={activePromotion.ad_image_url}
                                alt={activePromotion.title}
                                className="h-full w-full object-cover"
                            />
                            {activePromotion.selling_price > 0 && (
                                <div className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow">
                                    BDT {activePromotion.selling_price}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {activePromotion.cta}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Opens on Fluento.org
                                </p>
                            </div>
                            <ExternalLink className="h-5 w-5 shrink-0 text-gray-400" />
                        </div>
                    </a>
                ) : (
                    <a
                        href={activePromotion.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-5 mt-4 block rounded-2xl border border-gray-100 bg-gray-50 p-5 transition hover:border-red-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-red-900/50 dark:hover:bg-slate-800"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {activePromotion.cta}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Opens on Fluento.org
                                </p>
                            </div>
                            <ExternalLink className="h-5 w-5 shrink-0 text-gray-400" />
                        </div>
                    </a>
                )}

                <DialogFooter className="gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:justify-between sm:space-x-0">
                    <div className="flex items-center justify-center gap-1 sm:justify-start">
                        {activeGroup.items.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                    index === activeIndex
                                        ? "w-6 bg-[#E5201C]"
                                        : "w-2 bg-gray-300 dark:bg-slate-700"
                                }`}
                                aria-label={`Show recommendation ${index + 1}`}
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-[auto_1fr_auto] gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={goPrevious}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
                            aria-label="Previous recommendation"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <a
                            href={activePromotion.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#E5201C] px-4 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            {activePromotion.cta}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                            type="button"
                            onClick={goNext}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
                            aria-label="Next recommendation"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
