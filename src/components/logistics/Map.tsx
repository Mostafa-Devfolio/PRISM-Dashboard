'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Location {
  lat?: number;
  lng?: number;
  address?: string;
}

interface MapProps {
  start?: Location;
  end?: Location;
}

function MapBounds({ start, end }: { start?: Location; end?: Location }) {
  const map = useMap();
  useEffect(() => {
    if (start?.lat && start?.lng && end?.lat && end?.lng) {
      const bounds = L.latLngBounds(
        [start.lat, start.lng],
        [end.lat, end.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (start?.lat && start?.lng) {
      map.setView([start.lat, start.lng], 14);
    }
  }, [map, start, end]);
  return null;
}

export default function LogisticsMap({ start, end }: MapProps) {
  // Convert lat/lng to numbers just in case they come as strings
  const parseCoord = (coord: any) => typeof coord === 'string' ? parseFloat(coord) : coord;
  
  const startLat = parseCoord(start?.lat);
  const startLng = parseCoord(start?.lng);
  const endLat = parseCoord(end?.lat);
  const endLng = parseCoord(end?.lng);

  const hasStart = !!(startLat && startLng);
  const hasEnd = !!(endLat && endLng);

  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);

  useEffect(() => {
    async function fetchRoute() {
      if (!hasStart || !hasEnd) return;
      
      try {
        // OSRM expects coordinates in lng,lat format
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // OSRM returns GeoJSON coordinates as [lng, lat]
          // Leaflet Polyline expects [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRoutePositions(coords);
        } else {
          // Fallback to straight line if routing fails
          setRoutePositions([[startLat!, startLng!], [endLat!, endLng!]]);
        }
      } catch (error) {
        console.error('Failed to fetch route from OSRM', error);
        // Fallback to straight line
        setRoutePositions([[startLat!, startLng!], [endLat!, endLng!]]);
      }
    }
    
    fetchRoute();
  }, [hasStart, hasEnd, startLat, startLng, endLat, endLng]);

  const defaultCenter: [number, number] = hasStart ? [startLat!, startLng!] : [0, 0];

  if (!hasStart && !hasEnd) {
    return (
      <div className="w-full h-[300px] bg-muted flex items-center justify-center text-muted-foreground rounded-xl border border-border">
        No GPS coordinates available for this booking.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-border relative z-0">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Routing by OSRM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hasStart && (
          <Marker position={[startLat!, startLng!]} icon={redIcon}>
            <Popup>
              <strong>Pickup:</strong><br />
              {start?.address || 'Unknown Address'}
            </Popup>
          </Marker>
        )}

        {hasEnd && (
          <Marker position={[endLat!, endLng!]} icon={greenIcon}>
            <Popup>
              <strong>Dropoff:</strong><br />
              {end?.address || 'Unknown Address'}
            </Popup>
          </Marker>
        )}

        {routePositions.length > 0 && (
          <Polyline positions={routePositions} color="#3b82f6" weight={5} opacity={0.8} />
        )}
        
        <MapBounds start={{ lat: startLat, lng: startLng }} end={{ lat: endLat, lng: endLng }} />
      </MapContainer>
    </div>
  );
}
