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
import { Switch } from "@/Components/ui/switch";
import { Check, Loader2 } from "lucide-react";
import { PLATFORMS, SOCIAL_ICONS_SVG } from "./linkTreeConstants";

// ── debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 800) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function SocialLinksTab({ profile }) {
    const initLinks = () => {
        const existing = profile.social_links ?? [];
        return PLATFORMS.map((p, i) => {
            const found = existing.find((s) => s.platform === p.key);
            return {
                platform: p.key,
                url: found?.url ?? "",
                is_active: found?.is_active ?? false,
                order: found?.order ?? i,
            };
        });
    };

    const [socialLinks, setSocialLinks] = useState(initLinks);
    const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
    const isFirstRender = useRef(true);

    const debouncedLinks = useDebounce(socialLinks, 800);

    // Auto-save whenever debounced value changes — skip the initial render
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setSaveStatus("saving");
        router.patch(
            route("admin.link-tree.social-links.update"),
            { social_links: debouncedLinks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaveStatus("saved");
                    setTimeout(() => setSaveStatus("idle"), 2000);
                },
                onError: () => setSaveStatus("idle"),
            },
        );
    }, [debouncedLinks]);

    function handleUrlChange(platform, value) {
        setSocialLinks((prev) =>
            prev.map((s) =>
                s.platform === platform
                    ? {
                          ...s,
                          url: value,
                          // auto-enable when URL is typed, auto-disable when cleared
                          is_active: value.trim() !== "",
                      }
                    : s,
            ),
        );
    }

    function handleToggle(platform) {
        setSocialLinks((prev) =>
            prev.map((s) =>
                s.platform === platform ? { ...s, is_active: !s.is_active } : s,
            ),
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Social Icons</CardTitle>
                        <CardDescription>
                            Add your social profiles. Active icons appear on
                            your public page below your bio.
                        </CardDescription>
                    </div>

                    {/* Auto-save status */}
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

            <CardContent className="space-y-3">
                {PLATFORMS.map((p) => {
                    const link = socialLinks.find((s) => s.platform === p.key);
                    return (
                        <div
                            key={p.key}
                            className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                        >
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-foreground flex-shrink-0">
                                {SOCIAL_ICONS_SVG[p.key]}
                            </div>
                            <span className="text-sm font-medium w-24 flex-shrink-0">
                                {p.label}
                            </span>
                            <Input
                                value={link?.url ?? ""}
                                onChange={(e) =>
                                    handleUrlChange(p.key, e.target.value)
                                }
                                placeholder={
                                    p.key === "email"
                                        ? "you@example.com"
                                        : "https://..."
                                }
                                className="flex-1 h-8 text-sm"
                            />
                            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                <Switch
                                    checked={link?.is_active ?? false}
                                    onCheckedChange={() => handleToggle(p.key)}
                                    disabled={!link?.url}
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    {link?.is_active ? "On" : "Off"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
