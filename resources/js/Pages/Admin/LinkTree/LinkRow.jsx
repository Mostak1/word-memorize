import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    Link2,
    Pencil,
    Trash2,
    GripVertical,
    Image,
    Eye,
    EyeOff,
    MousePointerClick,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

export default function LinkRow({
    link,
    index,
    total,
    onEdit,
    onDelete,
    onToggle,
    onMoveUp,
    onMoveDown,
    onThumbnail,
}) {
    return (
        <div
            className={`group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-all ${!link.is_active ? "opacity-60" : ""}`}
        >
            {/* Order buttons */}
            <div className="flex flex-col gap-0.5 text-muted-foreground">
                <button
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className="disabled:opacity-20 hover:text-foreground transition-colors"
                    title="Move up"
                >
                    <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <GripVertical className="h-4 w-4 opacity-30" />
                <button
                    onClick={onMoveDown}
                    disabled={index === total - 1}
                    className="disabled:opacity-20 hover:text-foreground transition-colors"
                    title="Move down"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Thumbnail or icon */}
            <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
                {link.thumbnail_full ? (
                    <img
                        src={link.thumbnail_full}
                        alt={link.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                        {link.icon || (
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                    {link.url}
                </p>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <MousePointerClick className="h-3.5 w-3.5" />
                <span>{link.clicks_total ?? 0}</span>
            </div>

            {/* Active badge */}
            <Badge
                variant={link.is_active ? "default" : "secondary"}
                className="hidden sm:flex text-xs"
            >
                {link.is_active ? "Active" : "Hidden"}
            </Badge>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onThumbnail}
                    title="Thumbnail"
                >
                    <Image className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onToggle}
                    title={link.is_active ? "Hide" : "Show"}
                >
                    {link.is_active ? (
                        <Eye className="h-3.5 w-3.5" />
                    ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onEdit}
                    title="Edit"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={onDelete}
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
