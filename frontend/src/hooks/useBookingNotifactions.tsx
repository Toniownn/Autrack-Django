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
import AlertBanner from "@/components/AlertBanner";

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
  createdAt?: string;
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

  const [countdown, setCountdown] = useState(900);

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

  // 🕒 Load countdown from localStorage if exists
  useEffect(() => {
    if (!activeBooking) return;
    const key = `confirmCountdownEnd_${activeBooking.id}`;
    const endTimestamp = localStorage.getItem(key);
    if (endTimestamp) {
      const remaining = Math.floor(
        (parseInt(endTimestamp) - Date.now()) / 1000
      );
      if (remaining > 0) setCountdown(remaining);
      else setCountdown(0);
    }
  }, [activeBooking]);

  // ⏱️ Countdown effect with persistence + auto cancel when reaches zero
  useEffect(() => {
    if (!showConfirmModal || !activeBooking) return;

    const key = `confirmCountdownEnd_${activeBooking.id}`;
    let endTimestamp = localStorage.getItem(key);

    if (!endTimestamp) {
      const end = Date.now() + 900 * 1000;
      localStorage.setItem(key, end.toString());
      endTimestamp = end.toString();
    }

    const interval = setInterval(() => {
      const remaining = Math.floor(
        (parseInt(endTimestamp!) - Date.now()) / 1000
      );

      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(0);

        // 🧨 Auto-cancel + hide modal once countdown reaches zero
        const stored = loadBookings();
        const updated = stored.filter(
          (b: Booking) => b.id !== activeBooking.id
        );
        saveBookings(updated);
        localStorage.removeItem(`confirmCountdownEnd_${activeBooking.id}`);
        localStorage.removeItem(`dismissedConfirm_${activeBooking.id}`);

        setShowConfirmModal(false);
        setActiveBooking(null);
        setBanner({
          message: `❌ Your booking for ${activeBooking.roomName} was automatically cancelled (no confirmation).`,
          type: "error",
        });
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showConfirmModal, activeBooking]);

  useEffect(() => {
    const checkBookings = () => {
      const stored = loadBookings();
      const now = new Date();
      let modalOpened = false;

      stored.forEach((booking: Booking) => {
        const start = new Date(`${booking.date}T${booking.startTime}:00`);
        const end = new Date(`${booking.date}T${booking.endTime}:00`);
        const diffToStart = (start.getTime() - now.getTime()) / 60000;
        const diffToEnd = (end.getTime() - now.getTime()) / 60000;

        // Auto-confirm if booked near start
        if (!booking.confirmed) {
          const createdTime = booking.createdAt
            ? new Date(booking.createdAt)
            : null;
          if (createdTime) {
            const diffCreatedToStart =
              (start.getTime() - createdTime.getTime()) / 60000;
            if (diffCreatedToStart <= 35) {
              const updated = stored.map((b: Booking) =>
                b.id === booking.id
                  ? { ...b, confirmed: true, status: "confirmed" }
                  : b
              );
              saveBookings(updated);
              setBanner({
                message: `✅ Your booking for ${booking.roomName} was automatically confirmed.`,
                type: "success",
              });
              return;
            }
          }
        }

        // Show confirm modal 30–15 mins before start, only one modal at a time
        const dismissedKey = `dismissedConfirm_${booking.id}`;
        const wasDismissed = localStorage.getItem(dismissedKey);

        if (
          diffToStart <= 30 &&
          diffToStart > 15 &&
          !booking.confirmed &&
          !modalOpened &&
          !showConfirmModal &&
          !wasDismissed
        ) {
          setActiveBooking(booking);
          setShowConfirmModal(true);
          modalOpened = true;
        }

        // Auto-cancel if within 15 mins and not confirmed
        if (diffToStart <= 15 && !booking.confirmed) {
          const updated = stored.filter((b: Booking) => b.id !== booking.id);
          saveBookings(updated);
          localStorage.removeItem(`confirmCountdownEnd_${booking.id}`);
          localStorage.removeItem(`dismissedConfirm_${booking.id}`);
          setBanner({
            message: `❌ Your booking for ${booking.roomName} was auto-cancelled.`,
            type: "error",
          });
          setShowConfirmModal(false);
          setActiveBooking(null);
        }

        // Remove booking after it ends
        if (diffToEnd <= 0) {
          const updated = stored.filter((b: Booking) => b.id !== booking.id);
          saveBookings(updated);
          localStorage.removeItem(`confirmCountdownEnd_${booking.id}`);
          localStorage.removeItem(`dismissedConfirm_${booking.id}`);
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
  }, [showConfirmModal]);

  const confirmBooking = () => {
    if (!activeBooking) return;
    const updated = bookings.map((b) =>
      b.id === activeBooking.id
        ? { ...b, confirmed: true, status: "confirmed" }
        : b
    );
    saveBookings(updated);
    localStorage.removeItem(`confirmCountdownEnd_${activeBooking.id}`);
    localStorage.removeItem(`dismissedConfirm_${activeBooking.id}`);
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
    localStorage.removeItem(`confirmCountdownEnd_${activeBooking.id}`);
    localStorage.removeItem(`dismissedConfirm_${activeBooking.id}`);
    setShowCancelModal(false);
    setShowConfirmModal(false);
    setActiveBooking(null);
    setBanner({
      message: `❌ Booking for ${activeBooking.roomName} has been cancelled.`,
      type: "error",
    });
  };

  const handleCloseConfirm = (open: boolean) => {
    if (!open && activeBooking) {
      localStorage.setItem(`dismissedConfirm_${activeBooking.id}`, "true");
    }
    setShowConfirmModal(open);
  };

  useEffect(() => {
    const stored = loadBookings();
    const now = new Date();

    const pending = stored.find((booking: Booking) => {
      const start = new Date(`${booking.date}T${booking.startTime}:00`);
      const diffToStart = (start.getTime() - now.getTime()) / 60000;
      return diffToStart <= 30 && diffToStart > 15 && !booking.confirmed;
    });

    if (pending) {
      setActiveBooking(pending);
      setShowConfirmModal(true);
    }
  }, []);

  const ConfirmationModal = (
    <Dialog open={showConfirmModal} onOpenChange={handleCloseConfirm}>
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
