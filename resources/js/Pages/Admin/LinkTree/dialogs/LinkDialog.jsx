import { useEffect } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";

function InputError({ message }) {
    if (!message) return null;
    return <p className="text-sm text-destructive mt-1">{message}</p>;
}

export default function LinkDialog({
    open,
    onClose,
    editingLink,
    onLinkAdded,
    onLinkUpdated,
}) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        title: editingLink?.title ?? "",
        url: editingLink?.url ?? "",
        icon: editingLink?.icon ?? "",
        is_active: editingLink?.is_active ?? true,
    });

    useEffect(() => {
        if (editingLink) {
            setData({
                title: editingLink.title,
                url: editingLink.url,
                icon: editingLink.icon ?? "",
                is_active: editingLink.is_active,
            });
        } else {
            reset();
        }
    }, [editingLink]);

    function handleSubmit(e) {
        e.preventDefault();
        if (editingLink) {
            patch(route("admin.link-tree.links.update", editingLink.id), {
                onSuccess: (page) => {
                    const updated = page.props.links?.find(
                        (l) => l.id === editingLink.id,
                    ) || { ...editingLink, ...data };
                    onLinkUpdated?.(updated);
                    onClose();
                },
            });
        } else {
            post(route("admin.link-tree.links.store"), {
                onSuccess: (page) => {
                    reset();
                    const newLink =
                        page.props.links?.[page.props.links.length - 1];
                    if (newLink) {
                        onLinkAdded?.(newLink);
                    } else {
                        router.reload({ preserveScroll: true });
                    }
                    onClose();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editingLink ? "Edit Link" : "Add New Link"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="link-title">Title</Label>
                        <Input
                            id="link-title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="My Website"
                            autoFocus
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link-url">URL</Label>
                        <Input
                            id="link-url"
                            type="url"
                            value={data.url}
                            onChange={(e) => setData("url", e.target.value)}
                            placeholder="https://example.com"
                        />
                        <InputError message={errors.url} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link-icon">
                            Icon / Emoji{" "}
                            <span className="text-xs text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="link-icon"
                                value={data.icon}
                                onChange={(e) =>
                                    setData("icon", e.target.value)
                                }
                                placeholder="🔗 or icon name"
                                className="flex-1"
                            />
                            {data.icon && (
                                <div className="w-10 h-10 flex items-center justify-center rounded-md border bg-muted text-lg">
                                    {data.icon}
                                </div>
                            )}
                        </div>
                        <InputError message={errors.icon} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label
                                htmlFor="link-active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Visible on your public page
                            </p>
                        </div>
                        <Switch
                            id="link-active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData("is_active", v)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? "Saving…"
                                : editingLink
                                  ? "Save Changes"
                                  : "Add Link"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
