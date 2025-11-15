import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertBannerProps {
  message: string;
  type?: "success" | "error" | "warning";
  onClose: () => void;
  hideCloseButton?: boolean; // ✅ new optional prop
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  type = "success",
  onClose,
  hideCloseButton = false, // ✅ default false
}) => {
  const bgColor =
    type === "error"
      ? "bg-gradient-to-r from-red-600 to-red-400"
      : type === "warning"
      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
      : "bg-gradient-to-r from-orange-600 to-orange-400";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`${bgColor} text-white rounded-xl shadow-lg p-4 flex items-center justify-between`}
      >
        <p className="font-medium">{message}</p>
        {!hideCloseButton && ( // ✅ only show X button if not hidden
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertBanner;
