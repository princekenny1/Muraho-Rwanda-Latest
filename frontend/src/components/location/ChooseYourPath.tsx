import { useState } from "react";
import { ChevronDown, ChevronUp, Compass, Heart, Brain, Zap, Smile, Book, Users, Baby, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type JourneyMood = "curious" | "emotional" | "calm" | "quick";
export type ExplorationStyle = "basic" | "personal" | "historical" | "kid-friendly";
export type ExperienceMode = "standard" | "personal-voices" | "kid-friendly";

interface ChooseYourPathProps {
  currentMood: JourneyMood;
  currentStyle: ExplorationStyle;
  currentMode: ExperienceMode;
  onApplyPath: (mood: JourneyMood, style: ExplorationStyle, mode: ExperienceMode) => void;
  className?: string;
}

const moods: { id: JourneyMood; label: string; icon: React.ElementType; description: string }[] = [
  { id: "curious", label: "Curious", icon: Compass, description: "Explore with wonder" },
  { id: "emotional", label: "Emotional", icon: Heart, description: "Connect deeply" },
  { id: "calm", label: "Calm", icon: Brain, description: "Peaceful reflection" },
  { id: "quick", label: "Quick Visit", icon: Zap, description: "Key highlights" },
];

const explorationStyles: { id: ExplorationStyle; label: string; icon: React.ElementType; description: string }[] = [
  { id: "basic", label: "Basic Storytelling", icon: Book, description: "Facts and context" },
  { id: "personal", label: "Personal Testimonies", icon: Users, description: "Human stories" },
  { id: "historical", label: "Historical Context", icon: Brain, description: "Deep background" },
  { id: "kid-friendly", label: "Kid-Friendly", icon: Baby, description: "Age-appropriate" },
];

const experienceModes: { id: ExperienceMode; label: string; description: string }[] = [
  { id: "standard", label: "Standard", description: "Balanced, factual presentation" },
  { id: "personal-voices", label: "Personal Voices", description: "Emotional, testimony-focused" },
  { id: "kid-friendly", label: "Kid-Friendly", description: "Simple, safe, friendly" },
];

export function ChooseYourPath({
  currentMood,
  currentStyle,
  currentMode,
  onApplyPath,
  className,
}: ChooseYourPathProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<JourneyMood>(currentMood);
  const [selectedStyle, setSelectedStyle] = useState<ExplorationStyle>(currentStyle);
  const [selectedMode, setSelectedMode] = useState<ExperienceMode>(currentMode);

  // Auto-select mode based on exploration style
  const handleStyleChange = (style: ExplorationStyle) => {
    setSelectedStyle(style);
    if (style === "kid-friendly") {
      setSelectedMode("kid-friendly");
    } else if (style === "personal") {
      setSelectedMode("personal-voices");
    }
  };

  const handleApply = () => {
    onApplyPath(selectedMood, selectedStyle, selectedMode);
    setIsExpanded(false);
  };

  const getModeLabel = () => {
    const modeInfo = experienceModes.find((m) => m.id === currentMode);
    const styleInfo = explorationStyles.find((s) => s.id === currentStyle);
    return `${modeInfo?.label || "Standard"} • ${styleInfo?.label || "Basic"}`;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Collapsed State - Primary CTA */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "w-full flex items-center justify-between gap-4 p-4 rounded-2xl",
            "bg-gradient-to-r from-muted-indigo to-accent-violet text-white",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "group"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Choose Your Path</p>
              <p className="text-sm text-white/80">Personalize how you explore this place</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 opacity-70 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Applied State Badge */}
      {!isExpanded && currentMode !== "standard" && (
        <div className="mt-3 flex items-center justify-between px-4 py-2 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-adventure-green" />
            <span className="text-sm font-medium">Your Path: {getModeLabel()}</span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-muted-indigo hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-muted-indigo" />
              <span className="font-semibold">Customize Your Journey</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Journey Mood */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Journey Mood</h4>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((mood) => {
                  const Icon = mood.icon;
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border transition-all",
                        isSelected
                          ? "border-muted-indigo bg-muted-indigo/10 text-muted-indigo"
                          : "border-border hover:border-muted-indigo/50 hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{mood.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exploration Style */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Exploration Style</h4>
              <div className="space-y-2">
                {explorationStyles.map((style) => {
                  const Icon = style.icon;
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStyleChange(style.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                        isSelected
                          ? "border-muted-indigo bg-muted-indigo/10"
                          : "border-border hover:border-muted-indigo/50 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-muted-indigo text-white" : "bg-muted"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className={cn("text-sm font-medium", isSelected && "text-muted-indigo")}>
                          {style.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-muted-indigo" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Mode */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Experience Mode</h4>
              <div className="flex gap-2">
                {experienceModes.map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  const isForced =
                    (selectedStyle === "kid-friendly" && mode.id === "kid-friendly") ||
                    (selectedStyle === "personal" && mode.id === "personal-voices");
                  return (
                    <button
                      key={mode.id}
                      onClick={() => !isForced && setSelectedMode(mode.id)}
                      disabled={isForced && mode.id !== selectedMode}
                      className={cn(
                        "flex-1 p-3 rounded-xl border text-center transition-all",
                        isSelected
                          ? "border-muted-indigo bg-muted-indigo text-white"
                          : "border-border hover:border-muted-indigo/50",
                        isForced && !isSelected && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <p className="text-sm font-medium">{mode.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply Button */}
            <Button onClick={handleApply} className="w-full" size="lg" variant="museum">
              Apply Path
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
