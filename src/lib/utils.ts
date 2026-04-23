import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a short unique request ID for correlation
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 9);
}
