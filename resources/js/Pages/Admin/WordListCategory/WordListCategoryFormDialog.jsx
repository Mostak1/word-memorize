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
    });

    // Separate file state (can't put File objects in plain state easily)
    const [thumbnailFile, setThumbnailFile] = useState(null); // new File to upload
    const [previewUrl, setPreviewUrl] = useState(null); // blob preview URL
    const [removeThumbnail, setRemoveThumbnail] = useState(false); // flag to delete existing

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // ── Reset form whenever dialog opens/closes ──────────────────────────────
    useEffect(() => {
        if (open) {
            setData({
                name: category?.name || "",
                description: category?.description || "",
                status: category?.status ?? true,
            });
            setThumbnailFile(null);
            setPreviewUrl(category?.thumbnail_url_full || null);
            setRemoveThumbnail(false);
            setErrors({});
        } else {
            // cleanup blob URL to avoid memory leak
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
            setThumbnailFile(null);
            setPreviewUrl(null);
            setRemoveThumbnail(false);
            setData({ name: "", description: "", status: true });
            setErrors({});
        }
    }, [open, category]);

    // ── File picker handler ──────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Revoke previous blob preview
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setThumbnailFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setRemoveThumbnail(false); // uploading a new one cancels any remove intent
        e.target.value = ""; // allow re-selecting same file
    };

    const handleRemoveThumbnail = () => {
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setThumbnailFile(null);
        setPreviewUrl(null);
        // Only set remove flag when editing and there was a saved thumbnail
        if (isEditing && category?.thumbnail) {
            setRemoveThumbnail(true);
        }
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Build FormData so the file is included in the request
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description ?? "");
        formData.append("status", data.status ? "1" : "0");

        if (thumbnailFile) {
            formData.append("thumbnail", thumbnailFile);
        }

        if (removeThumbnail) {
            formData.append("remove_thumbnail", "1");
        }

        if (isEditing) {
            // Laravel needs _method spoofing for PATCH with multipart
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

    // ── Whether we currently have any thumbnail showing ──────────────────────
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
                            /* Preview + remove button */
                            <div className="relative w-full h-36 rounded-lg overflow-hidden border bg-muted group">
                                <img
                                    src={previewUrl}
                                    alt="Thumbnail preview"
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay buttons */}
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
                            /* Upload dropzone */
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

                        {/* Hidden file input */}
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
