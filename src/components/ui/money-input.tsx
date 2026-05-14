"use client";

import { Input } from "./input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export function MoneyInput({ value, onChange, className, placeholder, required, id, name, "aria-label": ariaLabel, "aria-describedby": ariaDescribedby }: MoneyInputProps) {
  const formatCurrency = (val: string) => {
    const numericValue = val.replace(/\D/g, "");
    if (!numericValue) return "";
    const floatValue = parseFloat(numericValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(floatValue);
  };

  const [localValue, setLocalValue] = useState(() =>
    value ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(value)) : ""
  );
  const [prevValue, setPrevValue] = useState(value);

  // Synchronize state with props during render (React recommended pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value ? formatCurrency((parseFloat(value) * 100).toFixed(0)) : "");
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatCurrency(raw);
    setLocalValue(formatted);
    
    if (!raw) {
      onChange("");
    } else {
      onChange((parseFloat(raw) / 100).toString());
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-sm font-medium pointer-events-none">R$</span>
      <Input
        type="text"
        id={id}
        name={name}
        value={localValue}
        onChange={handleChange}
        className={cn("pl-10", className)}
        placeholder={placeholder || "R$ 0,00"}
        required={required}
        inputMode="numeric"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      />
    </div>
  );
}
