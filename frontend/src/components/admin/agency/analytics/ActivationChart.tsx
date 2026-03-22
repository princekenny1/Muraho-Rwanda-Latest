import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AgencyCode } from "@/hooks/useAgency";

interface ActivationChartProps {
  codes: AgencyCode[];
}

export function ActivationChart({ codes }: ActivationChartProps) {
  const chartData = useMemo(() => {
    // Group activations by day for the last 14 days
    const today = new Date();
    const days: Record<string, { date: string; activations: number; issued: number }> = {};

    // Initialize last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      days[key] = {
        date: date.toLocaleDateString("default", { month: "short", day: "numeric" }),
        activations: 0,
        issued: 0,
      };
    }

    // Aggregate code data
    codes.forEach((code) => {
      const createdDate = new Date(code.created_at).toISOString().split("T")[0];
      if (days[createdDate]) {
        days[createdDate].issued += code.max_uses;
        // Simulate daily activations based on uses_count spread over validity period
        const dailyActivations = Math.ceil(code.uses_count / Math.max(1, code.valid_hours / 24));
        days[createdDate].activations += dailyActivations;
      }
    });

    return Object.values(days);
  }, [codes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Activations</CardTitle>
        <CardDescription>Code activations over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="activationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="activations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#activationGradient)"
                name="Activations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
