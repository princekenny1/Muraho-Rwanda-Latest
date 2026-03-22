import { useState } from "react";
import { OnboardingInterests } from "@/components/onboarding/OnboardingInterests";
import { OnboardingSafety } from "@/components/onboarding/OnboardingSafety";
import { OnboardingDownload } from "@/components/onboarding/OnboardingDownload";

interface OnboardingProps {
  onComplete: () => void;
}

type Step = "interests" | "safety" | "download";

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>("interests");
  const [userPrefs, setUserPrefs] = useState({
    interests: [] as string[],
    language: "en",
    showSensitive: false,
  });

  const handleInterests = (interests: string[]) => {
    setUserPrefs(prev => ({ ...prev, interests }));
    setStep("safety");
  };

  const handleSafety = (settings: { language: string; showSensitive: boolean }) => {
    setUserPrefs(prev => ({ ...prev, ...settings }));
    setStep("download");
  };

  switch (step) {
    case "interests":
      return <OnboardingInterests onNext={handleInterests} />;
    case "safety":
      return (
        <OnboardingSafety 
          onNext={handleSafety} 
          onBack={() => setStep("interests")} 
        />
      );
    case "download":
      return (
        <OnboardingDownload 
          onComplete={onComplete}
          onSkip={onComplete}
          onBack={() => setStep("safety")}
        />
      );
  }
}
