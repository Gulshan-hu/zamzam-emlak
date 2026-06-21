"use client";

import Link from "next/link";
import { Search, BarChart2, Camera, ShieldCheck, ArrowRight, Building2, Home, LandPlot, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ListingCard } from "@/components/listings/ListingCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Listing, Agency, ListingImage } from "@/lib/types";

interface HomeClientProps {
  listings: Array<Listing & { agency?: Agency | null; images: ListingImage[] }>;
}

export function HomeClient({ listings }: HomeClientProps) {
  const { t } = useLanguage();

  const CITIES = [
    { value: "", label: t("allCities") },
    { value: "Bakı", label: "Bakı" },
    { value: "Gəncə", label: "Gəncə" },
    { value: "Sumqayıt", label: "Sumqayıt" },
    { value: "Qusar", label: "Qusar" },
  ];

  const CATEGORIES = [
    { value: "", label: t("allCategories") },
    { value: "APARTMENT", label: t("apartment") },
    { value: "HOUSE", label: t("house") },
    { value: "LAND", label: t("land") },
    { value: "COMMERCIAL", label: t("commercial") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-surface py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mb-10 text-lg text-text-muted md:text-xl">
              {t("heroSubtitle")}
            </p>

            {/* Search Bar Card */}
            <Card className="mx-auto max-w-5xl shadow-md">
              <div className="grid gap-3 p-4 md:grid-cols-5 md:gap-4">
                <div className="md:col-span-1">
                  <Select
                    options={CITIES}
                    defaultValue=""
                    className="h-12"
                    aria-label="Select city"
                  />
                </div>
                <div className="md:col-span-1">
                  <Select
                    options={CATEGORIES}
                    defaultValue=""
                    className="h-12"
                    aria-label="Select category"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    type="number"
                    placeholder={t("minPrice")}
                    className="h-12"
                    aria-label="Minimum price"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    type="number"
                    placeholder={t("maxPrice")}
                    className="h-12"
                    aria-label="Maximum price"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button variant="primary" className="h-12 w-full">
                    <Search className="mr-2 h-5 w-5" />
                    {t("search")}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" size="sm">
                <Building2 className="mr-2 h-4 w-4" />
                {t("apartments")}
              </Button>
              <Button variant="secondary" size="sm">
                <Home className="mr-2 h-4 w-4" />
                {t("houses")}
              </Button>
              <Button variant="secondary" size="sm">
                <LandPlot className="mr-2 h-4 w-4" />
                {t("lands")}
              </Button>
              <Button variant="secondary" size="sm">
                <Store className="mr-2 h-4 w-4" />
                {t("commercialProperties")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1,200+</div>
              <div className="mt-1 text-sm text-text-muted">{t("activeListings")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">850+</div>
              <div className="mt-1 text-sm text-text-muted">{t("users")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="mt-1 text-sm text-text-muted">{t("cities")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">AI</div>
              <div className="mt-1 text-sm text-text-muted">{t("aiPowered")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-text-primary">{t("latestListings")}</h2>
            <Link
              href="/listings"
              className="flex items-center gap-2 text-primary transition-colors hover:text-primary-hover"
            >
              <span className="font-medium">{t("viewAll")}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="border-y border-border bg-surface py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            {t("aiFeatures")}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-surface-muted">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-text-primary">
                  {t("marketAnalysis")}
                </h3>
                <p className="text-text-muted">
                  {t("marketAnalysisDesc")}
                </p>
              </div>
            </Card>

            <Card className="bg-surface-muted">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-text-primary">
                  {t("imageSearch")}
                </h3>
                <p className="text-text-muted">
                  {t("imageSearchDesc")}
                </p>
              </div>
            </Card>

            <Card className="bg-surface-muted">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-text-primary">
                  {t("listingVerification")}
                </h3>
                <p className="text-text-muted">
                  {t("listingVerificationDesc")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-l-4 border-l-primary">
              <div className="p-8">
                <h3 className="mb-3 text-2xl font-bold text-text-primary">{t("bakuTitle")}</h3>
                <p className="mb-4 text-text-muted">
                  {t("bakuDesc")}
                </p>
                <div className="mb-6 text-sm text-text-muted">
                  <span className="font-semibold text-text-primary">1,050+</span> {t("activeListings").toLowerCase()}
                </div>
                <Link href="/listings?city=Bakı">
                  <Button variant="primary">{t("explore")}</Button>
                </Link>
              </div>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <div className="p-8">
                <h3 className="mb-3 text-2xl font-bold text-text-primary">{t("qusarTitle")}</h3>
                <p className="mb-4 text-text-muted">
                  {t("qusarDesc")}
                </p>
                <div className="mb-6 text-sm text-text-muted">
                  <span className="font-semibold text-text-primary">85+</span> {t("activeListings").toLowerCase()}
                </div>
                <Link href="/listings?city=Qusar">
                  <Button variant="primary">{t("explore")}</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
