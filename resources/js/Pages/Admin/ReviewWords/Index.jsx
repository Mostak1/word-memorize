import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
    ChevronLeft,
    ChevronRight,
    BookMarked,
    Search,
    User as UserIcon,
    BookOpen,
} from "lucide-react";
import { useState } from "react";

const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
};

export default function Index({ reviewWords }) {
    const [search, setSearch] = useState("");

    const { data, current_page, last_page, from, to, total } = reviewWords;

    // Client-side filter on the current page's data
    const filtered = data.filter((entry) => {
        const q = search.toLowerCase();
        return (
            entry.word?.word?.toLowerCase().includes(q) ||
            entry.user?.name?.toLowerCase().includes(q) ||
            entry.user?.email?.toLowerCase().includes(q) ||
            entry.word?.exercise_group?.title?.toLowerCase().includes(q)
        );
    });

    const goToPage = (page) => {
        router.get(
            route("admin.review-words.index"),
            { page },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Review Words" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <BookMarked className="h-8 w-8 text-red-600" />
                            Review Words
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Words that users have marked as "Learning" and added
                            to their review list.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                        {total} total entries
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{total}</div>
                            <p className="text-sm text-muted-foreground">
                                Total review entries
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {
                                    [...new Set(data.map((r) => r.user_id))]
                                        .length
                                }
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Unique users (this page)
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {
                                    [...new Set(data.map((r) => r.word_id))]
                                        .length
                                }
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Unique words (this page)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                        <CardTitle>All Review Entries</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search word, user, group…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <BookMarked className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                {search
                                    ? "No results match your search."
                                    : "No review words yet."}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            #
                                        </TableHead>
                                        <TableHead>Word</TableHead>
                                        <TableHead>Definition</TableHead>
                                        <TableHead>Exercise Group</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((entry, index) => (
                                        <TableRow key={entry.id}>
                                            {/* Row number */}
                                            <TableCell className="text-muted-foreground text-xs">
                                                {(from ?? 0) + index}
                                            </TableCell>

                                            {/* Word */}
                                            <TableCell>
                                                <div className="font-semibold text-gray-900">
                                                    {entry.word?.word ?? "—"}
                                                </div>
                                                {entry.word?.hyphenation && (
                                                    <div className="text-xs text-muted-foreground italic">
                                                        {entry.word.hyphenation}
                                                    </div>
                                                )}
                                                {entry.word
                                                    ?.parts_of_speech_variations && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs mt-1"
                                                    >
                                                        {
                                                            entry.word
                                                                .parts_of_speech_variations
                                                        }
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Definition */}
                                            <TableCell className="max-w-xs">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <p className="truncate max-w-[200px] text-sm text-gray-700 cursor-default">
                                                                {entry.word
                                                                    ?.definition ??
                                                                    "—"}
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs whitespace-normal">
                                                            {
                                                                entry.word
                                                                    ?.definition
                                                            }
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                {entry.word
                                                    ?.bangla_translation && (
                                                    <p className="text-xs text-blue-600 mt-0.5">
                                                        {
                                                            entry.word
                                                                .bangla_translation
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>

                                            {/* Exercise Group */}
                                            <TableCell>
                                                {entry.word?.exercise_group ? (
                                                    <Link
                                                        href={route(
                                                            "admin.exercise-groups.show",
                                                            entry.word
                                                                .exercise_group
                                                                .id,
                                                        )}
                                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                    >
                                                        <BookOpen className="h-3.5 w-3.5" />
                                                        {
                                                            entry.word
                                                                .exercise_group
                                                                .title
                                                        }
                                                    </Link>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>

                                            {/* Difficulty */}
                                            <TableCell>
                                                {entry.word?.exercise_group
                                                    ?.difficulty ? (
                                                    <Badge
                                                        className={
                                                            difficultyColors[
                                                                entry.word
                                                                    .exercise_group
                                                                    .difficulty
                                                            ] ??
                                                            "bg-gray-100 text-gray-700"
                                                        }
                                                        variant="secondary"
                                                    >
                                                        {
                                                            entry.word
                                                                .exercise_group
                                                                .difficulty
                                                        }
                                                    </Badge>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>

                                            {/* User */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                                                        {entry.user?.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ??
                                                            "?"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium leading-tight">
                                                            {entry.user?.name ??
                                                                "Deleted User"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {entry.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Added date */}
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(
                                                    entry.created_at,
                                                ).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
                        {last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing {from}–{to} of {total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={current_page === 1}
                                        onClick={() =>
                                            goToPage(current_page - 1)
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </Button>
                                    <span className="text-sm">
                                        {current_page} / {last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={current_page === last_page}
                                        onClick={() =>
                                            goToPage(current_page + 1)
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
