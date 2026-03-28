import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Phone, MapPin, Briefcase, User, Mail, Info } from "lucide-react";

function Avatar({ name }) {
    const initials =
        name
            ?.split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() ?? "?";

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2 text-sm">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
                <span className="text-muted-foreground">{label}: </span>
                <span className="font-medium text-popover-foreground break-all">
                    {value}
                </span>
            </div>
        </div>
    );
}

export default function UserInfoTooltip({ user, children }) {
    const hasDetails =
        user.phone_number ||
        user.profession ||
        user.location ||
        user.gender ||
        user.bio;

    if (!hasDetails) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-default">{children}</span>
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    align="start"
                    className="w-72 p-0 shadow-lg bg-popover text-popover-foreground border border-border"
                    sideOffset={10}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-border p-3">
                        <Avatar name={user.name} />
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-sm text-popover-foreground">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 p-3">
                        <DetailRow
                            icon={Phone}
                            label="Phone"
                            value={user.phone_number}
                        />
                        <DetailRow
                            icon={Briefcase}
                            label="Profession"
                            value={user.profession}
                        />
                        <DetailRow
                            icon={MapPin}
                            label="Location"
                            value={user.location}
                        />
                        <DetailRow
                            icon={User}
                            label="Gender"
                            value={
                                user.gender
                                    ? user.gender.charAt(0).toUpperCase() +
                                      user.gender.slice(1)
                                    : null
                            }
                        />
                        {user.bio && (
                            <div className="flex items-start gap-2 text-sm">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <p className="line-clamp-2 text-muted-foreground italic text-xs">
                                    {user.bio}
                                </p>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
