"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";

type MapViewProps = {
  lat: number;
  lng: number;
  address: string;
};

export function MapView({ lat, lng, address }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

      if (!apiKey || typeof window === 'undefined') {
        return;
      }

      try {
        if (!window.google?.maps) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
          script.async = true;
          script.defer = true;

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!mapRef.current || mapInstanceRef.current) return;

        const position = { lat, lng };

        const map = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        new google.maps.Marker({
          position,
          map,
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };

    initMap();
  }, [lat, lng, address]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-text-primary">Yerləşmə</h2>
      </div>

      <p className="mb-4 text-sm text-text-muted">{address}</p>

      {apiKey ? (
        <div
          ref={mapRef}
          className="aspect-video w-full overflow-hidden rounded-xl"
        />
      ) : (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-muted">
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MapPin className="mx-auto mb-2 h-8 w-8 text-text-muted" />
              <p className="text-sm text-text-muted">
                Google Maps API açarı konfiqurasiya edilməyib
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Koordinatlar: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
