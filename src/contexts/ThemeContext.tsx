
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "reelkart-admin-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with a default theme that server will use for consistent initial render
  const [theme, setThemeState] = useState<Theme>("light"); 

  useEffect(() => {
    // This effect runs on the client after hydration
    // Determine the actual client-side theme from localStorage or system preference
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialClientTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
    
    // Update the state only if the determined client theme is different from the initial server-rendered theme
    if (initialClientTheme !== theme) {
      setThemeState(initialClientTheme);
    }
  }, []); // Empty dependency array: runs once on mount on the client

  useEffect(() => {
    // This effect applies the theme to the DOM and updates localStorage whenever the `theme` state changes.
    // It runs on initial mount (with the default "light" or client-determined theme) and whenever `theme` is updated.
    const root = window.document.documentElement;
    root.classList.remove("light", "dark"); // Clean up old theme classes
    root.classList.add(theme); // Add the current theme class
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]); // Dependency array: runs when `theme` changes

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
