import { useState } from "react";
import { Plus, Building2, GripVertical, Trash2, Pencil, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  useMuseumRooms,
  useRoomMutations,
  MuseumRoom,
} from "@/hooks/useMuseumAdmin";
import { MuseumPanelsTab } from "./MuseumPanelsTab";
import { BulkExhibitionImporter } from "./BulkExhibitionImporter";

interface MuseumRoomsTabProps {
  museumId: string;
}

export function MuseumRoomsTab({ museumId }: MuseumRoomsTabProps) {
  const { data: rooms = [], isLoading, refetch } = useMuseumRooms(museumId);
  const { createRoom, updateRoom, deleteRoom } = useRoomMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MuseumRoom | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<MuseumRoom | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    room_type: "indoor" as "indoor" | "audio_tour" | "timeline",
    introduction: "",
  });

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormData({
      name: "",
      room_type: "indoor",
      introduction: "",
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (room: MuseumRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      room_type: room.room_type,
      introduction: room.introduction || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editingRoom) {
      await updateRoom.mutateAsync({
        id: editingRoom.id,
        ...formData,
      });
    } else {
      const newOrder = rooms.length + 1;
      await createRoom.mutateAsync({
        museum_id: museumId,
        room_order: newOrder,
        ...formData,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async (room: MuseumRoom) => {
    await deleteRoom.mutateAsync({ id: room.id, museumId });
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // If a room is selected, show panels for that room
  if (selectedRoom) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedRoom(null)}>
          ← Back to Rooms
        </Button>
        <MuseumPanelsTab room={selectedRoom} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Indoor Exhibitions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage exhibition rooms and their panels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BulkExhibitionImporter
              museumId={museumId}
              rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
              onImportComplete={() => refetch()}
            />
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No rooms yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add exhibition rooms to organize your panels
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-5 w-5 cursor-grab" />
                    <span className="text-sm font-medium w-6">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{room.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {room.room_type.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(room);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Room</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{room.name}"? All panels
                            in this room will also be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(room)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingRoom ? "Edit Room" : "Add Room"}</SheetTitle>
            <SheetDescription>
              {editingRoom ? "Update the room details" : "Create a new exhibition room"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Room 1 — Before 1994"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Room Type</Label>
              <Select
                value={formData.room_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, room_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor Exhibition</SelectItem>
                  <SelectItem value="audio_tour">Audio Tour</SelectItem>
                  <SelectItem value="timeline">Timeline Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="introduction">Room Introduction</Label>
              <Textarea
                id="introduction"
                value={formData.introduction}
                onChange={(e) =>
                  setFormData({ ...formData, introduction: e.target.value })
                }
                placeholder="Brief introduction shown when entering the room..."
                rows={4}
              />
            </div>
            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!formData.name.trim() || createRoom.isPending || updateRoom.isPending}
              >
                {createRoom.isPending || updateRoom.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingRoom ? (
                  "Update Room"
                ) : (
                  "Create Room"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
