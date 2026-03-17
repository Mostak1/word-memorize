import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { toast } from "sonner";

export default function WordListCategoryFormDialog({
    open,
    onOpenChange,
    category = null, // for editing
}) {
    const isEditing = !!category;

    const [data, setData] = useState({
        name: category?.name || "",
        description: category?.description || "",
        status: category?.status ?? true,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setData({
                name: category?.name || "",
                description: category?.description || "",
                status: category?.status ?? true,
            });
            setErrors({});
        } else {
            setData({ name: "", description: "", status: true });
            setErrors({});
        }
    }, [open, category]);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = isEditing
            ? route("admin.word-list-categories.update", category.id)
            : route("admin.word-list-categories.store");

        const method = isEditing ? "patch" : "post";

        router[method](url, data, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    isEditing
                        ? "Category updated successfully!"
                        : "Category created successfully!",
                );
                onOpenChange(false);
            },
            onError: (err) => {
                setErrors(err);
                toast.error("Please fix the errors below.");
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? "Edit Word List Category"
                            : "Create Word List Category"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label>
                            Category Name{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.name}
                            onChange={(e) =>
                                setData({ ...data, name: e.target.value })
                            }
                            placeholder="e.g. Business English, IELTS Vocabulary"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Brief description of this category (optional)"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <Label>Status</Label>
                        <Switch
                            checked={data.status}
                            onCheckedChange={(checked) =>
                                setData({ ...data, status: checked })
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            {data.status ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={processing}>
                            {processing
                                ? "Saving..."
                                : isEditing
                                  ? "Update"
                                  : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
