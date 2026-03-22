import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Mountain, Waves, TreePine, Cloud, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type LandscapeFeature = "hills" | "lake" | "forest" | "valley" | "volcano";

interface LandscapeWhisper {
  id: string;
  feature: LandscapeFeature;
  fact: string;
  duration: number; // seconds
}

interface LandscapeSpeaksModeProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  currentLocation?: { lat: number; lng: number };
  className?: string;
}

const landscapeIcons: Record<LandscapeFeature, React.ElementType> = {
  hills: Mountain,
  lake: Waves,
  forest: TreePine,
  valley: Cloud,
  volcano: Mountain,
};

const landscapeFacts: Record<LandscapeFeature, string[]> = {
  hills: [
    "Rwanda is known as the 'Land of a Thousand Hills'",
    "These hills were formed by ancient tectonic activity",
    "The rolling terrain creates distinct microclimates",
    "Traditional Rwandan homes were built along hillsides",
  ],
  lake: [
    "Lake Kivu is one of Africa's Great Lakes",
    "The lake contains unique dissolved gases",
    "Fishing communities have thrived here for centuries",
    "The waters support diverse aquatic ecosystems",
  ],
  forest: [
    "Nyungwe Forest is one of Africa's oldest rainforests",
    "Home to 13 primate species including chimpanzees",
    "The canopy walk offers views across the treetops",
    "Over 300 bird species nest in these ancient trees",
  ],
  valley: [
    "Rwanda's valleys are fertile agricultural regions",
    "Terraced farming maximizes the landscape",
    "Rivers flow through creating natural corridors",
    "These lowlands connect communities across hills",
  ],
  volcano: [
    "The Virunga volcanoes shelter mountain gorillas",
    "Mount Karisimbi is Rwanda's highest peak",
    "Volcanic soil makes this region incredibly fertile",
    "Dian Fossey studied gorillas in these mountains",
  ],
};

// Simulate spatial audio direction
const getAudioDirection = (feature: LandscapeFeature): "left" | "center" | "right" => {
  const directions: Record<LandscapeFeature, "left" | "center" | "right"> = {
    hills: "left",
    lake: "center",
    forest: "right",
    valley: "center",
    volcano: "left",
  };
  return directions[feature];
};

export function LandscapeSpeaksMode({
  isEnabled,
  onToggle,
  currentLocation,
  className,
}: LandscapeSpeaksModeProps) {
  const [activeWhisper, setActiveWhisper] = useState<LandscapeWhisper | null>(null);
  const [whisperHistory, setWhisperHistory] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulate detecting nearby landscape features
  const detectNearbyFeatures = useCallback((): LandscapeFeature[] => {
    // In a real app, this would use GPS + GeoJSON data
    const allFeatures: LandscapeFeature[] = ["hills", "lake", "forest", "valley", "volcano"];
    return allFeatures.filter(() => Math.random() > 0.5);
  }, []);

  // Trigger whispers when enabled and moving
  useEffect(() => {
    if (!isEnabled) {
      setActiveWhisper(null);
      return;
    }

    const triggerWhisper = () => {
      const features = detectNearbyFeatures();
      if (features.length === 0) return;

      const feature = features[Math.floor(Math.random() * features.length)];
      const facts = landscapeFacts[feature];
      const unusedFacts = facts.filter(f => !whisperHistory.includes(f));
      
      if (unusedFacts.length === 0) return;
      
      const fact = unusedFacts[Math.floor(Math.random() * unusedFacts.length)];

      setActiveWhisper({
        id: `${Date.now()}`,
        feature,
        fact,
        duration: 8,
      });
      setWhisperHistory(prev => [...prev, fact]);
      setIsPlaying(true);
    };

    // Trigger first whisper
    const initialDelay = setTimeout(triggerWhisper, 3000);
    
    // Random whispers every 30-60 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to trigger
        triggerWhisper();
      }
    }, 30000 + Math.random() * 30000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [isEnabled, detectNearbyFeatures, whisperHistory]);

  // Auto-dismiss whisper
  useEffect(() => {
    if (!activeWhisper) return;

    const timeout = setTimeout(() => {
      setActiveWhisper(null);
      setIsPlaying(false);
    }, activeWhisper.duration * 1000);

    return () => clearTimeout(timeout);
  }, [activeWhisper]);

  return (
    <div className={className}>
      {/* Toggle control */}
      <button
        onClick={() => onToggle(!isEnabled)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all",
          isEnabled
            ? "bg-adventure-green/20 border-2 border-adventure-green text-adventure-green"
            : "bg-muted border-2 border-transparent text-muted-foreground hover:bg-muted/80"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span className="font-medium text-sm">Landscape Speaks</span>
        {isEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>

      {/* Active whisper overlay */}
      {activeWhisper && (
        <div 
          className="fixed bottom-32 left-4 right-4 z-40 animate-fade-in"
          style={{ 
            animationDuration: '0.5s',
          }}
        >
          <div 
            className={cn(
              "bg-gradient-to-r from-forest-teal/95 to-adventure-green/95 backdrop-blur-sm",
              "rounded-2xl p-4 shadow-lg border border-white/20"
            )}
          >
            {/* Spatial audio indicator */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = landscapeIcons[activeWhisper.feature];
                  return <Icon className="w-5 h-5 text-white/80" />;
                })()}
                <span className="text-xs font-medium text-white/70 capitalize">
                  {activeWhisper.feature} whispers...
                </span>
              </div>
              
              {/* Spatial direction indicator */}
              <div className="flex items-center gap-1">
                {["left", "center", "right"].map((dir) => (
                  <div
                    key={dir}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      getAudioDirection(activeWhisper.feature) === dir
                        ? "bg-white scale-125"
                        : "bg-white/30"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Fact text with typewriter effect simulation */}
            <p className="text-white font-medium text-sm leading-relaxed">
              "{activeWhisper.fact}"
            </p>

            {/* Audio visualizer */}
            {isPlaying && (
              <div className="flex items-center justify-center gap-1 mt-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-white/60 rounded-full animate-bounce"
                    style={{
                      height: `${8 + Math.random() * 12}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '0.5s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
