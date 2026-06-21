"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { saveListingAction, unsaveListingAction, checkListingSavedAction } from "@/lib/actions/saved-listing.actions";
import { getCurrentUser } from "@/lib/auth";

type SaveListingButtonProps = {
  listingId: string;
};

export function SaveListingButton({ listingId }: SaveListingButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        // Check if listing is already saved
        const result = await checkListingSavedAction(user.id, listingId);
        if (result.success) {
          setIsSaved(result.data);
        }
      }
    }
    checkAuth();
  }, [listingId]);

  const handleToggleSave = async () => {
    if (!userId) {
      // Redirect to login if not authenticated
      window.location.href = `/auth/login?redirect=/listings/${listingId}`;
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        const result = await unsaveListingAction(userId, listingId);
        if (result.success) {
          setIsSaved(false);
        }
      } else {
        const result = await saveListingAction(userId, listingId);
        if (result.success) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
        isSaved
          ? "bg-primary text-white hover:bg-primary-hover"
          : "bg-white/90 text-text-primary hover:bg-white"
      } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      aria-label={isSaved ? "Remove from saved" : "Save listing"}
    >
      <Heart
        className={`h-6 w-6 transition-all ${
          isSaved ? "fill-current" : ""
        }`}
      />
    </button>
  );
}
