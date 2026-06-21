import { Suspense } from "react";
import { getListingsAction } from "@/lib/actions/listing.actions";
import { ListingCard, ListingCardData } from "@/components/listings/ListingCard";
import { ListingsFilters } from "@/components/listings/ListingsFilters";
import { ListingsPagination } from "@/components/listings/ListingsPagination";
import { ListingsSort } from "@/components/listings/ListingsSort";
import { ActiveFilters } from "@/components/listings/ActiveFilters";
import { ListingsLoading } from "@/components/listings/ListingsLoading";
import { ListingsHeader, NoListingsMessage, ErrorMessage } from "@/components/listings/ListingsTranslated";

type SearchParams = {
  page?: string;
  type?: string;
  category?: string;
  city?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  rooms?: string;
  sortBy?: string;
  sortOrder?: string;
};

type ListingsPageProps = {
  searchParams: SearchParams;
};

async function ListingsContent({ searchParams }: ListingsPageProps) {
  const page = parseInt(searchParams.page || "1");
  const filters = {
    status: "ACTIVE" as const,
    type: searchParams.type as "SALE" | "RENT" | undefined,
    category: searchParams.category as
      | "APARTMENT"
      | "HOUSE"
      | "LAND"
      | "COMMERCIAL"
      | undefined,
    city: searchParams.city,
    district: searchParams.district,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    minArea: searchParams.minArea ? parseFloat(searchParams.minArea) : undefined,
    maxArea: searchParams.maxArea ? parseFloat(searchParams.maxArea) : undefined,
    rooms: searchParams.rooms ? parseInt(searchParams.rooms) : undefined,
  };

  const sortBy = (searchParams.sortBy || "createdAt") as
    | "createdAt"
    | "price"
    | "area"
    | "views"
    | "publishedAt";
  const sortOrder = (searchParams.sortOrder || "desc") as "asc" | "desc";

  const result = await getListingsAction(filters, { page, limit: 12 });

  if (!result.success) {
    return <ErrorMessage error={result.error} />;
  }

  const listings = result.data.data;
  const meta = result.data.meta;

  return (
    <div className="container mx-auto px-4 py-8">
      <ListingsHeader total={meta.total} />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-80">
          <ListingsFilters />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters & Sort */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ActiveFilters filters={filters} />
            <ListingsSort sortBy={sortBy} sortOrder={sortOrder} />
          </div>

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <NoListingsMessage />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing as ListingCardData} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-8">
                  <ListingsPagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage({ searchParams }: ListingsPageProps) {
  return (
    <Suspense fallback={<ListingsLoading />}>
      <ListingsContent searchParams={searchParams} />
    </Suspense>
  );
}
