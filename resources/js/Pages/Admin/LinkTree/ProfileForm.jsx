import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Code, Check, Loader2 } from "lucide-react";

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 800) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfileForm({ profile, themes }) {
    const [data, setData] = useState({
        title: profile.title ?? "",
        description: profile.description ?? "",
        theme: profile.theme ?? "default",
        custom_css: profile.custom_css ?? "",
    });
    const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
    const [errors, setErrors] = useState({});
    const isFirstRender = useRef(true);

    const debouncedData = useDebounce(data, 800);

    // Auto-save on debounced change — skip the very first render
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setSaveStatus("saving");
        router.patch(route("admin.link-tree.profile.update"), debouncedData, {
            preserveScroll: true,
            onSuccess: () => {
                setSaveStatus("saved");
                setErrors({});
                setTimeout(() => setSaveStatus("idle"), 2000);
            },
            onError: (errs) => {
                setErrors(errs);
                setSaveStatus("idle");
            },
        });
    }, [debouncedData]);

    function set(field, value) {
        setData((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Name, bio, theme and custom CSS shown on your public
                            page. Changes save automatically.
                        </CardDescription>
                    </div>

                    {/* Auto-save status indicator */}
                    <div className="flex items-center gap-1.5 text-xs min-w-[72px] justify-end">
                        {saveStatus === "saving" && (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Saving…
                                </span>
                            </>
                        )}
                        {saveStatus === "saved" && (
                            <>
                                <Check className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-green-500">Saved</span>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Display Name */}
                <div className="space-y-2">
                    <Label htmlFor="profile-title">Display Name / Title</Label>
                    <Input
                        id="profile-title"
                        value={data.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="My Links"
                    />
                    {errors.title && (
                        <p className="text-sm text-destructive">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <Label htmlFor="profile-description">
                        Bio / Description
                    </Label>
                    <Textarea
                        id="profile-description"
                        value={data.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="A short bio shown below your name…"
                        rows={3}
                    />
                    {errors.description && (
                        <p className="text-sm text-destructive">
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Theme picker */}
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.entries(themes).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => set("theme", key)}
                                className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                                    data.theme === key
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-primary/50 text-muted-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {errors.theme && (
                        <p className="text-sm text-destructive">
                            {errors.theme}
                        </p>
                    )}
                </div>

                {/* Custom CSS */}
                <div className="space-y-2">
                    <Label
                        htmlFor="custom-css"
                        className="flex items-center gap-1.5"
                    >
                        <Code className="h-4 w-4" />
                        Custom CSS{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="custom-css"
                        value={data.custom_css}
                        onChange={(e) => set("custom_css", e.target.value)}
                        placeholder=".linktree-card { border-radius: 1rem; }"
                        rows={5}
                        className="font-mono text-xs"
                    />
                    {errors.custom_css && (
                        <p className="text-sm text-destructive">
                            {errors.custom_css}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
