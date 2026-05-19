import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    Check,
    Smartphone,
    Lock,
    ChevronRight,
    Loader2,
    Sparkles,
} from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

export default function XpPurchaseDialog({
    open,
    onClose,
    packageData, // { id: 'starter', name: 'Starter Kit', xp_amount: 5000, price: 50 }
    bkashNumber = "01825236112",
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm({
            package_id: packageData?.id ?? "",
            name: user?.name ?? "",
            phone_number: user?.phone_number ?? "",
            transaction_id: "",
            note: "",
        });

    // Sync package_id when packageData changes
    useState(() => {
        if (packageData?.id) {
            setData("package_id", packageData.id);
        }
    }, [packageData?.id]);

    const copyBkash = () => {
        navigator.clipboard.writeText(bkashNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure the correct package ID is set
        data.package_id = packageData?.id;
        post(route("api.xp-shop.purchase"), {
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl gap-0 border border-gray-100 dark:border-slate-800 shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 pt-6 pb-5 text-white relative overflow-hidden">
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-amber-200 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">
                                Purchase XP Package
                            </span>
                        </div>
                        <DialogTitle className="text-white text-xl font-black leading-snug">
                            {packageData?.name ?? "XP Pack"}
                        </DialogTitle>
                        <p className="text-white font-extrabold text-base mt-0.5">
                            ৳{packageData?.price} BDT
                        </p>
                        <DialogDescription className="text-white/80 text-xs font-semibold mt-1">
                            Purchase {packageData?.xp_amount?.toLocaleString()} XP instantly to repair your streak or unlock shop rewards!
                        </DialogDescription>
                    </DialogHeader>
                    {/* Glowing decorative background bubbles */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-900">
                    {/* Success State */}
                    {wasSuccessful ? (
                        <div className="flex flex-col items-center text-center py-6 gap-4 animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900 dark:text-gray-100">
                                    Order Submitted!
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-1 max-w-[280px] mx-auto leading-relaxed">
                                    Your payment details have been sent. We will verify your transaction and credit {packageData?.xp_amount?.toLocaleString()} XP to your balance soon.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 w-full pt-2">
                                <a
                                    href={`https://wa.me/8801979756067?text=${encodeURIComponent(
                                        `Hi Fluento team! I just bought the "${packageData?.name}" (${packageData?.xp_amount} XP) with Transaction ID "${data.transaction_id}". Please approve my order!`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white text-xs font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/10 active:scale-[0.98] transition w-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-4 w-4 shrink-0"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Speed Up Verification via WhatsApp
                                </a>
                                <button
                                    onClick={handleClose}
                                    className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-[0.98] transition w-full"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* bKash Payment Box */}
                            <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Smartphone className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
                                    <span className="text-xs font-black text-pink-800 dark:text-pink-300 uppercase tracking-wider">
                                        Send Money to Personal Wallet
                                    </span>
                                </div>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-3.5 py-2.5 border border-pink-200 dark:border-pink-800/50 shadow-sm">
                                    <span className="text-sm font-mono font-black text-gray-800 dark:text-gray-100 tracking-widest">
                                        {bkashNumber}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyBkash}
                                        className="flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 transition"
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
                                <p className="text-[10px] font-medium text-pink-600 dark:text-pink-400 mt-2.5 leading-relaxed">
                                    Please send exactly <strong>৳{packageData?.price} BDT</strong> to the number above via bKash, then input the transaction details below.
                                </p>
                            </div>

                            {/* Order Form */}
                            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                                {/* Sender Name */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder-gray-400 transition"
                                    />
                                    {errors.name && <FieldError msg={errors.name} />}
                                </div>

                                {/* Sender bKash Phone */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                                        Your bKash Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.phone_number}
                                        onChange={(e) => setData("phone_number", e.target.value)}
                                        placeholder="e.g. 017XXXXXXXX"
                                        className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder-gray-400 transition"
                                    />
                                    {errors.phone_number && <FieldError msg={errors.phone_number} />}
                                </div>

                                {/* Transaction ID */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                                        bKash Transaction ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.transaction_id}
                                        onChange={(e) => setData("transaction_id", e.target.value)}
                                        placeholder="e.g. AX94KPL931"
                                        className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder-gray-400 font-mono uppercase tracking-widest transition"
                                    />
                                    {errors.transaction_id && <FieldError msg={errors.transaction_id} />}
                                </div>

                                {/* Optional Note */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                                        Optional Note
                                    </label>
                                    <textarea
                                        value={data.note}
                                        onChange={(e) => setData("note", e.target.value)}
                                        placeholder="Add any details if necessary"
                                        rows={2}
                                        className="w-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder-gray-400 transition resize-none"
                                    />
                                    {errors.note && <FieldError msg={errors.note} />}
                                </div>

                                {/* Actions */}
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 text-xs font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-orange-500/10 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Order
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
        <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1 font-semibold">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {msg}
        </p>
    );
}
