"use client";

import { useEffect, useRef, useCallback } from "react";

export function useKeyboardAware() {
  const formRef = useRef<HTMLFormElement>(null);

  const scrollToElement = useCallback((el: HTMLElement) => {
    const form = formRef.current;
    if (!form) return;
    const rect = el.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    if (rect.bottom > formRect.bottom) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches("input, select, textarea")) {
        setTimeout(() => scrollToElement(target), 300);
      }
    };

    form.addEventListener("focusin", handleFocus);
    return () => form.removeEventListener("focusin", handleFocus);
  }, [scrollToElement]);

  return formRef;
}
