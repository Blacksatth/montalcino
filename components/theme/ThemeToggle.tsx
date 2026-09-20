"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolved, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={toggleTheme}
      disabled={!resolved}
      className="group flex items-center gap-3 disabled:opacity-60"
    >
      {!compact ? (
        <span className="text-xs uppercase tracking-widest text-taupe transition-colors group-hover:text-foreground">
          {isDark ? "Oscuro" : "Claro"}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-full border border-foreground/20 bg-surface transition-colors"
      >
        <span
          className={`absolute left-1 top-1 grid size-4 place-items-center rounded-full transition-transform duration-300 ease-out ${
            isDark ? "translate-x-5" : "translate-x-0"
          } bg-foreground text-background`}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true">
              <path d="M12 3a6.5 6.5 0 0 0 9 9 7 7 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"
              />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}