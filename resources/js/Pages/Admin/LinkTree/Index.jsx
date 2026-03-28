import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Link2,
    Plus,
    Globe,
    ExternalLink,
    User,
    Share2,
    Image,
    BarChart3,
} from "lucide-react";

// Components
import FlashMessage from "@/Components/FlashMessage";
import LinksTab from "./LinksTab";
import ProfileForm from "./ProfileForm";
import SocialLinksTab from "./SocialLinksTab";
import ImageUploadCard from "./ImageUploadCard";
import AnalyticsTab from "./AnalyticsTab";

// Dialogs
import LinkDialog from "./dialogs/LinkDialog";
import ThumbnailDialog from "./dialogs/ThumbnailDialog";
import DeleteLinkDialog from "./dialogs/DeleteLinkingDialog";

export default function Index({
    profile,
    links: initialLinks,
    clicksChart,
    themes,
    flash,
}) {
    const [links, setLinks] = useState(initialLinks ?? []);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [deletingLink, setDeletingLink] = useState(null);
    const [thumbnailLink, setThumbnailLink] = useState(null);

    const profileForm = useForm({
        title: profile.title ?? "",
        description: profile.description ?? "",
        theme: profile.theme ?? "default",
        custom_css: profile.custom_css ?? "",
    });

    function submitProfile(e) {
        e.preventDefault();
        profileForm.patch(route("admin.link-tree.profile.update"));
    }

    function handleToggle(link) {
        router.patch(
            route("admin.link-tree.links.toggle", link.id),
            {},
            { preserveScroll: true },
        );
    }

    function handleDelete(link) {
        router.delete(route("admin.link-tree.links.destroy", link.id), {
            preserveScroll: true,
            onSuccess: () => {
                setLinks((prev) => prev.filter((l) => l.id !== link.id));
                setDeletingLink(null);
            },
        });
    }

    function moveLink(index, direction) {
        const newLinks = [...links];
        const target = index + direction;
        if (target < 0 || target >= newLinks.length) return;
        [newLinks[index], newLinks[target]] = [
            newLinks[target],
            newLinks[index],
        ];
        setLinks(newLinks);
        router.post(
            route("admin.link-tree.links.reorder"),
            { links: newLinks.map((l, i) => ({ id: l.id, order: i })) },
            { preserveScroll: true },
        );
    }

    function openAddDialog() {
        setEditingLink(null);
        setShowLinkDialog(true);
    }

    const publicUrl = route("link-tree.show");

    return (
        <AdminLayout>
            <Head title="Link Tree" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Link2 className="h-7 w-7" /> Link Tree
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Manage your public profile and links
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Globe className="h-4 w-4 mr-1.5" />
                                View Public Page
                                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                            </a>
                        </Button>
                        <Button size="sm" onClick={openAddDialog}>
                            <Plus className="h-4 w-4 mr-1.5" /> Add Link
                        </Button>
                    </div>
                </div>

                <FlashMessage flash={flash} />

                <Tabs defaultValue="links" className="space-y-6">
                    <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 p-1">
                        <TabsTrigger value="links" className="gap-1.5">
                            <Link2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Links</span>
                            <Badge
                                variant="secondary"
                                className="text-xs h-4 px-1"
                            >
                                {links.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="gap-1.5">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="social" className="gap-1.5">
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Social</span>
                        </TabsTrigger>
                        <TabsTrigger value="images" className="gap-1.5">
                            <Image className="h-4 w-4" />
                            <span className="hidden sm:inline">Images</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-1.5">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="links" className="space-y-4">
                        <LinksTab
                            links={links}
                            onAddLink={openAddDialog}
                            onEdit={(link) => {
                                setEditingLink(link);
                                setShowLinkDialog(true);
                            }}
                            onDelete={(link) => setDeletingLink(link)}
                            onToggle={handleToggle}
                            onMoveUp={(i) => moveLink(i, -1)}
                            onMoveDown={(i) => moveLink(i, 1)}
                            onThumbnail={(link) => setThumbnailLink(link)}
                        />
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-4">
                        <ProfileForm
                            profileForm={profileForm}
                            themes={themes}
                            onSubmit={submitProfile}
                        />
                    </TabsContent>

                    <TabsContent value="social">
                        <SocialLinksTab profile={profile} />
                    </TabsContent>

                    <TabsContent value="images">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ImageUploadCard
                                title="Profile Image"
                                description="Square image shown as your avatar. Recommended: 400×400px."
                                currentImage={profile.profile_image_full}
                                uploadRoute="admin.link-tree.profile.image.upload"
                                deleteRoute="admin.link-tree.profile.image.delete"
                            />
                            <ImageUploadCard
                                title="Cover / Banner Image"
                                description="Wide banner shown at the top of your page. Recommended: 1200×400px."
                                currentImage={profile.cover_image_full}
                                uploadRoute="admin.link-tree.profile.cover.upload"
                                deleteRoute="admin.link-tree.profile.cover.delete"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <AnalyticsTab links={links} clicksChart={clicksChart} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialogs */}
            <LinkDialog
                key={editingLink?.id ?? "new"}
                open={showLinkDialog}
                onClose={() => {
                    setShowLinkDialog(false);
                    setEditingLink(null);
                }}
                editingLink={editingLink}
                onLinkAdded={(link) => setLinks((prev) => [...prev, link])}
                onLinkUpdated={(updated) =>
                    setLinks((prev) =>
                        prev.map((l) => (l.id === updated.id ? updated : l)),
                    )
                }
            />

            <ThumbnailDialog
                open={!!thumbnailLink}
                onClose={() => {
                    setThumbnailLink(null);
                    router.reload({ preserveScroll: true });
                }}
                link={thumbnailLink}
            />

            <DeleteLinkDialog
                link={deletingLink}
                onConfirm={handleDelete}
                onCancel={() => setDeletingLink(null)}
            />
        </AdminLayout>
    );
}
