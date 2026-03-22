import { useState } from "react";
import { Plus, Pencil, Trash2, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { useContentCMS, Person, generateSlug } from "@/hooks/useContentCMS";
import { MediaUpload } from "@/components/admin/routes/MediaUpload";

const roles = [
  { value: "survivor", label: "Survivor" },
  { value: "witness", label: "Witness" },
  { value: "rescuer", label: "Rescuer" },
  { value: "historical_figure", label: "Historical Figure" },
  { value: "educator", label: "Educator" },
  { value: "other", label: "Other" },
];

export function PeopleManager() {
  const { toast } = useToast();
  const cms = useContentCMS();
  const { data: people = [], isLoading } = cms.usePeople();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    biography: "",
    photo_url: "",
    role: "",
    birth_year: "",
    death_year: "",
  });

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      biography: "",
      photo_url: "",
      role: "",
      birth_year: "",
      death_year: "",
    });
    setEditingPerson(null);
    setIsCreating(false);
  };

  const handleEdit = (person: Person) => {
    setFormData({
      name: person.name,
      biography: person.biography || "",
      photo_url: person.photo_url || "",
      role: person.role || "",
      birth_year: person.birth_year?.toString() || "",
      death_year: person.death_year?.toString() || "",
    });
    setEditingPerson(person);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        biography: formData.biography || undefined,
        photo_url: formData.photo_url || undefined,
        role: formData.role || undefined,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : undefined,
        death_year: formData.death_year ? parseInt(formData.death_year) : undefined,
      };

      if (editingPerson) {
        await cms.updatePerson.mutateAsync({ id: editingPerson.id, ...payload });
        toast({ title: "Person updated" });
      } else {
        await cms.createPerson.mutateAsync({
          ...payload,
          slug: generateSlug(formData.name),
          is_public: true,
        });
        toast({ title: "Person created" });
      }
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cms.deletePerson.mutateAsync(deleteId);
      toast({ title: "Person deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage People</h1>
          <p className="text-muted-foreground">
            Speakers, survivors, witnesses, and historical figures
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredPeople.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No people found.</p>
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Add your first person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={person.photo_url || undefined} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {person.role && (
                        <span className="capitalize">{person.role.replace("_", " ")}</span>
                      )}
                      {person.birth_year && (
                        <span className="ml-2">
                          ({person.birth_year}
                          {person.death_year && ` - ${person.death_year}`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(person)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteId(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingPerson} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPerson ? "Edit Person" : "Add Person"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              <MediaUpload
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url || "" })}
                mediaType="image"
                folder="people"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Birth Year</Label>
                <Input
                  type="number"
                  value={formData.birth_year}
                  onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                  placeholder="1950"
                />
              </div>
              <div className="space-y-2">
                <Label>Death Year</Label>
                <Input
                  type="number"
                  value={formData.death_year}
                  onChange={(e) => setFormData({ ...formData, death_year: e.target.value })}
                  placeholder="Leave empty if alive"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Biography</Label>
              <Textarea
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                placeholder="Brief biography..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPerson ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete person?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the person from the system. Content referencing this person
              will lose this link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
