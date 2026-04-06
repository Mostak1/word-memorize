import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { MousePointerClick, TrendingUp, Activity } from "lucide-react";
import ClicksChart from "./ClicksChart";

function StatCard({ title, value, subtitle, icon, colorClass }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`rounded-full p-2 ${colorClass}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsTab({ links, clicksChart }) {
    const totalClicks = links.reduce((s, l) => s + (l.clicks_total ?? 0), 0);
    const clicks7d = links.reduce((s, l) => s + (l.clicks_7d ?? 0), 0);

    return (
        <div className="space-y-4">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="Total Clicks"
                    value={totalClicks.toLocaleString()}
                    subtitle="All time"
                    colorClass="bg-blue-50 dark:bg-blue-950"
                    icon={
                        <MousePointerClick className="h-4 w-4 text-blue-600" />
                    }
                />
                <StatCard
                    title="Last 7 Days"
                    value={clicks7d.toLocaleString()}
                    subtitle="Across all links"
                    colorClass="bg-green-50 dark:bg-green-950"
                    icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                />
                <StatCard
                    title="Active Links"
                    value={links.filter((l) => l.is_active).length}
                    subtitle={`of ${links.length} total`}
                    colorClass="bg-purple-50 dark:bg-purple-950"
                    icon={<Activity className="h-4 w-4 text-purple-600" />}
                />
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Clicks — Last 30 Days</CardTitle>
                    <CardDescription>
                        Daily click volume across all links
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ClicksChart data={clicksChart} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>30 days ago</span>
                        <span>Today</span>
                    </div>
                </CardContent>
            </Card>

            {/* Per-link breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Per-Link Breakdown</CardTitle>
                    <CardDescription>
                        Click performance for each link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {links.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No links to show stats for.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {[...links]
                                .sort(
                                    (a, b) =>
                                        (b.clicks_total ?? 0) -
                                        (a.clicks_total ?? 0),
                                )
                                .map((link) => {
                                    const pct =
                                        totalClicks > 0
                                            ? Math.round(
                                                  ((link.clicks_total ?? 0) /
                                                      totalClicks) *
                                                      100,
                                              )
                                            : 0;
                                    return (
                                        <div
                                            key={link.id}
                                            className="space-y-1"
                                        >
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {link.thumbnail_full ? (
                                                        <img
                                                            src={
                                                                link.thumbnail_full
                                                            }
                                                            alt=""
                                                            className="w-5 h-5 rounded object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <span className="text-base flex-shrink-0">
                                                            {link.icon || "🔗"}
                                                        </span>
                                                    )}
                                                    <span className="font-medium truncate">
                                                        {link.title}
                                                    </span>
                                                    {!link.is_active && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Hidden
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                                                    <span>
                                                        {link.clicks_7d ?? 0} /
                                                        7d
                                                    </span>
                                                    <span>
                                                        {link.clicks_30d ?? 0} /
                                                        30d
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        {(
                                                            link.clicks_total ??
                                                            0
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
