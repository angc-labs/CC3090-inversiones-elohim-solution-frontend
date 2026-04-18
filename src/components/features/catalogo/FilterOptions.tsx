interface FilterOption {
  label: string;
  value: string;
}

interface FilterOptionsProps {
  filterType: "category" | "price" | "brand";
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

export function FilterOptions({
  filterType,
  options,
  selectedValues,
  onSelectionChange,
}: FilterOptionsProps) {
  const handleChange = (value: string) => {
    if (filterType === "price") {
      // Solo un rango de precio a la vez
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        onSelectionChange([value]);
      }
    } else {
      // Categoría y marca: múltiples selecciones
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    }
  };

  const inputType = filterType === "price" ? "radio" : "checkbox";

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
          <input
            type={inputType}
            name={filterType}
            checked={selectedValues.includes(option.value)}
            onChange={() => handleChange(option.value)}
            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
