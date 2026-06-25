"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import L from "leaflet";

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

type MapPickerProps = {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
};

// Default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEvents({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  const { useMapEvents } = require('react-leaflet');

  useMapEvents({
    click: (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPicker({
  address,
  city,
  lat,
  lng,
  onLocationChange,
}: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    lat && lng ? [lat, lng] : [40.4093, 49.8671]
  );

  const handleMapClick = (clickLat: number, clickLng: number) => {
    setMarkerPosition([clickLat, clickLng]);
    onLocationChange(clickLat, clickLng);
  };

  const handleSearch = useCallback(async () => {
    const query = searchQuery || `${address}, ${city}`;
    if (!query) return;

    try {
      // Use Nominatim (OpenStreetMap) geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data && data[0]) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setMarkerPosition([newLat, newLng]);
        setMapCenter([newLat, newLng]);
        onLocationChange(newLat, newLng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, [searchQuery, address, city, onLocationChange]);

  const handleClear = () => {
    setMarkerPosition(null);
    onLocationChange(null, null);
  };

  const hasCoordinates = lat !== null && lng !== null;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Ünvanı axtarın..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button type="button" variant="secondary" onClick={handleSearch}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Map Container */}
      <div className="h-96 cursor-crosshair overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onMapClick={handleMapClick} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={defaultIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setMarkerPosition([position.lat, position.lng]);
                  onLocationChange(position.lat, position.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinates Display */}
      {hasCoordinates && (
        <div className="rounded-lg bg-surface-muted p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-text-primary">
                Seçilmiş məkan
              </p>
              <p className="text-xs text-text-muted">
                {address}, {city}
              </p>
              <p className="text-xs text-text-muted">
                Koordinatlar: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              Təmizlə
            </Button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-text-muted">
        Xəritədə klikləyin və ya markeri sürükləyin. Bu, alıcıların əmlakı daha asan
        tapmasına kömək edəcək.
      </p>
    </div>
  );
}
