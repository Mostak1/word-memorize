import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        // type: "",
        price: "",
        difficulty: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.exercise-groups.store"), {
            onSuccess: () => {
                toast.success("Exercise group created successfully!");
            },
            onError: () => {
                toast.error(
                    "Failed to create exercise group. Please check the form.",
                );
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Exercise Group" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route("admin.exercise-groups.index")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Exercise Group
                        </h1>
                        <p className="text-muted-foreground">
                            Add a new exercise group to your collection
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Exercise Group Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Title{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData("title", e.target.value)
                                        }
                                        placeholder="e.g., Common Verbs - Beginner"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Type{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="type"
                                        value={data.type}
                                        onChange={(e) =>
                                            setData("type", e.target.value)
                                        }
                                        placeholder="e.g., Vocabulary, Grammar"
                                    />
                                    {errors.type && (
                                        <p className="text-sm text-red-600">
                                            {errors.type}
                                        </p>
                                    )}
                                </div> */}

                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">
                                        Difficulty{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.difficulty}
                                        onValueChange={(value) =>
                                            setData("difficulty", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">
                                                Beginner
                                            </SelectItem>
                                            <SelectItem value="intermediate">
                                                Intermediate
                                            </SelectItem>
                                            <SelectItem value="advanced">
                                                Advanced
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.difficulty && (
                                        <p className="text-sm text-red-600">
                                            {errors.difficulty}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Price ($){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData("price", e.target.value)
                                        }
                                        placeholder="0.00"
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-600">
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? "Creating..."
                                        : "Create Exercise Group"}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={route(
                                            "admin.exercise-groups.index",
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
