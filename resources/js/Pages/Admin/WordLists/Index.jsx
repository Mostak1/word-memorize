import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import WordListCategoryFormDialog from "../WordListCategory/WordListCategoryFormDialog";
import WordListFormDialog from "./WordListFormDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import { Switch } from "@/Components/ui/switch";
import {
    Plus,
    Edit,
    Trash2,
    Lock,
    Unlock,
    Globe,
    EyeOff,
    ShieldCheck,
    User,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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

// ── Helper: is this category created by an admin (or the system)? ─────────────
const isAdminCategory = (category) =>
    !category.created_by || category.creator?.role === "admin";

export default function Index({ categories }) {
    const [openCategoryCreate, setOpenCategoryCreate] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    const [openWordListCreate, setOpenWordListCreate] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [editingWordList, setEditingWordList] = useState(null);

    // ── Split categories ──────────────────────────────────────────────────────
    const adminCategories = categories.data.filter(isAdminCategory);
    const userCategories = categories.data.filter((c) => !isAdminCategory(c));

    // ── Handlers ──────────────────────────────────────────────────────────────
    const toggleCategoryStatus = (category) => {
        router.patch(
            route("admin.word-list-categories.update", category.id),
            {
                name: category.name,
                description: category.description,
                status: !category.status,
            },
            {
                onSuccess: () => toast.success("Status updated!"),
                onError: () => toast.error("Failed to update status."),
            },
        );
    };

    const toggleWordListLocked = (wordList) => {
        router.patch(
            route("admin.word-lists.update", wordList.id),
            {
                word_list_category_id: wordList.word_list_category_id,
                title: wordList.title,
                price: wordList.price,
                difficulty: wordList.difficulty,
                status: wordList.status,
                is_locked: !wordList.is_locked,
                is_public: wordList.is_public,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        wordList.is_locked
                            ? "Word list unlocked!"
                            : "Word list locked!",
                    ),
                onError: () => toast.error("Failed to update lock status."),
            },
        );
    };

    const toggleWordListPublic = (wordList) => {
        router.patch(
            route("admin.word-lists.update", wordList.id),
            {
                word_list_category_id: wordList.word_list_category_id,
                title: wordList.title,
                price: wordList.price,
                difficulty: wordList.difficulty,
                status: wordList.status,
                is_locked: wordList.is_locked,
                is_public: !wordList.is_public,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        wordList.is_public
                            ? "Word list set to private!"
                            : "Word list set to public!",
                    ),
                onError: () => toast.error("Failed to update visibility."),
            },
        );
    };

    const confirmDeleteCategory = () => {
        if (!deletingCategory) return;
        router.delete(
            route("admin.word-list-categories.destroy", deletingCategory.id),
            {
                onSuccess: () => {
                    toast.success("Category deleted successfully!");
                    setDeletingCategory(null);
                },
                onError: () => {
                    toast.error("Failed to delete category.");
                    setDeletingCategory(null);
                },
            },
        );
    };

    const openNewWordListForCategory = (category) => {
        setSelectedCategoryId(category.id);
        setOpenWordListCreate(true);
    };

    // ── Reusable category accordion ───────────────────────────────────────────
    const renderCategoryList = (list) => (
        <Accordion type="multiple" className="w-full">
            {list.map((category) => (
                <AccordionItem key={category.id} value={`cat-${category.id}`}>
                    <AccordionTrigger className="flex items-center justify-between w-full px-4 py-3 group hover:bg-muted/50 rounded-lg transition-colors [&>svg]:ml-3 [&>svg]:shrink-0 data-[state=open]:[&>svg]:rotate-180">
                        {/* Left side: name + count + creator badge */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="font-medium text-lg truncate">
                                {category.name}
                            </span>
                            <Badge variant="outline" className="shrink-0">
                                {category.word_lists_count} lists
                            </Badge>

                            {/* Creator badge */}
                            {category.creator ? (
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 gap-1 text-xs font-normal border ${
                                        category.creator.role === "admin"
                                            ? "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/40"
                                            : "border-violet-300 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-950/40"
                                    }`}
                                    title={`Created by ${category.creator.email}`}
                                >
                                    {category.creator.role === "admin" ? (
                                        <ShieldCheck className="h-3 w-3" />
                                    ) : (
                                        <User className="h-3 w-3" />
                                    )}
                                    {category.creator.name}
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="shrink-0 gap-1 text-xs font-normal border border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/40"
                                    title="Created by the system / admin"
                                >
                                    <ShieldCheck className="h-3 w-3" />
                                    System
                                </Badge>
                            )}
                        </div>

                        {/* Right side: controls */}
                        <div
                            className="flex items-center gap-1.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Switch
                                checked={category.status}
                                onCheckedChange={() =>
                                    toggleCategoryStatus(category)
                                }
                            />
                            <div className="w-px h-5 bg-border mx-1.5" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingCategory(category)}
                                title="Edit category"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50/80"
                                onClick={() => setDeletingCategory(category)}
                                title="Delete category"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                    openNewWordListForCategory(category)
                                }
                                title="Add new word list"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6">
                        <div className="space-y-6 pt-4">
                            <div>
                                <h3 className="text-sm font-semibold mb-3">
                                    Word Lists in this category (
                                    {category.word_lists_count})
                                </h3>

                                {(category.word_lists ?? []).length === 0 ? (
                                    <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/30">
                                        No word lists in this category yet.
                                        <br />
                                        Click the{" "}
                                        <Plus className="inline h-4 w-4" />{" "}
                                        button above to create one.
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/50">
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead className="w-24 text-center">
                                                        Difficulty
                                                    </TableHead>
                                                    <TableHead className="w-20 text-center">
                                                        Words
                                                    </TableHead>
                                                    <TableHead className="w-24 text-center">
                                                        Price
                                                    </TableHead>
                                                    <TableHead className="w-20 text-center">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="w-20 text-center">
                                                        Locked
                                                    </TableHead>
                                                    <TableHead className="w-20 text-center">
                                                        Public
                                                    </TableHead>
                                                    <TableHead className="w-16 text-center">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {category.word_lists
                                                    .sort((a, b) => a.id - b.id)
                                                    .map((wordList) => (
                                                        <TableRow
                                                            key={wordList.id}
                                                            className="cursor-pointer hover:bg-muted/60 transition-colors"
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "admin.word-lists.show",
                                                                        wordList.id,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <TableCell className="font-medium">
                                                                <Link
                                                                    href={route(
                                                                        "admin.word-lists.show",
                                                                        wordList.id,
                                                                    )}
                                                                    className="hover:underline text-primary block"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    {
                                                                        wordList.title
                                                                    }
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={
                                                                        wordList.difficulty ===
                                                                        "beginner"
                                                                            ? "default"
                                                                            : wordList.difficulty ===
                                                                                "intermediate"
                                                                              ? "secondary"
                                                                              : "destructive"
                                                                    }
                                                                    className="capitalize"
                                                                >
                                                                    {wordList.difficulty ||
                                                                        "—"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {wordList.words_count ??
                                                                    0}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {wordList.price >
                                                                0
                                                                    ? `$${wordList.price}`
                                                                    : "Free"}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex justify-center">
                                                                    <div
                                                                        className={`h-2.5 w-2.5 rounded-full ${
                                                                            wordList.status
                                                                                ? "bg-green-500"
                                                                                : "bg-gray-400"
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                            {/* Locked */}
                                                            <TableCell className="text-center">
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        toggleWordListLocked(
                                                                            wordList,
                                                                        );
                                                                    }}
                                                                    title={
                                                                        wordList.is_locked
                                                                            ? "Unlock this word list"
                                                                            : "Lock this word list"
                                                                    }
                                                                    className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                                                                        wordList.is_locked
                                                                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                                                            : "text-gray-400 hover:text-gray-600 hover:bg-muted"
                                                                    }`}
                                                                >
                                                                    {wordList.is_locked ? (
                                                                        <Lock className="h-4 w-4" />
                                                                    ) : (
                                                                        <Unlock className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </TableCell>
                                                            {/* Public / Private */}
                                                            <TableCell className="text-center">
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        toggleWordListPublic(
                                                                            wordList,
                                                                        );
                                                                    }}
                                                                    title={
                                                                        wordList.is_public
                                                                            ? "Set to private"
                                                                            : "Set to public"
                                                                    }
                                                                    className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                                                                        wordList.is_public
                                                                            ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                                                            : "text-gray-400 hover:text-gray-600 hover:bg-muted"
                                                                    }`}
                                                                >
                                                                    {wordList.is_public ? (
                                                                        <Globe className="h-4 w-4" />
                                                                    ) : (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </TableCell>
                                                            {/* Actions */}
                                                            <TableCell className="text-center">
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        setEditingWordList(
                                                                            wordList,
                                                                        );
                                                                    }}
                                                                    title="Edit word list"
                                                                    className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors text-gray-500 hover:text-gray-800 hover:bg-muted"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );

    return (
        <AdminLayout>
            <Head title="Word List Categories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Word List Categories
                        </h1>
                        <p className="text-muted-foreground">
                            Manage categories to organize your word lists
                        </p>
                    </div>
                    <Button onClick={() => setOpenCategoryCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Word List Category
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-8">
                        {categories.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                No word list categories found. Create your first
                                one!
                            </div>
                        ) : (
                            <>
                                {/* ── Admin / System Categories ─────────────── */}
                                {adminCategories.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                                            <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                                Admin Categories
                                            </h2>

                                            <Badge
                                                variant="outline"
                                                className="border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-950/40"
                                            >
                                                {adminCategories.length}
                                            </Badge>
                                        </div>
                                        {renderCategoryList(adminCategories)}
                                    </div>
                                )}

                                {/* ── User Categories ───────────────────────── */}
                                {userCategories.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="h-4 w-4 text-violet-500" />
                                            <h2 className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                                                User Categories
                                            </h2>
                                            <Badge
                                                variant="outline"
                                                className="border-violet-300 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-950/40"
                                            >
                                                {userCategories.length}
                                            </Badge>
                                        </div>
                                        {renderCategoryList(userCategories)}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pagination */}
                        {categories.links.length > 3 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                {categories.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={
                                            link.active ? "default" : "outline"
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.visit(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <WordListCategoryFormDialog
                open={openCategoryCreate}
                onOpenChange={setOpenCategoryCreate}
            />
            {editingCategory && (
                <WordListCategoryFormDialog
                    open={!!editingCategory}
                    category={editingCategory}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                />
            )}
            <WordListFormDialog
                open={openWordListCreate}
                onOpenChange={(open) => {
                    setOpenWordListCreate(open);
                    if (!open) setSelectedCategoryId(null);
                }}
                categoryId={selectedCategoryId}
            />
            {editingWordList && (
                <WordListFormDialog
                    open={!!editingWordList}
                    wordList={editingWordList}
                    onOpenChange={(open) => !open && setEditingWordList(null)}
                />
            )}
            <AlertDialog
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingCategory?.name}</strong>? This will
                            permanently delete the category and all word lists
                            (and their words) inside it.
                            <strong> This action cannot be undone.</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteCategory}
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
