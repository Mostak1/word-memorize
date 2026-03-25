import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
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
import { User, Lock, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Reusable password input with show/hide toggle ────────────────────────────
function PasswordInput({ id, value, onChange, placeholder, required }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}

export default function AdminProfile({ auth }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        processing: processingProfile,
        errors: profileErrors,
    } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: processingPassword,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        patchProfile(route("admin.profile.update"), {
            preserveScroll: true,
            onSuccess: () => toast.success("Profile updated successfully"),
            onError: () => toast.error("Failed to update profile"),
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // ✅ Fixed: was "admin.password.update" → correct route is "admin.profile.password.update"
        putPassword(route("admin.profile.password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Password updated successfully");
                resetPassword();
            },
            onError: () => toast.error("Failed to update password"),
        });
    };

    const handleDeleteAccount = () => {
        toast.error("Account deletion is not available for admin users");
        setDeleteDialogOpen(false);
    };

    return (
        <AdminLayout>
            <Head title="Admin Profile" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Profile Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your admin account settings
                    </p>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-6"
                        >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) =>
                                            setProfileData(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Your name"
                                        required
                                    />
                                    {profileErrors.name && (
                                        <p className="text-sm text-destructive">
                                            {profileErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) =>
                                            setProfileData(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                    {profileErrors.email && (
                                        <p className="text-sm text-destructive">
                                            {profileErrors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Account info */}
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <h4 className="mb-3 font-semibold">
                                    Account Information
                                </h4>
                                <dl className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            User ID
                                        </dt>
                                        <dd className="font-medium">
                                            #{auth.user.id}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Account Type
                                        </dt>
                                        {/* ✅ Fixed: was auth.user.is_admin (boolean) → now auth.user.role (string) */}
                                        <dd className="font-medium capitalize">
                                            {auth.user.role}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Member Since
                                        </dt>
                                        <dd className="font-medium">
                                            {new Date(
                                                auth.user.created_at,
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processingProfile}
                                >
                                    {processingProfile
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Update Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Update Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handlePasswordSubmit}
                            className="space-y-6"
                        >
                            <div className="grid gap-6 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">
                                        Current Password
                                    </Label>
                                    <PasswordInput
                                        id="current_password"
                                        value={passwordData.current_password}
                                        onChange={(e) =>
                                            setPasswordData(
                                                "current_password",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter current password"
                                        required
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="text-sm text-destructive">
                                            {passwordErrors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        New Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        value={passwordData.password}
                                        onChange={(e) =>
                                            setPasswordData(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter new password"
                                        required
                                    />
                                    {passwordErrors.password && (
                                        <p className="text-sm text-destructive">
                                            {passwordErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm New Password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        value={
                                            passwordData.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setPasswordData(
                                                "password_confirmation",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    {passwordErrors.password_confirmation && (
                                        <p className="text-sm text-destructive">
                                            {
                                                passwordErrors.password_confirmation
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processingPassword}
                                >
                                    {processingPassword
                                        ? "Updating..."
                                        : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Delete Account */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Once your account is deleted, all of its
                                resources and data will be permanently deleted.
                                Before deleting your account, please download
                                any data or information that you wish to retain.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
