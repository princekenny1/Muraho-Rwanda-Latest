import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Globe, Shield } from "lucide-react";
import { AppIcon } from "@/components/brand";

interface OnboardingSafetyProps {
  onNext: (settings: { language: string; showSensitive: boolean }) => void;
  onBack: () => void;
}

const languages = [
  { id: "en", label: "English" },
  { id: "rw", label: "Kinyarwanda" },
  { id: "fr", label: "Français" },
];

export function OnboardingSafety({ onNext, onBack }: OnboardingSafetyProps) {
  const [language, setLanguage] = useState("en");
  const [showSensitive, setShowSensitive] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-cloud-mist p-6">
      <div className="flex-1 flex flex-col justify-center">
        {/* Subtle MR Icon */}
        <div className="flex justify-center mb-6">
          <AppIcon size="sm" className="opacity-60" />
        </div>
        
        <div className="mb-8">
          <span className="text-amber text-sm font-medium">Step 2 of 3</span>
          <h1 className="font-serif text-2xl font-semibold text-midnight mt-2">
            Language & Safety
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your experience
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cloud-mist rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-midnight" />
            </div>
            <div>
              <h3 className="font-medium text-midnight">Language</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred language</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  language === lang.id
                    ? "bg-amber text-midnight"
                    : "bg-cloud-mist text-muted-foreground hover:bg-amber/10"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Toggle */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-muted-indigo/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-muted-indigo" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-midnight">Show sensitive content</h3>
                <Switch
                  checked={showSensitive}
                  onCheckedChange={setShowSensitive}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Some stories discuss events from 1994. When off, you'll see a warning before sensitive content.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button 
          variant="outline"
          className="flex-1" 
          size="lg"
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          className="flex-1" 
          size="lg"
          onClick={() => onNext({ language, showSensitive })}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
