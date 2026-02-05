import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/UserDropdown"; // ✅ import

export default function AdminLayout({ children }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1">
                    <div className="flex h-14 items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex-1" />

                        {/* Theme toggle */}
                        <ThemeToggle />

                        {/* User dropdown next to theme toggle */}
                        <UserDropdown />
                    </div>

                    <div className="flex-1 space-y-4 p-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
