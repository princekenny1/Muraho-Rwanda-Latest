import { cn } from "@/lib/utils";
import { Mic, ChevronRight } from "lucide-react";
import { useFeaturedTestimonies } from "@/hooks/useTestimonies";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";
import kwaRubangura from "@/assets/kwa_rubangura.jpg";
import preColonial from "@/assets/pre-colonial.jpg";
import testimoniesImg from "@/assets/testimonies.jfif";

interface ThemeTile {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  accentColor: string;
  gradient: string;
}

const themes: ThemeTile[] = [
  {
    id: "reconciliation",
    title: "Reconciliation",
    subtitle: "Healing journeys",
    imageUrl: coverImg,
    accentColor: "#C7C9DD",
    gradient:
      "linear-gradient(135deg, rgba(199, 201, 221, 0.4) 0%, rgba(75, 85, 115, 0.6) 100%)",
  },
  {
    id: "survival",
    title: "Survival",
    subtitle: "Stories of resilience",
    imageUrl: testimoniesImg,
    accentColor: "#4B5573",
    gradient:
      "linear-gradient(135deg, rgba(75, 85, 115, 0.5) 0%, rgba(44, 62, 80, 0.7) 100%)",
  },
  {
    id: "rebuilding",
    title: "Rebuilding",
    subtitle: "A nation renewed",
    imageUrl: kctPost,
    accentColor: "#E5A73A",
    gradient:
      "linear-gradient(135deg, rgba(229, 167, 58, 0.4) 0%, rgba(196, 106, 74, 0.6) 100%)",
  },
  {
    id: "road-stories",
    title: "Road Stories",
    subtitle: "Tales from the journey",
    imageUrl: kctPrecolonial,
    accentColor: "#70C1A5",
    gradient:
      "linear-gradient(135deg, rgba(112, 193, 165, 0.4) 0%, rgba(44, 110, 111, 0.6) 100%)",
  },
  {
    id: "culture",
    title: "Culture",
    subtitle: "Living traditions",
    imageUrl: kwaRubangura,
    accentColor: "#C46A4A",
    gradient:
      "linear-gradient(135deg, rgba(196, 106, 74, 0.4) 0%, rgba(139, 69, 42, 0.6) 100%)",
  },
  {
    id: "nature",
    title: "Nature",
    subtitle: "Land of wonder",
    imageUrl: preColonial,
    accentColor: "#2C6E6F",
    gradient:
      "linear-gradient(135deg, rgba(44, 110, 111, 0.4) 0%, rgba(28, 70, 72, 0.6) 100%)",
  },
];

interface StoryThemesProps {
  onThemeClick: (themeId: string) => void;
  onTestimonyClick?: (testimonySlug: string) => void;
}

export function StoryThemes({
  onThemeClick,
  onTestimonyClick,
}: StoryThemesProps) {
  const { data: featuredTestimonies = [] } = useFeaturedTestimonies();

  return (
    <section
      className="py-10 px-4 min-h-[580px]"
      style={{
        marginTop: "48px",
        background: "rgba(250, 244, 234, 0.06)",
      }}
    >
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
        Story Themes
      </h2>

      {/* 2x3 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme, index) => (
          <div key={theme.id}>
            <button
              onClick={() => onThemeClick(theme.id)}
              className={cn(
                "relative w-full min-h-[175px] aspect-square overflow-hidden group",
                "transition-all duration-300 hover:scale-[1.02]",
              )}
              style={{
                borderRadius: "18px",
                animationDelay: `${index * 80}ms`,
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.10), 0 0 0 1px ${theme.accentColor}30, inset 0 0 20px ${theme.accentColor}10`,
              }}
            >
              {/* Background Image */}
              <img
                src={theme.imageUrl}
                alt={theme.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Theme-specific gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: theme.gradient }}
              />

              {/* Dark vignette at bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(10, 26, 47, 0.7) 100%)",
                }}
              />

              {/* Icon overlay glow */}
              <div
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `${theme.accentColor}40`,
                  boxShadow: `0 0 16px ${theme.accentColor}50`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: theme.accentColor }}
                />
              </div>

              {/* Accent border glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `inset 0 0 0 2px ${theme.accentColor}60, 0 0 20px ${theme.accentColor}30`,
                  borderRadius: "18px",
                }}
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <h3
                  className="font-serif text-lg font-semibold leading-tight"
                  style={{ color: "#FAFAFA" }}
                >
                  {theme.title}
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "rgba(250, 250, 250, 0.75)" }}
                >
                  {theme.subtitle}
                </p>
              </div>
            </button>

            {/* Testimony Card - appears under Survival tile */}
            {theme.id === "survival" && featuredTestimonies.length > 0 && (
              <div
                className="mt-3 rounded-xl overflow-hidden animate-fade-in"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(75, 85, 115, 0.12) 0%, rgba(199, 201, 221, 0.08) 100%)",
                  border: "1px solid rgba(75, 85, 115, 0.2)",
                }}
              >
                <div className="px-3 py-2.5 flex items-center justify-between border-b border-muted-indigo/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(75, 85, 115, 0.3)" }}
                    >
                      <Mic className="w-3 h-3 text-soft-lavender" />
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      Survivor Testimonies
                    </span>
                  </div>
                  <button
                    onClick={() => onTestimonyClick?.("all")}
                    className="text-xs text-muted-indigo hover:text-soft-lavender flex items-center gap-0.5 transition-colors"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Testimony Cards */}
                <div className="p-2 space-y-2">
                  {featuredTestimonies.slice(0, 2).map((testimony) => (
                    <button
                      key={testimony.id}
                      onClick={() => onTestimonyClick?.(testimony.slug)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted-indigo/10 transition-colors text-left group"
                    >
                      <img
                        src={testimony.cover_image}
                        alt={testimony.person_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-muted-indigo/20 group-hover:ring-muted-indigo/40 transition-all"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {testimony.person_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {testimony.title}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {testimony.duration_minutes || 10} min
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
