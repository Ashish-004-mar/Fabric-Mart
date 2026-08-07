import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary from environment variables if present
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any[];
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  thumbnailUrl: string;
  galleryUrl: string;
  zoomUrl: string;
  width: number;
  height: number;
  format: string;
  fileSize: number;
}

/**
 * Uploads a file (buffer, local path, or remote URL) to Cloudinary or falls back to local CDN storage
 */
export async function uploadImage(
  source: string,
  folder: string = 'fabric-mart/fabrics',
  publicId?: string
): Promise<UploadResult> {
  const sanitizedFolder = folder.startsWith('fabric-mart') ? folder : `fabric-mart/${folder}`;

  if (isCloudinaryConfigured) {
    try {
      const res = await cloudinary.uploader.upload(source, {
        folder: sanitizedFolder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      const basePublicId = res.public_id;
      return {
        publicId: basePublicId,
        secureUrl: res.secure_url,
        thumbnailUrl: cloudinary.url(basePublicId, {
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' }
          ]
        }),
        galleryUrl: cloudinary.url(basePublicId, {
          transformation: [
            { width: 1200, height: 1200, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' }
          ]
        }),
        zoomUrl: cloudinary.url(basePublicId, {
          transformation: [
            { width: 2000, height: 2000, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
          ]
        }),
        width: res.width,
        height: res.height,
        format: res.format,
        fileSize: res.bytes,
      };
    } catch (err: any) {
      console.warn(`[Cloudinary Upload Warning] Cloudinary upload failed: ${err.message}. Falling back to local/direct URL strategy.`);
    }
  }

  // Fallback if Cloudinary is not configured or error occurs:
  // Generate optimized URLs with query params for responsive sizes
  const secureUrl = source;
  return {
    publicId: publicId || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    secureUrl: secureUrl,
    thumbnailUrl: secureUrl.includes('?') ? `${secureUrl}&w=400&h=400&fit=crop&q=80` : `${secureUrl}?w=400&h=400&fit=crop&q=80`,
    galleryUrl: secureUrl.includes('?') ? `${secureUrl}&w=1200&h=1200&fit=crop&q=80` : `${secureUrl}?w=1200&h=1200&fit=crop&q=80`,
    zoomUrl: secureUrl.includes('?') ? `${secureUrl}&w=2000&h=2000&fit=crop&q=90` : `${secureUrl}?w=2000&h=2000&fit=crop&q=90`,
    width: 1200,
    height: 1200,
    format: 'webp',
    fileSize: 150000,
  };
}

/**
 * Generate responsive Cloudinary or optimized CDN URLs dynamically
 */
export function buildResponsiveImageUrl(urlOrPublicId: string, width: number = 800, height: number = 800): string {
  if (!urlOrPublicId) return 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop&q=80';

  if (isCloudinaryConfigured && !urlOrPublicId.startsWith('http')) {
    return cloudinary.url(urlOrPublicId, {
      transformation: [
        { width, height, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  if (urlOrPublicId.includes('unsplash.com')) {
    const cleanUrl = urlOrPublicId.split('?')[0];
    return `${cleanUrl}?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
  }

  return urlOrPublicId;
}
