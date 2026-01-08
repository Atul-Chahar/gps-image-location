import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons not loading correctly in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Helper to update map view when props change
function MapUpdater({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
}

const MapPicker = ({ location, onLocationSelect }) => {
    // Default to Agra if no location
    const defaultCenter = location ? location : { lat: 27.13768, lng: 78.016836 };
    const [position, setPosition] = useState(defaultCenter);

    useEffect(() => {
        // Update internal state if prop changes (external edit)
        if (location) {
            setPosition(location);
        }
    }, [location.lat, location.lng]);

    const handleSetPosition = (latlng) => {
        setPosition(latlng);
        onLocationSelect(latlng);
    };

    return (
        <div id="map-capture-container" style={{ height: '300px', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={15}
                scrollWheelZoom={true}
                zoomControl={false}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} />
                <MapUpdater center={location} />
            </MapContainer>
        </div>
    );
};

export default MapPicker;
