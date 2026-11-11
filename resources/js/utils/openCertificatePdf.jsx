import React from 'react';
import { pdf } from '@react-pdf/renderer';
import KknCertificateDocument from '../components/pdf/KknCertificateDocument';

function convertUrlToPngDataUri(url) {
    return new Promise((resolve) => {
        if (!url) {
            resolve(null);
            return;
        }

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width || 128;
                canvas.height = img.naturalHeight || img.height || 128;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

async function resolveLogoPngDataUri(candidates) {
    const seen = new Set();
    for (const url of candidates) {
        if (!url || seen.has(url)) continue;
        seen.add(url);
        const pngDataUri = await convertUrlToPngDataUri(url);
        if (pngDataUri) return pngDataUri;
    }
    return null;
}

/**
 * Fetch certificate JSON from backend, render PDF in the browser with @react-pdf/renderer,
 * and open the generated PDF in a new tab.
 */
export async function openCertificatePdf({ endpoint, token, onError }) {
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
        pdfWindow.document.write(
            '<p style="font-family:sans-serif;padding:24px;color:#374151;">Menyiapkan sertifikat KKN...</p>'
        );
    }

    try {
        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Gagal memuat data sertifikat.');
        }

        const data = await response.json();
        const logoSrc = await resolveLogoPngDataUri([
            data.logo_url,
            data.fallback_logo_url || '/images/uim-logo.png',
        ]);

        const blob = await pdf(
            <KknCertificateDocument data={data} logoSrc={logoSrc} />
        ).toBlob();

        const blobUrl = window.URL.createObjectURL(blob);
        if (pdfWindow) {
            pdfWindow.location.replace(blobUrl);
        } else {
            window.open(blobUrl, '_blank');
        }
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
        if (pdfWindow) pdfWindow.close();
        const message = err?.message || 'Gagal membuka sertifikat.';
        if (onError) {
            onError(message);
        } else {
            alert(message);
        }
    }
}

