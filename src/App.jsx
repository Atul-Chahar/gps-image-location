import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import WatermarkCanvas from './components/WatermarkCanvas';
import ControlPanel from './components/ControlPanel';
import MapPicker from './components/MapPicker';
import html2canvas from 'html2canvas';
import './index.css';

function App() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [mapSnapshot, setMapSnapshot] = useState(null);

    // Default Data
    const [watermarkData, setWatermarkData] = useState({
        addressTitle: 'Agra, Uttar Pradesh, India',
        addressLine1: '3, Sainik Nagar, Agra, Uttar Pradesh 282001, India',
        lat: '27.13768',
        long: '78.016836',
        dateTime: 'Wednesday, 17/12/2025 09:38 AM GMT +05:30'
    });

    const captureMap = async () => {
        const element = document.getElementById('map-capture-container');
        if (element) {
            try {
                // Wait a bit for tiles to load if needed
                const canvas = await html2canvas(element, { useCORS: true });
                setMapSnapshot(canvas.toDataURL());
            } catch (e) {
                console.error("Map capture failed", e);
            }
        }
    };

    // Capture map initially and when location changes (debounced/delayed)
    useEffect(() => {
        const timer = setTimeout(() => {
            captureMap();
        }, 1000); // Wait for render/tiles
        return () => clearTimeout(timer);
    }, [watermarkData.lat, watermarkData.long]);


    const handleLocationSelect = (latlng) => {
        setWatermarkData(prev => ({
            ...prev,
            lat: latlng.lat.toFixed(5),
            long: latlng.lng.toFixed(5)
        }));
    };

    return (
        <div className="App">
            <h1>GPS Map Camera Watermark</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
                Upload an image to add the GPS watermark overlay.
            </p>

            {!uploadedImage && (
                <ImageUploader onImageUpload={setUploadedImage} />
            )}

            {uploadedImage && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 350px',
                    gap: '20px',
                    alignItems: 'start'
                }}>
                    <div style={{ minWidth: 0 }}> {/* prevent grid blowout */}
                        <WatermarkCanvas
                            uploadedImage={uploadedImage}
                            data={watermarkData}
                            mapSnapshot={mapSnapshot}
                        />

                        <button
                            onClick={() => setUploadedImage(null)}
                            style={{
                                marginTop: '10px',
                                backgroundColor: '#333',
                                fontSize: '0.9em'
                            }}
                        >
                            Upload New Image
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ backgroundColor: '#2a2a2a', padding: '10px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', textAlign: 'left', color: '#aaa' }}>Select Location</h4>
                            <MapPicker
                                location={{ lat: parseFloat(watermarkData.lat), lng: parseFloat(watermarkData.long) }}
                                onLocationSelect={handleLocationSelect}
                            />
                        </div>

                        <ControlPanel
                            data={watermarkData}
                            onChange={setWatermarkData}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
