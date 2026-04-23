import { Moon, Sun, Lock, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/Components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { useTheme } from "@/Components/ThemeProvider";
import { Link, usePage } from "@inertiajs/react";
import { useTranslation } from "@/Contexts/LanguageContext";

export function ThemeToggle() {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const { setTheme, darkModeUnlocked, isAdmin } = useTheme();
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

    // Admin users always have dark mode unlocked (final safeguard)
    const effectiveDarkModeUnlocked =
        user?.role === "admin" || isAdmin ? true : darkModeUnlocked;

    const handleThemeChange = (newTheme) => {
        if (newTheme === "dark" && !effectiveDarkModeUnlocked) {
            setPurchaseDialogOpen(true);
            return;
        }

        setTheme(newTheme);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-red-900 hover:bg-slate-100 hover:text-red-900 dark:text-red-100 dark:hover:bg-slate-800 dark:hover:text-red-100"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] text-red-900 transition-all dark:text-red-100 dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] text-red-900 transition-all dark:text-red-400 dark:rotate-0 dark:scale-100 rotate-90 scale-0" />
                        <span className="sr-only">{t("theme.toggle")}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => handleThemeChange("light")}
                    >
                        {t("theme.light")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                        <div className="flex items-center justify-between w-full">
                            {t("theme.dark")}
                            {!effectiveDarkModeUnlocked && (
                                <Lock className="h-3.5 w-3.5 ml-2 opacity-70" />
                            )}
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={purchaseDialogOpen}
                onOpenChange={setPurchaseDialogOpen}
            >
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5 text-indigo-500" />
                            {t("theme.unlock_dark_mode")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center space-y-3">
                        <p className="text-sm text-gray-500">
                            {t("theme.dark_mode_desc")}
                        </p>
                        <Link
                            href={route("shop", { tab: "xp" })}
                            className="block w-full"
                        >
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                {t("theme.go_to_shop")}
                            </Button>
                        </Link>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full">
                                {t("theme.maybe_later")}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
