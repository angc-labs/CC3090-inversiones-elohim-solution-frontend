import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  accent?: boolean;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
  accent = false,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        accent &&
          "rounded-xl border border-gray-200 border-b-4 border-b-blue-600 bg-white px-4 py-4 shadow-sm sm:px-5",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-500 sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
