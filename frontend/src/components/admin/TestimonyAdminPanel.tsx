import { useState } from "react";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTestimonies, type Testimony } from "@/hooks/useTestimonies";
import { useTestimonyAdmin } from "@/hooks/useTestimonyAdmin";
import { TestimonyAdminCard } from "./TestimonyAdminCard";
import { TestimonyForm } from "./TestimonyForm";
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

export function TestimonyAdminPanel() {
  const { toast } = useToast();
  const { data: testimonies = [], isLoading } = useTestimonies();
  const { createTestimony, updateTestimony, deleteTestimony } =
    useTestimonyAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredTestimonies = testimonies.filter((t) => {
    const matchesSearch =
      t.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddTestimony = () => {
    setEditingTestimony(null);
    setFormOpen(true);
  };

  const handleEditTestimony = (testimony: Testimony) => {
    setEditingTestimony(testimony);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingTestimony) {
        await updateTestimony.mutateAsync({
          id: editingTestimony.id,
          ...values,
        });
        toast({ title: "Testimony updated successfully" });
      } else {
        await createTestimony.mutateAsync(values);
        toast({ title: "Testimony added successfully" });
      }
      setFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving testimony",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (testimony: Testimony) => {
    try {
      await updateTestimony.mutateAsync({
        id: testimony.id,
        is_featured: !testimony.is_featured,
      });
      toast({
        title: testimony.is_featured
          ? "Removed from featured"
          : "Added to featured",
      });
    } catch (error: any) {
      toast({
        title: "Error updating testimony",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTestimony = async () => {
    if (!deleteId) return;
    try {
      await deleteTestimony.mutateAsync(deleteId);
      toast({ title: "Testimony deleted" });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Error deleting testimony",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Survivor Testimonies</h2>
          <p className="text-sm text-muted-foreground">
            Manage survivor narratives and testimonies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open("/testimonies", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Hub
          </Button>
          <Button onClick={handleAddTestimony}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimony
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="survivor">Survivor</SelectItem>
            <SelectItem value="rescuer">Rescuer</SelectItem>
            <SelectItem value="witness">Witness</SelectItem>
            <SelectItem value="reconciliation">Reconciliation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading testimonies...</p>
      ) : filteredTestimonies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>
            {testimonies.length === 0
              ? "No testimonies yet. Add your first testimony to get started."
              : "No testimonies match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTestimonies.map((testimony) => (
            <TestimonyAdminCard
              key={testimony.id}
              testimony={testimony}
              onEdit={handleEditTestimony}
              onDelete={(id) => setDeleteId(id)}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}

      <TestimonyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        testimony={editingTestimony}
        onSubmit={handleFormSubmit}
        isLoading={createTestimony.isPending || updateTestimony.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimony?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this testimony. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTestimony}
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
