import { HomeClient } from "@/components/home/HomeClient";
import { prisma } from "@/lib/prisma";
import type { Listing, Agency, ListingImage } from "@/lib/types";

async function getLatestListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { order: "asc" } },
        agency: true,
      },
    });
    return listings;
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getLatestListings();
  return <HomeClient listings={listings as Array<Listing & { agency?: Agency | null; images: ListingImage[] }> } />;
}
