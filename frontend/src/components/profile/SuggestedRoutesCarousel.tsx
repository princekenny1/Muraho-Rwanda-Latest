import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Route as RouteIcon, ChevronRight, Building2 } from "lucide-react";

interface SuggestedRoutesCarouselProps {
  agencyName: string;
}

export function SuggestedRoutesCarousel({ agencyName }: SuggestedRoutesCarouselProps) {
  const { data: routes, isLoading } = useQuery({
    queryKey: ["suggested-routes"],
    queryFn: async () => {
      const res = await api.find("routes", {
        where: { status: { equals: "published" } },
        limit: 6,
      });
      return res.docs;
    },
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-64 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routes || routes.length === 0) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "moderate":
        return "bg-amber/20 text-amber border-amber/50";
      case "challenging":
        return "bg-destructive/20 text-destructive border-destructive/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-adventure-green/10 to-forest-teal/5 border-adventure-green/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4 text-adventure-green" />
          <span className="text-adventure-green">{agencyName}</span>
          <span className="text-foreground">Suggested Routes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: routes.length > 2,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {routes.map((route) => (
              <CarouselItem key={route.id} className="pl-2 basis-[85%] sm:basis-[70%]">
                <Link to={`/routes/${route.slug}`}>
                  <div className="relative h-40 rounded-lg overflow-hidden group">
                    {route.cover_image ? (
                      <img
                        src={route.cover_image}
                        alt={route.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <RouteIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">
                        {route.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {route.duration_minutes && (
                          <span className="text-xs text-white/80 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(route.duration_minutes / 60)}h
                          </span>
                        )}
                        {route.distance_km && (
                          <span className="text-xs text-white/80 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {route.distance_km}km
                          </span>
                        )}
                        {route.difficulty && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 ${getDifficultyColor(route.difficulty)}`}
                          >
                            {route.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          {routes.length > 2 && (
            <>
              <CarouselPrevious className="hidden sm:flex -left-3 h-8 w-8" />
              <CarouselNext className="hidden sm:flex -right-3 h-8 w-8" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
}
