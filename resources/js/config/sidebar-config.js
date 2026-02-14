import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    User,
    FileText,
    BarChart3,
    Shield,
    Bell,
    BookMarked,
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
        title: "Word Game",
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
                    name: "Exercise Groups",
                    route: "admin.exercise-groups.index",
                    icon: BookOpen,
                },
                {
                    name: "Review Words",
                    route: "admin.review-words.index",
                    icon: BookMarked,
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

/**
 * How to add new menu items:
 *
 * 1. Import the icon from lucide-react at the top
 * 2. Add the item to the appropriate group
 * 3. Ensure the route name matches your Laravel route
 *
 * Example:
 * {
 *     name: "New Feature",
 *     route: "admin.feature.index",
 *     icon: IconName,
 *     badge: "Beta", // optional
 * }
 */
