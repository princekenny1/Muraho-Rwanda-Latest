import { useState } from "react";
import { Cloud, CloudRain, CloudFog, Sun, Wind, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeather, WeatherCondition } from "@/components/ambient/WeatherTriggeredStories";

const weatherIcons: Record<WeatherCondition, React.ElementType> = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  fog: CloudFog,
  wind: Wind,
  storm: CloudRain,
};

const weatherMessages: Record<WeatherCondition, string> = {
  clear: "Great day to explore!",
  cloudy: "Thoughtful weather for reflection",
  rain: "Rainy Day – indoor stories recommended",
  fog: "Misty atmosphere – contemplative tales",
  wind: "Feel the energy of the hills",
  storm: "Stay safe – resilience stories",
};

interface WeatherChipProps {
  onViewWeatherStories?: () => void;
  className?: string;
}

export function WeatherChip({ onViewWeatherStories, className }: WeatherChipProps) {
  const { weather, temperature } = useWeather();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show for certain weather conditions
  const shouldShow = weather !== "clear" && !isDismissed;

  if (!shouldShow) return null;

  const Icon = weatherIcons[weather];
  const message = weatherMessages[weather];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-full",
        "bg-muted/60 backdrop-blur-sm border border-border/50",
        "text-sm transition-all duration-300 max-h-12",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="font-medium text-foreground">{message}</span>
        <span className="text-xs opacity-70">{temperature}°C</span>
      </div>

      {onViewWeatherStories && (
        <button
          onClick={onViewWeatherStories}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/20 text-amber-700 dark:text-amber text-xs font-medium hover:bg-amber/30 transition-colors"
        >
          View Stories
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded-full hover:bg-muted-foreground/10 text-muted-foreground"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
