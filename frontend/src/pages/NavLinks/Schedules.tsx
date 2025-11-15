import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  roomName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  confirmed?: boolean;
  status?: "pending" | "confirmed" | "ongoing";
}

interface Room {
  id: number;
  name: string;
  status: boolean;
  department: string;
  image: string;
  popularity: boolean;
}

const Schedules = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const loadBookings = (): Booking[] => {
    const stored = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(stored);
    return stored;
  };

  const saveBookings = (data: Booking[]) => {
    localStorage.setItem("bookings", JSON.stringify(data));
    setBookings(data);
    window.dispatchEvent(new Event("bookingsUpdated"));
  };

  useEffect(() => {
    loadBookings();

    const updateInterval = setInterval(() => {
      const stored: Booking[] = JSON.parse(
        localStorage.getItem("bookings") || "[]"
      );
      const now = new Date();

      const transformed = stored
        .map((booking) => {
          const start = new Date(`${booking.date}T${booking.startTime}:00`);
          const end = new Date(`${booking.date}T${booking.endTime}:00`);

          if (now > end) return null;

          const diffToStart = (start.getTime() - now.getTime()) / 60000;
          if (!booking.confirmed) {
            booking.status = diffToStart <= 35 ? "pending" : "pending";
          } else {
            if (now >= start && now < end) {
              booking.status = "ongoing";
            } else if (now < start) {
              booking.status = "confirmed";
            } else {
              return null;
            }
          }

          return booking;
        })
        .filter(Boolean) as Booking[];

      localStorage.setItem("bookings", JSON.stringify(transformed));
      setBookings(transformed);
    }, 30000);

    const onUpdate = () => loadBookings();
    window.addEventListener("bookingsUpdated", onUpdate);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener("bookingsUpdated", onUpdate);
    };
  }, []);

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!bookingToCancel) return;

    const updatedBookings = bookings.filter((b) => b.id !== bookingToCancel.id);
    saveBookings(updatedBookings);

    // 🟢 Restore room availability
    const storedRooms = JSON.parse(
      localStorage.getItem("classrooms") || "null"
    );
    if (storedRooms) {
      const updated = storedRooms.map((r: Room) =>
        r.name === bookingToCancel.roomName ? { ...r, status: true } : r
      );
      localStorage.setItem("classrooms", JSON.stringify(updated));
    }

    setCancelDialogOpen(false);
    setBookingToCancel(null);
    window.dispatchEvent(new Event("roomsUpdated"));
  };

  // ✅ Helper to format 24-hour time into 12-hour AM/PM
  const formatTime12Hour = (timeStr: string) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ✅ Compute notification time (30 minutes before start) - short format
  const getNotificationTime = (date: string, startTime: string) => {
    const start = new Date(`${date}T${startTime}:00`);
    const notify = new Date(start.getTime() - 30 * 60000);
    const formattedDate = notify.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = notify.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-4 border shadow-sm bg-card">
                <CardContent className="space-y-2">
                  <h2 className="font-semibold text-lg">{booking.roomName}</h2>
                  <p className="text-sm text-muted-foreground">
                    Department: {booking.department}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {booking.date}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {formatTime12Hour(booking.startTime)}{" "}
                    - {formatTime12Hour(booking.endTime)}
                  </p>
                  <p className="text-sm">
                    <strong>Booked by:</strong> {booking.name}
                  </p>

                  {booking.status === "pending" && (
                    <>
                      <p className="text-yellow-600 font-medium mt-2">
                        ⏳ Pending confirmation
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        🕒 You’ll be notified on{" "}
                        {getNotificationTime(booking.date, booking.startTime)}{" "}
                        to confirm your booking.
                      </p>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <p className="text-green-600 font-medium mt-2">
                      ✅ Confirmed
                    </p>
                  )}
                  {booking.status === "ongoing" && (
                    <p className="text-blue-600 font-medium mt-2">🟢 Ongoing</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelClick(booking)}
                      className="bg-red-600 hover:bg-red-500 text-white font-semibold"
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-destructive">
              Confirm Cancellation
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel your booking for{" "}
            <strong>{bookingToCancel?.roomName || "this room"}</strong> on{" "}
            <strong>
              {bookingToCancel?.date || "unknown date"} from{" "}
              {bookingToCancel
                ? formatTime12Hour(bookingToCancel.startTime)
                : "?"}{" "}
              to{" "}
              {bookingToCancel
                ? formatTime12Hour(bookingToCancel.endTime)
                : "?"}
            </strong>
            ? <br />
            This action cannot be undone.
          </p>

          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button
              onClick={() => setCancelDialogOpen(false)}
              className="bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white font-semibold"
            >
              No, Keep It
            </Button>

            <Button
              variant="destructive"
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold"
            >
              Yes, Cancel It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Schedules;
