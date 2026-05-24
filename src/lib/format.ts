export function formatGtq(value: number): string {
  return `Q ${value.toLocaleString("es-GT", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** @deprecated Usar formatGtq */
export const formatSoles = formatGtq;
