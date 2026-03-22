import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AgencyCode } from "@/hooks/useAgency";

interface GroupPerformanceProps {
  codes: AgencyCode[];
}

export function GroupPerformance({ codes }: GroupPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Group Performance</CardTitle>
        <CardDescription>
          Usage breakdown by access group
        </CardDescription>
      </CardHeader>
      <CardContent>
        {codes.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No groups created yet
          </p>
        ) : (
          <div className="space-y-4">
            {codes.slice(0, 10).map((code) => {
              const usagePercent = Math.round(
                (code.uses_count / code.max_uses) * 100
              );
              const isActive =
                code.is_active &&
                (!code.expires_at || new Date(code.expires_at) > new Date());

              return (
                <div
                  key={code.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {code.group_name || code.name || code.code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {code.uses_count} of {code.max_uses} used
                    </p>
                  </div>
                  <div className="w-32">
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                  <div className="text-right w-16">
                    <span className="font-medium">{usagePercent}%</span>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-green-500" : "bg-muted-foreground/30"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
