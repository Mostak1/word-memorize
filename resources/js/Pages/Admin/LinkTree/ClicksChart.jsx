export default function ClicksChart({ data }) {
    if (!data?.length) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No click data yet
            </div>
        );
    }

    const max = Math.max(...data.map((d) => d.total), 1);
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        const found = data.find((d) => d.date === key);
        days.push({ date: key, total: found?.total ?? 0 });
    }

    return (
        <div className="flex items-end gap-[2px] h-28 w-full">
            {days.map((d, i) => (
                <div
                    key={i}
                    title={`${d.date}: ${d.total} click${d.total !== 1 ? "s" : ""}`}
                    className="flex-1 rounded-sm bg-primary/80 hover:bg-primary transition-colors cursor-default"
                    style={{
                        height: `${Math.max((d.total / max) * 100, d.total > 0 ? 4 : 2)}%`,
                    }}
                />
            ))}
        </div>
    );
}
