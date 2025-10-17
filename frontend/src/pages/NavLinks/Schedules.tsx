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
    // initial load
    loadBookings();

    const updateInterval = setInterval(() => {
      const stored: Booking[] = JSON.parse(
        localStorage.getItem("bookings") || "[]"
      );
      const now = new Date();

      // map/transform bookings and remove those that already ended
      const transformed = (stored as Booking[])
        .map((booking) => {
          // parse start & end with seconds appended
          const start = new Date(`${booking.date}T${booking.startTime}:00`);
          const end = new Date(`${booking.date}T${booking.endTime}:00`);

          // If booking has ended, return null so we can filter it out
          if (now > end) {
            return null;
          }

          // Status rules:
          // - pending: not confirmed and within pre-confirmation window (10..5 mins)
          // - confirmed: confirmed and before start
          // - ongoing: confirmed and between start and end
          const diffToStart = (start.getTime() - now.getTime()) / 60000; // minutes to start
          if (!booking.confirmed) {
            // keep pending when not confirmed; show pending only in the intended window,
            // but keep "pending" label for any unconfirmed booking to match previous behavior
            // (you can tweak to only set when diffToStart <=10 && diffToStart >5 if desired)
            if (diffToStart <= 10 && diffToStart > 5) {
              booking.status = "pending";
            } else {
              // unconfirmed and not in the 10..5 window -> show pending (consistent with earlier)
              booking.status = "pending";
            }
          } else {
            // booking.confirmed === true
            if (now >= start && now < end) {
              booking.status = "ongoing";
            } else if (now < start) {
              booking.status = "confirmed";
            } else {
              // should have been filtered out above when now > end
              booking.status = "confirmed";
            }
          }

          return booking;
        })
        .filter(Boolean) as Booking[];

      // persist transformed bookings (removes ended bookings)
      localStorage.setItem("bookings", JSON.stringify(transformed));
      setBookings(transformed);
    }, 30000); // every 30s

    // Keep in sync if other parts update bookings
    const onUpdate = () => loadBookings();
    window.addEventListener("bookingsUpdated", onUpdate);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener("bookingsUpdated", onUpdate);
    };
  }, []);

  // Open cancel dialog
  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  // Confirm cancel action
  const confirmCancel = () => {
    if (!bookingToCancel) return;

    const updated = bookings.filter((b) => b.id !== bookingToCancel.id);
    saveBookings(updated);

    setCancelDialogOpen(false);
    setBookingToCancel(null);
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
                    <strong>Time:</strong> {booking.startTime} -{" "}
                    {booking.endTime}
                  </p>
                  <p className="text-sm">
                    <strong>Booked by:</strong> {booking.name}
                  </p>

                  {booking.status === "pending" && (
                    <p className="text-yellow-600 font-medium mt-2">
                      ⏳ Pending confirmation
                    </p>
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
              {bookingToCancel?.startTime || "?"} to{" "}
              {bookingToCancel?.endTime || "?"}
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
