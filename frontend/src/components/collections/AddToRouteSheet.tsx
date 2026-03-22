import { useState } from "react";
import { Plus, Check, MapPin, Clock, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Route {
  id: string;
  name: string;
  storyCount: number;
  totalDistance: string;
  totalDuration: string;
}

interface AddToRouteSheetProps {
  storyTitle: string;
  routes: Route[];
  isOpen: boolean;
  onClose: () => void;
  onAddToRoute: (routeId: string) => void;
  onCreateNewRoute: () => void;
}

const defaultRoutes: Route[] = [
  {
    id: "kigali-day",
    name: "Kigali City Day",
    storyCount: 6,
    totalDistance: "12 km",
    totalDuration: "3h 30min",
  },
  {
    id: "lake-kivu",
    name: "Lake Kivu Weekend",
    storyCount: 10,
    totalDistance: "280 km",
    totalDuration: "2 days",
  },
  {
    id: "northern-circuit",
    name: "Northern Circuit",
    storyCount: 8,
    totalDistance: "180 km",
    totalDuration: "1 day",
  },
];

export function AddToRouteSheet({
  storyTitle,
  routes = defaultRoutes,
  isOpen,
  onClose,
  onAddToRoute,
  onCreateNewRoute,
}: AddToRouteSheetProps) {
  const [addedToRoutes, setAddedToRoutes] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddToRoute = (routeId: string) => {
    if (!addedToRoutes.includes(routeId)) {
      setAddedToRoutes([...addedToRoutes, routeId]);
      onAddToRoute(routeId);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-modal animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
          <div>
            <h2 className="font-serif font-semibold text-lg text-foreground">
              Add to Route
            </h2>
            <p className="text-sm text-muted-foreground truncate max-w-[250px]">
              {storyTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Routes list */}
        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {routes.map((route) => {
            const isAdded = addedToRoutes.includes(route.id);
            return (
              <button
                key={route.id}
                onClick={() => handleAddToRoute(route.id)}
                disabled={isAdded}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  isAdded 
                    ? "bg-adventure-green/10 border-2 border-adventure-green" 
                    : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                )}
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isAdded ? "bg-adventure-green text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isAdded ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium",
                    isAdded ? "text-adventure-green" : "text-foreground"
                  )}>
                    {route.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{route.storyCount} stories</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {route.totalDistance}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {route.totalDuration}
                    </span>
                  </div>
                </div>

                {!isAdded && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>
            );
          })}

          {/* Create new route */}
          <button
            onClick={onCreateNewRoute}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-amber text-amber hover:bg-amber/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium">Create New Route</span>
          </button>
        </div>

        {/* Done button */}
        {addedToRoutes.length > 0 && (
          <div className="p-4 border-t border-border">
            <button
              onClick={onClose}
              className="w-full h-12 bg-amber text-midnight rounded-xl font-semibold hover:bg-sunset-gold transition-colors"
            >
              Done ({addedToRoutes.length} added)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
