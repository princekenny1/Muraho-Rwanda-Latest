import { useState } from "react";
import { ArrowLeft, Filter, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemesHubProps {
  onBack: () => void;
  onThemeClick: (themeId: string) => void;
}

const themes = [
  {
    id: "reconciliation",
    title: "Reconciliation",
    description: "Stories of healing and unity",
    storiesCount: 24,
    gradient: "linear-gradient(135deg, #C7C9DD 0%, #9DA1BD 100%)",
    accentColor: "#C7C9DD",
    icon: "🕊️",
  },
  {
    id: "survival",
    title: "Survival",
    description: "Testimonies of resilience",
    storiesCount: 18,
    gradient: "linear-gradient(135deg, #4B5573 0%, #3A4459 100%)",
    accentColor: "#4B5573",
    icon: "🌱",
  },
  {
    id: "rebuilding",
    title: "Rebuilding",
    description: "A nation's transformation",
    storiesCount: 31,
    gradient: "linear-gradient(135deg, #E5A73A 0%, #C4912E 100%)",
    accentColor: "#E5A73A",
    icon: "🏗️",
  },
  {
    id: "culture",
    title: "Culture",
    description: "Art, music, and traditions",
    storiesCount: 42,
    gradient: "linear-gradient(135deg, #C46A4A 0%, #A85A3D 100%)",
    accentColor: "#C46A4A",
    icon: "🎭",
  },
  {
    id: "nature",
    title: "Nature",
    description: "Wildlife and landscapes",
    storiesCount: 27,
    gradient: "linear-gradient(135deg, #2D6A5A 0%, #1F4F45 100%)",
    accentColor: "#2D6A5A",
    icon: "🦍",
  },
  {
    id: "road-stories",
    title: "Road Stories",
    description: "Tales from the journey",
    storiesCount: 15,
    gradient: "linear-gradient(135deg, #70C1A5 0%, #5BA88E 100%)",
    accentColor: "#70C1A5",
    icon: "🛤️",
  },
];

export function ThemesHub({ onBack, onThemeClick }: ThemesHubProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-foreground">
            Story Themes
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                viewMode === "grid"
                  ? "bg-midnight/10"
                  : "text-muted-foreground",
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                viewMode === "list"
                  ? "bg-midnight/10"
                  : "text-muted-foreground",
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 page-content-narrow">
        {/* Hero text */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
            Explore Story Themes
          </h2>
          <p className="text-muted-foreground">
            Discover stories organized by emotional themes and subjects
          </p>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme, idx) => (
              <button
                key={theme.id}
                onClick={() => onThemeClick(theme.id)}
                className="group relative overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  minHeight: "175px",
                  background: theme.gradient,
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                {/* Hover glow border */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    boxShadow: `inset 0 0 0 2px ${theme.accentColor}, 0 0 20px ${theme.accentColor}40`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-4">
                  <span className="text-3xl">{theme.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {theme.title}
                    </h3>
                    <p className="text-white/70 text-xs mt-1">
                      {theme.storiesCount} stories
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeClick(theme.id)}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
                style={{
                  borderLeft: `4px solid ${theme.accentColor}`,
                }}
              >
                <span className="text-2xl">{theme.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {theme.title}
                  </h3>
                  <p className="text-muted-foreground text-sm truncate">
                    {theme.description}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {theme.storiesCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
