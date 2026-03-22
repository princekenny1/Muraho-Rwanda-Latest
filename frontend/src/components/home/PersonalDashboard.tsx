import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bookmark,
  Download,
  Play,
  ChevronRight,
  MapPin,
  Compass,
  Film,
} from "lucide-react";
import { usePersonalDashboard, ContentType } from "@/hooks/usePersonalDashboard";

interface PersonalDashboardProps {
  onItemClick?: (id: string, type: string) => void;
}

export function PersonalDashboard({ onItemClick }: PersonalDashboardProps) {
  const {
    savedItems,
    progressItems,
    downloadedItems,
    isLoading,
  } = usePersonalDashboard();

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "story":
        return <Bookmark className="w-3 h-3" />;
      case "route":
        return <MapPin className="w-3 h-3" />;
      case "testimony":
        return <Compass className="w-3 h-3" />;
      case "documentary":
        return <Film className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case "story":
        return "bg-amber/20 text-amber border-amber/50";
      case "route":
        return "bg-adventure-green/20 text-adventure-green border-adventure-green/50";
      case "testimony":
        return "bg-muted-indigo/20 text-muted-indigo border-muted-indigo/50";
      case "documentary":
        return "bg-sunset-gold/20 text-sunset-gold border-sunset-gold/50";
    }
  };

  const ItemCard = ({ 
    item, 
    progress 
  }: { 
    item: { 
      content_id: string; 
      content_type: ContentType; 
      title: string; 
      image_url: string | null;
    }; 
    progress?: number;
  }) => (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onItemClick?.(item.content_id, item.content_type)}
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getTypeIcon(item.content_type)}
          </div>
        )}
        {progress !== undefined && progress > 0 && progress < 100 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${getTypeColor(item.content_type)}`}>
            {getTypeIcon(item.content_type)}
            <span className="ml-1 capitalize">{item.content_type}</span>
          </Badge>
          {progress !== undefined && progress > 0 && (
            <span className="text-xs text-muted-foreground">{progress}% complete</span>
          )}
        </div>
        {progress !== undefined && progress > 0 && progress < 100 && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-14 h-14 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <section className="px-4 mb-8 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="pt-0">
            <LoadingSkeleton />
          </CardContent>
        </Card>
      </section>
    );
  }

  const hasContent = savedItems.length > 0 || downloadedItems.length > 0 || progressItems.length > 0;

  if (!hasContent) return null;

  return (
    <section className="px-4 mb-8 space-y-4">
      {/* Continue Exploring */}
      {progressItems.length > 0 && (
        <Card className="bg-gradient-to-r from-amber/5 to-sunset-gold/5 border-amber/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="w-4 h-4 text-amber" />
              Continue Exploring
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {progressItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                progress={item.progress_percent} 
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Saved Stories */}
      {savedItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-muted-indigo" />
                Saved Stories
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link to="/collections">
                  View all
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {savedItems.slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Downloaded Content */}
      {downloadedItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4 text-adventure-green" />
                Downloaded Content
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link to="/downloads">
                  Manage
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-1">
            {downloadedItems.slice(0, 2).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}