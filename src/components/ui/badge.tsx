import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "!inline-flex !items-center !rounded-full !border !px-2.5 !py-0.5 !text-xs !font-semibold !transition-colors",
  {
    variants: {
      variant: {
        default: "!border-transparent !bg-primary !text-primary-foreground",
        secondary: "!border-transparent !bg-secondary !text-secondary-foreground",
        destructive:
          "!border-red-200 !bg-red-50 !text-red-700 !shadow-none",
        outline: "!border-slate-200 !bg-white !text-slate-700",
        success: "!border-emerald-200 !bg-emerald-50 !text-emerald-700",
        warning: "!border-orange-200 !bg-orange-50 !text-orange-700",
        info: "!border-blue-200 !bg-blue-50 !text-blue-700",
        gold: "!border-amber-200 !bg-amber-50 !text-amber-800",
        critical: "!border-red-200 !bg-red-50 !text-red-600",
        stock: "!border-orange-200 !bg-orange-50 !text-orange-600 !font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
