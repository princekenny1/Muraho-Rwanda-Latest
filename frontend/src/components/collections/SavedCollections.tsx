import { useState } from "react";
import { Heart, Clock, Download, Play, Plus, ChevronRight, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  icon: React.ReactNode;
  storyCount: number;
  totalDuration: string;
  isOfflineAvailable: boolean;
  coverImages: string[];
}

interface SavedCollectionsProps {
  collections: Collection[];
  onOpenCollection: (collectionId: string) => void;
  onStartPlaylist: (collectionId: string) => void;
  onCreateCollection: () => void;
}

const defaultCollections: Collection[] = [
  {
    id: "favorites",
    name: "Favorites",
    icon: <Heart className="w-4 h-4" />,
    storyCount: 12,
    totalDuration: "45 min",
    isOfflineAvailable: true,
    coverImages: [
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=200",
      "https://images.unsplash.com/photo-1597911929395-dc94e56f2e52?w=200",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200",
    ],
  },
  {
    id: "listen-later",
    name: "Listen Later",
    icon: <Clock className="w-4 h-4" />,
    storyCount: 8,
    totalDuration: "28 min",
    isOfflineAvailable: false,
    coverImages: [
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=200",
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=200",
    ],
  },
  {
    id: "road-stories",
    name: "Road Stories",
    icon: <span>🛣️</span>,
    storyCount: 15,
    totalDuration: "1h 12min",
    isOfflineAvailable: true,
    coverImages: [
      "https://images.unsplash.com/photo-1597911929395-dc94e56f2e52?w=200",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200",
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=200",
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=200",
    ],
  },
];

export function SavedCollections({
  collections = defaultCollections,
  onOpenCollection,
  onStartPlaylist,
  onCreateCollection,
}: SavedCollectionsProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-semibold text-xl text-foreground">
          Your Collections
        </h2>
        <button
          onClick={onCreateCollection}
          className="flex items-center gap-1 text-sm font-medium text-amber hover:text-sunset-gold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Collections grid */}
      <div className="space-y-3">
        {collections.map((collection) => (
          <div 
            key={collection.id}
            className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
          >
            <div className="flex items-start gap-3">
              {/* Cover images mosaic */}
              <div className="relative w-20 h-20 flex-shrink-0">
                {collection.coverImages.length === 1 ? (
                  <div 
                    className="w-full h-full rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${collection.coverImages[0]})` }}
                  />
                ) : collection.coverImages.length === 2 ? (
                  <div className="w-full h-full grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
                    {collection.coverImages.map((img, i) => (
                      <div 
                        key={i}
                        className="bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl overflow-hidden">
                    {collection.coverImages.slice(0, 4).map((img, i) => (
                      <div 
                        key={i}
                        className="bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Icon overlay */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center">
                  {collection.icon}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onOpenCollection(collection.id)}
                  className="flex items-center gap-1 group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-amber transition-colors">
                    {collection.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber transition-colors" />
                </button>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{collection.storyCount} stories</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {collection.totalDuration}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {collection.isOfflineAvailable ? (
                    <span className="flex items-center gap-1 text-xs text-adventure-green font-medium">
                      <Wifi className="w-3 h-3" />
                      Available offline
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <WifiOff className="w-3 h-3" />
                      Online only
                    </span>
                  )}
                </div>
              </div>

              {/* Play button */}
              <button
                onClick={() => onStartPlaylist(collection.id)}
                className="w-10 h-10 bg-amber rounded-full flex items-center justify-center text-midnight hover:bg-sunset-gold transition-colors shadow-md"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
