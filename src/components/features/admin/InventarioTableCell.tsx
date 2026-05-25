"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type InventarioTableCellProps = {
  value: string | number | null | undefined;
  onSave: (value: string | number) => Promise<void>;
  type?: "text" | "number";
  editable?: boolean;
  isLoading?: boolean;
  error?: string | null;
};

export function InventarioTableCell({
  value,
  onSave,
  type = "text",
  editable = true,
  isLoading = false,
  error = null,
}: InventarioTableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value || ""));
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (tempValue === String(value)) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      const parsedValue = type === "number" ? parseFloat(tempValue) : tempValue;
      await onSave(parsedValue);
      setIsEditing(false);
    } catch {
      // error is handled by parent, revert to previous value
      setTempValue(String(value || ""));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(String(value || ""));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!editable) {
    return (
      <div className="text-sm text-gray-900">
        {value || "-"}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={type === "number" ? "number" : "text"}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className={cn(
            "flex-1 px-2 py-1 text-sm border rounded",
            error ? "border-red-500" : "border-blue-500",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
          aria-label="Confirmar"
        >
          <Check size={16} />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
          aria-label="Cancelar"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-center gap-2 cursor-pointer group",
        error && "text-red-600"
      )}
    >
      <span className="text-sm text-gray-900">{value || "-"}</span>
      <Edit2 size={14} className="text-gray-400 group-hover:text-gray-600 hidden group-hover:block" />
    </div>
  );
}
