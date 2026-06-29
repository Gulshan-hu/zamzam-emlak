import Image from "next/image";
import Link from "next/link";
import { BedDouble, Square, Layers, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Listing, Agency, ListingImage } from "@/lib/types";

export type ListingCardData = Listing & {
  agency?: Agency | null;
  images: ListingImage[];
};

type ListingCardProps = {
  listing: ListingCardData;
};

export function ListingCard({ listing }: ListingCardProps) {
  const firstImage = listing.images[0];
  const imageUrl = firstImage?.url || "/placeholder-property.jpg";

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("az-AZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden rounded-xl">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Type Badge - Top Right */}
        <div className="absolute right-3 top-3">
          <Badge variant={listing.type === "SALE" ? "green" : "blue"}>
            {listing.type === "SALE" ? "Satış" : "Kirayə"}
          </Badge>
        </div>

        {/* Agency Badge - Bottom Left */}
        {listing.agency && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            {listing.agency.logo && (
              <Image
                src={listing.agency.logo}
                alt={listing.agency.name}
                width={16}
                height={16}
                className="rounded-full"
              />
            )}
            <span className="text-xs font-medium text-white">
              {listing.agency.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Price */}
        <div className="text-2xl font-bold text-primary">
          {formatPrice(listing.price)} ₼
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-lg font-semibold text-text-primary">
          {listing.title}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          {listing.rooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              <span>{listing.rooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{listing.area} m²</span>
          </div>
          {listing.floor && (
            <div className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span>
                {listing.floor}
                {listing.totalFloors && `/${listing.totalFloors}`}
              </span>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-text-muted">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{listing.address}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Link href={`/listings/${listing.slug}`} className="w-full">
            <Button variant="primary" className="w-full">
              Ətraflı bax
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
