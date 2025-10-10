import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AlertBanner from "@/components/Alertbanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Booking {
  room: string;
  department: string;
  date: string;
  time: string;
  name: string;
}

const Schedules: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  // For confirmation modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Load existing bookings
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(stored);
  }, []);

  // Auto-hide alert
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleOpenConfirm = (index: number) => {
    setSelectedIndex(index);
    setIsConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedIndex === null) return;

    const updatedBookings = bookings.filter((_, i) => i !== selectedIndex);
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));

    setAlertType("error");
    setAlertMessage("❌ Booking cancelled successfully.");
    setIsConfirmOpen(false);
  };

  return (
    <section className="py-10">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Bookings</h1>

        {/* 🔹 Alert Banner */}
        {alertMessage && (
          <div
            className={`transition-all duration-500 transform mb-4 ${
              alertMessage
                ? "translate-y-0 opacity-100"
                : "-translate-y-5 opacity-0"
            }`}
          >
            <AlertBanner
              message={alertMessage}
              type={alertType}
              onClose={() => setAlertMessage(null)}
            />
          </div>
        )}

        {bookings.length === 0 ? (
          <p className="text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => (
              <Card
                key={index}
                className="p-4 border shadow-sm w-full transition-transform duration-200 hover:scale-[1.02]"
              >
                <CardContent className="space-y-2 p-0">
                  <h2 className="font-semibold text-lg">{booking.room}</h2>
                  <p className="text-sm text-muted-foreground">
                    Department: {booking.department}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {booking.date}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {booking.time}
                  </p>
                  <p className="text-sm">
                    <strong>Booked by:</strong> {booking.name}
                  </p>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => handleOpenConfirm(index)}
                  >
                    Cancel Booking
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-sm rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Confirm Cancellation
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </p>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              No, Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Schedules;
