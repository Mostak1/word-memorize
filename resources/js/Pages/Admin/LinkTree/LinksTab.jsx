import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link2, Plus } from "lucide-react";
import LinkRow from "./LinkRow";

export default function LinksTab({
    links,
    onAddLink,
    onEdit,
    onDelete,
    onToggle,
    onMoveUp,
    onMoveDown,
    onThumbnail,
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Your Links</CardTitle>
                        <CardDescription>
                            Use the arrows to reorder. Click the image icon on a
                            link to add a thumbnail.
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={onAddLink}>
                        <Plus className="h-4 w-4 mr-1.5" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {links.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                        <Link2 className="h-10 w-10 opacity-30" />
                        <p className="text-sm">
                            No links yet. Add your first link!
                        </p>
                        <Button size="sm" onClick={onAddLink}>
                            <Plus className="h-4 w-4 mr-1.5" /> Add Link
                        </Button>
                    </div>
                ) : (
                    links.map((link, index) => (
                        <LinkRow
                            key={link.id}
                            link={link}
                            index={index}
                            total={links.length}
                            onEdit={() => onEdit(link)}
                            onDelete={() => onDelete(link)}
                            onToggle={() => onToggle(link)}
                            onMoveUp={() => onMoveUp(index)}
                            onMoveDown={() => onMoveDown(index)}
                            onThumbnail={() => onThumbnail(link)}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
