import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar/Navbar";
import useBookingNotifications from "./hooks/useBookingNotifactions";

const App = () => {
  const { ConfirmationModal, CancelConfirmModal, Banner } =
    useBookingNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16 px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* 🔔 Notification Banner */}
      <div className="fixed bottom-4 right-4 z-[1050]">{Banner}</div>

      {/* 🧾 Centered Modals */}
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
