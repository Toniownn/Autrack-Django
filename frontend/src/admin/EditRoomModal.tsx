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

interface Room {
  id: number;
  name: string;
  status: boolean;
  department: string;
  image: string;
  popularity: boolean;
}

interface EditRoomModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRoom: Room) => void;
  departments: string[];
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
  departments,
}) => {
  const [formData, setFormData] = useState<Room | null>(room);
  const [preview, setPreview] = useState<string | null>(room?.image || null);
  const [selectedFile, setSelectedFile] = useState<string>("");

  useEffect(() => {
    setFormData(room);
    setPreview(room?.image || null);
    setSelectedFile("");
  }, [room]);

  const handleChange = (field: keyof Room, value: any) => {
    if (formData) setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    handleChange("image", file.name);
    setSelectedFile(file.name);
  };

  const handleSave = () => {
    if (formData) {
      onSave({ ...formData, image: preview || formData.image });
    }
    onClose();
  };

  const resolveImage = (image: string): string => {
    if (!image) return "";
    if (image.startsWith("data:image")) return image;
    return getImgUrl(image);
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-4">
          {/* Room name input */}
          <div className="flex flex-col space-y-2">
            <Label>Room Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Department dropdown */}
          <div className="flex flex-col space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value: string) =>
                handleChange("department", value)
              }
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

          {/* File upload - same style as input & dropdown */}
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
              />
              <input
                id="edit-file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Paperclip className="absolute right-3 top-2.5 text-orange-500 w-4 h-4 pointer-events-none" />
            </div>

            {/* Image Preview */}
            {preview && (
              <img
                src={
                  preview.startsWith("data:image")
                    ? preview
                    : resolveImage(preview)
                }
                alt="Preview"
                className="mt-2 w-full h-40 object-cover rounded-lg border"
              />
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-400 text-white"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomModal;
