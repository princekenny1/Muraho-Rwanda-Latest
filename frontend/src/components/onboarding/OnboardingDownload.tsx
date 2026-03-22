import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Clock, Wifi } from "lucide-react";
import kigaliHero from "@/assets/cover.jpg";
import { AppIcon } from "@/components/brand";

interface OnboardingDownloadProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function OnboardingDownload({
  onComplete,
  onSkip,
  onBack,
}: OnboardingDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cloud-mist p-6">
      <div className="flex-1 flex flex-col justify-center">
        {/* Subtle MR Icon */}
        <div className="flex justify-center mb-6">
          <AppIcon size="sm" className="opacity-60" />
        </div>

        <div className="mb-8">
          <span className="text-amber text-sm font-medium">Step 3 of 3</span>
          <h1 className="font-serif text-2xl font-semibold text-midnight mt-2">
            Download for Offline
          </h1>
          <p className="text-muted-foreground mt-2">
            Get the pilot route ready for your journey
          </p>
        </div>

        {/* Route Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-card">
          <div className="relative aspect-[2/1]">
            <img
              src={kigaliHero}
              alt="Kigali to Musanze route"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-serif text-lg font-semibold">
                Kigali → Musanze
              </h3>
              <p className="text-sm text-white/80 mt-1">
                Road Stories along the way
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                12 stories
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                ~2 hours
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Download className="w-4 h-4" />
                45 MB
              </span>
            </div>

            {isDownloading ? (
              <div className="space-y-2">
                <div className="h-2 bg-cloud-mist rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 100 ? `Downloading... ${progress}%` : "Complete!"}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-adventure-green/10 rounded-lg text-sm">
                <Wifi className="w-4 h-4 text-adventure-green" />
                <span className="text-adventure-green font-medium">
                  Recommended for areas with limited connectivity
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-6">
        {!isDownloading && (
          <>
            <Button className="w-full" size="lg" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Route Pack
            </Button>
            <Button variant="ghost" className="w-full" onClick={onSkip}>
              Skip for now
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
