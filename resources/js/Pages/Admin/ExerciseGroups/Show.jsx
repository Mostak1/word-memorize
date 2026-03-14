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
import ExerciseGroupFormDialog from "@/Pages/Admin/ExerciseGroups/ExerciseGroupFormDialog";
import SubcategoryFormDialog from "@/Pages/Admin/ExerciseGroups/SubcategoryFormDialog";
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
    beginner:     "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced:     "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const columnHelper = createColumnHelper();

export default function Show({ exerciseGroup, subcategories = [], words, filters }) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deletingWord, setDeletingWord] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? "");
    const debounceRef = useRef(null);

    // Subcategory dialog state
    const [subDialogOpen, setSubDialogOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [deletingSubcategory, setDeletingSubcategory] = useState(null);
    const [subPanelOpen, setSubPanelOpen] = useState(false);

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

        columnHelper.accessor("subcategory", {
            header: "Subcategory",
            cell: (info) => {
                const sub = info.getValue();
                return sub ? (
                    <Badge variant="secondary" className="text-xs">
                        {sub.name}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                );
            },
        }),

        columnHelper.accessor("definition", {
            header: () => (
                <SortableHeader column="definition" label="Definition" />
            ),
            cell: (info) => (
                <span className="block max-w-xs truncate">{info.getValue()}</span>
            ),
        }),

        columnHelper.accessor("bangla_meaning", {
            header: "Bangla",
            cell: (info) =>
                info.getValue() || (
                    <span className="text-muted-foreground">—</span>
                ),
        }),

        // ── Images column ─────────────────────────────────────────────────────
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

                const first = images[0];
                const extra = images.length - 1;

                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {/* Thumbnail strip — show up to 3 stacked */}
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
                                                        e.target.style.display = "none";
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </TooltipTrigger>

                                {/* Hover preview: show all images in a small grid */}
                                <TooltipContent
                                    side="right"
                                    className="p-2 max-w-xs bg-popover text-popover-foreground border border-border shadow-md"
                                >
                                    <div
                                        className={`grid gap-1 ${
                                            images.length === 1
                                                ? "grid-cols-1"
                                                : "grid-cols-2"
                                        }`}
                                    >
                                        {images.map((img) => (
                                            <div
                                                key={img.id}
                                                className="overflow-hidden rounded"
                                            >
                                                <img
                                                    src={img.image_url_full}
                                                    alt={img.caption || wordLabel}
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

                        {/* Count badge when more than 1 */}
                        {images.length > 1 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                {images.length}
                            </Badge>
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

    const confirmDeleteSubcategory = () => {
        if (!deletingSubcategory) return;
        router.delete(
            route("admin.exercise-groups.subcategories.destroy", [
                exerciseGroup.id,
                deletingSubcategory.id,
            ]),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Subcategory deleted.");
                    setDeletingSubcategory(null);
                },
                onError: () => {
                    toast.error("Failed to delete subcategory.");
                    setDeletingSubcategory(null);
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
                                className={difficultyColors[exerciseGroup.difficulty]}
                                variant="secondary"
                            >
                                {exerciseGroup.difficulty}
                            </Badge>
                            <Badge variant="outline">${exerciseGroup.price}</Badge>
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

                {/* ── Subcategory Management Panel ───────────────────────────── */}
                <Collapsible open={subPanelOpen} onOpenChange={setSubPanelOpen}>
                    <Card>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        <CardTitle className="text-base">
                                            Subcategories
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            {subcategories.length}
                                        </Badge>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                                            subPanelOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <CardContent className="pt-0 space-y-3">
                                {subcategories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">
                                        No subcategories yet. Create one to
                                        organise words within this group.
                                    </p>
                                ) : (
                                    <div className="divide-y rounded-md border">
                                        {subcategories.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="flex items-center justify-between px-4 py-2.5"
                                            >
                                                <span className="text-sm font-medium">
                                                    {sub.name}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => {
                                                            setEditingSubcategory(sub);
                                                            setSubDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                                        onClick={() =>
                                                            setDeletingSubcategory(sub)
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingSubcategory(null);
                                        setSubDialogOpen(true);
                                    }}
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Subcategory
                                </Button>
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* Words DataTable */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle>Words ({words.total})</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search word, definition…"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
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
                                                              header.getContext(),
                                                          )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
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
                                    Page {words.current_page} of {words.last_page}
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

            {/* Subcategory Create / Edit Dialog */}
            <SubcategoryFormDialog
                open={subDialogOpen}
                onOpenChange={(open) => {
                    setSubDialogOpen(open);
                    if (!open) setEditingSubcategory(null);
                }}
                exerciseGroup={exerciseGroup}
                subcategory={editingSubcategory}
            />

            {/* Delete Subcategory Confirmation */}
            <AlertDialog
                open={!!deletingSubcategory}
                onOpenChange={(open) => !open && setDeletingSubcategory(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingSubcategory?.name}</strong>? Words
                            assigned to it will become uncategorised.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteSubcategory}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Word Dialog */}
            <WordFormDialog
                exerciseGroup={exerciseGroup}
                subcategories={subcategories}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            {/* Edit Word Dialog */}
            {editingWord && (
                <WordFormDialog
                    exerciseGroup={exerciseGroup}
                    subcategories={subcategories}
                    word={editingWord}
                    open={!!editingWord}
                    onOpenChange={(open) => !open && setEditingWord(null)}
                />
            )}

            {/* Delete Word Confirmation Dialog */}
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