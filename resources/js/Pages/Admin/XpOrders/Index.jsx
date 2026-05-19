import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useMemo, useEffect, Fragment } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/Components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
    Trash2,
    Zap,
    Calendar,
    Smartphone,
} from "lucide-react";

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_LABELS = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
};

const STATUS_COLORS = {
    pending:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800",
    approved:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
    rejected:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── Sortable column header ─────────────────────────────────────────────────────
function SortHeader({ column, children }) {
    const sorted = column.getIsSorted();
    return (
        <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(sorted === "asc")}
        >
            {children}
            {sorted === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5" />
            ) : sorted === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5" />
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
            )}
        </button>
    );
}

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditDialog({ order, statuses, open, onClose }) {
    const { data, setData, patch, processing } = useForm({
        status: "pending",
        admin_note: "",
    });

    useEffect(() => {
        if (order) {
            setData({
                status: order.status ?? "pending",
                admin_note: order.admin_note ?? "",
            });
        }
    }, [order, setData]);

    const handleSubmit = () => {
        if (!order) return;
        patch(route("admin.xp-orders.update", order.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const getPackageLabel = (name) => {
        if (name === "starter") return "Starter Kit";
        if (name === "booster") return "Booster Pack";
        if (name === "legend") return "Legend Bundle";
        return name ?? "XP Package";
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="max-w-lg w-[calc(100vw-2rem)]"
                aria-describedby={undefined}
            >
                <DialogHeader>
                    <DialogTitle>Update XP Order #{order.id}</DialogTitle>
                </DialogHeader>

                {/* Order summary */}
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm space-y-2">
                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-24 shrink-0">
                            User
                        </span>
                        <span className="font-medium">
                            {order.user?.name ?? "—"}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-24 shrink-0">
                            XP Package
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 shrink-0" />
                            {getPackageLabel(order.package_name)} (+
                            {order.xp_amount?.toLocaleString()} XP)
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-24 shrink-0">
                            Paid Amount
                        </span>
                        <span className="font-semibold text-red-600">
                            ৳{Number(order.payable_amount ?? 0).toFixed(0)} BDT
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-24 shrink-0">
                            bKash Number
                        </span>
                        <span className="font-medium">
                            {order.phone_number ?? "—"}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-24 shrink-0">
                            Txn ID
                        </span>
                        <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs select-all">
                            {order.transaction_id ?? "—"}
                        </span>
                    </div>

                    {order.note && (
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-24 shrink-0">
                                User Note
                            </span>
                            <span className="text-xs">{order.note}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Status
                        </label>
                        <Select
                            value={data.status}
                            onValueChange={(v) => setData("status", v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {STATUS_LABELS[s] ?? s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {data.status === "approved" && (
                            <p className="text-[11px] text-green-600 mt-1 font-medium">
                                * Approving will automatically credit +
                                {order.xp_amount?.toLocaleString()} XP directly
                                to this user's balance.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Admin Note{" "}
                            <span className="font-normal text-muted-foreground">
                                (optional — shown to user on rejection)
                            </span>
                        </label>
                        <Textarea
                            value={data.admin_note}
                            onChange={(e) =>
                                setData("admin_note", e.target.value)
                            }
                            placeholder="e.g. Transaction ID not found or mismatched. Please resubmit…"
                            rows={3}
                            maxLength={2000}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-2">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            disabled={processing}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Index({ orders, filters, statuses }) {
    const [globalFilter, setGlobalFilter] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "all");
    const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
    const [editOrder, setEditOrder] = useState(null);
    const [deleteOrder, setDeleteOrder] = useState(null);

    const data = useMemo(() => {
        if (statusFilter === "all") return orders.data;
        return orders.data.filter((o) => o.status === statusFilter);
    }, [orders.data, statusFilter]);

    const handleDelete = () => {
        if (!deleteOrder) return;
        router.delete(route("admin.xp-orders.destroy", deleteOrder.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteOrder(null),
        });
    };

    const getPackageLabel = (name) => {
        if (name === "starter") return "Starter Kit";
        if (name === "booster") return "Booster Pack";
        if (name === "legend") return "Legend Bundle";
        return name ?? "XP Package";
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: ({ column }) => (
                    <SortHeader column={column}>#</SortHeader>
                ),
                cell: ({ getValue }) => `#${getValue()}`,
                size: 60,
            },
            {
                accessorKey: "user.name",
                header: "User",
                cell: ({ row }) => (
                    <div>
                        <p className="font-semibold">
                            {row.original.user?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Smartphone className="h-3 w-3 shrink-0" />
                            {row.original.phone_number ?? ""}
                        </p>
                    </div>
                ),
                size: 150,
            },
            {
                accessorKey: "package_name",
                header: "XP Package",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Zap className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                {getPackageLabel(row.original.package_name)}
                            </p>
                            <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                +{row.original.xp_amount?.toLocaleString()} XP
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "payable_amount",
                header: "Price",
                cell: ({ getValue }) => (
                    <span className="font-black text-red-600 dark:text-red-400 text-sm">
                        ৳{Number(getValue() ?? 0).toFixed(0)} BDT
                    </span>
                ),
            },
            {
                accessorKey: "transaction_id",
                header: "Transaction ID",
                cell: ({ getValue }) => (
                    <span className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                        {getValue() ?? "—"}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <SortHeader column={column}>Status</SortHeader>
                ),
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
                size: 120,
            },
            {
                accessorKey: "note",
                header: "User Note",
                cell: ({ getValue }) => {
                    const note = getValue();
                    if (!note) return "—";
                    return (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 max-w-[200px]">
                            {note}
                        </p>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <SortHeader column={column}>Created</SortHeader>
                ),
                cell: ({ getValue }) => (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {formatDate(getValue())}
                    </span>
                ),
                size: 130,
            },
            {
                id: "actions",
                header: "",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditOrder(row.original)}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-950 dark:hover:bg-red-950/40"
                            onClick={() => setDeleteOrder(row.original)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <AdminLayout>
            <Head title="XP bKash Orders" />

            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md">
                        <Zap className="h-6 w-6 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        XP Packages Orders
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search by user, package, transaction ID…"
                        className="flex-1"
                    />
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {STATUS_LABELS[s]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext(),
                                                                  )}
                                                        </TableHead>
                                                    ),
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                No XP orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {table.getPageCount() > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Page{" "}
                                    {table.getState().pagination.pageIndex + 1}{" "}
                                    of {table.getPageCount()}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditDialog
                order={editOrder}
                statuses={statuses}
                open={Boolean(editOrder)}
                onClose={() => setEditOrder(null)}
            />

            <AlertDialog
                open={Boolean(deleteOrder)}
                onOpenChange={(v) => !v && setDeleteOrder(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete XP Order #{deleteOrder?.id}?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="text-sm text-muted-foreground px-1 space-y-2">
                        <p>
                            This will permanently remove this XP purchase record
                            for{" "}
                            <span className="font-semibold text-foreground">
                                {deleteOrder?.user?.name}
                            </span>
                            . This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <AlertDialogCancel onClick={() => setDeleteOrder(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
