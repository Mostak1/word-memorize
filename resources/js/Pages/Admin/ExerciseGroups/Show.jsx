import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import WordFormDialog from "@/Pages/Admin/Words/WordFormDialog";
import ExerciseGroupFormDialog from "@/Pages/Admin/ExerciseGroups/ExerciseGroupFormDialog";
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
    ArrowLeft,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
};

export default function Show({ exerciseGroup }) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deletingWord, setDeletingWord] = useState(null);

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
                            <Badge variant="outline">
                                {exerciseGroup.type}
                            </Badge>
                            <Badge variant="outline">
                                ${exerciseGroup.price}
                            </Badge>
                        </div>
                    </div>

                    {/* Group Actions */}
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

                {/* Words Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Words ({exerciseGroup.words.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {exerciseGroup.words.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No words added yet. Add your first word to
                                    get started!
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() => setCreateDialogOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Word
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Word</TableHead>
                                        <TableHead>Hyphenation</TableHead>
                                        <TableHead>Definition</TableHead>
                                        <TableHead>Bangla</TableHead>
                                        <TableHead className="text-center">
                                            Image
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exerciseGroup.words.map((word) => (
                                        <TableRow key={word.id}>
                                            <TableCell className="font-medium">
                                                {word.word}
                                            </TableCell>
                                            <TableCell>
                                                {word.hyphenation || "-"}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {word.definition}
                                            </TableCell>
                                            <TableCell>
                                                {word.bangla_translation}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {word.image_url_full ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div className="flex justify-center">
                                                                    <div className="relative h-10 w-10 overflow-hidden rounded border">
                                                                        <img
                                                                            src={
                                                                                word.image_url_full
                                                                            }
                                                                            alt={
                                                                                word.word
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                            onError={(
                                                                                e,
                                                                            ) => {
                                                                                console.error(
                                                                                    "Image failed to load:",
                                                                                    word.image_url_full,
                                                                                );
                                                                                e.target.style.display =
                                                                                    "none";
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <img
                                                                    src={
                                                                        word.image_url_full
                                                                    }
                                                                    alt={
                                                                        word.word
                                                                    }
                                                                    className="h-48 w-auto rounded"
                                                                />
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <div className="flex justify-center text-gray-400">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </TableCell>
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
                                                            onClick={() =>
                                                                setEditingWord(
                                                                    word,
                                                                )
                                                            }
                                                            className="flex items-center"
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeletingWord(
                                                                    word,
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
                                    ))}
                                </TableBody>
                            </Table>
                        )}
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
