"use client";

import { Input } from "./input";
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

  const [localValue, setLocalValue] = useState("");
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
    <Input
      type="text"
      id={id}
      name={name}
      value={localValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder || "R$ 0,00"}
      required={required}
      inputMode="numeric"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
    />
  );
}
