import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Loader2, MapPin, BookOpen, Film, Mic, Route, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/layout/AppHeader";
import { useSearch, type SearchResult } from "@/hooks/useSearch";

const TYPE_CONFIG: Record<string, { icon: typeof Search; label: string; color: string; path: string }> = {
  stories: { icon: BookOpen, label: "Story", color: "bg-amber/15 text-amber", path: "/stories" },
  museums: { icon: Landmark, label: "Museum", color: "bg-muted-indigo/15 text-muted-indigo", path: "/museums" },
  locations: { icon: MapPin, label: "Location", color: "bg-adventure-green/15 text-adventure-green", path: "/locations" },
  routes: { icon: Route, label: "Route", color: "bg-forest-teal/15 text-forest-teal", path: "/routes" },
  testimonies: { icon: Mic, label: "Testimony", color: "bg-terracotta/15 text-terracotta", path: "/testimonies" },
  documentaries: { icon: Film, label: "Documentary", color: "bg-primary/15 text-primary", path: "/documentaries" },
};

function ResultCard({ result }: { result: SearchResult }) {
  const navigate = useNavigate();
  const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.stories;
  const Icon = config.icon;

  const handleClick = () => {
    navigate(`${config.path}/${result.slug}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
    >
      {result.imageUrl ? (
        <img
          src={result.imageUrl}
          alt=""
          className="w-16 h-16 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
        <h3 className="font-semibold text-sm line-clamp-1">{result.title}</h3>
        {result.excerpt && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.excerpt}</p>
        )}
      </div>
    </button>
  );
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";
  const { query, setQuery, results, total, isSearching } = useSearch(250);

  // Initialize from URL params
  useEffect(() => {
    if (initialQuery && !query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query, setQuery]);

  // Sync query to URL
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query }, { replace: true });
    }
  }, [query, setSearchParams]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* Back + Search */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories, museums, routes..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        {/* Results count */}
        {query.length >= 2 && !isSearching && (
          <p className="text-sm text-muted-foreground mb-4">
            {total === 0
              ? `No results for "${query}"`
              : `${total} result${total !== 1 ? "s" : ""} for "${query}"`}
          </p>
        )}

        {/* Results list */}
        <div className="space-y-3">
          {results.map((result) => (
            <ResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>

        {/* Empty state */}
        {query.length >= 2 && !isSearching && total === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">No matches found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try different keywords or explore the map
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/map")}>
              <MapPin className="w-4 h-4 mr-2" />
              Explore Map
            </Button>
          </div>
        )}

        {/* Prompt to type */}
        {query.length < 2 && (
          <div className="text-center py-16 space-y-3 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
