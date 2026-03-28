import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Save, Code } from "lucide-react";

function InputError({ message }) {
    if (!message) return null;
    return <p className="text-sm text-destructive mt-1">{message}</p>;
}

export default function ProfileForm({ profileForm, themes, onSubmit }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                    Name, bio, theme and custom CSS shown on your public page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="profile-title">
                            Display Name / Title
                        </Label>
                        <Input
                            id="profile-title"
                            value={profileForm.data.title}
                            onChange={(e) =>
                                profileForm.setData("title", e.target.value)
                            }
                            placeholder="My Links"
                        />
                        <InputError message={profileForm.errors.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-description">
                            Bio / Description
                        </Label>
                        <Textarea
                            id="profile-description"
                            value={profileForm.data.description}
                            onChange={(e) =>
                                profileForm.setData(
                                    "description",
                                    e.target.value,
                                )
                            }
                            placeholder="A short bio shown below your name…"
                            rows={3}
                        />
                        <InputError message={profileForm.errors.description} />
                    </div>

                    {/* Theme picker */}
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {Object.entries(themes).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() =>
                                        profileForm.setData("theme", key)
                                    }
                                    className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                                        profileForm.data.theme === key
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border hover:border-primary/50 text-muted-foreground"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <InputError message={profileForm.errors.theme} />
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
                            value={profileForm.data.custom_css}
                            onChange={(e) =>
                                profileForm.setData(
                                    "custom_css",
                                    e.target.value,
                                )
                            }
                            placeholder=".linktree-card { border-radius: 1rem; }"
                            rows={5}
                            className="font-mono text-xs"
                        />
                        <InputError message={profileForm.errors.custom_css} />
                    </div>

                    <Button type="submit" disabled={profileForm.processing}>
                        <Save className="h-4 w-4 mr-1.5" />
                        {profileForm.processing ? "Saving…" : "Save Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
