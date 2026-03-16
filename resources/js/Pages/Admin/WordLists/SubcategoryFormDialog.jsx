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
import { toast } from "sonner";

export default function SubcategoryFormDialog({
    open,
    onOpenChange,
    wordList,
    subcategory = null, // null = create mode
}) {
    const isEditing = !!subcategory;
    const [name, setName] = useState(subcategory?.name ?? "");
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    // Reset form whenever dialog opens/closes
    useEffect(() => {
        if (open) {
            setName(subcategory?.name ?? "");
            setError("");
        }
    }, [open, subcategory]);

    const submit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        setProcessing(true);

        const url = isEditing
            ? route("admin.word-lists.subcategories.update", [
                  wordList.id,
                  subcategory.id,
              ])
            : route("admin.word-lists.subcategories.store", wordList.id);

        const method = isEditing ? "patch" : "post";

        router[method](
            url,
            { name: name.trim() },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        isEditing
                            ? "Subcategory updated!"
                            : "Subcategory created!",
                    );
                    onOpenChange(false);
                },
                onError: (errs) => {
                    setError(errs.name ?? "Something went wrong.");
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Subcategory" : "New Subcategory"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subcategory-name">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="subcategory-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            placeholder="e.g., Phrasal Verbs"
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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
