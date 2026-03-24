import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";

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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronRight,
    Globe,
    Lock,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import UserWordFormDialog from "./UserWordFormDialog";

// ── Word card ─────────────────────────────────────────────────────────────────

function WordCard({ word, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-xl px-4 py-3 flex items-start gap-3 group border border-gray-100 hover:border-gray-200 transition-colors">
            {/* Visibility icon */}
            <div className="mt-0.5 shrink-0">
                {word.is_public ? (
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                ) : (
                    <Lock className="h-3.5 w-3.5 text-gray-300" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                        {word.word}
                    </span>
                    {word.parts_of_speech_variations && (
                        <span className="text-[10px] italic text-gray-400">
                            {word.parts_of_speech_variations}
                        </span>
                    )}
                    {word.ipa && (
                        <span className="text-[10px] font-mono text-gray-400">
                            {word.ipa}
                        </span>
                    )}
                </div>

                {word.pronunciation && (
                    <p className="text-xs text-gray-400 mt-0.5">
                        {word.pronunciation}
                    </p>
                )}

                {word.definition && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {word.definition}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(word)}
                    className="h-7 w-7 rounded-full hover:bg-blue-50"
                    aria-label="Edit"
                >
                    <Pencil className="h-3 w-3 text-blue-500" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(word)}
                    className="h-7 w-7 rounded-full hover:bg-red-50"
                    aria-label="Delete"
                >
                    <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
            </div>
        </div>
    );
}

// ── Wordlist group (collapsible) ───────────────────────────────────────────────

function WordListGroup({
    listId,
    listTitle,
    words,
    onEdit,
    onDelete,
    defaultOpen = true,
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-2.5 px-1 py-1.5 group select-none">
                    <span className="w-6 h-6 rounded-full bg-[#E5201C]/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-3 w-3 text-[#E5201C]" />
                    </span>
                    <span className="flex-1 text-left font-semibold text-gray-800 text-sm truncate">
                        {listTitle}
                    </span>
                    <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold bg-gray-100 text-gray-500 h-5 px-2 rounded-full"
                    >
                        {words.length}
                    </Badge>
                    {open ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1.5 pt-1.5 pb-1">
                {words.map((word) => (
                    <WordCard
                        key={word.id}
                        word={word}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Index({ words, category, wordLists = [] }) {
    const { flash } = usePage().props;

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Search
    const [search, setSearch] = useState("");

    // Auto-open "Add Word" dialog if ?new=1
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("new") === "1") {
            setEditTarget(null);
            setDialogOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete("new");
            window.history.replaceState({}, "", url.toString());
        }
    }, []);

    function openCreate() {
        setEditTarget(null);
        setDialogOpen(true);
    }

    function openEdit(word) {
        setEditTarget(word);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(route("my.words.destroy", deleteTarget.id), {
            preserveScroll: true,
        });
        setDeleteTarget(null);
    }

    // Filter words by search, then group by wordlist
    const grouped = useMemo(() => {
        const allWords = words.data ?? [];
        const filtered = search.trim()
            ? allWords.filter((w) =>
                  w.word.toLowerCase().includes(search.toLowerCase()),
              )
            : allWords;

        // Build a map: listId → { title, words[] }
        const map = new Map();

        filtered.forEach((w) => {
            const id = w.wordlist_id ?? "uncategorized";
            const title = w.word_list?.title ?? "Uncategorized";
            if (!map.has(id)) map.set(id, { id, title, words: [] });
            map.get(id).words.push(w);
        });

        // Sort groups by the order they appear in wordLists prop (preserves user-defined order)
        const listOrder = wordLists.map((l) => l.id);
        return [...map.values()].sort((a, b) => {
            const ai = listOrder.indexOf(a.id);
            const bi = listOrder.indexOf(b.id);
            if (ai === -1 && bi === -1) return 0;
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });
    }, [words.data, search, wordLists]);

    const totalDisplayed = grouped.reduce((s, g) => s + g.words.length, 0);

    return (
        <AppLayout>
            <Head title="My Words" />

            <div className="min-h-screen bg-[#F0F2F5]">
                {/* ── Sticky top bar ── */}
                <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                    <div className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                        <Link href={route("dashboard")}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-9 w-9 hover:bg-gray-100"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="font-semibold text-gray-900 text-base">
                                My Words
                            </h1>
                            <p className="text-xs text-gray-400">
                                {words.total ?? 0}{" "}
                                {words.total === 1 ? "word" : "words"}
                                {wordLists.length > 0 && (
                                    <span className="ml-1 text-gray-300">
                                        · {wordLists.length}{" "}
                                        {wordLists.length === 1
                                            ? "list"
                                            : "lists"}
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={openCreate}
                            className="bg-[#E5201C] hover:bg-red-700 text-white rounded-full px-4 text-xs font-semibold gap-1"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Word
                        </Button>
                    </div>
                </div>

                <div className="w-full max-w-2xl mx-auto px-4 py-5 space-y-4">
                    {/* ── Flash ── */}
                    {flash?.type === "success" && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5">
                            {flash.message}
                        </div>
                    )}

                    {/* ── Search ── */}
                    {(words.total ?? 0) > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search words…"
                                className="pl-9 rounded-xl border-gray-200 bg-white"
                            />
                        </div>
                    )}

                    {/* ── Grouped word lists ── */}
                    {totalDisplayed > 0 ? (
                        <div className="space-y-3">
                            {grouped.map((group, idx) => (
                                <div
                                    key={group.id}
                                    className="bg-white rounded-2xl shadow-sm px-4 py-3"
                                >
                                    <WordListGroup
                                        listId={group.id}
                                        listTitle={group.title}
                                        words={group.words}
                                        onEdit={openEdit}
                                        onDelete={setDeleteTarget}
                                        defaultOpen={true}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm px-6 py-14 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-7 w-7 text-[#E5201C]" />
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">
                                {search ? "No matching words" : "No words yet"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 mb-5">
                                {search
                                    ? "Try a different search term"
                                    : "Start building your personal vocabulary list"}
                            </p>
                            {!search && (
                                <Button
                                    onClick={openCreate}
                                    className="bg-[#E5201C] hover:bg-red-700 text-white rounded-full px-6 text-sm font-semibold gap-1.5"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add your first word
                                </Button>
                            )}
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {words.last_page > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                            {words.links
                                .filter((l) => l.url)
                                .map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? "bg-[#E5201C] text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Word Form Dialog ── */}
            <UserWordFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                word={editTarget}
                wordLists={wordLists}
                category={category}
            />

            {/* ── Delete confirmation ── */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-full rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this word?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="font-semibold text-gray-800">
                                "{deleteTarget?.word}"
                            </span>{" "}
                            will be permanently removed. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl flex-1">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="rounded-xl flex-1 bg-[#E5201C] hover:bg-red-700 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
