"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { signIn, signInWithOAuth } from "@/lib/auth";
import { GoogleIcon, AppleIcon } from "@/components/icons/SocialIcons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const confirmed = searchParams.get("confirmed");
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    confirmed === "true" ? t("emailConfirmed") : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        // Check for email confirmation error
        if (result.error.message.includes("Email not confirmed") ||
            result.error.message.includes("email_not_confirmed") ||
            result.error.code === "email_not_confirmed") {
          setError(t("pleaseConfirmEmail"));
        } else {
          setError(result.error.message);
        }
        setIsLoading(false);
        return;
      }

      // Success - redirect to return URL or dashboard
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      setError("Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google') => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = await signInWithOAuth(provider);

      if (!result.success) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      setError("Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">{t("loginTitle")}</h1>
            <p className="mt-2 text-sm text-text-muted">
              {t("loginSubtitle")}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Auth Error from Callback */}
          {authError && !error && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              type="email"
              label={t("email")}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label={t("password")}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-text-muted transition-colors hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-text-muted">{t("rememberMe")}</span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary transition-colors hover:text-primary-hover"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {t("loading")}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  {t("login")}
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-2 text-text-muted">{t("orContinueWith")}</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              {t("loginWithGoogle")}
            </Button>

            {/* Apple Sign In - Disabled */}
            <Button
              type="button"
              variant="secondary"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
            >
              <AppleIcon className="mr-2 h-5 w-5" />
              {t("loginWithApple")}
              <span className="ml-2 text-xs">({t("comingSoon")})</span>
            </Button>
          </div>

          {/* Register Link */}
          <div className="text-center text-sm text-text-muted">
            {t("dontHaveAccount")}{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {t("register")}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
