import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAISourceRules, useUpdateSourceRule, useCreateSourceRule, useDeleteSourceRule, AISourceRule, AIMode } from "@/hooks/useAISettings";
import { Loader2, Database, Plus, Pencil, Trash2, Globe, MapPin, Navigation, Baby } from "lucide-react";

const ruleTypeInfo: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  global: { icon: Globe, label: "Global", color: "bg-muted-indigo" },
  location: { icon: MapPin, label: "Location", color: "bg-terracotta" },
  route: { icon: Navigation, label: "Route", color: "bg-adventure-green" },
  mode: { icon: Baby, label: "Mode", color: "bg-amber" },
};

const emptyRule: Partial<AISourceRule> = {
  rule_name: "",
  rule_type: "global",
  include_stories: true,
  include_panels: true,
  include_testimonies: true,
  include_routes: true,
  include_ar_content: false,
  include_drafts: false,
  is_active: true,
  custom_instructions: "",
};

export function SourceRulesPanel() {
  const { data: rules, isLoading } = useAISourceRules();
  const updateRule = useUpdateSourceRule();
  const createRule = useCreateSourceRule();
  const deleteRule = useDeleteSourceRule();
  
  const [editingRule, setEditingRule] = useState<Partial<AISourceRule> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = () => {
    if (!editingRule) return;
    
    if (isCreating) {
      createRule.mutate(editingRule);
    } else if (editingRule.id) {
      updateRule.mutate({ id: editingRule.id, updates: editingRule });
    }
    
    setEditingRule(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    deleteRule.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Source Rules</h3>
          <p className="text-sm text-muted-foreground">
            Control what content types AI can reference
          </p>
        </div>
        <Button onClick={() => { setEditingRule({ ...emptyRule }); setIsCreating(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4">
        {rules?.map((rule) => {
          const typeInfo = ruleTypeInfo[rule.rule_type] || ruleTypeInfo.global;
          const Icon = typeInfo.icon;
          
          return (
            <Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {typeInfo.label} rule
                        {rule.target_mode && ` • ${rule.target_mode} mode`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {rule.rule_type !== "global" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{rule.rule_name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(rule.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {rule.include_stories && <Badge variant="outline">Stories</Badge>}
                  {rule.include_panels && <Badge variant="outline">Panels</Badge>}
                  {rule.include_testimonies && <Badge variant="outline">Testimonies</Badge>}
                  {rule.include_routes && <Badge variant="outline">Routes</Badge>}
                  {rule.include_ar_content && <Badge variant="outline">AR/360</Badge>}
                  {rule.include_drafts && <Badge variant="destructive">Drafts</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit/Create Sheet */}
      <Sheet open={!!editingRule} onOpenChange={() => { setEditingRule(null); setIsCreating(false); }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isCreating ? "Create Source Rule" : "Edit Source Rule"}</SheetTitle>
            <SheetDescription>
              Define which content types AI can access
            </SheetDescription>
          </SheetHeader>

          {editingRule && (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={editingRule.rule_name || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, rule_name: e.target.value })}
                  placeholder="e.g., Memorial Sites"
                />
              </div>

              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select
                  value={editingRule.rule_type}
                  onValueChange={(val) => setEditingRule({ ...editingRule, rule_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="location">Location-specific</SelectItem>
                    <SelectItem value="route">Route-specific</SelectItem>
                    <SelectItem value="mode">Mode-specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingRule.rule_type === "mode" && (
                <div className="space-y-2">
                  <Label>Target Mode</Label>
                  <Select
                    value={editingRule.target_mode || "standard"}
                    onValueChange={(val) => setEditingRule({ ...editingRule, target_mode: val as AIMode })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="personal_voices">Personal Voices</SelectItem>
                      <SelectItem value="kid_friendly">Kid-Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4">
                <Label>Content Sources</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Stories</Label>
                    <Switch
                      checked={editingRule.include_stories}
                      onCheckedChange={(checked) =>
                        setEditingRule({ ...editingRule, include_stories: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Museum Panels</Label>
                    <Switch
                      checked={editingRule.include_panels}
                      onCheckedChange={(checked) =>
                        setEditingRule({ ...editingRule, include_panels: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Testimonies</Label>
                    <Switch
                      checked={editingRule.include_testimonies}
                      onCheckedChange={(checked) =>
                        setEditingRule({ ...editingRule, include_testimonies: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Route Narratives</Label>
                    <Switch
                      checked={editingRule.include_routes}
                      onCheckedChange={(checked) =>
                        setEditingRule({ ...editingRule, include_routes: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">AR/360 Content</Label>
                    <Switch
                      checked={editingRule.include_ar_content}
                      onCheckedChange={(checked) =>
                        setEditingRule({ ...editingRule, include_ar_content: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-3">
                    <div>
                      <Label className="font-normal">Include Drafts</Label>
                      <p className="text-xs text-muted-foreground">Not recommended</p>
                    </div>
                    <Switch
                      checked={editingRule.include_drafts}
                      onCheckedChange={(checked) =>
                        setEditingRule({ ...editingRule, include_drafts: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Instructions</Label>
                <Textarea
                  value={editingRule.custom_instructions || ""}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, custom_instructions: e.target.value })
                  }
                  placeholder="Additional instructions for this context..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingRule.is_active}
                  onCheckedChange={(checked) =>
                    setEditingRule({ ...editingRule, is_active: checked })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={createRule.isPending || updateRule.isPending || !editingRule.rule_name}
                >
                  {(createRule.isPending || updateRule.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isCreating ? "Create Rule" : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => { setEditingRule(null); setIsCreating(false); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
