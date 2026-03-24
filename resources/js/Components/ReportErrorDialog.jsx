import { useState, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Flag, ImagePlus, X, Loader2, Send } from "lucide-react";

/**
 * ReportErrorDialog
 *
 * Can be used in two ways:
 * 1. Self-contained (renders its own trigger button) — default behaviour.
 * 2. Controlled — pass `controlledOpen` + `onControlledOpenChange` from a
 *    parent when you need to open the dialog from outside (e.g. a menu item
 *    that unmounts before the dialog would otherwise mount). In this mode no
 *    trigger button is rendered.
 */
export default function ReportErrorDialog({
    mobileMenuMode = false,
    onOpen,
    controlledOpen,
    onControlledOpenChange,
} = {}) {
    const { auth } = usePage().props;
    const isLoggedIn = Boolean(auth?.user);

    const isControlled = controlledOpen !== undefined;

    const [internalOpen, setInternalOpen] = useState(false);
    const open = isControlled ? controlledOpen : internalOpen;

    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileRef = useRef(null);

    const setOpen = (val) => {
        if (isControlled) {
            onControlledOpenChange?.(val);
        } else {
            setInternalOpen(val);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const resetForm = () => {
        setDescription("");
        removeImage();
        setSubmitted(false);
    };

    const handleClose = (val) => {
        if (submitting) return;
        setOpen(val);
        if (!val) resetForm();
    };

    const handleSubmit = () => {
        if (!description.trim() || submitting) return;

        const formData = new FormData();
        formData.append("page_url", window.location.href);
        formData.append("page_title", document.title);
        formData.append("description", description.trim());
        if (imageFile) formData.append("image", imageFile);

        setSubmitting(true);

        router.post(route("error-reports.store"), formData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setSubmitted(true),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            {/* ── Trigger button — omitted when controlled externally ── */}
            {!isControlled &&
                (mobileMenuMode ? (
                    <button
                        onClick={() => {
                            setOpen(true);
                            onOpen?.();
                        }}
                        className="flex items-center gap-2 text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
                        aria-label="Report an error"
                    >
                        <Flag className="h-4 w-4 shrink-0" />
                        Report Error
                    </button>
                ) : (
                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-full px-2.5 py-1.5 sm:px-3 transition-all"
                        aria-label="Report an error"
                    >
                        <Flag className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden xs:inline sm:inline">
                            Report Error
                        </span>
                    </button>
                ))}

            {/* ── Dialog ── */}
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    {/* ── Not logged in ── */}
                    {!isLoggedIn ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Flag className="h-5 w-5 text-[#E5201C]" />
                                    Report an Error
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 text-center space-y-3">
                                <p className="text-sm text-gray-500">
                                    You need to be signed in to submit a report.
                                </p>
                                <Button
                                    onClick={() => {
                                        window.location.href = route("login");
                                    }}
                                    className="bg-[#E5201C] hover:bg-red-700 text-white w-full"
                                >
                                    Sign in to Report
                                </Button>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </>
                    ) : submitted ? (
                        /* ── Success state ── */
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Flag className="h-5 w-5 text-green-600" />
                                    Report Submitted
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-6 text-center space-y-2">
                                <div className="text-4xl">✅</div>
                                <p className="text-sm text-gray-600 font-medium">
                                    Thank you for the report!
                                </p>
                                <p className="text-xs text-gray-400">
                                    We'll review it as soon as possible.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => handleClose(false)}
                                    className="w-full bg-[#E5201C] hover:bg-red-700 text-white"
                                >
                                    Done
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        /* ── Form ── */
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Flag className="h-5 w-5 text-[#E5201C]" />
                                    Report an Error
                                </DialogTitle>
                                <p className="text-xs text-gray-400 pt-0.5">
                                    Page:{" "}
                                    <span className="font-medium text-gray-500">
                                        {typeof document !== "undefined"
                                            ? document.title
                                            : ""}
                                    </span>
                                </p>
                            </DialogHeader>

                            <div className="space-y-4 mt-1">
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        What's wrong?{" "}
                                        <span className="text-[#E5201C]">
                                            *
                                        </span>
                                    </label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Describe the error, wrong information, or issue you found…"
                                        rows={4}
                                        maxLength={3000}
                                        className="resize-none focus-visible:ring-[#E5201C]/40 focus-visible:border-[#E5201C]"
                                    />
                                    <p className="text-right text-xs text-gray-400 mt-1">
                                        {description.length} / 3000
                                    </p>
                                </div>

                                {/* Screenshot upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Screenshot{" "}
                                        <span className="text-gray-400 font-normal">
                                            (optional)
                                        </span>
                                    </label>

                                    {preview ? (
                                        <div className="relative w-full rounded-xl overflow-hidden border border-gray-200">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full max-h-44 object-cover"
                                            />
                                            <button
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileRef.current?.click()
                                            }
                                            className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#E5201C]/40 hover:text-[#E5201C] transition"
                                        >
                                            <ImagePlus className="h-5 w-5" />
                                            <span className="text-xs">
                                                Click to attach a screenshot
                                            </span>
                                        </button>
                                    )}
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-4 flex-col-reverse sm:flex-row gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="outline"
                                        disabled={submitting}
                                        className="w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!description.trim() || submitting}
                                    className="w-full sm:w-auto bg-[#E5201C] hover:bg-red-700 text-white flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting…
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Submit Report
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
