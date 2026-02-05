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
        homeRoute: "/", // Route when clicking the logo
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
                    // badge: "New", // Optional: add a badge
                },
                // Add more dashboard items here
                // {
                //     name: "Analytics",
                //     route: "admin.analytics",
                //     icon: BarChart3,
                // },
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
                // Add more management items here
                // {
                //     name: "Content",
                //     route: "admin.content.index",
                //     icon: FileText,
                // },
                // {
                //     name: "Roles & Permissions",
                //     route: "admin.roles.index",
                //     icon: Shield,
                // },
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
                // Add more system items here
                // {
                //     name: "Notifications",
                //     route: "admin.notifications.index",
                //     icon: Bell,
                // },
            ],
        },
        // Add more groups here
        // {
        //     title: "Reports",
        //     items: [
        //         {
        //             name: "User Reports",
        //             route: "admin.reports.users",
        //             icon: BarChart3,
        //         },
        //     ],
        // },
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
        // Add more user menu items here
        // {
        //     name: "My Settings",
        //     route: "admin.my-settings",
        //     icon: Settings,
        // },
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
