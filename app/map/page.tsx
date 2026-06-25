'use client'

import dynamic from 'next/dynamic'

const MapSearch = dynamic(
  () => import('@/components/map/MapSearch').then((mod) => ({ default: mod.MapSearch })),
  { ssr: false }
)

export default function MapPage() {
  return <MapSearch />
}
