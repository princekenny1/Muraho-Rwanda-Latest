import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MapPin, Headphones, Route, Building2 } from "lucide-react";

// Mock data - in production this would come from tracking/analytics tables
const locationData = [
  { name: "Kigali Genocide Memorial", visits: 847, type: "memorial" },
  { name: "Nyamata Church Memorial", visits: 523, type: "memorial" },
  { name: "Murambi Genocide Memorial", visits: 412, type: "memorial" },
  { name: "Camp Kigali Memorial", visits: 298, type: "memorial" },
  { name: "Bisesero Genocide Memorial", visits: 187, type: "memorial" },
];

const storyData = [
  { name: "100 Days of Horror", listens: 1247, duration: "45 min" },
  { name: "Survivors' Voices", listens: 934, duration: "32 min" },
  { name: "The Rescue at Bisesero", listens: 756, duration: "28 min" },
  { name: "Children of the Genocide", listens: 623, duration: "38 min" },
  { name: "Path to Reconciliation", listens: 512, duration: "41 min" },
];

const routeData = [
  { name: "Kigali Memorial Trail", completions: 342, stops: 8 },
  { name: "Eastern Province Journey", completions: 287, stops: 12 },
  { name: "Reconciliation Walk", completions: 234, stops: 6 },
  { name: "Liberation Route", completions: 198, stops: 10 },
  { name: "Southern Memorials Circuit", completions: 156, stops: 7 },
];

export function ContentBreakdown() {
  const maxLocationVisits = locationData[0]?.visits || 1;
  const maxStoryListens = storyData[0]?.listens || 1;
  const maxRouteCompletions = routeData[0]?.completions || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Content Engagement</CardTitle>
        <CardDescription>
          What your tour groups are exploring most
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="locations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-2">
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="gap-2">
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            {locationData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.visits.toLocaleString()} visits
                  </span>
                </div>
                <Progress
                  value={(item.visits / maxLocationVisits) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="stories" className="space-y-4">
            {storyData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <Headphones className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({item.duration})
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.listens.toLocaleString()} listens
                  </span>
                </div>
                <Progress
                  value={(item.listens / maxStoryListens) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            {routeData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <Route className="h-4 w-4 text-accent-foreground" />
                    <div>
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({item.stops} stops)
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.completions.toLocaleString()} completed
                  </span>
                </div>
                <Progress
                  value={(item.completions / maxRouteCompletions) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
