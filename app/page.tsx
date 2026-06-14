"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">{t("siteTitle")}</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-text-primary">
            {t("designSystemDemo")}
          </h2>
          <p className="text-lg text-text-muted">
            {t("componentLibrary")}
          </p>
        </div>

        <div className="space-y-12">
          {/* Buttons Section */}
          <section>
            <h3 className="mb-6 text-2xl font-semibold text-text-primary">
              {t("buttons")}
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">
                {t("primarySmall")}
              </Button>
              <Button variant="primary" size="md">
                {t("primaryMedium")}
              </Button>
              <Button variant="primary" size="lg">
                {t("primaryLarge")}
              </Button>
              <Button variant="secondary">{t("secondary")}</Button>
              <Button variant="ghost">{t("ghost")}</Button>
              <Button variant="danger">{t("danger")}</Button>
              <Button disabled>{t("disabled")}</Button>
            </div>
          </section>

          {/* Inputs Section */}
          <section>
            <h3 className="mb-6 text-2xl font-semibold text-text-primary">
              {t("formInputs")}
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label={t("email")} type="email" placeholder={t("enterEmail")} />
              <Input
                label={t("password")}
                type="password"
                placeholder={t("enterPassword")}
              />
              <Input
                label={t("withError")}
                type="text"
                error={t("fieldRequired")}
              />
              <Select
                label={t("propertyType")}
                options={[
                  { value: "apartment", label: t("apartment") },
                  { value: "house", label: t("house") },
                  { value: "land", label: t("land") },
                  { value: "commercial", label: t("commercial") },
                ]}
              />
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <h3 className="mb-6 text-2xl font-semibold text-text-primary">
              {t("badges")}
            </h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant="green">{t("forSale")}</Badge>
              <Badge variant="blue">{t("forRent")}</Badge>
              <Badge variant="gray">{t("pending")}</Badge>
              <Badge variant="red">{t("rejected")}</Badge>
            </div>
          </section>

          {/* Cards Section */}
          <section>
            <h3 className="mb-6 text-2xl font-semibold text-text-primary">
              {t("cards")}
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">
                  {t("basicCard")}
                </h4>
                <p className="text-text-muted">
                  {t("basicCardDesc")}
                </p>
              </Card>
              <Card hover>
                <h4 className="mb-2 text-lg font-semibold text-text-primary">
                  {t("hoverCard")}
                </h4>
                <p className="text-text-muted">
                  {t("hoverCardDesc")}
                </p>
              </Card>
              <Card hover>
                <div className="mb-4 h-32 rounded-lg bg-surface-muted" />
                <h4 className="mb-2 text-lg font-semibold text-text-primary">
                  {t("propertyCard")}
                </h4>
                <p className="text-text-muted">{t("sampleProperty")}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="green">{t("sale")}</Badge>
                  <span className="text-xl font-bold text-primary">
                    ₼250,000
                  </span>
                </div>
              </Card>
            </div>
          </section>

          {/* Modal Section */}
          <section>
            <h3 className="mb-6 text-2xl font-semibold text-text-primary">
              {t("modal")}
            </h3>
            <Button onClick={() => setIsModalOpen(true)}>{t("openModal")}</Button>
          </section>
        </div>
      </main>

      {/* Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("sampleModal")}
      >
        <p className="mb-4 text-text-muted">
          {t("modalDescription")}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setIsModalOpen(false)}>{t("close")}</Button>
          <Button variant="secondary">{t("action")}</Button>
        </div>
      </Modal>
    </div>
  );
}
