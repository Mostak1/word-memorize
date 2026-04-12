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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { toast } from "sonner";

export default function AchievementFormDialog({
    open,
    onOpenChange,
    achievement = null,
}) {
    const isEditing = !!achievement;

    const [data, setData] = useState({
        key: "",
        name: "",
        description: "",
        icon: "",
        category: "",
        tier: 1,
        milestone_value: 1,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // ── Reset form whenever dialog opens/closes ──────────────────────────────
    useEffect(() => {
        if (open) {
            setData({
                key: achievement?.key || "",
                name: achievement?.name || "",
                description: achievement?.description || "",
                icon: achievement?.icon || "",
                category: achievement?.category || "",
                tier: achievement?.tier || 1,
                milestone_value: achievement?.milestone_value || 1,
            });
            setErrors({});
        } else {
            setData({
                key: "",
                name: "",
                description: "",
                icon: "",
                category: "",
                tier: 1,
                milestone_value: 1,
            });
            setErrors({});
        }
    }, [open, achievement]);

    // ── Submit ───────────────────────────────────────────────────────────────
    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        if (isEditing) {
            router.patch(
                route("admin.achievements.update", achievement.id),
                data,
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success("Achievement updated successfully!");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        setErrors(err);
                        toast.error("Please fix the errors below.");
                    },
                    onFinish: () => setProcessing(false),
                },
            );
        } else {
            router.post(route("admin.achievements.store"), data, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Achievement created successfully!");
                    onOpenChange(false);
                },
                onError: (err) => {
                    setErrors(err);
                    toast.error("Please fix the errors below.");
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Achievement" : "Create Achievement"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* Key */}
                    <div className="space-y-2">
                        <Label>
                            Key <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.key}
                            onChange={(e) =>
                                setData({ ...data, key: e.target.value })
                            }
                            placeholder="e.g. streak_bronze"
                        />
                        {errors.key && (
                            <p className="text-sm text-red-600">{errors.key}</p>
                        )}
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label>
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.name}
                            onChange={(e) =>
                                setData({ ...data, name: e.target.value })
                            }
                            placeholder="e.g. Streak Bronze"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Brief description of this achievement"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.category}
                            onValueChange={(value) =>
                                setData({ ...data, category: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="streak">Streak</SelectItem>
                                <SelectItem value="xp">XP</SelectItem>
                                <SelectItem value="morning">Morning</SelectItem>
                                <SelectItem value="perfect">Perfect</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="text-sm text-red-600">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    {/* Tier */}
                    <div className="space-y-2">
                        <Label>
                            Tier <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.tier.toString()}
                            onValueChange={(value) =>
                                setData({ ...data, tier: parseInt(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 (Bronze)</SelectItem>
                                <SelectItem value="2">2 (Silver)</SelectItem>
                                <SelectItem value="3">3 (Gold)</SelectItem>
                                <SelectItem value="4">4 (Platinum)</SelectItem>
                                <SelectItem value="5">5 (Diamond)</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.tier && (
                            <p className="text-sm text-red-600">
                                {errors.tier}
                            </p>
                        )}
                    </div>

                    {/* Milestone Value */}
                    <div className="space-y-2">
                        <Label>
                            Milestone Value{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            min="1"
                            value={data.milestone_value}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    milestone_value:
                                        parseInt(e.target.value) || 1,
                                })
                            }
                            placeholder="e.g. 7 (days, XP, count)"
                        />
                        {errors.milestone_value && (
                            <p className="text-sm text-red-600">
                                {errors.milestone_value}
                            </p>
                        )}
                    </div>

                    {/* Icon (optional) */}
                    <div className="space-y-2">
                        <Label>Icon (optional)</Label>
                        <Input
                            value={data.icon}
                            onChange={(e) =>
                                setData({ ...data, icon: e.target.value })
                            }
                            placeholder="e.g. streak-bronze"
                        />
                        {errors.icon && (
                            <p className="text-sm text-red-600">
                                {errors.icon}
                            </p>
                        )}
                    </div>

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
