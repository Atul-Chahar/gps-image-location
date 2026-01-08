import React from 'react';

const ControlPanel = ({ data, onChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    const inputStyle = {
        display: 'block',
        width: '100%',
        padding: '8px',
        margin: '8px 0',
        backgroundColor: '#333',
        border: '1px solid #555',
        color: 'white',
        borderRadius: '4px'
    };

    const labelStyle = {
        display: 'block',
        textAlign: 'left',
        marginTop: '10px',
        fontSize: '0.9em',
        color: '#aaa'
    };

    return (
        <div style={{ textAlign: 'left', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
            <h3>Watermark Details</h3>

            <label style={labelStyle}>Short Address (Title)</label>
            <input
                style={inputStyle}
                name="addressTitle"
                value={data.addressTitle}
                onChange={handleChange}
                placeholder="e.g. Agra, Uttar Pradesh, India"
            />

            <label style={labelStyle}>Full Address</label>
            <input
                style={inputStyle}
                name="addressLine1"
                value={data.addressLine1}
                onChange={handleChange}
                placeholder="Address Line 1"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                    <label style={labelStyle}>Latitude</label>
                    <input
                        style={inputStyle}
                        name="lat"
                        value={data.lat}
                        onChange={handleChange}
                        placeholder="Lat"
                    />
                </div>
                <div>
                    <label style={labelStyle}>Longitude</label>
                    <input
                        style={inputStyle}
                        name="long"
                        value={data.long}
                        onChange={handleChange}
                        placeholder="Long"
                    />
                </div>
            </div>

            <label style={labelStyle}>Date & Time String</label>
            <input
                style={inputStyle}
                name="dateTime"
                value={data.dateTime}
                onChange={handleChange}
                placeholder="e.g. Wednesday, 17/12/2025 09:38 AM GMT +05:30"
            />
        </div>
    );
};

export default ControlPanel;
