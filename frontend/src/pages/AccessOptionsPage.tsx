import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContentAccess } from "@/hooks/useContentAccess";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AccessStatusWidget } from "@/components/access/AccessStatusWidget";
import { TourGroupBadge } from "@/components/access";
import {
  ArrowLeft,
  Crown,
  ShoppingBag,
  Gift,
  Ticket,
  QrCode,
  ChevronRight,
  Loader2,
  CheckCircle,
  Sparkles,
  MapPin,
  Headphones,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function AccessOptionsPage() {
  const { user } = useAuth();
  const { redeemCode, tourGroupAccess, hasSubscription } = useContentAccess();
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const handleRedeemCode = async () => {
    if (!codeInput.trim()) {
      toast.error("Please enter a code");
      return;
    }

    if (!user) {
      toast.error("Please sign in first");
      navigate(`/auth?redirect=/access`);
      return;
    }

    setIsRedeeming(true);
    const result = await redeemCode(codeInput);
    setIsRedeeming(false);

    if (result.success) {
      setRedeemSuccess(true);
      toast.success("Access activated!");
    } else {
      toast.error(result.error || "Failed to redeem code");
    }
  };

  // If code was just redeemed successfully
  if (redeemSuccess && tourGroupAccess) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Access" showSearch={false} />

        <main className="pt-14 pb-8 px-4 page-content-narrow">
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-20 h-20 rounded-full bg-adventure-green/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-adventure-green" />
              </div>

              <h2 className="text-2xl font-semibold mb-2">🎉 Access Granted!</h2>
              <p className="text-muted-foreground mb-6">You now have full access</p>

              <TourGroupBadge access={tourGroupAccess} variant="full" className="mb-6" />

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
      <AppHeader title="Access Options" showSearch={false} />

      <main className="pt-14 pb-8 px-4 page-content-narrow space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Current Access Status */}
        <AccessStatusWidget variant="full" />

        <Separator />

        {/* Access Options */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-semibold">Access Options</h2>

          <RadioGroup
            value={selectedOption || ""}
            onValueChange={setSelectedOption}
            className="space-y-4"
          >
            {/* Subscribe Option */}
            {!hasSubscription && (
              <Label
                htmlFor="subscribe"
                className={`cursor-pointer block rounded-xl border-2 p-4 transition-all ${
                  selectedOption === "subscribe"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="subscribe" id="subscribe" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-amber" />
                      <span className="font-semibold">Subscribe for Full Access</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unlimited content, testimonies, routes. Offline access + personal journey mode.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3 h-3" /> All stories
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> All routes
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> Offline mode
                      </span>
                    </div>
                    <p className="text-sm font-medium">$9.99/month or $79.99/year</p>
                  </div>
                </div>
              </Label>
            )}

            {/* Purchase Specific Content */}
            <Label
              htmlFor="purchase"
              className={`cursor-pointer block rounded-xl border-2 p-4 transition-all ${
                selectedOption === "purchase"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="purchase" id="purchase" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-5 h-5 text-forest-teal" />
                    <span className="font-semibold">Unlock Specific Story</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    One-time purchase for individual stories or routes.
                  </p>
                  <p className="text-sm font-medium">From $1.99</p>
                </div>
              </div>
            </Label>

            {/* Free Content */}
            <Label
              htmlFor="free"
              className={`cursor-pointer block rounded-xl border-2 p-4 transition-all ${
                selectedOption === "free"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="free" id="free" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-5 h-5 text-muted-indigo" />
                    <span className="font-semibold">Explore Free Stories</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sponsored + open-access content available to everyone.
                  </p>
                </div>
              </div>
            </Label>

            {/* Tour Code */}
            {!tourGroupAccess && (
              <div
                className={`rounded-xl border-2 p-4 transition-all ${
                  selectedOption === "code"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem
                    value="code"
                    id="code"
                    className="mt-1"
                    onClick={() => setSelectedOption("code")}
                  />
                  <div className="flex-1">
                    <Label htmlFor="code" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="w-5 h-5 text-adventure-green" />
                        <span className="font-semibold">Have a Tour Code?</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enter code or scan QR to get access from your tour agency.
                      </p>
                    </Label>

                    {selectedOption === "code" && (
                      <div className="space-y-3 mt-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter 8-digit code"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                            className="font-mono tracking-wider"
                            maxLength={12}
                          />
                          <Button
                            onClick={handleRedeemCode}
                            disabled={isRedeeming || !codeInput.trim()}
                          >
                            {isRedeeming ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          <QrCode className="w-4 h-4 mr-2" />
                          Scan QR Code
                          <span className="ml-1 text-xs text-muted-foreground">(Coming Soon)</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </RadioGroup>
        </div>

        {/* Action Button */}
        {selectedOption && selectedOption !== "code" && (
          <div className="pt-2">
            {selectedOption === "subscribe" && (
              <Button className="w-full" size="lg" disabled>
                <Crown className="w-4 h-4 mr-2" />
                Subscribe Now
                <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
              </Button>
            )}
            {selectedOption === "purchase" && (
              <Button className="w-full" size="lg" asChild>
                <Link to="/">
                  Browse Premium Content
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
            {selectedOption === "free" && (
              <Button className="w-full" size="lg" variant="outline" asChild>
                <Link to="/">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Free Content
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Sign In Prompt */}
        {!user && (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to save your progress and unlock more features
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/auth?redirect=/access">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
