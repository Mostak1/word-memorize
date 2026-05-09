import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
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
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Trash2,
} from "lucide-react";
import GrantAccessDialog from "./GrantAccessDialog";

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

export default function Index({ accessList, filters, users, categories }) {
    const [globalFilter, setGlobalFilter] = useState(filters.search ?? "");
    const [sorting, setSorting] = useState([{ id: "granted_at", desc: true }]);
    const [deleteAccess, setDeleteAccess] = useState(null);

    const handleDelete = () => {
        if (!deleteAccess) return;
        router.delete(route("admin.user-wordlist-access.destroy", deleteAccess.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteAccess(null),
        });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: ({ column }) => (
                    <SortHeader column={column}>ID</SortHeader>
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
                            {row.original.user?.email ?? ""}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "category.name",
                header: "Category",
                cell: ({ getValue }) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                        {getValue() ?? "—"}
                    </span>
                ),
            },
            {
                accessorKey: "course_title",
                header: "Course",
                cell: ({ getValue }) => (
                    getValue() ? (
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                            {getValue()}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                    )
                ),
            },
            {
                accessorKey: "word_list_order_id",
                header: "Order ID",
                cell: ({ getValue }) => (
                    getValue() ? (
                        <span className="text-xs font-mono">#{getValue()}</span>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Manual / Other</span>
                    )
                ),
            },
            {
                accessorKey: "granted_at",
                header: ({ column }) => (
                    <SortHeader column={column}>Granted At</SortHeader>
                ),
                cell: ({ getValue }) => (
                    <span className="text-xs text-muted-foreground">
                        {formatDate(getValue())}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => setDeleteAccess(row.original)}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Revoke
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: accessList.data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: accessList.last_page,
    });

    // Handle search/filter changes with router
    const handleSearch = (val) => {
        setGlobalFilter(val);
        router.get(
            route("admin.user-wordlist-access.index"),
            { search: val },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AdminLayout>
            <Head title="User Word List Access" />

            <div className="space-y-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">User Word List Access</h1>
                    <GrantAccessDialog users={users} categories={categories} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={globalFilter}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by user, category, or course…"
                        className="flex-1"
                    />
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {accessList.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                No access records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
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
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {accessList.from} to {accessList.to} of {accessList.total} results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(accessList.prev_page_url)}
                                    disabled={!accessList.prev_page_url}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(accessList.next_page_url)}
                                    disabled={!accessList.next_page_url}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={Boolean(deleteAccess)}
                onOpenChange={(v) => !v && setDeleteAccess(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove access for{" "}
                            <span className="font-semibold text-foreground">
                                {deleteAccess?.user?.name}
                            </span>{" "}
                            to the category{" "}
                            <span className="font-semibold text-foreground">
                                {deleteAccess?.category?.name}
                            </span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Revoke Access
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
