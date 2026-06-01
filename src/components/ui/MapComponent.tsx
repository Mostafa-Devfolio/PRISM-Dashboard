'use client';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, onChange }: any) {
  useMapEvents({
    click(e: any) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position && position.lat && position.lng ? <Marker position={[position.lat, position.lng]} icon={defaultIcon} /> : null;
}

export default function MapComponent({ position, onChange, label }: any) {
  // Center on position if exists, else Cairo
  const center = position && position.lat && position.lng ? [position.lat, position.lng] : [30.0444, 31.2357]; 

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="text-sm font-semibold">{label}</label>}
      <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border relative z-0">
        <MapContainer center={center as any} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onChange={onChange} />
        </MapContainer>
      </div>
      {position && position.lat && (
        <p className="text-xs text-muted-foreground mt-1 text-right">
          Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
