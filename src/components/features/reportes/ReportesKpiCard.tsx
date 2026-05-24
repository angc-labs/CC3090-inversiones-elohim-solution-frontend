import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportesKpiCardProps = {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  valueClassName?: string;
};

export function ReportesKpiCard({
  label,
  value,
  subtext,
  valueClassName,
}: ReportesKpiCardProps) {
  return (
    <Card className="!border-slate-200 !shadow-sm">
      <CardContent className="!p-5">
        <p className="!text-sm !text-slate-500">{label}</p>
        <p
          className={cn(
            "!mt-2 !text-3xl !font-bold !text-slate-900",
            valueClassName
          )}
        >
          {value}
        </p>
        {subtext ? (
          <p className="!mt-1 !text-sm !text-slate-500">{subtext}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
