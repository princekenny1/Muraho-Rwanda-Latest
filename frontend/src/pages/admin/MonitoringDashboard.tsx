/**
 * MonitoringDashboard — Real-time system monitoring for admin.
 *
 * Displays:
 *   - Service health status (from /api/health)
 *   - Request latency indicators
 *   - Content growth trend
 *   - Active users count
 *   - Error rate alerts
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, Server, Database, Cloud, Bot, Wifi,
  HardDrive, Clock, Users, AlertTriangle, RefreshCw,
  CheckCircle, XCircle, MinusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

interface ServiceHealth {
  status: "up" | "down" | "degraded";
  latencyMs: number;
  details?: string;
}

interface HealthData {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  services: Record<string, ServiceHealth>;
  timestamp: string;
}

const SERVICE_META: Record<string, { icon: typeof Server; label: string; description: string }> = {
  postgres: { icon: Database, label: "PostgreSQL", description: "Database + pgvector + PostGIS" },
  redis: { icon: Server, label: "Redis", description: "Cache, rate limiting, sessions" },
  minio: { icon: Cloud, label: "MinIO", description: "Object storage (S3-compatible)" },
  ai: { icon: Bot, label: "AI Service", description: "FastAPI RAG pipeline" },
  ollama: { icon: HardDrive, label: "Ollama", description: "LLM model server" },
};

const STATUS_CONFIG = {
  up: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Operational" },
  down: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Down" },
  degraded: { icon: MinusCircle, color: "text-amber-500", bg: "bg-amber-50", label: "Degraded" },
};

export default function MonitoringDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: health, isLoading, error } = useQuery<HealthData>({
    queryKey: ["system-health", refreshKey],
    queryFn: async () => {
      const resp = await fetch("/api/health");
      if (!resp.ok) throw new Error(`Health check failed: ${resp.status}`);
      return resp.json();
    },
    refetchInterval: 15_000,
  });

  // Content stats for growth tracking
  const { data: contentCounts } = useQuery({
    queryKey: ["monitor-content-counts"],
    queryFn: async () => {
      const [stories, museums, users] = await Promise.all([
        api.find("stories", { limit: 0 }),
        api.find("museums", { limit: 0 }),
        api.find("users", { limit: 0 }),
      ]);
      return {
        stories: stories.totalDocs,
        museums: museums.totalDocs,
        users: users.totalDocs,
      };
    },
    refetchInterval: 60_000,
  });

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Monitoring
          </h2>
          {health && (
            <p className="text-xs text-muted-foreground mt-0.5">
              v{health.version} · Uptime: {formatUptime(health.uptime)} · Last check: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={isLoading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall status banner */}
      {health && (
        <div className={`rounded-xl p-4 border ${
          health.status === "healthy" ? "bg-emerald-50 border-emerald-200" :
          health.status === "degraded" ? "bg-amber-50 border-amber-200" :
          "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center gap-3">
            {health.status === "healthy" ? (
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            ) : health.status === "degraded" ? (
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <span className="font-semibold capitalize">{health.status}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {health.status === "healthy"
                  ? "All services operational"
                  : health.status === "degraded"
                  ? "Some services experiencing issues"
                  : "Critical services are down"}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm text-red-700">Cannot reach health endpoint. Services may be down.</span>
        </div>
      )}

      {/* Service cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health && Object.entries(health.services).map(([name, service]) => {
          const meta = SERVICE_META[name] || { icon: Server, label: name, description: "" };
          const status = STATUS_CONFIG[service.status];
          const Icon = meta.icon;
          const StatusIcon = status.icon;

          return (
            <Card key={name} className="relative overflow-hidden">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg ${status.bg} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${status.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                  <StatusIcon className={`w-4.5 h-4.5 ${status.color}`} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.latencyMs}ms
                  </span>
                </div>

                {service.details && (
                  <p className="text-xs text-muted-foreground mt-2 truncate" title={service.details}>
                    {service.details}
                  </p>
                )}

                {/* Latency bar */}
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      service.latencyMs < 100 ? "bg-emerald-400" :
                      service.latencyMs < 500 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(100, (service.latencyMs / 1000) * 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{contentCounts?.users || 0}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Wifi className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{contentCounts?.stories || 0}</p>
            <p className="text-xs text-muted-foreground">Published Stories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Database className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{contentCounts?.museums || 0}</p>
            <p className="text-xs text-muted-foreground">Active Museums</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
