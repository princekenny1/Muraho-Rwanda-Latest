import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Gift, Sparkles, ChevronRight, Play, Clock, Heart } from "lucide-react";
import coverImg from "@/assets/cover.jpg";
import kctPost from "@/assets/KCT-Post.jpg";
import kctPrecolonial from "@/assets/KCT-precolonial.jpg";

interface FreeStory {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  type: "sponsored" | "open-access" | "preview";
  sponsorName?: string;
}

const freeStories: FreeStory[] = [
  {
    id: "kigali-overview",
    title: "Welcome to Kigali",
    subtitle: "An introduction to Rwanda's vibrant capital",
    imageUrl: coverImg,
    duration: "5 min",
    type: "open-access",
  },
  {
    id: "memorial-intro",
    title: "Understanding Remembrance",
    subtitle: "Why memorials matter in Rwanda's journey",
    imageUrl: kctPost,
    duration: "8 min",
    type: "sponsored",
    sponsorName: "Rwanda Development Board",
  },
  {
    id: "nature-preview",
    title: "Land of a Thousand Hills",
    subtitle: "Preview: Rwanda's stunning landscapes",
    imageUrl: kctPrecolonial,
    duration: "3 min",
    type: "preview",
  },
];

interface FeaturedFreeContentProps {
  onStoryClick?: (storyId: string) => void;
  onViewAll?: () => void;
}

export function FeaturedFreeContent({
  onStoryClick,
  onViewAll,
}: FeaturedFreeContentProps) {
  const getTypeBadge = (type: FreeStory["type"], sponsorName?: string) => {
    switch (type) {
      case "sponsored":
        return (
          <Badge
            variant="outline"
            className="bg-adventure-green/20 text-adventure-green border-adventure-green/50 text-[10px]"
          >
            <Heart className="w-3 h-3 mr-1" />
            {sponsorName || "Sponsored"}
          </Badge>
        );
      case "open-access":
        return (
          <Badge
            variant="outline"
            className="bg-muted-indigo/20 text-muted-indigo border-muted-indigo/50 text-[10px]"
          >
            <Gift className="w-3 h-3 mr-1" />
            Free
          </Badge>
        );
      case "preview":
        return (
          <Badge
            variant="outline"
            className="bg-amber/20 text-amber border-amber/50 text-[10px]"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Preview
          </Badge>
        );
    }
  };

  return (
    <section className="px-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-muted-indigo" />
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Free to Explore
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-amber text-sm font-medium hover:text-sunset-gold transition-colors"
        >
          See all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {freeStories.map((story) => (
            <CarouselItem key={story.id} className="pl-3 basis-[80%]">
              <Card
                className="overflow-hidden cursor-pointer group"
                onClick={() => onStoryClick?.(story.id)}
              >
                <div className="relative h-36">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    {getTypeBadge(story.type, story.sponsorName)}
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-white/80 text-xs line-clamp-1 mb-1">
                      {story.subtitle}
                    </p>
                    <div className="flex items-center gap-1 text-white/70">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{story.duration}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Quick Access CTA */}
      <Card className="mt-4 bg-gradient-to-r from-muted-indigo/10 to-forest-teal/10 border-muted-indigo/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Want more stories?
            </p>
            <p className="text-xs text-muted-foreground">
              Unlock full access or enter your tour code
            </p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/access">
              <Sparkles className="w-4 h-4 mr-1" />
              Upgrade
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
