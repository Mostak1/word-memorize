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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Separator } from "@/Components/ui/separator";
import { BookOpen, ChevronLeft, Plus, Loader2, X } from "lucide-react";
import { useTranslation } from "@/Contexts/LanguageContext";

// ── Collocation helpers ───────────────────────────────────────────────────────

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

/** Serialize the collocations array to a JSON string for the payload. */
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

// ── Sub-component: single collocation row ─────────────────────────────────────

function CollocationRow({ index, item, onChange, onRemove, isOnly }) {
    const { t } = useTranslation();

    return (
        <div className="relative rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 p-3 space-y-2.5">
            {/* Row header */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    #{index + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={isOnly}
                    className="h-5 w-5 rounded flex items-center justify-center text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title={t("user_words.form.buttons.remove") || "Remove"}
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Phrase */}
            <div className="space-y-1">
                <Label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                    {t("user_words.form.labels.phrase")}
                </Label>
                <Input
                    value={item.phrase}
                    onChange={(e) => onChange("phrase", e.target.value)}
                    placeholder={t("user_words.form.placeholders.phrase")}
                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 h-8 text-sm"
                />
            </div>

            {/* Example sentence */}
            <div className="space-y-1">
                <Label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                    {t("user_words.form.labels.example_sentence")}
                </Label>
                <Input
                    value={item.example_sentence}
                    onChange={(e) =>
                        onChange("example_sentence", e.target.value)
                    }
                    placeholder={t(
                        "user_words.form.placeholders.example_sentence",
                    )}
                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 h-8 text-sm"
                />
            </div>
        </div>
    );
}

// ── Tiny field wrapper ────────────────────────────────────────────────────────

function Field({ label, optional = true, error, children }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-1.5 [&_input::placeholder]:text-gray-300 dark:[&_input::placeholder]:text-slate-500 [&_textarea::placeholder]:text-gray-300 dark:[&_textarea::placeholder]:text-slate-500">
            <Label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                {label}
                {!optional && (
                    <span className="ml-0.5 text-red-400 font-bold">*</span>
                )}
                {optional && (
                    <span className="ml-1 normal-case font-normal text-gray-400 dark:text-slate-500 tracking-normal">
                        ({t("common.optional")})
                    </span>
                )}
            </Label>
            {children}
            {error && (
                <p className="text-[11px] text-red-500 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Form defaults ─────────────────────────────────────────────────────────────
// collocations is kept as a serialized JSON string in the form so Inertia
// can send it normally; the structured array state drives the UI.

const EMPTY_FORM = {
    wordlist_id: "",
    new_wordlist_title: "",
    word: "",
    pronunciation: "",
    // ipa: "",
    // bangla_pronunciation: "",
    parts_of_speech_variations: "",
    definition: "",
    // bangla_meaning: "",
    collocations: "", // JSON string — serialized from the array below
    example_sentences: "",
    synonym: "",
    antonym: "",
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
    const { t } = useTranslation();
    const [showNewList, setShowNewList] = useState(false);
    const [tab, setTab] = useState("basic");

    // Collocations are managed as a local array, serialized to JSON on submit
    const [collocations, setCollocations] = useState([emptyCollocation()]);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        setError,
        clearErrors,
        reset,
    } = useForm({ ...EMPTY_FORM });

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
                    // ipa: word.ipa ?? "",
                    // bangla_pronunciation: word.bangla_pronunciation ?? "",
                    parts_of_speech_variations:
                        word.parts_of_speech_variations ?? "",
                    definition: word.definition ?? "",
                    // bangla_meaning: word.bangla_meaning ?? "",
                    example_sentences: word.example_sentences ?? "",
                    synonym: word.synonym ?? "",
                    antonym: word.antonym ?? "",
                });
                const parsed = parseCollocations(word.collocations);
                setCollocations(parsed.length ? parsed : [emptyCollocation()]);
                setShowNewList(false);
            } else {
                reset();
                setCollocations([emptyCollocation()]);
                setShowNewList(wordLists.length === 0);
            }
            setTab("basic");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, word]);

    // Keep the form's collocations field in sync with the structured array
    // so that Inertia sends the serialized JSON automatically on submit.
    useEffect(() => {
        setData("collocations", serializeCollocations(collocations));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collocations]);

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

    // ── Submit ────────────────────────────────────────────────────────────────

    function handleSubmit(e) {
        e?.preventDefault();

        // ── Client-side validation for required fields ──────────────────────
        const clientErrors = {};
        if (!data.word.trim())
            clientErrors.word = t("user_words.form.messages.word_required");
        if (!data.definition.trim())
            clientErrors.definition = t(
                "user_words.form.messages.definition_required",
            );
        if (!data.parts_of_speech_variations.trim())
            clientErrors.parts_of_speech_variations = t(
                "user_words.form.messages.pos_required",
            );
        if (!showNewList && !data.wordlist_id)
            clientErrors.wordlist_id = t(
                "user_words.form.messages.list_required",
            );
        if (showNewList && !data.new_wordlist_title.trim())
            clientErrors.new_wordlist_title = t(
                "user_words.form.messages.list_name_required",
            );

        if (Object.keys(clientErrors).length > 0) {
            // Surface errors via Inertia's setError and jump to the first
            // affected tab so the user sees the problem immediately.
            Object.entries(clientErrors).forEach(([key, msg]) =>
                setError(key, msg),
            );
            const basicRequired = [
                "word",
                "definition",
                "parts_of_speech_variations",
                "wordlist_id",
                "new_wordlist_title",
            ];
            if (basicRequired.some((f) => clientErrors[f])) setTab("basic");
            return;
        }

        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCollocations([emptyCollocation()]);
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
        // "ipa",
        // "bangla_pronunciation",
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

    const filledCollocationCount = collocations.filter(
        (c) => c.phrase.trim() || c.example_sentence.trim(),
    ).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    w-[calc(100vw-1.5rem)] max-w-lg rounded-2xl p-0 gap-0
                    sm:w-full overflow-hidden flex flex-col
                    max-h-[90dvh] dark:bg-slate-900 dark:border-slate-800
                "
            >
                {/* ── Header ── */}
                <DialogHeader className="px-5 pt-5 pb-3 shrink-0 dark:border-slate-800">
                    <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#E5201C]/10 dark:bg-[#E5201C]/20 flex items-center justify-center shrink-0">
                            <BookOpen className="h-3.5 w-3.5 text-[#E5201C]" />
                        </span>
                        {isEditing
                            ? t("user_words.form.edit_title")
                            : t("user_words.form.add_title")}
                    </DialogTitle>
                    {category && (
                        <DialogDescription className="text-xs text-gray-400 dark:text-slate-400 pl-9">
                            {t("user_words.form.saving_to")}{" "}
                            <span className="font-medium text-gray-600 dark:text-slate-300">
                                {category.name}
                            </span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <Separator className="dark:bg-slate-800" />

                {/* ── Tabs ── */}
                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="flex flex-col flex-1 min-h-0"
                >
                    {/* Tab bar */}
                    <TabsList className="mx-5 mt-3 mb-1 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0 grid grid-cols-3 p-1">
                        {[
                            {
                                value: "basic",
                                label: t("user_words.form.tabs.basic"),
                                fields: basicFields,
                            },
                            // {
                            //     value: "meanings",
                            //     label: "Meanings",
                            //     fields: meaningFields,
                            // },
                            {
                                value: "usage",
                                label: t("user_words.form.tabs.usage"),
                                fields: usageFields,
                            },
                            {
                                value: "synonyms",
                                label: t("user_words.form.tabs.syn_ant"),
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
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3.5 space-y-3 border border-gray-100 dark:border-slate-700">
                                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                                    {t("user_words.form.labels.word_list")}
                                </p>

                                {!showNewList ? (
                                    <>
                                        <Field
                                            label={t(
                                                "user_words.form.labels.choose_list",
                                            )}
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
                                                <SelectTrigger className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 h-9 text-sm">
                                                    <SelectValue
                                                        placeholder={t(
                                                            "user_words.form.placeholders.select_list",
                                                        )}
                                                    />
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
                                            <Plus className="h-3 w-3" />{" "}
                                            {t(
                                                "user_words.form.buttons.create_list",
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Field
                                            label={t(
                                                "user_words.form.labels.new_list_name",
                                            )}
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
                                                placeholder={t(
                                                    "user_words.form.placeholders.new_list",
                                                )}
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
                                                {t(
                                                    "user_words.form.buttons.pick_list",
                                                )}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Core fields */}
                            <Field
                                label={t("user_words.form.labels.word")}
                                optional={false}
                                error={errors.word}
                            >
                                <Input
                                    value={data.word}
                                    onChange={(e) =>
                                        setData("word", e.target.value)
                                    }
                                    placeholder={t(
                                        "user_words.form.placeholders.word",
                                    )}
                                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 h-10 font-semibold text-[15px]"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field
                                    label={t(
                                        "user_words.form.labels.part_of_speech",
                                    )}
                                    optional={false}
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
                                        placeholder={t(
                                            "user_words.form.placeholders.pos",
                                        )}
                                        className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 h-9 text-sm"
                                    />
                                </Field>
                                <Field
                                    label={t(
                                        "user_words.form.labels.pronunciation",
                                    )}
                                    optional={true}
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
                                        placeholder={t(
                                            "user_words.form.placeholders.pronunciation",
                                        )}
                                        className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 h-9 text-sm"
                                    />
                                </Field>
                            </div>

                            <Field
                                label={t("user_words.form.labels.definition")}
                                optional={false}
                                error={errors.definition}
                            >
                                <Textarea
                                    value={data.definition}
                                    onChange={(e) =>
                                        setData("definition", e.target.value)
                                    }
                                    placeholder={t(
                                        "user_words.form.placeholders.definition",
                                    )}
                                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>

                            {/* <div className="grid grid-cols-2 gap-3">
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
                            </div> */}

                            {/* <Field
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
                            </Field> */}
                        </TabsContent>

                        {/* ─── MEANINGS TAB ─── */}
                        {/* <TabsContent
                            value="meanings"
                            className="mt-3 space-y-4 outline-none"
                        >
                            
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
                        </TabsContent> */}

                        {/* ─── USAGE TAB ─── */}
                        <TabsContent
                            value="usage"
                            className="mt-3 space-y-4 outline-none"
                        >
                            <Field
                                label={t(
                                    "user_words.form.labels.example_sentences",
                                )}
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
                                    placeholder={t(
                                        "user_words.form.placeholders.examples",
                                    )}
                                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>

                            {/* ── Collocations (structured JSON) ── */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        {t("user_words.form.labels.collocations")}
                                        <span className="ml-1 normal-case font-normal text-gray-400 tracking-normal">
                                            ({t("common.optional")})
                                        </span>
                                        {filledCollocationCount > 0 && (
                                            <span className="ml-2 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-[#E5201C]/10 text-[#E5201C] text-[10px] font-bold px-1">
                                                {filledCollocationCount}
                                            </span>
                                        )}
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={addCollocation}
                                        className="flex items-center gap-1 text-[#E5201C] text-xs font-semibold hover:underline"
                                    >
                                        <Plus className="h-3 w-3" />{" "}
                                        {t("user_words.form.buttons.add")}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {collocations.map((item, index) => (
                                        <CollocationRow
                                            key={index}
                                            index={index}
                                            item={item}
                                            onChange={(key, value) =>
                                                updateCollocation(
                                                    index,
                                                    key,
                                                    value,
                                                )
                                            }
                                            onRemove={() =>
                                                removeCollocation(index)
                                            }
                                            isOnly={collocations.length === 1}
                                        />
                                    ))}
                                </div>

                                <p className="text-[10px] text-gray-400 dark:text-slate-500">
                                    {t("user_words.form.messages.collocation_hint")}
                                </p>

                                {errors.collocations && (
                                    <p className="text-[11px] text-red-500 dark:text-red-400">
                                        {errors.collocations}
                                    </p>
                                )}
                            </div>
                        </TabsContent>

                        {/* ─── SYNONYMS TAB ─── */}
                        <TabsContent
                            value="synonyms"
                            className="mt-3 space-y-4 outline-none"
                        >
                            <Field
                                label={t("user_words.form.labels.synonyms")}
                                error={errors.synonym}
                            >
                                <Textarea
                                    value={data.synonym}
                                    onChange={(e) =>
                                        setData("synonym", e.target.value)
                                    }
                                    placeholder={t(
                                        "user_words.form.placeholders.synonyms",
                                    )}
                                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>
                            <Field
                                label={t("user_words.form.labels.antonyms")}
                                error={errors.antonym}
                            >
                                <Textarea
                                    value={data.antonym}
                                    onChange={(e) =>
                                        setData("antonym", e.target.value)
                                    }
                                    placeholder={t(
                                        "user_words.form.placeholders.antonyms",
                                    )}
                                    className="rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-gray-100 resize-none text-sm"
                                    rows={5}
                                />
                            </Field>
                        </TabsContent>
                    </div>
                </Tabs>

                <Separator className="dark:bg-slate-800" />

                {/* ── Footer ── */}
                <DialogFooter className="px-5 py-3.5 shrink-0 flex flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                        className="flex-1 rounded-xl h-10 text-sm font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-700"
                    >
                        {t("user_words.cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex-1 bg-[#E5201C] hover:bg-red-700 dark:hover:bg-red-800 text-white rounded-xl h-10 text-sm font-semibold gap-2"
                    >
                        {processing && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {processing
                            ? isEditing
                                ? t("user_words.form.buttons.updating")
                                : t("user_words.form.buttons.saving")
                            : isEditing
                              ? t("user_words.form.buttons.update_word")
                              : t("user_words.form.buttons.add_word")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

