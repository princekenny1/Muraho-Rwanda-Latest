import { Play, Clock, Film, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedDocumentary } from "@/hooks/useDocumentaries";

interface FeaturedDocumentaryProps {
  onDocumentaryClick?: (slug: string) => void;
  onViewAll?: () => void;
  className?: string;
}

export function FeaturedDocumentary({
  onDocumentaryClick,
  onViewAll,
  className,
}: FeaturedDocumentaryProps) {
  const { data: documentary, isLoading, error } = useFeaturedDocumentary();

  const formatRuntime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <section className={cn("px-4", className)} style={{ marginTop: '48px', marginBottom: '32px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-amber" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Featured Documentary
            </h2>
          </div>
        </div>
        <Skeleton className="w-full h-[280px] rounded-[24px]" />
      </section>
    );
  }

  if (error || !documentary) {
    return null;
  }

  return (
    <section 
      className={cn("px-4", className)}
      style={{ marginTop: '48px', marginBottom: '32px' }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-amber" />
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Featured Documentary
          </h2>
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="flex items-center gap-1 text-amber text-sm font-medium hover:text-sunset-gold transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Documentary Card */}
      <button
        onClick={() => onDocumentaryClick?.(documentary.slug)}
        className="w-full text-left group"
      >
        <div 
          className="relative rounded-[24px] overflow-hidden"
          style={{ 
            boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Cover Image */}
          <div className="relative h-[200px]">
            <img
              src={documentary.cover_image}
              alt={documentary.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
            
            {/* Play Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div 
                className="w-16 h-16 bg-amber/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-amber"
                style={{ boxShadow: '0px 8px 24px rgba(255, 184, 92, 0.4)' }}
              >
                <Play className="w-6 h-6 text-midnight fill-midnight ml-0.5" />
              </div>
            </div>
            
            {/* Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-muted-indigo text-white hover:bg-muted-indigo">
                <Film className="w-3 h-3 mr-1" />
                Documentary
              </Badge>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-midnight p-4">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber transition-colors">
              {documentary.title}
            </h3>
            
            <p className="text-sm text-white/70 line-clamp-2 mb-3">
              {documentary.synopsis}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatRuntime(documentary.runtime)}
              </span>
              <span>{documentary.chapters_count || 0} chapters</span>
              <span>{documentary.year}</span>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}
