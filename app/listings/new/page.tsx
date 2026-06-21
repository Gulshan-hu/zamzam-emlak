import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CreateListingForm } from "@/components/listings/CreateListingForm";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

async function CreateListingContent() {
  const user = await getServerUser();

  if (!user) {
    redirect("/auth/login?redirect=/listings/new");
  }

  // Fetch user data from database to get role and agencyId
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      role: true,
      agencyId: true,
      isBlocked: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/login?redirect=/listings/new");
  }

  if (dbUser.isBlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Hesabınız bloklanıb
          </h1>
          <p className="mt-4 text-text-muted">
            Əlaqə üçün dəstək komandası ilə əlaqə saxlayın.
          </p>
        </div>
      </div>
    );
  }

  // Only ADMIN, AGENCY_OWNER, and AGENT can create listings
  if (dbUser.role === "USER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            İcazə yoxdur
          </h1>
          <p className="mt-4 text-text-muted">
            Elan yaratmaq üçün agentlik hesabı yaratmalısınız.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Yeni Elan Yarat
          </h1>
          <p className="mt-2 text-text-muted">
            Əmlak elanınızı yaratmaq üçün formu doldurun
          </p>
        </div>
        <CreateListingForm
          userId={dbUser.id}
          userRole={dbUser.role}
          agencyId={dbUser.agencyId}
        />
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <CreateListingContent />
    </Suspense>
  );
}
