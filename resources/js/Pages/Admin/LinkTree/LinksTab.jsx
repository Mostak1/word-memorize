import { useRef, useState } from "react";
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
    onReorder,
}) {
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const dragIndexRef = useRef(null);

    function handleDragStart(index) {
        dragIndexRef.current = index;
    }

    function handleDragOver(e, index) {
        e.preventDefault();
        if (dragIndexRef.current === null || dragIndexRef.current === index)
            return;
        setDragOverIndex(index);
    }

    function handleDrop(e, dropIndex) {
        e.preventDefault();
        const dragIndex = dragIndexRef.current;
        if (dragIndex === null || dragIndex === dropIndex) {
            dragIndexRef.current = null;
            setDragOverIndex(null);
            return;
        }

        const newLinks = [...links];
        const [moved] = newLinks.splice(dragIndex, 1);
        newLinks.splice(dropIndex, 0, moved);

        dragIndexRef.current = null;
        setDragOverIndex(null);
        onReorder?.(newLinks);
    }

    function handleDragEnd() {
        dragIndexRef.current = null;
        setDragOverIndex(null);
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Your Links</CardTitle>
                        <CardDescription>
                            Drag rows to reorder, or use the arrows. Click the
                            image icon to add a thumbnail.
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
                            isDragOver={dragOverIndex === index}
                            onEdit={() => onEdit(link)}
                            onDelete={() => onDelete(link)}
                            onToggle={() => onToggle(link)}
                            onMoveUp={() => onMoveUp(index)}
                            onMoveDown={() => onMoveDown(index)}
                            onThumbnail={() => onThumbnail(link)}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}
