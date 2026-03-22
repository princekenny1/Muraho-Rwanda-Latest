import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type TestimonyCategory = "all" | "survivor" | "rescuer" | "witness" | "reconciliation";

interface TestimonyFiltersProps {
  selectedCategory: TestimonyCategory;
  onCategoryChange: (category: TestimonyCategory) => void;
  locations: string[];
  selectedLocation: string | null;
  onLocationChange: (location: string | null) => void;
  className?: string;
}

const categories: { id: TestimonyCategory; label: string }[] = [
  { id: "all", label: "All Stories" },
  { id: "survivor", label: "Survivors" },
  { id: "rescuer", label: "Rescuers" },
  { id: "witness", label: "Witnesses" },
  { id: "reconciliation", label: "Reconciliation" },
];

export function TestimonyFilters({
  selectedCategory,
  onCategoryChange,
  locations,
  selectedLocation,
  onLocationChange,
  className,
}: TestimonyFiltersProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Category Filters */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "whitespace-nowrap rounded-full transition-all",
                selectedCategory === cat.id
                  ? "bg-muted-indigo hover:bg-muted-indigo/90"
                  : "hover:bg-muted"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Location Filters */}
      {locations.length > 0 && (
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            <Button
              variant={selectedLocation === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onLocationChange(null)}
              className="whitespace-nowrap rounded-full text-xs"
            >
              All Locations
            </Button>
            {locations.map((loc) => (
              <Button
                key={loc}
                variant={selectedLocation === loc ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onLocationChange(loc)}
                className="whitespace-nowrap rounded-full text-xs"
              >
                {loc}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
