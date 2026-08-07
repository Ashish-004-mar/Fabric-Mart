import { Category, Product } from '../types';

// Curated Pexels search keywords for textile categories & subcategories
export const TEXTILE_CATEGORY_KEYWORDS: Record<string, string> = {
  'cat-silk': 'luxury silk fabric texture drape weave shine',
  'cat-cotton': 'organic cotton woven fabric texture macro',
  'cat-linen': 'natural linen fabric texture weave background',
  'cat-wool': 'merino wool fabric texture woven knit',
  'cat-denim': 'indigo selvedge denim fabric weave texture',
  'cat-rayon': 'viscose rayon modal fabric texture drape',
  'cat-synthetic': 'technical polyester performance fabric texture',
  'cat-satin': 'glossy satin silk fabric luxury drape',
  'cat-velvet': 'plush velvet fabric texture macro',
  'cat-chiffon': 'sheer chiffon fabric weave sheer',
  'cat-canvas': 'heavy cotton duck canvas fabric texture',
  'cat-lace': 'delicate lace fabric embroidery pattern',
  'cat-jacquard': 'intricate brocade jacquard pattern textile',
};

export interface SyncImageResult {
  categoryId: string;
  categoryName: string;
  pexelPhotoId?: number;
  originalUrl: string;
  cloudinaryUrl: string;
  status: 'synced' | 'fallback' | 'failed';
}

/**
 * Fetches high-quality textile images from Pexels API based on search keywords
 */
export async function fetchPexelsTextileImages(query: string, count: number = 5): Promise<Array<{ id: number; url: string; photographer: string }>> {
  const viteEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const apiKey = process.env.PEXELS_API_KEY || viteEnv.VITE_PEXELS_API_KEY;

  if (!apiKey) {
    console.warn('[TextileImageService] PEXELS_API_KEY not found. Returning curated fallback textile image set.');
    return [
      {
        id: 101,
        url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop',
        photographer: 'Curated Textile Studio',
      },
      {
        id: 102,
        url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop',
        photographer: 'Textile Artisan',
      },
      {
        id: 103,
        url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop',
        photographer: 'Silk & Thread',
      },
    ];
  }

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.photos || []).map((photo: any) => ({
      id: photo.id,
      url: photo.src?.large2x || photo.src?.large || photo.src?.original,
      photographer: photo.photographer,
    }));
  } catch (err) {
    console.error('[TextileImageService] Failed to fetch from Pexels API:', err);
    return [];
  }
}

/**
 * Optimizes & uploads a textile image URL to Cloudinary
 */
export async function uploadImageToCloudinary(imageUrl: string, folder = 'fabric_mart_catalog'): Promise<string> {
  const viteEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || viteEnv.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || viteEnv.VITE_CLOUDINARY_API_KEY;

  if (!cloudName) {
    // Return Cloudinary auto-format optimized CDN proxy format or direct high-res URL
    if (imageUrl.includes('cloudinary.com')) return imageUrl;
    return imageUrl;
  }

  try {
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Cloudinary upload failed: ${uploadRes.statusText}`);
    }

    const uploadData = await uploadRes.json();
    // Return Cloudinary optimized URL with auto-format and auto-quality transformations
    return uploadData.secure_url?.replace('/upload/', '/upload/f_auto,q_auto,w_1200/') || uploadData.secure_url;
  } catch (err) {
    console.warn('[TextileImageService] Cloudinary upload error, using direct source URL:', err);
    return imageUrl;
  }
}

/**
 * Comprehensive service method: Syncs textile images across catalog categories and updates database
 */
export async function syncTextileCatalogImages(
  categories: Category[],
  products: Product[],
  onUpdateDb?: (type: 'category' | 'product', id: string, newImageUrl: string) => Promise<void>
): Promise<SyncImageResult[]> {
  const results: SyncImageResult[] = [];

  for (const cat of categories) {
    const keyword = TEXTILE_CATEGORY_KEYWORDS[cat.id] || `${cat.name} fabric textile woven texture`;
    const pexelsPhotos = await fetchPexelsTextileImages(keyword, 3);

    if (pexelsPhotos.length > 0) {
      const selectedPhoto = pexelsPhotos[0];
      const cloudinaryUrl = await uploadImageToCloudinary(selectedPhoto.url, `categories/${cat.slug}`);

      results.push({
        categoryId: cat.id,
        categoryName: cat.name,
        pexelPhotoId: selectedPhoto.id,
        originalUrl: selectedPhoto.url,
        cloudinaryUrl: cloudinaryUrl,
        status: 'synced',
      });

      if (onUpdateDb) {
        await onUpdateDb('category', cat.id, cloudinaryUrl);
      }
    } else {
      results.push({
        categoryId: cat.id,
        categoryName: cat.name,
        originalUrl: cat.image,
        cloudinaryUrl: cat.image,
        status: 'fallback',
      });
    }
  }

  return results;
}
