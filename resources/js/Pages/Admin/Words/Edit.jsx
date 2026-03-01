import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function Edit({ exerciseGroup, word }) {
    const { data, setData, patch, processing, errors } = useForm({
        word: word.word || "",
        hyphenation: word.hyphenation || "",
        parts_of_speech_variations: word.parts_of_speech_variations || "",
        definition: word.definition || "",
        bangla_meaning: word.bangla_meaning || "",
        collocations: word.collocations || "",
        example_sentences: word.example_sentences || "",
        synonym: word.synonym || "",
        antonym: word.antonym || "",
        image_prompt: word.image_prompt || "",
        image_related_sentence: word.image_related_sentence || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(
            route("admin.exercise-groups.words.update", [
                exerciseGroup.id,
                word.id,
            ]),
        );
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${word.word}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            href={route(
                                "admin.exercise-groups.show",
                                exerciseGroup.id,
                            )}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to {exerciseGroup.title}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Word
                        </h1>
                        <p className="text-muted-foreground">
                            Update word in {exerciseGroup.title}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="word">
                                        Word{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="word"
                                        value={data.word}
                                        onChange={(e) =>
                                            setData("word", e.target.value)
                                        }
                                        placeholder="e.g., run"
                                    />
                                    {errors.word && (
                                        <p className="text-sm text-red-600">
                                            {errors.word}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hyphenation">
                                        Hyphenation
                                    </Label>
                                    <Input
                                        id="hyphenation"
                                        value={data.hyphenation}
                                        onChange={(e) =>
                                            setData(
                                                "hyphenation",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., run"
                                    />
                                    {errors.hyphenation && (
                                        <p className="text-sm text-red-600">
                                            {errors.hyphenation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parts_of_speech_variations">
                                    Parts of Speech Variations
                                </Label>
                                <Input
                                    id="parts_of_speech_variations"
                                    value={data.parts_of_speech_variations}
                                    onChange={(e) =>
                                        setData(
                                            "parts_of_speech_variations",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., verb, noun"
                                />
                                {errors.parts_of_speech_variations && (
                                    <p className="text-sm text-red-600">
                                        {errors.parts_of_speech_variations}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Definitions & Translations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Definitions & Translations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="definition">
                                    Definition{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="definition"
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

                            <div className="space-y-2">
                                <Label htmlFor="bangla_meaning">
                                    Bangla Translation{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="bangla_meaning"
                                    value={data.bangla_meaning}
                                    onChange={(e) =>
                                        setData(
                                            "bangla_meaning",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="বাংলা অনুবাদ"
                                    rows={3}
                                />
                                {errors.bangla_meaning && (
                                    <p className="text-sm text-red-600">
                                        {errors.bangla_meaning}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage & Examples */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage & Examples</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="collocations">
                                    Collocations
                                </Label>
                                <Textarea
                                    id="collocations"
                                    value={data.collocations}
                                    onChange={(e) =>
                                        setData("collocations", e.target.value)
                                    }
                                    placeholder="e.g., run fast, run a business"
                                    rows={2}
                                />
                                {errors.collocations && (
                                    <p className="text-sm text-red-600">
                                        {errors.collocations}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="example_sentences">
                                    Example Sentences
                                </Label>
                                <Textarea
                                    id="example_sentences"
                                    value={data.example_sentences}
                                    onChange={(e) =>
                                        setData(
                                            "example_sentences",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter example sentences"
                                    rows={3}
                                />
                                {errors.example_sentences && (
                                    <p className="text-sm text-red-600">
                                        {errors.example_sentences}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Synonyms & Antonyms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Synonyms & Antonyms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="synonym">Synonyms</Label>
                                    <Textarea
                                        id="synonym"
                                        value={data.synonym}
                                        onChange={(e) =>
                                            setData("synonym", e.target.value)
                                        }
                                        placeholder="e.g., sprint, jog, dash"
                                        rows={2}
                                    />
                                    {errors.synonym && (
                                        <p className="text-sm text-red-600">
                                            {errors.synonym}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="antonym">Antonyms</Label>
                                    <Textarea
                                        id="antonym"
                                        value={data.antonym}
                                        onChange={(e) =>
                                            setData("antonym", e.target.value)
                                        }
                                        placeholder="e.g., walk, stop"
                                        rows={2}
                                    />
                                    {errors.antonym && (
                                        <p className="text-sm text-red-600">
                                            {errors.antonym}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Image Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image_prompt">
                                    Image Prompt
                                </Label>
                                <Textarea
                                    id="image_prompt"
                                    value={data.image_prompt}
                                    onChange={(e) =>
                                        setData("image_prompt", e.target.value)
                                    }
                                    placeholder="Describe the image for AI generation"
                                    rows={2}
                                />
                                {errors.image_prompt && (
                                    <p className="text-sm text-red-600">
                                        {errors.image_prompt}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image_related_sentence">
                                    Image Related Sentence
                                </Label>
                                <Textarea
                                    id="image_related_sentence"
                                    value={data.image_related_sentence}
                                    onChange={(e) =>
                                        setData(
                                            "image_related_sentence",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="A sentence describing the image"
                                    rows={2}
                                />
                                {errors.image_related_sentence && (
                                    <p className="text-sm text-red-600">
                                        {errors.image_related_sentence}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            Update Word
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link
                                href={route(
                                    "admin.exercise-groups.show",
                                    exerciseGroup.id,
                                )}
                            >
                                Cancel
                            </Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
