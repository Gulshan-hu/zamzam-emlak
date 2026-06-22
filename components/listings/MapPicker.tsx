"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type MapPickerProps = {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
};

export function MapPicker({
  address,
  city,
  lat,
  lng,
  onLocationChange,
}: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const updateMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    const position = { lat, lng };

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        draggable: true,
      });

      markerRef.current.addListener("dragend", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onLocationChange(e.latLng.lat(), e.latLng.lng());
        }
      });
    }

    mapInstanceRef.current.panTo(position);
  }, [onLocationChange]);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

      if (!apiKey || typeof window === 'undefined') {
        return;
      }

      try {
        // Load Google Maps script dynamically
        if (!window.google?.maps) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!mapRef.current || mapInstanceRef.current) return;

        // Default center to Baku
        const defaultCenter = { lat: 40.4093, lng: 49.8671 };
        const center = lat && lng ? { lat, lng } : defaultCenter;

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add click listener
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            onLocationChange(newLat, newLng);
            updateMarker(newLat, newLng);
          }
        });

        mapInstanceRef.current = map;

        // Add marker if coordinates exist
        if (lat && lng) {
          updateMarker(lat, lng);
        }
      } catch (error) {
        // Map loading error - silent fail
      }
    };

    initMap();
  }, [lat, lng, onLocationChange, updateMarker]);

  const handleSearch = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

    if (!apiKey || typeof window === 'undefined' || !window.google?.maps) return;

    if (!searchQuery && !address && !city) return;

    const query = searchQuery || `${address}, ${city}`;

    try {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: query }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const newLat = location.lat();
          const newLng = location.lng();
          onLocationChange(newLat, newLng);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(15);
            updateMarker(newLat, newLng);
          }
        }
      });
    } catch (error) {
      // Geocoding error - silent fail
    }
  }, [searchQuery, address, city, onLocationChange, updateMarker]);

  const handleClear = () => {
    onLocationChange(null, null);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  const hasCoordinates = lat !== null && lng !== null;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

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
      {apiKey ? (
        <div
          ref={mapRef}
          className="h-96 cursor-crosshair overflow-hidden rounded-xl border border-border"
        />
      ) : (
        <div className="relative h-96 cursor-crosshair overflow-hidden rounded-xl border border-border bg-surface-muted">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto mb-3 h-12 w-12 text-primary" />
              <p className="text-sm font-medium text-text-primary">
                Google Maps API açarı konfiqurasiya edilməyib
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Xəritə funksionallığı üçün API açarı tələb olunur
              </p>
            </div>
          </div>
        </div>
      )}

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
