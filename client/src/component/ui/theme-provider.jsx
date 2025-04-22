import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext();

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "mechxer-ui-theme",
}) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = typeof window !== "undefined" && localStorage.getItem(storageKey);
    return storedTheme || defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove class names starting with theme-
    root.classList.remove("light", "dark");
    
    // Add appropriate class based on theme
    root.classList.add(theme);
    
    // Store the theme preference
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme) => setTheme(newTheme),
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
