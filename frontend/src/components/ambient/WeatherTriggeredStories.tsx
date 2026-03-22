import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  Cloud,
  CloudRain,
  CloudFog,
  Sun,
  Snowflake,
  Wind,
  Thermometer,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "rain"
  | "fog"
  | "wind"
  | "storm";

interface WeatherContextType {
  weather: WeatherCondition;
  temperature: number; // Celsius
  suggestedStoryTypes: string[];
  weatherMood: "cozy" | "adventurous" | "reflective" | "energetic";
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    return {
      weather: "clear" as WeatherCondition,
      temperature: 22,
      suggestedStoryTypes: ["travel", "culture"],
      weatherMood: "adventurous" as const,
    };
  }
  return context;
}

const weatherStoryMapping: Record<
  WeatherCondition,
  { types: string[]; mood: WeatherContextType["weatherMood"]; message: string }
> = {
  clear: {
    types: ["travel", "culture", "adventure"],
    mood: "adventurous",
    message: "Perfect weather for exploring!",
  },
  cloudy: {
    types: ["historical", "remembrance", "reflection"],
    mood: "reflective",
    message: "A thoughtful day for deeper stories",
  },
  rain: {
    types: ["indoor", "museum", "cozy"],
    mood: "cozy",
    message: "Rainy day? Perfect for indoor stories",
  },
  fog: {
    types: ["mystery", "historical", "remembrance"],
    mood: "reflective",
    message: "Misty atmosphere for contemplative tales",
  },
  wind: {
    types: ["nature", "landscape", "adventure"],
    mood: "energetic",
    message: "Feel the energy of the hills",
  },
  storm: {
    types: ["indoor", "survival", "resilience"],
    mood: "cozy",
    message: "Stay safe with stories of resilience",
  },
};

const weatherIcons: Record<WeatherCondition, React.ElementType> = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  fog: CloudFog,
  wind: Wind,
  storm: CloudRain,
};

interface WeatherProviderProps {
  children: ReactNode;
  forceWeather?: WeatherCondition;
}

export function WeatherProvider({
  children,
  forceWeather,
}: WeatherProviderProps) {
  const [weather, setWeather] = useState<WeatherCondition>(
    forceWeather || "clear",
  );
  const [temperature, setTemperature] = useState(22);

  useEffect(() => {
    if (forceWeather) {
      setWeather(forceWeather);
      return;
    }

    // In a real app, this would fetch from a weather API
    // For demo, simulate weather changes
    const conditions: WeatherCondition[] = ["clear", "cloudy", "rain", "fog"];
    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];
    setWeather(randomCondition);
    setTemperature(15 + Math.floor(Math.random() * 15)); // 15-30°C
  }, [forceWeather]);

  const mapping = weatherStoryMapping[weather];

  const value: WeatherContextType = {
    weather,
    temperature,
    suggestedStoryTypes: mapping.types,
    weatherMood: mapping.mood,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

// Weather-triggered story suggestion
interface WeatherStorySuggestionProps {
  onAccept: (storyTypes: string[]) => void;
  onDismiss: () => void;
  className?: string;
}

export function WeatherStorySuggestion({
  onAccept,
  onDismiss,
  className,
}: WeatherStorySuggestionProps) {
  const { weather, temperature, suggestedStoryTypes, weatherMood } =
    useWeather();
  const [isVisible, setIsVisible] = useState(true);

  const Icon = weatherIcons[weather];
  const mapping = weatherStoryMapping[weather];

  if (!isVisible) return null;

  const moodColors: Record<WeatherContextType["weatherMood"], string> = {
    cozy: "from-terracotta/20 to-sand/30",
    adventurous: "from-adventure-green/20 to-sky-blue/20",
    reflective: "from-muted-indigo/20 to-soft-lavender/20",
    energetic: "from-amber/20 to-sunset-gold/20",
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden shadow-card border border-border/50",
        className,
      )}
    >
      {/* Gradient header based on mood */}
      <div
        className={cn("px-4 py-3 bg-gradient-to-r", moodColors[weatherMood])}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {mapping.message}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                {temperature}°C •{" "}
                {weather.charAt(0).toUpperCase() + weather.slice(1)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Suggested story types */}
      <div className="p-4 bg-card">
        <p className="text-xs text-muted-foreground mb-3">
          Recommended for this weather:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedStoryTypes.map((type) => (
            <span
              key={type}
              className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground capitalize"
            >
              {type}
            </span>
          ))}
        </div>

        <button
          onClick={() => onAccept(suggestedStoryTypes)}
          className="w-full mt-4 h-10 bg-amber text-midnight rounded-xl font-semibold text-sm hover:bg-sunset-gold transition-colors"
        >
          Show weather-matched stories
        </button>
      </div>
    </div>
  );
}

// Map overlay for weather visualization
export function WeatherMapOverlay() {
  const { weather } = useWeather();

  const overlayStyles: Record<WeatherCondition, React.CSSProperties> = {
    clear: {},
    cloudy: {
      background:
        "linear-gradient(180deg, rgba(200, 200, 210, 0.1) 0%, transparent 50%)",
    },
    rain: {
      background:
        "linear-gradient(180deg, rgba(100, 120, 140, 0.15) 0%, rgba(80, 100, 120, 0.1) 100%)",
    },
    fog: {
      background:
        "linear-gradient(180deg, rgba(220, 220, 230, 0.3) 0%, rgba(200, 200, 210, 0.2) 100%)",
      backdropFilter: "blur(1px)",
    },
    wind: {},
    storm: {
      background:
        "linear-gradient(180deg, rgba(60, 70, 90, 0.2) 0%, rgba(40, 50, 70, 0.15) 100%)",
    },
  };

  if (weather === "clear" || weather === "wind") return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 transition-all duration-1000"
      style={overlayStyles[weather]}
    >
      {/* Rain animation */}
      {weather === "rain" && (
        <svg className="absolute inset-0 w-full h-full opacity-30">
          {Array.from({ length: 50 }).map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * -20}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100 + 20}%`}
              stroke="rgba(150, 170, 190, 0.4)"
              strokeWidth="1"
            >
              <animate
                attributeName="y1"
                from="-10%"
                to="110%"
                dur={`${0.5 + Math.random() * 0.5}s`}
                repeatCount="indefinite"
                begin={`${Math.random() * 2}s`}
              />
              <animate
                attributeName="y2"
                from="0%"
                to="120%"
                dur={`${0.5 + Math.random() * 0.5}s`}
                repeatCount="indefinite"
                begin={`${Math.random() * 2}s`}
              />
            </line>
          ))}
        </svg>
      )}

      {/* Fog particles */}
      {weather === "fog" && (
        <svg className="absolute inset-0 w-full h-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <ellipse
              key={i}
              cx={`${20 + i * 20}%`}
              cy={`${30 + Math.sin(i) * 20}%`}
              rx="30%"
              ry="15%"
              fill="rgba(230, 235, 240, 0.3)"
            >
              <animate
                attributeName="cx"
                values={`${20 + i * 20}%;${25 + i * 20}%;${20 + i * 20}%`}
                dur={`${10 + i * 2}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          ))}
        </svg>
      )}
    </div>
  );
}
