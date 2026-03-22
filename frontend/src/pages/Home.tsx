import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { SearchBar } from "@/components/home/SearchBar";
import { ChooseYourJourney } from "@/components/home/ChooseYourJourney";
import { PopularRoutes } from "@/components/home/PopularRoutes";
import { StoryThemes } from "@/components/home/StoryThemes";
import { FeaturedDocumentary } from "@/components/home/FeaturedDocumentary";
import { FeaturedFreeContent } from "@/components/home/FeaturedFreeContent";
import { PersonalDashboard } from "@/components/home/PersonalDashboard";
import { MapView } from "@/components/home/MapView";
import { useAllMapPoints } from "@/hooks/useMapData";
import { StoryCard } from "@/components/story/StoryCard";
import { MiniPlayer } from "@/components/story/MiniPlayer";
import { ContentWarning } from "@/components/story/ContentWarning";
import { WelcomeCard, AccessStatusWidget } from "@/components/access";
import { useContentAccess } from "@/hooks/useContentAccess";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Building2 } from "lucide-react";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";

interface HomeProps {
  onStoryClick?: (storyId: string) => void;
  onRouteClick?: (routeId: string) => void;
  onThemesClick?: () => void;
  onMemorialsClick?: () => void;
  onMapClick?: () => void;
  onAskClick?: () => void;
  onTestimonyClick?: (testimonyId: string) => void;
  onDocumentaryClick?: (documentaryId: string) => void;
  onDocumentariesHubClick?: () => void;
}

// Map type mapping for MapView component
const typeToMode: Record<
  string,
  "remembrance" | "culture" | "travel" | "museum"
> = {
  museum: "museum",
  outdoor_stop: "remembrance",
  location: "travel",
  route_stop: "culture",
};

const featuredStory = {
  id: "featured",
  title: "The Thousand Hills: Rwanda's Living Landscape",
  subtitle: "A journey through the valleys and peaks that shaped a nation",
  duration: "18 min",
  mode: "travel" as const,
  imageUrl: coverImg,
  hasSensitiveContent: false,
};

const nearbyStories = [
  {
    id: "1",
    title: "Kigali Genocide Memorial",
    subtitle:
      "A place of remembrance and education, honoring the victims of 1994",
    duration: "15 min",
    distance: "1.2 km",
    mode: "remembrance" as const,
    imageUrl: kctPost,
    hasSensitiveContent: true,
  },
  {
    id: "2",
    title: "Nyamirambo Walking Tour",
    subtitle:
      "Discover vibrant streets, local fashion, and the heartbeat of Kigali",
    duration: "25 min",
    distance: "0.8 km",
    mode: "culture" as const,
    imageUrl: kctPrecolonial,
    hasSensitiveContent: false,
  },
];

export function Home({
  onStoryClick,
  onRouteClick,
  onThemesClick,
  onMemorialsClick,
  onMapClick,
  onAskClick,
  onTestimonyClick,
  onDocumentaryClick,
  onDocumentariesHubClick,
}: HomeProps) {
  const { tourGroupAccess, hasSubscription } = useContentAccess();
  const [activeTab, setActiveTab] = useState("home");
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Live map markers from spatial API
  const { points: mapPoints } = useAllMapPoints();
  const liveMarkers = useMemo(
    () =>
      mapPoints.slice(0, 20).map((p) => ({
        id: p.id,
        lat: p.latitude,
        lng: p.longitude,
        mode: typeToMode[p.type] || ("travel" as const),
        title: p.title,
      })),
    [mapPoints],
  );

  const hasAccess = hasSubscription || !!tourGroupAccess;
  const [currentStory, setCurrentStory] = useState(nearbyStories[0]);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingStory, setPendingStory] = useState<
    (typeof nearbyStories)[0] | null
  >(null);

  const handlePlayStory = (story: (typeof nearbyStories)[0]) => {
    if (story.hasSensitiveContent) {
      setPendingStory(story);
      setShowWarning(true);
    } else {
      setCurrentStory(story);
      setShowPlayer(true);
      setIsPlaying(true);
    }
  };

  const handleContinueAfterWarning = () => {
    if (pendingStory) {
      setCurrentStory(pendingStory);
      setShowPlayer(true);
      setIsPlaying(true);
    }
    setShowWarning(false);
    setPendingStory(null);
  };

  const handleSkipWarning = () => {
    setShowWarning(false);
    setPendingStory(null);
  };

  const handleJourneySelect = (journeyId: string) => {
    switch (journeyId) {
      case "routes":
        onRouteClick?.("kigali-musanze");
        break;
      case "memorials":
        onMemorialsClick?.();
        break;
      case "themes":
        onThemesClick?.();
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "routes":
        onRouteClick?.("kigali-musanze");
        break;
      case "themes":
        onThemesClick?.();
        break;
      case "memorials":
        onMemorialsClick?.();
        break;
      case "ask":
        onAskClick?.();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-6 pb-[140px]">
      <AppHeader />

      <main className="pt-14 page-content">
        {/* 1. Hero Section (cinematic, rounded bottom) */}
        <HeroSection />

        {/* 2. Search Bar (floating glassmorphism) */}
        <SearchBar />

        {/* Welcome Card & Access Status */}
        <section className="px-4 space-y-3 mb-6">
          <WelcomeCard />
          <AccessStatusWidget variant="compact" />
        </section>

        {/* Agency Recommended Start (when user has tour access) */}
        {tourGroupAccess && (
          <section className="px-4 mb-6">
            <Card className="bg-gradient-to-br from-adventure-green/10 to-forest-teal/5 border-adventure-green/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-adventure-green" />
                  <span className="text-sm font-medium text-adventure-green">
                    {tourGroupAccess.agencyName} recommends
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your journey at one of these curated stops
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-background/60"
                    onClick={() => onRouteClick?.("kigali-musanze")}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-adventure-green" />
                      Start at Stop #1: Kigali Viewpoint
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Personal Dashboard - Shows for users with access */}
        {hasAccess && (
          <PersonalDashboard
            onItemClick={(id, type) => {
              if (type === "route") onRouteClick?.(id);
              else if (type === "story") onStoryClick?.(id);
              else onTestimonyClick?.(id);
            }}
          />
        )}

        {/* Featured Free Content - Shows for free tier users */}
        {!hasAccess && (
          <FeaturedFreeContent
            onStoryClick={onStoryClick}
            onViewAll={() => onThemesClick?.()}
          />
        )}

        {/* 3. Choose Your Journey (3 cards + featured story) */}
        <ChooseYourJourney
          onRouteSelect={handleJourneySelect}
          featuredStory={featuredStory}
          onFeaturedPlay={() => handlePlayStory(featuredStory as any)}
          onFeaturedClick={() => onStoryClick?.(featuredStory.id)}
        />

        {/* 4. Popular Routes (carousel + secondary list) */}
        <PopularRoutes onRouteClick={(id) => onRouteClick?.(id)} />

        {/* 5. Featured Documentary */}
        <FeaturedDocumentary
          onDocumentaryClick={(id) => onDocumentaryClick?.(id)}
          onViewAll={onDocumentariesHubClick}
        />

        {/* 6. Story Themes (2x3 grid with colorful themes) */}
        <StoryThemes
          onThemeClick={(id) => {
            onThemesClick?.();
          }}
          onTestimonyClick={(id) => onTestimonyClick?.(id)}
        />

        {/* 6. Explore Nearby (map in card + local stories) */}
        <section
          className="px-4 sm:px-0"
          style={{ marginTop: "48px", marginBottom: "32px" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Explore Nearby
            </h2>
            <button
              onClick={onMapClick}
              className="flex items-center gap-1 text-amber text-sm font-medium hover:text-sunset-gold transition-colors"
            >
              Full map
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <MapView
            markers={liveMarkers}
            onMarkerClick={(id) => onStoryClick?.(id)}
          />

          {/* Nearby Stories Cards */}
          <div className="mt-6 space-y-4">
            {nearbyStories.map((story, index) => (
              <div
                key={story.id}
                className="rounded-2xl p-3.5"
                style={{
                  background:
                    index === 0
                      ? "rgba(75, 85, 115, 0.08)"
                      : "rgba(196, 106, 74, 0.06)",
                }}
              >
                <StoryCard
                  {...story}
                  onPlay={() => handlePlayStory(story)}
                  onClick={() => onStoryClick?.(story.id)}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mini Player */}
      {showPlayer && (
        <div className="animate-slide-up-player">
          <MiniPlayer
            title={currentStory.title}
            subtitle={currentStory.subtitle}
            imageUrl={currentStory.imageUrl}
            isPlaying={isPlaying}
            progress={35}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onClose={() => setShowPlayer(false)}
            onExpand={() => onStoryClick?.(currentStory.id)}
          />
        </div>
      )}

      {/* Content Warning Modal */}
      {showWarning && (
        <ContentWarning
          onContinue={handleContinueAfterWarning}
          onSkip={handleSkipWarning}
        />
      )}

      {/* 7. Footer Navigation (curved, elevated, premium) */}
      <Footer activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default Home;
