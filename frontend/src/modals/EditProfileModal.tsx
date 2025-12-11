import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { createPortal } from "react-dom";

interface EditProfileModalProps {
  onClose: () => void;
  user: any;
  openPassword?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  onClose,
  user,
}) => {
  // ✅ Safe: this component only renders when open = true
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [middleName, setMiddleName] = useState(user?.middle_name || "");

  useEffect(() => {
    // Optional: Refetch fresh data when modal opens (since parent already has user)
    fetch("http://localhost:8000/api/get-profile/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setMiddleName(data.middle_name || "");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch profile", err);
        alert("Could not load profile.");
      });
  }, []); // ← Only on mount

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/edit-profile/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        onClose();
      } else if (res.status === 401) {
        alert("You are not logged in. Please login again.");
        onClose();
      } else {
        alert(JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

        <div className="mb-3">
          <label className="text-sm">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm">Last Name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="text-sm">Middle Name</label>
          <Input
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;
