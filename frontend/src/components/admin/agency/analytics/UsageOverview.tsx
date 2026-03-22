import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Calendar, TicketCheck } from "lucide-react";
import { AgencyStats } from "@/hooks/useAgency";

interface UsageOverviewProps {
  stats: AgencyStats;
}

export function UsageOverview({ stats }: UsageOverviewProps) {
  const usageRate = stats.totalCodesIssued > 0
    ? Math.round((stats.codesUsed / stats.totalCodesIssued) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Activations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{stats.codesUsed.toLocaleString()}</span>
            <Users className="h-8 w-8 text-primary/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            of {stats.totalCodesIssued.toLocaleString()} issued
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Usage Rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{usageRate}%</span>
            <TrendingUp className="h-8 w-8 text-primary/50" />
          </div>
          <Progress value={usageRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{stats.activeGroups}</span>
            <Calendar className="h-8 w-8 text-secondary-foreground/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Currently active codes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Remaining Balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{stats.remainingBalance}</span>
            <TicketCheck className="h-8 w-8 text-accent-foreground/50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Codes available to issue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
