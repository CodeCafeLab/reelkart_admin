
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface AppSettings {
  currencyCode: string; // e.g., "INR", "USD", "EUR"
  currencySymbol: string; // e.g., "₹", "$", "€"
}

interface AppSettingsContextType {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  currencyCode: "INR",
  currencySymbol: "₹",
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const APP_SETTINGS_STORAGE_KEY = "reelkart-admin-app-settings";

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedSettings = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          // Basic validation to ensure essential fields are present
          if (parsedSettings && parsedSettings.currencyCode && parsedSettings.currencySymbol) {
            return parsedSettings;
          }
        }
      } catch (error) {
        console.error("Error loading app settings from localStorage:", error);
      }
    }
    return defaultSettings; // Default for server-side or if localStorage fails
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving app settings to localStorage:", error);
      }
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettingsState(newSettings);
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, setSettings: updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }
  return context;
}
