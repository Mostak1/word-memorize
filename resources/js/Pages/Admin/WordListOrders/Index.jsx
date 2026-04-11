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
    ChevronDown,
    ChevronRight,
    Package,
} from "lucide-react";

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_LABELS = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
};

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── Category badges list ───────────────────────────────────────────────────────
function CategoryBadges({ categories }) {
    if (!categories?.length)
        return <span className="text-muted-foreground">—</span>;
    return (
        <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
                <span
                    key={cat.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                >
                    {cat.name}
                </span>
            ))}
        </div>
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
    const { data, setData, patch, processing, reset } = useForm({
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
        patch(route("admin.wordlist-orders.update", order.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="max-w-lg w-[calc(100vw-2rem)]"
                aria-describedby={undefined}
            >
                <DialogHeader>
                    <DialogTitle>Update Order #{order.id}</DialogTitle>
                </DialogHeader>

                {/* Order summary */}
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm space-y-2">
                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-20 shrink-0">
                            User
                        </span>
                        <span className="font-medium">
                            {order.user?.name ?? "—"}
                        </span>
                    </div>

                    {/* Categories — accordion-style in dialog */}
                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-20 shrink-0 pt-0.5">
                            Categories
                        </span>
                        <div className="flex-1">
                            {order.categories?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {order.categories.map((cat) => (
                                        <span
                                            key={cat.id}
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                        >
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <span className="text-muted-foreground w-20 shrink-0">
                            Txn ID
                        </span>
                        <span className="font-mono">
                            {order.transaction_id ?? "—"}
                        </span>
                    </div>
                    {order.note && (
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-20 shrink-0">
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
                            placeholder="e.g. Transaction ID not found, please resubmit…"
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

// ── Expanded categories row ────────────────────────────────────────────────────
function ExpandedCategoriesRow({ order, colSpan }) {
    const categories = order.categories ?? [];

    return (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={colSpan} className="py-3 px-6">
                <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                        <Package className="h-3.5 w-3.5" />
                        Order Items
                    </div>
                    <div className="flex-1">
                        {categories.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                                No categories attached
                            </span>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Index({ orders, filters, statuses }) {
    const [globalFilter, setGlobalFilter] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "all");
    const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
    const [editOrder, setEditOrder] = useState(null);
    const [deleteOrder, setDeleteOrder] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const data = useMemo(() => {
        if (statusFilter === "all") return orders.data;
        return orders.data.filter((o) => o.status === statusFilter);
    }, [orders.data, statusFilter]);

    const handleDelete = () => {
        if (!deleteOrder) return;
        router.delete(route("admin.wordlist-orders.destroy", deleteOrder.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteOrder(null),
        });
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
                        <p className="font-medium">
                            {row.original.user?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.phone_number ?? ""}
                        </p>
                    </div>
                ),
                size: 150,
            },
            {
                // Categories accordion toggle — replaces old single "category" column
                id: "categories",
                header: "Categories",
                cell: ({ row }) => {
                    const cats = row.original.categories ?? [];
                    const isExpanded = expandedRows.has(row.original.id);
                    return (
                        <button
                            onClick={() => toggleRow(row.original.id)}
                            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <span>
                                {cats.length === 0
                                    ? "No items"
                                    : cats.length === 1
                                      ? cats[0].name
                                      : `${cats.length} categories`}
                            </span>
                        </button>
                    );
                },
            },
            {
                accessorKey: "address",
                header: "Address",
                cell: ({ getValue }) => (
                    <p className="text-xs line-clamp-2 max-w-[180px]">
                        {getValue() ?? "—"}
                    </p>
                ),
            },
            {
                accessorKey: "transaction_id",
                header: "Transaction ID",
                cell: ({ getValue }) => (
                    <span className="font-mono text-xs">
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
                    <span className="text-xs text-muted-foreground">
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
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => setDeleteOrder(row.original)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ),
            },
        ],
        [expandedRows],
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
            <Head title="WordList Orders" />

            <div className="space-y-5">
                <h1 className="text-3xl font-bold">WordList Category Orders</h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search by user, category, transaction ID…"
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
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <Fragment key={row.id}>
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

                                                {/* Expanded categories row */}
                                                {expandedRows.has(
                                                    row.original.id,
                                                ) && (
                                                    <ExpandedCategoriesRow
                                                        key={`expanded-${row.original.id}`}
                                                        order={row.original}
                                                        colSpan={columns.length}
                                                    />
                                                )}
                                            </Fragment>
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
                            Delete Order #{deleteOrder?.id}?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="text-sm text-muted-foreground px-1 space-y-2">
                        <p>
                            This will permanently remove the order from{" "}
                            <span className="font-semibold">
                                {deleteOrder?.user?.name}
                            </span>
                            . This action cannot be undone.
                        </p>
                        {deleteOrder?.categories?.length > 0 && (
                            <div>
                                <p className="mb-1 font-medium text-foreground">
                                    Categories in this order:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {deleteOrder.categories.map((cat) => (
                                        <span
                                            key={cat.id}
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                        >
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
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
