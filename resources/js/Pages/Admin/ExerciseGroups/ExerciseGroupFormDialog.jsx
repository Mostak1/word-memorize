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
import { toast } from "sonner";

export default function ExerciseGroupFormDialog({
    open,
    onOpenChange,
    exerciseGroup = null,
}) {
    const isEditing = !!exerciseGroup;

    // Use state for form data
    const [data, setData] = useState({
        title: exerciseGroup?.title || "",
        difficulty: exerciseGroup?.difficulty || "",
        price: exerciseGroup?.price ?? "",
        status: exerciseGroup?.status ?? true,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!open) {
            setData({
                title: "",
                difficulty: "",
                price: "",
                status: true,
            });
            setErrors({});
        }
    }, [open]);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const routeName = isEditing
            ? route("admin.exercise-groups.update", exerciseGroup.id)
            : route("admin.exercise-groups.store");

        const method = isEditing ? "patch" : "post";

        router[method](routeName, data, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    isEditing
                        ? "Exercise group updated!"
                        : "Exercise group created!",
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
                            ? "Edit Exercise Group"
                            : "Create Exercise Group"}
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

                    {/* Status Switch */}
                    <div className="flex items-center gap-3">
                        <Label>Status</Label>
                        <Switch
                            checked={data.status}
                            onCheckedChange={(checked) =>
                                setData({ ...data, status: checked })
                            }
                        />
                        <span>{data.status ? "Active" : "Inactive"}</span>
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
