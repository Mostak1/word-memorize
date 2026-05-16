import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        site_name: settings.site_name,
        site_email: settings.site_email,
        referral_system_enabled: Boolean(settings.referral_system_enabled),
        referral_new_user_discount_percent:
            settings.referral_new_user_discount_percent ?? 10,
        referral_referrer_discount_percent:
            settings.referral_referrer_discount_percent ?? 10,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.settings.update"));
    };

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your application settings
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="site_name">Site Name</Label>
                                <Input
                                    id="site_name"
                                    value={data.site_name}
                                    onChange={(e) =>
                                        setData("site_name", e.target.value)
                                    }
                                />
                                {errors.site_name && (
                                    <p className="text-sm text-red-600">
                                        {errors.site_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_email">Site Email</Label>
                                <Input
                                    id="site_email"
                                    type="email"
                                    value={data.site_email}
                                    onChange={(e) =>
                                        setData("site_email", e.target.value)
                                    }
                                />
                                {errors.site_email && (
                                    <p className="text-sm text-red-600">
                                        {errors.site_email}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={processing}>
                                Save Settings
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Referral Discounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="referral_system_enabled">
                                        Enable referral system
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Shows referral codes, registration input,
                                        and discount credits when enabled.
                                    </p>
                                </div>
                                <button
                                    id="referral_system_enabled"
                                    type="button"
                                    role="switch"
                                    aria-checked={
                                        data.referral_system_enabled
                                    }
                                    onClick={() =>
                                        setData(
                                            "referral_system_enabled",
                                            !data.referral_system_enabled,
                                        )
                                    }
                                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                                        data.referral_system_enabled
                                            ? "bg-[#E5201C]"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                            data.referral_system_enabled
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="referral_new_user_discount_percent">
                                        New user discount %
                                    </Label>
                                    <Input
                                        id="referral_new_user_discount_percent"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            data.referral_new_user_discount_percent
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "referral_new_user_discount_percent",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.referral_new_user_discount_percent && (
                                        <p className="text-sm text-red-600">
                                            {
                                                errors.referral_new_user_discount_percent
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referral_referrer_discount_percent">
                                        Referrer reward %
                                    </Label>
                                    <Input
                                        id="referral_referrer_discount_percent"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            data.referral_referrer_discount_percent
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "referral_referrer_discount_percent",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.referral_referrer_discount_percent && (
                                        <p className="text-sm text-red-600">
                                            {
                                                errors.referral_referrer_discount_percent
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" disabled={processing}>
                                Save Referral Settings
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
