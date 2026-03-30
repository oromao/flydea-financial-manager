"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterChip {
  id: string;
  label: string;
  color?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  active: string[];
  onToggle: (id: string) => void;
  onClear?: () => void;
  className?: string;
}

export function FilterChips({ chips, active, onToggle, onClear, className }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)} role="group" aria-label="Filtros">
      {chips.map((chip) => {
        const isActive = active.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onToggle(chip.id)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
              "border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-white/5 border-white/10 text-on-surface-variant/60 hover:bg-white/10 hover:border-white/20"
            )}
            style={isActive && chip.color ? { backgroundColor: `${chip.color}22`, borderColor: `${chip.color}66`, color: chip.color } : undefined}
          >
            {chip.label}
            {isActive && (
              <X className="w-3 h-3 opacity-70" aria-hidden="true" />
            )}
          </button>
        );
      })}
      {active.length > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/40 hover:text-on-surface-variant transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
