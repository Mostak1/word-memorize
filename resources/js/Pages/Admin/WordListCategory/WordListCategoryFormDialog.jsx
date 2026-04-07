import { useEffect, useRef, useState } from "react";
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
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

export default function WordListCategoryFormDialog({
    open,
    onOpenChange,
    category = null,
}) {
    const isEditing = !!category;
    const fileInputRef = useRef(null);

    const [data, setData] = useState({
        name: "",
        description: "",
        status: true,
        is_locked: false,
        price: "",
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [removeThumbnail, setRemoveThumbnail] = useState(false);

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // ── Reset form whenever dialog opens/closes ──────────────────────────────
    useEffect(() => {
        if (open) {
            setData({
                name: category?.name || "",
                description: category?.description || "",
                status: category?.status ?? true,
                is_locked: category?.is_locked ?? false,
                price: category?.price ?? "",
            });
            setThumbnailFile(null);
            setPreviewUrl(category?.thumbnail_url_full || null);
            setRemoveThumbnail(false);
            setErrors({});
        } else {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
            setThumbnailFile(null);
            setPreviewUrl(null);
            setRemoveThumbnail(false);
            setData({
                name: "",
                description: "",
                status: true,
                is_locked: false,
                price: "",
            });
            setErrors({});
        }
    }, [open, category]);

    // ── File picker handler ──────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setThumbnailFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setRemoveThumbnail(false);
        e.target.value = "";
    };

    const handleRemoveThumbnail = () => {
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setThumbnailFile(null);
        setPreviewUrl(null);
        if (isEditing && category?.thumbnail) {
            setRemoveThumbnail(true);
        }
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description ?? "");
        formData.append("status", data.status ? "1" : "0");
        formData.append("is_locked", data.is_locked ? "1" : "0");
        if (data.price !== "" && data.price !== null) {
            formData.append("price", data.price);
        }

        if (thumbnailFile) {
            formData.append("thumbnail", thumbnailFile);
        }

        if (removeThumbnail) {
            formData.append("remove_thumbnail", "1");
        }

        if (isEditing) {
            formData.append("_method", "PATCH");
        }

        router.post(
            isEditing
                ? route("admin.word-list-categories.update", category.id)
                : route("admin.word-list-categories.store"),
            formData,
            {
                preserveState: true,
                preserveScroll: true,
                forceFormData: true,
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
            },
        );
    };

    const hasThumbnail = !!previewUrl;

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

                    {/* Thumbnail */}
                    <div className="space-y-2">
                        <Label>Thumbnail</Label>

                        {hasThumbnail ? (
                            <div className="relative w-full h-36 rounded-lg overflow-hidden border bg-muted group">
                                <img
                                    src={previewUrl}
                                    alt="Thumbnail preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <ImagePlus className="h-4 w-4 mr-1.5" />
                                        Change
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleRemoveThumbnail}
                                    >
                                        <X className="h-4 w-4 mr-1.5" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-28 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <ImagePlus className="h-6 w-6" />
                                <span className="text-sm font-medium">
                                    Click to upload thumbnail
                                </span>
                                <span className="text-xs">
                                    PNG, JPG, WEBP · max 2 MB
                                </span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {errors.thumbnail && (
                            <p className="text-sm text-red-600">
                                {errors.thumbnail}
                            </p>
                        )}
                    </div>

                    {/* Lock toggle + conditional price */}
                    <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_locked"
                                checked={data.is_locked}
                                onCheckedChange={(checked) =>
                                    setData({ ...data, is_locked: checked })
                                }
                            />
                            <div>
                                <Label
                                    htmlFor="is_locked"
                                    className="cursor-pointer"
                                >
                                    Locked (paid access)
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Users must submit a purchase order to access
                                    word lists in this category.
                                </p>
                            </div>
                        </div>

                        {data.is_locked && (
                            <div className="space-y-1.5 pt-1">
                                <Label htmlFor="price">
                                    Price (৳){" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        (shown to users)
                                    </span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            price: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 299"
                                    className="max-w-[160px]"
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
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
