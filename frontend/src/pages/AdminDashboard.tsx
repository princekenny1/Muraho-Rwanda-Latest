import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Video, Mic, FileText, LayoutGrid, Building2, Bot, Landmark, MapPin, Map, Users, Key, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdminStats } from "@/hooks/useAdminStats";
import { SystemStatus, ContentBreakdown, RecentActivity } from "@/components/admin/AdminAnalytics";

const adminSections = [
  {
    id: "cms",
    title: "Content CMS",
    description: "Create stories, testimonies, films, and manage all content with tagging",
    icon: FileText,
    path: "/admin/content",
    color: "bg-gradient-to-br from-primary to-primary/70",
    featured: true,
  },
  {
    id: "map",
    title: "Map Control Panel",
    description: "Manage locations, stops, landmarks, and all map-based content",
    icon: Map,
    path: "/admin/map",
    color: "bg-gradient-to-br from-emerald-500 to-teal-500",
  },
  {
    id: "museums",
    title: "Museums & Memorials",
    description: "Build immersive museum experiences with indoor and outdoor content",
    icon: Landmark,
    path: "/admin/museums",
    color: "bg-muted-indigo",
  },
  {
    id: "routes",
    title: "Route Builder",
    description: "Create and manage routes with stops and multimedia content",
    icon: MapPin,
    path: "/admin/routes",
    color: "bg-amber",
  },
  {
    id: "vr",
    title: "VR Tours",
    description: "Manage 360° virtual tour scenes and hotspots",
    icon: Video,
    path: "/admin/vr",
    color: "bg-forest-teal",
  },
  {
    id: "testimonies",
    title: "Testimonies",
    description: "Manage survivor narratives and testimonies",
    icon: Mic,
    path: "/admin/testimonies",
    color: "bg-terracotta",
  },
  {
    id: "documentaries",
    title: "Documentaries",
    description: "Manage documentary films and chapters",
    icon: FileText,
    path: "/admin/documentaries",
    color: "bg-adventure-green",
  },
  {
    id: "exhibitions",
    title: "Exhibitions",
    description: "Manage exhibition panels and content blocks",
    icon: LayoutGrid,
    path: "/admin/exhibitions",
    color: "bg-primary",
  },
  {
    id: "agencies",
    title: "Tour Agencies",
    description: "Verify and manage tour agency registrations",
    icon: Building2,
    path: "/admin/agencies",
    color: "bg-sunset-gold",
  },
  {
    id: "ai",
    title: "AI Settings",
    description: "Configure Ask Rwanda behavior, safety, and content rules",
    icon: Bot,
    path: "/admin/ai",
    color: "bg-gradient-to-br from-muted-indigo to-forest-teal",
  },
  {
    id: "monitoring",
    title: "System Monitoring",
    description: "Service health, latency, uptime, and error tracking",
    icon: TrendingUp,
    path: "/admin/monitoring",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, isAdmin, signIn, signUp } = useAuth();
  const { stats, isLoading: statsLoading } = useAdminStats();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      toast({
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (isSignUp) {
      toast({
        title: "Account created",
        description: "You can now sign in. Note: Admin role must be assigned to access the panel.",
      });
      setIsSignUp(false);
    }
    setIsSigningIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have admin permissions to access this page.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage all content sections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Stories", value: stats.stories, icon: FileText, color: "bg-amber" },
            { label: "Museums", value: stats.museums, icon: Landmark, color: "bg-muted-indigo" },
            { label: "Locations", value: stats.locations, icon: MapPin, color: "bg-adventure-green" },
            { label: "Routes", value: stats.routes, icon: Map, color: "bg-forest-teal" },
            { label: "Testimonies", value: stats.testimonies, icon: Mic, color: "bg-terracotta" },
            { label: "Documentaries", value: stats.documentaries, icon: Video, color: "bg-primary" },
            { label: "Users", value: stats.users, icon: Users, color: "bg-slate-600" },
            { label: "Agencies", value: stats.agencies, icon: Building2, color: "bg-emerald-600" },
            { label: "Access Codes", value: stats.codes, icon: Key, color: "bg-amber" },
            { label: "AI Chats", value: stats.aiConversations, icon: Bot, color: "bg-indigo-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">
                  {statsLoading ? "–" : value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Card
              key={section.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow group ${
                (section as any).featured ? "md:col-span-2 lg:col-span-1 ring-2 ring-primary/20" : ""
              }`}
              onClick={() => navigate(section.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}
                  >
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                    {(section as any).featured && (
                      <span className="text-xs text-primary font-medium">Main CMS</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Panels */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <SystemStatus />
          <ContentBreakdown stats={stats} />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
}
