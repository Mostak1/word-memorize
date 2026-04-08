import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import QuizFormModal from "./QuizFormModal";
import QuizQuestionFormModal from "./QuizQuestionFormModal";
import { useState, useEffect } from "react";
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
    GripVertical,
} from "lucide-react";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    // fill_blank: {
    //     label: "Fill Blank",
    //     icon: Pencil,
    //     color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    // },
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

function SortableQuestionCard({ question, index, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="relative"
        >
            {/* Drag handle */}
            <div
                {...listeners}
                className="absolute left-3 top-5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground z-10"
            >
                <GripVertical className="h-5 w-5" />
            </div>

            <QuestionCard
                question={question}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                className="pl-11"
            />
        </div>
    );
}

function QuestionCard({ question, index, onEdit, onDelete, className = "" }) {
    const cfg = TYPE_CONFIG[question.type] || {
        label: question.type,
        color: "bg-gray-100 text-gray-600",
    };
    const Icon = cfg.icon;

    return (
        <div
            className={`border rounded-xl p-3 bg-card hover:shadow-sm transition-shadow ${className}`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Header */}
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

                    {/* Question text (compact) */}
                    <p className="font-medium leading-tight text-sm line-clamp-2">
                        {question.question}
                    </p>

                    {/* MCQ options – compact */}
                    {(question.type === "mcq_single" ||
                        question.type === "mcq_multiple") &&
                        question.options?.length > 0 && (
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                {question.options.slice(0, 4).map((opt, i) => {
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
                                            className={`px-2 py-1 rounded border text-foreground/90 ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/30" : "border-border"}`}
                                        >
                                            {isCorrect ? "✓ " : ""}
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    {/* Matching – compact */}
                    {question.type === "matching" &&
                        question.matching_pairs?.length > 0 && (
                            <div className="text-xs text-muted-foreground space-y-px">
                                {question.matching_pairs
                                    .slice(0, 3)
                                    .map((pair, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="font-medium">
                                                {pair.left}
                                            </span>
                                            <span className="text-amber-500">
                                                ↔
                                            </span>
                                            <span>{pair.right}</span>
                                        </div>
                                    ))}
                                {question.matching_pairs.length > 3 && (
                                    <p className="text-[10px] text-muted-foreground">
                                        +{question.matching_pairs.length - 3}{" "}
                                        more
                                    </p>
                                )}
                            </div>
                        )}

                    {/* TF / Fill */}
                    {(question.type === "true_false" ||
                        question.type === "fill_blank") && (
                        <p className="text-xs text-muted-foreground">
                            Correct:{" "}
                            <span className="font-semibold text-green-600">
                                {question.correct_answer}
                            </span>
                        </p>
                    )}

                    {/* Explanation (smaller) */}
                    {question.explanation && (
                        <p className="text-xs text-muted-foreground border-l-2 border-border pl-2 italic line-clamp-1">
                            {question.explanation}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(question)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => onDelete(question)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function Show({ quiz, words = [] }) {
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [quizEditModalOpen, setQuizEditModalOpen] = useState(false);

    const [questionsList, setQuestionsList] = useState(quiz.questions || []);

    useEffect(() => {
        setQuestionsList(quiz.questions || []);
    }, [quiz.questions]);

    // Drag & drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setQuestionsList((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);

            // Re-assign sequential sort_order
            const reordered = newItems.map((item, idx) => ({
                ...item,
                sort_order: idx,
            }));

            // Persist to server
            router.patch(
                route("admin.quizzes.questions.reorder", quiz.id),
                {
                    order: reordered.map((q) => ({
                        id: q.id,
                        sort_order: q.sort_order,
                    })),
                },
                { preserveScroll: true },
            );

            return reordered;
        });
    };

    const openAddQuestion = () => {
        setEditingQuestion(null);
        setQuestionModalOpen(true);
    };
    const openEditQuestion = (q) => {
        setEditingQuestion(q);
        setQuestionModalOpen(true);
    };
    const handleQuestionModalClose = () => {
        setQuestionModalOpen(false);
        setEditingQuestion(null);
    };

    const openEditQuiz = () => {
        setQuizEditModalOpen(true);
    };

    const handleQuizModalClose = () => {
        setQuizEditModalOpen(false);
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
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={openEditQuiz}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Quiz
                        </Button>
                        <Button onClick={openAddQuestion}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                        </Button>
                    </div>
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

                {/* Questions – now draggable */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle>
                            Questions ({questionsList.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {questionsList.length === 0 ? (
                            /* empty state unchanged */
                            <div className="py-14 text-center text-muted-foreground space-y-2">
                                <ListChecks className="h-10 w-10 mx-auto opacity-25" />
                                <p className="text-sm">
                                    No questions yet.{" "}
                                    <button
                                        onClick={openAddQuestion}
                                        className="text-primary underline underline-offset-2"
                                    >
                                        Add the first question
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={questionsList.map((q) => q.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {questionsList.map((q, index) => (
                                            <SortableQuestionCard
                                                key={q.id}
                                                question={q}
                                                index={index}
                                                onEdit={openEditQuestion}
                                                onDelete={deleteQuestion}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quiz Edit Modal */}
            <QuizFormModal
                open={quizEditModalOpen}
                onClose={handleQuizModalClose}
                quiz={quiz} // Passing the current quiz for editing
                wordLists={[]} // Not needed in edit mode
            />

            {/* Question Form Modal */}
            <QuizQuestionFormModal
                open={questionModalOpen}
                onClose={handleQuestionModalClose}
                quizId={quiz.id}
                question={editingQuestion}
                words={words}
            />
        </AdminLayout>
    );
}
