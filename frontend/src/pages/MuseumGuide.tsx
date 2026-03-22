import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Info,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Map,
  Headphones,
  View,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { PanoramaViewer } from "@/components/vr/PanoramaViewer";
import { cn } from "@/lib/utils";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";

interface MuseumGuideProps {
  museumId: string;
  onBack: () => void;
}

const mockMuseum = {
  id: "kgm",
  name: "Kigali Genocide Memorial",
  hours: "8:00 AM - 5:00 PM",
  location: "KG 14 Ave, Gisozi, Kigali",
  coverImage: coverImg,
  overview:
    "The Kigali Genocide Memorial is the final resting place for more than 250,000 victims of the 1994 Genocide against the Tutsi.",
  etiquette: [
    "Photography is permitted in the gardens only",
    "Please maintain a respectful silence inside",
    "No food or drinks inside the memorial",
    "Guided tours are available in multiple languages",
  ],
  exhibitions: [
    {
      id: "ex-1",
      title: "The 1994 Genocide",
      description: "A chronological journey through the events of 1994",
      panelCount: 12,
      duration: "45 min",
      hasSensitiveContent: true,
      imageUrl: kctPost,
    },
    {
      id: "ex-2",
      title: "Children's Memorial",
      description: "Honoring the youngest victims",
      panelCount: 8,
      duration: "20 min",
      hasSensitiveContent: true,
      imageUrl: kctPrecolonial,
    },
    {
      id: "ex-3",
      title: "Memorial Gardens",
      description: "A space for reflection and remembrance",
      panelCount: 6,
      duration: "15 min",
      hasSensitiveContent: false,
      imageUrl: coverImg,
    },
  ],
};

type ViewMode = "overview" | "onsite";

export function MuseumGuide({ museumId, onBack }: MuseumGuideProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [activeExhibition, setActiveExhibition] = useState<string | null>(null);
  const [currentPanel, setCurrentPanel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  const museum = mockMuseum;
  const activeEx = museum.exhibitions.find((e) => e.id === activeExhibition);

  const handleExhibitionClick = (exhibitionId: string) => {
    // Navigate to the new exhibition panel page
    navigate("/exhibition");
  };

  const handleStartGuide = () => {
    setViewMode("onsite");
    setActiveExhibition(museum.exhibitions[0].id);
  };

  const handleNextPanel = () => {
    if (activeEx && currentPanel < activeEx.panelCount) {
      setCurrentPanel((prev) => prev + 1);
    }
  };

  const handlePrevPanel = () => {
    if (currentPanel > 1) {
      setCurrentPanel((prev) => prev - 1);
    }
  };

  // On-site Guide Mode
  if (viewMode === "onsite" && activeEx) {
    return (
      <div className="min-h-screen bg-midnight text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-midnight/95 backdrop-blur-sm border-b border-white/10 safe-area-pt">
          <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
            <button
              onClick={() => setViewMode("overview")}
              className="w-10 h-10 flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-xs text-white/60">On-Site Guide</p>
              <h1 className="text-sm font-semibold">{activeEx.title}</h1>
            </div>
            <button className="w-10 h-10 flex items-center justify-center">
              <Map className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 page-content-narrow">
          {/* Panel indicator */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-white/60 text-sm">
              Panel {currentPanel} of {activeEx.panelCount}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: activeEx.panelCount }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx + 1 === currentPanel ? "bg-amber" : "bg-white/20",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Panel content */}
          <div className="bg-white/5 rounded-2xl p-5 mb-6">
            <h2 className="font-serif text-xl font-semibold mb-3">
              Panel {currentPanel}: The Beginning
            </h2>
            <p className="text-white/70 leading-relaxed">
              This panel describes the historical context leading up to the
              events of 1994, including the colonial legacy and growing
              tensions...
            </p>
          </div>

          {/* Audio player */}
          <AudioPlayer
            title={`Panel ${currentPanel} Audio`}
            subtitle={activeEx.title}
            duration={180}
            variant="compact"
          />

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevPanel}
              disabled={currentPanel === 1}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <Button
              size="lg"
              onClick={handleNextPanel}
              disabled={currentPanel === activeEx.panelCount}
              className="flex-1"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Exhibition selector */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-white/60 mb-3">
              Switch Exhibition
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {museum.exhibitions.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveExhibition(ex.id);
                    setCurrentPanel(1);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                    activeExhibition === ex.id
                      ? "bg-amber text-midnight"
                      : "bg-white/10 text-white/70 hover:bg-white/20",
                  )}
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Overview Mode
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64">
        <img
          src={museum.coverImage}
          alt={museum.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center safe-area-pt"
        >
          <ArrowLeft className="w-5 h-5 text-midnight" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="font-serif text-2xl font-semibold text-white">
            {museum.name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {museum.hours}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {museum.location.split(",")[0]}
            </span>
          </div>
        </div>
      </div>

      <main className="px-4 py-6 page-content-narrow">
        {/* CTAs */}
        <div className="flex gap-3 mb-4">
          <Button size="lg" className="flex-1" onClick={handleStartGuide}>
            <Headphones className="w-5 h-5 mr-2" />
            On-Site Guide
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => setShowVirtualTour(true)}
          >
            <View className="w-5 h-5 mr-2" />
            Virtual Tour
          </Button>
        </div>

        {/* Exhibition Quick Access */}
        <Button
          size="lg"
          variant="secondary"
          className="w-full mb-6"
          onClick={() => navigate("/exhibition")}
        >
          <Play className="w-5 h-5 mr-2" />
          Explore Exhibition Panels
          <ChevronRight className="w-5 h-5 ml-auto" />
        </Button>

        {/* Overview */}
        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-2">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            {museum.overview}
          </p>
        </div>

        {/* Etiquette */}
        <div className="mb-6 p-4 bg-muted-indigo/5 rounded-xl border-l-4 border-muted-indigo">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-muted-indigo" />
            <h3 className="font-medium text-foreground text-sm">
              Visitor Etiquette
            </h3>
          </div>
          <ul className="space-y-1.5">
            {museum.etiquette.map((item, idx) => (
              <li
                key={idx}
                className="text-muted-foreground text-sm flex items-start gap-2"
              >
                <span className="text-muted-indigo">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Exhibitions */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Exhibitions</h2>
          <div className="space-y-3">
            {museum.exhibitions.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleExhibitionClick(ex.id)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={ex.imageUrl}
                    alt={ex.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">
                      {ex.title}
                    </h4>
                    {ex.hasSensitiveContent && (
                      <AlertTriangle className="w-4 h-4 text-muted-indigo flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                    {ex.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{ex.panelCount} panels</span>
                    <span>•</span>
                    <span>{ex.duration}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Virtual Tour Panorama Viewer */}
      {showVirtualTour && (
        <PanoramaViewer
          onClose={() => setShowVirtualTour(false)}
          isGuidedMode={false}
        />
      )}
    </div>
  );
}
