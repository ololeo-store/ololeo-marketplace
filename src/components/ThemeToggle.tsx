"use client";

import { useRef } from "react";
import { SunMoonIcon } from "@/components/SunMoonIcon";
import { useThemeTransition } from "@/components/ThemeTransition";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme } = useTheme();
  const { requestToggle } = useThemeTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    requestToggle(
      rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined,
    );
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label="Toggle theme"
      className={cn(
        "relative flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-all duration-150 ease-out hover:bg-muted active:scale-[0.94]",
        className,
      )}
    >
      <SunMoonIcon variant={theme === "dark" ? "moon" : "sun"} size={18} />
    </button>
  );
}
