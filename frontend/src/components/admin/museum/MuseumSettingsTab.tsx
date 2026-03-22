import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Museum, useMuseumMutations } from "@/hooks/useMuseumAdmin";
import { toast } from "sonner";

interface MuseumSettingsTabProps {
  museumId: string;
  museum: Museum;
}

export function MuseumSettingsTab({ museumId, museum }: MuseumSettingsTabProps) {
  const { updateMuseum } = useMuseumMutations();

  const handleUpdate = async (updates: Partial<Museum>) => {
    await updateMuseum.mutateAsync({ id: museumId, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Sensitive Content Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Sensitive Content Controls</CardTitle>
          <CardDescription>
            Configure how sensitive content is handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Hide graphic images in Kid Mode</Label>
              <p className="text-sm text-muted-foreground">
                Replace graphic content with age-appropriate alternatives
              </p>
            </div>
            <Switch
              checked={museum.hide_graphic_in_kid_mode}
              onCheckedChange={(checked) =>
                handleUpdate({ hide_graphic_in_kid_mode: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Replace raw testimonies with summaries</Label>
              <p className="text-sm text-muted-foreground">
                Show summarized versions instead of full testimonies
              </p>
            </div>
            <Switch
              checked={museum.replace_raw_testimonies}
              onCheckedChange={(checked) =>
                handleUpdate({ replace_raw_testimonies: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Indoor Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Indoor Navigation</CardTitle>
          <CardDescription>Configure how visitors navigate indoor exhibitions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Indoor Flow</Label>
            <Select
              value={museum.indoor_flow}
              onValueChange={(value: any) => handleUpdate({ indoor_flow: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">
                  Linear (Room 1 → 2 → 3)
                </SelectItem>
                <SelectItem value="free_explore">
                  Free Explore (tap any room)
                </SelectItem>
                <SelectItem value="guided">
                  Guided Mode Only
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How visitors move through indoor exhibition rooms
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Outdoor Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Outdoor Navigation</CardTitle>
          <CardDescription>Configure outdoor stop visibility and map display</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show outdoor map</Label>
              <p className="text-sm text-muted-foreground">
                Display map view for outdoor stops
              </p>
            </div>
            <Switch
              checked={museum.show_outdoor_map}
              onCheckedChange={(checked) => handleUpdate({ show_outdoor_map: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pin Visibility</Label>
            <Select
              value={museum.outdoor_pins_visibility}
              onValueChange={(value: any) =>
                handleUpdate({ outdoor_pins_visibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always visible</SelectItem>
                <SelectItem value="nearby">Only when nearby</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              When outdoor stop pins are shown to visitors
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Publication Status</CardTitle>
          <CardDescription>Control museum visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Museum is visible to visitors
              </p>
            </div>
            <Switch
              checked={museum.is_active}
              onCheckedChange={(checked) => handleUpdate({ is_active: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Featured</Label>
              <p className="text-sm text-muted-foreground">
                Highlight this museum on the homepage
              </p>
            </div>
            <Switch
              checked={museum.is_featured}
              onCheckedChange={(checked) => handleUpdate({ is_featured: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
