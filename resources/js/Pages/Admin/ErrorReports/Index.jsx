import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useMemo } from "react";
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
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Flag,
    Search,
    Trash2,
    ExternalLink,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MessageSquare,
    SlidersHorizontal,
    Loader2,
    X,
    Clock,
} from "lucide-react";

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_LABELS = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    dismissed: "Dismissed",
};

const STATUS_COLORS = {
    open: "bg-red-100 text-red-700 border-red-200",
    in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
    dismissed: "bg-gray-100 text-gray-500 border-gray-200",
};

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                STATUS_COLORS[status] ?? STATUS_COLORS.open
            }`}
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

// ── Edit Dialog (unchanged) ───────────────────────────────────────────────────
function EditDialog({ report, statuses, open, onClose }) {
    const { data, setData, patch, processing } = useForm({
        status: report?.status ?? "open",
        admin_note: report?.admin_note ?? "",
    });

    const handleSubmit = () => {
        patch(route("admin.error-reports.update", report.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    if (!report) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg w-[calc(100vw-2rem)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-[#E5201C]" />
                        Update Report #{report.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1 border">
                    <p className="font-medium text-foreground line-clamp-3">
                        {report.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        by{" "}
                        <span className="font-medium">
                            {report.user?.name ?? "Unknown"}
                        </span>{" "}
                        · {report.page_title ?? "—"}
                    </p>
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
                                (optional)
                            </span>
                        </label>
                        <Textarea
                            value={data.admin_note}
                            onChange={(e) =>
                                setData("admin_note", e.target.value)
                            }
                            placeholder="Internal notes about this report…"
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
                        className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700 text-white"
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

// ── Image Lightbox (unchanged) ────────────────────────────────────────────────
function ImageLightbox({ src, onClose }) {
    if (!src) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={onClose}
            >
                <X className="h-7 w-7" />
            </button>
            <img
                src={src}
                alt="Screenshot"
                className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Index({ reports, filters, statuses }) {
    const [globalFilter, setGlobalFilter] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "all");
    const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const [editReport, setEditReport] = useState(null);
    const [deleteReport, setDeleteReport] = useState(null);
    const [lightboxSrc, setLightboxSrc] = useState(null);

    const data = useMemo(() => {
        if (statusFilter === "all") return reports.data;
        return reports.data.filter((r) => r.status === statusFilter);
    }, [reports.data, statusFilter]);

    const columns = useMemo(
        () => [
            // Screenshot column (unchanged)
            {
                id: "screenshot",
                header: "",
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => {
                    const r = row.original;
                    return r.image_url_full ? (
                        <button
                            onClick={() => setLightboxSrc(r.image_url_full)}
                            className="w-11 h-11 rounded-lg overflow-hidden border hover:opacity-80 transition shrink-0"
                        >
                            <img
                                src={r.image_url_full}
                                alt="Screenshot"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ) : (
                        <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                    );
                },
                size: 56,
            },
            {
                accessorKey: "id",
                header: ({ column }) => (
                    <SortHeader column={column}>#</SortHeader>
                ),
                cell: ({ getValue }) => (
                    <span className="text-muted-foreground text-xs font-mono">
                        #{getValue()}
                    </span>
                ),
                size: 60,
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <SortHeader column={column}>Status</SortHeader>
                ),
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
                size: 130,
            },
            {
                accessorKey: "description",
                header: ({ column }) => (
                    <SortHeader column={column}>Description</SortHeader>
                ),
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div className="space-y-1 min-w-0">
                            <p className="text-sm line-clamp-2">
                                {r.description}
                            </p>
                            {r.admin_note && (
                                <p className="text-xs text-muted-foreground bg-muted/60 rounded px-2 py-1 border-l-2 border-yellow-400 line-clamp-1">
                                    <span className="font-medium text-foreground">
                                        Note:{" "}
                                    </span>
                                    {r.admin_note}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "user",
                accessorFn: (row) => row.user?.name ?? "",
                header: ({ column }) => (
                    <SortHeader column={column}>User</SortHeader>
                ),
                cell: ({ getValue }) =>
                    getValue() || (
                        <span className="text-muted-foreground">Unknown</span>
                    ),
                size: 130,
            },
            {
                accessorKey: "page_title",
                header: "Page",
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div className="space-y-0.5">
                            <p className="text-xs truncate max-w-[150px]">
                                {r.page_title ?? "—"}
                            </p>
                            {r.page_url && (
                                <a
                                    href={r.page_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-0.5 text-xs text-blue-500 hover:underline w-fit"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Visit
                                </a>
                            )}
                        </div>
                    );
                },
                size: 160,
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <SortHeader column={column}>
                        <Clock className="h-4 w-4 mr-1" /> Created
                    </SortHeader>
                ),
                cell: ({ getValue }) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(getValue())}
                    </span>
                ),
                size: 110,
            },
            {
                accessorKey: "updated_at",
                header: ({ column }) => (
                    <SortHeader column={column}>
                        <Clock className="h-4 w-4 mr-1" /> Updated
                    </SortHeader>
                ),
                cell: ({ getValue }) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDate(getValue())}
                    </span>
                ),
                size: 110,
            },
            {
                id: "actions",
                header: "",
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div className="flex items-center gap-1.5 justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditReport(r)}
                                className="h-7 px-2.5 text-xs"
                            >
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Update
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteReport(r)}
                                className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter, columnVisibility },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const handleDelete = () => {
        if (!deleteReport) return;
        router.delete(route("admin.error-reports.destroy", deleteReport.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteReport(null),
        });
    };

    const { pageIndex, pageSize } = table.getState().pagination;
    const filteredCount = table.getFilteredRowModel().rows.length;
    const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, filteredCount);

    return (
        <AdminLayout>
            <Head title="Error Reports" />

            <div className="space-y-5">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Flag className="h-7 w-7 text-[#E5201C]" />
                            Error Reports
                        </h1>
                        <p className="text-muted-foreground">
                            Review and manage user-submitted error reports
                        </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {reports.total} total
                    </span>
                </div>

                {/* Toolbar - unchanged */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search description, user, page…"
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {STATUS_LABELS[s] ?? s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(table.getState().pagination.pageSize)}
                        onValueChange={(v) => table.setPageSize(Number(v))}
                    >
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="gap-2 shrink-0"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((col) => col.getCanHide())
                                .map((col) => {
                                    const labelMap = {
                                        id: "#",
                                        status: "Status",
                                        description: "Description",
                                        user: "User",
                                        page_title: "Page",
                                        created_at: "Created",
                                        updated_at: "Updated",
                                    };
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={col.id}
                                            checked={col.getIsVisible()}
                                            onCheckedChange={(v) =>
                                                col.toggleVisibility(v)
                                            }
                                        >
                                            {labelMap[col.id] ?? col.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
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
                                                            style={{
                                                                width: header
                                                                    .column
                                                                    .columnDef
                                                                    .size
                                                                    ? `${header.column.columnDef.size}px`
                                                                    : undefined,
                                                            }}
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
                                                <Flag className="h-8 w-8 mx-auto mb-2 opacity-25" />
                                                <p>No reports found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="align-top"
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className="py-3"
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
                    </CardContent>
                </Card>

                {/* Pagination footer */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {filteredCount === 0
                            ? "No results"
                            : `Showing ${from}–${to} of ${filteredCount}`}
                    </span>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.firstPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            «
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-3 tabular-nums">
                            {pageIndex + 1} / {table.getPageCount() || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.lastPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            »
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <EditDialog
                report={editReport}
                statuses={statuses}
                open={Boolean(editReport)}
                onClose={() => setEditReport(null)}
            />

            <AlertDialog
                open={Boolean(deleteReport)}
                onOpenChange={(v) => !v && setDeleteReport(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete report #
                            {deleteReport?.id} and any attached screenshot. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ImageLightbox
                src={lightboxSrc}
                onClose={() => setLightboxSrc(null)}
            />
        </AdminLayout>
    );
}
