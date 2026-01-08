import React from 'react';
import { Upload } from 'lucide-react';

const ImageUploader = ({ onImageUpload }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onImageUpload(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
            position: 'relative'
        }}>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                    opacity: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                }}
            />
            <div style={{ pointerEvents: 'none' }}>
                <Upload size={48} color="#888" />
                <p>Click or drag image here to upload</p>
            </div>
        </div>
    );
};

export default ImageUploader;
