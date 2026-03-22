import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Sun, Moon, Sunrise, Sunset } from "lucide-react";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface TimeOfDayContextType {
  timeOfDay: TimeOfDay;
  isNightMode: boolean;
  themeOverrides: {
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    accentGlow: string;
  };
}

const TimeOfDayContext = createContext<TimeOfDayContextType | null>(null);

export function useTimeOfDay() {
  const context = useContext(TimeOfDayContext);
  if (!context) {
    return {
      timeOfDay: "afternoon" as TimeOfDay,
      isNightMode: false,
      themeOverrides: {
        background: "hsl(var(--cloud-mist))",
        cardBackground: "hsl(var(--pure-white))",
        textPrimary: "hsl(var(--midnight))",
        textSecondary: "hsl(var(--muted-indigo))",
        accentGlow: "rgba(255, 184, 92, 0.3)",
      },
    };
  }
  return context;
}

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
};

const timeThemes: Record<TimeOfDay, TimeOfDayContextType["themeOverrides"]> = {
  morning: {
    background: "hsl(40 30% 96%)", // Warm cloud mist
    cardBackground: "hsl(0 0% 100%)",
    textPrimary: "hsl(214 68% 11%)",
    textSecondary: "hsl(224 19% 37%)",
    accentGlow: "rgba(255, 200, 120, 0.3)", // Sunrise glow
  },
  afternoon: {
    background: "hsl(40 11% 96%)",
    cardBackground: "hsl(0 0% 100%)",
    textPrimary: "hsl(214 68% 11%)",
    textSecondary: "hsl(224 19% 37%)",
    accentGlow: "rgba(255, 184, 92, 0.3)",
  },
  evening: {
    background: "hsl(25 20% 94%)", // Warm sunset tint
    cardBackground: "hsl(30 15% 98%)",
    textPrimary: "hsl(214 68% 11%)",
    textSecondary: "hsl(224 19% 37%)",
    accentGlow: "rgba(255, 140, 80, 0.4)", // Sunset orange
  },
  night: {
    background: "hsl(214 50% 12%)", // Deep midnight
    cardBackground: "hsl(214 45% 18%)",
    textPrimary: "hsl(40 11% 96%)",
    textSecondary: "hsl(210 18% 76%)",
    accentGlow: "rgba(180, 200, 255, 0.2)", // Soft starlight
  },
};

const timeIcons: Record<TimeOfDay, React.ElementType> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

interface TimeOfDayProviderProps {
  children: ReactNode;
  forceTimeOfDay?: TimeOfDay;
}

export function TimeOfDayProvider({ children, forceTimeOfDay }: TimeOfDayProviderProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(forceTimeOfDay || getTimeOfDay());

  useEffect(() => {
    if (forceTimeOfDay) {
      setTimeOfDay(forceTimeOfDay);
      return;
    }

    // Update every minute
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => clearInterval(interval);
  }, [forceTimeOfDay]);

  const value: TimeOfDayContextType = {
    timeOfDay,
    isNightMode: timeOfDay === "night",
    themeOverrides: timeThemes[timeOfDay],
  };

  return (
    <TimeOfDayContext.Provider value={value}>
      {children}
    </TimeOfDayContext.Provider>
  );
}

// Visual indicator component
interface TimeOfDayIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function TimeOfDayIndicator({ className, showLabel = true }: TimeOfDayIndicatorProps) {
  const { timeOfDay, isNightMode } = useTimeOfDay();
  const Icon = timeIcons[timeOfDay];

  const labels: Record<TimeOfDay, string> = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Night mode",
  };

  return (
    <div className={className}>
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
        ${isNightMode 
          ? "bg-midnight/80 text-cloud-mist border border-white/10" 
          : "bg-white/80 text-midnight backdrop-blur-sm"
        }
      `}>
        <Icon className={`w-4 h-4 ${isNightMode ? "text-amber" : "text-sunset-gold"}`} />
        {showLabel && <span className="font-medium">{labels[timeOfDay]}</span>}
      </div>
    </div>
  );
}

// Night mode map overlay
export function NightModeMapOverlay() {
  const { isNightMode, themeOverrides } = useTimeOfDay();

  if (!isNightMode) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(255, 255, 200, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 40%, rgba(200, 220, 255, 0.02) 0%, transparent 40%),
          linear-gradient(180deg, rgba(10, 26, 47, 0.3) 0%, rgba(10, 26, 47, 0.5) 100%)
        `,
      }}
    >
      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 30 }).map((_, i) => (
          <circle
            key={i}
            cx={`${10 + Math.random() * 80}%`}
            cy={`${5 + Math.random() * 40}%`}
            r={Math.random() * 1.5 + 0.5}
            fill="white"
            opacity={Math.random() * 0.4 + 0.2}
          >
            <animate
              attributeName="opacity"
              values={`${Math.random() * 0.3 + 0.2};${Math.random() * 0.5 + 0.3};${Math.random() * 0.3 + 0.2}`}
              dur={`${2 + Math.random() * 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}
