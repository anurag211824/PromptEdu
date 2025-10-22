"use client";
import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  themeMode: "light",
  toggleTheme: () => {}
});

const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");
  const toggleTheme = () => {
    if (themeMode === "light") {
      setThemeMode("dark");
    } else if (themeMode === "dark") {
      setThemeMode("light");
    }

    document.querySelector("html").classList.remove("light", "dark");
    document.querySelector("html").classList.add(themeMode);
  };
  return (
    <ThemeContext.Provider value={{ themeMode,toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
