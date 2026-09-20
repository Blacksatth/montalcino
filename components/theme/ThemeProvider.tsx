"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "montalchino-theme";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolved: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* almacenamiento no disponible */
  }
}

function readCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setThemeState(readCurrentTheme());
      setResolved(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!resolved) return;
    applyTheme(theme);
  }, [theme, resolved]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
        setThemeState(event.newValue);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolved, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>.");
  }
  return value;
}