import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar/Navbar";
import AlertBanner from "@/components/Alertbanner";
import useBookingNotifications from "./hooks/useBookingNotifactions";

const App = () => {
  const { ConfirmationModal, CancelConfirmModal, Banner } =
    useBookingNotifications();

  const [globalAlert, setGlobalAlert] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  // 👂 Listen for alert events from anywhere
  useEffect(() => {
    const handleAlert = (e: any) => {
      setGlobalAlert(e.detail);
      // auto-clear after 13 seconds
      setTimeout(() => setGlobalAlert(null), 13000);
    };
    window.addEventListener("globalAlert", handleAlert);
    return () => window.removeEventListener("globalAlert", handleAlert);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Navbar />

      {/* 🔔 Global Alert (always on top of Navbar) */}
      {globalAlert && (
        <div className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-[2000] w-[90%] sm:w-[500px]">
          <AlertBanner
            message={globalAlert.message}
            type={globalAlert.type}
            onClose={() => setGlobalAlert(null)}
          />
        </div>
      )}

      <main className="flex-1 pt-16 px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* Notification Banner (bottom-right) */}
      <div className="fixed bottom-4 right-4 z-[1050]">{Banner}</div>

      {/* Modals (centered) */}
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
