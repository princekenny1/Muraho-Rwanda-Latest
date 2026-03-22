import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2, MapPin, Headphones, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);

  const sessionId = searchParams.get("session_id");
  const txRef = searchParams.get("ref");

  // Refresh user data to pick up new access tier
  useEffect(() => {
    const refresh = async () => {
      await refreshUser();
      setIsRefreshing(false);
    };
    // Give webhook a moment to process
    const timer = setTimeout(refresh, 2000);
    return () => clearTimeout(timer);
  }, [refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-adventure-green/5 to-background p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-adventure-green/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-adventure-green/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-adventure-green" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for supporting Muraho Rwanda. Your access has been activated.
          </p>
        </div>

        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Activating your access...
          </div>
        )}

        {/* What's unlocked */}
        <div className="bg-card rounded-xl p-6 space-y-4 border text-left">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Now Available
          </h3>
          <div className="space-y-3">
            {[
              { icon: MapPin, label: "Full museum experiences with audio guides" },
              { icon: Headphones, label: "All stories and testimonies" },
              { icon: Download, label: "Offline content downloads" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-adventure-green/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-adventure-green" />
                </div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/home")}
            className="w-full bg-adventure-green hover:bg-adventure-green/90"
            size="lg"
          >
            Start Exploring
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={() => navigate("/map")}
            variant="outline"
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Open Map
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {sessionId && `Ref: ${sessionId.slice(0, 20)}...`}
          {txRef && `Ref: ${txRef}`}
        </p>
      </div>
    </div>
  );
}
