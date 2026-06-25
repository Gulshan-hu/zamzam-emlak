'use client'

import { MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import dynamic from 'next/dynamic'

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

interface ListingMapProps {
  lat: number
  lng: number
  address: string
}

export function ListingMap({ lat, lng, address }: ListingMapProps) {
  const handleMapClick = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-text-primary">Yerləşmə</h2>
      </div>
      <p className="mb-4 text-sm text-text-muted">{address}</p>
      <div
        className="aspect-video w-full cursor-pointer overflow-hidden rounded-xl"
        onClick={handleMapClick}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>{address}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </Card>
  )
}
