import { Clock, AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import type { Testimony } from "@/hooks/useTestimonies";

interface TestimonyCardProps {
  testimony: Testimony;
  onClick: (slug: string) => void;
  className?: string;
}

const categoryColors: Record<string, string> = {
  survivor: "bg-muted-indigo/20 text-muted-indigo border-muted-indigo/30",
  rescuer: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  witness: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  reconciliation: "bg-sky-500/20 text-sky-600 border-sky-500/30",
};

const categoryLabels: Record<string, string> = {
  survivor: "Survivor",
  rescuer: "Rescuer",
  witness: "Witness",
  reconciliation: "Reconciliation",
};

export function TestimonyCard({ testimony, onClick, className }: TestimonyCardProps) {
  return (
    <button
      onClick={() => onClick(testimony.slug)}
      className={cn(
        "group relative w-full text-left rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={testimony.cover_image}
          alt={testimony.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        
        {/* Category Badge */}
        <Badge
          variant="outline"
          className={cn(
            "absolute top-3 left-3 text-xs font-medium border",
            categoryColors[testimony.category] || categoryColors.survivor
          )}
        >
          {categoryLabels[testimony.category] || "Survivor"}
        </Badge>

        {/* Actions Row - Bookmark and Warning */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <BookmarkButton
            contentId={testimony.id}
            contentType="testimony"
            title={testimony.title}
            imageUrl={testimony.cover_image}
          />
          {testimony.has_content_warning && (
            <div className="p-1.5 rounded-full bg-background/40 backdrop-blur-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
          )}
        </div>

        {/* Person Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-foreground text-sm font-semibold">
                {testimony.person_name.charAt(0)}
              </span>
            </div>
            <span className="text-foreground text-sm font-medium drop-shadow-md">
              {testimony.person_name}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-muted-indigo transition-colors">
          {testimony.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {testimony.context}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{testimony.duration_minutes || 10} min</span>
          </div>
          {testimony.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{testimony.location}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}