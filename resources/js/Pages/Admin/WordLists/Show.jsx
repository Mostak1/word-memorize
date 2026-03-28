import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import WordFormDialog from "@/Pages/Admin/Words/WordFormDialog";
import WordListFormDialog from "@/Pages/Admin/WordLists/WordListFormDialog";
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
} from "@/Components/ui/dropdown-menu";
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible";
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
    Layers,
    ChevronDown,
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
    beginner:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const columnHelper = createColumnHelper();

export default function Show({ wordList, words, filters }) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [editingList, setEditingList] = useState(null); // ← was editingGroup
    const [deletingWord, setDeletingWord] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? "");
    const [perPage, setPerPage] = useState(filters?.per_page ?? 10);
    const [subDialogOpen, setSubDialogOpen] = useState(false);
    const [subPanelOpen, setSubPanelOpen] = useState(false);
    const debounceRef = useRef(null);

    // Debounced server-side search
    const handleSearch = useCallback(
        (value) => {
            setSearch(value);
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(
                    route("admin.word-lists.show", wordList.id),
                    { search: value, page: 1, per_page: perPage },
                    { preserveState: true, replace: true },
                );
            }, 400);
        },
        [wordList.id, perPage],
    );

    // Server-side sort
    const handleSort = useCallback(
        (column) => {
            const currentDir =
                filters?.sort === column && filters?.direction === "asc"
                    ? "desc"
                    : "asc";
            router.get(
                route("admin.word-lists.show", wordList.id),
                {
                    search,
                    sort: column,
                    direction: currentDir,
                    page: 1,
                    per_page: perPage,
                },
                { preserveState: true, replace: true },
            );
        },
        [filters, search, wordList.id, perPage],
    );

    // Per-page change
    const handlePerPage = useCallback(
        (value) => {
            setPerPage(value);
            router.get(
                route("admin.word-lists.show", wordList.id),
                {
                    search,
                    sort: filters?.sort,
                    direction: filters?.direction,
                    page: 1,
                    per_page: value,
                },
                { preserveState: true, replace: true },
            );
        },
        [wordList.id, search, filters],
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
                className={`ml-1 h-3.5 w-3.5 ${filters?.sort === column ? "text-foreground" : "text-muted-foreground/40"}`}
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
        // Images column
        columnHelper.accessor("images", {
            header: () => <span className="block text-center">Images</span>,
            cell: (info) => {
                const images = info.getValue() ?? [];
                const wordLabel = info.row.original.word;

                if (images.length === 0) {
                    return (
                        <div className="flex justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                    );
                }

                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex -space-x-2 cursor-pointer">
                                        {images.slice(0, 3).map((img, i) => (
                                            <div
                                                key={img.id}
                                                className="relative h-9 w-9 overflow-hidden rounded border-2 border-background"
                                                style={{ zIndex: 3 - i }}
                                            >
                                                <img
                                                    src={img.image_url_full}
                                                    alt={wordLabel}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            "none";
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="p-2 max-w-xs bg-popover text-popover-foreground border border-border shadow-md"
                                >
                                    <div
                                        className={`grid gap-1 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                                    >
                                        {images.map((img) => (
                                            <div
                                                key={img.id}
                                                className="overflow-hidden rounded"
                                            >
                                                <img
                                                    src={img.image_url_full}
                                                    alt={
                                                        img.caption || wordLabel
                                                    }
                                                    className="h-28 w-full object-cover"
                                                />
                                                {img.caption && (
                                                    <p className="mt-0.5 text-center text-[10px] text-muted-foreground truncate px-1">
                                                        {img.caption}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        {images.length > 1 && (
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-5"
                            >
                                {images.length}
                            </Badge>
                        )}
                    </div>
                );
            },
        }),
        // Actions column
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
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeletingWord(word)}
                                    className="flex items-center text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: words.last_page,
    });

    const confirmDelete = () => {
        if (!deletingWord) return;
        router.delete(
            route("admin.word-lists.words.destroy", [
                wordList.id,
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
            <Head title={wordList.title} />

            <div className="space-y-6">
                {/* Back button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route("admin.word-lists.index")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {wordList.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    difficultyColors[wordList.difficulty]
                                }
                                variant="secondary"
                            >
                                {wordList.difficulty}
                            </Badge>
                            <Badge variant="outline">${wordList.price}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditingList(wordList)}
                        >
                            <Edit className="mr-2 h-4 w-4" /> Edit List
                        </Button>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Word
                        </Button>
                    </div>
                </div>

                {/* Words DataTable */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle>Words ({words.total})</CardTitle>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 gap-1.5"
                                        >
                                            {perPage} / page
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                        </div>
                    </CardHeader>
                    <CardContent>
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

                        {/* Pagination */}
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
                                            { per_page: perPage },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />{" "}
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
                                            { per_page: perPage },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Next{" "}
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Word List dialog */}
            {editingList && (
                <WordListFormDialog
                    open={!!editingList}
                    wordList={editingList}
                    onOpenChange={(open) => !open && setEditingList(null)}
                />
            )}

            {/* Create word dialog */}
            <WordFormDialog
                wordList={wordList}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            {/* Edit word dialog */}
            {editingWord && (
                <WordFormDialog
                    wordList={wordList}
                    word={editingWord}
                    open={!!editingWord}
                    onOpenChange={(open) => !open && setEditingWord(null)}
                />
            )}

            {/* Delete word confirmation */}
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
                            cannot be undone and will remove the word and all
                            its associated images.
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
