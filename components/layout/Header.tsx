"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { House, Menu, X, User, LogOut, LayoutDashboard, Home as HomeIcon, Building2, Map, Sparkles, BarChart3, Bookmark, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

type UserRole = "USER" | "ADMIN" | "AGENCY_OWNER" | "AGENT";

type UserType = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
} | null;

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('name, avatar, role')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser({
            id: authUser.id,
            name: profile.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            avatar: profile.avatar,
            role: profile.role as UserRole,
          });
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { href: "/", label: t("home"), icon: HomeIcon },
    { href: "/listings", label: t("listings"), icon: Building2 },
    { href: "/map", label: t("map"), icon: Map },
    { href: "/ai-search", label: t("aiSearch"), icon: Sparkles },
    { href: "/ai-analysis", label: t("aiAnalysis"), icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <House className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">{t("siteTitle")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-primary transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="hidden md:block">
            <LanguageToggle />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth Buttons / User Menu */}
          {user ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-hover"
              >
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                ) : (
                  <span className="text-sm font-semibold">{getInitials(user.name)}</span>
                )}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-surface shadow-lg">
                  <div className="p-1">
                    {/* Admin Panel Link */}
                    {user.role === 'ADMIN' && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Admin Panel
                        </Link>
                        <hr className="my-1 border-border" />
                      </>
                    )}

                    {/* Agency Panel Link */}
                    {(user.role === 'AGENCY_OWNER' || user.role === 'AGENT') && (
                      <>
                        <Link
                          href="/agency"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Building2 className="h-4 w-4" />
                          Agency Panel
                        </Link>
                        <hr className="my-1 border-border" />
                      </>
                    )}

                    {/* Dashboard */}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {/* My Listings */}
                    <Link
                      href="/dashboard/listings"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Building2 className="h-4 w-4" />
                      Elanlarım
                    </Link>

                    {/* Saved Listings */}
                    <Link
                      href="/dashboard/saved"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-muted"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Bookmark className="h-4 w-4" />
                      Saxlanılanlar
                    </Link>

                    <hr className="my-1 border-border" />

                    {/* Logout */}
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-error transition-colors hover:bg-surface-muted"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Çıxış
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Daxil ol
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Qeydiyyat
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-primary transition-all hover:bg-surface-muted md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 border-l border-border bg-surface p-6 shadow-xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Language Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium text-text-muted">{t("siteTitle")}</span>
              <LanguageToggle />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-primary transition-colors hover:bg-surface-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            {!user && (
              <div className="mt-6 space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="ghost" className="w-full">
                    Daxil ol
                  </Button>
                </Link>
                <Link href="/auth/register" className="block">
                  <Button variant="primary" className="w-full">
                    Qeydiyyat
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile User Menu */}
            {user && (
              <div className="mt-6 space-y-2">
                {/* Admin Panel Link */}
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-primary transition-colors hover:bg-surface-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Panel
                    </Link>
                    <hr className="my-1 border-border" />
                  </>
                )}

                {/* Agency Panel Link */}
                {(user.role === 'AGENCY_OWNER' || user.role === 'AGENT') && (
                  <>
                    <Link
                      href="/agency"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-primary transition-colors hover:bg-surface-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building2 className="h-4 w-4" />
                      Agency Panel
                    </Link>
                    <hr className="my-1 border-border" />
                  </>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-primary transition-colors hover:bg-surface-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/listings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-primary transition-colors hover:bg-surface-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 className="h-4 w-4" />
                  Elanlarım
                </Link>
                <Link
                  href="/dashboard/saved"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-primary transition-colors hover:bg-surface-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bookmark className="h-4 w-4" />
                  Saxlanılanlar
                </Link>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-error transition-colors hover:bg-surface-muted"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Çıxış
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
