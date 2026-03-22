import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentWarningProps {
  onContinue: () => void;
  onSkip: () => void;
}

export function ContentWarning({ onContinue, onSkip }: ContentWarningProps) {
  return (
    <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-up">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-modal animate-scale-in">
        <div className="w-12 h-12 bg-muted-indigo/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-muted-indigo" />
        </div>
        
        <h2 className="font-serif text-xl font-semibold text-midnight mb-2">
          Content Warning
        </h2>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          This story discusses events from 1994 and contains sensitive historical content. 
          You're in control of what you experience.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onSkip}
          >
            Skip Story
          </Button>
          <Button
            className="flex-1"
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
