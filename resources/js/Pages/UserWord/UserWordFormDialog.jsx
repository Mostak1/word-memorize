import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Separator } from "@/Components/ui/separator";
import {
    BookOpen,
    ChevronLeft,
    Globe,
    Lock,
    Plus,
    Loader2,
} from "lucide-react";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function Field({ label, optional = true, error, children }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {label}
                {optional && (
                    <span className="ml-1 normal-case font-normal text-gray-400 tracking-normal">
                        (optional)
                    </span>
                )}
            </Label>
            {children}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

const EMPTY_FORM = {
    wordlist_id: "",
    new_wordlist_title: "",
    word: "",
    pronunciation: "",
    ipa: "",
    bangla_pronunciation: "",
    // hyphenation: "",
    parts_of_speech_variations: "",
    definition: "",
    bangla_meaning: "",
    collocations: "",
    example_sentences: "",
    synonym: "",
    antonym: "",
    // is_public: false,
};

// ── Main component ────────────────────────────────────────────────────────────

export default function UserWordFormDialog({
    open,
    onOpenChange,
    word = null, // null → create mode, object → edit mode
    wordLists = [],
    category = null,
}) {
    const isEditing = !!word;
    const [showNewList, setShowNewList] = useState(false);
    const [tab, setTab] = useState("basic");

    const { data, setData, post, put, processing, errors, clearErrors, reset } =
        useForm({ ...EMPTY_FORM });

    // Re-populate form whenever the dialog opens or the target word changes
    useEffect(() => {
        if (open) {
            clearErrors();
            if (word) {
                setData({
                    wordlist_id: word.wordlist_id
                        ? String(word.wordlist_id)
                        : "",
                    new_wordlist_title: "",
                    word: word.word ?? "",
                    pronunciation: word.pronunciation ?? "",
                    ipa: word.ipa ?? "",
                    bangla_pronunciation: word.bangla_pronunciation ?? "",
                    // hyphenation: word.hyphenation ?? "",
                    parts_of_speech_variations:
                        word.parts_of_speech_variations ?? "",
                    definition: word.definition ?? "",
                    bangla_meaning: word.bangla_meaning ?? "",
                    collocations: word.collocations ?? "",
                    example_sentences: word.example_sentences ?? "",
                    synonym: word.synonym ?? "",
                    antonym: word.antonym ?? "",
                    // is_public: word.is_public ?? false,
                });
                setShowNewList(false);
            } else {
                reset();
                setShowNewList(wordLists.length === 0);
            }
            setTab("basic");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, word]);

    function handleSubmit(e) {
        e?.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };
        if (isEditing) {
            put(route("my.words.update", word.id), opts);
        } else {
            post(route("my.words.store"), opts);
        }
    }

    // Count errors per tab for the indicator dots
    const basicFields = [
        "wordlist_id",
        "new_wordlist_title",
        "word",
        "pronunciation",
        "ipa",
        "bangla_pronunciation",
        // "hyphenation",
        "parts_of_speech_variations",
    ];
    const meaningFields = ["definition", "bangla_meaning"];
    const usageFields = ["example_sentences", "collocations"];
    const synonymFields = ["synonym", "antonym"];

    const errCount = (fields) => fields.filter((f) => errors[f]).length;

    function TabLabel({ label, fields }) {
        const count = errCount(fields);
        return (
            <span className="flex items-center gap-1.5">
                {label}
                {count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                )}
            </span>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    w-[calc(100vw-1.5rem)] max-w-lg rounded-2xl p-0 gap-0
                    sm:w-full overflow-hidden flex flex-col
                    max-h-[90dvh]
                "
            >
                {/* ── Header ── */}
                <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
                    <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#E5201C]/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-3.5 w-3.5 text-[#E5201C]" />
                        </span>
                        {isEditing ? "Edit Word" : "Add New Word"}
                    </DialogTitle>
                    {category && (
                        <DialogDescription className="text-xs text-gray-400 pl-9">
                            Saving to{" "}
                            <span className="font-medium text-gray-600">
                                {category.name}
                            </span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <Separator />

                {/* ── Tabs ── */}
                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="flex flex-col flex-1 min-h-0"
                >
                    {/* Tab bar */}
                    <TabsList className="mx-5 mt-3 mb-1 h-9 rounded-xl bg-gray-100 shrink-0 grid grid-cols-4 p-1">
                        {[
                            {
                                value: "basic",
                                label: "Basic",
                                fields: basicFields,
                            },
                            {
                                value: "meanings",
                                label: "Meanings",
                                fields: meaningFields,
                            },
                            {
                                value: "usage",
                                label: "Usage",
                                fields: usageFields,
                            },
                            {
                                value: "synonyms",
                                label: "Syn/Ant",
                                fields: synonymFields,
                            },
                        ].map(({ value, label, fields }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className="rounded-lg text-[11px] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <TabLabel label={label} fields={fields} />
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ── Scrollable body ── */}
                    <div className="flex-1 overflow-y-auto px-5 pb-2">
                        {/* ─── BASIC TAB ─── */}
                        <TabsContent
                            value="basic"
                            className="mt-3 space-y-4 outline-none"
                        >
                            {/* Word list selector */}
                            <div className="bg-gray-50 rounded-xl p-3.5 space-y-3">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                    Word List
                                </p>

                                {!showNewList ? (
                                    <>
                                        <Field
                                            label="Choose a list"
                                            optional={false}
                                            error={errors.wordlist_id}
                                        >
                                            <Select
                                                value={data.wordlist_id}
                                                onValueChange={(v) => {
                                                    setData("wordlist_id", v);
                                                    clearErrors("wordlist_id");
                                                }}
                                            >
                                                <SelectTrigger className="rounded-lg border-gray-200 bg-white h-9 text-sm">
                                                    <SelectValue placeholder="Select a list…" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {wordLists.map((l) => (
                                                        <SelectItem
                                                            key={l.id}
                                                            value={String(l.id)}
                                                        >
                                                            {l.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewList(true);
                                                setData("wordlist_id", "");
                                                clearErrors("wordlist_id");
                                            }}
                                            className="flex items-center gap-1 text-[#E5201C] text-xs font-semibold hover:underline"
                                        >
                                            <Plus className="h-3 w-3" /> Create
                                            new list
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Field
                                            label="New list name"
                                            optional={false}
                                            error={errors.new_wordlist_title}
                                        >
                                            <Input
                                                autoFocus
                                                value={data.new_wordlist_title}
                                                onChange={(e) =>
                                                    setData(
                                                        "new_wordlist_title",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. GRE Vocab, Daily Words…"
                                                className="rounded-lg border-gray-200 bg-white h-9 text-sm"
                                            />
                                        </Field>
                                        {wordLists.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewList(false);
                                                    setData(
                                                        "new_wordlist_title",
                                                        "",
                                                    );
                                                }}
                                                className="flex items-center gap-1 text-gray-400 text-xs font-medium hover:underline"
                                            >
                                                <ChevronLeft className="h-3 w-3" />
                                                Pick existing list
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Core fields */}
                            <Field
                                label="Word"
                                optional={false}
                                error={errors.word}
                            >
                                <Input
                                    value={data.word}
                                    onChange={(e) =>
                                        setData("word", e.target.value)
                                    }
                                    placeholder="e.g. ephemeral"
                                    className="rounded-lg border-gray-200 h-10 font-semibold text-[15px]"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field
                                    label="Part of speech"
                                    error={errors.parts_of_speech_variations}
                                >
                                    <Input
                                        value={data.parts_of_speech_variations}
                                        onChange={(e) =>
                                            setData(
                                                "parts_of_speech_variations",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="adjective, noun…"
                                        className="rounded-lg border-gray-200 h-9 text-sm"
                                    />
                                </Field>
                                <Field
                                    label="Pronunciation"
                                    error={errors.pronunciation}
                                >
                                    <Input
                                        value={data.pronunciation}
                                        onChange={(e) =>
                                            setData(
                                                "pronunciation",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e-FEM-er-ul"
                                        className="rounded-lg border-gray-200 h-9 text-sm"
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="IPA" error={errors.ipa}>
                                    <Input
                                        value={data.ipa}
                                        onChange={(e) =>
                                            setData("ipa", e.target.value)
                                        }
                                        placeholder="/ɪˈfem.ər.əl/"
                                        className="rounded-lg border-gray-200 h-9 font-mono text-sm"
                                    />
                                </Field>
                                {/* <Field
                                    label="Hyphenation"
                                    error={errors.hyphenation}
                                >
                                    <Input
                                        value={data.hyphenation}
                                        onChange={(e) =>
                                            setData(
                                                "hyphenation",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e·phem·er·al"
                                        className="rounded-lg border-gray-200 h-9 text-sm"
                                    />
                                </Field> */}
                            </div>

                            <Field
                                label="Bangla Pronunciation"
                                error={errors.bangla_pronunciation}
                            >
                                <Input
                                    value={data.bangla_pronunciation}
                                    onChange={(e) =>
                                        setData(
                                            "bangla_pronunciation",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="ইফেমেরাল…"
                                    className="rounded-lg border-gray-200 h-9 text-sm"
                                    dir="auto"
                                />
                            </Field>

                            {/* Visibility toggle */}
                            {/* <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    {data.is_public ? (
                                        <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                                    ) : (
                                        <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {data.is_public
                                                ? "Public"
                                                : "Private"}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {data.is_public
                                                ? "All users can see this word"
                                                : "Only visible to you"}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={data.is_public}
                                    onCheckedChange={(v) =>
                                        setData("is_public", v)
                                    }
                                    className="data-[state=checked]:bg-blue-500"
                                />
                            </div> */}
                        </TabsContent>

                        {/* ─── MEANINGS TAB ─── */}
                        <TabsContent
                            value="meanings"
                            className="mt-3 space-y-4 outline-none"
                        >
                            <Field
                                label="English Definition"
                                error={errors.definition}
                            >
                                <Textarea
                                    value={data.definition}
                                    onChange={(e) =>
                                        setData("definition", e.target.value)
                                    }
                                    placeholder="Lasting for only a short time; transitory…"
                                    className="rounded-lg border-gray-200 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>
                            <Field
                                label="Bangla Meaning"
                                error={errors.bangla_meaning}
                            >
                                <Textarea
                                    value={data.bangla_meaning}
                                    onChange={(e) =>
                                        setData(
                                            "bangla_meaning",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="বাংলা অর্থ লিখুন…"
                                    className="rounded-lg border-gray-200 resize-none text-sm"
                                    rows={4}
                                    dir="auto"
                                />
                            </Field>
                        </TabsContent>

                        {/* ─── USAGE TAB ─── */}
                        <TabsContent
                            value="usage"
                            className="mt-3 space-y-4 outline-none"
                        >
                            <Field
                                label="Example Sentences"
                                error={errors.example_sentences}
                            >
                                <Textarea
                                    value={data.example_sentences}
                                    onChange={(e) =>
                                        setData(
                                            "example_sentences",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="The ephemeral beauty of cherry blossoms makes them precious."
                                    className="rounded-lg border-gray-200 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>
                            <Field
                                label="Collocations"
                                error={errors.collocations}
                            >
                                <Textarea
                                    value={data.collocations}
                                    onChange={(e) =>
                                        setData("collocations", e.target.value)
                                    }
                                    placeholder="ephemeral beauty, ephemeral pleasure…"
                                    className="rounded-lg border-gray-200 resize-none text-sm"
                                    rows={4}
                                />
                            </Field>
                        </TabsContent>

                        {/* ─── SYNONYMS TAB ─── */}
                        <TabsContent
                            value="synonyms"
                            className="mt-3 space-y-4 outline-none"
                        >
                            <Field label="Synonyms" error={errors.synonym}>
                                <Textarea
                                    value={data.synonym}
                                    onChange={(e) =>
                                        setData("synonym", e.target.value)
                                    }
                                    placeholder="transient, fleeting, momentary, short-lived…"
                                    className="rounded-lg border-gray-200 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>
                            <Field label="Antonyms" error={errors.antonym}>
                                <Textarea
                                    value={data.antonym}
                                    onChange={(e) =>
                                        setData("antonym", e.target.value)
                                    }
                                    placeholder="permanent, eternal, lasting, enduring…"
                                    className="rounded-lg border-gray-200 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>
                        </TabsContent>
                    </div>
                </Tabs>

                <Separator />

                {/* ── Footer ── */}
                <DialogFooter className="px-5 py-3.5 shrink-0 flex flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                        className="flex-1 rounded-xl h-10 text-sm font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex-1 bg-[#E5201C] hover:bg-red-700 text-white rounded-xl h-10 text-sm font-semibold gap-2"
                    >
                        {processing && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {processing
                            ? isEditing
                                ? "Updating…"
                                : "Saving…"
                            : isEditing
                              ? "Update Word"
                              : "Add Word"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
