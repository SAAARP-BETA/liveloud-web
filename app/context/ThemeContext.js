'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = savedTheme === 'dark' || 
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  setIsDark(prefersDark);
  
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  setMounted(true);
}, []);
const toggleTheme = () => {
  const newIsDark = !isDark;
  setIsDark(newIsDark);
  
  // Debug logs
  console.log('Before toggle:', document.documentElement.classList.toString());
  
  if (newIsDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  
  console.log('After toggle:', document.documentElement.classList.toString());
};


  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};