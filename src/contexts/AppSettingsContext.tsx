
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
  // Initialize with default settings for consistent server and initial client render
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    // This effect runs on the client after hydration
    // Load settings from localStorage
    try {
      const storedSettings = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Basic validation
        if (parsedSettings && parsedSettings.currencyCode && parsedSettings.currencySymbol) {
          // Update state only if different from initial to avoid unnecessary re-render
          if (parsedSettings.currencyCode !== settings.currencyCode || parsedSettings.currencySymbol !== settings.currencySymbol) {
            setSettingsState(parsedSettings);
          }
        }
      }
    } catch (error) {
      console.error("Error loading app settings from localStorage:", error);
    }
  }, []); // Empty dependency array: runs once on mount on the client

  useEffect(() => {
    // This effect saves settings to localStorage whenever the `settings` state changes.
    // It runs on initial mount (with default or loaded settings) and whenever `settings` is updated.
    try {
      localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving app settings to localStorage:", error);
    }
  }, [settings]); // Dependency array: runs when `settings` changes

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
