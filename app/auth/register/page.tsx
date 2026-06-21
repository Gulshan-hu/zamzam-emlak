"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { signUp, signInWithOAuth, validatePassword, formatPhoneNumber, validatePhoneNumber } from "@/lib/auth";
import { GoogleIcon, AppleIcon } from "@/components/icons/SocialIcons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = validatePassword(formData.password);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("nameTooShort");
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = t("fieldRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = t("phoneRequired");
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = t("phoneFormat");
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("fieldRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwordsNotMatch");
    }

    // Terms validation
    if (!agreeToTerms) {
      newErrors.terms = t("termsRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);

      const result = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formattedPhone
      );

      if (!result.success) {
        setErrors({ general: result.error.message });
        setIsLoading(false);
        return;
      }

      // Success - redirect to email confirmation page
      router.push(`/auth/confirm-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({
        general: "Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
      });
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google') => {
    setErrors({});
    setIsLoading(true);

    try {
      const result = await signInWithOAuth(provider);

      if (!result.success) {
        setErrors({ general: result.error.message });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("OAuth sign in error:", err);
      setErrors({
        general: "Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
      });
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case "strong":
        return "bg-success";
      case "medium":
        return "bg-warning";
      case "weak":
        return "bg-error";
      default:
        return "bg-border";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength.strength) {
      case "strong":
        return t("strong");
      case "medium":
        return t("medium");
      case "weak":
        return t("weak");
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              {t("registerTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {t("registerSubtitle")}
            </p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <Input
              type="text"
              label={t("name")}
              placeholder={t("name")}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              disabled={isLoading}
              required
            />

            {/* Email */}
            <Input
              type="email"
              label={t("email")}
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              disabled={isLoading}
              required
            />

            {/* Phone */}
            <div>
              <Input
                type="tel"
                label={t("phone")}
                placeholder="+994 XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                disabled={isLoading}
                required
              />
              <p className="mt-1 text-xs text-text-muted">
                🇦🇿 Azərbaycan nömrəsi (+994)
              </p>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label={t("password")}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  disabled={isLoading}
                  required
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    <div
                      className={`h-1 flex-1 rounded transition-all ${
                        passwordStrength.strength !== "weak"
                          ? getStrengthColor()
                          : "bg-border"
                      }`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded transition-all ${
                        passwordStrength.strength === "strong"
                          ? getStrengthColor()
                          : "bg-border"
                      }`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded transition-all ${
                        passwordStrength.strength === "strong"
                          ? getStrengthColor()
                          : "bg-border"
                      }`}
                    ></div>
                  </div>
                  {formData.password && (
                    <p className="text-xs text-text-muted">
                      {t("passwordStrength")}: <span className="font-medium">{getStrengthText()}</span>
                    </p>
                  )}
                </div>
              )}

              <ul className="mt-2 space-y-1 text-xs text-text-muted">
                <li className={formData.password.length >= 8 ? "text-success" : ""}>
                  • {t("passwordMinLength")}
                </li>
                <li className={/[A-Z]/.test(formData.password) ? "text-success" : ""}>
                  • {t("passwordUppercase")}
                </li>
                <li className={/\d/.test(formData.password) ? "text-success" : ""}>
                  • {t("passwordNumber")}
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label={t("confirmPassword")}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-text-muted transition-colors hover:text-text-primary"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isLoading}
                />
                <span className="text-sm text-text-muted">
                  <Link
                    href="/terms"
                    className="text-primary transition-colors hover:text-primary-hover"
                  >
                    {t("terms")}
                  </Link>{" "}
                  {t("orContinueWith")}{" "}
                  <Link
                    href="/privacy"
                    className="text-primary transition-colors hover:text-primary-hover"
                  >
                    {t("privacy")}
                  </Link>
                  {" "}{t("agreeToTerms")}
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-error">{errors.terms}</p>
              )}
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
                  {t("registering")}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t("register")}
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
              {t("registerWithGoogle")}
            </Button>

            {/* Apple Sign In - Disabled */}
            <Button
              type="button"
              variant="secondary"
              className="w-full opacity-50 cursor-not-allowed"
              disabled
            >
              <AppleIcon className="mr-2 h-5 w-5" />
              {t("registerWithApple")}
              <span className="ml-2 text-xs">({t("comingSoon")})</span>
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-text-muted">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
