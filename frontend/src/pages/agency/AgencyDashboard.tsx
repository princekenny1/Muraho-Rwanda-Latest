import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAgencyPortal } from "@/hooks/useAgency";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Ticket, 
  Users, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  CreditCard,
  Calendar,
  Building2
} from "lucide-react";
import { AppIcon } from "@/components/brand";
import { format, formatDistanceToNow } from "date-fns";

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { agency, loading, stats, codes, purchases } = useAgencyPortal();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/agency/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!loading && !agency && user) {
      navigate("/agency/auth");
    }
  }, [agency, loading, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/agency/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!agency) return null;

  const recentCodes = codes.slice(0, 5);
  const activeCodes = codes.filter(
    (c) => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())
  );
  
  // Determine current plan
  const activePurchase = purchases.find(p => p.status === "active");
  const currentPlan = activePurchase?.plan?.name || "Pay-as-you-go";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={agency.logo_url || undefined} alt={agency.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {agency.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-lg">{agency.name}</h1>
              <div className="flex items-center gap-2">
                {agency.verification_status === "verified" ? (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : agency.verification_status === "pending" ? (
                  <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Verification
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner with Plan */}
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Welcome, {agency.name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <CreditCard className="h-4 w-4" />
                  Your Current Plan: <span className="font-medium text-foreground">{currentPlan}</span>
                  <Badge variant="secondary" className="ml-1 bg-green-500/10 text-green-600">Active</Badge>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link to="/agency/pricing">
                    <Ticket className="h-4 w-4 mr-2" />
                    Buy Codes
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/agency/codes/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Group Access
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/agency/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Warning */}
        {agency.verification_status === "pending" && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center gap-4">
              <Clock className="h-8 w-8 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Verification In Progress
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Your agency account is being reviewed. You can explore the portal, but code generation will be available after verification.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Overview Stats */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Access Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Codes Issued</p>
                    <p className="text-2xl font-bold">{stats.totalCodesIssued}</p>
                  </div>
                  <Ticket className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Codes Used</p>
                    <p className="text-2xl font-bold">{stats.codesUsed}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Groups</p>
                    <p className="text-2xl font-bold">{stats.activeGroups}</p>
                  </div>
                  <QrCode className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining Balance</p>
                    <p className="text-2xl font-bold">{stats.remainingBalance}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Access Groups */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Access Groups</CardTitle>
                <CardDescription>Your latest generated access codes</CardDescription>
              </div>
              {codes.length > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/agency/codes">View All</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No access codes generated yet</p>
                <p className="text-sm mt-1">Create your first group access code to get started</p>
                <Button asChild className="mt-4">
                  <Link to="/agency/codes/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Your First Code
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCodes.map((code) => {
                  const isActive = code.is_active && (!code.expires_at || new Date(code.expires_at) > new Date());
                  const usagePercent = Math.round((code.uses_count / code.max_uses) * 100);
                  const expiresAt = code.expires_at ? new Date(code.expires_at) : null;

                  return (
                    <div
                      key={code.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            "{code.group_name || code.name || "Unnamed Group"}"
                          </span>
                          {isActive ? (
                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                              Expired
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex-1 max-w-[200px]">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{code.uses_count}/{code.max_uses} used</span>
                              <span>{usagePercent}%</span>
                            </div>
                            <Progress value={usagePercent} className="h-1.5" />
                          </div>
                          
                          {expiresAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {isActive 
                                ? `Expires ${format(expiresAt, "MMM d")}`
                                : `Expired ${formatDistanceToNow(expiresAt, { addSuffix: true })}`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" asChild className="ml-4">
                        <Link to={`/agency/codes/${code.id}`}>View</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
