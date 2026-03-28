import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Upload, Trash2, Image } from "lucide-react";

export default function ThumbnailDialog({ open, onClose, link }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [preview, setPreview] = useState(null);

    if (!link) return null;

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);

        setUploading(true);
        router.post(
            route("admin.link-tree.links.thumbnail.upload", link.id),
            { thumbnail: file },
            {
                forceFormData: true,
                onFinish: () => {
                    setUploading(false);
                    setPreview(null);
                    onClose();
                },
            },
        );
    }

    function handleDelete() {
        setDeleting(true);
        router.delete(
            route("admin.link-tree.links.thumbnail.delete", link.id),
            {
                onFinish: () => {
                    setDeleting(false);
                    onClose();
                },
            },
        );
    }

    const display = preview || link.thumbnail_full;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Thumbnail — {link.title}</DialogTitle>
                </DialogHeader>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div
                    className="relative group overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors mx-auto"
                    style={{ width: "100%", height: "160px" }}
                    onClick={() => fileRef.current?.click()}
                >
                    {display ? (
                        <>
                            <img
                                src={display}
                                alt="thumbnail"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="h-7 w-7 text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-2">
                            <Image className="h-8 w-8" />
                            <p className="text-sm font-medium">
                                Click to upload thumbnail
                            </p>
                            <p className="text-xs">Recommended: 400×400px</p>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <span className="text-sm animate-pulse">
                                Uploading…
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                    </Button>
                    {link.thumbnail_full && (
                        <Button
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            {deleting ? "Removing…" : "Remove"}
                        </Button>
                    )}
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
