import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Plus, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
};

export default function Index({ exerciseGroups }) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deletingGroup, setDeletingGroup] = useState(null);

    const toggleStatus = (group) => {
        router.patch(
            route("admin.exercise-groups.update", group.id),
            {
                title: group.title,
                price: group.price,
                difficulty: group.difficulty,
                status: !group.status,
            },
            {
                onSuccess: () => toast.success("Status updated!"),
                onError: () => toast.error("Failed to update status."),
            },
        );
    };

    const confirmDelete = () => {
        if (!deletingGroup) return;

        router.delete(
            route("admin.exercise-groups.destroy", deletingGroup.id),
            {
                onSuccess: () => {
                    toast.success("Exercise group deleted successfully!");
                    setDeletingGroup(null);
                },
                onError: () => {
                    toast.error("Failed to delete exercise group.");
                    setDeletingGroup(null);
                },
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Exercise Groups" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Exercise Groups
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your exercise groups and vocabulary sets
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Exercise Group
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Exercise Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    {/* <TableHead>Type</TableHead> */}
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
                                {exerciseGroups.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted-foreground"
                                        >
                                            No exercise groups found. Create
                                            your first one!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exerciseGroups.data.map((group) => (
                                        <TableRow key={group.id}>
                                            <TableCell className="font-medium">
                                                {/* {group.title} */}

                                                <Link
                                                    href={route(
                                                        "admin.exercise-groups.show",
                                                        group.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {group.title}
                                                </Link>
                                            </TableCell>
                                            {/* <TableCell>{group.type}</TableCell> */}
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        difficultyColors[
                                                            group.difficulty
                                                        ]
                                                    }
                                                    variant="secondary"
                                                >
                                                    {group.difficulty}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                ${group.price}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {group.words_count} words
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={group.status}
                                                    onCheckedChange={() =>
                                                        toggleStatus(group)
                                                    }
                                                />
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
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "admin.exercise-groups.show",
                                                                    group.id,
                                                                )}
                                                                className="flex items-center"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Words
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setEditingGroup(
                                                                    group,
                                                                )
                                                            }
                                                            className="flex items-center"
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeletingGroup(
                                                                    group,
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
                        {exerciseGroups.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {exerciseGroups.links.map((link, index) => (
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

            <ExerciseGroupFormDialog
                open={openCreate}
                onOpenChange={setOpenCreate}
            />

            {editingGroup && (
                <ExerciseGroupFormDialog
                    open={!!editingGroup}
                    exerciseGroup={editingGroup}
                    onOpenChange={(open) => !open && setEditingGroup(null)}
                />
            )}

            <AlertDialog
                open={!!deletingGroup}
                onOpenChange={(open) => !open && setDeletingGroup(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Exercise Group
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingGroup?.title}</strong>? This action
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
