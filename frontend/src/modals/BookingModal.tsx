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
import { useNavigate } from "react-router-dom";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  room: Room;
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, room }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<
    { startTime: string; endTime: string }[]
  >([]);
  const [proceedModalOpen, setProceedModalOpen] = useState(false);

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  // 🗓️ Load existing bookings for selected date or today
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookings") || "[]");
    const targetDate = date || today;
    const filtered = stored.filter(
      (b: any) => b.roomName === room.name && b.date === targetDate
    );
    setBookedSlots(
      filtered.map((b: any) => ({ startTime: b.startTime, endTime: b.endTime }))
    );
  }, [date, room.name, open]);

  const handleConfirm = () => {
    const effectiveDate = date || today; // ✅ use fallback date for validation

    if (!name || !effectiveDate || !startTime || !endTime) {
      window.dispatchEvent(
        new CustomEvent("globalAlert", {
          detail: {
            type: "error",
            message: "⚠️ Please fill in all fields before booking.",
          },
        })
      );
      return;
    }

    const start = new Date(`${effectiveDate}T${startTime}`);
    const end = new Date(`${effectiveDate}T${endTime}`);
    const now = new Date();

    if (start < now) {
      window.dispatchEvent(
        new CustomEvent("globalAlert", {
          detail: {
            type: "error",
            message: "⏰ You cannot book a past date or time.",
          },
        })
      );
      return;
    }

    if (end <= start) {
      window.dispatchEvent(
        new CustomEvent("globalAlert", {
          detail: {
            type: "error",
            message: "🚫 End time must be after start time.",
          },
        })
      );
      return;
    }

    const existing = JSON.parse(localStorage.getItem("bookings") || "[]");
    const hasOverlap = existing.some((b: any) => {
      if (b.roomName !== room.name || b.date !== effectiveDate) return false;
      return (
        (startTime >= b.startTime && startTime < b.endTime) ||
        (endTime > b.startTime && endTime <= b.endTime) ||
        (startTime <= b.startTime && endTime >= b.endTime)
      );
    });

    if (hasOverlap) {
      window.dispatchEvent(
        new CustomEvent("globalAlert", {
          detail: {
            type: "error",
            message: "🚫 This room is already booked for the selected time.",
          },
        })
      );
      return;
    }

    const diffToStart = (start.getTime() - now.getTime()) / 60000;
    const autoConfirm = diffToStart <= 35;

    const newBooking = {
      id: `${room.id}-${Date.now()}`,
      roomName: room.name,
      department: room.department,
      date: effectiveDate,
      startTime,
      endTime,
      name,
      confirmed: autoConfirm,
      status: autoConfirm ? "confirmed" : "pending",
    };

    localStorage.setItem("bookings", JSON.stringify([...existing, newBooking]));

    const storedRooms = JSON.parse(
      localStorage.getItem("classrooms") || "null"
    );
    if (storedRooms) {
      const updated = storedRooms.map((r: Room) =>
        r.id === room.id ? { ...r, status: false } : r
      );
      localStorage.setItem("classrooms", JSON.stringify(updated));
    }

    window.dispatchEvent(
      new CustomEvent("globalAlert", {
        detail: {
          type: "success",
          message: autoConfirm
            ? `✅ Room ${room.name} booked and automatically confirmed (starts soon).`
            : `✅ You have successfully booked room ${room.name}.`,
        },
      })
    );

    setTimeout(() => {
      onClose();
      setProceedModalOpen(true);
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("roomsUpdated"));
    }, 1000);
  };

  const handleProceedYes = () => {
    setProceedModalOpen(false);
    navigate("/schedules");
  };

  const handleProceedNo = () => {
    setProceedModalOpen(false);
  };

  return (
    <>
      {/* 🧾 Booking Modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Book {room.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Your Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input
                type="date"
                min={today}
                value={date || today}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={startTime}
                  min={date === today ? currentTime : undefined}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  End Time
                </label>
                <Input
                  type="time"
                  value={endTime}
                  min={
                    startTime || date === today
                      ? startTime || currentTime
                      : currentTime
                  }
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 📅 Booked Slots Display */}
          {bookedSlots.length > 0 && (
            <div className="border rounded-md bg-gradient-to-r from-yellow-600 to-yellow-400 text-white text-sm p-2">
              <p className="font-medium text mb-1">Already booked:</p>
              <ul className="list-disc list-inside">
                {bookedSlots.map((slot, index) => {
                  const formatTime = (timeStr: string) => {
                    const [hour, minute] = timeStr.split(":");
                    const d = new Date();
                    d.setHours(parseInt(hour), parseInt(minute));
                    return d.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  };

                  return (
                    <li key={index}>
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🚀 Proceed Modal */}
      <Dialog open={proceedModalOpen} onOpenChange={setProceedModalOpen}>
        <DialogContent className="sm:max-w-sm rounded-lg p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Proceed to your bookings?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Do you want to view your bookings now?
          </p>
          <DialogFooter className="mt-6 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleProceedNo}
              className="px-5"
            >
              No
            </Button>
            <Button
              onClick={handleProceedYes}
              className="bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white px-5"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingModal;
