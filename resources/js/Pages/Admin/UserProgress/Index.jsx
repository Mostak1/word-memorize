import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { DataTable } from "@/Components/ui/data-table";
import { Button } from "@/Components/ui/button";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

const columns = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Name
                    <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Email
                    <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "current_streak",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Current Streak
                    <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="text-center">
                    {row.getValue("current_streak")}
                </div>
            );
        },
    },
    {
        accessorKey: "last_practice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Last Practice
                    <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = row.getValue("last_practice");
            return date ? new Date(date).toLocaleDateString() : "Never";
        },
    },
    {
        accessorKey: "xp",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    XP
                    <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("xp")}</div>;
        },
    },
    {
        accessorKey: "mastered_words_count",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Mastered Words
                    <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="text-center">
                    {row.getValue("mastered_words_count")}
                </div>
            );
        },
    },
    {
        accessorKey: "wordlist_progress",
        header: "Wordlist progress",
        cell: ({ row }) => {
            const lists = row.getValue("wordlist_progress") || [];

            return (
                <Accordion
                    type="single"
                    collapsible
                    className="w-full rounded-md border bg-muted/10"
                >
                    <AccordionItem value={`progress-${row.getValue("id")}`}>
                        <AccordionTrigger className="px-3 py-2 text-sm text-left">
                            <div className="flex items-center justify-between gap-4">
                                <span className="truncate">
                                    View by wordlist
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {lists.length} list
                                    {lists.length === 1 ? "" : "s"}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="grid gap-3 p-3">
                            {lists.length > 0 ? (
                                lists.map((item) => (
                                    <div
                                        key={item.wordlist_id}
                                        className="rounded-lg border bg-white p-3 shadow-sm"
                                    >
                                        <div className="font-medium text-sm">
                                            {item.wordlist_title}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            <Badge variant="outline">
                                                Learning {item.learning_count}
                                            </Badge>
                                            <Badge variant="outline">
                                                Reviewing {item.reviewing_count}
                                            </Badge>
                                            <Badge variant="outline">
                                                Mastered {item.mastered_count}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No stage progress available.
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            );
        },
    },
];

export default function Index({ users }) {
    return (
        <AdminLayout>
            <Head title="User Progress" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>User Progress</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Track user streaks, XP, and mastered
                                        word counts.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <DataTable columns={columns} data={users} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
