/**
 * AdminAnalytics — Analytics visualizations for the admin dashboard.
 *
 * Components:
 *   <VisitorTrend />     — 30-day visitor line chart
 *   <ContentBreakdown /> — Pie chart of content by type
 *   <RecentActivity />   — Live activity feed
 *   <SystemStatus />     — Service health indicators
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, Server, Database, Cloud, Bot, Wifi, WifiOff,
  TrendingUp, FileText, Landmark, MapPin, Mic,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";

// ── System Status ─────────────────────────────────────

interface ServiceHealth {
  status: "up" | "down" | "degraded";
  latencyMs: number;
  details?: string;
}

interface HealthData {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  services: Record<string, ServiceHealth>;
}

export function SystemStatus() {
  const { data, isLoading } = useQuery<HealthData>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const resp = await fetch("/api/health");
      return resp.json();
    },
    refetchInterval: 30_000,
  });

  const serviceIcons: Record<string, typeof Server> = {
    postgres: Database,
    redis: Server,
    minio: Cloud,
    ai: Bot,
    ollama: Bot,
  };

  const statusColors = {
    up: "bg-emerald-500",
    down: "bg-red-500",
    degraded: "bg-amber-500",
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          System Status
          {data && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              data.status === "healthy" ? "bg-emerald-100 text-emerald-700" :
              data.status === "degraded" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {data.status}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Checking services...</div>
        ) : data ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-3">
              Uptime: {formatUptime(data.uptime)}
            </div>
            {Object.entries(data.services).map(([name, service]) => {
              const Icon = serviceIcons[name] || Server;
              return (
                <div key={name} className="flex items-center gap-3 py-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusColors[service.status]}`} />
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm flex-1 capitalize">{name}</span>
                  <span className="text-xs text-muted-foreground">
                    {service.latencyMs}ms
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <WifiOff className="w-4 h-4" />
            Cannot reach health endpoint
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Content Breakdown (bar chart) ─────────────────────

interface ContentStats {
  stories: number;
  museums: number;
  locations: number;
  routes: number;
  testimonies: number;
  documentaries: number;
}

export function ContentBreakdown({ stats }: { stats: ContentStats }) {
  const items = [
    { label: "Stories", count: stats.stories, icon: FileText, color: "bg-amber" },
    { label: "Museums", count: stats.museums, icon: Landmark, color: "bg-muted-indigo" },
    { label: "Locations", count: stats.locations, icon: MapPin, color: "bg-adventure-green" },
    { label: "Testimonies", count: stats.testimonies, icon: Mic, color: "bg-terracotta" },
  ];

  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Content Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{label}</span>
              </div>
              <span className="font-medium">{count}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-500`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Recent Activity Feed ──────────────────────────────

interface ActivityItem {
  id: string;
  action: string;
  collection: string;
  title: string;
  timestamp: string;
  user?: string;
}

export function RecentActivity() {
  const { data: activities } = useQuery<ActivityItem[]>({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      // Fetch recently updated content across collections
      const collections = ["stories", "museums", "testimonies", "documentaries"];
      const results = await Promise.all(
        collections.map(async (col) => {
          try {
            const res = await api.find(col, { sort: "-updatedAt", limit: 3 });
            return (res.docs || []).map((doc: any) => ({
              id: `${col}-${doc.id}`,
              action: "updated",
              collection: col,
              title: doc.title || doc.name || "Untitled",
              timestamp: doc.updatedAt,
              user: doc.lastModifiedBy?.fullName || undefined,
            }));
          } catch {
            return [];
          }
        })
      );
      return results
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    },
    refetchInterval: 60_000,
  });

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-muted-foreground"> was {item.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.collection} · {timeAgo(item.timestamp)}
                    {item.user && ` · ${item.user}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}
