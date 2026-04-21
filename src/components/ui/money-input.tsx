"use client";

import { Input } from "./input";
import { useState, useEffect } from "react";

interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function MoneyInput({ value, onChange, className, placeholder, required }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  const formatCurrency = (val: string) => {
    const numericValue = val.replace(/\D/g, "");
    if (!numericValue) return "";
    const floatValue = parseFloat(numericValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(floatValue);
  };

  useEffect(() => {
    // Convert incoming numeric string (e.g. "100.50") to display format
    if (value && !displayValue) {
      const numeric = (parseFloat(value) * 100).toFixed(0);
      setDisplayValue(formatCurrency(numeric));
    } else if (!value) {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatCurrency(raw);
    setDisplayValue(formatted);
    
    // Send numeric string to parent (e.g. "100.50")
    if (!raw) {
      onChange("");
    } else {
      onChange((parseFloat(raw) / 100).toString());
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder || "R$ 0,00"}
      required={required}
      inputMode="numeric"
    />
  );
}
