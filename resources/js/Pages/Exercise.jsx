import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, BookOpen, Lock } from "lucide-react";

export default function Exercise({ exerciseGroups }) {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-green-100 text-green-700 border-green-300";
            case "medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "hard":
                return "bg-red-100 text-red-700 border-red-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    const getDifficultyIcon = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "⭐";
            case "medium":
                return "⭐⭐";
            case "hard":
                return "⭐⭐⭐";
            default:
                return "⭐";
        }
    };

    return (
        <AppLayout>
            <Head title="Exercises" />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Main Content */}
                <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
                    {exerciseGroups && exerciseGroups.length > 0 ? (
                        <div className="space-y-4">
                            {exerciseGroups.map((group, index) => (
                                <Card
                                    key={group.id}
                                    className="overflow-hidden border-2 hover:border-[#E5201C] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animation:
                                            "fadeInUp 0.5s ease-out forwards",
                                        opacity: 0,
                                    }}
                                >
                                    <Link
                                        href={route("exercise.show", group.id)}
                                        className="block"
                                    >
                                        <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                        {group.title}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge
                                                            variant="outline"
                                                            className={`${getDifficultyColor(group.difficulty)} font-semibold border`}
                                                        >
                                                            {getDifficultyIcon(
                                                                group.difficulty,
                                                            )}{" "}
                                                            {group.difficulty}
                                                        </Badge>
                                                        {group.words_count >
                                                            0 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-50 text-blue-700 border-blue-300"
                                                            >
                                                                {
                                                                    group.words_count
                                                                }{" "}
                                                                words
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {group.price > 0 ? (
                                                        <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
                                                            <Lock className="h-4 w-4 text-amber-600" />
                                                            <span className="text-sm font-bold text-amber-700">
                                                                ${group.price}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                                            FREE
                                                        </Badge>
                                                    )}
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-3 pb-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Status:{" "}
                                                    <span
                                                        className={`font-semibold ${group.status === "active" ? "text-green-600" : "text-gray-500"}`}
                                                    >
                                                        {group.status ||
                                                            "active"}
                                                    </span>
                                                </span>
                                                <span className="text-[#E5201C] font-medium flex items-center gap-1">
                                                    Start Exercise
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M14.752 11.168l-6.518 3.758A1 1 0 0 1 6 13.998V7.002a1 1 0 0 1 1.234-.97l6.518 1.77a1 1 0 0 1 .999.97v2.376a1 1 0 0 1-.519.992z"
                                                        />
                                                    </svg>
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-8 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <BookOpen className="h-10 w-10 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Exercises Available
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        There are no exercise groups created
                                        yet.
                                    </p>
                                    <Link
                                        href={route("home")}
                                        className="inline-flex items-center gap-2 bg-[#E5201C] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                    >
                                        Go Back Home
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    )}
                </main>

                <style>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
