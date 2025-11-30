import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paperclip, Pencil, Trash2 } from "lucide-react";
import EditRoomModal from "./EditRoomModal";
import { getImgUrl } from "@/lib/getImgurl";
import AlertBanner from "@/components/AlertBanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Room {
  id: number;
  name: string;
  status: boolean;
  department: string;
  image: string;
  popularity: boolean;
}

const EditRoom: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: "",
    department: "",
    image: "",
    popularity: false,
    status: true,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type?: "success" | "error" | "warning";
  } | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  // Delete confirmation modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Load rooms from localStorage or classrooms.json
  useEffect(() => {
    const savedRooms = localStorage.getItem("classrooms");
    if (savedRooms) {
      try {
        const parsedRooms = JSON.parse(savedRooms) as Room[];
        setRooms(parsedRooms);

        // ensure typed as string[]
        const uniqueDepts: string[] = Array.from(
          new Set(parsedRooms.map((r: Room) => r.department))
        );
        setDepartments(uniqueDepts);
      } catch (err) {
        console.error("Failed to parse saved classrooms:", err);
        // fallback to fetch file
        fetch("/classrooms.json")
          .then((res) => res.json())
          .then((data: Room[]) => {
            setRooms(data);
            const uniqueDepts: string[] = Array.from(
              new Set(data.map((r) => r.department))
            );
            setDepartments(uniqueDepts);
            localStorage.setItem("classrooms", JSON.stringify(data));
          })
          .catch((err) => {
            console.error("Failed to load classrooms.json:", err);
            showAlert("Failed to load classrooms.json", "error");
          });
      }
    } else {
      fetch("/classrooms.json")
        .then((res) => res.json())
        .then((data: Room[]) => {
          setRooms(data);
          const uniqueDepts: string[] = Array.from(
            new Set(data.map((r) => r.department))
          );
          setDepartments(uniqueDepts);
          localStorage.setItem("classrooms", JSON.stringify(data));
        })
        .catch((err) => {
          console.error("Failed to load classrooms.json:", err);
          showAlert("Failed to load classrooms.json", "error");
        });
    }
  }, []);

  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  // Add Room
  const addRoom = () => {
    if (!newRoom.name || !newRoom.department) {
      showAlert("Please fill in all required fields.", "warning");
      return;
    }

    // Generate a unique 4-digit ID
    let newId: number;
    do {
      newId = Math.floor(1000 + Math.random() * 9000);
    } while (rooms.some((room) => room.id === newId));

    const updated = [...rooms, { ...newRoom, id: newId, status: true } as Room];
    setRooms(updated);

    // Save to localStorage and trigger update
    localStorage.setItem("classrooms", JSON.stringify(updated));
    window.dispatchEvent(new Event("roomsUpdated"));

    setNewRoom({
      name: "",
      department: "",
      image: "",
      popularity: false,
      status: true,
    });
    setPreview(null);
    setSelectedFile("");
    showAlert("Room added successfully!");
  };

  const confirmDelete = (room: Room) => {
    setRoomToDelete(room);
    setIsConfirmOpen(true);
  };

  // Delete Room
  const handleDeleteConfirmed = () => {
    if (!roomToDelete) return;
    showAlert("Deleting room...", "warning");
    setIsConfirmOpen(false);

    setTimeout(() => {
      const updated = rooms.filter((r) => r.id !== roomToDelete.id);
      setRooms(updated);

      // Save changes to localStorage and trigger refresh
      localStorage.setItem("classrooms", JSON.stringify(updated));
      window.dispatchEvent(new Event("roomsUpdated"));

      showAlert("Room deleted successfully!", "success");
    }, 1500);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  // Edit Room
  const handleSaveRoom = (updatedRoom: Room) => {
    // Ensure 4-digit unique ID
    let fixedId = updatedRoom.id;
    if (
      fixedId < 1000 ||
      fixedId > 9999 ||
      rooms.some((r) => r.id === fixedId && r.id !== updatedRoom.id)
    ) {
      do {
        fixedId = Math.floor(1000 + Math.random() * 9000);
      } while (rooms.some((r) => r.id === fixedId));
    }

    const updated = rooms.map((r) =>
      r.id === updatedRoom.id ? { ...updatedRoom, id: fixedId } : r
    );

    setRooms(updated);

    // Save changes to localStorage and trigger Rooms.tsx refresh
    localStorage.setItem("classrooms", JSON.stringify(updated));
    window.dispatchEvent(new Event("roomsUpdated"));

    showAlert("Room updated successfully!", "success");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setNewRoom({ ...newRoom, image: base64 });
    };
    reader.readAsDataURL(file);
    setSelectedFile(file.name);
  };

  const resolveImage = (image: string): string => {
    if (!image) return "";
    if (image.startsWith("data:image")) return image;
    return getImgUrl(image);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-4 rounded-xl">
      {alert &&
        createPortal(
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1200] w-[90%] sm:w-[400px]">
            <AlertBanner
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(null)}
              hideCloseButton
            />
          </div>,
          document.body
        )}

      <Card className="shadow-sm border border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-2xl font-semibold">Edit Rooms</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Add Room Section */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-center">
            <Input
              placeholder="Room name"
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              className="flex-1 min-w-[150px] sm:w-60"
            />

            <Select
              value={newRoom.department || ""}
              onValueChange={(value: string) =>
                setNewRoom({ ...newRoom, department: value })
              }
            >
              <SelectTrigger className="h-9 flex-1 min-w-[150px] sm:w-60">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[150px] sm:w-60">
              <Input
                readOnly
                value={selectedFile || ""}
                placeholder="Choose File"
                className="cursor-pointer text-muted-foreground"
                onClick={() => document.getElementById("file-upload")?.click()}
              />
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Paperclip className="absolute right-3 top-2.5 text-orange-500 w-4 h-4 pointer-events-none" />
            </div>

            <Button
              onClick={addRoom}
              className="bg-orange-500 hover:bg-orange-400 text-white flex items-center gap-2 flex-none"
            >
              Add Room
            </Button>
          </div>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mb-4 w-full h-40 object-cover rounded-lg border"
            />
          )}

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {room.id}
                      </TableCell>
                      <TableCell>
                        <img
                          src={resolveImage(room.image)}
                          alt={room.name}
                          className="w-20 h-14 object-cover rounded-md border"
                        />
                      </TableCell>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>{room.department}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(room)}
                            className="border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => confirmDelete(room)}
                            className="bg-red-500 hover:bg-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      No rooms found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {roomToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirmed}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRoom}
          departments={departments}
        />
      )}
    </div>
  );
};

export default EditRoom;
