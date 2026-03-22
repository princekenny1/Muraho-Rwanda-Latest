import { Play, Clock, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/ui/bookmark-button";

interface RouteCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  distance: string;
  imageUrl: string;
  onPlay: () => void;
  onClick: () => void;
}

function RouteCard({
  id,
  title,
  description,
  duration,
  distance,
  imageUrl,
  onPlay,
  onClick,
}: RouteCardProps) {
  return (
    <article
      className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[360px] min-h-[200px] sm:min-h-[210px] aspect-video overflow-hidden cursor-pointer group"
      onClick={onClick}
      style={{
        borderRadius: "20px",
        boxShadow: "0px 12px 28px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            transparent 0%,
            rgba(10, 26, 47, 0.4) 50%,
            rgba(10, 26, 47, 0.9) 100%
          )`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-midnight/30 to-transparent" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            color: "hsl(214, 68%, 11%)",
          }}
        >
          <Clock className="w-3 h-3" />
          {duration}
        </span>
        <span
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            color: "hsl(214, 68%, 11%)",
          }}
        >
          <MapPin className="w-3 h-3" />
          {distance}
        </span>
      </div>

      {/* Bookmark Button */}
      <div className="absolute top-3 right-14">
        <BookmarkButton
          contentId={id}
          contentType="route"
          title={title}
          imageUrl={imageUrl}
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3
          className="font-serif text-lg font-semibold line-clamp-1"
          style={{ color: "#FAFAFA" }}
        >
          {title}
        </h3>
        <p
          className="text-xs mt-1 line-clamp-1"
          style={{ color: "rgba(250, 250, 250, 0.7)" }}
        >
          {description}
        </p>
      </div>

      {/* Play Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        className="absolute top-3 right-3 w-10 h-10 bg-amber rounded-full flex items-center justify-center hover:bg-sunset-gold hover:scale-105 transition-all duration-200"
        style={{ boxShadow: "0 4px 12px rgba(255, 184, 92, 0.4)" }}
      >
        <Play className="w-4 h-4 text-midnight fill-midnight ml-0.5" />
      </button>
    </article>
  );
}
interface SecondaryRouteProps {
  title: string;
  duration: string;
  mode: "remembrance" | "culture" | "travel";
  onClick: () => void;
}

function SecondaryRoute({
  title,
  duration,
  mode,
  onClick,
}: SecondaryRouteProps) {
  const modeColors = {
    remembrance: "bg-muted-indigo/10 text-muted-indigo",
    culture: "bg-terracotta/10 text-terracotta",
    travel: "bg-adventure-green/10 text-adventure-green",
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3.5 bg-card rounded-xl border border-border/50 hover:shadow-card transition-all group"
      style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            modeColors[mode],
          )}
        >
          <MapPin className="w-4.5 h-4.5" />
        </div>
        <div className="text-left">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{duration}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}

const popularRoutes = [
  {
    id: "1",
    title: "Kigali → Musanze",
    description: "Stories through the volcanic highlands",
    duration: "2h 15min",
    distance: "116 km",
    imageUrl:
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&q=80",
  },
  {
    id: "2",
    title: "Lake Kivu Scenic Drive",
    description: "Coastal beauty and lakeside villages",
    duration: "3h 30min",
    distance: "180 km",
    imageUrl:
      "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600&q=80",
  },
  {
    id: "3",
    title: "Eastern Safari Route",
    description: "Savanna plains and wildlife encounters",
    duration: "4h",
    distance: "220 km",
    imageUrl:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80",
  },
];

const secondaryRoutes = [
  {
    id: "s1",
    title: "Nyungwe Forest Trail",
    duration: "5h audio tour",
    mode: "travel" as const,
  },
  {
    id: "s2",
    title: "Genocide Memorial Circuit",
    duration: "4h guided",
    mode: "remembrance" as const,
  },
  {
    id: "s3",
    title: "Kigali Art Walk",
    duration: "2h experience",
    mode: "culture" as const,
  },
];

interface PopularRoutesProps {
  onRouteClick: (routeId: string) => void;
}

export function PopularRoutes({ onRouteClick }: PopularRoutesProps) {
  return (
    <section
      className="py-10"
      style={{
        marginTop: "48px",
        background: "rgba(244, 248, 247, 0.05)",
      }}
    >
      <div className="px-4 flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Popular Routes
        </h2>
        <button className="flex items-center gap-1 text-amber text-sm font-medium hover:text-sunset-gold transition-colors">
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Routes Carousel */}
      <div className="relative">
        {/* Soft vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,26,47,0.04) 0%, transparent 15%, transparent 85%, rgba(10,26,47,0.04) 100%)",
          }}
        />

        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
          {popularRoutes.map((route) => (
            <div key={route.id} className="snap-start">
              <RouteCard
                {...route}
                onPlay={() => onRouteClick(route.id)}
                onClick={() => onRouteClick(route.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Routes List */}
      <div className="px-4 mt-6 space-y-3">
        {secondaryRoutes.map((route) => (
          <SecondaryRoute
            key={route.id}
            {...route}
            onClick={() => onRouteClick(route.id)}
          />
        ))}
      </div>
    </section>
  );
}
