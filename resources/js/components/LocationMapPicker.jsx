import React, { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

// Default to Pamekasan, Madura (UIM location)
const INITIAL_VIEW_STATE = {
    longitude: 113.4746, // Pamekasan
    latitude: -7.1568,
    zoom: 12
};

export default function LocationMapPicker({ latitude, longitude, onLocationSelect }) {
    const [viewState, setViewState] = useState({
        longitude: longitude || INITIAL_VIEW_STATE.longitude,
        latitude: latitude || INITIAL_VIEW_STATE.latitude,
        zoom: longitude ? 13 : INITIAL_VIEW_STATE.zoom
    });

    const [marker, setMarker] = useState({
        latitude: latitude || null,
        longitude: longitude || null
    });

    const onMove = useCallback(evt => setViewState(evt.viewState), []);

    const handleClick = useCallback(evt => {
        const { lng, lat } = evt.lngLat;
        setMarker({ longitude: lng, latitude: lat });
        onLocationSelect({ latitude: lat, longitude: lng });
    }, [onLocationSelect]);

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border">
            {/* Note: Ensure VITE_MAPBOX_TOKEN is set in your .env file */}
            <Map
                {...viewState}
                onMove={onMove}
                onClick={handleClick}
                style={{width: '100%', height: '100%'}}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            >
                <NavigationControl />
                {marker.latitude && marker.longitude && (
                    <Marker longitude={marker.longitude} latitude={marker.latitude} anchor="bottom">
                        <MapPin size={32} className="text-red-600 fill-current" />
                    </Marker>
                )}
            </Map>
            {!import.meta.env.VITE_MAPBOX_TOKEN && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10 text-center p-4">
                    <p className="text-red-600 font-bold">Mapbox Token Missing</p>
                    <p className="text-sm text-gray-600">Please add VITE_MAPBOX_TOKEN to your .env file.</p>
                </div>
            )}
        </div>
    );
}
