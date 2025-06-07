
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "custom-purple" | "blue-gradient";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "reelview-admin-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme && ["light", "dark", "custom-purple", "blue-gradient"].includes(storedTheme)) {
        return storedTheme;
      }
      // Default to system preference or 'light' if not available
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light"; // Default for server-side rendering
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark", "theme-custom-purple", "theme-blue-gradient");
      
      if (theme === "light") {
        root.classList.add("light");
      } else {
        root.classList.add(theme);
      }
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
