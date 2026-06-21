"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type ActiveFiltersProps = {
  filters: {
    type?: string;
    category?: string;
    city?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    rooms?: number;
  };
};

const LABELS: Record<string, string> = {
  type: "Növ",
  category: "Kateqoriya",
  city: "Şəhər",
  district: "Rayon",
  minPrice: "Min qiymət",
  maxPrice: "Max qiymət",
  minArea: "Min sahə",
  maxArea: "Max sahə",
  rooms: "Otaq",
};

const VALUES: Record<string, Record<string, string>> = {
  type: { SALE: "Satış", RENT: "Kirayə" },
  category: {
    APARTMENT: "Mənzil",
    HOUSE: "Ev/Villa",
    LAND: "Torpaq",
    COMMERCIAL: "Kommersiya",
  },
};

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== ""
  );

  if (activeFilters.length === 0) {
    return null;
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page"); // Reset to page 1
    router.push(`/listings?${params.toString()}`);
  };

  const formatValue = (key: string, value: string | number) => {
    if (VALUES[key]) {
      return VALUES[key][value.toString()];
    }
    if (key.includes("Price")) {
      return `${value} ₼`;
    }
    if (key.includes("Area")) {
      return `${value} m²`;
    }
    return value.toString();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="gray" className="gap-2 px-3 py-1">
          <span className="text-xs">
            {LABELS[key]}: {formatValue(key, value as string | number)}
          </span>
          <button
            onClick={() => removeFilter(key)}
            className="transition-colors hover:text-error"
            aria-label={`Remove ${LABELS[key]} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
