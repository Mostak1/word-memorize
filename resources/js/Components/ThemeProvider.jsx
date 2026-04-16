import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
    theme: "light",
    setTheme: () => null,
    darkModeUnlocked: false,
    setDarkModeUnlocked: () => null,
    isAdmin: false,
});

export function ThemeProvider({
    children,
    defaultTheme = "light",
    storageKey = "vite-ui-theme",
    isAdmin = false,
    ...props
}) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem(storageKey) || defaultTheme,
    );
    const [darkModeUnlocked, setDarkModeUnlocked] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Wait until we know if dark mode is unlocked before enforcing theme rules
        if (!isInitialized && !isAdmin) {
            // First apply whatever theme user has saved without enforcing yet
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(theme);
            return;
        }

        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        let activeTheme = theme;

        // Force light mode if dark mode is not unlocked, except for admins
        if (!darkModeUnlocked && activeTheme === "dark" && !isAdmin) {
            activeTheme = "light";
            localStorage.setItem(storageKey, "light");
            setTheme("light");
        }

        if (activeTheme === "system") {
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches
                ? "dark"
                : "light";

            // Force light system if dark not unlocked, except for admins
            if (!darkModeUnlocked && systemTheme === "dark" && !isAdmin) {
                root.classList.add("light");
                return;
            }

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(activeTheme);
    }, [theme, darkModeUnlocked, isAdmin, isInitialized]);

    const value = {
        theme,
        setTheme: (theme) => {
            // Block dark theme if not unlocked, except for admins
            if (!darkModeUnlocked && theme === "dark" && !isAdmin) {
                return false;
            }

            localStorage.setItem(storageKey, theme);
            setTheme(theme);
            return true;
        },
        darkModeUnlocked,
        setDarkModeUnlocked: (value) => {
            setDarkModeUnlocked(value);
            setIsInitialized(true);
        },
        isAdmin,
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
