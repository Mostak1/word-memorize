import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import WordListCategoryFormDialog from "../WordListCategory/WordListCategoryFormDialog";
import WordListFormDialog from "./WordListFormDialog"; // ← NEW IMPORT (adjust path if your folder structure differs)
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
import { Switch } from "@/Components/ui/switch";
import { Plus, MoreVertical, Edit, Trash2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// NEW IMPORTS FOR ACCORDION
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import { Label } from "@/Components/ui/label"; // needed for status label inside accordion

export default function Index({ categories }) {
    const [openCategoryCreate, setOpenCategoryCreate] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // NEW STATE FOR WORD LIST CREATION PER CATEGORY
    const [openWordListCreate, setOpenWordListCreate] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // Word list editing
    const [editingWordList, setEditingWordList] = useState(null);

    // Accordion open state
    const [openAccordions, setOpenAccordions] = useState([]);
    const toggleAccordion = (value) => {
        setOpenAccordions((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value],
        );
    };

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

    // NEW HELPER – opens WordListFormDialog pre-filled with this category
    const openNewWordListForCategory = (category) => {
        setSelectedCategoryId(category.id);
        setOpenWordListCreate(true);
    };

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

                {/* REPLACED TABLE WITH ACCORDION */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Word List Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                No word list categories found. Create your first
                                one!
                            </div>
                        ) : (
                            <Accordion
                                type="multiple"
                                value={openAccordions}
                                onValueChange={setOpenAccordions}
                                className="w-full"
                            >
                                {categories.data.map((category) => (
                                    <AccordionItem
                                        key={category.id}
                                        value={`cat-${category.id}`}
                                    >
                                        {/* Row: name+badge on LEFT, all controls on RIGHT */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 group hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                                            onClick={() =>
                                                toggleAccordion(
                                                    `cat-${category.id}`,
                                                )
                                            }
                                        >
                                            {/* LEFT — category name + count badge */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <span className="font-medium text-lg truncate">
                                                    {category.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0"
                                                >
                                                    {category.word_lists_count}{" "}
                                                    lists
                                                </Badge>
                                            </div>

                                            {/* RIGHT — status · chevron · edit · delete · add */}
                                            <div
                                                className="flex items-center gap-1 shrink-0 ml-4"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {/* Status toggle */}
                                                <Switch
                                                    checked={category.status}
                                                    onCheckedChange={() =>
                                                        toggleCategoryStatus(
                                                            category,
                                                        )
                                                    }
                                                    className="mr-1"
                                                />

                                                {/* Accordion chevron — AccordionTrigger wraps only the icon */}
                                                <AccordionTrigger className="h-8 w-8 p-0 rounded-md hover:bg-muted flex items-center justify-center hover:no-underline [&>svg]:m-0 [&>svg]:shrink-0 data-[state=open]:[&>svg]:rotate-180" />

                                                {/* Divider */}
                                                <div className="w-px h-5 bg-border mx-1" />

                                                {/* Edit */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        setEditingCategory(
                                                            category,
                                                        )
                                                    }
                                                    title="Edit category"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                {/* Delete */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50/80"
                                                    onClick={() =>
                                                        setDeletingCategory(
                                                            category,
                                                        )
                                                    }
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                                {/* Add word list */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openNewWordListForCategory(
                                                            category,
                                                        )
                                                    }
                                                    title="Add new word list"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-6 pt-2">
                                                {/* Actions row - you can keep or move these if you want */}

                                                {/* Word Lists Table / List */}
                                                <div>
                                                    <h3 className="text-sm font-semibold mb-3">
                                                        Word Lists in this
                                                        category (
                                                        {
                                                            category.word_lists_count
                                                        }
                                                        )
                                                    </h3>

                                                    {category.word_lists
                                                        ?.length === 0 ? ( // ← add ?.
                                                        <div className="text-sm text-muted-foreground py-6 text-center border rounded-lg bg-muted/30">
                                                            No word lists in
                                                            this category yet.
                                                            <br />
                                                            Click "Add New Word
                                                            List" above to
                                                            create one.
                                                        </div>
                                                    ) : (
                                                        <div className="border rounded-lg overflow-hidden">
                                                            <Table>
                                                                <TableHeader className="bg-muted/50">
                                                                    <TableRow>
                                                                        <TableHead>
                                                                            Title
                                                                        </TableHead>
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
                                                                        <TableHead className="w-16 text-center">
                                                                            Actions
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {category.word_lists?.map(
                                                                        (
                                                                            wordList, // ← changed here + optional chaining
                                                                        ) => (
                                                                            <TableRow
                                                                                key={
                                                                                    wordList.id
                                                                                }
                                                                                className="cursor-pointer hover:bg-muted/60 transition-colors"
                                                                                onClick={() => {
                                                                                    router.visit(
                                                                                        route(
                                                                                            "admin.word-lists.edit",
                                                                                            wordList.id,
                                                                                        ),
                                                                                    );
                                                                                }}
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
                                                                                        } // prevents accordion toggle when clicking link
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
                                                                                            className={`h-2.5 w-2.5 rounded-full ${wordList.status ? "bg-green-500" : "bg-gray-400"}`}
                                                                                        />
                                                                                    </div>
                                                                                </TableCell>
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
                                                                        ),
                                                                    )}
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
                        )}

                        {/* Pagination (kept exactly as before) */}
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

            {/* Existing Category Dialogs (unchanged) */}
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

            {/* NEW: Word List Creation Dialog (pre-filled with selected category) */}
            <WordListFormDialog
                open={openWordListCreate}
                onOpenChange={(open) => {
                    setOpenWordListCreate(open);
                    if (!open) setSelectedCategoryId(null);
                }}
                categoryId={selectedCategoryId} // ← passes the category ID so the form includes word_list_category_id
            />

            {/* Word List Edit Dialog */}
            {editingWordList && (
                <WordListFormDialog
                    open={!!editingWordList}
                    wordList={editingWordList}
                    onOpenChange={(open) => !open && setEditingWordList(null)}
                />
            )}

            {/* Delete Confirmation (unchanged) */}
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
                            (and their words) inside it.{" "}
                            <strong>This action cannot be undone.</strong>
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
