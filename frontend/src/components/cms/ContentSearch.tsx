import { useState } from "react";
import {
  Search,
  BookOpen,
  Users,
  Film,
  Quote,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContentCMS } from "@/hooks/useContentCMS";
import { useTestimonies } from "@/hooks/useTestimonies";
import { useDocumentaries } from "@/hooks/useDocumentaries";

interface ContentSearchProps {
  compact?: boolean;
  onEdit?: (type: string, id: string) => void;
}

export function ContentSearch({ compact = false, onEdit }: ContentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const cms = useContentCMS();
  const { data: stories = [] } = cms.useStories();
  const { data: quotes = [] } = cms.useQuotes();
  const { data: testimonies = [] } = useTestimonies();
  const { data: documentaries = [] } = useDocumentaries();

  const filteredStories = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTestimonies = testimonies.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.person_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredDocumentaries = documentaries.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.synopsis.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredQuotes = quotes.filter(
    (q) =>
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.attribution?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allContent = [
    ...filteredStories.map((s) => ({ ...s, type: "story" as const })),
    ...filteredTestimonies.map((t) => ({ ...t, type: "testimony" as const })),
    ...filteredDocumentaries.map((d) => ({
      ...d,
      type: "documentary" as const,
    })),
    ...filteredQuotes.map((q) => ({ ...q, type: "quote" as const })),
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "story":
        return BookOpen;
      case "testimony":
        return Users;
      case "documentary":
        return Film;
      case "quote":
        return Quote;
      default:
        return BookOpen;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "story":
        return "bg-primary/10 text-primary";
      case "testimony":
        return "bg-amber-500/10 text-amber-600";
      case "documentary":
        return "bg-rose-500/10 text-rose-600";
      case "quote":
        return "bg-indigo-500/10 text-indigo-600";
      default:
        return "bg-muted";
    }
  };

  const renderItem = (item: any) => {
    const Icon = getIcon(item.type);
    const title =
      item.type === "story" || item.type === "documentary"
        ? item.title
        : item.type === "testimony"
          ? `${item.person_name}: ${item.title}`
          : item.text.slice(0, 60) + (item.text.length > 60 ? "..." : "");

    const subtitle =
      item.type === "story"
        ? item.summary?.slice(0, 80)
        : item.type === "documentary"
          ? `${item.director || "Unknown"} • ${item.year}`
          : item.type === "testimony"
            ? item.category
            : item.attribution;

    return (
      <Card
        key={`${item.type}-${item.id}`}
        className="hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => onEdit?.(item.type, item.id)}
      >
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg ${getColor(item.type)} flex items-center justify-center shrink-0`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium truncate">{title}</h4>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Badge variant="secondary" className="capitalize text-xs">
              {item.type}
            </Badge>
            {item.status && (
              <Badge
                variant={item.status === "published" ? "default" : "outline"}
                className="text-xs"
              >
                {item.status}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (compact) {
    // Show limited results for compact view
    const recentContent = allContent.slice(0, 5);

    return (
      <div className="space-y-3">
        {recentContent.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>
                No content yet. Start by adding a story, testimony, or
                documentary.
              </p>
            </CardContent>
          </Card>
        ) : (
          recentContent.map(renderItem)
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all content..."
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({allContent.length})</TabsTrigger>
          <TabsTrigger value="stories">
            Stories ({filteredStories.length})
          </TabsTrigger>
          <TabsTrigger value="testimonies">
            Testimonies ({filteredTestimonies.length})
          </TabsTrigger>
          <TabsTrigger value="documentaries">
            Films ({filteredDocumentaries.length})
          </TabsTrigger>
          <TabsTrigger value="quotes">
            Quotes ({filteredQuotes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {allContent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No content found matching "{searchQuery}"</p>
              </CardContent>
            </Card>
          ) : (
            allContent.map(renderItem)
          )}
        </TabsContent>

        <TabsContent value="stories" className="mt-4 space-y-3">
          {filteredStories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No stories found</p>
              </CardContent>
            </Card>
          ) : (
            filteredStories.map((s) => renderItem({ ...s, type: "story" }))
          )}
        </TabsContent>

        <TabsContent value="testimonies" className="mt-4 space-y-3">
          {filteredTestimonies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No testimonies found</p>
              </CardContent>
            </Card>
          ) : (
            filteredTestimonies.map((t) =>
              renderItem({ ...t, type: "testimony" }),
            )
          )}
        </TabsContent>

        <TabsContent value="documentaries" className="mt-4 space-y-3">
          {filteredDocumentaries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No documentaries found</p>
              </CardContent>
            </Card>
          ) : (
            filteredDocumentaries.map((d) =>
              renderItem({ ...d, type: "documentary" }),
            )
          )}
        </TabsContent>

        <TabsContent value="quotes" className="mt-4 space-y-3">
          {filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No quotes found</p>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((q) => renderItem({ ...q, type: "quote" }))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
