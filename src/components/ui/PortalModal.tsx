"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PortalModalProps {
  children: ReactNode;
  onClose: () => void;
  ariaLabel?: string;
  backdropClassName?: string;
}

export function PortalModal({
  children,
  onClose,
  ariaLabel = "Ventana modal",
  backdropClassName,
}: PortalModalProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 animate-fade-in sm:p-6 [&>*]:my-auto [&>*]:!rounded-2xl [&>*]:!border [&>*]:!border-slate-800 [&>*]:!bg-slate-950 [&>*]:!shadow-2xl",
        backdropClassName ?? "bg-slate-950/70 backdrop-blur-sm"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
