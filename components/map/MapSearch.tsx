'use client'

import { useEffect, useState } from 'react'
import { Search, List, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RadiusSelector } from '@/components/map/RadiusSelector'
import { ListingCard } from '@/components/listings/ListingCard'
import dynamic from 'next/dynamic'
import L from 'leaflet'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

interface MapListing {
  id: string
  slug: string
  title: string
  price: number
  lat: number
  lng: number
  city: string
  district: string | null
  type: string
  category: string
  imageUrl: string | null
}

const BAKU_CENTER: [number, number] = [40.4093, 49.8671]
const DEFAULT_ZOOM = 12

// Custom marker icons
const createIcon = (color: string) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

const greenIcon = createIcon('#10b981')
const blueIcon = createIcon('#3b82f6')

function MapEvents({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMapEvents } = require('react-leaflet');

  useMapEvents({
    click: (e: { latlng: { lat: number; lng: number } }) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function MapSearch() {
  const [searchPoint, setSearchPoint] = useState<[number, number] | null>(null)
  const [selectedRadius, setSelectedRadius] = useState(1000)
  const [listings, setListings] = useState<MapListing[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showListings, setShowListings] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Load all active listings by default
  useEffect(() => {
    const loadDefaultListings = async () => {
      try {
        const response = await fetch(
          `/api/map/listings?lat=${BAKU_CENTER[0]}&lng=${BAKU_CENTER[1]}&radius=50000`
        )
        const data = await response.json()
        if (data.listings) {
          setListings(data.listings)
        }
      } catch (error) {
        console.error('Failed to load listings:', error)
      }
    }
    loadDefaultListings()
  }, [])

  const handleMapClick = (lat: number, lng: number) => {
    setSearchPoint([lat, lng])
  }

  const handleSearch = async () => {
    if (!searchPoint) return

    setIsSearching(true)

    try {
      const response = await fetch(
        `/api/map/listings?lat=${searchPoint[0]}&lng=${searchPoint[1]}&radius=${selectedRadius}`
      )
      const data = await response.json()

      if (data.listings) {
        setListings(data.listings)
        setShowListings(true)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius)
  }

  return (
    <div className="relative flex h-screen">
      {/* Map */}
      <div className={`${showListings ? 'w-3/5' : 'w-full'} relative`}>
        <div className="h-full w-full">
          <MapContainer
            center={BAKU_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            whenReady={() => setMapReady(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapReady && <MapEvents onMapClick={handleMapClick} />}

            {/* Search point marker */}
            {searchPoint && (
              <>
                <Marker position={searchPoint} icon={blueIcon}>
                  <Popup>Axtarış nöqtəsi</Popup>
                </Marker>
                <Circle
                  center={searchPoint}
                  radius={selectedRadius}
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />
              </>
            )}

            {/* Listing markers */}
            {listings.map((listing) => (
              <Marker
                key={listing.id}
                position={[listing.lat, listing.lng]}
                icon={greenIcon}
              >
                <Popup>
                  <div className="space-y-2">
                    {listing.imageUrl && (
                      <div className="h-32 w-full overflow-hidden rounded-lg">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-sm font-semibold">{listing.title}</h3>
                    <p className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat('az-AZ').format(listing.price)} ₼
                    </p>
                    <a
                      href={`/listings/${listing.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-lg bg-primary px-3 py-1.5 text-center text-sm text-white hover:bg-primary-hover"
                    >
                      Ətraflı bax
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Control Panel */}
        <div className="absolute left-4 top-4 z-[1000] space-y-3 rounded-xl bg-surface p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <span className="font-semibold text-text-primary">Axtarış Radiusu</span>
          </div>
          <RadiusSelector selectedRadius={selectedRadius} onRadiusChange={handleRadiusChange} />
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={!searchPoint || isSearching}
            className="w-full"
          >
            {isSearching ? 'Axtarılır...' : 'Axtar'}
          </Button>
          {searchPoint && (
            <p className="text-xs text-text-muted">
              Xəritədə klikləyərək yeni nöqtə seçin
            </p>
          )}
        </div>

        {/* Mobile Listings Button */}
        {listings.length > 0 && (
          <button
            onClick={() => setShowListings(!showListings)}
            className="fixed bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-primary px-6 py-3 text-white shadow-lg md:hidden"
          >
            <List className="mr-2 inline h-5 w-5" />
            Siyahıya bax ({listings.length} elan)
          </button>
        )}
      </div>

      {/* Listings Panel */}
      {showListings && (
        <div className="w-2/5 overflow-y-auto border-l border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">
              Tapılan Elanlar ({listings.length})
            </h2>
            <button
              onClick={() => setShowListings(false)}
              className="rounded-lg p-2 hover:bg-surface-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {listings.map((listing) => {
              const listingCardData = {
                ...listing,
                slug: listing.slug,
                title: listing.title,
                description: '',
                price: listing.price,
                area: 0,
                rooms: null,
                floor: null,
                totalFloors: null,
                address: '',
                district: listing.district,
                city: listing.city,
                lat: listing.lat,
                lng: listing.lng,
                phone: null,
                email: null,
                type: listing.type as 'SALE' | 'RENT',
                category: listing.category as 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL',
                status: 'ACTIVE' as const,
                publishedAt: new Date(),
                rejectionReason: null,
                isFeatured: false,
                views: 0,
                userId: '',
                agencyId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                images: listing.imageUrl ? [{ id: '', listingId: listing.id, url: listing.imageUrl, order: 0 }] : [],
                agency: null,
              }
              return <ListingCard key={listing.id} listing={listingCardData} />
            })}
          </div>
        </div>
      )}
    </div>
  )
}
