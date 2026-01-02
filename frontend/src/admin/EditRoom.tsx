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

// ✅ Room interface
interface Room {
  id: number;
  room_no: string;
  name: string;
  status: boolean;
  department: string;
  image: string;
}

const EditRoom: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    room_no: "",
    name: "",
    department: "",
    image: "",
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
  const [departments, setDepartments] = useState<string[]>([
    "COT Department",
    "CEAS Department",
    "COE Department",
    "COTBM Department",
  ]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  /* =========================
     HELPERS
  ========================= */
  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const mapRooms = (raw: any[]): Room[] =>
    raw.map((r) => ({
      id: r.id,
      room_no: r.room_no,
      name: r.name,
      department: r.department,
      image: r.image,
      status: r.is_active === 1 || r.status === true,
    }));

  const fetchRooms = async () => {
    try {
      setLoading(true);

      // Fetch rooms
      const roomsRes = await fetch("http://localhost:8000/api/rooms/all/");
      const roomsText = await roomsRes.text();

      let rawRoomsObj: any;
      try {
        rawRoomsObj = JSON.parse(roomsText);
      } catch (err) {
        console.error("Rooms response is not valid JSON:", roomsText);
        throw new Error("Failed to fetch rooms: invalid server response");
      }

      const rawRooms = rawRoomsObj.rooms || [];
      const mappedRooms = mapRooms(rawRooms);

      // Only set rooms, keep the departments fixed
      setRooms(mappedRooms);
    } catch (err) {
      console.error("Fetch error:", err);
      showAlert("Failed to load data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  /* =========================
     CREATE ROOM
  ========================= */
  const addRoom = async () => {
    if (!newRoom.room_no || !newRoom.name || !newRoom.department) {
      showAlert("Please fill in all required fields.", "warning");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        room_no: newRoom.room_no,
        name: newRoom.name,
        department: newRoom.department,
        image: newRoom.image || "",
        status: newRoom.status,
      };

      const res = await fetch("http://localhost:8000/api/rooms/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create room");
      }

      await fetchRooms(); // refresh rooms
      setNewRoom({
        room_no: "",
        name: "",
        department: "",
        image: "",
        status: true,
      });
      setPreview(null);
      setSelectedFile("");
      showAlert("Room added successfully!", "success");
    } catch (err) {
      console.error("Add room error:", err);
      showAlert(`Failed to add room: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EDIT ROOM
  ========================= */
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (updatedRoom: Room) => {
    try {
      setLoading(true);
      const payload = {
        room_no: updatedRoom.room_no,
        name: updatedRoom.name,
        department: updatedRoom.department,
        image: updatedRoom.image || "",
        status: updatedRoom.status,
      };

      const res = await fetch(
        `http://localhost:8000/api/rooms/${updatedRoom.id}/update/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update room");
      }

      await fetchRooms(); // refresh rooms
      setIsModalOpen(false);
      setEditingRoom(null);
      showAlert("Room updated successfully!", "success");
    } catch (err) {
      console.error("Update error:", err);
      showAlert(`Failed to update room: ${(err as Error).message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE ROOM
  ========================= */
  const confirmDelete = (room: Room) => {
    setRoomToDelete(room);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!roomToDelete) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8000/api/rooms/${roomToDelete.id}/delete/`, // <-- updated URL
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete room");
      }

      await fetchRooms(); // refresh rooms
      setIsConfirmOpen(false);
      showAlert("Room deleted successfully!", "success"); // changed message
    } catch (err) {
      console.error("Delete error:", err);
      showAlert(`Failed to delete room: ${(err as Error).message}`, "error");
      setIsConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     IMAGE HANDLING
  ========================= */
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
    return image.startsWith("data:image") ? image : getImgUrl(image);
  };

  /* =========================
     RENDER
  ========================= */
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
              placeholder="Room No."
              value={newRoom.room_no || ""}
              onChange={(e) =>
                setNewRoom({ ...newRoom, room_no: e.target.value })
              }
              className="min-w-[70px] sm:w-24"
              disabled={loading}
            />
            <Input
              placeholder="Room Name"
              value={newRoom.name || ""}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              className="flex-1 min-w-[150px] sm:w-60"
              disabled={loading}
            />

            <Select
              value={newRoom.department || ""}
              onValueChange={(value: string) =>
                setNewRoom({ ...newRoom, department: value })
              }
              disabled={loading}
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
            <Select
              value={newRoom.status ? "active" : "inactive"}
              onValueChange={(value: string) =>
                setNewRoom({ ...newRoom, status: value === "active" })
              }
              disabled={loading}
            >
              <SelectTrigger className="h-9 flex-1 min-w-[120px] sm:w-36">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[150px] sm:w-60">
              <Input
                readOnly
                value={selectedFile || ""}
                placeholder="Choose File"
                className="cursor-pointer text-muted-foreground"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={loading}
              />
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
              <Paperclip className="absolute right-3 top-2.5 text-orange-500 w-4 h-4 pointer-events-none" />
            </div>

            <Button
              onClick={addRoom}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-400 text-white flex items-center gap-2 flex-none"
            >
              {loading ? "Loading..." : "Add Room"}
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
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading rooms...
              </div>
            ) : (
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px] text-center">
                      Room No.
                    </TableHead>
                    <TableHead className="text-center">Image</TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Department</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium text-muted-foreground text-center">
                          {room.room_no}
                        </TableCell>
                        <TableCell className="flex justify-center items-center py-2">
                          <img
                            src={resolveImage(room.image)}
                            alt={room.name}
                            className="w-20 h-14 object-cover rounded-md border"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {room.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {room.department}
                        </TableCell>
                        <TableCell className="text-center">
                          {room.status ? (
                            <span className="text-green-600 font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">
                              Inactive
                            </span>
                          )}
                        </TableCell>
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
                        No active rooms found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
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
              {roomToDelete?.name} ({roomToDelete?.room_no})
            </span>
            ? This will delete it from database.
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirmed}
              disabled={loading}
              className="bg-red-500 hover:bg-red-400 text-white"
            >
              {loading ? "Delating..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRoom(null);
          }}
          onSave={handleSaveRoom}
          departments={departments}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditRoom;
