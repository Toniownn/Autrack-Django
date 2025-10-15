import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import AlertBanner from "@/components/Alertbanner";

interface Booking {
  id: string;
  roomName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24-hour format)
  name?: string;
  confirmed?: boolean;
  cancelled?: boolean;
}

export default function useBookingNotifications() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: "success" | "warning" | "error";
  } | null>(null);

  // ✅ Load bookings from localStorage
  const loadBookings = () => {
    const stored = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(stored);
    return stored;
  };

  // ✅ Save bookings
  const saveBookings = (data: Booking[]) => {
    localStorage.setItem("bookings", JSON.stringify(data));
    setBookings(data);
    window.dispatchEvent(new Event("bookingsUpdated"));
  };

  // 🕓 Auto check for upcoming bookings
  useEffect(() => {
    const checkBookings = () => {
      const stored = loadBookings();
      const now = new Date();

      stored.forEach((booking: Booking) => {
        const bookingTime = new Date(`${booking.date}T${booking.time}:00`);
        const diffMinutes = (bookingTime.getTime() - now.getTime()) / 60000;

        // 🔔 Show confirmation modal 10–5 mins before schedule
        if (diffMinutes <= 10 && diffMinutes > 5 && !booking.confirmed) {
          setActiveBooking(booking);
          setShowConfirmModal(true);
        }

        // ⏰ Auto-cancel after 5 mins without confirmation
        if (diffMinutes <= 5 && !booking.confirmed) {
          const updated = stored.filter(
            (b: Booking) =>
              !(
                b.roomName === booking.roomName &&
                b.date === booking.date &&
                b.time === booking.time
              )
          );
          saveBookings(updated);

          setBanner({
            message: `❌ Your booking for ${booking.roomName} has been automatically cancelled.`,
            type: "error",
          });
          setShowConfirmModal(false);
          setActiveBooking(null);
        }
      });
    };

    checkBookings();
    const interval = setInterval(checkBookings, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  // ✅ Confirm booking manually
  const confirmBooking = () => {
    if (!activeBooking) return;

    const updated = bookings.map((b) =>
      b.roomName === activeBooking.roomName &&
      b.date === activeBooking.date &&
      b.time === activeBooking.time
        ? { ...b, confirmed: true }
        : b
    );

    saveBookings(updated);
    setShowConfirmModal(false);
    setBanner({
      message: `✅ Your booking for ${activeBooking.roomName} is confirmed.`,
      type: "success",
    });
  };

  // ✅ Cancel booking manually
  const cancelBooking = () => {
    if (!activeBooking) return;

    const updated = bookings.filter(
      (b) =>
        !(
          b.roomName === activeBooking.roomName &&
          b.date === activeBooking.date &&
          b.time === activeBooking.time
        )
    );

    saveBookings(updated);
    setShowCancelModal(false);
    setShowConfirmModal(false);
    setActiveBooking(null);

    setBanner({
      message: `❌ Booking for ${activeBooking.roomName} has been cancelled.`,
      type: "error",
    });
  };

  // ✅ Reopen modal on refresh if within 10–5 minute window
  useEffect(() => {
    const stored = loadBookings();
    const now = new Date();

    const pending = stored.find((booking: Booking) => {
      const bookingTime = new Date(`${booking.date}T${booking.time}:00`);
      const diffMinutes = (bookingTime.getTime() - now.getTime()) / 60000;
      return diffMinutes <= 10 && diffMinutes > 5 && !booking.confirmed;
    });

    if (pending) {
      setActiveBooking(pending);
      setShowConfirmModal(true);
    }
  }, []);

  // 🧾 Confirmation Modal
  const ConfirmationModal = (
    <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
      <DialogContent className="sm:max-w-md rounded-xl p-6 z-[1200] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Confirm your booking</DialogTitle>
          <DialogDescription>
            Your booking for <strong>{activeBooking?.roomName}</strong> will
            start soon.
            <br />
            Please confirm within 5 minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 flex justify-end gap-2">
          <Button
            onClick={() => setShowConfirmModal(false)}
            className="bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white font-semibold"
          >
            Later
          </Button>
          <Button onClick={confirmBooking} className="bg-green-600 text-white">
            Confirm
          </Button>
          <Button
            onClick={() => setShowCancelModal(true)}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // 🧾 Cancel Confirmation Modal
  const CancelConfirmModal = (
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="sm:max-w-md rounded-xl p-6 z-[1200] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-destructive font-semibold">
            Confirm Cancellation
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to cancel your booking for{" "}
          <strong>{activeBooking?.roomName}</strong>? This cannot be undone.
        </DialogDescription>
        <DialogFooter className="mt-5 flex justify-end gap-2">
          <Button
            onClick={() => setShowCancelModal(false)}
            className="bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white font-semibold"
          >
            No, Keep It
          </Button>
          <Button
            variant="destructive"
            onClick={cancelBooking}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold"
          >
            Yes, Cancel It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ✅ Live Banner component
  const BannerComponent = banner ? (
    <AlertBanner
      message={banner.message}
      type={banner.type}
      onClose={() => setBanner(null)}
    />
  ) : null;

  return {
    ConfirmationModal,
    CancelConfirmModal,
    Banner: BannerComponent,
  };
}
