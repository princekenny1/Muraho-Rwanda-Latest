import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  History, 
  Building, 
  Mountain, 
  UtensilsCrossed, 
  Palette 
} from "lucide-react";
import { BrandLogo } from "@/components/brand";

interface OnboardingInterestsProps {
  onNext: (interests: string[]) => void;
}

const interests = [
  { id: "remembrance", label: "Remembrance", icon: Heart, color: "muted-indigo" },
  { id: "history", label: "History", icon: History, color: "muted-indigo" },
  { id: "city", label: "City Development", icon: Building, color: "terracotta" },
  { id: "nature", label: "Nature", icon: Mountain, color: "adventure-green" },
  { id: "food", label: "Food & Culture", icon: UtensilsCrossed, color: "terracotta" },
  { id: "art", label: "Art & Nightlife", icon: Palette, color: "accent-violet" },
];

export function OnboardingInterests({ onNext }: OnboardingInterestsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-cloud-mist p-6">
      <div className="flex-1 flex flex-col justify-center">
        {/* Brand Logo - First Screen */}
        <div className="flex justify-center mb-8">
          <BrandLogo size="lg" />
        </div>
        
        <div className="mb-8">
          <span className="text-amber text-sm font-medium">Step 1 of 3</span>
          <h1 className="font-serif text-2xl font-semibold text-midnight mt-2">
            What would you like to explore?
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose your interests to personalize your journey
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {interests.map((interest) => {
            const isSelected = selected.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200",
                  isSelected 
                    ? "border-amber bg-amber/10" 
                    : "border-transparent bg-white hover:border-amber/30"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                  isSelected ? "bg-amber" : "bg-cloud-mist"
                )}>
                  <interest.icon 
                    className={cn(
                      "w-5 h-5",
                      isSelected ? "text-midnight" : "text-muted-foreground"
                    )} 
                  />
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-midnight" : "text-muted-foreground"
                )}>
                  {interest.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button 
        className="w-full mt-6" 
        size="lg"
        disabled={selected.length === 0}
        onClick={() => onNext(selected)}
      >
        Continue
      </Button>
    </div>
  );
}
