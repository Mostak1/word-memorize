import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import WordFormDialog from "@/Pages/Admin/Words/WordFormDialog";
import ExerciseGroupFormDialog from "@/Pages/Admin/ExerciseGroups/ExerciseGroupFormDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Image as ImageIcon,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
};

const columnHelper = createColumnHelper();

export default function Show({ exerciseGroup, words, filters }) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deletingWord, setDeletingWord] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? "");
    const debounceRef = useRef(null);

    // Debounced server-side search
    const handleSearch = useCallback(
        (value) => {
            setSearch(value);
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(
                    route("admin.exercise-groups.show", exerciseGroup.id),
                    { search: value, page: 1 },
                    { preserveState: true, replace: true },
                );
            }, 400);
        },
        [exerciseGroup.id],
    );

    // Server-side sort toggle
    const handleSort = useCallback(
        (column) => {
            const currentDir =
                filters?.sort === column && filters?.direction === "asc"
                    ? "desc"
                    : "asc";
            router.get(
                route("admin.exercise-groups.show", exerciseGroup.id),
                { search, sort: column, direction: currentDir, page: 1 },
                { preserveState: true, replace: true },
            );
        },
        [filters, search, exerciseGroup.id],
    );

    const SortableHeader = ({ column, label }) => (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold"
            onClick={() => handleSort(column)}
        >
            {label}
            <ArrowUpDown
                className={`ml-1 h-3.5 w-3.5 ${
                    filters?.sort === column
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                }`}
            />
        </Button>
    );

    const columns = [
        columnHelper.accessor("word", {
            header: () => <SortableHeader column="word" label="Word" />,
            cell: (info) => (
                <span className="font-medium">{info.getValue()}</span>
            ),
        }),
        // columnHelper.accessor("hyphenation", {
        //     header: "Hyphenation",
        //     cell: (info) =>
        //         info.getValue() || (
        //             <span className="text-muted-foreground">—</span>
        //         ),
        // }),
        columnHelper.accessor("definition", {
            header: () => (
                <SortableHeader column="definition" label="Definition" />
            ),
            cell: (info) => (
                <span className="block max-w-xs truncate">
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor("bangla_meaning", {
            header: "Bangla",
            cell: (info) =>
                info.getValue() || (
                    <span className="text-muted-foreground">—</span>
                ),
        }),
        columnHelper.accessor("image_url_full", {
            header: () => <span className="block text-center">Image</span>,
            cell: (info) => {
                const src = info.getValue();
                const word = info.row.original.word;
                return (
                    <div className="flex justify-center">
                        {src ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="relative h-10 w-10 overflow-hidden rounded border">
                                            <img
                                                src={src}
                                                alt={word}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        "none";
                                                }}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <img
                                            src={src}
                                            alt={word}
                                            className="h-48 w-auto rounded"
                                        />
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        )}
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: (info) => {
                const word = info.row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setEditingWord(word)}
                                    className="flex items-center"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeletingWord(word)}
                                    className="flex items-center text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data: words.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // Sorting, filtering, and pagination are all handled server-side
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: words.last_page,
    });

    const confirmDelete = () => {
        if (!deletingWord) return;
        router.delete(
            route("admin.exercise-groups.words.destroy", [
                exerciseGroup.id,
                deletingWord.id,
            ]),
            {
                onSuccess: () => {
                    toast.success("Word deleted successfully!");
                    setDeletingWord(null);
                },
                onError: () => {
                    toast.error("Failed to delete word.");
                    setDeletingWord(null);
                },
            },
        );
    };

    return (
        <AdminLayout>
            <Head title={exerciseGroup.title} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route("admin.exercise-groups.index")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                {/* Group Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {exerciseGroup.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    difficultyColors[exerciseGroup.difficulty]
                                }
                                variant="secondary"
                            >
                                {exerciseGroup.difficulty}
                            </Badge>
                            {/* <Badge variant="outline">
                                {exerciseGroup.type}
                            </Badge> */}
                            <Badge variant="outline">
                                ${exerciseGroup.price}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditingGroup(exerciseGroup)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Group
                        </Button>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Word
                        </Button>
                    </div>
                </div>

                {/* Words DataTable */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle>Words ({words.total})</CardTitle>
                            {/* Search bar */}
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search word, definition…"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Table */}
                        <div className="rounded-md border">
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
                                    {table.getRowModel().rows.length ? (
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
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                {search
                                                    ? `No words found for "${search}".`
                                                    : "No words added yet."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination footer */}
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-sm text-muted-foreground">
                                {words.total > 0
                                    ? `Showing ${words.from}–${words.to} of ${words.total} words`
                                    : "No results"}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!words.prev_page_url}
                                    onClick={() =>
                                        router.get(
                                            words.prev_page_url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {words.current_page} of{" "}
                                    {words.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!words.next_page_url}
                                    onClick={() =>
                                        router.get(
                                            words.next_page_url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Group Dialog */}
            {editingGroup && (
                <ExerciseGroupFormDialog
                    open={!!editingGroup}
                    exerciseGroup={editingGroup}
                    onOpenChange={(open) => !open && setEditingGroup(null)}
                />
            )}

            {/* Create Word Dialog */}
            <WordFormDialog
                exerciseGroup={exerciseGroup}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            {/* Edit Word Dialog */}
            {editingWord && (
                <WordFormDialog
                    exerciseGroup={exerciseGroup}
                    word={editingWord}
                    open={!!editingWord}
                    onOpenChange={(open) => !open && setEditingWord(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deletingWord}
                onOpenChange={(open) => !open && setDeletingWord(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Word</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingWord?.word}</strong>? This action
                            cannot be undone and will remove the word and its
                            associated image.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
