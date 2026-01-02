import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip } from "lucide-react";
import { getImgUrl } from "@/lib/getImgurl";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface Room {
  id: number;
  room_no: string;
  name: string;
  status: boolean;
  department: string;
  image: string;
}

interface EditRoomModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRoom: Room) => Promise<void>; // returns Promise
  departments: string[];
  loading?: boolean;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
  departments,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Room>(room);
  const [preview, setPreview] = useState<string>(room.image);
  const [selectedFile, setSelectedFile] = useState<string>("");

  // When modal opens, initialize data
  useEffect(() => {
    setFormData(room);
    setPreview(room.image);
    // If the image is base64 or a URL, extract filename for display
    const filename =
      room.image && room.image.includes("data:")
        ? ""
        : room.image.split("/").pop() || "";
    setSelectedFile(filename);
  }, [room]);

  const handleChange = <K extends keyof Room>(field: K, value: Room[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      handleChange("image", base64);
      setSelectedFile(file.name); // show the selected file name
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await onSave(formData); // wait until save is done
      onClose(); // close only after success
    } catch (err) {
      // Do not close modal if save fails
      console.error("Save failed", err);
    }
  };

  const resolveImage = (image: string): string => {
    if (!image) return "";
    if (image.startsWith("data:") || image.startsWith("http")) return image;
    return getImgUrl(image);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-full sm:max-w-md"
        aria-describedby="edit-room-desc"
      >
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>

        <p id="edit-room-desc" className="sr-only">
          Modal for editing room information
        </p>

        <div className="flex flex-col gap-5 mt-4">
          {/* Room No */}
          <div className="flex flex-col space-y-2">
            <Label>Room No.</Label>
            <Input
              value={formData.room_no}
              onChange={(e) => handleChange("room_no", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Room Name */}
          <div className="flex flex-col space-y-2">
            <Label>Room Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Department */}
          <div className="flex flex-col space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
              disabled={loading}
            >
              <SelectTrigger className="h-9 w-full">
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
          </div>
          {/* Status */}
          <div className="flex flex-col space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status ? "active" : "inactive"}
              onValueChange={(value) =>
                handleChange("status", value === "active")
              }
              disabled={loading}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col space-y-2">
            <Label>Room Image</Label>
            <div className="relative w-full">
              <Input
                readOnly
                value={selectedFile || ""}
                placeholder="Choose File"
                className="cursor-pointer text-muted-foreground"
                onClick={() =>
                  document.getElementById("edit-file-upload")?.click()
                }
                disabled={loading}
              />
              <input
                id="edit-file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading}
              />
              <Paperclip className="absolute right-3 top-2.5 text-orange-500 w-4 h-4 pointer-events-none" />
            </div>

            {preview && (
              <img
                src={resolveImage(preview)}
                alt="Preview"
                className="mt-2 w-full h-40 object-cover rounded-lg border"
              />
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-400 text-white"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomModal;
