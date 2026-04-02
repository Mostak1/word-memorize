import { useEffect, useState } from "react";
import { useForm, router } from "@inertiajs/react";
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
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import { Switch } from "@/Components/ui/switch";
import { Globe, X, Image as ImageIcon, Plus, GripVertical } from "lucide-react";

// ── Required word fields ──────────────────────────────────────────────────────
const REQUIRED = {
    word: "Word is required.",
    parts_of_speech_variations: "Parts of Speech Variations is required.",
    definition: "Definition is required.",
    bangla_meaning: "Bangla Meaning is required.",
    example_sentences: "Example Sentences is required.",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a collocations value coming from the server.
 * The DB stores a JSON string; Inertia forwards it as-is.
 * Returns an array of { phrase, example_sentence } objects.
 */
function parseCollocations(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/** Serialize the collocations array to a JSON string for the FormData payload. */
function serializeCollocations(items) {
    const clean = items
        .filter((c) => c.phrase.trim() || c.example_sentence.trim())
        .map((c) => ({
            phrase: c.phrase.trim(),
            example_sentence: c.example_sentence.trim(),
        }));
    return clean.length ? JSON.stringify(clean) : "";
}

const emptyCollocation = () => ({ phrase: "", example_sentence: "" });

// ── Sub-component: single image card ─────────────────────────────────────────
function ImageCard({ src, caption, onCaptionChange, onRemove, isNew = false }) {
    return (
        <div className="group relative rounded-lg border bg-muted/30 overflow-hidden">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                    src={src}
                    alt="Word image"
                    className="h-full w-full object-cover"
                />
                {isNew && (
                    <Badge
                        variant="secondary"
                        className="absolute left-1.5 top-1.5 text-[10px] px-1.5 py-0"
                    >
                        New
                    </Badge>
                )}
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="p-2">
                <Input
                    value={caption}
                    onChange={(e) => onCaptionChange(e.target.value)}
                    placeholder="Add a caption…"
                    className="h-7 text-xs"
                />
            </div>
        </div>
    );
}

// ── Sub-component: collocation row ────────────────────────────────────────────
function CollocationRow({ index, item, onChange, onRemove, isOnly }) {
    return (
        <div className="group relative rounded-md border bg-muted/20 p-3 space-y-2">
            {/* Row header */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    #{index + 1}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-red-500"
                    onClick={onRemove}
                    disabled={isOnly}
                    title="Remove"
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Phrase */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Phrase</Label>
                <Input
                    value={item.phrase}
                    onChange={(e) => onChange("phrase", e.target.value)}
                    placeholder='e.g., "critically analyse"'
                    className="h-8 text-sm"
                />
            </div>

            {/* Example sentence */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                    Example Sentence
                </Label>
                <Input
                    value={item.example_sentence}
                    onChange={(e) =>
                        onChange("example_sentence", e.target.value)
                    }
                    placeholder="e.g., Students must critically analyse the evidence."
                    className="h-8 text-sm"
                />
            </div>
        </div>
    );
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export default function WordFormDialog({
    wordList,
    word = null,
    open,
    onOpenChange,
}) {
    const isEditing = !!word;

    const {
        data,
        setData,
        processing,
        errors: serverErrors,
        reset,
    } = useForm({
        word: word?.word || "",
        pronunciation: word?.pronunciation || "",
        ipa: word?.ipa || "",
        bangla_pronunciation: word?.bangla_pronunciation || "",
        hyphenation: word?.hyphenation || "",
        parts_of_speech_variations: word?.parts_of_speech_variations || "",
        definition: word?.definition || "",
        bangla_meaning: word?.bangla_meaning || "",
        example_sentences: word?.example_sentences || "",
        ai_prompt: word?.ai_prompt || "",
        synonym: word?.synonym || "",
        antonym: word?.antonym || "",
        is_public: word?.is_public ?? true,
    });

    // ── Collocations state (structured) ───────────────────────────────────────
    const [collocations, setCollocations] = useState(
        () => parseCollocations(word?.collocations) || [emptyCollocation()],
    );

    const [clientErrors, setClientErrors] = useState({});
    const errors = { ...clientErrors, ...serverErrors };

    // ── Image state ───────────────────────────────────────────────────────────
    const [existingImages, setExistingImages] = useState(
        word?.images?.map((img) => ({
            id: img.id,
            src: img.image_url_full,
            caption: img.caption || "",
            markedRemoved: false,
        })) ?? [],
    );
    const [newImages, setNewImages] = useState([]);

    useEffect(() => {
        if (open) {
            const parsed = parseCollocations(word?.collocations);
            setCollocations(parsed.length ? parsed : [emptyCollocation()]);
            setExistingImages(
                word?.images?.map((img) => ({
                    id: img.id,
                    src: img.image_url_full,
                    caption: img.caption || "",
                    markedRemoved: false,
                })) ?? [],
            );
            setNewImages([]);
            setClientErrors({});
        } else {
            reset();
            setCollocations([emptyCollocation()]);
            setExistingImages([]);
            setNewImages([]);
            setClientErrors({});
        }
    }, [open]);

    // ── Collocation handlers ──────────────────────────────────────────────────
    const updateCollocation = (index, key, value) => {
        setCollocations((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const addCollocation = () => {
        setCollocations((prev) => [...prev, emptyCollocation()]);
    };

    const removeCollocation = (index) => {
        setCollocations((prev) => {
            if (prev.length <= 1) return [emptyCollocation()];
            return prev.filter((_, i) => i !== index);
        });
    };

    // ── Generic helpers ───────────────────────────────────────────────────────
    const field = (name, value) => {
        setData(name, value);
        if (clientErrors[name]) {
            setClientErrors((prev) => {
                const n = { ...prev };
                delete n[name];
                return n;
            });
        }
    };

    const inputCls = (name) =>
        errors[name] ? "border-red-500 focus-visible:ring-red-500" : "";

    // ── Image handlers ────────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        const remaining =
            10 -
            existingImages.filter((i) => !i.markedRemoved).length -
            newImages.length;
        if (files.length > remaining) {
            toast.error(`You can add at most ${remaining} more image(s).`);
            return;
        }
        const invalid = files.filter(
            (f) => !f.type.startsWith("image/") || f.size > 5 * 1024 * 1024,
        );
        if (invalid.length) {
            toast.error("Each image must be a valid image file under 5 MB.");
            return;
        }
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () =>
                setNewImages((prev) => [
                    ...prev,
                    { file, preview: reader.result, caption: "" },
                ]);
            reader.readAsDataURL(file);
        });
    };

    const removeExisting = (id) =>
        setExistingImages((prev) =>
            prev.map((img) =>
                img.id === id ? { ...img, markedRemoved: true } : img,
            ),
        );
    const updateExistingCaption = (id, caption) =>
        setExistingImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, caption } : img)),
        );
    const removeNew = (index) =>
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    const updateNewCaption = (index, caption) =>
        setNewImages((prev) =>
            prev.map((img, i) => (i === index ? { ...img, caption } : img)),
        );

    const visibleExisting = existingImages.filter((i) => !i.markedRemoved);
    const totalImages = visibleExisting.length + newImages.length;

    // ── Submit ────────────────────────────────────────────────────────────────
    const submit = (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.entries(REQUIRED).forEach(([name, message]) => {
            if (!data[name]?.toString().trim()) newErrors[name] = message;
        });
        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            toast.error("Please fix the errors in the form.");
            return;
        }
        setClientErrors({});

        const payload = new FormData();

        // Append all scalar fields
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                payload.append(key, "");
            } else if (typeof value === "boolean") {
                payload.append(key, value ? "1" : "0");
            } else {
                payload.append(key, value);
            }
        });

        // Serialize collocations as a JSON string
        payload.append("collocations", serializeCollocations(collocations));

        if (isEditing) {
            payload.append("_method", "patch");
            existingImages
                .filter((i) => i.markedRemoved)
                .forEach((i) => payload.append("remove_image_ids[]", i.id));
            existingImages
                .filter((i) => !i.markedRemoved)
                .forEach((i) =>
                    payload.append(`existing_captions[${i.id}]`, i.caption),
                );
        }

        newImages.forEach((img, index) => {
            payload.append(`images[${index}]`, img.file);
            payload.append(`new_captions[${index}]`, img.caption);
        });

        router.post(
            isEditing
                ? route("admin.word-lists.words.update", [wordList.id, word.id])
                : route("admin.word-lists.words.store", wordList.id),
            payload,
            {
                preserveState: true,
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    toast.success(
                        isEditing
                            ? "Word updated successfully!"
                            : "Word added successfully!",
                    );
                    onOpenChange(false);
                },
                onError: () =>
                    toast.error("Please fix the errors in the form."),
            },
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-2xl max-h-[90vh] flex flex-col"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Word" : "Add New Word"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={submit}
                    className="flex-1 overflow-y-auto space-y-5 pr-2"
                >
                    {/* Word * */}
                    <div className="space-y-2">
                        <Label>
                            Word <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.word}
                            onChange={(e) => field("word", e.target.value)}
                            placeholder="e.g., Accomplish"
                            className={inputCls("word")}
                        />
                        {errors.word && (
                            <p className="text-sm text-red-500">
                                {errors.word}
                            </p>
                        )}
                    </div>

                    {/* Pronunciation */}
                    <div className="space-y-2">
                        <Label>Pronunciation</Label>
                        <Input
                            value={data.pronunciation}
                            onChange={(e) =>
                                setData("pronunciation", e.target.value)
                            }
                            placeholder="e.g., /əˈkɒmplɪʃ/"
                        />
                    </div>

                    {/* IPA */}
                    <div className="space-y-2">
                        <Label>IPA</Label>
                        <Input
                            value={data.ipa}
                            onChange={(e) => setData("ipa", e.target.value)}
                            placeholder="e.g., əˈkɒmplɪʃ"
                        />
                    </div>

                    {/* Bangla Pronunciation */}
                    <div className="space-y-2">
                        <Label>Bangla Pronunciation</Label>
                        <Input
                            value={data.bangla_pronunciation}
                            onChange={(e) =>
                                setData("bangla_pronunciation", e.target.value)
                            }
                            placeholder="e.g., অ্যাকম্পলিশ"
                        />
                    </div>

                    {/* Hyphenation */}
                    <div className="space-y-2">
                        <Label>Hyphenation</Label>
                        <Input
                            value={data.hyphenation}
                            onChange={(e) =>
                                setData("hyphenation", e.target.value)
                            }
                            placeholder="e.g., ac·com·plish"
                        />
                    </div>

                    {/* Parts of Speech * */}
                    <div className="space-y-2">
                        <Label>
                            Parts of Speech Variations{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.parts_of_speech_variations}
                            onChange={(e) =>
                                field(
                                    "parts_of_speech_variations",
                                    e.target.value,
                                )
                            }
                            placeholder="e.g., verb, noun (accomplishment)"
                            className={inputCls("parts_of_speech_variations")}
                        />
                        {errors.parts_of_speech_variations && (
                            <p className="text-sm text-red-500">
                                {errors.parts_of_speech_variations}
                            </p>
                        )}
                    </div>

                    {/* Definition * */}
                    <div className="space-y-2">
                        <Label>
                            Definition <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={data.definition}
                            onChange={(e) =>
                                field("definition", e.target.value)
                            }
                            placeholder="Enter the definition"
                            rows={3}
                            className={inputCls("definition")}
                        />
                        {errors.definition && (
                            <p className="text-sm text-red-500">
                                {errors.definition}
                            </p>
                        )}
                    </div>

                    {/* Bangla Meaning * */}
                    <div className="space-y-2">
                        <Label>
                            Bangla Meaning{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.bangla_meaning}
                            onChange={(e) =>
                                field("bangla_meaning", e.target.value)
                            }
                            placeholder="বাংলা অর্থ"
                            className={inputCls("bangla_meaning")}
                        />
                        {errors.bangla_meaning && (
                            <p className="text-sm text-red-500">
                                {errors.bangla_meaning}
                            </p>
                        )}
                    </div>

                    {/* ── Collocations (structured) ─────────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">
                                Collocations
                                {collocations.filter(
                                    (c) =>
                                        c.phrase.trim() ||
                                        c.example_sentence.trim(),
                                ).length > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2 text-xs"
                                    >
                                        {
                                            collocations.filter(
                                                (c) =>
                                                    c.phrase.trim() ||
                                                    c.example_sentence.trim(),
                                            ).length
                                        }
                                    </Badge>
                                )}
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addCollocation}
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add Collocation
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {collocations.map((item, index) => (
                                <CollocationRow
                                    key={index}
                                    index={index}
                                    item={item}
                                    onChange={(key, value) =>
                                        updateCollocation(index, key, value)
                                    }
                                    onRemove={() => removeCollocation(index)}
                                    isOnly={collocations.length === 1}
                                />
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Each entry is saved as structured JSON. Leave all
                            fields empty to store no collocations.
                        </p>
                    </div>

                    {/* Example Sentences * */}
                    <div className="space-y-2">
                        <Label>
                            Example Sentences{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={data.example_sentences}
                            onChange={(e) =>
                                field("example_sentences", e.target.value)
                            }
                            placeholder="Enter example sentences (one per line)"
                            rows={3}
                            className={inputCls("example_sentences")}
                        />
                        {errors.example_sentences && (
                            <p className="text-sm text-red-500">
                                {errors.example_sentences}
                            </p>
                        )}
                    </div>

                    {/* AI Prompt */}
                    <div className="space-y-2">
                        <Label>AI Prompt</Label>
                        <Textarea
                            value={data.ai_prompt}
                            onChange={(e) =>
                                setData("ai_prompt", e.target.value)
                            }
                            placeholder="Custom prompt for AI image/content generation"
                            rows={3}
                        />
                    </div>

                    {/* Synonym */}
                    <div className="space-y-2">
                        <Label>Synonym</Label>
                        <Input
                            value={data.synonym}
                            onChange={(e) => setData("synonym", e.target.value)}
                            placeholder="e.g., achieve, complete, fulfill"
                        />
                    </div>

                    {/* Antonym */}
                    <div className="space-y-2">
                        <Label>Antonym</Label>
                        <Input
                            value={data.antonym}
                            onChange={(e) => setData("antonym", e.target.value)}
                            placeholder="e.g., fail, abandon"
                        />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center gap-3">
                        <Label className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            Visibility
                        </Label>
                        <Switch
                            checked={data.is_public}
                            onCheckedChange={(checked) =>
                                setData("is_public", checked)
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            {data.is_public
                                ? "Public (visible to all users)"
                                : "Private (hidden from users)"}
                        </span>
                    </div>

                    {/* Images */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">
                                Images
                                {totalImages > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {totalImages} / 10
                                    </Badge>
                                )}
                            </Label>
                            {totalImages < 10 && (
                                <label className="cursor-pointer">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <span>
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Add Image
                                        </span>
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="sr-only"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            )}
                        </div>

                        {totalImages === 0 ? (
                            <label className="block cursor-pointer">
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-muted-foreground/50">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                                    <p className="mt-2 text-sm font-medium text-primary hover:underline">
                                        Click to upload images
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG, GIF, WebP — up to 5 MB each,
                                        max 10 images
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="sr-only"
                                    onChange={handleFileSelect}
                                />
                            </label>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {visibleExisting.map((img) => (
                                    <ImageCard
                                        key={img.id}
                                        src={img.src}
                                        caption={img.caption}
                                        onCaptionChange={(v) =>
                                            updateExistingCaption(img.id, v)
                                        }
                                        onRemove={() => removeExisting(img.id)}
                                    />
                                ))}
                                {newImages.map((img, index) => (
                                    <ImageCard
                                        key={`new-${index}`}
                                        src={img.preview}
                                        caption={img.caption}
                                        onCaptionChange={(v) =>
                                            updateNewCaption(index, v)
                                        }
                                        onRemove={() => removeNew(index)}
                                        isNew
                                    />
                                ))}
                            </div>
                        )}

                        {errors["images"] && (
                            <p className="text-sm text-red-500">
                                {errors["images"]}
                            </p>
                        )}
                        {errors["images.0"] && (
                            <p className="text-sm text-red-500">
                                {errors["images.0"]}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? "Saving…"
                                : isEditing
                                  ? "Update Word"
                                  : "Add Word"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
