import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
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
    Trophy,
    Plus,
    Edit,
    Trash2,
    Flame,
    Coins,
    Sunrise,
    Target,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AchievementFormDialog from "./AchievementFormDialog";

// ── Category helpers ─────────────────────────────────────────────────────────
function getCategoryIcon(category) {
    switch (category) {
        case "streak":
            return <Flame className="w-4 h-4" />;
        case "xp":
            return <Coins className="w-4 h-4" />;
        case "morning":
            return <Sunrise className="w-4 h-4" />;
        case "perfect":
            return <Target className="w-4 h-4" />;
        default:
            return <Trophy className="w-4 h-4" />;
    }
}

function getCategoryLabel(category) {
    switch (category) {
        case "streak":
            return "Streak";
        case "xp":
            return "XP";
        case "morning":
            return "Morning";
        case "perfect":
            return "Perfect";
        default:
            return category;
    }
}

function getTierColor(tier) {
    switch (tier) {
        case 1:
            return "text-yellow-500";
        case 2:
            return "text-gray-400";
        case 3:
            return "text-yellow-600";
        case 4:
            return "text-purple-500";
        case 5:
            return "text-blue-500";
        default:
            return "text-gray-500";
    }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AchievementsIndex({ achievements }) {
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        achievement: null,
    });
    const [formDialog, setFormDialog] = useState({
        open: false,
        achievement: null,
    });

    const handleDelete = (achievement) => {
        setDeleteDialog({ open: true, achievement });
    };

    const confirmDelete = () => {
        if (!deleteDialog.achievement) return;

        router.delete(
            route("admin.achievements.destroy", deleteDialog.achievement.id),
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Achievement deleted successfully!");
                    setDeleteDialog({ open: false, achievement: null });
                },
                onError: () => {
                    toast.error("Failed to delete achievement.");
                },
            },
        );
    };

    const handleEdit = (achievement) => {
        setFormDialog({ open: true, achievement });
    };

    const handleCreate = () => {
        setFormDialog({ open: true, achievement: null });
    };

    return (
        <AdminLayout>
            <Head title="Achievements" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Achievements
                    </h1>
                    <p className="text-muted-foreground">
                        Manage achievement definitions and badges
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                </Button>
            </div>

            <div className="mt-6 space-y-6">
                {Object.entries(achievements).map(
                    ([category, categoryAchievements]) => (
                        <Card key={category}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getCategoryIcon(category)}
                                    {getCategoryLabel(category)} Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Key</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Tier</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead className="w-[100px]">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categoryAchievements.map(
                                            (achievement) => (
                                                <TableRow key={achievement.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {achievement.key}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {achievement.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {
                                                            achievement.description
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={getTierColor(
                                                                achievement.tier,
                                                            )}
                                                        >
                                                            Tier{" "}
                                                            {achievement.tier}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            achievement.milestone_value
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        achievement,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        achievement,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ),
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({
                        open,
                        achievement: open ? deleteDialog.achievement : null,
                    })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {deleteDialog.achievement?.name}"? This action
                            cannot be undone.
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

            {/* Form Dialog */}
            <AchievementFormDialog
                open={formDialog.open}
                onOpenChange={(open) =>
                    setFormDialog({
                        open,
                        achievement: open ? formDialog.achievement : null,
                    })
                }
                achievement={formDialog.achievement}
            />
        </AdminLayout>
    );
}
