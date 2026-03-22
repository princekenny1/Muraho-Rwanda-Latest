import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useTheme } from "next-themes";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Bell, Globe, Moon, Sun, Monitor, Volume2, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, loading, saving, updateSettings } = useUserSettings();

  // Sync theme from settings when loaded
  useEffect(() => {
    if (!loading && user && settings.theme) {
      setTheme(settings.theme);
    }
  }, [loading, user, settings.theme, setTheme]);

  const handleNotificationChange = async (key: "story_alerts" | "location_based" | "email_digest" | "sound_enabled") => {
    const { error } = await updateSettings({ [key]: !settings[key] });
    if (error) {
      toast.error("Failed to update settings");
    } else {
      toast.success("Settings updated");
    }
  };

  const handleLanguageChange = async (value: string) => {
    const { error } = await updateSettings({ language: value });
    if (error) {
      toast.error("Failed to update language");
    } else {
      toast.success(`Language changed to ${getLanguageName(value)}`);
    }
  };

  const handleThemeChange = async (value: string) => {
    setTheme(value);
    if (user) {
      const { error } = await updateSettings({ theme: value });
      if (error) {
        toast.error("Failed to save theme preference");
      }
    }
    toast.success(`Theme changed to ${value}`);
  };

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = { en: "English", fr: "Français", rw: "Kinyarwanda" };
    return names[code] || code;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Settings" showSearch={false} />
      
      <main className="pt-14 pb-8 px-4 page-content-narrow">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Language
            </CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={settings.language} onValueChange={handleLanguageChange} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="storyAlerts" className="font-medium">Story Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified about new stories</p>
                    </div>
                  </div>
                  <Switch
                    id="storyAlerts"
                    checked={settings.story_alerts}
                    onCheckedChange={() => handleNotificationChange("story_alerts")}
                    disabled={saving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="locationBased" className="font-medium">Location-Based</Label>
                      <p className="text-xs text-muted-foreground">Alerts near points of interest</p>
                    </div>
                  </div>
                  <Switch
                    id="locationBased"
                    checked={settings.location_based}
                    onCheckedChange={() => handleNotificationChange("location_based")}
                    disabled={saving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="soundEnabled" className="font-medium">Sound</Label>
                      <p className="text-xs text-muted-foreground">Play notification sounds</p>
                    </div>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.sound_enabled}
                    onCheckedChange={() => handleNotificationChange("sound_enabled")}
                    disabled={saving}
                  />
                </div>

                {user && (
                  <>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="emailDigest" className="font-medium">Email Digest</Label>
                          <p className="text-xs text-muted-foreground">Weekly summary via email</p>
                        </div>
                      </div>
                      <Switch
                        id="emailDigest"
                        checked={settings.email_digest}
                        onCheckedChange={() => handleNotificationChange("email_digest")}
                        disabled={saving}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Saving Indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-card border rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}

        {/* Account Actions */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => toast.info("Contact support to delete your account")}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
