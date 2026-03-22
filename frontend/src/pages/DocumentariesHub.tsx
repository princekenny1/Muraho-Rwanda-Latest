import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Film, Clock, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocumentaries, Documentary } from "@/hooks/useDocumentaries";

type DocumentaryType =
  | "all"
  | "survivor-stories"
  | "historical"
  | "cultural"
  | "educational";
type DurationFilter = "all" | "short" | "medium" | "long";

const typeFilters: { id: DocumentaryType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "survivor-stories", label: "Survivor Stories" },
  { id: "historical", label: "Historical" },
  { id: "cultural", label: "Cultural" },
  { id: "educational", label: "Educational" },
];

const durationFilters: { id: DurationFilter; label: string; range: string }[] =
  [
    { id: "all", label: "Any Length", range: "" },
    { id: "short", label: "Under 1hr", range: "< 60 min" },
    { id: "medium", label: "1-2 hours", range: "60-120 min" },
    { id: "long", label: "Over 2hrs", range: "> 120 min" },
  ];

function DocumentaryCardSkeleton() {
  return (
    <div className="flex gap-4 p-3 rounded-2xl bg-card border border-border">
      <Skeleton className="w-28 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 py-0.5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function DocumentariesHub() {
  const navigate = useNavigate();
  const { data: documentaries = [], isLoading, error } = useDocumentaries();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentaryType>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const formatRuntime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const filterByDuration = (runtime: number, filter: DurationFilter) => {
    switch (filter) {
      case "short":
        return runtime < 60;
      case "medium":
        return runtime >= 60 && runtime <= 120;
      case "long":
        return runtime > 120;
      default:
        return true;
    }
  };

  const filteredDocumentaries = documentaries.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesDuration = filterByDuration(doc.runtime, durationFilter);
    return matchesSearch && matchesType && matchesDuration;
  });

  const activeFiltersCount = [
    typeFilter !== "all",
    durationFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter("all");
    setDurationFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-amber" />
              <h1 className="font-semibold text-foreground">Documentaries</h1>
            </div>
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              showFilters && "bg-amber hover:bg-amber/90 text-midnight",
            )}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 bg-midnight text-white text-[10px] px-1.5">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documentaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 bg-background animate-fade-in">
            {/* Type Filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setTypeFilter(filter.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      typeFilter === filter.id
                        ? "bg-amber text-midnight"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Duration
              </p>
              <div className="flex flex-wrap gap-2">
                {durationFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setDurationFilter(filter.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      durationFilter === filter.id
                        ? "bg-amber text-midnight"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-screen">
        <div className={cn("pt-32 pb-8 px-4", showFilters && "pt-56")}>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground mb-4">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span>
                {filteredDocumentaries.length} documentary
                {filteredDocumentaries.length !== 1 ? "ies" : ""} found
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <DocumentaryCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <Film className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Failed to load documentaries
              </p>
            </div>
          )}

          {!isLoading && !error && filteredDocumentaries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocumentaries.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/documentaries/${doc.slug}`)}
                  className="w-full text-left group"
                >
                  <div
                    className="flex gap-4 p-3 rounded-2xl bg-card border border-border hover:border-amber/50 transition-all"
                    style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={doc.cover_image}
                        alt={doc.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {doc.is_new && (
                        <Badge className="absolute top-1 left-1 bg-amber text-midnight text-[10px] px-1.5 py-0">
                          New
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-amber transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {doc.synopsis}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRuntime(doc.runtime)}
                        </span>
                        <span>{doc.chapters_count || 0} chapters</span>
                        <span>{doc.year}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredDocumentaries.length === 0 && (
            <div className="text-center py-12">
              <Film className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No documentaries found</p>
              <Button
                variant="link"
                onClick={clearFilters}
                className="text-amber mt-2"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default DocumentariesHub;
