'use client';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>
});

export function LocationMap(props: any) {
  return <MapComponent {...props} />;
}
