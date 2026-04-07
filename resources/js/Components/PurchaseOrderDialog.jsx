import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    Check,
    Smartphone,
    Lock,
    ChevronRight,
    Loader2,
} from "lucide-react";

export default function PurchaseOrderDialog({
    open,
    onClose,
    category, // ← now a category object instead of wordList
    bkashNumber = "01825236112",
}) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const [copied, setCopied] = useState(false);

    // If opened via "Try Again", the category object carries _rejectedOrder
    const rejectedOrder = category?._rejectedOrder ?? null;

    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm({
            word_list_category_id: category?.id ?? null,
            name: rejectedOrder?.name ?? user?.name ?? "",
            phone_number:
                rejectedOrder?.phone_number ?? user?.phone_number ?? "",
            address: rejectedOrder?.address ?? "",
            profession: rejectedOrder?.profession ?? user?.profession ?? "",
            transaction_id: "",
            note: "",
        });

    const copyBkash = () => {
        navigator.clipboard.writeText(bkashNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("wordlistcategory.order.store", category.id), {
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl gap-0">
                {/* Header */}
                <div className="bg-[#E5201C] px-6 pt-6 pb-5 text-white">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="h-4 w-4 opacity-80" />
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                                Purchase Access
                            </span>
                        </div>
                        <DialogTitle className="text-white text-xl font-bold leading-snug">
                            {category?.name}
                        </DialogTitle>
                        {category?.price > 0 && (
                            <p className="text-white/90 text-base font-bold mt-0.5">
                                ৳{category.price}
                            </p>
                        )}
                        <DialogDescription className="text-white/70 text-sm mt-1">
                            Complete your bKash payment and fill in the form
                            below to unlock all word lists in this category.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Success State */}
                    {wasSuccessful ? (
                        <div className="flex flex-col items-center text-center py-6 gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Order Placed!
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Your order is under review. You'll get
                                    access once the admin approves your payment.
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="bg-[#E5201C] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-red-700 transition"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Rejection reason banner */}
                            {rejectedOrder && (
                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                                                Previous Order Was Rejected
                                            </p>
                                            {rejectedOrder.admin_note ? (
                                                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                                                    <span className="font-semibold">
                                                        Reason:{" "}
                                                    </span>
                                                    {rejectedOrder.admin_note}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-red-600 dark:text-red-400">
                                                    Please provide a correct
                                                    bKash Transaction ID and
                                                    re-submit.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* bKash payment info */}
                            <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Smartphone className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
                                    <span className="text-sm font-bold text-pink-800 dark:text-pink-300">
                                        Send Payment via bKash
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-3.5 py-2.5 border border-pink-200 dark:border-pink-800">
                                    <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100 tracking-wider">
                                        {bkashNumber}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyBkash}
                                        className="flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                {category?.price > 0 && (
                                    <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 font-medium">
                                        Send exactly ৳{category.price} and save
                                        the Transaction ID.
                                    </p>
                                )}
                            </div>

                            {/* Order form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Full Name{" "}
                                        <span className="text-[#E5201C]">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="Your full name"
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5201C]/30 focus:border-[#E5201C] placeholder-gray-400 dark:placeholder-gray-600 transition"
                                    />
                                    {errors.name && (
                                        <FieldError msg={errors.name} />
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Phone Number{" "}
                                        <span className="text-[#E5201C]">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone_number}
                                        onChange={(e) =>
                                            setData(
                                                "phone_number",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="01XXXXXXXXX"
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5201C]/30 focus:border-[#E5201C] placeholder-gray-400 dark:placeholder-gray-600 transition"
                                    />
                                    {errors.phone_number && (
                                        <FieldError msg={errors.phone_number} />
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Address{" "}
                                        <span className="text-[#E5201C]">
                                            *
                                        </span>
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        placeholder="Your full address"
                                        rows={2}
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5201C]/30 focus:border-[#E5201C] placeholder-gray-400 dark:placeholder-gray-600 transition resize-none"
                                    />
                                    {errors.address && (
                                        <FieldError msg={errors.address} />
                                    )}
                                </div>

                                {/* Profession */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Profession{" "}
                                        <span className="text-xs font-normal text-gray-400">
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.profession}
                                        onChange={(e) =>
                                            setData(
                                                "profession",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Student, Teacher, Engineer"
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5201C]/30 focus:border-[#E5201C] placeholder-gray-400 dark:placeholder-gray-600 transition"
                                    />
                                    {errors.profession && (
                                        <FieldError msg={errors.profession} />
                                    )}
                                </div>

                                {/* Transaction ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        bKash Transaction ID{" "}
                                        <span className="text-[#E5201C]">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.transaction_id}
                                        onChange={(e) =>
                                            setData(
                                                "transaction_id",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. 8N6XXXXXXXX"
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5201C]/30 focus:border-[#E5201C] placeholder-gray-400 dark:placeholder-gray-600 font-mono tracking-wider transition"
                                    />
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Check your bKash SMS for the transaction
                                        ID after sending payment.
                                    </p>
                                    {errors.transaction_id && (
                                        <FieldError
                                            msg={errors.transaction_id}
                                        />
                                    )}
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Note{" "}
                                        <span className="text-xs font-normal text-gray-400">
                                            (optional)
                                        </span>
                                    </label>
                                    <textarea
                                        value={data.note}
                                        onChange={(e) =>
                                            setData("note", e.target.value)
                                        }
                                        placeholder="Any additional info..."
                                        rows={2}
                                        className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5201C]/30 focus:border-[#E5201C] placeholder-gray-400 dark:placeholder-gray-600 transition resize-none"
                                    />
                                    {errors.note && (
                                        <FieldError msg={errors.note} />
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="pt-1 pb-1 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-[#E5201C] hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Submitting…
                                            </>
                                        ) : (
                                            <>
                                                Place Order
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function FieldError({ msg }) {
    return (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {msg}
        </p>
    );
}
