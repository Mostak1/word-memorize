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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Globe, Lock } from "lucide-react";
import { toast } from "sonner";

export default function WordListFormDialog({
    open,
    onOpenChange,
    wordList = null,
    categoryId = null,
}) {
    const isEditing = !!wordList;

    const [data, setData] = useState({
        title: wordList?.title || "",
        difficulty: wordList?.difficulty || "",
        price: wordList?.price ?? 0,
        status: wordList?.status ?? true,
        is_locked: wordList?.is_locked ?? false,
        is_public: wordList?.is_public ?? true,
        word_list_category_id:
            wordList?.word_list_category_id || categoryId || "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setData({
                title: wordList?.title || "",
                difficulty: wordList?.difficulty || "",
                price: wordList?.price ?? 0,
                status: wordList?.status ?? true,
                is_locked: wordList?.is_locked ?? false,
                is_public: wordList?.is_public ?? true,
                word_list_category_id:
                    wordList?.word_list_category_id || categoryId || "",
            });
            setErrors({});
        } else {
            setData({
                title: "",
                difficulty: "",
                price: 0,
                status: true,
                is_locked: false,
                is_public: true,
                word_list_category_id: "",
            });
            setErrors({});
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = isEditing
            ? route("admin.word-lists.update", wordList.id)
            : route("admin.word-lists.store");
        const method = isEditing ? "patch" : "post";

        router[method](url, data, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    isEditing ? "Word list updated!" : "Word list created!",
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
                        {isEditing ? "Edit Word List" : "Create Word List"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.title}
                            onChange={(e) =>
                                setData({ ...data, title: e.target.value })
                            }
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <Label>
                            Difficulty <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.difficulty}
                            onValueChange={(v) =>
                                setData({ ...data, difficulty: v })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">
                                    Beginner
                                </SelectItem>
                                <SelectItem value="intermediate">
                                    Intermediate
                                </SelectItem>
                                <SelectItem value="advanced">
                                    Advanced
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.difficulty && (
                            <p className="text-sm text-red-600">
                                {errors.difficulty}
                            </p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label>
                            Price <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            value={data.price}
                            onChange={(e) =>
                                setData({ ...data, price: e.target.value })
                            }
                        />
                        {errors.price && (
                            <p className="text-sm text-red-600">
                                {errors.price}
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

                    {/* Is Locked */}
                    <div className="flex items-center gap-3">
                        <Label className="flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" />
                            Locked
                        </Label>
                        <Switch
                            checked={data.is_locked}
                            onCheckedChange={(checked) =>
                                setData({ ...data, is_locked: checked })
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            {data.is_locked
                                ? "Locked (users must purchase)"
                                : "Unlocked (free access)"}
                        </span>
                    </div>

                    {/* Is Public */}
                    <div className="flex items-center gap-3">
                        <Label className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            Visibility
                        </Label>
                        <Switch
                            checked={data.is_public}
                            onCheckedChange={(checked) =>
                                setData({ ...data, is_public: checked })
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            {data.is_public
                                ? "Public (visible to all users)"
                                : "Private (hidden from users)"}
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
