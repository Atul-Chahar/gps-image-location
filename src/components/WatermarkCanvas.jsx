import React, { useRef, useEffect, useState } from 'react';

const WatermarkCanvas = ({ uploadedImage, data, mapSnapshot }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [downloadUrl, setDownloadUrl] = useState(null);

    // Helper to load image
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            if (!src) reject(new Error("No source"));
            img.src = src;
        });
    };

    useEffect(() => {
        if (!uploadedImage || !canvasRef.current) return;

        const renderCanvas = async () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const baseImg = await loadImage(uploadedImage);

            canvas.width = baseImg.width;
            canvas.height = baseImg.height;

            ctx.drawImage(baseImg, 0, 0);

            // --- Dimensions & Layout Config ---
            const W = canvas.width;
            const H = canvas.height;
            const padding = W * 0.03;

            // Updated Font Stack
            const fontStack = 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif';

            const titleSize = W * 0.045;
            const normalSize = W * 0.025;

            const textBoxHeight = titleSize + (normalSize * 4) + (padding * 1.5);
            const bottomMargin = H * 0.03;

            const mapSize = textBoxHeight * 1.0;
            const mapX = padding;
            const mapY = H - mapSize - bottomMargin;

            const textBoxX = mapX + mapSize + (padding * 0.5);
            const textBoxW = W - textBoxX - padding;
            const textBoxY = mapY;

            const overlayColor = 'rgba(0, 0, 0, 0.6)';

            // --- 1. Draw Map Square (Left) ---
            // No Border as requested

            ctx.save();

            // Draw Map Content
            if (mapSnapshot) {
                try {
                    const mapImg = await loadImage(mapSnapshot);
                    ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);
                } catch (e) {
                    drawMapFallback(ctx, mapX, mapY, mapSize);
                }
            } else {
                drawMapFallback(ctx, mapX, mapY, mapSize);
            }

            // Red Pin (Updated Style)
            const pinX = mapX + mapSize / 2;
            const pinY = mapY + mapSize / 2;
            const pinSize = mapSize * 0.08;

            ctx.fillStyle = '#ea4335'; // Google Red
            ctx.beginPath();
            ctx.arc(pinX, pinY - pinSize / 2, pinSize, 0, Math.PI * 2);
            ctx.fill();
            // Triangle bottom for pin
            ctx.beginPath();
            ctx.moveTo(pinX - pinSize * 0.9, pinY - pinSize * 0.5);
            ctx.lineTo(pinX + pinSize * 0.9, pinY - pinSize * 0.5);
            ctx.lineTo(pinX, pinY + pinSize * 1.5);
            ctx.fill();
            // Small black dot in middle
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath(); ctx.arc(pinX, pinY - pinSize * 0.5, pinSize * 0.4, 0, Math.PI * 2); ctx.fill();


            // Google Logo overlay
            ctx.fillStyle = 'white';
            ctx.font = `bold ${mapSize * 0.12}px ${fontStack}`;
            ctx.shadowColor = "black";
            ctx.shadowBlur = 3;
            ctx.fillText("Google", mapX + 5, mapY + mapSize - 5);
            ctx.shadowBlur = 0;
            ctx.restore();


            // --- 2. Draw Text Container (Right) ---
            ctx.save();
            ctx.fillStyle = overlayColor;

            // Radius 4px as requested
            const radius = 5;
            ctx.beginPath();
            ctx.roundRect(textBoxX, textBoxY, textBoxW, textBoxHeight, radius);
            ctx.fill();

            // --- 3. Text Content ---
            const textPadding = textBoxHeight * 0.15;
            let textCursorY = textBoxY + textPadding + (titleSize * 0.8);
            const textCursorX = textBoxX + textPadding;

            ctx.font = `600 ${titleSize}px ${fontStack}`;
            ctx.fillStyle = 'white';

            const titleText = data.addressTitle || "Location";
            ctx.fillText(titleText, textCursorX, textCursorY);

            const titleWidth = ctx.measureText(titleText).width;
            const flagX = textCursorX + titleWidth + 15;
            ctx.fillText("🇮🇳", flagX, textCursorY);

            textCursorY += titleSize * 0.5 + normalSize;
            ctx.font = `400 ${normalSize}px ${fontStack}`;
            ctx.fillStyle = '#ccc';
            ctx.fillText(data.addressLine1 || "", textCursorX, textCursorY);

            textCursorY += normalSize * 1.5;
            ctx.fillText(`Lat ${data.lat}   Long ${data.long}`, textCursorX, textCursorY);

            textCursorY += normalSize * 1.5;
            ctx.fillText(data.dateTime, textCursorX, textCursorY);

            ctx.restore();


            // --- 4. Draw "GPS Map Camera" Logo ---
            // Merged tab style
            ctx.save();

            const logoText = "GPS Map Camera";
            const fontSize = W * 0.025;
            ctx.font = `600 ${fontSize}px ${fontStack}`;
            const logoTextWidth = ctx.measureText(logoText).width;

            const iconSize = fontSize * 1.2;
            const paddingH = 8;
            const paddingV = 4;

            const badgeW = logoTextWidth + iconSize + (paddingH * 3);
            const badgeH = iconSize + (paddingV * 2);

            const badgeX = textBoxX + textBoxW - badgeW;
            const badgeY = textBoxY - badgeH + 5; // +5 to overlap/merge

            // Draw Background (Same color)
            ctx.fillStyle = overlayColor;
            ctx.beginPath();
            // Round top corners (radius 5), square bottom
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, [5, 5, 0, 0]);
            ctx.fill();

            // Icon
            const iconX = badgeX + paddingH;
            const iconY = badgeY + paddingV;

            // Blue Box for Icon
            ctx.fillStyle = '#2196F3'; // Material Blue
            ctx.beginPath();
            ctx.roundRect(iconX, iconY, iconSize, iconSize, 3);
            ctx.fill();

            // Camera Lens
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Yellow Flash dot? Reference implies small detail.
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(iconX + iconSize * 0.8, iconY + iconSize * 0.2, iconSize * 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.fillText(logoText, iconX + iconSize + paddingH, badgeY + badgeH - paddingV * 1.5);

            ctx.restore();

            setDownloadUrl(canvas.toDataURL('image/jpeg', 0.9));
        };

        renderCanvas();

    }, [uploadedImage, data, mapSnapshot]);

    const drawMapFallback = (ctx, x, y, size) => {
        const grad = ctx.createLinearGradient(x, y, x + size, y + size);
        grad.addColorStop(0, '#555');
        grad.addColorStop(1, '#333');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, size, size);

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.3, y); ctx.lineTo(x + size * 0.3, y + size);
        ctx.moveTo(x + size * 0.7, y); ctx.lineTo(x + size * 0.7, y + size);
        ctx.moveTo(x, y + size * 0.4); ctx.lineTo(x + size, y + size * 0.4);
        ctx.stroke();
    };

    const handleDownload = () => {
        if (downloadUrl) {
            const link = document.createElement('a');
            link.download = 'watermarked-image.jpg';
            link.href = downloadUrl;
            link.click();
        }
    };

    return (
        <div>
            <div
                ref={containerRef}
                style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#000'
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                />
            </div>
            {downloadUrl && (
                <button
                    onClick={handleDownload}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '1.2em',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    Download Image
                </button>
            )}
        </div>
    );
};

export default WatermarkCanvas;
