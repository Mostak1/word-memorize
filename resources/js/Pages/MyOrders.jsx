import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    BookOpen,
    ChevronRight,
    Calendar,
} from "lucide-react";

const STATUS_CONFIG = {
    pending: {
        label: "Pending Review",
        icon: Clock,
        className:
            "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        iconColor: "text-amber-500",
        desc: "Your order is being reviewed by admin.",
    },
    approved: {
        label: "Approved",
        icon: CheckCircle2,
        className:
            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        iconColor: "text-green-500",
        desc: "Access granted! You can now study this list.",
    },
    rejected: {
        label: "Rejected",
        icon: XCircle,
        className:
            "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        iconColor: "text-red-500",
        desc: "Your order was not approved. Please contact support.",
    },
};

function OrderCard({ order }) {
    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
    const Icon = cfg.icon;

    const date = new Date(order.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden"
            style={{
                animation: "fadeInUp 0.35s ease-out forwards",
                opacity: 0,
            }}
        >
            {/* Top strip */}
            <div className="bg-gray-50 dark:bg-slate-800 px-5 py-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-snug">
                        {order.wordlist?.title ?? "Word List"}
                    </p>
                </div>
                <span
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}
                >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                </span>
            </div>

            <div className="px-5 py-4 space-y-3">
                {/* Status description */}
                <p className={`text-xs font-medium ${cfg.iconColor}`}>
                    {cfg.desc}
                </p>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <Detail label="Name" value={order.name} />
                    <Detail label="Phone" value={order.phone_number} />
                    {order.profession && (
                        <Detail label="Profession" value={order.profession} />
                    )}
                    {order.transaction_id && (
                        <Detail
                            label="Txn ID"
                            value={
                                <span className="font-mono tracking-wider">
                                    {order.transaction_id}
                                </span>
                            }
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {date}
                    </span>

                    {order.status === "approved" && order.wordlist_id && (
                        <Link
                            href={route("wordlist.start", order.wordlist_id)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#E5201C] hover:underline"
                        >
                            Start Learning
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-0.5">
                {label}
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {value ?? "—"}
            </p>
        </div>
    );
}

export default function MyOrders({ orders }) {
    return (
        <AppLayout>
            <Head title="My Orders" />
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
                <main className="max-w-2xl mx-auto px-4 py-5 pb-20">
                    <div className="flex items-center gap-2 mb-5">
                        <ShoppingBag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            My Orders
                        </h1>
                    </div>

                    {orders && orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-sm">
                            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="h-10 w-10 text-gray-400 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                No Orders Yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                                You haven't purchased any word lists yet.
                            </p>
                            <Link
                                href={route("wordlistcategory.index")}
                                className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                            >
                                Browse Word Lists
                            </Link>
                        </div>
                    )}
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
