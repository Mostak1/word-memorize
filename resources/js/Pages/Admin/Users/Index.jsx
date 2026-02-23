import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
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
import { Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersIndex({ users }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [toggleAdminDialogOpen, setToggleAdminDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleToggleAdminClick = (user) => {
        setSelectedUser(user);
        setToggleAdminDialogOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const confirmToggleAdmin = () => {
        if (selectedUser) {
            router.post(
                route("admin.users.toggle-admin", selectedUser.id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            `${selectedUser.name}'s admin status has been updated`,
                        );
                        setToggleAdminDialogOpen(false);
                        setSelectedUser(null);
                    },
                    onError: () => {
                        toast.error("Failed to update admin status");
                    },
                },
            );
        }
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(route("admin.users.destroy", selectedUser.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${selectedUser.name} has been deleted`);
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                },
                onError: () => {
                    toast.error("Failed to delete user");
                },
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Users" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="text-muted-foreground">
                            Manage all users in the system
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users ({users?.total || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.data?.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.is_admin ? (
                                                    <Badge variant="default">
                                                        <Shield className="mr-1 h-3 w-3" />
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        User
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleToggleAdminClick(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        Toggle Admin
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {users?.links && users.links.length > 3 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {users.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={
                                            link.active ? "default" : "outline"
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.visit(link.url)
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Toggle Admin Confirmation Dialog */}
            <AlertDialog
                open={toggleAdminDialogOpen}
                onOpenChange={setToggleAdminDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Admin Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to{" "}
                            {selectedUser?.is_admin ? "remove" : "grant"} admin
                            privileges {selectedUser?.is_admin ? "from" : "to"}{" "}
                            <span className="font-semibold">
                                {selectedUser?.name}
                            </span>
                            ? This will change their access level immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmToggleAdmin}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete User Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">
                                {selectedUser?.name}
                            </span>
                            ? This action cannot be undone and will permanently
                            remove the user and all their data from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
