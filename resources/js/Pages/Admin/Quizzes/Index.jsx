import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import QuizFormModal from "./QuizFormModal";

export default function Index({ quizzes, wordLists = [] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);

    return (
        <AdminLayout>
            <Head title="Quizzes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Quizzes
                        </h1>
                        <p className="text-muted-foreground">
                            Manage quizzes for word lists
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingQuiz(null);
                            setModalOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Quiz
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Quizzes ({quizzes.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            ID
                                        </TableHead>
                                        <TableHead>Word List</TableHead>
                                        <TableHead>Quiz Title</TableHead>
                                        <TableHead className="w-28 text-center">
                                            Pass Mark
                                        </TableHead>
                                        <TableHead className="w-28 text-center">
                                            Questions
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizzes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center py-10 text-muted-foreground"
                                            >
                                                No quizzes found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        quizzes.data.map((quiz) => (
                                            <TableRow key={quiz.id}>
                                                <TableCell className="font-medium text-muted-foreground">
                                                    {quiz.id}
                                                </TableCell>
                                                <TableCell>
                                                    {quiz.word_list?.title ||
                                                        "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {quiz.title || (
                                                        <span className="text-muted-foreground italic">
                                                            Untitled
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">
                                                    {quiz.pass_mark}%
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {quiz.questions_count ??
                                                        "—"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span
                                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            quiz.is_active
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}
                                                    >
                                                        {quiz.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "admin.quizzes.show",
                                                                        quiz.id,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingQuiz(
                                                                    quiz,
                                                                );
                                                                setModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Delete this quiz and all its questions?",
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        route(
                                                                            "admin.quizzes.destroy",
                                                                            quiz.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {quizzes.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {quizzes.from}–{quizzes.to} of{" "}
                                    {quizzes.total} quizzes
                                </p>
                                <div className="flex gap-2">
                                    {quizzes.prev_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.visit(
                                                    quizzes.prev_page_url,
                                                )
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {quizzes.next_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.visit(
                                                    quizzes.next_page_url,
                                                )
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <QuizFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                quiz={editingQuiz}
                wordLists={wordLists}
            />
        </AdminLayout>
    );
}
