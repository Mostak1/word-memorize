import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    User,
    BookMarked,
    Trophy,
    Flag,
} from "lucide-react";

/**
 * Sidebar Configuration
 *
 * This file centralizes all sidebar configuration for easy modification.
 * To add new menu items, simply add them to the appropriate section below.
 */

export const sidebarConfig = {
    // Branding section at the top of the sidebar
    branding: {
        title: "Vocapix",
        subtitle: "Admin Panel",
        icon: BookOpen,
        homeRoute: "admin.dashboard",
    },

    // Main navigation menu groups
    menuGroups: [
        {
            title: "Dashboard",
            items: [
                {
                    name: "Overview",
                    route: "admin.dashboard",
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            title: "Management",
            items: [
                {
                    name: "Users",
                    route: "admin.users.index",
                    icon: Users,
                },
                {
                    name: "Word Lists",
                    route: "admin.word-lists.index",
                    icon: BookOpen,
                },
                {
                    name: "Review Words",
                    route: "admin.review-words.index",
                    icon: BookMarked,
                },
                {
                    name: "Mastered Words",
                    route: "admin.mastered-words.index",
                    icon: Trophy,
                },
                {
                    name: "Error Reports",
                    route: "admin.error-reports.index",
                    icon: Flag,
                },
            ],
        },
        {
            title: "System",
            items: [
                {
                    name: "Settings",
                    route: "admin.settings.index",
                    icon: Settings,
                },
            ],
        },
    ],

    // User dropdown menu items (appears in footer)
    userMenuItems: [
        {
            name: "Admin Profile",
            route: "admin.profile.edit",
            icon: User,
        },
        {
            name: "User Dashboard",
            route: "admin.dashboard",
            icon: LayoutDashboard,
        },
    ],
};