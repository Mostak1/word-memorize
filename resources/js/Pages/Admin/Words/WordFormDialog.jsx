import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function WordFormDialog({
    exerciseGroup,
    word = null,
    open,
    onOpenChange,
}) {
    const isEditing = !!word;
    const [imagePreview, setImagePreview] = useState(
        word?.image_url_full || null,
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        word: word?.word || "",
        hyphenation: word?.hyphenation || "",
        parts_of_speech_variations: word?.parts_of_speech_variations || "",
        definition: word?.definition || "",
        bangla_translation: word?.bangla_translation || "",
        collocations: word?.collocations || "",
        example_sentences: word?.example_sentences || "",
        synonym: word?.synonym || "",
        antonym: word?.antonym || "",
        image_url: null,
        remove_image: false,
        image_related_sentence: word?.image_related_sentence || "",
    });

    useEffect(() => {
        if (open && word?.image_url_full) {
            setImagePreview(word.image_url_full);
        } else if (!open) {
            reset();
            setImagePreview(null);
        }
    }, [open]);

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

        // Build FormData automatically for files + _method spoofing
        const payload = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) payload.append(key, "");
            else if (typeof value === "boolean")
                payload.append(key, value ? "1" : "0");
            else payload.append(key, value);
        });

        // console.log("Payload entries:");
        // for (let [key, value] of payload.entries()) {
        //     if (value instanceof File) {
        //         console.log(key, value.name);
        //     } else {
        //         console.log(key, value);
        //     }
        // }

        if (isEditing) payload.append("_method", "patch");

        router.post(
            isEditing
                ? route("admin.exercise-groups.words.update", [
                      exerciseGroup.id,
                      word.id,
                  ])
                : route("admin.exercise-groups.words.store", exerciseGroup.id),
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
                onError: (errors) => {
                    console.log("Validation errors:", errors);
                    toast.error("Please fix the errors in the form.");
                },
            },
        );
    };

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
                    <input
                        type="hidden"
                        name="remove_image"
                        value={data.remove_image ? 1 : 0}
                    />
                    {/* Word */}
                    <div className="space-y-2">
                        <Label>
                            Word <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="word"
                            value={data.word}
                            onChange={(e) => setData("word", e.target.value)}
                            placeholder="e.g., Accomplish"
                        />
                        {errors.word && (
                            <p className="text-sm text-red-600">
                                {errors.word}
                            </p>
                        )}
                    </div>

                    {/* Hyphenation */}
                    <div className="space-y-2">
                        <Label>Hyphenation</Label>
                        <Input
                            name="hyphenation"
                            value={data.hyphenation}
                            onChange={(e) =>
                                setData("hyphenation", e.target.value)
                            }
                            placeholder="e.g., ac-com-plish"
                        />
                        {errors.hyphenation && (
                            <p className="text-sm text-red-600">
                                {errors.hyphenation}
                            </p>
                        )}
                    </div>

                    {/* Parts of Speech Variations */}
                    <div className="space-y-2">
                        <Label>
                            Parts of Speech Variations{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            name="parts_of_speech_variations"
                            value={data.parts_of_speech_variations}
                            onChange={(e) =>
                                setData(
                                    "parts_of_speech_variations",
                                    e.target.value,
                                )
                            }
                            placeholder="e.g., noun: accomplishment, adjective: accomplished"
                            rows={3}
                        />
                        {errors.parts_of_speech_variations && (
                            <p className="text-sm text-red-600">
                                {errors.parts_of_speech_variations}
                            </p>
                        )}
                    </div>

                    {/* Definition */}
                    <div className="space-y-2">
                        <Label>
                            Definition <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            name="definition"
                            value={data.definition}
                            onChange={(e) =>
                                setData("definition", e.target.value)
                            }
                            placeholder="Enter the definition"
                            rows={3}
                        />
                        {errors.definition && (
                            <p className="text-sm text-red-600">
                                {errors.definition}
                            </p>
                        )}
                    </div>

                    {/* Bangla Translation */}
                    <div className="space-y-2">
                        <Label>
                            Bangla Translation{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            name="bangla_translation"
                            value={data.bangla_translation}
                            onChange={(e) =>
                                setData("bangla_translation", e.target.value)
                            }
                            placeholder="বাংলা অনুবাদ লিখুন"
                            rows={2}
                        />
                        {errors.bangla_translation && (
                            <p className="text-sm text-red-600">
                                {errors.bangla_translation}
                            </p>
                        )}
                    </div>

                    {/* Collocations */}
                    <div className="space-y-2">
                        <Label>Collocations</Label>
                        <Textarea
                            name="collocations"
                            value={data.collocations}
                            onChange={(e) =>
                                setData("collocations", e.target.value)
                            }
                            placeholder="e.g., accomplish a goal, accomplish a task"
                            rows={2}
                        />
                        {errors.collocations && (
                            <p className="text-sm text-red-600">
                                {errors.collocations}
                            </p>
                        )}
                    </div>

                    {/* Example Sentences */}
                    <div className="space-y-2">
                        <Label>Example Sentences</Label>
                        <Textarea
                            name="example_sentences"
                            value={data.example_sentences}
                            onChange={(e) =>
                                setData("example_sentences", e.target.value)
                            }
                            placeholder="Enter example sentences (one per line)"
                            rows={3}
                        />
                        {errors.example_sentences && (
                            <p className="text-sm text-red-600">
                                {errors.example_sentences}
                            </p>
                        )}
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
                        {errors.synonym && (
                            <p className="text-sm text-red-600">
                                {errors.synonym}
                            </p>
                        )}
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
                        {errors.antonym && (
                            <p className="text-sm text-red-600">
                                {errors.antonym}
                            </p>
                        )}
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
                                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-2">
                                            <Label
                                                htmlFor="image-upload"
                                                className="cursor-pointer"
                                            >
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
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.image_url && (
                            <p className="text-sm text-red-600">
                                {errors.image_url}
                            </p>
                        )}
                    </div>

                    {/* Image Related Sentence */}
                    <div className="space-y-2">
                        <Label>Image Related Sentence</Label>
                        <Textarea
                            name="image_related_sentence"
                            value={data.image_related_sentence}
                            onChange={(e) =>
                                setData(
                                    "image_related_sentence",
                                    e.target.value,
                                )
                            }
                            placeholder="A sentence that describes or relates to the image"
                            rows={2}
                        />
                        {errors.image_related_sentence && (
                            <p className="text-sm text-red-600">
                                {errors.image_related_sentence}
                            </p>
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
                            {processing
                                ? "Saving..."
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
