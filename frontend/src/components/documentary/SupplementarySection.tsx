import { Image, FileText, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  year?: number;
}

interface Essay {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  url?: string;
}

interface PrimarySource {
  id: string;
  title: string;
  type: string;
  institution: string;
  url: string;
}

interface SupplementarySectionProps {
  photos?: Photo[];
  essays?: Essay[];
  primarySources?: PrimarySource[];
  onPhotoClick?: (photo: Photo) => void;
  onEssayClick?: (essay: Essay) => void;
  className?: string;
}

export function SupplementarySection({
  photos = [],
  essays = [],
  primarySources = [],
  onPhotoClick,
  onEssayClick,
  className,
}: SupplementarySectionProps) {
  return (
    <div className={cn("space-y-6 py-6", className)}>
      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-4 mb-3">
            <Image className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Photos & Images</h3>
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex gap-3 px-4 pb-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => onPhotoClick?.(photo)}
                  className="flex-shrink-0 group"
                >
                  <div className="w-32 h-24 rounded-xl overflow-hidden mb-2">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Documentary photo"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-1 text-left">
                      {photo.caption}
                    </p>
                  )}
                  {photo.year && (
                    <span className="text-[10px] text-muted-foreground/60">
                      {photo.year}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Essays */}
      {essays.length > 0 && (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Essays & Articles</h3>
          </div>
          
          <div className="space-y-3">
            {essays.map((essay) => (
              <button
                key={essay.id}
                onClick={() => onEssayClick?.(essay)}
                className="w-full p-4 bg-card rounded-xl border border-border hover:border-amber/50 transition-colors text-left group"
              >
                <h4 className="text-sm font-medium text-foreground mb-1 group-hover:text-amber transition-colors">
                  {essay.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  By {essay.author}
                </p>
                <p className="text-xs text-muted-foreground/80 line-clamp-2">
                  {essay.excerpt}
                </p>
                <div className="flex items-center gap-1 mt-2 text-amber text-xs font-medium">
                  Read more
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Sources */}
      {primarySources.length > 0 && (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Primary Sources</h3>
          </div>
          
          <div className="space-y-2">
            {primarySources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-amber transition-colors">
                    {source.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {source.type} • {source.institution}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-amber transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
