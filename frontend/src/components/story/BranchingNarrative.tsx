import { useState } from "react";
import { ChevronRight, MapPin, User, History, Baby, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type NarrativePath = "location" | "testimony" | "historical" | "kids" | "summary";
export type JourneyMood = "emotional" | "educational" | "fast";

interface NarrativeChoice {
  id: NarrativePath;
  label: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  isAvailable: boolean;
}

interface BranchingNarrativeProps {
  storyId: string;
  currentPath: NarrativePath;
  journeyMood: JourneyMood;
  onPathChange: (path: NarrativePath) => void;
  onMoodChange: (mood: JourneyMood) => void;
  availablePaths?: NarrativePath[];
  className?: string;
}

const narrativeChoices: NarrativeChoice[] = [
  {
    id: "location",
    label: "Tell me about this place",
    description: "Geographic and cultural context",
    icon: MapPin,
    duration: "3 min",
    isAvailable: true,
  },
  {
    id: "testimony",
    label: "Show survivor testimony",
    description: "Personal voices and stories",
    icon: User,
    duration: "8 min",
    isAvailable: true,
  },
  {
    id: "historical",
    label: "Historical context",
    description: "Deeper historical background",
    icon: History,
    duration: "5 min",
    isAvailable: true,
  },
  {
    id: "kids",
    label: "Kids version",
    description: "Age-appropriate retelling",
    icon: Baby,
    duration: "4 min",
    isAvailable: true,
  },
  {
    id: "summary",
    label: "60-second summary",
    description: "Quick overview",
    icon: Sparkles,
    duration: "1 min",
    isAvailable: true,
  },
];

const moodOptions: { id: JourneyMood; label: string; description: string }[] = [
  { id: "emotional", label: "Emotional", description: "Deep, reflective experience" },
  { id: "educational", label: "Educational", description: "Focus on facts and context" },
  { id: "fast", label: "Fast Summary", description: "Quick overview mode" },
];

export function BranchingNarrative({
  storyId,
  currentPath,
  journeyMood,
  onPathChange,
  onMoodChange,
  availablePaths = ["location", "testimony", "historical", "kids", "summary"],
  className,
}: BranchingNarrativeProps) {
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const choices = narrativeChoices.map((choice) => ({
    ...choice,
    isAvailable: availablePaths.includes(choice.id),
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Journey mood selector */}
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
        <button
          onClick={() => setShowMoodPicker(!showMoodPicker)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Journey Mood</p>
              <p className="text-sm text-muted-foreground capitalize">{journeyMood}</p>
            </div>
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            showMoodPicker && "rotate-90"
          )} />
        </button>

        {showMoodPicker && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  onMoodChange(mood.id);
                  setShowMoodPicker(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                  journeyMood === mood.id
                    ? "bg-amber/20"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{mood.label}</p>
                  <p className="text-xs text-muted-foreground">{mood.description}</p>
                </div>
                {journeyMood === mood.id && (
                  <Check className="w-5 h-5 text-amber" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive story paths */}
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
        <h3 className="font-medium text-foreground mb-3">Choose how to explore</h3>
        
        <div className="space-y-2">
          {choices.map((choice) => {
            const Icon = choice.icon;
            const isActive = currentPath === choice.id;
            
            return (
              <button
                key={choice.id}
                onClick={() => choice.isAvailable && onPathChange(choice.id)}
                disabled={!choice.isAvailable}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  isActive
                    ? "bg-amber text-midnight"
                    : choice.isAvailable
                    ? "bg-muted/50 hover:bg-muted"
                    : "bg-muted/30 opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive 
                    ? "bg-midnight/20" 
                    : "bg-muted-foreground/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-midnight" : "text-muted-foreground"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    isActive ? "text-midnight" : "text-foreground"
                  )}>
                    {choice.label}
                  </p>
                  <p className={cn(
                    "text-xs",
                    isActive ? "text-midnight/70" : "text-muted-foreground"
                  )}>
                    {choice.description}
                  </p>
                </div>
                
                <div className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium",
                  isActive 
                    ? "bg-midnight/20 text-midnight" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {choice.duration}
                </div>
                
                <ChevronRight className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-midnight" : "text-muted-foreground"
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Current path indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-amber" />
        <span>Story adapts based on your choices</span>
      </div>
    </div>
  );
}
