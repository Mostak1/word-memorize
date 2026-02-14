import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, ChevronUp } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

export function UserDropdown() {
    const { auth } = usePage().props;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-200 transition">
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback>
                            {auth.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">
                        {auth.user.name}
                    </span>
                    <ChevronUp className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-56 rounded-lg"
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback>
                                {auth.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="truncate font-semibold">
                                {auth.user.name}
                            </span>
                            <span className="truncate text-xs">
                                {auth.user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="w-full">
                    <Link
                        href={route("admin.profile.edit")}
                        className="flex w-full items-center gap-2 cursor-pointer"
                    >
                        Profile
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="w-full">
                    <Link
                        href={route("admin.settings.index")}
                        className="flex w-full items-center gap-2 cursor-pointer"
                    >
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="w-full">
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2 text-red-600 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
