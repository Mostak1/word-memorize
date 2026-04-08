import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { useForm } from "@inertiajs/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { BookOpen, Loader2, AlertCircle } from "lucide-react";

export default function QuizFormModal({
    open,
    onClose,
    quiz,
    wordLists = [],
    preselectedWordlistId = null, // ← pre-select a word list (e.g. when opened from WordList/Show)
}) {
    const [selectedWordList, setSelectedWordList] = useState(null);
    const [loadingWords, setLoadingWords] = useState(false);
    const [wordPreview, setWordPreview] = useState(null);

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        wordlist_id: quiz?.wordlist_id ? String(quiz.wordlist_id) : "",
        title: quiz?.title || "",
        pass_mark: quiz?.pass_mark || 70,
        is_active: quiz?.is_active ?? true,
    });

    useEffect(() => {
        if (open) {
            const initialWordlistId = quiz?.wordlist_id
                ? String(quiz.wordlist_id)
                : preselectedWordlistId
                  ? String(preselectedWordlistId)
                  : "";

            setData({
                wordlist_id: initialWordlistId,
                title: quiz?.title || "",
                pass_mark: quiz?.pass_mark || 70,
                is_active: quiz?.is_active ?? true,
            });

            // Hydrate word-list preview for preselected list
            if (initialWordlistId && !quiz) {
                const wl = wordLists.find(
                    (w) => String(w.id) === initialWordlistId,
                );
                setSelectedWordList(wl || null);
                if (wl) fetchWordPreview(initialWordlistId);
            } else {
                setSelectedWordList(null);
                setWordPreview(null);
            }
        }
    }, [open]);

    const fetchWordPreview = async (value) => {
        setLoadingWords(true);
        try {
            const res = await fetch(
                route("admin.quizzes.wordlist-words", value),
            );
            const json = await res.json();
            setWordPreview({ count: json.count });
        } catch {
            setWordPreview(null);
        } finally {
            setLoadingWords(false);
        }
    };

    // When a wordlist is picked, fetch its word count for the preview banner
    const handleWordListChange = async (value) => {
        setData("wordlist_id", value);
        const wl = wordLists.find((w) => String(w.id) === value);
        setSelectedWordList(wl || null);
        setWordPreview(null);
        if (!value) return;
        fetchWordPreview(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (quiz) {
            patch(route("admin.quizzes.update", quiz.id), {
                onSuccess: onClose,
            });
        } else {
            post(route("admin.quizzes.store"), {
                onSuccess: () => {
                    reset();
                    onClose();

                    // if (isFromWordList && page.props.quiz?.id) {
                    //     // Redirect to the newly created quiz's show page
                    //     window.location.href = route(
                    //         "admin.quizzes.show",
                    //         page.props.quiz.id,
                    //     );
                    // }
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {quiz ? "Edit Quiz" : "Create New Quiz"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ── Word List (create only) ─────────────────────── */}
                    {!quiz && (
                        <div className="space-y-1.5">
                            <Label>
                                Word List{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.wordlist_id}
                                onValueChange={handleWordListChange}
                                disabled={
                                    !!preselectedWordlistId &&
                                    wordLists.length === 1
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a word list…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wordLists.map((wl) => (
                                        <SelectItem
                                            key={wl.id}
                                            value={String(wl.id)}
                                        >
                                            {wl.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.wordlist_id && (
                                <p className="text-xs text-red-500">
                                    {errors.wordlist_id}
                                </p>
                            )}

                            {/* Word count preview banner */}
                            {selectedWordList && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/60 border border-border/60 text-sm text-muted-foreground">
                                    {loadingWords ? (
                                        <>
                                            <Loader2 className="h-4 w-4 shrink-0 animate-spin mt-0.5" />
                                            <span>
                                                Fetching word list info…
                                            </span>
                                        </>
                                    ) : wordPreview ? (
                                        <>
                                            <BookOpen className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                            <span>
                                                <strong className="text-foreground">
                                                    {wordPreview.count}
                                                </strong>{" "}
                                                words in this list. After
                                                creating the quiz you can link
                                                each question to a specific
                                                word.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>
                                                {selectedWordList.title}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Quiz Title ──────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label>
                            Quiz Title{" "}
                            <span className="text-xs text-muted-foreground font-normal">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="e.g. Oxford 3000 – Week 1"
                        />
                    </div>

                    {/* ── Pass Mark ───────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label>
                            Pass Mark (%){" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                value={data.pass_mark}
                                onChange={(e) =>
                                    setData(
                                        "pass_mark",
                                        parseInt(e.target.value) || 70,
                                    )
                                }
                                className="w-28"
                            />
                            <span className="text-sm text-muted-foreground">
                                ≥{data.pass_mark}% to pass
                            </span>
                        </div>
                        {errors.pass_mark && (
                            <p className="text-xs text-red-500">
                                {errors.pass_mark}
                            </p>
                        )}
                    </div>

                    {/* ── Active toggle ───────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData("is_active", checked)
                            }
                        />
                        <div>
                            <Label>Active</Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive quizzes are hidden from students
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            {quiz ? "Update Quiz" : "Create Quiz"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
