import {
  Building2,
  BookOpen,
  Route,
  Play,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import coverImg from "@/assets/cover.jpg";

interface JourneyCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
  index: number;
}

function JourneyCard({
  icon,
  title,
  subtitle,
  gradient,
  onClick,
  index,
}: JourneyCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-5 w-full min-h-[200px]",
        "transition-all duration-300 hover:scale-[1.02] overflow-hidden group",
        "border border-white/20 backdrop-blur-sm",
        gradient,
      )}
      style={{
        borderRadius: "26px",
        boxShadow: "0px 16px 32px rgba(0, 0, 0, 0.12)",
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="font-serif text-lg font-semibold text-white leading-tight">
          {title}
        </h3>
        <p className="text-white/70 text-xs mt-1.5 max-w-[140px] leading-relaxed">
          {subtitle}
        </p>
      </div>
    </button>
  );
}

interface FeaturedStoryCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  onPlay: () => void;
  onClick: () => void;
}

function FeaturedStoryCard({
  title,
  subtitle,
  imageUrl,
  onPlay,
  onClick,
}: FeaturedStoryCardProps) {
  return (
    <article
      className="relative min-h-[340px] overflow-hidden cursor-pointer group col-span-2"
      onClick={onClick}
      style={{
        borderRadius: "24px",
        boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.18)",
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Strong vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              transparent 0%,
              rgba(10, 26, 47, 0.3) 40%,
              rgba(10, 26, 47, 0.85) 100%
            )`,
          }}
        />
      </div>

      {/* Featured Badge */}
      <div
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ backgroundColor: "hsl(35, 100%, 68%)" }}
      >
        <Sparkles className="w-3.5 h-3.5 text-midnight" />
        <span className="text-xs font-semibold text-midnight">
          Today's Featured
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3
          className="font-serif text-xl font-semibold leading-tight line-clamp-3"
          style={{ color: "#FAFAFA" }}
        >
          {title}
        </h3>
        <p
          className="text-sm mt-2 line-clamp-2"
          style={{ color: "rgba(250, 250, 250, 0.7)" }}
        >
          {subtitle}
        </p>
      </div>

      {/* Play Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        className="absolute bottom-5 right-5 w-14 h-14 bg-amber rounded-full flex items-center justify-center hover:bg-sunset-gold hover:scale-105 transition-all duration-200"
        style={{ boxShadow: "0 8px 24px rgba(255, 184, 92, 0.4)" }}
      >
        <Play className="w-6 h-6 text-midnight fill-midnight ml-0.5" />
      </button>
    </article>
  );
}

interface ChooseYourJourneyProps {
  onRouteSelect: (route: string) => void;
  featuredStory?: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  onFeaturedPlay?: () => void;
  onFeaturedClick?: () => void;
}

export function ChooseYourJourney({
  onRouteSelect,
  featuredStory,
  onFeaturedPlay,
  onFeaturedClick,
}: ChooseYourJourneyProps) {
  const journeys = [
    {
      id: "routes",
      icon: <Route className="w-7 h-7 text-white" />,
      title: "Routes",
      subtitle: "Curated audio journeys",
      gradient: "bg-gradient-to-br from-adventure-green to-forest-teal",
    },
    {
      id: "memorials",
      icon: <Building2 className="w-7 h-7 text-white" />,
      title: "Memorials & Museums",
      subtitle: "Discover remembrance sites",
      gradient: "bg-gradient-to-br from-muted-indigo to-soft-lavender/80",
    },
    {
      id: "themes",
      icon: <BookOpen className="w-7 h-7 text-white" />,
      title: "Story Themes",
      subtitle: "Explore by topic",
      gradient: "bg-gradient-to-br from-terracotta to-sunset-gold",
    },
  ];

  const defaultFeatured = {
    title: "The Thousand Hills: Rwanda's Living Landscape",
    subtitle: "A journey through the valleys and peaks that shaped a nation",
    imageUrl: coverImg,
  };

  const story = featuredStory || defaultFeatured;

  return (
    <section
      className="py-10 px-4 min-h-[480px] flex flex-col justify-center"
      style={{
        marginTop: "48px",
        background: "rgba(247, 239, 228, 0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Choose Your Journey
        </h2>
        <span className="flex items-center gap-1 text-amber text-sm font-medium">
          Start Here
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>

      {/* 2x2 Grid: 3 Journey Cards + Featured Story */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {journeys.map((journey, index) => (
          <JourneyCard
            key={journey.id}
            icon={journey.icon}
            title={journey.title}
            subtitle={journey.subtitle}
            gradient={journey.gradient}
            onClick={() => onRouteSelect(journey.id)}
            index={index}
          />
        ))}

        {/* Featured Story - spans 2 columns */}
        <FeaturedStoryCard
          {...story}
          onPlay={onFeaturedPlay || (() => {})}
          onClick={onFeaturedClick || (() => {})}
        />
      </div>
    </section>
  );
}
