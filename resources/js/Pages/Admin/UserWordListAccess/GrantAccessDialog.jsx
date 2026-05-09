import { useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";

export default function GrantAccessDialog({ users, categories }) {
    const [open, setOpen] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        user_id: "",
        word_list_category_id: "",
    });

    const filteredUsers = useMemo(() => {
        if (!userSearch) return users;
        const search = userSearch.toLowerCase();
        return users.filter(user => 
            user.name.toLowerCase().includes(search) || 
            user.email.toLowerCase().includes(search)
        );
    }, [users, userSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.user-wordlist-access.store"), {
            onSuccess: () => {
                setOpen(false);
                reset();
                setUserSearch("");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
                reset();
                clearErrors();
                setUserSearch("");
            }
        }}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-1" />
                    Grant Access
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Grant Word List Access</DialogTitle>
                    <DialogDescription>
                        Manually grant a user access to a specific word list category.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <InputLabel htmlFor="user_id" value="User" />
                        <Select
                            value={data.user_id}
                            onValueChange={(v) => setData("user_id", v)}
                        >
                            <SelectTrigger id="user_id">
                                <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                <div className="p-2 sticky top-0 bg-popover z-10">
                                    <TextInput
                                        placeholder="Search user..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="h-8 text-xs"
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {filteredUsers.length === 0 ? (
                                    <div className="py-2 px-2 text-xs text-center text-muted-foreground">
                                        No users found
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.user_id} />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="category_id" value="Category" />
                        <Select
                            value={data.word_list_category_id}
                            onValueChange={(v) => setData("word_list_category_id", v)}
                        >
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.word_list_category_id} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Granting...
                                </>
                            ) : (
                                "Grant Access"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
