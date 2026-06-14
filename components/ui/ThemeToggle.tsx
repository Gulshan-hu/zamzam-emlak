"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Fix: Use component mount lifecycle instead of effect
  if (!mounted) {
    setTimeout(() => setMounted(true), 0);
    return (
      <button
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary transition-all hover:bg-surface-muted"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary transition-all hover:bg-surface-muted hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-200" />
      ) : (
        <Moon className="h-5 w-5 rotate-0 scale-100 transition-all duration-200" />
      )}
    </button>
  );
}
