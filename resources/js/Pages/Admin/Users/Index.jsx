import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";
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
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import {
    Shield,
    Trash2,
    KeyRound,
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Settings2,
    Search,
    X,
    MoreHorizontal,
    UserCog,
    RefreshCw,
    Pencil,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import UserInfoTooltip from "@/Pages/Admin/Users/UserInfoTooltip";
import UserEditDialog from "@/Pages/Admin/Users/UserEditDialog";

// ─── Role badge helper ─────────────────────────────────────────────────────────
function RoleBadge({ role }) {
    const map = {
        admin: { variant: "default", icon: Shield, label: "Admin" },
        instructor: { variant: "secondary", icon: null, label: "Instructor" },
        student: { variant: "outline", icon: null, label: "Student" },
    };
    const cfg = map[role] ?? { variant: "outline", icon: null, label: role };
    return (
        <Badge variant={cfg.variant} className="gap-1 capitalize">
            {cfg.icon && <cfg.icon className="h-3 w-3" />}
            {cfg.label}
        </Badge>
    );
}

// ─── Approve-status badge helper ───────────────────────────────────────────────
function ApproveStatusBadge({ status }) {
    const map = {
        approved:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        pending:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}
        >
            {status ?? "—"}
        </span>
    );
}

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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UsersIndex({
    users,
    filters = {},
    roles = [],
    approveStatuses = [],
}) {
    // ── Dialog state ──────────────────────────────────────────────────────────
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        user: null,
    });
    const [roleDialog, setRoleDialog] = useState({
        open: false,
        user: null,
        newRole: null,
    });
    const [resetDialog, setResetDialog] = useState({ open: false, user: null });
    const [editDialog, setEditDialog] = useState({ open: false, user: null });
    const [newPassword, setNewPassword] = useState("12345678");

    // ── Filter state (controlled, synced from server) ─────────────────────────
    const [search, setSearch] = useState(filters.search ?? "");
    const [roleFilter, setRoleFilter] = useState(filters.role ?? "all");
    const [statusFilter, setStatusFilter] = useState(
        filters.approve_status ?? "all",
    );
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);

    // ── Sorting state (client-side on current page) ───────────────────────────
    const [sorting, setSorting] = useState([]);

    // ── Column visibility ─────────────────────────────────────────────────────
    const [columnVisibility, setColumnVisibility] = useState({});

    // ── Debounced server request ──────────────────────────────────────────────
    const debounceRef = useRef(null);
    const applyFilters = useCallback(
        (overrides = {}) => {
            const params = {
                search: overrides.search ?? search,
                role: overrides.role ?? roleFilter,
                approve_status: overrides.approve_status ?? statusFilter,
                per_page: overrides.per_page ?? perPage,
            };
            // Strip "all" sentinel values
            if (params.role === "all") delete params.role;
            if (params.approve_status === "all") delete params.approve_status;
            if (!params.search) delete params.search;

            router.get(route("admin.users.index"), params, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        },
        [search, roleFilter, statusFilter, perPage],
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

    const handleRoleChange = (val) => {
        setRoleFilter(val);
        applyFilters({ role: val });
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilters({ approve_status: val });
    };

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("all");
        setStatusFilter("all");
        router.get(
            route("admin.users.index"),
            {},
            { preserveScroll: true, replace: true },
        );
    };

    const hasActiveFilters =
        search || roleFilter !== "all" || statusFilter !== "all";

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
            header: ({ column }) => (
                <SortHeader column={column}>Name</SortHeader>
            ),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-1.5 group">
                        <UserInfoTooltip user={user}>
                            <span className="font-medium">{user.name}</span>
                        </UserInfoTooltip>
                        <button
                            onClick={() => setEditDialog({ open: true, user })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            title="Edit user info"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    </div>
                );
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <SortHeader column={column}>Email</SortHeader>
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {row.original.email}
                </span>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => <RoleBadge role={row.original.role} />,
        },
        {
            accessorKey: "approve_status",
            header: "Status",
            cell: ({ row }) => (
                <ApproveStatusBadge status={row.original.approve_status} />
            ),
        },
        {
            accessorKey: "wallet",
            header: ({ column }) => (
                <SortHeader column={column}>Wallet</SortHeader>
            ),
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    ${Number(row.original.wallet ?? 0).toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <SortHeader column={column}>Joined</SortHeader>
            ),
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }),
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            enableHiding: false,
            enableSorting: false,
            cell: ({ row }) => {
                const user = row.original;
                const nextRole =
                    user.role === "student"
                        ? "instructor"
                        : user.role === "instructor"
                          ? "admin"
                          : "student";

                return (
                    <div className="flex items-center justify-end gap-2">
                        {/* Role change */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                >
                                    <UserCog className="h-3.5 w-3.5" />
                                    Role
                                    <ChevronDown className="h-3 w-3 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    Change role to…
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {["student", "instructor", "admin"]
                                    .filter((r) => r !== user.role)
                                    .map((r) => (
                                        <DropdownMenuItem
                                            key={r}
                                            className="capitalize"
                                            onClick={() =>
                                                setRoleDialog({
                                                    open: true,
                                                    user,
                                                    newRole: r,
                                                })
                                            }
                                        >
                                            {r}
                                        </DropdownMenuItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Reset password */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setResetDialog({ open: true, user });
                                setNewPassword("12345678");
                            }}
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                                setDeleteDialog({ open: true, user })
                            }
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
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

    // ── Action handlers ───────────────────────────────────────────────────────
    const confirmRoleChange = () => {
        const { user, newRole } = roleDialog;
        router.patch(
            route("admin.users.update-role", user.id),
            { role: newRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${user.name}'s role updated to ${newRole}`);
                    setRoleDialog({ open: false, user: null, newRole: null });
                },
                onError: (e) =>
                    toast.error(Object.values(e)[0] ?? "Failed to update role"),
            },
        );
    };

    const confirmResetPassword = () => {
        const { user } = resetDialog;
        router.post(
            route("admin.users.reset-password", user.id),
            { password: newPassword },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Password reset for ${user.name}`);
                    setResetDialog({ open: false, user: null });
                },
                onError: () => toast.error("Failed to reset password"),
            },
        );
    };

    const confirmDelete = () => {
        const { user } = deleteDialog;
        router.delete(route("admin.users.destroy", user.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${user.name} has been deleted`);
                setDeleteDialog({ open: false, user: null });
            },
            onError: (e) =>
                toast.error(Object.values(e)[0] ?? "Failed to delete user"),
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <Head title="Manage Users" />

            <div className="space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage all users in the system
                    </p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>
                                All Users ({users?.total ?? 0})
                            </CardTitle>

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
                                            onClick={() => handlePerPage(n)}
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
                                        className="ml-auto gap-1"
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
                                                {col.id === "created_at"
                                                    ? "Joined"
                                                    : col.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
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

                            {/* Role filter */}
                            <Select
                                value={roleFilter}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger className="h-9 w-[150px]">
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All roles
                                    </SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem
                                            key={r}
                                            value={r}
                                            className="capitalize"
                                        >
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Approve status filter */}
                            <Select
                                value={statusFilter}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="h-9 w-[160px]">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    {approveStatuses.map((s) => (
                                        <SelectItem
                                            key={s}
                                            value={s}
                                            className="capitalize"
                                        >
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

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
                                                No users found.{" "}
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

            {/* ── Edit User Info Dialog ──────────────────────────────────────────── */}
            <UserEditDialog
                user={editDialog.user}
                open={editDialog.open}
                onOpenChange={(open) =>
                    !open && setEditDialog({ open: false, user: null })
                }
            />

            {/* ── Role Change Dialog ─────────────────────────────────────────────── */}
            <AlertDialog
                open={roleDialog.open}
                onOpenChange={(open) =>
                    !open &&
                    setRoleDialog({ open: false, user: null, newRole: null })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change{" "}
                            <span className="font-semibold">
                                {roleDialog.user?.name}
                            </span>
                            's role from{" "}
                            <span className="font-semibold capitalize">
                                {roleDialog.user?.role}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold capitalize">
                                {roleDialog.newRole}
                            </span>
                            ? This takes effect immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Reset Password Dialog ──────────────────────────────────────────── */}
            <AlertDialog
                open={resetDialog.open}
                onOpenChange={(open) =>
                    !open && setResetDialog({ open: false, user: null })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Password</AlertDialogTitle>
                        <AlertDialogDescription>
                            Set a new password for{" "}
                            <span className="font-semibold">
                                {resetDialog.user?.name}
                            </span>
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmResetPassword}
                            disabled={!newPassword.trim()}
                        >
                            Reset Password
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Delete Dialog ──────────────────────────────────────────────────── */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !open && setDeleteDialog({ open: false, user: null })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete{" "}
                            <span className="font-semibold">
                                {deleteDialog.user?.name}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
