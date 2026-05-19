import { useEffect, useMemo, useState, useRef } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

const TYPE_LABELS = {
    product: "Product",
    service: "Service",
    course: "Course",
};

const PLACEMENT_LABELS = {
    session_complete: "Session Complete",
};

const blankForm = {
    type: "service",
    placement: "session_complete",
    product_id: "",
    title: "",
    description: "",
    url: "",
    cta_label: "",
    thumbnail: "",
    priority: 100,
    is_active: true,
};

export default function PromotionFormDialog({
    open,
    onOpenChange,
    promotion = null,
    products = [],
    types = [],
    placements = [],
}) {
    const isEditing = Boolean(promotion);
    const [data, setData] = useState(blankForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [useExternalUrl, setUseExternalUrl] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setData(blankForm);
            setErrors({});
            setProductSearch("");
            setImagePreview(null);
            setUseExternalUrl(false);
            return;
        }

        setData({
            type: promotion?.type ?? "service",
            placement: promotion?.placement ?? "session_complete",
            product_id: promotion?.product_id
                ? String(promotion.product_id)
                : "",
            title: promotion?.title ?? "",
            description: promotion?.description ?? "",
            url: promotion?.url ?? "",
            cta_label: promotion?.cta_label ?? "",
            thumbnail: promotion?.thumbnail ?? "",
            priority: promotion?.priority ?? 100,
            is_active: promotion?.is_active ?? true,
        });
        setErrors({});
        setProductSearch("");
        setImagePreview(promotion?.thumbnail ?? null);

        const isExternal = promotion?.thumbnail
            ? promotion.thumbnail.startsWith("http") &&
              !promotion.thumbnail.includes("/storage/")
            : false;
        setUseExternalUrl(isExternal);
    }, [open, promotion]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setField("thumbnail", file);

        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setField("thumbnail", "");
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const filteredProducts = useMemo(() => {
        const term = productSearch.trim().toLowerCase();
        if (!term) return products.slice(0, 60);

        return products
            .filter((product) =>
                `${product.id} ${product.name}`.toLowerCase().includes(term),
            )
            .slice(0, 60);
    }, [productSearch, products]);

    const selectedProduct = products.find(
        (product) => String(product.id) === String(data.product_id),
    );

    const setField = (field, value) => {
        setData((current) => ({ ...current, [field]: value }));
    };

    const submit = (event) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = {
            ...data,
            product_id:
                data.type === "product" &&
                data.product_id !== "none" &&
                data.product_id
                    ? Number(data.product_id)
                    : null,
            priority: Number(data.priority) || 0,
            is_active: Boolean(data.is_active),
            thumbnail: data.thumbnail || null,
        };

        const options = {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success(
                    isEditing
                        ? "Promotion updated successfully."
                        : "Promotion created successfully.",
                );
                onOpenChange(false);
            },
            onError: (err) => {
                setErrors(err);
                toast.error("Please fix the promotion details.");
            },
            onFinish: () => setProcessing(false),
        };

        if (isEditing) {
            router.post(
                route("admin.promotions.update", promotion.id),
                {
                    ...payload,
                    _method: "PATCH",
                },
                options,
            );
            return;
        }

        router.post(route("admin.promotions.store"), payload, options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Promotion" : "Create Promotion"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(value) =>
                                    setField("type", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {TYPE_LABELS[type] ?? type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-red-600">
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Placement</Label>
                            <Select
                                value={data.placement}
                                onValueChange={(value) =>
                                    setField("placement", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {placements.map((placement) => (
                                        <SelectItem
                                            key={placement}
                                            value={placement}
                                        >
                                            {PLACEMENT_LABELS[placement] ??
                                                placement}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.placement && (
                                <p className="text-sm text-red-600">
                                    {errors.placement}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.priority}
                                onChange={(event) =>
                                    setField("priority", event.target.value)
                                }
                            />
                            {errors.priority && (
                                <p className="text-sm text-red-600">
                                    {errors.priority}
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) =>
                                setField("is_active", event.target.checked)
                            }
                            className="rounded border-gray-300 text-[#E5201C] focus:ring-[#E5201C]"
                        />
                        Active
                    </label>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Thumbnail (Optional)</Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setUseExternalUrl(!useExternalUrl);
                                    // Clear preview or input on toggle to avoid confusion
                                    setImagePreview(null);
                                    setField("thumbnail", "");
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                {useExternalUrl
                                    ? "Or upload an image file"
                                    : "Or use an external image URL"}
                            </button>
                        </div>

                        {useExternalUrl ? (
                            <Input
                                value={
                                    typeof data.thumbnail === "string"
                                        ? data.thumbnail
                                        : ""
                                }
                                onChange={(event) => {
                                    const val = event.target.value;
                                    setField("thumbnail", val);
                                    setImagePreview(val);
                                }}
                                placeholder="https://example.com/image.png"
                            />
                        ) : (
                            <div className="space-y-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <div
                                    className="relative group overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors p-4 flex flex-col items-center justify-center min-h-[140px]"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    {imagePreview ? (
                                        <div className="flex flex-col items-center gap-2 w-full">
                                            <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-white shadow-sm">
                                                <img
                                                    src={imagePreview}
                                                    alt="thumbnail preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {data.thumbnail instanceof File
                                                    ? data.thumbnail.name
                                                    : "Current Thumbnail"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-1.5">
                                            <Upload className="h-7 w-7 text-muted-foreground/70" />
                                            <p className="text-sm font-semibold">
                                                Click to upload thumbnail
                                            </p>
                                            <p className="text-xs text-muted-foreground/75">
                                                PNG, JPG, WEBP up to 2MB
                                                (Converted to WEBP)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {imagePreview && (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                                            Change Image
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20"
                                            onClick={handleRemoveImage}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.thumbnail && (
                            <p className="text-sm text-red-600">
                                {errors.thumbnail}
                            </p>
                        )}
                    </div>

                    {data.type === "product" && (
                        <div className="space-y-3 rounded-lg border p-4">
                            <div className="space-y-2">
                                <Label>
                                    Product (Optional - Leave empty for Custom
                                    URL-based)
                                </Label>
                                <Input
                                    value={productSearch}
                                    onChange={(event) =>
                                        setProductSearch(event.target.value)
                                    }
                                    placeholder="Search products by ID or name"
                                />
                                <Select
                                    value={data.product_id}
                                    onValueChange={(value) =>
                                        setField("product_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Custom URL-based Product Promotion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            -- Custom URL-based (No Database
                                            Product) --
                                        </SelectItem>
                                        {filteredProducts.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={String(product.id)}
                                            >
                                                #{product.id} - {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.product_id && (
                                    <p className="text-sm text-red-600">
                                        {errors.product_id}
                                    </p>
                                )}
                            </div>

                            {selectedProduct && (
                                <div className="flex gap-3 rounded-lg bg-muted/40 p-3">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white">
                                        {selectedProduct.ad_image_url ? (
                                            <img
                                                src={
                                                    selectedProduct.ad_image_url
                                                }
                                                alt={selectedProduct.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {selectedProduct.name}
                                        </p>
                                        <p className="text-sm font-bold text-red-600">
                                            BDT {selectedProduct.selling_price}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(data.type !== "product" ||
                        !data.product_id ||
                        data.product_id === "none") && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={data.title}
                                    onChange={(event) =>
                                        setField("title", event.target.value)
                                    }
                                    placeholder="e.g. IELTS Reading Practice"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(event) =>
                                        setField(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>URL</Label>
                                    <Input
                                        value={data.url}
                                        onChange={(event) =>
                                            setField("url", event.target.value)
                                        }
                                        placeholder="https://fluento.org/..."
                                    />
                                    {errors.url && (
                                        <p className="text-sm text-red-600">
                                            {errors.url}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>CTA Label</Label>
                                    <Input
                                        value={data.cta_label}
                                        onChange={(event) =>
                                            setField(
                                                "cta_label",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. Join Course"
                                    />
                                    {errors.cta_label && (
                                        <p className="text-sm text-red-600">
                                            {errors.cta_label}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
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
