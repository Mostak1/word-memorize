import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    BookMarked,
    Search,
    Trash2,
    Users,
    BookOpen,
    Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useCallback } from "react";

const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
};

function StatCard({ icon: Icon, iconClass, label, value }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${iconClass}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Index({ reviewWords, stats, filters }) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [deletingEntry, setDeleting] = useState(null);

    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        setSearch(value);
        router.get(
            route("admin.review-words.index"),
            { search: value },
            { preserveState: true, replace: true },
        );
    }, []);

    const confirmDelete = () => {
        if (!deletingEntry) return;
        router.delete(route("admin.review-words.destroy", deletingEntry.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Entry removed.");
                setDeleting(null);
            },
            onError: () => {
                toast.error("Failed to remove entry.");
                setDeleting(null);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Review Words" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-100">
                            <BookMarked className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Review Words
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Words users marked as "Didn't Know" and are
                                still learning
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={Hash}
                        iconClass="bg-orange-100 text-orange-600"
                        label="Total review entries"
                        value={stats.total}
                    />
                    <StatCard
                        icon={Users}
                        iconClass="bg-blue-100 text-blue-600"
                        label="Unique users"
                        value={stats.unique_users}
                    />
                    <StatCard
                        icon={BookOpen}
                        iconClass="bg-purple-100 text-purple-600"
                        label="Unique words"
                        value={stats.unique_words}
                    />
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                        <CardTitle>All Review Entries</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search word, user..."
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Word</TableHead>
                                    <TableHead>Definition</TableHead>
                                    <TableHead>Word List</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviewWords.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-10 text-muted-foreground"
                                        >
                                            No review entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reviewWords.data.map((entry) => (
                                        <TableRow key={entry.id}>
                                            {/* Word */}
                                            <TableCell className="font-semibold">
                                                <div>{entry.word?.word}</div>
                                                {entry.word
                                                    ?.parts_of_speech_variations && (
                                                    <span className="text-xs text-muted-foreground font-normal bg-muted px-1.5 py-0.5 rounded">
                                                        {
                                                            entry.word
                                                                .parts_of_speech_variations
                                                        }
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Definition */}
                                            <TableCell className="max-w-[220px]">
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {entry.word?.definition}
                                                </p>
                                                {entry.word?.bangla_meaning && (
                                                    <p className="text-xs text-blue-600 mt-0.5 line-clamp-1">
                                                        {
                                                            entry.word
                                                                .bangla_meaning
                                                        }
                                                    </p>
                                                )}
                                            </TableCell>

                                            {/* Word List */}
                                            <TableCell>
                                                <span className="text-sm font-medium text-primary">
                                                    {entry.word?.word_list
                                                        ?.title ?? "—"}
                                                </span>
                                            </TableCell>

                                            {/* Difficulty */}
                                            <TableCell>
                                                {entry.word?.word_list
                                                    ?.difficulty ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            difficultyColors[
                                                                entry.word
                                                                    .word_list
                                                                    .difficulty
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            entry.word.word_list
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
                                                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {entry.user?.name?.[0]?.toUpperCase() ??
                                                            "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-tight">
                                                            {entry.user?.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {entry.user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Added */}
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(
                                                    entry.created_at,
                                                ).toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() =>
                                                        setDeleting(entry)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {reviewWords.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {reviewWords.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? "default" : "outline"
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.visit(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete confirmation */}
            <AlertDialog
                open={!!deletingEntry}
                onOpenChange={(open) => !open && setDeleting(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Review Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                            Remove <strong>{deletingEntry?.word?.word}</strong>{" "}
                            from <strong>{deletingEntry?.user?.name}</strong>'s
                            review list? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
