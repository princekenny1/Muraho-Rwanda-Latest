import { AlertTriangle, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskRwandaSafetyBannerProps {
  variant?: "warning" | "info" | "gentle";
  message?: string;
  onRequestGentleSummary?: () => void;
}

const variantConfig = {
  warning: {
    icon: AlertTriangle,
    className: "bg-muted-indigo/10 border-muted-indigo/30 text-muted-indigo",
    defaultMessage: "This topic includes sensitive historical information. I will explain it respectfully.",
  },
  info: {
    icon: Shield,
    className: "bg-sky-blue/10 border-sky-blue/30 text-sky-500",
    defaultMessage: "Safe Mode is enabled. Content has been moderated for sensitivity.",
  },
  gentle: {
    icon: Heart,
    className: "bg-soft-lavender/30 border-soft-lavender text-muted-indigo",
    defaultMessage: "Would you like a gentler summary of this topic?",
  },
};

export function AskRwandaSafetyBanner({
  variant = "warning",
  message,
  onRequestGentleSummary,
}: AskRwandaSafetyBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border",
        config.className
      )}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed">
          {message || config.defaultMessage}
        </p>
        {variant === "warning" && onRequestGentleSummary && (
          <button
            onClick={onRequestGentleSummary}
            className="mt-2 text-xs font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Switch to a gentler summary
          </button>
        )}
      </div>
    </div>
  );
}
