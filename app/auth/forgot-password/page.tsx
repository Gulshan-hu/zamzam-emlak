"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { resetPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Düzgün email ünvanı daxil edin");
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(email);

      if (!result.success) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError("Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <div className="space-y-6 p-6 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Mail className="h-8 w-8 text-success" />
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Email göndərildi
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                Şifrə sıfırlama linki <strong>{email}</strong> ünvanına
                göndərildi. Zəhmət olmasa email qutunuzu yoxlayın.
              </p>
            </div>

            {/* Back to Login */}
            <Link href="/auth/login">
              <Button variant="primary" className="w-full">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Daxil olmaya qayıt
              </Button>
            </Link>

            <p className="text-xs text-text-muted">
              Email gəlmədimi?{" "}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary transition-colors hover:text-primary-hover"
              >
                Yenidən göndər
              </button>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              Şifrəni unutmusunuz?
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Email ünvanınızı daxil edin və sizə şifrə sıfırlama linki
              göndərəcəyik
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              type="email"
              label="Email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

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
                  Göndərilir...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Sıfırlama linki göndər
                </>
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Daxil olmaya qayıt
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
