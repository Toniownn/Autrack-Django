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
import type { Room } from "@/components/RoomCard";
import AlertBanner from "@/components/Alertbanner";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  room: Room;
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, room }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error">("success");

  // Hide alert automatically after 2 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Prevent booking in the past
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  const handleConfirm = () => {
    if (!name || !date || !time) {
      setType("error");
      setMessage("⚠️ Please fill in all fields before booking.");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      setType("error");
      setMessage("⚠️ You cannot book for a past date or time.");
      return;
    }

    const newBooking = {
      name,
      date,
      time,
      room: room.name,
      department: room.department,
    };

    const existing = JSON.parse(localStorage.getItem("bookings") || "[]");
    localStorage.setItem("bookings", JSON.stringify([...existing, newBooking]));

    setType("success");
    setMessage(`✅ ${room.name} booked successfully for ${date} at ${time}.`);

    setTimeout(() => {
      onClose();
      setMessage(null);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Book {room.name}
          </DialogTitle>
        </DialogHeader>

        {/* Alert Banner */}
        {message && (
          <div
            className={`transition-all duration-500 transform ${
              message ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
            }`}
          >
            <AlertBanner
              message={message}
              type={type}
              onClose={() => setMessage(null)}
            />
          </div>
        )}

        {/* Form Fields */}
        <div className="flex flex-col gap-3 mt-3">
          {/* Name Field */}
          <div>
            <label className="text-sm font-medium mb-1 block">Your Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="h-9 text-sm"
            />
          </div>

          {/* Date & Time Fields */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-sm"
                min={today} // Prevent selecting past dates
              />
            </div>
            <div className="w-1/2">
              <label className="text-sm font-medium mb-1 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 text-sm"
                disabled={!date} // Disable time until a date is chosen 
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
