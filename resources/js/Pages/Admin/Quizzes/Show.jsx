import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import QuizQuestionFormModal from "./QuizQuestionFormModal";
import { useState } from "react";
import {
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    ListChecks,
    ToggleLeft,
    GitMerge,
    CheckSquare,
    Pencil,
} from "lucide-react";

// ── Type display config ───────────────────────────────────────────────────────
const TYPE_CONFIG = {
    mcq_single: {
        label: "MCQ Single",
        icon: ListChecks,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    mcq_multiple: {
        label: "MCQ Multiple",
        icon: CheckSquare,
        color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    },
    matching: {
        label: "Matching",
        icon: GitMerge,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    true_false: {
        label: "True / False",
        icon: ToggleLeft,
        color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    fill_blank: {
        label: "Fill Blank",
        icon: Pencil,
        color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    },
};

function StatCard({ label, value }) {
    return (
        <Card>
            <CardContent className="px-5 py-4">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                    {label}
                </div>
            </CardContent>
        </Card>
    );
}

function QuestionCard({ question, index, onEdit, onDelete }) {
    const cfg = TYPE_CONFIG[question.type] || {
        label: question.type,
        color: "bg-gray-100 text-gray-600",
    };
    const Icon = cfg.icon;

    return (
        <div className="border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-muted-foreground shrink-0">
                            #{index + 1}
                        </span>
                        <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}
                        >
                            {Icon && <Icon className="h-3 w-3" />}
                            {cfg.label}
                        </span>
                        {question.word && (
                            <Badge
                                variant="outline"
                                className="text-xs font-normal"
                            >
                                📖 {question.word.word}
                            </Badge>
                        )}
                    </div>

                    {/* Question text */}
                    <p className="font-medium leading-snug">
                        {question.question}
                    </p>

                    {/* MCQ options */}
                    {(question.type === "mcq_single" ||
                        question.type === "mcq_multiple") &&
                        question.options?.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {question.options.map((opt, i) => {
                                    const isCorrect =
                                        question.type === "mcq_single"
                                            ? opt === question.correct_answer
                                            : Array.isArray(
                                                  question.correct_answer,
                                              ) &&
                                              question.correct_answer.includes(
                                                  opt,
                                              );
                                    return (
                                        <div
                                            key={i}
                                            className={`text-xs px-2.5 py-1.5 rounded-md border ${
                                                isCorrect
                                                    ? "border-green-500 bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-300"
                                                    : "border-border text-muted-foreground"
                                            }`}
                                        >
                                            {isCorrect ? "✓ " : ""}
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    {/* Matching pairs */}
                    {question.type === "matching" &&
                        question.matching_pairs?.length > 0 && (
                            <div className="space-y-1">
                                {question.matching_pairs.map((pair, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-muted-foreground"
                                    >
                                        <span className="font-medium text-foreground">
                                            {pair.left}
                                        </span>
                                        <span>↔</span>
                                        <span>{pair.right}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    {/* True/False */}
                    {question.type === "true_false" && (
                        <p className="text-xs text-muted-foreground">
                            Correct:{" "}
                            <span className="font-semibold text-green-600">
                                {question.correct_answer}
                            </span>
                        </p>
                    )}

                    {/* Fill blank */}
                    {question.type === "fill_blank" && (
                        <p className="text-xs text-muted-foreground">
                            Answer:{" "}
                            <span className="font-semibold text-foreground">
                                {question.correct_answer}
                            </span>
                        </p>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                        <p className="text-xs text-muted-foreground border-l-2 border-border pl-2.5 italic">
                            {question.explanation}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(question)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(question)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function Show({ quiz, words = [] }) {
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const openAdd = () => {
        setEditingQuestion(null);
        setQuestionModalOpen(true);
    };
    const openEdit = (q) => {
        setEditingQuestion(q);
        setQuestionModalOpen(true);
    };
    const handleClose = () => {
        setQuestionModalOpen(false);
        setEditingQuestion(null);
    };

    const deleteQuestion = (q) => {
        if (confirm("Delete this question? This cannot be undone.")) {
            router.delete(
                route("admin.quizzes.questions.destroy", [quiz.id, q.id]),
            );
        }
    };

    const typeCounts = quiz.questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <AdminLayout>
            <Head
                title={`Quiz: ${quiz.title || quiz.wordList?.title || "Untitled"}`}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.visit(route("admin.quizzes.index"))
                            }
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {quiz.title || "Untitled Quiz"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                                <span>📚 {quiz.wordList?.title}</span>
                                <span>•</span>
                                <span>
                                    Pass Mark:{" "}
                                    <strong className="text-foreground">
                                        {quiz.pass_mark}%
                                    </strong>
                                </span>
                                <span>•</span>
                                <Badge
                                    variant={
                                        quiz.is_active ? "default" : "secondary"
                                    }
                                >
                                    {quiz.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button onClick={openAdd}>
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                    </Button>
                </div>

                {/* Stats */}
                {quiz.questions.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard
                            label="Total Questions"
                            value={quiz.questions.length}
                        />
                        {Object.entries(typeCounts).map(([t, count]) => (
                            <StatCard
                                key={t}
                                label={TYPE_CONFIG[t]?.label || t}
                                value={count}
                            />
                        ))}
                    </div>
                )}

                {/* Questions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle>
                            Questions ({quiz.questions.length})
                        </CardTitle>
                        {quiz.questions.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openAdd}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {quiz.questions.length === 0 ? (
                            <div className="py-14 text-center text-muted-foreground space-y-2">
                                <ListChecks className="h-10 w-10 mx-auto opacity-25" />
                                <p className="text-sm">
                                    No questions yet.{" "}
                                    <button
                                        onClick={openAdd}
                                        className="text-primary underline underline-offset-2"
                                    >
                                        Add the first question
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {quiz.questions.map((q, index) => (
                                    <QuestionCard
                                        key={q.id}
                                        question={q}
                                        index={index}
                                        onEdit={openEdit}
                                        onDelete={deleteQuestion}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <QuizQuestionFormModal
                open={questionModalOpen}
                onClose={handleClose}
                quizId={quiz.id}
                question={editingQuestion}
                words={words}
            />
        </AdminLayout>
    );
}
