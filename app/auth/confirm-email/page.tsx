"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleResendEmail = async () => {
    if (!email) {
      setResendError("Email ünvanı tapılmadı");
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setResendError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setResendError("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="space-y-6 p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t("confirmEmailTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {t("confirmEmailMessage")}
            </p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm font-medium text-text-primary">{email}</p>
            </div>
          )}

          {/* Success Message */}
          {resendSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{t("emailResent")}</span>
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {resendError}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login" className="block">
              <Button variant="primary" className="w-full">
                {t("goToLogin")}
              </Button>
            </Link>

            {email && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    {t("loading")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("resendEmail")}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Additional Info */}
          <p className="text-xs text-text-muted">
            {t("checkSpam")}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
