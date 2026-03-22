/**
 * AccessOptionsModal — Content access/payment modal
 * ==================================================
 * Migration: Minimal changes — hook interfaces preserved.
 * Changes: Added Stripe checkout trigger, Flutterwave integration placeholder.
 *
 * Stripe flow: Create checkout session → redirect to Stripe hosted page
 * Flutterwave flow: Initialize inline popup → handle callback
 */

import { useState } from "react";
import { Lock, CreditCard, Users, Sparkles, Check, QrCode, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ContentAccessConfig, useContentAccess } from "@/hooks/useContentAccess";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { QRCodeScanner } from "./QRCodeScanner";
import { api } from "@/lib/api/client";

interface AccessOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ContentAccessConfig | null;
  contentTitle?: string;
  onAccessGranted?: () => void;
}

export function AccessOptionsModal({
  open,
  onOpenChange,
  config,
  contentTitle,
  onAccessGranted,
}: AccessOptionsModalProps) {
  const { user } = useAuth();
  const { redeemCode, tourGroupAccess } = useContentAccess();
  const navigate = useNavigate();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleRedeemCode = async (codeToRedeem?: string) => {
    const finalCode = codeToRedeem || code;
    if (!finalCode.trim()) return;

    setIsRedeeming(true);
    const result = await redeemCode(finalCode);
    setIsRedeeming(false);

    if (result.success) {
      toast.success(`🎉 Tour group access activated! Valid for ${result.access?.agencyName}`);
      onOpenChange(false);
      onAccessGranted?.();
    } else {
      toast.error(result.error || "Failed to redeem code");
    }
  };

  // ── Stripe subscription checkout ──────────────────

  const handleSubscribe = async (plan: "monthly" | "annual" = "monthly") => {
    if (!user) return;

    setIsCheckingOut(true);
    try {
      const { checkoutUrl } = await api.create("payments/create-checkout" as any, {
        type: "subscription",
        plan,
        gateway: "stripe",
        returnUrl: window.location.href,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (err) {
      toast.error("Payment system unavailable. Please try again later.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ── One-time purchase ─────────────────────────────

  const handlePurchase = async () => {
    if (!config?.price_cents || !user) return;

    setIsCheckingOut(true);
    try {
      const { checkoutUrl } = await api.create("payments/create-checkout" as any, {
        type: "one_time",
        amount: config.price_cents,
        gateway: "stripe",
        returnUrl: window.location.href,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (err) {
      toast.error("Payment system unavailable. Please try again later.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSignIn = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isSponsored = config?.tier === "sponsored" && config?.sponsor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-indigo" />
            Access This Content
          </DialogTitle>
          <DialogDescription>
            {contentTitle
              ? `Choose how you'd like to access "${contentTitle}"`
              : "Choose how you'd like to access this content"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Sponsored Access */}
          {isSponsored && (
            <>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onAccessGranted?.();
                }}
                className="w-full p-4 rounded-lg border-2 border-adventure-green bg-adventure-green/5 hover:bg-adventure-green/10 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-adventure-green/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-adventure-green" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-adventure-green">Sponsored — Free Access</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Provided free by {config!.sponsor!.name}
                    </p>
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-3 bg-adventure-green hover:bg-adventure-green/90"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Enjoy for Free
                    </Button>
                  </div>
                </div>
              </button>
              <Separator />
            </>
          )}

          {/* Sign in required */}
          {!user && (
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to access premium content
              </p>
              <Button onClick={handleSignIn}>Sign In</Button>
            </div>
          )}

          {user && !isSponsored && (
            <>
              {/* Subscription Option */}
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={isCheckingOut}
                className="w-full p-4 rounded-lg border-2 border-amber hover:bg-amber/5 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                    {isCheckingOut ? (
                      <Loader2 className="w-5 h-5 text-amber animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-amber" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Full Access Subscription</p>
                      <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Unlimited stories, testimonies, museums, offline access
                    </p>
                    <p className="text-sm font-medium text-amber mt-2">
                      $9.99/mo or $79.99/yr
                    </p>
                  </div>
                </div>
              </button>

              {/* Individual Purchase */}
              {config?.price_cents && (
                <button
                  onClick={handlePurchase}
                  disabled={isCheckingOut}
                  className="w-full p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Unlock This Item Only</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        One-time purchase, permanent access
                      </p>
                      <p className="text-sm font-medium mt-2">
                        {formatPrice(config.price_cents)}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              <Separator />

              {/* Tour Group Code */}
              {tourGroupAccess ? (
                <div className="p-4 rounded-lg bg-forest-teal/10 border border-forest-teal/30">
                  <div className="flex items-center gap-2 text-forest-teal">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Tour Group Access Active ({tourGroupAccess.agencyName})
                    </span>
                  </div>
                </div>
              ) : showCodeInput ? (
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <Label htmlFor="tour-code">Enter Tour Group Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tour-code"
                      placeholder="e.g., SAFARI24"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <Button
                      onClick={() => handleRedeemCode()}
                      disabled={isRedeeming || !code.trim()}
                    >
                      {isRedeeming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  <button
                    onClick={() => setShowCodeInput(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCodeInput(true)}
                  className="w-full p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest-teal/20 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-forest-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">I Have a Tour Group Code</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Enter code from your tour agency
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          Enter Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowScanner(true);
                          }}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          Scan QR
                        </Button>
                      </div>
                      <QRCodeScanner
                        open={showScanner}
                        onOpenChange={setShowScanner}
                        onScan={(scannedCode) => {
                          setCode(scannedCode);
                          setShowCodeInput(true);
                          handleRedeemCode(scannedCode);
                        }}
                      />
                    </div>
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
