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
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/admin/settings");
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
            </div>
        </AdminLayout>
    );
}
