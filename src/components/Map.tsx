'use client'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef, useState } from 'react'

// Mock data for bins
const MOCK_BINS = [
    { id: 1, name: "Green Warrior Bin", lng: 0, lat: 0, fillLevel: 45 },
    { id: 2, name: "Eco Fighter Station", lng: 0, lat: 0, fillLevel: 75 },
    { id: 3, name: "Recycling Point Alpha", lng: 0, lat: 0, fillLevel: 30 },
    { id: 4, name: "Street Cleaner Hub", lng: 0, lat: 0, fillLevel: 60 },
]


export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number]>([0, 0])

    useEffect(() => {
        if (!mapContainer.current || map.current) return
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

        // Initialize map
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [0, 0],
            zoom: 15
        })

        // Get user location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords
                setUserLocation([longitude, latitude])

                map.current?.flyTo({
                    center: [longitude, latitude],
                })

                // Add user marker
                new mapboxgl.Marker({ color: '#39ff14' })
                    .setLngLat([longitude, latitude])
                    .addTo(map.current!)

                // Add bins around user location
                MOCK_BINS.forEach((bin, i) => {
                    // Distribute bins in a circle around user
                    const angle = (i / MOCK_BINS.length) * Math.PI * 2
                    const radius = 0.002 // About 200m
                    const binLng = longitude + radius * Math.cos(angle)
                    const binLat = latitude + radius * Math.sin(angle)

                    // Create popup
                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`
              <div class="text-sm">
                <strong>${bin.name}</strong><br/>
                Fill Level: ${bin.fillLevel}%
              </div>
            `)

                    // Add bin marker
                    new mapboxgl.Marker({ color: '#00ffff' })
                        .setLngLat([binLng, binLat])
                        .setPopup(popup)
                        .addTo(map.current!)
                })
            },
            (error) => console.error('Error getting location:', error)
        )

        return () => map.current?.remove()
    }, [])

    return (
        <div ref={mapContainer} className="w-full h-[60vh] bg-slate-900" />
    )
}