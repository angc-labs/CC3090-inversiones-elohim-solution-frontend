"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { CiSearch } from "react-icons/ci"; 
import { IoClose } from "react-icons/io5";
import { useSearchSuggestions, type SearchSuggestion } from "@/hooks/useSearchSuggestions";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  onSuggestionSelect,
  placeholder = "Buscar productos...",
  className = "",
}: SearchBarProps) {
  const {
    query,
    setQuery,
    suggestions,
    isSearching,
    clearSearch,
  } = useSearchSuggestions();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(suggestions.length > 0 && query.length >= 2);
    setSelectedIndex(-1);
  }, [suggestions, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label);
    setIsOpen(false);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion.value);
  };

  const handleClear = () => {
    clearSearch();
    onSearch("");
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "product":
        return "📦";
      case "category":
        return "🏷️";
      case "brand":
        return "🏢";
      default:
        return "🔍";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full!">
        <CiSearch className="absolute! left-3! top-1/2! h-4! w-4! -translate-y-1/2! text-gray-400!" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10! pr-10! h-12! text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/30 w-full!"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <IoClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Buscando...
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    index === selectedIndex ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.label}
                    </div>
                    {suggestion.product && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.product.descripcion}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {suggestion.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {suggestions.length === 0 && query.length >= 2 && !isSearching && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
