"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  }
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart debe usarse dentro de <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "!relative !flex !aspect-video !justify-center !overflow-visible !text-xs [&_.recharts-cartesian-axis-tick_text]:!fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:!stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:!stroke-border [&_.recharts-default-tooltip]:!border-0 [&_.recharts-default-tooltip]:!bg-transparent [&_.recharts-default-tooltip]:!p-0 [&_.recharts-default-tooltip]:!shadow-none [&_.recharts-dot[stroke='#fff']]:!stroke-transparent [&_.recharts-layer]:!outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:!stroke-border [&_.recharts-radial-bar-background-sector]:!fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:!fill-[rgba(203,213,225,0.55)] [&_.recharts-reference-line_[stroke='#ccc']]:!stroke-border [&_.recharts-sector[stroke='#fff']]:!stroke-transparent [&_.recharts-sector]:!outline-none [&_.recharts-surface]:!outline-none [&_.recharts-tooltip-wrapper]:!z-[100] [&_.recharts-tooltip-wrapper]:!w-auto [&_.recharts-tooltip-wrapper]:!pointer-events-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => `  --color-${key}: ${item.color};`)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

/** Evita que el contenedor por defecto de Recharts recorte el valor del tooltip. */
const CHART_TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  boxShadow: "none",
};

const CHART_TOOLTIP_WRAPPER_STYLE: React.CSSProperties = {
  zIndex: 50,
  outline: "none",
};

/** Fondo sólido del cuadro de tooltip (no usar tokens semitransparentes). */
const CHART_TOOLTIP_BOX_STYLE: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.08)",
};

/** Columna / área resaltada al pasar el mouse (como en el diseño de referencia). */
const CHART_TOOLTIP_CURSOR = { fill: "rgba(203, 213, 225, 0.55)" };

const ChartTooltip = ({
  contentStyle,
  wrapperStyle,
  cursor = CHART_TOOLTIP_CURSOR,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) => (
  <RechartsPrimitive.Tooltip
    cursor={cursor}
    contentStyle={{ ...CHART_TOOLTIP_CONTENT_STYLE, ...contentStyle }}
    wrapperStyle={{ ...CHART_TOOLTIP_WRAPPER_STYLE, ...wrapperStyle }}
    {...props}
  />
);

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
      valueFormatter?: (value: number, dataKey: string) => string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      valueFormatter,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "!box-border !w-max !min-w-[9rem] !max-w-[16rem] !rounded-lg !px-3 !py-2 !text-xs !text-slate-900",
          className
        )}
        style={CHART_TOOLTIP_BOX_STYLE}
      >
        {!nestLabel && !hideLabel ? (
          <div className={cn("!mb-1.5 !font-semibold !leading-snug !text-slate-900", labelClassName)}>
            {labelFormatter
              ? labelFormatter(label, payload)
              : label}
          </div>
        ) : null}
        <div className="!flex !flex-col !gap-2">
          {payload.map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = config[key];
            const indicatorColor = color ?? item.payload?.fill ?? item.color;
            const metricLabel = String(itemConfig?.label ?? item.name ?? "");
            const metricValue =
              item.value != null
                ? valueFormatter
                  ? valueFormatter(
                      Number(item.value),
                      String(item.dataKey ?? "")
                    )
                  : item.value.toLocaleString()
                : null;

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "!flex !w-full !min-w-0 !items-start !gap-2 [&>svg]:!h-2.5 [&>svg]:!w-2.5 [&>svg]:!text-muted-foreground",
                  indicator === "dot" && "!items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {!hideIndicator ? (
                      <div
                        className={cn(
                          "!shrink-0 !rounded-[2px] !border-[--color] !bg-[--color]",
                          {
                            "!h-2.5 !w-2.5": indicator === "dot",
                            "!w-1": indicator === "line",
                            "!w-0 !border-[1.5px] !border-dashed !bg-transparent":
                              indicator === "dashed",
                            "!my-0.5": nestLabel && indicator === "dashed",
                          }
                        )}
                        style={
                          {
                            "--color": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    ) : null}
                    <div className="!min-w-0 !flex-1">
                      {nestLabel && !hideLabel ? (
                        <div
                          className={cn(
                            "!mb-1 !font-medium !leading-snug",
                            labelClassName
                          )}
                        >
                          {labelFormatter
                            ? labelFormatter(label, payload)
                            : label}
                        </div>
                      ) : null}
                      <div className="!grid !w-full !grid-cols-[minmax(0,1fr)_auto] !items-center !gap-x-3 !gap-y-0.5">
                        <span className="!truncate !text-muted-foreground">
                          {metricLabel}
                        </span>
                        {metricValue != null ? (
                          <span className="!shrink-0 !justify-self-end !font-mono !text-sm !font-semibold !tabular-nums !text-foreground">
                            {metricValue}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "!flex !items-center !justify-center !gap-4",
        verticalAlign === "top" ? "!pb-3" : "!pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey ?? item.dataKey ?? "value"}`;
        const itemConfig = config[key];

        return (
          <div
            key={item.value}
            className="!flex !items-center !gap-1.5 [&>svg]:!h-3 [&>svg]:!w-3 [&>svg]:!text-muted-foreground"
          >
            {!hideIcon ? (
              <div
                className="!h-2 !w-2 !shrink-0 !rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            ) : null}
            <span className="!text-muted-foreground">
              {itemConfig?.label ?? item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
