import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "./Home";
import { StoryViewer } from "./StoryViewer";
import { RoutePage } from "./RoutePage";
import { ThemesHub } from "./ThemesHub";
import { ThemeDetail } from "./ThemeDetail";
import { MemorialsHub } from "./MemorialsHub";
import { MuseumGuide } from "./MuseumGuide";
import { FullMap } from "./FullMap";
import {
  TimeOfDayProvider,
  TimeOfDayIndicator,
  NightModeMapOverlay,
} from "@/components/ambient";
import { WeatherProvider, WeatherMapOverlay } from "@/components/ambient";

type AppView =
  | { type: "home" }
  | { type: "story"; storyId?: string }
  | { type: "route"; routeId?: string }
  | { type: "themes" }
  | { type: "theme-detail"; themeId: string }
  | { type: "memorials" }
  | { type: "museum"; museumId: string }
  | { type: "map" };

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>({ type: "home" });
  const navigate = useNavigate();

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
  };

  const goHome = () => setCurrentView({ type: "home" });

  const handleTestimonyClick = (testimonySlug: string) => {
    if (testimonySlug === "all") {
      navigate("/testimonies");
    } else {
      navigate(`/testimonies/${testimonySlug}`);
    }
  };

  const handleDocumentaryClick = (documentarySlug: string) => {
    navigate(`/documentaries/${documentarySlug}`);
  };

  const handleDocumentariesHubClick = () => {
    navigate("/documentaries");
  };

  const handleAskRwandaClick = () => {
    navigate("/ask-rwanda");
  };

  // Render current view with ambient providers
  const renderView = () => {
    switch (currentView.type) {
      case "story":
        return <StoryViewer storyId={currentView.storyId} onBack={goHome} />;

      case "route":
        return (
          <RoutePage
            routeId={currentView.routeId}
            onBack={goHome}
            onStoryClick={(storyId) => navigateTo({ type: "story", storyId })}
          />
        );

      case "themes":
        return (
          <ThemesHub
            onBack={goHome}
            onThemeClick={(themeId) =>
              navigateTo({ type: "theme-detail", themeId })
            }
          />
        );

      case "theme-detail":
        return (
          <ThemeDetail
            themeId={currentView.themeId}
            onBack={() => navigateTo({ type: "themes" })}
            onStoryClick={(storyId) => navigateTo({ type: "story", storyId })}
          />
        );

      case "memorials":
        return (
          <MemorialsHub
            onBack={goHome}
            onMuseumClick={(museumId) =>
              navigateTo({ type: "museum", museumId })
            }
          />
        );

      case "museum":
        return (
          <MuseumGuide
            museumId={currentView.museumId}
            onBack={() => navigateTo({ type: "memorials" })}
          />
        );

      case "map":
        return (
          <FullMap
            onClose={goHome}
            onStoryClick={(storyId) => navigateTo({ type: "story", storyId })}
          />
        );

      default:
        return (
          <Home
            onStoryClick={(storyId) => navigateTo({ type: "story", storyId })}
            onRouteClick={() => navigate("/routes")}
            onThemesClick={() => navigate("/themes")}
            onMemorialsClick={() => navigate("/memorials")}
            onMapClick={() => navigate("/map")}
            onAskClick={handleAskRwandaClick}
            onTestimonyClick={handleTestimonyClick}
            onDocumentaryClick={handleDocumentaryClick}
            onDocumentariesHubClick={handleDocumentariesHubClick}
          />
        );
    }
  };

  return (
    <TimeOfDayProvider>
      <WeatherProvider>
        {/* Global ambient indicators */}
        <div className="fixed top-4 right-4 z-50">
          <TimeOfDayIndicator showLabel={false} />
        </div>

        {/* Main app content */}
        {renderView()}
      </WeatherProvider>
    </TimeOfDayProvider>
  );
};

export default Index;
