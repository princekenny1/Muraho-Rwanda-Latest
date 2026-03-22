import { useState } from "react";
import { Plus, ExternalLink, ArrowLeft, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDocumentaries,
  useDocumentaryChapters,
  type Documentary,
  type Chapter,
} from "@/hooks/useDocumentaries";
import { useDocumentaryAdmin } from "@/hooks/useDocumentaryAdmin";
import { DocumentaryAdminCard } from "./DocumentaryAdminCard";
import { DocumentaryForm } from "./DocumentaryForm";
import { ChapterForm } from "./ChapterForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentaryAdminPanel() {
  const { toast } = useToast();
  const { data: documentaries = [], isLoading } = useDocumentaries();
  const {
    createDocumentary,
    updateDocumentary,
    deleteDocumentary,
    createChapter,
    updateChapter,
    deleteChapter,
  } = useDocumentaryAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDocumentary, setEditingDocumentary] =
    useState<Documentary | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Chapter management state
  const [managingChaptersFor, setManagingChaptersFor] =
    useState<Documentary | null>(null);
  const [chapterFormOpen, setChapterFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);

  const { data: chapters = [] } = useDocumentaryChapters(
    managingChaptersFor?.id,
  );

  const filteredDocumentaries = documentaries.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.director?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddDocumentary = () => {
    setEditingDocumentary(null);
    setFormOpen(true);
  };

  const handleEditDocumentary = (documentary: Documentary) => {
    setEditingDocumentary(documentary);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingDocumentary) {
        await updateDocumentary.mutateAsync({
          id: editingDocumentary.id,
          ...values,
        });
        toast({ title: "Documentary updated successfully" });
      } else {
        await createDocumentary.mutateAsync(values);
        toast({ title: "Documentary added successfully" });
      }
      setFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving documentary",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (documentary: Documentary) => {
    try {
      await updateDocumentary.mutateAsync({
        id: documentary.id,
        is_featured: !documentary.is_featured,
      });
      toast({
        title: documentary.is_featured
          ? "Removed from featured"
          : "Set as featured",
      });
    } catch (error: any) {
      toast({
        title: "Error updating documentary",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocumentary = async () => {
    if (!deleteId) return;
    try {
      await deleteDocumentary.mutateAsync(deleteId);
      toast({ title: "Documentary deleted" });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Error deleting documentary",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Chapter handlers
  const handleAddChapter = () => {
    setEditingChapter(null);
    setChapterFormOpen(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterFormOpen(true);
  };

  const handleChapterFormSubmit = async (values: any) => {
    if (!managingChaptersFor) return;
    try {
      if (editingChapter) {
        await updateChapter.mutateAsync({
          id: editingChapter.id,
          ...values,
        });
        toast({ title: "Chapter updated successfully" });
      } else {
        await createChapter.mutateAsync({
          documentary_id: managingChaptersFor.id,
          chapter_number: chapters.length + 1,
          ...values,
        });
        toast({ title: "Chapter added successfully" });
      }
      setChapterFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;
    try {
      await deleteChapter.mutateAsync(deleteChapterId);
      toast({ title: "Chapter deleted" });
      setDeleteChapterId(null);
    } catch (error: any) {
      toast({
        title: "Error deleting chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Chapter management view
  if (managingChaptersFor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setManagingChaptersFor(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">
                Chapters: {managingChaptersFor.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage chapters for this documentary
              </p>
            </div>
          </div>
          <Button onClick={handleAddChapter}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No chapters yet. Add your first chapter to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                        {chapter.chapter_number}
                      </div>
                      <div>
                        <h3 className="font-medium">{chapter.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{chapter.duration} min</span>
                          <Badge variant="outline">{chapter.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditChapter(chapter)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteChapterId(chapter.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ChapterForm
          open={chapterFormOpen}
          onOpenChange={setChapterFormOpen}
          chapter={editingChapter}
          onSubmit={handleChapterFormSubmit}
          isLoading={createChapter.isPending || updateChapter.isPending}
        />

        <AlertDialog
          open={!!deleteChapterId}
          onOpenChange={() => setDeleteChapterId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this chapter and its transcripts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChapter}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Documentaries</h2>
          <p className="text-sm text-muted-foreground">
            Manage documentary films and their chapters
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open("/documentaries", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Hub
          </Button>
          <Button onClick={handleAddDocumentary}>
            <Plus className="h-4 w-4 mr-2" />
            Add Documentary
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by title or director..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="historical">Historical</SelectItem>
            <SelectItem value="survivor">Survivor</SelectItem>
            <SelectItem value="cultural">Cultural</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading documentaries...</p>
      ) : filteredDocumentaries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>
            {documentaries.length === 0
              ? "No documentaries yet. Add your first documentary to get started."
              : "No documentaries match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocumentaries.map((documentary) => (
            <DocumentaryAdminCard
              key={documentary.id}
              documentary={documentary}
              onEdit={handleEditDocumentary}
              onDelete={(id) => setDeleteId(id)}
              onToggleFeatured={handleToggleFeatured}
              onManageChapters={setManagingChaptersFor}
            />
          ))}
        </div>
      )}

      <DocumentaryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        documentary={editingDocumentary}
        onSubmit={handleFormSubmit}
        isLoading={createDocumentary.isPending || updateDocumentary.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Documentary?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this documentary and all its
              chapters. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocumentary}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
