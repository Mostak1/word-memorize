import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
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
import { Switch } from "@/Components/ui/switch";
import { Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const difficultyColors = {
    beginner:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function Index({ wordLists }) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editingList, setEditingList] = useState(null);
    const [deletingList, setDeletingList] = useState(null);

    const toggleStatus = (wordList) => {
        router.patch(
            route("admin.word-lists.update", wordList.id),
            {
                title: wordList.title,
                price: wordList.price,
                difficulty: wordList.difficulty,
                status: !wordList.status,
            },
            {
                onSuccess: () => toast.success("Status updated!"),
                onError: () => toast.error("Failed to update status."),
            },
        );
    };

    const confirmDelete = () => {
        if (!deletingList) return;
        router.delete(route("admin.word-lists.destroy", deletingList.id), {
            onSuccess: () => {
                toast.success("Word list deleted successfully!");
                setDeletingList(null);
            },
            onError: () => {
                toast.error("Failed to delete word list.");
                setDeletingList(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Word Lists" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Word Lists
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your word lists and vocabulary sets
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Word List
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Word Lists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Words</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wordLists.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            No word lists found. Create your
                                            first one!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    wordLists.data.map((wordList) => (
                                        <TableRow key={wordList.id}>
                                            {/* Title */}
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={route(
                                                        "admin.word-lists.show",
                                                        wordList.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {wordList.title}
                                                </Link>
                                            </TableCell>

                                            {/* Difficulty */}
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        difficultyColors[
                                                            wordList.difficulty
                                                        ]
                                                    }
                                                    variant="secondary"
                                                >
                                                    {wordList.difficulty}
                                                </Badge>
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell>
                                                ${wordList.price}
                                            </TableCell>

                                            {/* Words */}
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {wordList.words_count} words
                                                </Badge>
                                            </TableCell>

                                            {/* Status toggle */}
                                            <TableCell>
                                                <Switch
                                                    checked={wordList.status}
                                                    onCheckedChange={() =>
                                                        toggleStatus(wordList)
                                                    }
                                                />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "admin.word-lists.show",
                                                                    wordList.id,
                                                                )}
                                                                className="flex items-center"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Words
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setEditingList(
                                                                    wordList,
                                                                )
                                                            }
                                                            className="flex items-center"
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeletingList(
                                                                    wordList,
                                                                )
                                                            }
                                                            className="flex items-center text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {wordLists.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {wordLists.links.map((link, index) => (
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

            {/* Create dialog */}
            <WordListFormDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
            />

            {/* Edit dialog */}
            {editingList && (
                <WordListFormDialog
                    open={!!editingList}
                    wordList={editingList}
                    onOpenChange={(open) => !open && setEditingList(null)}
                />
            )}

            {/* Delete confirmation */}
            <AlertDialog
                open={!!deletingList}
                onOpenChange={(open) => !open && setDeletingList(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Word List</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingList?.title}</strong>? This action
                            cannot be undone and will remove all associated
                            words.
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
