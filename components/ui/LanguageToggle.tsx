"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Locale, locales, localeNames } from "@/lib/i18n/config";
import { useState, useRef, useEffect } from "react";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary transition-all hover:bg-surface-muted hover:scale-105 active:scale-95"
        aria-label="Change language"
      >
        <Languages className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-40 rounded-xl border border-border bg-surface shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  locale === loc
                    ? "bg-primary text-white"
                    : "text-text-primary hover:bg-surface-muted"
                }`}
              >
                <span>{localeNames[loc]}</span>
                <span className="text-xs font-semibold uppercase opacity-60">
                  {loc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
