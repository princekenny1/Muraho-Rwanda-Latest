import { cn } from "@/lib/utils";

export type AskRwandaFilter = "all" | "museums" | "routes" | "locations" | "themes" | "stories" | "testimonies";

interface AskRwandaFilterBarProps {
  activeFilter: AskRwandaFilter;
  onFilterChange: (filter: AskRwandaFilter) => void;
}

const filters: { value: AskRwandaFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "museums", label: "Museums" },
  { value: "routes", label: "Routes" },
  { value: "locations", label: "Locations" },
  { value: "themes", label: "Themes" },
  { value: "stories", label: "Stories" },
  { value: "testimonies", label: "Testimonies" },
];

export function AskRwandaFilterBar({ activeFilter, onFilterChange }: AskRwandaFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            activeFilter === filter.value
              ? "bg-amber text-midnight"
              : "bg-card border border-border/50 text-foreground hover:border-amber/50"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
