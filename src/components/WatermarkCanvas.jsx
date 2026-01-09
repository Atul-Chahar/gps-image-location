import React, { useRef, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';

const WatermarkCanvas = ({ uploadedImage, data, mapSnapshot }) => {
    // ... (existing refs and state) ...
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [downloadUrl, setDownloadUrl] = useState(null);

    // ... (existing loadImage function) ...
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn("Failed to load image:", src);
                resolve(null);
            };
            if (!src) reject(new Error("No source"));
            img.src = src;
        });
    };

    // ... (existing useEffect for rendering) ...
    useEffect(() => {
        if (!uploadedImage || !canvasRef.current) return;

        const renderCanvas = async () => {
            // ... (keep existing rendering logic exactly as is) ...
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Load Base Image
            const baseImg = await loadImage(uploadedImage);
            if (!baseImg) return;

            // Load Logo Image (Parallel)
            const logoImg = await loadImage('/logo.png');

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

            ctx.save();

            if (mapSnapshot) {
                try {
                    const mapImg = await loadImage(mapSnapshot);
                    if (mapImg) {
                        ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);
                    } else {
                        drawMapFallback(ctx, mapX, mapY, mapSize);
                    }
                } catch (e) {
                    drawMapFallback(ctx, mapX, mapY, mapSize);
                }
            } else {
                drawMapFallback(ctx, mapX, mapY, mapSize);
            }

            // Red Pin
            const pinX = mapX + mapSize / 2;
            const pinY = mapY + mapSize / 2;
            const pinSize = mapSize * 0.08;

            ctx.fillStyle = '#ea4335';
            ctx.beginPath();
            ctx.arc(pinX, pinY - pinSize / 2, pinSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(pinX - pinSize * 0.9, pinY - pinSize * 0.5);
            ctx.lineTo(pinX + pinSize * 0.9, pinY - pinSize * 0.5);
            ctx.lineTo(pinX, pinY + pinSize * 1.5);
            ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath(); ctx.arc(pinX, pinY - pinSize * 0.5, pinSize * 0.4, 0, Math.PI * 2); ctx.fill();

            // Google Logo
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
            ctx.save();
            const logoText = "GPS Map Camera";
            const fontSize = W * 0.025;
            ctx.font = `600 ${fontSize}px ${fontStack}`;
            const logoTextWidth = ctx.measureText(logoText).width;
            const iconSize = fontSize * 1.5;
            const paddingH = 8;
            const paddingV = 4;
            const badgeW = logoTextWidth + iconSize + (paddingH * 3);
            const badgeH = iconSize + (paddingV * 2);
            const badgeX = textBoxX + textBoxW - badgeW;
            const badgeY = textBoxY - badgeH + 5;
            ctx.fillStyle = overlayColor;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, [5, 5, 0, 0]);
            ctx.fill();
            if (logoImg) {
                ctx.drawImage(logoImg, badgeX + paddingH, badgeY + paddingV, iconSize, iconSize);
            }
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            const textY = badgeY + (badgeH / 2) + (fontSize * 0.35);
            ctx.fillText(logoText, badgeX + iconSize + (paddingH * 1.5), textY);
            ctx.restore();

            // Set Data URL for Web
            setDownloadUrl(canvas.toDataURL('image/jpeg', 0.9));
        };
        renderCanvas();
    }, [uploadedImage, data, mapSnapshot]);

    // ... (existing helper) ...
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

    const handleDownload = async () => {
        if (!downloadUrl) return;

        if (Capacitor.isNativePlatform()) {
            try {
                // Native Share Logic
                const base64Data = downloadUrl.split(',')[1];
                const fileName = `gps-watermark-${Date.now()}.jpg`;

                // Write to cache directory first
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                // Share directly
                await Share.share({
                    title: 'Share Watermarked Image',
                    text: 'Here is your watermarked photo',
                    url: savedFile.uri,
                    dialogTitle: 'Share with'
                });

            } catch (error) {
                console.error("Error sharing file", error);
                Toast.show({
                    text: 'Error saving/sharing image: ' + error.message,
                    duration: 'long'
                });
            }
        } else {
            // Web Logic
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
                    {Capacitor.isNativePlatform() ? "Share / Save Image" : "Download Image"}
                </button>
            )}
        </div>
    );
};

export default WatermarkCanvas;
