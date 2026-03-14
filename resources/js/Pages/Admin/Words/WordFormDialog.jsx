import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
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
import { X, Image as ImageIcon } from "lucide-react";

// Fields that are NOT NULL in the DB
const REQUIRED = {
    word:                       "Word is required.",
    parts_of_speech_variations: "Parts of Speech Variations is required.",
    definition:                 "Definition is required.",
    bangla_meaning:             "Bangla Meaning is required.",
    example_sentences:          "Example Sentences is required.",
};

export default function WordFormDialog({
    exerciseGroup,
    subcategories = [],
    word = null,
    open,
    onOpenChange,
}) {
    const isEditing = !!word;

    const [imagePreview, setImagePreview] = useState(word?.image_url_full || null);
    // console.log(word.image_url_full);
    const [clientErrors, setClientErrors] = useState({});

    const { data, setData, processing, errors: serverErrors, reset } = useForm({
        subcategory_id:             word?.subcategory_id ? String(word.subcategory_id) : "",
        word:                       word?.word || "",
        pronunciation:              word?.pronunciation || "",
        hyphenation:                word?.hyphenation || "",
        parts_of_speech_variations: word?.parts_of_speech_variations || "",
        definition:                 word?.definition || "",
        bangla_meaning:             word?.bangla_meaning || "",
        collocations:               word?.collocations || "",
        example_sentences:          word?.example_sentences || "",
        ai_prompt:                  word?.ai_prompt || "",
        synonym:                    word?.synonym || "",
        antonym:                    word?.antonym || "",
        image_url:                  null,
        remove_image:               false,
        image_related_sentence:     word?.image_related_sentence || "",
    });

    // Merge: server errors take priority (they're more specific), client errors fill the rest
    const errors = { ...clientErrors, ...serverErrors };

    useEffect(() => {
        if (open && word?.image_url_full) {
            setImagePreview(word.image_url_full);
        } else if (!open) {
            reset();
            setImagePreview(null);
            setClientErrors({});
        }
    }, [open]);

    // Clear the client error for a field as soon as the user edits it
    const field = (name, value) => {
        setData(name, value);
        if (clientErrors[name]) {
            setClientErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/"))
            return toast.error("Please select a valid image file");
        if (file.size > 5 * 1024 * 1024)
            return toast.error("Image size must be less than 5MB");

        setData((prev) => ({ ...prev, image_url: file, remove_image: false }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData((prev) => ({ ...prev, image_url: null, remove_image: true }));
        setImagePreview(null);
    };

    const submit = (e) => {
        e.preventDefault();

        // ── Client-side required check ──────────────────────────────────
        const newErrors = {};
        Object.entries(REQUIRED).forEach(([name, message]) => {
            if (!data[name]?.toString().trim()) {
                newErrors[name] = message;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            toast.error("Please fix the errors in the form.");
            return;
        }

        setClientErrors({});

        // ── Build FormData and post ─────────────────────────────────────
        const payload = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) payload.append(key, "");
            else if (typeof value === "boolean")
                payload.append(key, value ? "1" : "0");
            else payload.append(key, value);
        });

        if (isEditing) payload.append("_method", "patch");

        router.post(
            isEditing
                ? route("admin.exercise-groups.words.update", [exerciseGroup.id, word.id])
                : route("admin.exercise-groups.words.store", exerciseGroup.id),
            payload,
            {
                preserveState: true,
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    toast.success(
                        isEditing ? "Word updated successfully!" : "Word added successfully!",
                    );
                    onOpenChange(false);
                },
                onError: () => {
                    toast.error("Please fix the errors in the form.");
                },
            },
        );
    };

    // Helper: red border class when a field has an error
    const inputCls = (name) =>
        errors[name] ? "border-red-500 focus-visible:ring-red-500" : "";

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

                <form onSubmit={submit} className="flex-1 overflow-y-auto space-y-5 pr-2">
                    <input type="hidden" name="remove_image" value={data.remove_image ? 1 : 0} />

                    {/* Subcategory */}
                    <div className="space-y-2">
                        <Label>Subcategory</Label>
                        <Select
                            value={data.subcategory_id}
                            onValueChange={(v) =>
                                setData("subcategory_id", v === "none" ? "" : v)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a subcategory (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    <span className="text-muted-foreground">— None —</span>
                                </SelectItem>
                                {subcategories.map((sub) => (
                                    <SelectItem key={sub.id} value={String(sub.id)}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.subcategory_id && (
                            <p className="text-sm text-red-500">{errors.subcategory_id}</p>
                        )}
                    </div>

                    {/* Word * */}
                    <div className="space-y-2">
                        <Label>Word <span className="text-red-500">*</span></Label>
                        <Input
                            name="word"
                            value={data.word}
                            onChange={(e) => field("word", e.target.value)}
                            placeholder="e.g., Accomplish"
                            className={inputCls("word")}
                        />
                        {errors.word && <p className="text-sm text-red-500">{errors.word}</p>}
                    </div>

                    {/* Pronunciation */}
                    <div className="space-y-2">
                        <Label>Pronunciation</Label>
                        <Input
                            name="pronunciation"
                            value={data.pronunciation}
                            onChange={(e) => setData("pronunciation", e.target.value)}
                            placeholder="e.g., /əˈkɒmplɪʃ/"
                        />
                        {errors.pronunciation && <p className="text-sm text-red-500">{errors.pronunciation}</p>}
                    </div>

                    {/* Hyphenation */}
                    <div className="space-y-2">
                        <Label>Hyphenation</Label>
                        <Input
                            name="hyphenation"
                            value={data.hyphenation}
                            onChange={(e) => setData("hyphenation", e.target.value)}
                            placeholder="e.g., ac·com·plish"
                        />
                        {errors.hyphenation && <p className="text-sm text-red-500">{errors.hyphenation}</p>}
                    </div>

                    {/* Parts of Speech * */}
                    <div className="space-y-2">
                        <Label>Parts of Speech Variations <span className="text-red-500">*</span></Label>
                        <Input
                            name="parts_of_speech_variations"
                            value={data.parts_of_speech_variations}
                            onChange={(e) => field("parts_of_speech_variations", e.target.value)}
                            placeholder="e.g., verb, noun (accomplishment)"
                            className={inputCls("parts_of_speech_variations")}
                        />
                        {errors.parts_of_speech_variations && (
                            <p className="text-sm text-red-500">{errors.parts_of_speech_variations}</p>
                        )}
                    </div>

                    {/* Definition * */}
                    <div className="space-y-2">
                        <Label>Definition <span className="text-red-500">*</span></Label>
                        <Textarea
                            name="definition"
                            value={data.definition}
                            onChange={(e) => field("definition", e.target.value)}
                            placeholder="Enter the definition"
                            rows={3}
                            className={inputCls("definition")}
                        />
                        {errors.definition && <p className="text-sm text-red-500">{errors.definition}</p>}
                    </div>

                    {/* Bangla Meaning * */}
                    <div className="space-y-2">
                        <Label>Bangla Meaning <span className="text-red-500">*</span></Label>
                        <Input
                            name="bangla_meaning"
                            value={data.bangla_meaning}
                            onChange={(e) => field("bangla_meaning", e.target.value)}
                            placeholder="বাংলা অর্থ"
                            className={inputCls("bangla_meaning")}
                        />
                        {errors.bangla_meaning && <p className="text-sm text-red-500">{errors.bangla_meaning}</p>}
                    </div>

                    {/* Collocations */}
                    <div className="space-y-2">
                        <Label>Collocations</Label>
                        <Textarea
                            name="collocations"
                            value={data.collocations}
                            onChange={(e) => setData("collocations", e.target.value)}
                            placeholder="e.g., accomplish a goal, accomplish a task"
                            rows={2}
                        />
                        {errors.collocations && <p className="text-sm text-red-500">{errors.collocations}</p>}
                    </div>

                    {/* Example Sentences * */}
                    <div className="space-y-2">
                        <Label>Example Sentences <span className="text-red-500">*</span></Label>
                        <Textarea
                            name="example_sentences"
                            value={data.example_sentences}
                            onChange={(e) => field("example_sentences", e.target.value)}
                            placeholder="Enter example sentences (one per line)"
                            rows={3}
                            className={inputCls("example_sentences")}
                        />
                        {errors.example_sentences && (
                            <p className="text-sm text-red-500">{errors.example_sentences}</p>
                        )}
                    </div>

                    {/* AI Prompt */}
                    <div className="space-y-2">
                        <Label>AI Prompt</Label>
                        <Textarea
                            name="ai_prompt"
                            value={data.ai_prompt}
                            onChange={(e) => setData("ai_prompt", e.target.value)}
                            placeholder="Custom prompt for AI image/content generation"
                            rows={3}
                        />
                        {errors.ai_prompt && <p className="text-sm text-red-500">{errors.ai_prompt}</p>}
                    </div>

                    {/* Synonym */}
                    <div className="space-y-2">
                        <Label>Synonym</Label>
                        <Input
                            name="synonym"
                            value={data.synonym}
                            onChange={(e) => setData("synonym", e.target.value)}
                            placeholder="e.g., achieve, complete, fulfill"
                        />
                        {errors.synonym && <p className="text-sm text-red-500">{errors.synonym}</p>}
                    </div>

                    {/* Antonym */}
                    <div className="space-y-2">
                        <Label>Antonym</Label>
                        <Input
                            name="antonym"
                            value={data.antonym}
                            onChange={(e) => setData("antonym", e.target.value)}
                            placeholder="e.g., fail, abandon"
                        />
                        {errors.antonym && <p className="text-sm text-red-500">{errors.antonym}</p>}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Image</Label>
                        <div className="space-y-3">
                            {imagePreview ? (
                                <div className="relative w-full">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-48 w-full rounded-lg border object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute right-2 top-2"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-muted-foreground/50">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
                                        <div className="mt-2">
                                            <Label htmlFor="image-upload" className="cursor-pointer">
                                                <span className="text-sm font-medium text-primary hover:underline">
                                                    Upload an image
                                                </span>
                                                <Input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={handleImageChange}
                                                />
                                            </Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
                    </div>

                    {/* Image Related Sentence */}
                    <div className="space-y-2">
                        <Label>Image Related Sentence</Label>
                        <Textarea
                            name="image_related_sentence"
                            value={data.image_related_sentence}
                            onChange={(e) => setData("image_related_sentence", e.target.value)}
                            placeholder="A sentence that describes or relates to the image"
                            rows={2}
                        />
                        {errors.image_related_sentence && (
                            <p className="text-sm text-red-500">{errors.image_related_sentence}</p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : isEditing ? "Update Word" : "Add Word"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}