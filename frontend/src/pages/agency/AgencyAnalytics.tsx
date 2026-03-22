import { Link } from "react-router-dom";
import { useAgencyPortal } from "@/hooks/useAgency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import {
  ActivationChart,
  ContentBreakdown,
  UsageOverview,
  GroupPerformance,
} from "@/components/agency/analytics";

export default function AgencyAnalytics() {
  const { codes, stats } = useAgencyPortal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/agency">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Usage Analytics</h1>
              <p className="text-muted-foreground">
                Track how your groups are engaging with content
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Usage Overview Stats */}
        <UsageOverview stats={stats} />

        {/* Daily Activation Chart */}
        <ActivationChart codes={codes} />

        {/* Content Breakdown with Tabs */}
        <ContentBreakdown />

        {/* Group Performance */}
        <GroupPerformance codes={codes} />

        {/* Export Note */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Need detailed reports? Contact support for custom analytics exports.
            </p>
            <Button variant="link" size="sm" className="text-primary">
              Learn more
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
