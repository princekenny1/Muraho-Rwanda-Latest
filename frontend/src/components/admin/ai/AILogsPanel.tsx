import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Shield, Search, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";

interface AILog {
  id: string;
  createdAt: string;
  query: string;
  mode: string;
  safetyFiltered: boolean;
  sources: string[];
  responseTimeMs: number;
  status: string;
  language: string;
}

const modeLabels: Record<string, string> = {
  standard: "Standard",
  personal_voices: "Personal Voices",
  kid_friendly: "Kid-Friendly",
};

const modeColors: Record<string, string> = {
  standard: "bg-muted-indigo",
  personal_voices: "bg-terracotta",
  kid_friendly: "bg-adventure-green",
};

export function AILogsPanel() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterSafety, setFilterSafety] = useState<string>("all");

  const { data: logsData, isLoading, isRefetching } = useQuery({
    queryKey: ["ai-logs", filterMode, filterSafety],
    queryFn: async () => {
      const where: Record<string, any> = {};
      if (filterMode !== "all") where.mode = { equals: filterMode };
      if (filterSafety === "filtered") where.safetyFiltered = { equals: true };
      else if (filterSafety === "unfiltered") where.safetyFiltered = { equals: false };

      try {
        const res = await api.find("ai-conversations", {
          where: Object.keys(where).length > 0 ? where : undefined,
          sort: "-createdAt",
          limit: 50,
        });
        return {
          logs: res.docs.map((d: any) => ({
            id: d.id,
            createdAt: d.createdAt,
            query: d.query || d.question || "",
            mode: d.mode || "standard",
            safetyFiltered: d.safetyFiltered || false,
            sources: d.sources || [],
            responseTimeMs: d.responseTimeMs || 0,
            status: d.status || "success",
            language: d.language || "en",
          })) as AILog[],
          total: res.totalDocs,
        };
      } catch {
        return { logs: [], total: 0 };
      }
    },
    staleTime: 30_000,
  });

  const logs = logsData?.logs || [];
  const totalCount = logsData?.total || 0;

  const filteredLogs = logs.filter((log) =>
    !searchQuery || log.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: totalCount,
    filtered: logs.filter((l) => l.safetyFiltered).length,
    avgResponseTime: logs.length > 0
      ? (logs.reduce((sum, l) => sum + l.responseTimeMs, 0) / logs.length / 1000).toFixed(1)
      : "0.0",
  };

  const formatTime = (timestamp: string) => {
    const diffMins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleExport = () => {
    const csv = [
      "timestamp,query,mode,safety_filtered,response_time_ms,status,language",
      ...logs.map((l) =>
        `"${l.createdAt}","${l.query.replace(/"/g, '""')}","${l.mode}",${l.safetyFiltered},${l.responseTimeMs},"${l.status}","${l.language}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Logs</h3>
          <p className="text-sm text-muted-foreground">Monitor Ask Rwanda queries and safety filtering</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["ai-logs"] })} disabled={isRefetching}>
            {isRefetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Queries", value: stats.total, icon: FileText, color: "bg-muted-indigo" },
          { label: "Safety Filtered", value: stats.filtered, icon: Shield, color: "bg-amber" },
          { label: "Avg Response", value: `${stats.avgResponseTime}s`, icon: Clock, color: "bg-adventure-green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "–" : value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search queries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All modes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="personal_voices">Personal Voices</SelectItem>
                <SelectItem value="kid_friendly">Kid-Friendly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSafety} onValueChange={setFilterSafety}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="filtered">Safety Filtered</SelectItem>
                <SelectItem value="unfiltered">Unfiltered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Queries</CardTitle>
          <CardDescription>{isLoading ? "Loading..." : `${filteredLogs.length} of ${totalCount} interactions`}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No AI conversations logged yet</p>
              <p className="text-xs mt-1">Queries from Ask Rwanda will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {log.safetyFiltered ? <AlertTriangle className="w-4 h-4 text-amber" /> : <CheckCircle className="w-4 h-4 text-adventure-green" />}
                          <span className="font-medium text-sm">"{log.query}"</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="secondary" className={`${modeColors[log.mode] || "bg-slate-500"} text-white border-0`}>{modeLabels[log.mode] || log.mode}</Badge>
                          {log.safetyFiltered && <Badge variant="outline" className="border-amber text-amber">Safety filter</Badge>}
                          {log.sources.length > 0 && <><span>•</span><span>Sources: {log.sources.join(", ")}</span></>}
                          <span>•</span><span className="uppercase">{log.language}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        <p>{formatTime(log.createdAt)}</p>
                        <p>{(log.responseTimeMs / 1000).toFixed(1)}s</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
