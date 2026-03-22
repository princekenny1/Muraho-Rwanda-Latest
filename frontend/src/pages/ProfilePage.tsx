import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContentAccess } from "@/hooks/useContentAccess";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TourGroupBadge } from "@/components/access";
import { SuggestedRoutesCarousel } from "@/components/profile/SuggestedRoutesCarousel";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Users,
  User,
  Loader2,
  Crown,
  Ticket,
  Lock,
  Download,
  BookmarkIcon,
  MessageSquare,
  Bell,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

export default function ProfilePage() {
  const { user, roles, loading } = useAuth();
  const { hasSubscription, tourGroupAccess, userAccess } = useContentAccess();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { icon: Shield, label: "Admin", className: "bg-amber/20 text-amber border-amber/50" },
      moderator: { icon: Users, label: "Moderator", className: "bg-sky-500/20 text-sky-400 border-sky-500/50" },
      agency_admin: { icon: Ticket, label: "Agency", className: "bg-adventure-green/20 text-adventure-green border-adventure-green/50" },
      user: { icon: User, label: "Member", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" },
    };
    const roleConfig = config[role as keyof typeof config] || config.user;
    const Icon = roleConfig.icon;

    return (
      <Badge variant="outline" className={`${roleConfig.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {roleConfig.label}
      </Badge>
    );
  };

  const getAccessLevel = () => {
    if (hasSubscription) return { label: "Full Access", icon: Crown, className: "text-amber" };
    if (tourGroupAccess) return { label: "Tour Group", icon: Ticket, className: "text-adventure-green" };
    return { label: "Free Tier", icon: Lock, className: "text-muted-foreground" };
  };

  const accessLevel = getAccessLevel();
  const AccessIcon = accessLevel.icon;

  // Mock data for content counts (in production, fetch from DB)
  const contentUnlocked = userAccess.filter((a) => a.access_type === "purchase").length;
  const downloadsCount = 0; // Would track in a downloads table

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    let error: Error | null = null;
    try {
      await api.update("users", user!.id, { password: newPassword });
    } catch (e: any) {
      error = e;
    }
    setIsUpdating(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Profile" showSearch={false} />

      <main className="pt-14 pb-8 px-4 page-content-narrow">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-muted-indigo text-white text-xl">
                  {getInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{user.email}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {roles.length > 0 ? (
                    roles.map((role) => <span key={role}>{getRoleBadge(role)}</span>)
                  ) : (
                    getRoleBadge("user")
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Level Card */}
        <Card className={`mb-6 ${tourGroupAccess ? 'bg-gradient-to-br from-adventure-green/10 to-forest-teal/5 border-adventure-green/30' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AccessIcon className={`w-5 h-5 ${accessLevel.className}`} />
              Access Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{accessLevel.label}</span>
              {!hasSubscription && !tourGroupAccess && (
                <Button asChild size="sm">
                  <Link to="/access">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Upgrade
                  </Link>
                </Button>
              )}
            </div>

            {tourGroupAccess && (
              <div className="p-4 rounded-lg bg-background/80 border border-adventure-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-adventure-green" />
                  <p className="text-xs text-muted-foreground">Provided by</p>
                </div>
                <p className="font-semibold text-foreground mb-1">{tourGroupAccess.agencyName}</p>
                <TourGroupBadge access={tourGroupAccess} variant="compact" />
                {tourGroupAccess.accessLevel === "full" && (
                  <p className="text-xs text-adventure-green mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Full access to all premium content
                  </p>
                )}
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{contentUnlocked}</p>
                <p className="text-xs text-muted-foreground">Content Unlocked</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{downloadsCount}</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Routes Carousel - Only for tour group access */}
        {tourGroupAccess && (
          <SuggestedRoutesCarousel agencyName={tourGroupAccess.agencyName} />
        )}

        {/* Quick Links */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              asChild
            >
              <Link to="/collections">
                <span className="flex items-center gap-3">
                  <BookmarkIcon className="w-4 h-4 text-muted-foreground" />
                  My Collections
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              asChild
            >
              <Link to="/downloads">
                <span className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  Downloads
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              asChild
            >
              <Link to="/ask-rwanda">
                <span className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Ask Rwanda History
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between h-12"
              asChild
            >
              <Link to="/settings">
                <span className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  Notification Settings
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email verified</p>
                <p className="text-sm font-medium">{user.email_confirmed_at ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit" disabled={isUpdating || !newPassword}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
