import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportesDataTableProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function ReportesDataTable({
  title,
  description,
  children,
  className,
}: ReportesDataTableProps) {
  return (
    <Card
      className={cn(
        "!overflow-hidden !border !border-slate-200 !bg-white !shadow-sm",
        className
      )}
    >
      <div className="!border-b !border-slate-100 !bg-slate-50/90 !px-6 !py-4">
        <h3 className="!text-base !font-semibold !text-slate-900">{title}</h3>
        {description ? (
          <p className="!mt-1 !text-sm !text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="!w-full !overflow-x-auto">{children}</div>
    </Card>
  );
}
