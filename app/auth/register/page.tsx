"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { signUp, validatePassword, formatPhoneNumber, validatePhoneNumber } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

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
      newErrors.name = "Ad və soyad tələb olunur";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Ad və soyad ən azı 2 simvol olmalıdır";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email tələb olunur";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email formatı düzgün deyil";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Telefon nömrəsi tələb olunur";
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = "Telefon nömrəsi düzgün deyil (+994XXXXXXXXX)";
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Şifrə təkrarı tələb olunur";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifrələr uyğun gəlmir";
    }

    // Terms validation
    if (!agreeToTerms) {
      newErrors.terms = "İstifadə şərtlərini qəbul etməlisiniz";
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

      // Success - redirect to login with success message
      router.push("/auth/login?registered=true");
    } catch (err) {
      console.error("Registration error:", err);
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
        return "Güclü";
      case "medium":
        return "Orta";
      case "weak":
        return "Zəif";
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
              Qeydiyyat
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Hesab yaratmaq üçün məlumatlarınızı daxil edin
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
              label="Ad və Soyad"
              placeholder="Adınız Soyadınız"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              disabled={isLoading}
              required
            />

            {/* Email */}
            <Input
              type="email"
              label="Email"
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
                label="Telefon"
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
                  label="Şifrə"
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
                      Güc: <span className="font-medium">{getStrengthText()}</span>
                    </p>
                  )}
                </div>
              )}

              <ul className="mt-2 space-y-1 text-xs text-text-muted">
                <li className={formData.password.length >= 8 ? "text-success" : ""}>
                  • Ən azı 8 simvol
                </li>
                <li className={/[A-Z]/.test(formData.password) ? "text-success" : ""}>
                  • Ən azı 1 böyük hərf
                </li>
                <li className={/\d/.test(formData.password) ? "text-success" : ""}>
                  • Ən azı 1 rəqəm
                </li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Şifrə təkrarı"
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
                    İstifadə şərtləri
                  </Link>{" "}
                  və{" "}
                  <Link
                    href="/privacy"
                    className="text-primary transition-colors hover:text-primary-hover"
                  >
                    Məxfilik siyasəti
                  </Link>
                  ni oxudum və qəbul edirəm
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
                  Qeydiyyat edilir...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Qeydiyyatdan keç
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-text-muted">
            Artıq hesabınız var?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Daxil olun
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
