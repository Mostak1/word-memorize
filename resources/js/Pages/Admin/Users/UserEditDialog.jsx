import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { User, Mail, Phone, Loader2 } from "lucide-react";

export default function UserEditDialog({ user, open, onOpenChange }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone_number: "",
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Sync form when user changes
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name ?? "",
                email: user.email ?? "",
                phone_number: user.phone_number ?? "",
            });
            setErrors({});
        }
    }, [user]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = () => {
        if (!user) return;
        setProcessing(true);

        router.patch(
            route("admin.users.update", user.id),
            {
                name: form.name,
                email: form.email,
                phone_number: form.phone_number,
                // pass through required fields unchanged
                role: user.role,
                approve_status: user.approve_status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${form.name}'s info updated successfully.`);
                    onOpenChange(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error("Please fix the errors below.");
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit User Info</DialogTitle>
                    <DialogDescription>
                        Update basic information for{" "}
                        <span className="font-semibold">{user?.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="edit-name"
                                value={form.name}
                                onChange={handleChange("name")}
                                placeholder="Full name"
                                className="pl-8"
                                autoFocus
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="edit-email"
                                type="email"
                                value={form.email}
                                onChange={handleChange("email")}
                                placeholder="email@example.com"
                                className="pl-8"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="edit-phone"
                                type="tel"
                                value={form.phone_number}
                                onChange={handleChange("phone_number")}
                                placeholder="+880 1234 567890"
                                className="pl-8"
                            />
                        </div>
                        {errors.phone_number && (
                            <p className="text-xs text-destructive">
                                {errors.phone_number}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={processing}>
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
