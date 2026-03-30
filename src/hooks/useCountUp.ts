import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 (or previousValue) to `target` over `duration` ms.
 * Returns the current animated value.
 */
export function useCountUp(target: number, duration = 800, delay = 0): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;

    let timeout: ReturnType<typeof setTimeout>;

    const start = (startTime: number) => {
      startRef.current = startTime;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(from + (target - from) * eased);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    timeout = setTimeout(() => {
      start(performance.now());
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return current;
}
