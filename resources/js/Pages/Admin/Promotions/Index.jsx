import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
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
    BookOpen,
    GraduationCap,
    Megaphone,
    Package,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import PromotionFormDialog from "./PromotionFormDialog";

const TYPE_META = {
    product: {
        label: "Product",
        icon: Package,
        className:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900",
    },
    service: {
        label: "Service",
        icon: BookOpen,
        className:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900",
    },
    course: {
        label: "Course",
        icon: GraduationCap,
        className:
            "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900",
    },
};

const PLACEMENT_LABELS = {
    session_complete: "Session Complete",
};

function TypeBadge({ type }) {
    const meta = TYPE_META[type] ?? TYPE_META.service;
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={meta.className}>
            <Icon className="mr-1 h-3.5 w-3.5" />
            {meta.label}
        </Badge>
    );
}

function PromotionPreview({ promotion }) {
    const imageUrl = promotion.thumbnail || (promotion.product?.ad_image_url ?? null);
    const title = promotion.product?.name || promotion.title;

    if (promotion.type === "product" && promotion.product) {
        return (
            <div className="flex min-w-0 items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-white">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                    ) : null}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-semibold">
                        {title}
                    </p>
                    <p className="text-xs font-bold text-red-600">
                        BDT {promotion.product?.selling_price ?? 0}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-3">
            {imageUrl && (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-white">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}
            <div className="min-w-0">
                <p className="truncate font-semibold">{title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                    {promotion.description}
                </p>
            </div>
        </div>
    );
}

export default function PromotionsIndex({
    promotions,
    products,
    types,
    placements,
}) {
    const [formDialog, setFormDialog] = useState({
        open: false,
        promotion: null,
    });
    const [deletePromotion, setDeletePromotion] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const sortedPromotions = useMemo(
        () =>
            [...promotions].sort(
                (a, b) =>
                    a.placement.localeCompare(b.placement) ||
                    a.priority - b.priority ||
                    b.id - a.id,
            ),
        [promotions],
    );

    const handleDelete = () => {
        if (!deletePromotion) return;

        router.delete(route("admin.promotions.destroy", deletePromotion.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Promotion deleted successfully.");
                setDeletePromotion(null);
            },
            onError: () => toast.error("Failed to delete promotion."),
        });
    };

    const handleStatusToggle = (promotion) => {
        if (updatingStatusId) return;

        setUpdatingStatusId(promotion.id);

        router.patch(
            route("admin.promotions.update", promotion.id),
            {
                type: promotion.type,
                placement: promotion.placement,
                product_id:
                    promotion.type === "product" ? promotion.product_id : null,
                title: promotion.title ?? "",
                description: promotion.description ?? "",
                url: promotion.url ?? "",
                cta_label: promotion.cta_label ?? "",
                thumbnail: promotion.thumbnail ?? "",
                priority: Number(promotion.priority) || 0,
                is_active: !promotion.is_active,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Promotion ${
                            promotion.is_active ? "deactivated" : "activated"
                        } successfully.`,
                    );
                },
                onError: () => toast.error("Failed to update promotion status."),
                onFinish: () => setUpdatingStatusId(null),
            },
        );
    };

    return (
        <AdminLayout>
            <Head title="Promotions" />

            <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5201C] text-white shadow-md">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                Promotions
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage recommendations shown after sessions.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            setFormDialog({ open: true, promotion: null })
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Promotion
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Recommendation</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Placement</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedPromotions.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                No promotions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sortedPromotions.map((promotion) => (
                                            <TableRow key={promotion.id}>
                                                <TableCell className="min-w-[260px]">
                                                    <PromotionPreview
                                                        promotion={promotion}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TypeBadge
                                                        type={promotion.type}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {PLACEMENT_LABELS[
                                                        promotion.placement
                                                    ] ?? promotion.placement}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {promotion.priority}
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusToggle(
                                                                promotion,
                                                            )
                                                        }
                                                        disabled={
                                                            updatingStatusId ===
                                                            promotion.id
                                                        }
                                                        className="rounded-full disabled:cursor-not-allowed disabled:opacity-60"
                                                        aria-label={`Mark promotion as ${
                                                            promotion.is_active
                                                                ? "inactive"
                                                                : "active"
                                                        }`}
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                promotion.is_active
                                                                    ? "cursor-pointer bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900"
                                                                    : "cursor-pointer bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-900 dark:text-gray-400 dark:border-slate-700"
                                                            }
                                                        >
                                                            {updatingStatusId ===
                                                            promotion.id
                                                                ? "Saving..."
                                                                : promotion.is_active
                                                                  ? "Active"
                                                                  : "Inactive"}
                                                        </Badge>
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setFormDialog({
                                                                    open: true,
                                                                    promotion,
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() =>
                                                                setDeletePromotion(
                                                                    promotion,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <PromotionFormDialog
                open={formDialog.open}
                onOpenChange={(open) =>
                    setFormDialog({
                        open,
                        promotion: open ? formDialog.promotion : null,
                    })
                }
                promotion={formDialog.promotion}
                products={products}
                types={types}
                placements={placements}
            />

            <AlertDialog
                open={Boolean(deletePromotion)}
                onOpenChange={(open) => !open && setDeletePromotion(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete promotion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the recommendation from all placements.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
