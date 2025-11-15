import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // ✅ import createPortal
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar/Navbar";
import AlertBanner from "@/components/AlertBanner";
import useBookingNotifications from "./hooks/useBookingNotifactions";

const App = () => {
  const { ConfirmationModal, CancelConfirmModal, Banner } =
    useBookingNotifications();

  const [globalAlert, setGlobalAlert] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  useEffect(() => {
    const handleAlert = (e: any) => {
      setGlobalAlert(e.detail);
      setTimeout(() => setGlobalAlert(null), 13000);
    };
    window.addEventListener("globalAlert", handleAlert);
    return () => window.removeEventListener("globalAlert", handleAlert);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* ✅ Global Alert rendered via portal to appear above navbar */}
      {globalAlert &&
        createPortal(
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-[500px]">
            <AlertBanner
              message={globalAlert.message}
              type={globalAlert.type}
              onClose={() => setGlobalAlert(null)}
            />
          </div>,
          document.body
        )}

      {/* Navbar */}
      <Navbar />

      <main className="flex-1 pt-16 px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* Bottom-right notification banner */}
      <div className="fixed bottom-4 right-4 z-[1050]">{Banner}</div>

      {/* Centered modals */}
      <div className="fixed inset-0 z-[1100] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          {ConfirmationModal}
          {CancelConfirmModal}
        </div>
      </div>
    </div>
  );
};

export default App;
