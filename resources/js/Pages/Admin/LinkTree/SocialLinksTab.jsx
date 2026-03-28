import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Save } from "lucide-react";
import { PLATFORMS, SOCIAL_ICONS_SVG } from "./linkTreeConstants";

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
    const [saving, setSaving] = useState(false);

    function handleUrlChange(platform, value) {
        setSocialLinks((prev) =>
            prev.map((s) =>
                s.platform === platform ? { ...s, url: value } : s,
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

    function handleSave() {
        setSaving(true);
        router.patch(
            route("admin.link-tree.social-links.update"),
            { social_links: socialLinks },
            { preserveScroll: true, onFinish: () => setSaving(false) },
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Social Icons</CardTitle>
                <CardDescription>
                    Add your social profiles. Active icons appear on your public
                    page below your bio.
                </CardDescription>
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
                            <Switch
                                checked={link?.is_active ?? false}
                                onCheckedChange={() => handleToggle(p.key)}
                                disabled={!link?.url}
                            />
                        </div>
                    );
                })}

                <div className="pt-2">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-1.5" />
                        {saving ? "Saving…" : "Save Social Icons"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
