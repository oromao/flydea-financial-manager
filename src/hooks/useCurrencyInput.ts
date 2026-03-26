import { useState, useCallback, ChangeEvent } from "react";

/**
 * Hook for Brazilian currency input masking (R$ 1.234,56).
 * Returns props to spread on an <input> element plus the numeric value.
 */
export function useCurrencyInput(initialValue = 0) {
  const format = (cents: number) => {
    if (cents === 0) return "";
    return (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const [cents, setCents] = useState(() => Math.round(initialValue * 100));
  const [display, setDisplay] = useState(() => format(Math.round(initialValue * 100)));

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const newCents = raw === "" ? 0 : parseInt(raw, 10);
    setCents(newCents);
    setDisplay(format(newCents));
  }, []);

  const setValue = useCallback((value: number) => {
    const newCents = Math.round(value * 100);
    setCents(newCents);
    setDisplay(format(newCents));
  }, []);

  return {
    /** Numeric value in full currency units (e.g. 1234.56) */
    value: cents / 100,
    /** Props to spread directly on <input> */
    inputProps: {
      value: display,
      onChange,
      inputMode: "numeric" as const,
      placeholder: "0,00",
    },
    setValue,
  };
}
