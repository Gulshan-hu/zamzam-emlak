"use client";

import Link from "next/link";
import { House, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function FooterClient() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/listings", label: t("listings") },
    { href: "/map", label: t("map") },
    { href: "/listings/new", label: t("addListing") },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Column 1: Logo & Description */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <House className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">{t("siteTitle")}</span>
            </div>
            <p className="text-sm text-text-muted">
              {t("footerDescription")}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">{t("contact")}</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p>{t("bakuAddress")}</p>
                  <p className="mt-1">{t("qusarAddress")}</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <a
                  href="mailto:zamcapital.biznes@gmail.com"
                  className="transition-colors hover:text-primary"
                >
                  zamcapital.biznes@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-text-muted">
            © {currentYear} {t("siteTitle")}. {t("allRightsReserved")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
