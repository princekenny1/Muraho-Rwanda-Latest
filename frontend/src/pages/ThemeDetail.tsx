import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  Headphones,
  Video,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";
import kwaRubangura from "@/assets/kwa_rubangura.jpg";

interface ThemeDetailProps {
  themeId: string;
  onBack: () => void;
  onStoryClick: (storyId: string) => void;
}

const themeData: Record<
  string,
  {
    title: string;
    description: string;
    gradient: string;
    accentColor: string;
    icon: string;
  }
> = {
  reconciliation: {
    title: "Reconciliation",
    description:
      "Stories of healing, forgiveness, and unity that emerged from tragedy",
    gradient: "linear-gradient(135deg, #C7C9DD 0%, #9DA1BD 100%)",
    accentColor: "#C7C9DD",
    icon: "🕊️",
  },
  survival: {
    title: "Survival",
    description: "Powerful testimonies of resilience and the human spirit",
    gradient: "linear-gradient(135deg, #4B5573 0%, #3A4459 100%)",
    accentColor: "#4B5573",
    icon: "🌱",
  },
  rebuilding: {
    title: "Rebuilding",
    description: "A nation's remarkable transformation and progress",
    gradient: "linear-gradient(135deg, #E5A73A 0%, #C4912E 100%)",
    accentColor: "#E5A73A",
    icon: "🏗️",
  },
  culture: {
    title: "Culture",
    description: "Art, music, dance, and the rich traditions of Rwanda",
    gradient: "linear-gradient(135deg, #C46A4A 0%, #A85A3D 100%)",
    accentColor: "#C46A4A",
    icon: "🎭",
  },
  nature: {
    title: "Nature",
    description: "Wildlife conservation and breathtaking landscapes",
    gradient: "linear-gradient(135deg, #2D6A5A 0%, #1F4F45 100%)",
    accentColor: "#2D6A5A",
    icon: "🦍",
  },
  "road-stories": {
    title: "Road Stories",
    description: "Tales discovered while traveling through the thousand hills",
    gradient: "linear-gradient(135deg, #70C1A5 0%, #5BA88E 100%)",
    accentColor: "#70C1A5",
    icon: "🛤️",
  },
};

const mockStories = [
  {
    id: "story-1",
    title: "A Mother's Forgiveness",
    subtitle: "One woman's journey from grief to reconciliation",
    duration: "12 min",
    type: "audio",
    imageUrl: coverImg,
    isEditorsPick: true,
  },
  {
    id: "story-2",
    title: "The Gacaca Courts",
    subtitle: "Community justice and healing",
    duration: "18 min",
    type: "video",
    imageUrl: kctPost,
    isEditorsPick: false,
  },
  {
    id: "story-3",
    title: "Unity Day Celebrations",
    subtitle: "How Rwanda marks its annual day of unity",
    duration: "8 min",
    type: "read",
    imageUrl: kctPrecolonial,
    isEditorsPick: false,
  },
  {
    id: "story-4",
    title: "From Perpetrator to Peacemaker",
    subtitle: "The transformation of a former participant",
    duration: "15 min",
    type: "audio",
    imageUrl: kwaRubangura,
    isEditorsPick: false,
  },
];

const typeIcons = {
  audio: Headphones,
  video: Video,
  read: BookOpen,
};

type FilterType = "all" | "audio" | "video" | "read";

export function ThemeDetail({
  themeId,
  onBack,
  onStoryClick,
}: ThemeDetailProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const theme = themeData[themeId] || themeData.reconciliation;

  const filteredStories =
    filter === "all"
      ? mockStories
      : mockStories.filter((s) => s.type === filter);

  const editorsPick = mockStories.find((s) => s.isEditorsPick);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-48" style={{ background: theme.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-midnight/30" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors safe-area-pt"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Theme info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{theme.icon}</span>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-white">
                {theme.title}
              </h1>
              <p className="text-white/80 text-sm mt-1">{theme.description}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 py-6 page-content-narrow">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(["all", "audio", "video", "read"] as FilterType[]).map((type) => {
            const Icon = type !== "all" ? typeIcons[type] : null;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  filter === type
                    ? "bg-amber text-midnight"
                    : "bg-midnight/5 text-muted-foreground hover:bg-midnight/10",
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Editor's Pick */}
        {editorsPick && filter === "all" && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber text-sm font-medium">
                ✨ Editor's Pick
              </span>
            </div>
            <button
              onClick={() => onStoryClick(editorsPick.id)}
              className="w-full relative overflow-hidden rounded-2xl"
              style={{ boxShadow: `0 8px 32px ${theme.accentColor}30` }}
            >
              <img
                src={editorsPick.imageUrl}
                alt={editorsPick.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-lg">
                  {editorsPick.title}
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  {editorsPick.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
                  {typeIcons[editorsPick.type as keyof typeof typeIcons] && (
                    <span className="flex items-center gap-1">
                      {(() => {
                        const Icon =
                          typeIcons[editorsPick.type as keyof typeof typeIcons];
                        return <Icon className="w-3.5 h-3.5" />;
                      })()}
                      {editorsPick.type}
                    </span>
                  )}
                  <span>•</span>
                  <span>{editorsPick.duration}</span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Story List */}
        <div className="mt-6 space-y-3">
          <h2 className="font-semibold text-foreground">
            {filteredStories.length} Stories
          </h2>

          {filteredStories.map((story) => {
            const TypeIcon = typeIcons[story.type as keyof typeof typeIcons];
            return (
              <button
                key={story.id}
                onClick={() => onStoryClick(story.id)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-xl text-left hover:bg-card/80 transition-colors"
              >
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                    {story.subtitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    {TypeIcon && <TypeIcon className="w-3.5 h-3.5" />}
                    <span>{story.duration}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
