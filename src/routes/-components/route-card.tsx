import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";

export interface RouteCardProps {
  title: string;
  places: string;
  mascot: string;
  mascotEmoji: string;
  progress: { current: number; total: number };
  variant: "water" | "summit" | "culture";
}

const variantConfig = {
  water: {
    bar: "bg-secondary",
    badge: "trail" as const,
    chip: "bg-secondary/10 text-secondary border-secondary/20",
  },
  summit: {
    bar: "bg-primary",
    badge: "primary" as const,
    chip: "bg-primary/10 text-primary border-primary/20",
  },
  culture: {
    bar: "bg-text-muted",
    badge: "outline" as const,
    chip: "bg-border/60 text-text border-border",
  },
};

export function RouteCard({ title, places, mascot, mascotEmoji, progress, variant }: RouteCardProps) {
  const cfg = variantConfig[variant];
  const pct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <Card className="overflow-hidden">
      <div className="h-2 w-full bg-border" aria-hidden="true">
        <div className={cn("h-full transition-all", cfg.bar)} style={{ width: `${pct}%` }} />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant={cfg.badge} size="sm">
            {progress.current}/{progress.total}
          </Badge>
        </div>
        <CardDescription>{places}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
            cfg.chip,
          )}
        >
          <span aria-hidden="true">{mascotEmoji}</span>
          <Text size="sm" className="text-inherit">
            {mascot}
          </Text>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          Ver ruta
        </Button>
      </CardContent>
    </Card>
  );
}
