import * as React from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

type AlertProps = {
  type: AlertType;
  message: string;
  title?: string;
  onClose?: () => void;
};

const alertConfig: Record<AlertType, { bg: string; border: string; text: string; icon: AlertType }> = {
  success: {
    bg: "bg-green-50!",
    border: "border-green-100!",
    text: "text-green-700!",
    icon: "success",
  },
  error: {
    bg: "bg-red-50!",
    border: "border-red-100!",
    text: "text-red-700!",
    icon: "error",
  },
  warning: {
    bg: "bg-yellow-50!",
    border: "border-yellow-100!",
    text: "text-yellow-700!",
    icon: "warning",
  },
  info: {
    bg: "bg-blue-50!",
    border: "border-blue-100!",
    text: "text-blue-700!",
    icon: "info",
  },
};

export function Alert({ type, message, title, onClose }: AlertProps) {
  const config = alertConfig[type];

  const iconMap = {
    success: <CheckCircle2 className="h-5! w-5!" />,
    error: <XCircle className="h-5! w-5!" />,
    warning: <AlertCircle className="h-5! w-5!" />,
    info: <AlertCircle className="h-5! w-5!" />,
  };

  return (
    <div
      className={`flex! gap-3! rounded-lg! border! ${config.bg} ${config.border} px-4! py-3! ${config.text}`}
      role="alert"
    >
      <div className="mt-0.5! flex-shrink-0!">{iconMap[type]}</div>
      <div className="flex-1!">
        {title && <p className="text-sm! font-semibold!">{title}</p>}
        <p className={`text-sm! ${title ? "mt-1!" : ""}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0! text-lg! opacity-50! hover:opacity-100! transition-opacity!"
          aria-label="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
