import { getProductsWithJoins, insertFabricImageDb, db, initDatabase } from '../src/db/sqliteDb';
import { searchFabricMediaPipeline } from '../server/src/imageProvider';
import { uploadImage, isCloudinaryConfigured } from '../server/src/cloudinaryService';

export async function runFabricImageImportPipeline(targetProductId?: string) {
  initDatabase();
  console.log('====================================================');
  console.log('FABRIC MART - AUTOMATED PRODUCTION IMAGE PIPELINE');
  console.log('====================================================');
  console.log(`Cloudinary CDN Status: ${isCloudinaryConfigured ? 'CONNECTED (Production Mode)' : 'LOCAL CDN FALLBACK MODE'}`);

  let products = getProductsWithJoins();
  if (targetProductId) {
    products = products.filter(p => p.id === targetProductId || p.slug === targetProductId);
  }

  console.log(`Processing ${products.length} fabric products...\n`);

  let successCount = 0;
  let totalImagesProcessed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] Processing "${p.name}" (SKU: ${p.sku})`);

    const fabricCategory = p.categoryName || 'Cotton';
    const folder = `fabric-mart/fabrics/${fabricCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    try {
      // Fetch 4 distinct image angles from Unsplash / Pexels / Pixabay or curated textile stream
      const mediaUrls = await searchFabricMediaPipeline(fabricCategory, p.name, p.composition);

      const imageAngles = [
        { key: 'primary', url: mediaUrls.primary, isPrimary: true, sortOrder: 1, label: 'Primary Square Product Shot' },
        { key: 'folded', url: mediaUrls.folded, isPrimary: false, sortOrder: 2, label: 'Folded Fabric View' },
        { key: 'macro', url: mediaUrls.macro, isPrimary: false, sortOrder: 3, label: 'Macro Texture Close-Up' },
        { key: 'drape', url: mediaUrls.drape, isPrimary: false, sortOrder: 4, label: 'Fabric Drape & Application View' },
      ];

      // Clear existing old images for this product before re-importing
      db.prepare(`DELETE FROM fabric_images WHERE fabric_id = ?`).run(p.id);

      const importedImageUrls: string[] = [];

      for (const angle of imageAngles) {
        const publicId = `${p.sku.toLowerCase()}-${angle.key}-${Date.now()}`;
        const uploadRes = await uploadImage(angle.url, folder, publicId);

        const altText = `${p.name} (${p.composition}, ${p.gsm} GSM) - ${angle.label}`;

        insertFabricImageDb({
          fabricId: p.id,
          cloudinaryPublicId: uploadRes.publicId,
          secureUrl: uploadRes.secureUrl,
          thumbnailUrl: uploadRes.thumbnailUrl,
          galleryUrl: uploadRes.galleryUrl,
          zoomUrl: uploadRes.zoomUrl,
          altText,
          sortOrder: angle.sortOrder,
          isPrimary: angle.isPrimary,
          width: uploadRes.width,
          height: uploadRes.height,
          format: uploadRes.format,
          fileSize: uploadRes.fileSize,
        });

        importedImageUrls.push(uploadRes.secureUrl);
        totalImagesProcessed++;
      }

      // Update products table images JSON
      db.prepare(`UPDATE products SET images = ? WHERE id = ?`).run(
        JSON.stringify(importedImageUrls),
        p.id
      );

      console.log(`  ✓ Successfully imported 4 multi-size WebP images for "${p.name}"`);
      successCount++;
    } catch (err: any) {
      console.error(`  ✗ Error processing product "${p.name}": ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`IMAGE PIPELINE COMPLETE!`);
  console.log(`Products Processed: ${successCount}/${products.length}`);
  console.log(`Total Optimized Images Stored: ${totalImagesProcessed}`);
  console.log('====================================================\n');

  return {
    success: true,
    processedProducts: successCount,
    totalImages: totalImagesProcessed,
  };
}

// Allow CLI execution if called directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('importFabricImages.ts')) {
  runFabricImageImportPipeline().catch(console.error);
}
