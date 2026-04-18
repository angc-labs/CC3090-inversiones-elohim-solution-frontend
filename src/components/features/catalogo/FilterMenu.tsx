"use client";

import { useState } from "react";
import { FilterType } from "@/hooks/useProductFilters";
import { FilterOptions } from "./FilterOptions";

interface FilterMenuProps {
  activeFilterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  categories: string[];
  brands: string[];
  priceRanges: Array<{ label: string; min: number; max: number }>;
}

export function FilterMenu({
  activeFilterType,
  onFilterTypeChange,
  selectedValues,
  onSelectionChange,
  categories,
  brands,
  priceRanges,
}: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { id: "category", label: "Categoría" },
    { id: "price", label: "Precio" },
    { id: "brand", label: "Marca" },
  ] as const;

  // Convertir datos a formato compatible con FilterOptions
  const getCategoryOptions = () =>
    categories.map((c) => ({ label: c, value: c }));
  const getBrandOptions = () =>
    brands.map((b) => ({ label: b, value: b }));
  const getPriceOptions = () =>
    priceRanges.map((r) => ({ label: r.label, value: r.label }));

  const getActiveOptions = () => {
    if (activeFilterType === "category") return getCategoryOptions();
    if (activeFilterType === "brand") return getBrandOptions();
    return getPriceOptions();
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
      {/* Filter Type Selector */}
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-900">
            Filtrar por:{" "}
            {filterOptions.find((f) => f.id === activeFilterType)?.label}
          </span>
          <span className="text-xl">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onFilterTypeChange(option.id);
                  onSelectionChange([]); // Reset selections
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeFilterType === option.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Options - Componente genérico */}
      <FilterOptions
        filterType={activeFilterType}
        options={getActiveOptions()}
        selectedValues={selectedValues}
        onSelectionChange={onSelectionChange}
      />

      {/* Clear Filters Button */}
      {selectedValues.length > 0 && (
        <button
          onClick={() => onSelectionChange([])}
          className="w-full mt-6 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
