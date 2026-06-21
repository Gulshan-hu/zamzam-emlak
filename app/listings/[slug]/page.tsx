import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getListingBySlugAction } from "@/lib/actions/listing.actions";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ListingDetails } from "@/components/listings/ListingDetails";
import { ContactCard } from "@/components/listings/ContactCard";
import { SellerCard } from "@/components/listings/SellerCard";
import { MapView } from "@/components/listings/MapView";
import { AIAnalysisSection } from "@/components/listings/AIAnalysisSection";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { Badge } from "@/components/ui/Badge";
import type { Listing, ListingImage, User, Agency } from "@/lib/types";

type ListingWithRelations = Listing & {
  images: ListingImage[];
  user: User;
  agency: Agency | null;
};

type ListingDetailPageProps = {
  params: {
    slug: string;
  };
};

async function ListingContent({ slug }: { slug: string }) {
  const result = await getListingBySlugAction(slug);

  if (!result.success) {
    notFound();
  }

  const listing = result.data as ListingWithRelations;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <ImageGallery images={listing.images} title={listing.title} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Title and Price */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant={listing.type === "SALE" ? "green" : "blue"}>
                  {listing.type === "SALE" ? "Satış" : "Kirayə"}
                </Badge>
                {listing.isFeatured && (
                  <Badge variant="yellow">Premium</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-text-primary">
                {listing.title}
              </h1>
              <div className="mt-4 text-4xl font-bold text-primary">
                {new Intl.NumberFormat("az-AZ").format(listing.price)} ₼
              </div>
            </div>

            {/* Listing Details */}
            <ListingDetails listing={listing} />

            {/* Description */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                Təsvir
              </h2>
              <p className="whitespace-pre-line text-text-muted">
                {listing.description}
              </p>
            </div>

            {/* Map */}
            {listing.lat && listing.lng && (
              <MapView lat={listing.lat} lng={listing.lng} address={listing.address} />
            )}

            {/* AI Analysis */}
            <AIAnalysisSection listingId={listing.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-end">
              <SaveListingButton listingId={listing.id} />
            </div>

            {/* Contact Card */}
            <ContactCard
              phone={listing.phone}
              email={listing.email}
              listingTitle={listing.title}
            />

            {/* Seller Card */}
            <SellerCard user={listing.user} agency={listing.agency} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <ListingContent slug={params.slug} />
    </Suspense>
  );
}
