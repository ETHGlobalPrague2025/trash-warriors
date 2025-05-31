'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

interface Location {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface SelectLocationMapProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: { lat: number; lng: number };
    readOnly?: boolean;
}

export default function SelectLocationMap({ 
    onLocationSelect, 
    initialLocation,
    readOnly = false 
}: SelectLocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const initializeMap = (longitude: number, latitude: number) => {
            mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [longitude, latitude],
                zoom: 15,
                interactive: !readOnly
            });

            // Add controls if not readonly
            if (!readOnly) {
                map.current.addControl(new mapboxgl.NavigationControl());
                map.current.addControl(new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true
                }));
            }

            map.current.on('load', () => {
                marker.current = new mapboxgl.Marker({
                    color: '#00ff00',
                    draggable: !readOnly
                })
                    .setLngLat([longitude, latitude])
                    .addTo(map.current!);

                // Initial location update
                updateLocation(longitude, latitude);

                // Add handlers only if not readonly
                if (!readOnly) {
                    // Update location on marker drag
                    marker.current.on('dragend', () => {
                        const lngLat = marker.current!.getLngLat();
                        updateLocation(lngLat.lng, lngLat.lat);
                    });

                    // Add click handler to map
                    map.current!.on('click', (e) => {
                        const { lng, lat } = e.lngLat;
                        marker.current?.setLngLat([lng, lat]);
                        updateLocation(lng, lat);
                    });
                }

                setIsLoading(false);
            });
        };

        // Use initial location if provided, otherwise get user location
        if (initialLocation) {
            initializeMap(initialLocation.lng, initialLocation.lat);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    initializeMap(longitude, latitude);
                },
                () => {
                    // Fallback to NYC if geolocation fails
                    initializeMap(-74.006, 40.7128);
                }
            );
        }

        return () => {
            marker.current?.remove();
            map.current?.remove();
        };
    }, [onLocationSelect, initialLocation, readOnly]);

    const updateLocation = async (lng: number, lat: number) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();
            const address = data.features[0]?.place_name || 'Unknown location';

            onLocationSelect({
                address,
                coordinates: { lat, lng }
            });
        } catch (error) {
            console.error('Error getting address:', error);
        }
    };

    return (
        <div className="relative">
            <div ref={mapContainer} className="w-full h-[200px] bg-slate-900 rounded" />
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                    <div className="text-green-400 text-sm">Loading map...</div>
                </div>
            ) : !readOnly && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-xs text-green-400 p-2 rounded backdrop-blur-sm">
                    Click on map or drag marker to select location
                </div>
            )}
        </div>
    );
} 