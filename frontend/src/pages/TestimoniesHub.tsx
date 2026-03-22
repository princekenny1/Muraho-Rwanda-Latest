import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Search, Users } from "lucide-react";
import { useTestimonies } from "@/hooks/useTestimonies";
import { TestimonyCard } from "@/components/testimony/TestimonyCard";
import { TestimonyFilters, type TestimonyCategory } from "@/components/testimony/TestimonyFilters";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestimoniesHub() {
  const navigate = useNavigate();
  const { data: testimonies, isLoading } = useTestimonies();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TestimonyCategory>("all");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Extract unique locations
  const locations = useMemo(() => {
    if (!testimonies) return [];
    const locs = testimonies
      .map((t) => t.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locs)].sort();
  }, [testimonies]);

  // Filter testimonies
  const filteredTestimonies = useMemo(() => {
    if (!testimonies) return [];
    
    return testimonies.filter((t) => {
      // Category filter
      if (selectedCategory !== "all" && t.category !== selectedCategory) {
        return false;
      }
      
      // Location filter
      if (selectedLocation && t.location !== selectedLocation) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.person_name.toLowerCase().includes(query) ||
          t.context.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [testimonies, selectedCategory, selectedLocation, searchQuery]);

  const featuredTestimonies = useMemo(() => {
    return filteredTestimonies.filter((t) => t.is_featured);
  }, [filteredTestimonies]);

  const regularTestimonies = useMemo(() => {
    return filteredTestimonies.filter((t) => !t.is_featured);
  }, [filteredTestimonies]);

  const handleTestimonyClick = (slug: string) => {
    navigate(`/testimonies/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Survivor Testimonies</h1>
              <p className="text-sm text-muted-foreground">
                {testimonies?.length || 0} stories of resilience and hope
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search testimonies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-0"
            />
          </div>

          {/* Filters */}
          <TestimonyFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTestimonies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No testimonies found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your filters or search query to find more stories.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Section */}
            {featuredTestimonies.length > 0 && selectedCategory === "all" && !searchQuery && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-muted-indigo" />
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Featured Testimonies
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredTestimonies.map((testimony) => (
                    <TestimonyCard
                      key={testimony.id}
                      testimony={testimony}
                      onClick={handleTestimonyClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Testimonies */}
            <section>
              {featuredTestimonies.length > 0 && selectedCategory === "all" && !searchQuery && (
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  All Testimonies
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedCategory === "all" && !searchQuery ? regularTestimonies : filteredTestimonies).map(
                  (testimony) => (
                    <TestimonyCard
                      key={testimony.id}
                      testimony={testimony}
                      onClick={handleTestimonyClick}
                    />
                  )
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
