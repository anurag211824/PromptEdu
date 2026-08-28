"use client";
import { createContext, useCallback, useEffect, useState } from "react";

export const ThemeContext = createContext({
  themeMode: "light",
  toggleTheme: () => {},
});

const STORAGE_KEY = "promptedu-theme";

function applyTheme(mode) {
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  html.classList.add(mode);
}

const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");

  // Restore the saved choice (falling back to the OS preference) on mount.
  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies) - ignore.
    }
    const mode =
      saved ??
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setThemeMode(mode);
    applyTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore - the toggle still works for this session.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
