"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ListingsHeader({ total }: { total: number }) {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-text-primary">{t("listingsTitle")}</h1>
      <p className="mt-2 text-text-muted">
        {total} {t("listingsFound")}
      </p>
    </div>
  );
}

export function NoListingsMessage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-surface">
      <div className="text-center">
        <p className="text-lg font-medium text-text-primary">
          {t("noListingsFound")}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {t("tryDifferentFilters")}
        </p>
      </div>
    </div>
  );
}

export function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-surface">
        <div className="text-center max-w-md px-4">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-error mb-2">
            Xəta baş verdi
          </p>
          <p className="text-sm text-text-muted">
            {error}
          </p>
        </div>
      </div>
    </div>
  );
}
