"use client";

import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { QueryProvider } from "@/lib/query/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryProvider>{children}</QueryProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
