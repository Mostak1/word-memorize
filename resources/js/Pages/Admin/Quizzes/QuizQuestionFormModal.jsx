import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { router } from "@inertiajs/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";

// ── Question type config ──────────────────────────────────────────────────────
const QUESTION_TYPES = [
    { value: "mcq_single", label: "MCQ – Single correct answer" },
    { value: "mcq_multiple", label: "MCQ – Multiple correct answers" },
    { value: "matching", label: "Matching pairs" },
    { value: "true_false", label: "True / False" },
    // { value: "fill_blank", label: "Fill in the blank" },
];

// ── MCQ Options editor ────────────────────────────────────────────────────────
function OptionsList({
    options,
    correctAnswer,
    onOptionsChange,
    onCorrectChange,
    multiple,
}) {
    const addOption = () => onOptionsChange([...options, ""]);
    const removeOption = (i) => {
        const removed = options[i];
        const next = options.filter((_, idx) => idx !== i);
        onOptionsChange(next);
        if (multiple) {
            onCorrectChange((correctAnswer || []).filter((a) => a !== removed));
        } else if (correctAnswer === removed) {
            onCorrectChange("");
        }
    };
    const updateOption = (i, val) => {
        const old = options[i];
        const next = options.map((o, idx) => (idx === i ? val : o));
        onOptionsChange(next);
        if (multiple) {
            onCorrectChange(
                (correctAnswer || []).map((a) => (a === old ? val : a)),
            );
        } else if (correctAnswer === old) {
            onCorrectChange(val);
        }
    };
    const toggleCorrect = (opt) => {
        if (multiple) {
            const arr = correctAnswer || [];
            onCorrectChange(
                arr.includes(opt)
                    ? arr.filter((a) => a !== opt)
                    : [...arr, opt],
            );
        } else {
            onCorrectChange(opt);
        }
    };

    return (
        <div className="space-y-2">
            {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                    {/* Correct indicator */}
                    {multiple ? (
                        <Checkbox
                            checked={(correctAnswer || []).includes(opt)}
                            onCheckedChange={() => toggleCorrect(opt)}
                            disabled={!opt}
                            title="Mark as correct"
                        />
                    ) : (
                        <input
                            type="radio"
                            name="correct_radio"
                            checked={correctAnswer === opt}
                            onChange={() => toggleCorrect(opt)}
                            disabled={!opt}
                            className="h-4 w-4 accent-primary cursor-pointer"
                            title="Mark as correct"
                        />
                    )}
                    <Input
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1"
                    />
                    <button
                        type="button"
                        onClick={() => removeOption(i)}
                        disabled={options.length <= 2}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove option"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-1"
            >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Option
            </Button>
            <p className="text-xs text-muted-foreground">
                {multiple
                    ? "☑ Check all correct answers"
                    : "○ Select the one correct answer"}
            </p>
        </div>
    );
}

// ── Matching pairs editor ─────────────────────────────────────────────────────
function MatchingPairs({ pairs, onChange }) {
    const addPair = () => onChange([...pairs, { left: "", right: "" }]);
    const removePair = (i) => onChange(pairs.filter((_, idx) => idx !== i));
    const updatePair = (i, side, val) =>
        onChange(
            pairs.map((p, idx) => (idx === i ? { ...p, [side]: val } : p)),
        );

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Left (Term)</span>
                <span />
                <span>Right (Definition / Match)</span>
                <span />
            </div>
            {pairs.map((pair, i) => (
                <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2"
                >
                    <Input
                        value={pair.left}
                        onChange={(e) => updatePair(i, "left", e.target.value)}
                        placeholder="e.g. Apple"
                    />
                    <span className="text-muted-foreground text-lg">↔</span>
                    <Input
                        value={pair.right}
                        onChange={(e) => updatePair(i, "right", e.target.value)}
                        placeholder="e.g. A red fruit"
                    />
                    <button
                        type="button"
                        onClick={() => removePair(i)}
                        disabled={pairs.length <= 2}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addPair}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Pair
            </Button>
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function QuizQuestionFormModal({
    open,
    onClose,
    quizId,
    question,
    words = [],
}) {
    const isEditing = !!question;

    const [submitting, setSubmitting] = useState(false);

    // Question type
    const [type, setType] = useState("mcq_single");

    // Shared text fields
    const [questionText, setQuestionText] = useState("");
    const [explanation, setExplanation] = useState("");
    const [wordId, setWordId] = useState("");
    const [sortOrder, setSortOrder] = useState(0);

    // MCQ state
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(""); // string | string[]

    // Matching state
    const [matchingPairs, setMatchingPairs] = useState([
        { left: "", right: "" },
        { left: "", right: "" },
        { left: "", right: "" },
    ]);

    // Populate when editing an existing question
    useEffect(() => {
        if (!open) return;

        const t = question?.type || "mcq_single";
        setType(t);
        setQuestionText(question?.question || "");
        setExplanation(question?.explanation || "");
        setWordId(question?.word_id ? String(question.word_id) : "");
        setSortOrder(question?.sort_order || 0);

        if (t === "mcq_single" || t === "mcq_multiple" || t === "true_false") {
            setOptions(
                question?.options ||
                    (t === "true_false" ? ["True", "False"] : ["", "", "", ""]),
            );
        }

        if (t === "mcq_multiple") {
            const ca = question?.correct_answer;
            setCorrectAnswer(Array.isArray(ca) ? ca : ca ? [ca] : []);
        } else if (t === "true_false") {
            setCorrectAnswer(question?.correct_answer ?? "True");
        } else if (t === "fill_blank") {
            setCorrectAnswer(question?.correct_answer || "");
        } else {
            setCorrectAnswer(question?.correct_answer || "");
        }

        if (t === "matching") {
            setMatchingPairs(
                question?.matching_pairs?.length
                    ? question.matching_pairs
                    : [
                          { left: "", right: "" },
                          { left: "", right: "" },
                          { left: "", right: "" },
                      ],
            );
        }
    }, [open, question]);

    const handleTypeChange = (val) => {
        setType(val);
        if (val === "true_false") {
            setOptions(["True", "False"]);
            setCorrectAnswer("True");
        } else if (val === "mcq_multiple") {
            setOptions(["", "", "", ""]);
            setCorrectAnswer([]);
        } else if (val === "mcq_single") {
            setOptions(["", "", "", ""]);
            setCorrectAnswer("");
        } else {
            setCorrectAnswer("");
        }
    };

    const buildPayload = () => {
        const base = {
            type,
            word_id: wordId || null,
            question: questionText,
            explanation: explanation || null,
            sort_order: sortOrder,
        };

        switch (type) {
            case "mcq_single":
                return {
                    ...base,
                    options,
                    correct_answer: correctAnswer,
                    matching_pairs: null,
                };
            case "mcq_multiple":
                return {
                    ...base,
                    options,
                    correct_answer: correctAnswer,
                    matching_pairs: null,
                };
            case "matching":
                return {
                    ...base,
                    options: null,
                    correct_answer: "matching",
                    matching_pairs: matchingPairs,
                };
            case "true_false":
                return {
                    ...base,
                    options: ["True", "False"],
                    correct_answer: correctAnswer,
                    matching_pairs: null,
                };
            // case "fill_blank":
            //     return {
            //         ...base,
            //         options: null,
            //         correct_answer: correctAnswer,
            //         matching_pairs: null,
            //     };
            default:
                return base;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const payload = buildPayload();

        const url = isEditing
            ? route("admin.quizzes.questions.update", [quizId, question.id])
            : route("admin.quizzes.questions.store", quizId);

        const method = isEditing ? router.patch : router.post;

        method(url, payload, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Question" : "Add Question"}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the question details then save.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ── Question Type ───────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label>
                            Question Type{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select value={type} onValueChange={handleTypeChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {QUESTION_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ── Linked Word (optional) ──────────────────────── */}
                    {words.length > 0 && (
                        <div className="space-y-1.5">
                            <Label>
                                Link to Word{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <Select
                                value={wordId || "_none"}
                                onValueChange={(v) =>
                                    setWordId(v === "_none" ? "" : v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">None</SelectItem>
                                    {words.map((w) => (
                                        <SelectItem
                                            key={w.id}
                                            value={String(w.id)}
                                        >
                                            {w.word}
                                            {w.definition
                                                ? ` — ${w.definition.slice(0, 45)}…`
                                                : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* ── Question Text ───────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label>
                            Question <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder={
                                type === "fill_blank"
                                    ? 'Use ___ for the blank, e.g. "The cat sat on the ___."'
                                    : "Enter your question…"
                            }
                            rows={3}
                            required
                        />
                    </div>

                    {/* ── MCQ Single ──────────────────────────────────── */}
                    {type === "mcq_single" && (
                        <div className="space-y-1.5">
                            <Label>
                                Options & Correct Answer{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <OptionsList
                                options={options}
                                correctAnswer={correctAnswer}
                                onOptionsChange={setOptions}
                                onCorrectChange={setCorrectAnswer}
                                multiple={false}
                            />
                        </div>
                    )}

                    {/* ── MCQ Multiple ────────────────────────────────── */}
                    {type === "mcq_multiple" && (
                        <div className="space-y-1.5">
                            <Label>
                                Options & Correct Answers{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <OptionsList
                                options={options}
                                correctAnswer={correctAnswer}
                                onOptionsChange={setOptions}
                                onCorrectChange={setCorrectAnswer}
                                multiple={true}
                            />
                        </div>
                    )}

                    {/* ── Matching Pairs ──────────────────────────────── */}
                    {type === "matching" && (
                        <div className="space-y-1.5">
                            <Label>
                                Matching Pairs{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <MatchingPairs
                                pairs={matchingPairs}
                                onChange={setMatchingPairs}
                            />
                        </div>
                    )}

                    {/* ── True / False ────────────────────────────────── */}
                    {type === "true_false" && (
                        <div className="space-y-1.5">
                            <Label>
                                Correct Answer{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-3">
                                {["True", "False"].map((val) => (
                                    <label
                                        key={val}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border cursor-pointer transition-colors select-none ${
                                            correctAnswer === val
                                                ? "border-primary bg-primary/5 text-primary font-medium"
                                                : "border-border text-muted-foreground hover:bg-muted/50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="tf_answer"
                                            value={val}
                                            checked={correctAnswer === val}
                                            onChange={() =>
                                                setCorrectAnswer(val)
                                            }
                                            className="accent-primary"
                                        />
                                        {val}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Fill in the Blank ───────────────────────────── */}
                    {/* {type === "fill_blank" && (
                        <div className="space-y-1.5">
                            <Label>
                                Correct Answer{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={correctAnswer}
                                onChange={(e) =>
                                    setCorrectAnswer(e.target.value)
                                }
                                placeholder="The exact word / phrase that fills the blank"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Matching is case-insensitive.
                            </p>
                        </div>
                    )} */}

                    {/* ── Explanation ─────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label>
                            Explanation{" "}
                            <span className="text-xs text-muted-foreground font-normal">
                                (optional — shown after answering)
                            </span>
                        </Label>
                        <Textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Why is this the correct answer?"
                            rows={2}
                        />
                    </div>

                    {/* ── Sort Order ──────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label>Sort Order</Label>
                        <Input
                            type="number"
                            min="0"
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(parseInt(e.target.value) || 0)
                            }
                            className="w-24"
                        />
                    </div>

                    {/* ── Actions ─────────────────────────────────────── */}
                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            {isEditing ? "Update Question" : "Add Question"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
