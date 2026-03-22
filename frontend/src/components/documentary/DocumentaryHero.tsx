import { Play, Clock, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentaryHeroProps {
  title: string;
  synopsis: string;
  runtime: number; // in minutes
  coverImage: string;
  year?: number;
  director?: string;
  onStart: () => void;
  className?: string;
}

export function DocumentaryHero({
  title,
  synopsis,
  runtime,
  coverImage,
  year,
  director,
  onStart,
  className,
}: DocumentaryHeroProps) {
  const formatRuntime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className={cn("relative h-[460px] overflow-hidden", className)}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/30" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 pb-8">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-amber/90 text-midnight hover:bg-amber">
            <Film className="w-3 h-3 mr-1" />
            Documentary
          </Badge>
          {year && (
            <Badge variant="outline" className="border-white/30 text-white/80">
              {year}
            </Badge>
          )}
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
          {title}
        </h1>
        
        {/* Director & Runtime */}
        <div className="flex items-center gap-3 text-white/70 text-sm mb-4">
          {director && <span>Directed by {director}</span>}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatRuntime(runtime)}
          </span>
        </div>
        
        {/* Synopsis */}
        <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-6">
          {synopsis}
        </p>
        
        {/* CTA */}
        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-amber hover:bg-amber/90 text-midnight font-semibold"
          style={{ boxShadow: "0px 8px 24px rgba(255, 184, 92, 0.3)" }}
        >
          <Play className="w-5 h-5 mr-2 fill-midnight" />
          Start Documentary
        </Button>
      </div>
    </div>
  );
}
