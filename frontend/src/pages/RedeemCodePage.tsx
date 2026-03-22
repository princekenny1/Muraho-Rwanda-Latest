import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContentAccess, TourGroupAccess } from "@/hooks/useContentAccess";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TourGroupBadge, QRCodeScanner } from "@/components/access";
import { ArrowLeft, Loader2, QrCode, Users, CheckCircle, Ticket } from "lucide-react";
import { toast } from "sonner";

export default function RedeemCodePage() {
  const { user, loading: authLoading } = useAuth();
  const { redeemCode, tourGroupAccess } = useContentAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<TourGroupAccess | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Check for code in URL params
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
    }
  }, [searchParams]);

  // Auto-redeem if code is in URL and user is logged in
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode && user && !authLoading && !redeemSuccess) {
      handleRedeem(urlCode);
    }
  }, [searchParams, user, authLoading]);

  const handleRedeem = async (codeToRedeem?: string) => {
    const finalCode = codeToRedeem || code;
    if (!finalCode.trim()) {
      toast.error("Please enter a code");
      return;
    }

    if (!user) {
      toast.error("Please sign in first");
      navigate(`/auth?redirect=/redeem?code=${finalCode}`);
      return;
    }

    setIsRedeeming(true);
    const result = await redeemCode(finalCode);
    setIsRedeeming(false);

    if (result.success && result.access) {
      setRedeemSuccess(result.access);
      toast.success("Access activated!");
    } else {
      toast.error(result.error || "Failed to redeem code");
    }
  };

  // Already has tour access
  if (tourGroupAccess && !redeemSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Tour Access" showSearch={false} />
        
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

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-adventure-green/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-adventure-green" />
              </div>
              <CardTitle>You Already Have Access</CardTitle>
              <CardDescription>
                Your tour group access is currently active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TourGroupBadge access={tourGroupAccess} variant="full" />
              <Button 
                className="w-full mt-6" 
                onClick={() => navigate("/")}
              >
                Start Exploring
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Success state
  if (redeemSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Tour Access" showSearch={false} />
        
        <main className="pt-14 pb-8 px-4 page-content-narrow">
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="w-20 h-20 rounded-full bg-adventure-green/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-adventure-green" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2">🎉 You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                Tour group access has been activated
              </p>

              <TourGroupBadge access={redeemSuccess} variant="full" className="mb-6" />

              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate("/")}>
                  Start Exploring
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/testimonies")}>
                  Browse Stories
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Redeem Code" showSearch={false} />
      
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

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-forest-teal/20 flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-forest-teal" />
            </div>
            <CardTitle>Enter Your Access Code</CardTitle>
            <CardDescription>
              Enter the code provided by your tour agency to unlock premium content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!user && !authLoading && (
              <div className="p-4 rounded-lg bg-amber/10 border border-amber/30 text-center">
                <p className="text-sm text-amber mb-3">
                  Please sign in to redeem your code
                </p>
                <Button 
                  onClick={() => navigate(`/auth?redirect=/redeem${code ? `?code=${code}` : ""}`)}
                  size="sm"
                >
                  Sign In
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Tour Group Code</Label>
              <Input
                id="code"
                placeholder="e.g., SAFARI2024"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono text-lg text-center tracking-wider"
                maxLength={12}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={() => handleRedeem()}
              disabled={isRedeeming || !code.trim() || (!user && !authLoading)}
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Activate Access
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowScanner(true)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>

            <QRCodeScanner
              open={showScanner}
              onOpenChange={setShowScanner}
              onScan={(scannedCode) => {
                setCode(scannedCode);
                // Auto-redeem if user is logged in
                if (user) {
                  handleRedeem(scannedCode);
                }
              }}
            />

            <p className="text-xs text-center text-muted-foreground">
              Codes are provided by tour agencies and grant temporary access to premium content.
              Contact your tour guide if you don't have a code.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
