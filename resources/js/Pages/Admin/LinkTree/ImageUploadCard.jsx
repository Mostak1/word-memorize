import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Upload, Trash2 } from "lucide-react";

export default function ImageUploadCard({
    title,
    description,
    currentImage,
    uploadRoute,
    deleteRoute,
}) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [preview, setPreview] = useState(null);

    const isCover =
        title.toLowerCase().includes("cover") ||
        title.toLowerCase().includes("banner");

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
        setUploading(true);
        router.post(
            route(uploadRoute),
            { [isCover ? "cover_image" : "profile_image"]: file },
            {
                forceFormData: true,
                onFinish: () => {
                    setUploading(false);
                    setPreview(null);
                },
            },
        );
    }

    function handleDelete() {
        setDeleting(true);
        router.delete(route(deleteRoute), {
            onFinish: () => setDeleting(false),
        });
    }

    const display = preview || currentImage;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <CardDescription className="text-xs">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div
                    className="relative group mx-auto overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors"
                    style={{
                        width: isCover ? "100%" : "160px",
                        height: isCover ? "140px" : "160px",
                    }}
                    onClick={() => fileRef.current?.click()}
                >
                    {display ? (
                        <>
                            <img
                                src={display}
                                alt={title}
                                className={`w-full h-full ${isCover ? "object-cover" : "object-contain"}`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="h-7 w-7 text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                            <Upload className="h-8 w-8 mb-2" />
                            <p className="text-sm font-medium">
                                Click to upload
                            </p>
                            <p className="text-xs mt-1 px-4">
                                {isCover
                                    ? "Recommended: 1200×400px"
                                    : "Recommended: 400×400px"}
                            </p>
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

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        {uploading ? "Uploading…" : "Upload"}
                    </Button>
                    {currentImage && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            {deleting ? "Removing…" : "Remove"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
