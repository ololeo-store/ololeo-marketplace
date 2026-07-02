"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { SunMoonIcon } from "@/components/SunMoonIcon";
import { useTheme } from "@/lib/theme";

type Origin = { x: number; y: number };

type TransitionContextValue = {
  requestToggle: (origin?: Origin) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const ANIMATION_MS = 600;
const SWAP_AT_MS = 260;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ThemeTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [run, setRun] = useState<{
    direction: "to-dark" | "to-light";
    origin: Origin;
  } | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const requestToggle = useCallback(
    (origin?: Origin) => {
      const next = theme === "dark" ? "light" : "dark";
      const point = origin ?? {
        x: window.innerWidth - 48,
        y: 48,
      };

      if (prefersReducedMotion()) {
        setTheme(next);
        return;
      }

      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      setRun({ direction: next === "dark" ? "to-dark" : "to-light", origin: point });

      timeoutsRef.current.push(setTimeout(() => setTheme(next), SWAP_AT_MS));
      timeoutsRef.current.push(setTimeout(() => setRun(null), ANIMATION_MS));
    },
    [theme, setTheme],
  );

  return (
    <TransitionContext.Provider value={{ requestToggle }}>
      {children}
      {typeof document !== "undefined" &&
        run &&
        createPortal(
          <TransitionOverlay direction={run.direction} origin={run.origin} />,
          document.body,
        )}
    </TransitionContext.Provider>
  );
}

export function useThemeTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx)
    throw new Error(
      "useThemeTransition must be used within a ThemeTransitionProvider",
    );
  return ctx;
}

function TransitionOverlay({
  direction,
  origin,
}: {
  direction: "to-dark" | "to-light";
  origin: Origin;
}) {
  const toDark = direction === "to-dark";
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  const startX = origin.x;
  const startY = origin.y;
  const endX = startX > vw / 2 ? -80 : vw + 80;
  const midX = vw / 2;
  const midY = Math.max(40, vh * 0.16);

  const travelVars = {
    "--start-x": `${startX}px`,
    "--start-y": `${startY}px`,
    "--mid-x": `${midX}px`,
    "--mid-y": `${midY}px`,
    "--end-x": `${endX}px`,
    "--end-y": `${midY + vh * 0.05}px`,
  } as React.CSSProperties;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] overflow-hidden"
      style={travelVars}
    >
      <div
        className={
          toDark
            ? "absolute inset-0 animate-sky-wipe-dark"
            : "absolute inset-0 animate-sky-wipe-light"
        }
        style={travelVars}
      />
      <div
        className="absolute size-14 -translate-x-1/2 -translate-y-1/2 will-change-transform animate-celestial-travel"
        style={travelVars}
      >
        <div className="drop-shadow-[0_0_18px_rgba(251,191,36,0.55)] dark:drop-shadow-[0_0_18px_rgba(167,139,250,0.6)]">
          <SunMoonIcon variant={toDark ? "moon" : "sun"} size={56} />
        </div>
      </div>
    </div>
  );
}
