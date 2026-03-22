import { useState } from "react";
import { 
  BookOpen, 
  Users, 
  Film, 
  LayoutGrid, 
  Quote, 
  Search,
  Plus,
  MapPin,
  Tag,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { StoryEditor } from "@/components/cms/StoryEditor";
import { TestimonyEditor } from "@/components/cms/TestimonyEditor";
import { DocumentaryEditor } from "@/components/cms/DocumentaryEditor";
import { QuoteEditor } from "@/components/cms/QuoteEditor";
import { TagManager } from "@/components/cms/TagManager";
import { PeopleManager } from "@/components/cms/PeopleManager";
import { LocationManager } from "@/components/cms/LocationManager";
import { EventManager } from "@/components/cms/EventManager";
import { ContentSearch } from "@/components/cms/ContentSearch";

type EditorType = null | "story" | "testimony" | "documentary" | "quote";
type ManagerType = null | "tags" | "people" | "locations" | "events";

const contentTypes = [
  {
    id: "story",
    title: "Story",
    description: "Text, images, video, and audio content linked to places and themes",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "testimony",
    title: "Testimony",
    description: "Audio or video testimonies with transcripts and sensitive content tags",
    icon: Users,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "documentary",
    title: "Film / Documentary",
    description: "Long-form videos with clips, trailers, and historical context",
    icon: Film,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    id: "quote",
    title: "Quote",
    description: "Standalone quotes for emphasis in stories and exhibitions",
    icon: Quote,
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

const managers = [
  {
    id: "tags",
    title: "Themes",
    description: "Manage themes like Reconciliation, Memory, Culture",
    icon: Tag,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "people",
    title: "People",
    description: "Speakers, survivors, historical figures",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "locations",
    title: "Locations",
    description: "Memorials, museums, cities, historical sites",
    icon: MapPin,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    id: "events",
    title: "Historical Events",
    description: "Time periods, incidents, milestones",
    icon: Calendar,
    color: "bg-purple-500/10 text-purple-600",
  },
];

export default function ContentCMS() {
  const navigate = useNavigate();
  const [activeEditor, setActiveEditor] = useState<EditorType>(null);
  const [activeManager, setActiveManager] = useState<ManagerType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => {
    if (activeEditor || activeManager) {
      setActiveEditor(null);
      setActiveManager(null);
      setEditingId(null);
    } else {
      navigate("/admin");
    }
  };

  const handleEditContent = (type: EditorType, id: string) => {
    setEditingId(id);
    setActiveEditor(type);
  };

  // Render active editor
  if (activeEditor === "story") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <StoryEditor storyId={editingId} onClose={handleBack} />
      </div>
    );
  }

  if (activeEditor === "testimony") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <TestimonyEditor testimonyId={editingId} onClose={handleBack} />
      </div>
    );
  }

  if (activeEditor === "documentary") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <DocumentaryEditor documentaryId={editingId} onClose={handleBack} />
      </div>
    );
  }

  if (activeEditor === "quote") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <QuoteEditor quoteId={editingId} onClose={handleBack} />
      </div>
    );
  }

  // Render active manager
  if (activeManager === "tags") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <TagManager />
      </div>
    );
  }

  if (activeManager === "people") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <PeopleManager />
      </div>
    );
  }

  if (activeManager === "locations") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <LocationManager />
      </div>
    );
  }

  if (activeManager === "events") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to CMS
            </Button>
          </div>
        </div>
        <EventManager />
      </div>
    );
  }

  // Main CMS Home
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate("/admin")} className="gap-2 mb-2 -ml-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
              <h1 className="text-3xl font-bold">Content Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage stories, testimonies, films, and more
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="create" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="create">Create Content</TabsTrigger>
            <TabsTrigger value="manage">Manage Tags</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          {/* CREATE CONTENT TAB */}
          <TabsContent value="create" className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Add New Content</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card 
                      key={type.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setActiveEditor(type.id as EditorType)}
                    >
                      <CardHeader className="pb-3">
                        <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mb-2`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add {type.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{type.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick access to existing content */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
              <ContentSearch 
                compact 
                onEdit={(type, id) => handleEditContent(type as EditorType, id)} 
              />
            </div>
          </TabsContent>

          {/* MANAGE TAGS TAB */}
          <TabsContent value="manage" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Tag Management</h2>
              <p className="text-muted-foreground mb-6">
                Tags are used to categorize content and power AI search. All content should be tagged.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {managers.map((manager) => {
                  const Icon = manager.icon;
                  return (
                    <Card 
                      key={manager.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setActiveManager(manager.id as ManagerType)}
                    >
                      <CardHeader className="pb-3">
                        <div className={`w-10 h-10 rounded-lg ${manager.color} flex items-center justify-center mb-2`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">{manager.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{manager.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* SEARCH TAB */}
          <TabsContent value="search" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Search All Content</h2>
              <ContentSearch 
                onEdit={(type, id) => handleEditContent(type as EditorType, id)} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
