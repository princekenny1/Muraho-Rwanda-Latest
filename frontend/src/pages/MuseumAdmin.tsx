import { useState } from "react";
import { Plus, Building2, MapPin, Eye, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMuseums, useMuseumMutations, Museum } from "@/hooks/useMuseumAdmin";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function MuseumAdmin() {
  const navigate = useNavigate();
  const { data: museums = [], isLoading } = useMuseums();
  const { createMuseum, deleteMuseum } = useMuseumMutations();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMuseum, setNewMuseum] = useState({
    name: "",
    short_description: "",
    address: "",
  });

  const filteredMuseums = museums.filter(
    (museum) =>
      museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      museum.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newMuseum.name.trim()) return;

    await createMuseum.mutateAsync({
      name: newMuseum.name,
      slug: generateSlug(newMuseum.name),
      short_description: newMuseum.short_description || null,
      address: newMuseum.address || null,
    });

    setNewMuseum({ name: "", short_description: "", address: "" });
    setIsCreateOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMuseum.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <Building2 className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Museums & Memorials</h1>
              <p className="text-sm text-muted-foreground">Manage museum experiences</p>
            </div>
          </div>

          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Museum
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Museum</SheetTitle>
                <SheetDescription>
                  Add a new museum or memorial to manage
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Museum Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Kigali Genocide Memorial"
                    value={newMuseum.name}
                    onChange={(e) => setNewMuseum({ ...newMuseum, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the museum..."
                    value={newMuseum.short_description}
                    onChange={(e) =>
                      setNewMuseum({ ...newMuseum, short_description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., Gisozi, Kigali"
                    value={newMuseum.address}
                    onChange={(e) => setNewMuseum({ ...newMuseum, address: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={!newMuseum.name.trim() || createMuseum.isPending}
                >
                  {createMuseum.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Museum"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search museums..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && museums.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No museums yet</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Create your first museum or memorial to start building immersive experiences.
              </p>
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Museum
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Museum list */}
        {!isLoading && filteredMuseums.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMuseums.map((museum) => (
              <Card key={museum.id} className="group relative overflow-hidden">
                {/* Cover image */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {museum.cover_image ? (
                    <img
                      src={museum.cover_image}
                      alt={museum.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted-indigo/20 to-terracotta/20">
                      <Building2 className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Status badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {museum.is_featured && (
                      <Badge variant="secondary" className="bg-amber text-midnight">
                        Featured
                      </Badge>
                    )}
                    {!museum.is_active && (
                      <Badge variant="outline" className="bg-background/80">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{museum.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {museum.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{museum.address}</span>
                    </div>
                  )}

                  {museum.short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {museum.short_description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/admin/museums/${museum.id}`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/museums/${museum.slug}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Museum</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{museum.name}"? This will permanently
                            remove all outdoor stops, rooms, and panels. This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(museum.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No search results */}
        {!isLoading && museums.length > 0 && filteredMuseums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No museums found matching "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
}
