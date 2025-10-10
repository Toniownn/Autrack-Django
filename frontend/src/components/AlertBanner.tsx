import React from "react";

interface AlertBannerProps {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  const bgColor =
    type === "success"
      ? "bg-primary text-primary-foreground"
      : "bg-red-500 text-white";

  return (
    <div
      className={`rounded-md p-3 text-center font-medium shadow-md flex items-center justify-between ${bgColor}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-sm opacity-80 hover:opacity-100"
        >
          ✖
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
