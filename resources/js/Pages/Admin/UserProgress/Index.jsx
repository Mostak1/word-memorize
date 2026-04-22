import React, { useState, useCallback, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/Components/ui/dropdown-menu";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Search,
    X,
    Settings2,
    BarChart3,
    Trophy,
    Zap,
} from "lucide-react";

// ─── Sortable column header ────────────────────────────────────────────────────
function SortHeader({ column, children }) {
    const sorted = column.getIsSorted();
    return (
        <button
            className="flex items-center gap-1 select-none hover:text-foreground"
            onClick={() => column.toggleSorting(sorted === "asc")}
        >
            {children}
            {sorted === "asc" ? (
                <ChevronUp className="h-4 w-4" />
            ) : sorted === "desc" ? (
                <ChevronDown className="h-4 w-4" />
            ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-40" />
            )}
        </button>
    );
}

export default function UserProgressIndex({ users, filters = {} }) {
    // ── Filter state ──────────────────────────────────────────────────────────
    const [search, setSearch] = useState(filters.search ?? "");
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);
    const [sorting, setSorting] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    // ── Debounced server request ──────────────────────────────────────────────
    const debounceRef = useRef(null);
    const applyFilters = useCallback(
        (overrides = {}) => {
            const params = {
                search: overrides.search ?? search,
                per_page: overrides.per_page ?? perPage,
            };
            if (!params.search) delete params.search;

            router.get(route("admin.user-progress.index"), params, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        },
        [search, perPage],
    );

    const handlePerPage = useCallback(
        (value) => {
            setPerPage(value);
            applyFilters({ per_page: value });
        },
        [applyFilters],
    );

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(
            () => applyFilters({ search: val }),
            400,
        );
    };

    const clearFilters = () => {
        setSearch("");
        router.get(
            route("admin.user-progress.index"),
            {},
            { preserveScroll: true, replace: true },
        );
    };

    const hasActiveFilters = !!search;

    // ── Column definitions ────────────────────────────────────────────────────
    const columns = [
        {
            id: "index",
            header: "#",
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {(users.current_page - 1) * users.per_page + row.index + 1}
                </span>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => <SortHeader column={column}>Name</SortHeader>,
            cell: ({ row }) => (
                <div className="font-medium text-sm">{row.original.name}</div>
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }) => <SortHeader column={column}>Email</SortHeader>,
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm">
                    {row.original.email}
                </div>
            ),
        },
        {
            accessorKey: "current_streak",
            header: ({ column }) => (
                <SortHeader column={column}>Current Streak</SortHeader>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 justify-center">
                    <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                    <span className="font-semibold">
                        {row.original.current_streak}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "last_practice",
            header: ({ column }) => (
                <SortHeader column={column}>Last Practice</SortHeader>
            ),
            cell: ({ row }) => {
                const date = row.original.last_practice;
                return (
                    <div className="text-sm text-center">
                        {date
                            ? new Date(date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "Never"}
                    </div>
                );
            },
        },
        {
            accessorKey: "xp",
            header: ({ column }) => <SortHeader column={column}>XP</SortHeader>,
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 justify-center text-blue-600 dark:text-blue-400 font-bold">
                    <Trophy className="h-3.5 w-3.5" />
                    {row.original.xp.toLocaleString()}
                </div>
            ),
        },
        {
            accessorKey: "mastered_words_count",
            header: ({ column }) => (
                <SortHeader column={column}>Mastered Words</SortHeader>
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {row.original.mastered_words_count}
                </div>
            ),
        },
        {
            id: "wordlist_progress",
            header: "Wordlist Progress",
            cell: ({ row }) => {
                const lists = row.original.wordlist_progress || [];
                return (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                            value={`progress-${row.original.id}`}
                            className="border-none"
                        >
                            <AccordionTrigger className="hover:no-underline py-1 px-2 rounded-md hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>View by wordlist</span>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] px-1.5 py-0 h-4"
                                    >
                                        {lists.length}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                {lists.length > 0 ? (
                                    lists.map((item) => (
                                        <div
                                            key={item.wordlist_id}
                                            className="rounded-lg border bg-card p-2 shadow-sm text-xs"
                                        >
                                            <div className="font-semibold mb-1 truncate">
                                                {item.wordlist_title}
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                                        Learning
                                                    </span>
                                                    <span className="font-medium text-blue-600">
                                                        {item.learning_count}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                                        Reviewing
                                                    </span>
                                                    <span className="font-medium text-orange-600">
                                                        {item.reviewing_count}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                                        Mastered
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                        {item.mastered_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[11px] text-muted-foreground italic px-2">
                                        No progress recorded yet.
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                );
            },
        },
    ];

    // ── Table instance ────────────────────────────────────────────────────────
    const table = useReactTable({
        data: users?.data ?? [],
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: users?.last_page ?? 1,
    });

    return (
        <AdminLayout>
            <Head title="User Progress" />

            <div className="space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        User Progress
                    </h1>
                    <p className="text-muted-foreground">
                        Track user streaks, XP, and mastered word counts.
                    </p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>
                                All Users ({users?.total ?? 0})
                            </CardTitle>

                            <div className="flex items-center gap-2">
                                {/* Per-page selector */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            {perPage} / page
                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {[10, 20, 50, 100].map((n) => (
                                            <DropdownMenuItem
                                                key={n}
                                                onClick={() =>
                                                    handlePerPage(n)
                                                }
                                                className={
                                                    perPage === n
                                                        ? "font-semibold bg-muted text-foreground"
                                                        : ""
                                                }
                                            >
                                                {n} per page
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Column visibility toggle */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <Settings2 className="h-4 w-4" />
                                            Columns
                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                            Toggle columns
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {table
                                            .getAllColumns()
                                            .filter((c) => c.getCanHide())
                                            .map((col) => (
                                                <DropdownMenuCheckboxItem
                                                    key={col.id}
                                                    className="capitalize"
                                                    checked={col.getIsVisible()}
                                                    onCheckedChange={(v) =>
                                                        col.toggleVisibility(v)
                                                    }
                                                >
                                                    {col.id.replace(/_/g, " ")}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Filters row */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search name or email…"
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="pl-8 h-9"
                                />
                            </div>

                            {/* Clear filters */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="gap-1 text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((hg) => (
                                        <TableRow key={hg.id}>
                                            {hg.headers.map((header) => (
                                                <TableHead
                                                    key={header.id}
                                                    className="whitespace-nowrap"
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext(),
                                                          )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="hover:bg-muted/40"
                                            >
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
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                No progress records found.{" "}
                                                {hasActiveFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="underline hover:text-foreground"
                                                    >
                                                        Clear filters
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {users?.links && users.links.length > 3 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing{" "}
                                    <span className="font-medium">
                                        {(users.current_page - 1) *
                                            users.per_page +
                                            1}
                                    </span>{" "}
                                    –{" "}
                                    <span className="font-medium">
                                        {Math.min(
                                            users.current_page * users.per_page,
                                            users.total,
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                        {users.total}
                                    </span>{" "}
                                    users
                                </p>

                                <div className="flex items-center gap-1">
                                    {users.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={
                                                link.active
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url)
                                            }
                                            className="min-w-[2rem] px-2"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
