"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// A number that counts up once, the first time it scrolls into view
// (redesign plan > Motion > Ranking). The server renders the final value, so
// it's right without JavaScript; with reduced motion it never animates.
// Screen readers always get the final value, never the moving one.

const DURATION_MS = 400;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

export function CountUp({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current = true;
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || done.current) return;
        done.current = true;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          setShown(value * easeOutExpo(t));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        setShown(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  const final = value.toFixed(decimals);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span aria-hidden>{shown.toFixed(decimals)}</span>
      {/* Not selectable, so copying the table gives the number once. */}
      <span className="sr-only select-none">{final}</span>
    </span>
  );
}
