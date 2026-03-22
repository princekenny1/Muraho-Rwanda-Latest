import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SponsoredBannerProps {
  sponsorName: string;
  sponsorLogo?: string | null;
  message?: string | null;
  variant?: "inline" | "banner";
  className?: string;
}

export function SponsoredBanner({ 
  sponsorName, 
  sponsorLogo, 
  message,
  variant = "inline",
  className 
}: SponsoredBannerProps) {
  if (variant === "banner") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-adventure-green/10 to-amber/10 border border-adventure-green/30 rounded-lg p-4",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-adventure-green/20 flex items-center justify-center">
            {sponsorLogo ? (
              <img src={sponsorLogo} alt={sponsorName} className="w-6 h-6 object-contain" />
            ) : (
              <Leaf className="w-5 h-5 text-adventure-green" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-adventure-green">
              Free for Everyone
            </p>
            <p className="text-xs text-muted-foreground">
              {message || `This experience is sponsored by ${sponsorName}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-adventure-green",
      className
    )}>
      <Leaf className="w-4 h-4" />
      <span>Sponsored by {sponsorName} — Free Access</span>
    </div>
  );
}
