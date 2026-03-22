import { useState, useEffect } from "react";
import { Settings, Map, Globe, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface MapSettings {
  defaultStyle: "light" | "dark" | "satellite";
  defaultZoom: number;
  defaultCenterLat: number;
  defaultCenterLng: number;
  enableHeatmaps: boolean;
  editorsCanPlaceStops: boolean;
  editorsCanCreateLocations: boolean;
  contributorsReadOnly: boolean;
}

const defaultSettings: MapSettings = {
  defaultStyle: "light",
  defaultZoom: 12,
  defaultCenterLat: -1.9403,
  defaultCenterLng: 29.8739,
  enableHeatmaps: false,
  editorsCanPlaceStops: true,
  editorsCanCreateLocations: true,
  contributorsReadOnly: true,
};

export function MapSettingsPanel() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MapSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage (in production, this would be from DB)
  useEffect(() => {
    const saved = localStorage.getItem("map-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  const handleChange = <K extends keyof MapSettings>(key: K, value: MapSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem("map-settings", JSON.stringify(settings));
    setHasChanges(false);
    toast({ title: "Map settings saved" });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Map Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure default map behavior and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Display Settings
            </CardTitle>
            <CardDescription>Default map appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Map Style</Label>
              <Select
                value={settings.defaultStyle}
                onValueChange={(value) =>
                  handleChange("defaultStyle", value as "light" | "dark" | "satellite")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Zoom Level</Label>
              <Input
                type="number"
                min={1}
                max={18}
                value={settings.defaultZoom}
                onChange={(e) => handleChange("defaultZoom", parseInt(e.target.value) || 12)}
              />
              <p className="text-xs text-muted-foreground">
                Zoom level 1-18 (higher = closer)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Center */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Default Center
            </CardTitle>
            <CardDescription>Initial map position (Kigali by default)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={settings.defaultCenterLat}
                  onChange={(e) =>
                    handleChange("defaultCenterLat", parseFloat(e.target.value) || -1.9403)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={settings.defaultCenterLng}
                  onChange={(e) =>
                    handleChange("defaultCenterLng", parseFloat(e.target.value) || 29.8739)
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Default: Kigali, Rwanda (-1.9403, 29.8739)
            </p>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>Map-based analytics features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Heatmaps</Label>
                <p className="text-xs text-muted-foreground">
                  Show popular visit areas on admin map
                </p>
              </div>
              <Switch
                checked={settings.enableHeatmaps}
                onCheckedChange={(checked) => handleChange("enableHeatmaps", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Editor Permissions
            </CardTitle>
            <CardDescription>What editors and contributors can do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Editors Can Place Stops</Label>
                <p className="text-xs text-muted-foreground">
                  Allow editors to add/move stops
                </p>
              </div>
              <Switch
                checked={settings.editorsCanPlaceStops}
                onCheckedChange={(checked) => handleChange("editorsCanPlaceStops", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Editors Can Create Locations</Label>
                <p className="text-xs text-muted-foreground">
                  Allow editors to add new locations
                </p>
              </div>
              <Switch
                checked={settings.editorsCanCreateLocations}
                onCheckedChange={(checked) => handleChange("editorsCanCreateLocations", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Contributors Read-Only</Label>
                <p className="text-xs text-muted-foreground">
                  Contributors can only view the map
                </p>
              </div>
              <Switch
                checked={settings.contributorsReadOnly}
                onCheckedChange={(checked) => handleChange("contributorsReadOnly", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
