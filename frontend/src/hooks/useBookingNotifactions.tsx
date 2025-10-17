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
  date: string;
  startTime: string;
  endTime: string;
  name: string;
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

  // ⏱️ Countdown state
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300 seconds

  // Countdown effect — runs only when confirm modal is shown
  useEffect(() => {
    if (!showConfirmModal) return;

    setCountdown(300); // reset timer to 5 minutes whenever modal opens
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showConfirmModal]);

  // Format countdown as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const loadBookings = () => {
    const stored = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(stored);
    return stored;
  };

  const saveBookings = (data: Booking[]) => {
    localStorage.setItem("bookings", JSON.stringify(data));
    window.dispatchEvent(new Event("bookingsUpdated"));
  };

  useEffect(() => {
    const checkBookings = () => {
      const stored = loadBookings();
      const now = new Date();

      stored.forEach((booking: Booking) => {
        const start = new Date(`${booking.date}T${booking.startTime}:00`);
        const end = new Date(`${booking.date}T${booking.endTime}:00`);
        const diffToStart = (start.getTime() - now.getTime()) / 60000;
        const diffToEnd = (end.getTime() - now.getTime()) / 60000;

        if (diffToStart <= 10 && diffToStart > 5 && !booking.confirmed) {
          setActiveBooking(booking);
          setShowConfirmModal(true);
        }

        if (diffToStart <= 5 && !booking.confirmed) {
          const updated = stored.filter((b: Booking) => b.id !== booking.id);
          saveBookings(updated);
          setBanner({
            message: `❌ Your booking for ${booking.roomName} was auto-cancelled.`,
            type: "error",
          });
          setShowConfirmModal(false);
          setActiveBooking(null);
        }

        if (diffToEnd <= 0) {
          const updated = stored.filter((b: Booking) => b.id !== booking.id);
          saveBookings(updated);
          setBanner({
            message: `🕓 Your booking for ${booking.roomName} has ended.`,
            type: "warning",
          });
        }
      });
    };

    checkBookings();
    const interval = setInterval(checkBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const confirmBooking = () => {
    if (!activeBooking) return;

    const updated = bookings.map((b) =>
      b.id === activeBooking.id
        ? { ...b, confirmed: true, status: "confirmed" }
        : b
    );

    saveBookings(updated);
    setShowConfirmModal(false);
    setBanner({
      message: `✅ Your booking for ${activeBooking.roomName} is confirmed.`,
      type: "success",
    });
  };

  const cancelBooking = () => {
    if (!activeBooking) return;
    const updated = bookings.filter((b) => b.id !== activeBooking.id);
    saveBookings(updated);
    setShowCancelModal(false);
    setShowConfirmModal(false);
    setActiveBooking(null);
    setBanner({
      message: `❌ Booking for ${activeBooking.roomName} has been cancelled.`,
      type: "error",
    });
  };

  useEffect(() => {
    const stored = loadBookings();
    const now = new Date();

    const pending = stored.find((booking: Booking) => {
      const start = new Date(`${booking.date}T${booking.startTime}:00`);
      const diffToStart = (start.getTime() - now.getTime()) / 60000;
      return diffToStart <= 10 && diffToStart > 5 && !booking.confirmed;
    });

    if (pending) {
      setActiveBooking(pending);
      setShowConfirmModal(true);
    }
  }, []);

  const ConfirmationModal = (
    <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
      <DialogContent className="sm:max-w-md rounded-xl p-6 z-[1200]">
        <DialogHeader>
          <DialogTitle>Confirm your booking</DialogTitle>
          <DialogDescription>
            Your booking for <strong>{activeBooking?.roomName}</strong> starts
            soon.
            <br />
            Please confirm within{" "}
            <span className="font-semibold text-red-600">
              {formatTime(countdown)}
            </span>
            .
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

  const CancelConfirmModal = (
    <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
      <DialogContent className="sm:max-w-md rounded-xl p-6 z-[1200]">
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
