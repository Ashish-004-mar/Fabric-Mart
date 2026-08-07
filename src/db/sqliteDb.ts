import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { INITIAL_USERS, INITIAL_SUPPLIERS, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';
import { FABRIC_TAXONOMY } from '../data/taxonomyData';
import { Product, SupplierProfile, Category, Subcategory, Order, User, CartItem, UserRole, FabricImage } from '../types';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'fabric_mart.db');
export const db = new Database(DB_PATH);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'password123',
      role TEXT NOT NULL CHECK(role IN ('BUYER', 'SUPPLIER', 'ADMIN')),
      company_name TEXT,
      avatar TEXT,
      phone TEXT,
      is_onboarded INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo TEXT,
      banner_image TEXT,
      description TEXT,
      contact_person TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT NOT NULL,
      gst_tax_id TEXT,
      operating_hours TEXT,
      moq_default INTEGER DEFAULT 50,
      certifications TEXT,
      fabric_specialties TEXT,
      is_verified INTEGER DEFAULT 1,
      status TEXT DEFAULT 'VERIFIED',
      rating REAL DEFAULT 4.8,
      total_products_count INTEGER DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      rating_breakdown TEXT,
      reliability_metrics TEXT,
      recent_reviews TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      main_family TEXT,
      description TEXT,
      image TEXT,
      fabric_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ENABLED',
      sort_order INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      category_name TEXT,
      main_family TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      characteristics TEXT,
      common_applications TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      subcategory_id TEXT,
      subcategory_name TEXT,
      main_family TEXT,
      supplier_id TEXT NOT NULL REFERENCES suppliers(user_id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      composition TEXT NOT NULL,
      fiber_origin TEXT,
      weave_type TEXT,
      texture TEXT,
      gsm INTEGER NOT NULL,
      width_cm INTEGER NOT NULL DEFAULT 150,
      colors TEXT NOT NULL,
      moq INTEGER NOT NULL DEFAULT 50,
      price_per_meter REAL NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 1000,
      availability_status TEXT DEFAULT 'IN_STOCK',
      tags TEXT,
      application_tags TEXT,
      images TEXT NOT NULL,
      certifications TEXT,
      care_instructions TEXT,
      sustainability_notes TEXT,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 0,
      eco_score TEXT DEFAULT 'A+',
      breathable INTEGER DEFAULT 1,
      moisture_wicking INTEGER DEFAULT 0,
      stretchable INTEGER DEFAULT 0,
      wrinkle_resistant INTEGER DEFAULT 0,
      eco_friendly INTEGER DEFAULT 0,
      hypoallergenic INTEGER DEFAULT 0,
      durability_rating INTEGER DEFAULT 4,
      softness_rating INTEGER DEFAULT 4,
      is_approved INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity_meters INTEGER NOT NULL DEFAULT 50,
      selected_color TEXT,
      unit_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shipping_address TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_estimate REAL NOT NULL,
      tax_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      status TEXT NOT NULL,
      rejection_reason TEXT,
      status_history TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS buyer_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      business_type TEXT,
      industry TEXT,
      preferred_categories TEXT,
      preferred_fabrics TEXT,
      typical_order_quantity TEXT,
      budget_range TEXT,
      sustainability_focus INTEGER DEFAULT 1,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target_audience TEXT NOT NULL DEFAULT 'ALL',
      sent_by TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_count INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'normal'
    );

    CREATE TABLE IF NOT EXISTS ai_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_logs (
      id TEXT PRIMARY KEY,
      user_query TEXT NOT NULL,
      user_role TEXT DEFAULT 'GUEST',
      ai_response TEXT NOT NULL,
      suggested_count INTEGER DEFAULT 0,
      execution_time_ms INTEGER DEFAULT 120,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      user_email TEXT,
      status TEXT DEFAULT 'info',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_management (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      ai_type TEXT NOT NULL CHECK(ai_type IN ('ASSISTANT', 'VOICE_AGENT')),
      role_context TEXT,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS voice_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      transcript TEXT NOT NULL,
      response_text TEXT NOT NULL,
      audio_duration REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fabric_images (
      id TEXT PRIMARY KEY,
      fabric_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      cloudinary_public_id TEXT,
      secure_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      gallery_url TEXT NOT NULL,
      zoom_url TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      sort_order INTEGER DEFAULT 1,
      is_primary INTEGER DEFAULT 0,
      width INTEGER DEFAULT 1200,
      height INTEGER DEFAULT 1200,
      format TEXT DEFAULT 'webp',
      file_size INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safely add missing columns for existing sqlite DB instances
  try { db.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE';`); } catch (e) {}
  try { db.exec(`ALTER TABLE suppliers ADD COLUMN status TEXT DEFAULT 'VERIFIED';`); } catch (e) {}
  try { db.exec(`ALTER TABLE categories ADD COLUMN status TEXT DEFAULT 'ENABLED';`); } catch (e) {}
  try { db.exec(`ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 1;`); } catch (e) {}
  try { db.exec(`ALTER TABLE categories ADD COLUMN main_family TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN subcategory_id TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN subcategory_name TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN main_family TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN fiber_origin TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN weave_type TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN texture TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN short_description TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN sustainability_notes TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN application_tags TEXT;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN breathable INTEGER DEFAULT 1;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN moisture_wicking INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN stretchable INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN wrinkle_resistant INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN eco_friendly INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN hypoallergenic INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN durability_rating INTEGER DEFAULT 4;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN softness_rating INTEGER DEFAULT 4;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN is_approved INTEGER DEFAULT 1;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0;`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN is_trending INTEGER DEFAULT 0;`); } catch (e) {}

  ensureAdminUserExists();
  seedDataIfEmpty();
  syncCatalogAndTaxonomy();
  seedDefaultAdminSettings();
}

function syncCatalogAndTaxonomy() {
  try {
    const validCategoryIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));
    const validProductIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));

    const catCount = (db.prepare(`SELECT count(*) as count FROM categories`).get() as any)?.count || 0;
    const subCount = (db.prepare(`SELECT count(*) as count FROM subcategories`).get() as any)?.count || 0;
    const prodCount = (db.prepare(`SELECT count(*) as count FROM products`).get() as any)?.count || 0;

    // If counts match and no legacy records exist, skip
    if (subCount > 0 && catCount === INITIAL_CATEGORIES.length && prodCount === INITIAL_PRODUCTS.length) {
      return;
    }

    console.log('Syncing comprehensive fabric taxonomy and catalog products into SQLite DB...');

    db.pragma('foreign_keys = OFF');

    try {
      // Delete legacy products first, then subcategories and categories
      const existingProds = db.prepare(`SELECT id FROM products`).all() as any[];
      for (const prod of existingProds) {
        if (!validProductIds.has(prod.id)) {
          try { db.prepare(`DELETE FROM products WHERE id = ?`).run(prod.id); } catch (e) {}
        }
      }

      const existingCats = db.prepare(`SELECT id FROM categories`).all() as any[];
      for (const cat of existingCats) {
        if (!validCategoryIds.has(cat.id)) {
          try { db.prepare(`DELETE FROM categories WHERE id = ?`).run(cat.id); } catch (e) {}
        }
      }

      try { db.prepare(`DELETE FROM subcategories`).run(); } catch (e) {}

      const insertCategory = db.prepare(`
        INSERT INTO categories (id, name, slug, main_family, description, image, fabric_count)
        VALUES (@id, @name, @slug, @mainFamily, @description, @image, @fabricCount)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          main_family = excluded.main_family,
          description = excluded.description,
          image = excluded.image,
          fabric_count = excluded.fabric_count
      `);

      const insertSubcategory = db.prepare(`
        INSERT INTO subcategories (id, category_id, category_name, main_family, name, slug, description, characteristics, common_applications)
        VALUES (@id, @categoryId, @categoryName, @mainFamily, @name, @slug, @description, @characteristics, @commonApplications)
        ON CONFLICT(id) DO UPDATE SET
          category_id = excluded.category_id,
          category_name = excluded.category_name,
          main_family = excluded.main_family,
          name = excluded.name,
          slug = excluded.slug,
          description = excluded.description,
          characteristics = excluded.characteristics,
          common_applications = excluded.common_applications
      `);

      const insertProduct = db.prepare(`
        INSERT INTO products (
          id, name, slug, category_id, subcategory_id, subcategory_name, main_family, supplier_id, sku,
          description, short_description, composition, fiber_origin, weave_type, texture,
          gsm, width_cm, colors, moq, price_per_meter, stock_quantity, availability_status,
          tags, application_tags, images, certifications, care_instructions, sustainability_notes,
          rating, reviews_count, eco_score, breathable, moisture_wicking, stretchable,
          wrinkle_resistant, eco_friendly, hypoallergenic, durability_rating, softness_rating, created_at
        ) VALUES (
          @id, @name, @slug, @categoryId, @subcategoryId, @subcategoryName, @mainFamily, @supplierId, @sku,
          @description, @shortDescription, @composition, @fiberOrigin, @weaveType, @texture,
          @gsm, @widthCm, @colors, @moq, @pricePerMeter, @stockQuantity, @availabilityStatus,
          @tags, @applicationTags, @images, @certifications, @careInstructions, @sustainabilityNotes,
          @rating, @reviewsCount, @ecoScore, @breathable, @moistureWicking, @stretchable,
          @wrinkleResistant, @ecoFriendly, @hypoallergenic, @durabilityRating, @softnessRating, @createdAt
        )
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          category_id = excluded.category_id,
          subcategory_id = excluded.subcategory_id,
          subcategory_name = excluded.subcategory_name,
          main_family = excluded.main_family,
          supplier_id = excluded.supplier_id,
          sku = excluded.sku,
          description = excluded.description,
          short_description = excluded.short_description,
          composition = excluded.composition,
          fiber_origin = excluded.fiber_origin,
          weave_type = excluded.weave_type,
          texture = excluded.texture,
          gsm = excluded.gsm,
          width_cm = excluded.width_cm,
          colors = excluded.colors,
          moq = excluded.moq,
          price_per_meter = excluded.price_per_meter,
          stock_quantity = excluded.stock_quantity,
          availability_status = excluded.availability_status,
          tags = excluded.tags,
          application_tags = excluded.application_tags,
          images = excluded.images,
          certifications = excluded.certifications,
          care_instructions = excluded.care_instructions,
          sustainability_notes = excluded.sustainability_notes,
          rating = excluded.rating,
          reviews_count = excluded.reviews_count,
          eco_score = excluded.eco_score,
          breathable = excluded.breathable,
          moisture_wicking = excluded.moisture_wicking,
          stretchable = excluded.stretchable,
          wrinkle_resistant = excluded.wrinkle_resistant,
          eco_friendly = excluded.eco_friendly,
          hypoallergenic = excluded.hypoallergenic,
          durability_rating = excluded.durability_rating,
          softness_rating = excluded.softness_rating
      `);

      const tx = db.transaction(() => {
        for (const c of INITIAL_CATEGORIES) {
          insertCategory.run({
            id: c.id,
            name: c.name,
            slug: c.slug,
            mainFamily: c.mainFamily || null,
            description: c.description || null,
            image: c.image || null,
            fabricCount: c.fabricCount || 0,
          });

          if (c.subcategories && c.subcategories.length > 0) {
            for (const sub of c.subcategories) {
              insertSubcategory.run({
                id: sub.id,
                categoryId: c.id,
                categoryName: c.name,
                mainFamily: c.mainFamily || null,
                name: sub.name,
                slug: sub.slug,
                description: sub.description || null,
                characteristics: JSON.stringify(sub.characteristics || []),
                commonApplications: JSON.stringify(sub.commonApplications || []),
              });
            }
          }
        }

        for (const p of INITIAL_PRODUCTS) {
          insertProduct.run({
            id: p.id,
            name: p.name,
            slug: p.slug,
            categoryId: p.categoryId,
            subcategoryId: p.subcategoryId || null,
            subcategoryName: p.subcategoryName || null,
            mainFamily: p.mainFamily || null,
            supplierId: p.supplierId,
            sku: p.sku || `SKU-${p.id}`,
            description: p.description,
            shortDescription: p.shortDescription || null,
            composition: p.composition,
            fiberOrigin: p.fiberOrigin || null,
            weaveType: p.weaveType || null,
            texture: p.texture || null,
            gsm: p.gsm,
            widthCm: p.widthCm || 150,
            colors: JSON.stringify(p.colors || []),
            moq: p.moq,
            pricePerMeter: p.pricePerMeter,
            stockQuantity: p.stockQuantity || 1000,
            availabilityStatus: p.availabilityStatus || 'IN_STOCK',
            tags: JSON.stringify(p.tags || []),
            applicationTags: JSON.stringify(p.applicationTags || []),
            images: JSON.stringify(p.images || []),
            certifications: JSON.stringify(p.certifications || []),
            careInstructions: p.careInstructions || null,
            sustainabilityNotes: p.sustainabilityNotes || null,
            rating: p.rating || 4.8,
            reviewsCount: p.reviewsCount || 0,
            ecoScore: p.ecoScore || 'A+',
            breathable: p.breathable !== false ? 1 : 0,
            moistureWicking: p.moistureWicking ? 1 : 0,
            stretchable: p.stretchable ? 1 : 0,
            wrinkleResistant: p.wrinkleResistant ? 1 : 0,
            ecoFriendly: p.ecoFriendly ? 1 : 0,
            hypoallergenic: p.hypoallergenic ? 1 : 0,
            durabilityRating: p.durabilityRating || 4,
            softnessRating: p.softnessRating || 4,
            createdAt: p.createdAt || new Date().toISOString(),
          });
        }
      });

      tx();
      console.log('Successfully synced catalog and taxonomy into SQLite DB.');
    } finally {
      db.pragma('foreign_keys = ON');
    }
  } catch (err) {
    console.error('Error in syncCatalogAndTaxonomy:', err);
  }
}

function seedDataIfEmpty() {
  const supplierCount = (db.prepare(`SELECT count(*) as count FROM suppliers`).get() as any)?.count || 0;
  if (supplierCount > 0) {
    return;
  }

  console.log('Seeding SQLite database with relational fabric, supplier, auth, and order data...');

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password, role, company_name, avatar, phone, is_onboarded)
    VALUES (@id, @name, @email, @password, @role, @companyName, @avatar, @phone, @isOnboarded)
  `);

  const insertSupplier = db.prepare(`
    INSERT OR IGNORE INTO suppliers (
      user_id, business_name, slug, logo, banner_image, description, contact_person,
      email, phone, address, city, country, gst_tax_id, operating_hours, moq_default,
      certifications, fabric_specialties, is_verified, rating, total_products_count,
      reviews_count, rating_breakdown, reliability_metrics, recent_reviews
    ) VALUES (
      @userId, @businessName, @slug, @logo, @bannerImage, @description, @contactPerson,
      @email, @phone, @address, @city, @country, @gstTaxId, @operatingHours, @moqDefault,
      @certifications, @fabricSpecialties, @isVerified, @rating, @totalProductsCount,
      @reviewsCount, @ratingBreakdown, @reliabilityMetrics, @recentReviews
    )
  `);

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, main_family, description, image, fabric_count)
    VALUES (@id, @name, @slug, @mainFamily, @description, @image, @fabricCount)
  `);

  const insertSubcategory = db.prepare(`
    INSERT INTO subcategories (id, category_id, category_name, main_family, name, slug, description, characteristics, common_applications)
    VALUES (@id, @categoryId, @categoryName, @mainFamily, @name, @slug, @description, @characteristics, @commonApplications)
  `);

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name, slug, category_id, subcategory_id, subcategory_name, main_family, supplier_id, sku,
      description, short_description, composition, fiber_origin, weave_type, texture,
      gsm, width_cm, colors, moq, price_per_meter, stock_quantity, availability_status,
      tags, application_tags, images, certifications, care_instructions, sustainability_notes,
      rating, reviews_count, eco_score, breathable, moisture_wicking, stretchable,
      wrinkle_resistant, eco_friendly, hypoallergenic, durability_rating, softness_rating, created_at
    ) VALUES (
      @id, @name, @slug, @categoryId, @subcategoryId, @subcategoryName, @mainFamily, @supplierId, @sku,
      @description, @shortDescription, @composition, @fiberOrigin, @weaveType, @texture,
      @gsm, @widthCm, @colors, @moq, @pricePerMeter, @stockQuantity, @availabilityStatus,
      @tags, @applicationTags, @images, @certifications, @careInstructions, @sustainabilityNotes,
      @rating, @reviewsCount, @ecoScore, @breathable, @moistureWicking, @stretchable,
      @wrinkleResistant, @ecoFriendly, @hypoallergenic, @durabilityRating, @softnessRating, @createdAt
    )
  `);

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, buyer_id, shipping_address, items, subtotal, shipping_estimate,
      tax_amount, discount_amount, grand_total, status, rejection_reason, status_history, created_at
    ) VALUES (
      @id, @orderNumber, @buyerId, @shippingAddress, @items, @subtotal, @shippingEstimate,
      @taxAmount, @discountAmount, @grandTotal, @status, @rejectionReason, @statusHistory, @createdAt
    )
  `);

  const transaction = db.transaction(() => {
    for (const u of INITIAL_USERS) {
      insertUser.run({
        id: u.id,
        name: u.name,
        email: u.email,
        password: 'password123',
        role: u.role,
        companyName: u.companyName || null,
        avatar: u.avatar || null,
        phone: u.phone || null,
        isOnboarded: u.isOnboarded ? 1 : 0,
      });
    }

    for (const s of INITIAL_SUPPLIERS) {
      insertSupplier.run({
        userId: s.userId,
        businessName: s.businessName,
        slug: s.slug,
        logo: s.logo || null,
        bannerImage: s.bannerImage || null,
        description: s.description || null,
        contactPerson: s.contactPerson || null,
        email: s.email,
        phone: s.phone || null,
        address: s.address || null,
        city: s.city || null,
        country: s.country,
        gstTaxId: s.gstTaxId || null,
        operatingHours: s.operatingHours || null,
        moqDefault: s.moqDefault || 50,
        certifications: JSON.stringify(s.certifications || []),
        fabricSpecialties: JSON.stringify(s.fabricSpecialties || []),
        isVerified: s.isVerified ? 1 : 0,
        rating: s.rating || 4.8,
        totalProductsCount: s.totalProductsCount || 0,
        reviewsCount: s.reviewsCount || 0,
        ratingBreakdown: JSON.stringify(s.ratingBreakdown || {}),
        reliabilityMetrics: JSON.stringify(s.reliabilityMetrics || {}),
        recentReviews: JSON.stringify(s.recentReviews || []),
      });
    }

    for (const c of INITIAL_CATEGORIES) {
      insertCategory.run({
        id: c.id,
        name: c.name,
        slug: c.slug,
        mainFamily: c.mainFamily || null,
        description: c.description || null,
        image: c.image || null,
        fabricCount: c.fabricCount || 0,
      });

      if (c.subcategories && c.subcategories.length > 0) {
        for (const sub of c.subcategories) {
          insertSubcategory.run({
            id: sub.id,
            categoryId: c.id,
            categoryName: c.name,
            mainFamily: c.mainFamily || null,
            name: sub.name,
            slug: sub.slug,
            description: sub.description || null,
            characteristics: JSON.stringify(sub.characteristics || []),
            commonApplications: JSON.stringify(sub.commonApplications || []),
          });
        }
      }
    }

    for (const p of INITIAL_PRODUCTS) {
      insertProduct.run({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        subcategoryId: p.subcategoryId || null,
        subcategoryName: p.subcategoryName || null,
        mainFamily: p.mainFamily || null,
        supplierId: p.supplierId,
        sku: p.sku || `SKU-${p.id}`,
        description: p.description,
        shortDescription: p.shortDescription || null,
        composition: p.composition,
        fiberOrigin: p.fiberOrigin || null,
        weaveType: p.weaveType || null,
        texture: p.texture || null,
        gsm: p.gsm,
        widthCm: p.widthCm || 150,
        colors: JSON.stringify(p.colors || []),
        moq: p.moq,
        pricePerMeter: p.pricePerMeter,
        stockQuantity: p.stockQuantity || 1000,
        availabilityStatus: p.availabilityStatus || 'IN_STOCK',
        tags: JSON.stringify(p.tags || []),
        applicationTags: JSON.stringify(p.applicationTags || []),
        images: JSON.stringify(p.images || []),
        certifications: JSON.stringify(p.certifications || []),
        careInstructions: p.careInstructions || null,
        sustainabilityNotes: p.sustainabilityNotes || null,
        rating: p.rating || 4.8,
        reviewsCount: p.reviewsCount || 0,
        ecoScore: p.ecoScore || 'A+',
        breathable: p.breathable !== false ? 1 : 0,
        moistureWicking: p.moistureWicking ? 1 : 0,
        stretchable: p.stretchable ? 1 : 0,
        wrinkleResistant: p.wrinkleResistant ? 1 : 0,
        ecoFriendly: p.ecoFriendly ? 1 : 0,
        hypoallergenic: p.hypoallergenic ? 1 : 0,
        durabilityRating: p.durabilityRating || 4,
        softnessRating: p.softnessRating || 4,
        createdAt: p.createdAt || new Date().toISOString(),
      });
    }

    for (const o of INITIAL_ORDERS) {
      insertOrder.run({
        id: o.id,
        orderNumber: o.orderNumber,
        buyerId: o.buyerId,
        shippingAddress: JSON.stringify(o.shippingAddress),
        items: JSON.stringify(o.items),
        subtotal: o.subtotal,
        shippingEstimate: o.shippingEstimate,
        taxAmount: o.taxAmount,
        discountAmount: o.discountAmount || 0,
        grandTotal: o.grandTotal,
        status: o.status,
        rejectionReason: o.rejectionReason || null,
        statusHistory: JSON.stringify(o.statusHistory || []),
        createdAt: o.createdAt || new Date().toISOString(),
      });
    }
  });

  transaction();
  console.log('Database seeding finished successfully!');
}

// RELATIONAL JOIN QUERIES

export function getProductsWithJoins(): Product[] {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      c.name as categoryName,
      s.business_name as supplierName,
      s.slug as supplierSlug,
      s.logo as supplierLogo
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.user_id
    ORDER BY p.created_at DESC
  `);

  const rows = stmt.all() as any[];
  return rows.map(mapProductRow);
}

export function getProductByIdWithJoins(id: string): Product | null {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      c.name as categoryName,
      s.business_name as supplierName,
      s.slug as supplierSlug,
      s.logo as supplierLogo
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.user_id
    WHERE p.id = ? OR p.slug = ?
  `);

  const row = stmt.get(id, id) as any;
  return row ? mapProductRow(row) : null;
}

export function getSupplierWithProductsJoined(idOrSlug: string): { supplier: SupplierProfile; products: Product[] } | null {
  const supplierStmt = db.prepare(`
    SELECT 
      s.user_id as userId, s.business_name as businessName, s.slug, s.logo,
      s.banner_image as bannerImage, s.description, s.contact_person as contactPerson,
      s.email, s.phone, s.address, s.city, s.country, s.gst_tax_id as gstTaxId,
      s.operating_hours as operatingHours, s.moq_default as moqDefault,
      s.certifications, s.fabric_specialties as fabricSpecialties, s.is_verified as isVerified,
      s.rating, s.total_products_count as totalProductsCount, s.reviews_count as reviewsCount,
      s.rating_breakdown as ratingBreakdown, s.reliability_metrics as reliabilityMetrics,
      s.recent_reviews as recentReviews
    FROM suppliers s
    INNER JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ? OR s.slug = ? OR LOWER(s.business_name) = LOWER(?) OR LOWER(u.name) = LOWER(?)
  `);

  let supplierRow = supplierStmt.get(idOrSlug, idOrSlug, idOrSlug, idOrSlug) as any;
  
  if (!supplierRow) {
    const fuzzyStmt = db.prepare(`
      SELECT 
        s.user_id as userId, s.business_name as businessName, s.slug, s.logo,
        s.banner_image as bannerImage, s.description, s.contact_person as contactPerson,
        s.email, s.phone, s.address, s.city, s.country, s.gst_tax_id as gstTaxId,
        s.operating_hours as operatingHours, s.moq_default as moqDefault,
        s.certifications, s.fabric_specialties as fabricSpecialties, s.is_verified as isVerified,
        s.rating, s.total_products_count as totalProductsCount, s.reviews_count as reviewsCount,
        s.rating_breakdown as ratingBreakdown, s.reliability_metrics as reliabilityMetrics,
        s.recent_reviews as recentReviews
      FROM suppliers s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.business_name LIKE ? OR u.name LIKE ?
      LIMIT 1
    `);
    supplierRow = fuzzyStmt.get(`%${idOrSlug}%`, `%${idOrSlug}%`) as any;
  }

  if (!supplierRow) return null;

  const supplier = mapSupplierRow(supplierRow);

  const productsStmt = db.prepare(`
    SELECT 
      p.id, p.name, p.slug, p.category_id as categoryId, c.name as categoryName,
      p.supplier_id as supplierId, s.business_name as supplierName, s.slug as supplierSlug,
      s.logo as supplierLogo, p.sku, p.description, p.composition, p.gsm,
      p.width_cm as widthCm, p.colors, p.moq, p.price_per_meter as pricePerMeter,
      p.stock_quantity as stockQuantity, p.availability_status as availabilityStatus,
      p.tags, p.images, p.certifications, p.care_instructions as careInstructions,
      p.rating, p.reviews_count as reviewsCount, p.eco_score as ecoScore, p.created_at as createdAt
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    INNER JOIN suppliers s ON p.supplier_id = s.user_id
    WHERE p.supplier_id = ?
    ORDER BY p.created_at DESC
  `);

  const productRows = productsStmt.all(supplier.userId) as any[];
  const products = productRows.map(mapProductRow);

  return { supplier, products };
}

export function getAllCategories(): Category[] {
  const stmt = db.prepare(`
    SELECT 
      id, name, slug, main_family as mainFamily, description, image,
      fabric_count as fabricCount, status, sort_order as sortOrder
    FROM categories 
    ORDER BY sort_order ASC, name ASC
  `);
  const catRows = stmt.all() as any[];

  const subStmt = db.prepare(`
    SELECT 
      id, category_id as categoryId, category_name as categoryName,
      main_family as mainFamily, name, slug, description,
      characteristics, common_applications as commonApplications
    FROM subcategories
    WHERE category_id = ?
    ORDER BY name ASC
  `);

  return catRows.map((cat) => {
    const subRows = subStmt.all(cat.id) as any[];
    const subcategories = subRows.map((s) => ({
      ...s,
      characteristics: parseJson(s.characteristics, []),
      commonApplications: parseJson(s.commonApplications, []),
    }));
    return {
      ...cat,
      subcategories,
    };
  });
}

export function getAllSuppliers(): SupplierProfile[] {
  const stmt = db.prepare(`SELECT * FROM suppliers ORDER BY rating DESC`);
  const rows = stmt.all() as any[];
  return rows.map(mapSupplierRow);
}

export function getCartWithProductsJoined(userId: string = 'user-buyer-1'): { items: CartItem[]; subtotal: number } {
  const stmt = db.prepare(`
    SELECT 
      ci.id, ci.product_id as productId, ci.quantity_meters as quantityMeters,
      ci.selected_color as selectedColor, ci.unit_price as unitPrice,
      p.id as prod_id, p.name as prod_name, p.slug as prod_slug, p.category_id as prod_categoryId,
      c.name as prod_categoryName, p.supplier_id as prod_supplierId, s.business_name as prod_supplierName,
      s.slug as prod_supplierSlug, s.logo as prod_supplierLogo, p.sku as prod_sku,
      p.description as prod_description, p.composition as prod_composition, p.gsm as prod_gsm,
      p.width_cm as prod_widthCm, p.colors as prod_colors, p.moq as prod_moq,
      p.price_per_meter as prod_pricePerMeter, p.stock_quantity as prod_stockQuantity,
      p.availability_status as prod_availabilityStatus, p.tags as prod_tags,
      p.images as prod_images, p.certifications as prod_certifications,
      p.care_instructions as prod_careInstructions, p.rating as prod_rating,
      p.reviews_count as prod_reviewsCount, p.eco_score as prod_ecoScore
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    INNER JOIN categories c ON p.category_id = c.id
    INNER JOIN suppliers s ON p.supplier_id = s.user_id
    WHERE ci.user_id = ?
  `);

  const rows = stmt.all(userId) as any[];
  const items: CartItem[] = rows.map((r) => {
    const product: Product = {
      id: r.prod_id,
      name: r.prod_name,
      slug: r.prod_slug,
      categoryId: r.prod_categoryId,
      categoryName: r.prod_categoryName,
      supplierId: r.prod_supplierId,
      supplierName: r.prod_supplierName,
      supplierSlug: r.prod_supplierSlug,
      supplierLogo: r.prod_supplierLogo,
      sku: r.prod_sku,
      description: r.prod_description,
      composition: r.prod_composition,
      gsm: r.prod_gsm,
      widthCm: r.prod_widthCm,
      colors: parseJson(r.prod_colors, []),
      moq: r.prod_moq,
      pricePerMeter: r.prod_pricePerMeter,
      stockQuantity: r.prod_stockQuantity,
      availabilityStatus: r.prod_availabilityStatus,
      tags: parseJson(r.prod_tags, []),
      images: parseJson(r.prod_images, []),
      certifications: parseJson(r.prod_certifications, []),
      careInstructions: r.prod_careInstructions,
      rating: r.prod_rating,
      reviewsCount: r.prod_reviewsCount,
      ecoScore: r.prod_ecoScore,
    };

    return {
      id: r.id,
      productId: r.productId,
      product,
      quantityMeters: r.quantityMeters,
      selectedColor: r.selectedColor,
      unitPrice: r.unitPrice,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantityMeters, 0);
  return { items, subtotal };
}

export function addToCartInDb(userId: string, productId: string, quantityMeters: number, selectedColor?: string): CartItem {
  const product = getProductByIdWithJoins(productId);
  if (!product) throw new Error('Product not found');

  const existing = db.prepare(`SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?`).get(userId, productId) as any;

  if (existing) {
    const newQty = existing.quantity_meters + quantityMeters;
    db.prepare(`UPDATE cart_items SET quantity_meters = ? WHERE id = ?`).run(newQty, existing.id);
  } else {
    const id = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    db.prepare(`
      INSERT INTO cart_items (id, user_id, product_id, quantity_meters, selected_color, unit_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, productId, quantityMeters, selectedColor || product.colors[0]?.name || 'Natural', product.pricePerMeter);
  }

  const updatedCart = getCartWithProductsJoined(userId);
  return updatedCart.items.find((i) => i.productId === productId)!;
}

export function updateCartQuantityInDb(id: string, quantityMeters: number) {
  db.prepare(`UPDATE cart_items SET quantity_meters = ? WHERE id = ?`).run(quantityMeters, id);
}

export function removeFromCartInDb(id: string) {
  db.prepare(`DELETE FROM cart_items WHERE id = ?`).run(id);
}

export function clearCartInDb(userId: string) {
  db.prepare(`DELETE FROM cart_items WHERE user_id = ?`).run(userId);
}

export function getOrdersWithJoins(userId?: string): Order[] {
  let query = `
    SELECT 
      o.id, o.order_number as orderNumber, o.buyer_id as buyerId,
      u.name as buyerName, u.email as buyerEmail,
      o.shipping_address as shippingAddress, o.items, o.subtotal,
      o.shipping_estimate as shippingEstimate, o.tax_amount as taxAmount,
      o.discount_amount as discountAmount, o.grand_total as grandTotal,
      o.status, o.rejection_reason as rejectionReason, o.status_history as statusHistory,
      o.created_at as createdAt
    FROM orders o
    INNER JOIN users u ON o.buyer_id = u.id
  `;

  if (userId) {
    query += ` WHERE o.buyer_id = ? ORDER BY o.created_at DESC`;
    const rows = db.prepare(query).all(userId) as any[];
    return rows.map(mapOrderRow);
  } else {
    query += ` ORDER BY o.created_at DESC`;
    const rows = db.prepare(query).all() as any[];
    return rows.map(mapOrderRow);
  }
}

export function createOrderInDb(data: any): Order {
  const id = `order-${Date.now()}`;
  const orderNumber = `FM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const status = 'Confirmed';

  const statusHistory = [
    { status: 'Confirmed', timestamp: new Date().toISOString(), note: 'B2B Escrow Order Submitted Successfully' }
  ];

  db.prepare(`
    INSERT INTO orders (
      id, order_number, buyer_id, shipping_address, items, subtotal,
      shipping_estimate, tax_amount, discount_amount, grand_total, status, status_history
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    id,
    orderNumber,
    data.buyerId || 'user-buyer-1',
    JSON.stringify(data.shippingAddress || {}),
    JSON.stringify(data.items || []),
    data.subtotal || 0,
    data.shippingEstimate || 0,
    data.taxAmount || 0,
    data.discountAmount || 0,
    data.grandTotal || 0,
    status,
    JSON.stringify(statusHistory)
  );

  clearCartInDb(data.buyerId || 'user-buyer-1');
  return getOrdersWithJoins().find((o) => o.id === id)!;
}

export function updateOrderStatusInDb(orderId: string, status: string, rejectionReason?: string): Order | null {
  const current = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
  if (!current) return null;

  const history = parseJson(current.status_history, []);
  history.push({
    status,
    timestamp: new Date().toISOString(),
    note: rejectionReason || `Status updated to ${status}`
  });

  db.prepare(`
    UPDATE orders 
    SET status = ?, rejection_reason = ?, status_history = ?
    WHERE id = ?
  `).run(status, rejectionReason || null, JSON.stringify(history), orderId);

  return getOrdersWithJoins().find((o) => o.id === orderId) || null;
}

export function createProductInDb(p: any): Product {
  const id = `prod-${Date.now()}`;
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

  db.prepare(`
    INSERT INTO products (
      id, name, slug, category_id, supplier_id, sku, description, composition,
      gsm, width_cm, colors, moq, price_per_meter, stock_quantity, availability_status,
      tags, images, certifications, care_instructions, rating, reviews_count, eco_score
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    id,
    p.name,
    slug,
    p.categoryId || 'cat-cotton',
    p.supplierId || 'user-supplier-1',
    sku,
    p.description || '',
    p.composition || '100% Cotton',
    p.gsm || 200,
    p.widthCm || 150,
    JSON.stringify(p.colors || [{ name: 'Natural', hex: '#f5f5dc' }]),
    p.moq || 50,
    p.pricePerMeter || 12.5,
    p.stockQuantity || 1000,
    'IN_STOCK',
    JSON.stringify(p.tags || ['Organic']),
    JSON.stringify(p.images || ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800']),
    JSON.stringify(p.certifications || ['GOTS']),
    p.careInstructions || 'Dry Clean Only',
    4.9,
    1,
    'A+'
  );

  return getProductByIdWithJoins(id)!;
}

export function updateProductInDb(id: string, p: any): Product | null {
  const current = db.prepare(`SELECT * FROM products WHERE id = ?`).get(id) as any;
  if (!current) return null;

  db.prepare(`
    UPDATE products
    SET name = ?,
        category_id = COALESCE(?, category_id),
        description = ?,
        composition = ?,
        gsm = ?,
        width_cm = ?,
        price_per_meter = ?,
        stock_quantity = ?,
        moq = ?,
        sku = COALESCE(?, sku),
        images = ?,
        certifications = ?
    WHERE id = ?
  `).run(
    p.name || current.name,
    p.categoryId || null,
    p.description || current.description,
    p.composition || current.composition,
    p.gsm ? Number(p.gsm) : current.gsm,
    p.widthCm ? Number(p.widthCm) : current.width_cm,
    p.pricePerMeter ? Number(p.pricePerMeter) : current.price_per_meter,
    p.stockQuantity !== undefined ? Number(p.stockQuantity) : current.stock_quantity,
    p.moq ? Number(p.moq) : current.moq,
    p.sku || null,
    JSON.stringify(p.images || parseJson(current.images, [])),
    JSON.stringify(p.certifications || parseJson(current.certifications, [])),
    id
  );

  return getProductByIdWithJoins(id);
}

export function deleteProductInDb(id: string): boolean {
  const result = db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function authenticateUser(email: string): User | null {
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  const row = stmt.get(email) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    companyName: row.company_name || undefined,
    avatar: row.avatar || undefined,
    phone: row.phone || undefined,
    isOnboarded: Boolean(row.is_onboarded),
  };
}

export function registerUserInDb(data: any): User {
  const id = `user-${Date.now()}`;
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, company_name, phone, is_onboarded)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, data.name, data.email, data.password || 'password123', data.role, data.companyName || null, data.phone || null);

  if (data.role === 'SUPPLIER') {
    const supplierSlug = (data.companyName || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    db.prepare(`
      INSERT INTO suppliers (
        user_id, business_name, slug, logo, description, contact_person, email, phone, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.companyName || `${data.name} Textiles`,
      supplierSlug,
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
      'Verified Mill & Wholesale Textile Manufacturer',
      data.name,
      data.email,
      data.phone || '+1 555-0192',
      'United States'
    );
  }

  return authenticateUser(data.email)!;
}

export function updateUserInDb(id: string, data: any): User | null {
  const current = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as any;
  if (!current) return null;

  db.prepare(`
    UPDATE users
    SET name = ?,
        email = ?,
        company_name = ?,
        avatar = ?,
        phone = ?
    WHERE id = ?
  `).run(
    data.name || current.name,
    data.email || current.email,
    data.companyName !== undefined ? data.companyName : current.company_name,
    data.avatar !== undefined ? data.avatar : current.avatar,
    data.phone !== undefined ? data.phone : current.phone,
    id
  );

  if (current.role === 'SUPPLIER') {
    db.prepare(`
      UPDATE suppliers
      SET business_name = COALESCE(?, business_name),
          logo = COALESCE(?, logo),
          contact_person = COALESCE(?, contact_person),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone)
      WHERE user_id = ?
    `).run(
      data.companyName || null,
      data.avatar || null,
      data.name || null,
      data.email || null,
      data.phone || null,
      id
    );
  }

  return authenticateUser(data.email || current.email);
}

export function deleteUserInDb(id: string): boolean {
  const result = db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function getDbStats() {
  return {
    users: (db.prepare(`SELECT count(*) as c FROM users`).get() as any).c,
    suppliers: (db.prepare(`SELECT count(*) as c FROM suppliers`).get() as any).c,
    categories: (db.prepare(`SELECT count(*) as c FROM categories`).get() as any).c,
    products: (db.prepare(`SELECT count(*) as c FROM products`).get() as any).c,
    orders: (db.prepare(`SELECT count(*) as c FROM orders`).get() as any).c,
    cartItems: (db.prepare(`SELECT count(*) as c FROM cart_items`).get() as any).c,
  };
}

// HELPER MAPPERS

function parseJson(str: any, fallback: any) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function mapProductRow(r: any): Product {
  const parsedImages: string[] = parseJson(r.images, []);
  
  // Query DB for fabric_images
  let galleryImages: FabricImage[] = [];
  try {
    const rows = db.prepare(`
      SELECT * FROM fabric_images 
      WHERE fabric_id = ? 
      ORDER BY is_primary DESC, sort_order ASC, created_at ASC
    `).all(r.id) as any[];
    
    if (rows && rows.length > 0) {
      galleryImages = rows.map(mapFabricImageRow);
    }
  } catch (e) {}

  // Fallback if no fabric_images entries exist yet
  if (galleryImages.length === 0) {
    galleryImages = parsedImages.map((imgUrl, idx) => ({
      id: `img-fallback-${r.id}-${idx}`,
      fabricId: r.id,
      secureUrl: imgUrl,
      thumbnailUrl: imgUrl.includes('?') ? `${imgUrl}&w=400&h=400&fit=crop&q=80` : `${imgUrl}?w=400&h=400&fit=crop&q=80`,
      galleryUrl: imgUrl.includes('?') ? `${imgUrl}&w=1200&h=1200&fit=crop&q=80` : `${imgUrl}?w=1200&h=1200&fit=crop&q=80`,
      zoomUrl: imgUrl.includes('?') ? `${imgUrl}&w=2000&h=2000&fit=crop&q=90` : `${imgUrl}?w=2000&h=2000&fit=crop&q=90`,
      altText: `${r.name || 'Fabric'} ${r.composition || 'Textile'} Photo ${idx + 1}`,
      sortOrder: idx + 1,
      isPrimary: idx === 0,
      width: 1200,
      height: 1200,
      format: 'webp',
      fileSize: 150000,
    }));
  }

  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    categoryId: r.categoryId || r.category_id,
    categoryName: r.categoryName || r.category_name || 'General Fabrics',
    subcategoryId: r.subcategoryId || r.subcategory_id,
    subcategoryName: r.subcategoryName || r.subcategory_name,
    mainFamily: r.mainFamily || r.main_family,
    supplierId: r.supplierId || r.supplier_id,
    supplierName: r.supplierName || r.supplier_name || 'Global Silk Mills',
    supplierSlug: r.supplierSlug || r.supplier_slug,
    supplierLogo: r.supplierLogo || r.supplier_logo,
    sku: r.sku,
    description: r.description,
    shortDescription: r.shortDescription || r.short_description,
    composition: r.composition,
    fiberOrigin: r.fiberOrigin || r.fiber_origin,
    weaveType: r.weaveType || r.weave_type,
    texture: r.texture,
    gsm: r.gsm,
    widthCm: r.widthCm || r.width_cm,
    colors: parseJson(r.colors, []),
    moq: r.moq,
    pricePerMeter: r.pricePerMeter || r.price_per_meter,
    stockQuantity: r.stockQuantity || r.stock_quantity,
    availabilityStatus: r.availabilityStatus || r.availability_status || 'IN_STOCK',
    tags: parseJson(r.tags, []),
    applicationTags: parseJson(r.applicationTags || r.application_tags, []),
    images: galleryImages.length > 0 ? galleryImages.map(gi => gi.secureUrl) : parsedImages,
    galleryImages,
    certifications: parseJson(r.certifications, []),
    careInstructions: r.careInstructions || r.care_instructions,
    sustainabilityNotes: r.sustainabilityNotes || r.sustainability_notes,
    rating: r.rating,
    reviewsCount: r.reviewsCount || r.reviews_count,
    ecoScore: r.ecoScore || r.eco_score,
    breathable: Boolean(r.breathable ?? 1),
    moistureWicking: Boolean(r.moistureWicking ?? r.moisture_wicking ?? 0),
    stretchable: Boolean(r.stretchable ?? 0),
    wrinkleResistant: Boolean(r.wrinkleResistant ?? r.wrinkle_resistant ?? 0),
    ecoFriendly: Boolean(r.ecoFriendly ?? r.eco_friendly ?? 0),
    hypoallergenic: Boolean(r.hypoallergenic ?? 0),
    durabilityRating: r.durabilityRating || r.durability_rating || 4,
    softnessRating: r.softnessRating || r.softness_rating || 4,
    isApproved: r.is_approved ?? 1,
    isFeatured: r.is_featured ?? 0,
    isTrending: r.is_trending ?? 0,
    createdAt: r.createdAt || r.created_at,
  };
}

function mapSupplierRow(r: any): SupplierProfile {
  return {
    userId: r.userId || r.user_id,
    businessName: r.businessName || r.business_name,
    slug: r.slug,
    logo: r.logo,
    bannerImage: r.bannerImage || r.banner_image,
    description: r.description,
    contactPerson: r.contactPerson || r.contact_person,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    country: r.country,
    gstTaxId: r.gstTaxId || r.gst_tax_id,
    operatingHours: r.operatingHours || r.operating_hours,
    moqDefault: r.moqDefault || r.moq_default,
    certifications: parseJson(r.certifications, []),
    fabricSpecialties: parseJson(r.fabricSpecialties, []),
    isVerified: Boolean(r.isVerified ?? r.is_verified),
    status: r.status || (r.is_verified === 1 ? 'VERIFIED' : 'PENDING'),
    rating: r.rating || 4.8,
    totalProductsCount: r.totalProductsCount || r.total_products_count || 0,
    reviewsCount: r.reviewsCount || r.reviews_count || 0,
    ratingBreakdown: parseJson(r.ratingBreakdown || r.rating_breakdown, {}),
    reliabilityMetrics: parseJson(r.reliabilityMetrics || r.reliability_metrics, {}),
    recentReviews: parseJson(r.recentReviews || r.recent_reviews, []),
  };
}

function mapOrderRow(r: any): Order {
  return {
    id: r.id,
    orderNumber: r.orderNumber || r.order_number,
    buyerId: r.buyerId || r.buyer_id,
    buyerName: r.buyerName || r.buyer_name || 'Valued Buyer',
    buyerEmail: r.buyerEmail || r.buyer_email || '',
    shippingAddress: parseJson(r.shippingAddress || r.shipping_address, {}),
    items: parseJson(r.items, []),
    subtotal: r.subtotal,
    shippingEstimate: r.shippingEstimate || r.shipping_estimate || 0,
    taxAmount: r.taxAmount || r.tax_amount || 0,
    discountAmount: r.discountAmount || r.discount_amount || 0,
    grandTotal: r.grandTotal || r.grand_total,
    status: r.status,
    rejectionReason: r.rejectionReason || r.rejection_reason,
    createdAt: r.createdAt || r.created_at,
    statusHistory: parseJson(r.statusHistory || r.status_history, []),
  };
}

// ADMIN IMPLEMENTATION METHODS

export function ensureAdminUserExists() {
  const admin = db.prepare(`SELECT * FROM users WHERE email = ?`).get('admin@fabricmart.com') as any;
  if (!admin) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, company_name, avatar, phone, is_onboarded, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'ACTIVE')
    `).run(
      'user-admin-1',
      'Fabric Mart Admin',
      'admin@fabricmart.com',
      'admin123',
      'ADMIN',
      'Fabric Mart Global HQ',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      '+1 (800) 555-FABRIC'
    );
  }
}

export function seedDefaultAdminSettings() {
  const aiCount = (db.prepare(`SELECT count(*) as c FROM ai_settings`).get() as any).c;
  if (aiCount === 0) {
    db.prepare(`INSERT INTO ai_settings (key, value) VALUES (?, ?)`).run('enabled', 'true');
    db.prepare(`INSERT INTO ai_settings (key, value) VALUES (?, ?)`).run('huggingFaceApiKey', 'hf_mock_key_982374823');
    db.prepare(`INSERT INTO ai_settings (key, value) VALUES (?, ?)`).run('selectedModel', 'FabricMart-LLM-v2');
    db.prepare(`INSERT INTO ai_settings (key, value) VALUES (?, ?)`).run('temperature', '0.7');
    db.prepare(`INSERT INTO ai_settings (key, value) VALUES (?, ?)`).run('maxTokens', '1024');
  }

  const sysCount = (db.prepare(`SELECT count(*) as c FROM system_settings`).get() as any).c;
  if (sysCount === 0) {
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('marketplaceName', 'Fabric Mart');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('tagline', 'B2B Wholesale Fabric Marketplace');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('currencySymbol', '$ USD');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('taxRatePercent', '8.5');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('defaultShippingRate', '150');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('maintenanceMode', 'false');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('requireSupplierApproval', 'true');
    db.prepare(`INSERT INTO system_settings (key, value) VALUES (?, ?)`).run('requireProductApproval', 'true');
  }

  const contentCount = (db.prepare(`SELECT count(*) as c FROM content_management`).get() as any).c;
  if (contentCount === 0) {
    const defaultBanners = [
      {
        id: 'banner-1',
        headline: 'Direct Textile Sourcing from Verified Global Mills',
        subheadline: 'Browse over 10,000+ certified sustainable fabrics with low MOQs and instant sample swatches.',
        ctaText: 'Explore Marketplace',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        active: true,
      }
    ];
    db.prepare(`INSERT INTO content_management (key, value) VALUES (?, ?)`).run('banners', JSON.stringify(defaultBanners));
  }

  const actCount = (db.prepare(`SELECT count(*) as c FROM activity_logs`).get() as any).c;
  if (actCount === 0) {
    logAdminActivity('SYSTEM', 'Admin System Boot', 'Fabric Mart Admin Panel initialized and SQLite database connected successfully.', 'admin@fabricmart.com', 'success');
    logAdminActivity('SUPPLIER', 'Supplier Verified', 'Apex Textiles Ltd. verified with European GOTS Certification.', 'admin@fabricmart.com', 'info');
  }
}

export function logAdminActivity(type: string, title: string, description: string, userEmail?: string, status: string = 'info') {
  db.prepare(`
    INSERT INTO activity_logs (id, type, title, description, user_email, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(`act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, type, title, description, userEmail || 'admin@fabricmart.com', status);
}

export function getAdminActivityLogs() {
  return db.prepare(`SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50`).all().map((r: any) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description,
    userEmail: r.user_email,
    status: r.status,
    timestamp: r.timestamp,
  }));
}

export function getAdminDashboardStats() {
  const totalBuyers = (db.prepare(`SELECT count(*) as c FROM users WHERE role = 'BUYER'`).get() as any).c;
  const totalSuppliers = (db.prepare(`SELECT count(*) as c FROM users WHERE role = 'SUPPLIER'`).get() as any).c;
  const pendingSuppliersCount = (db.prepare(`SELECT count(*) as c FROM suppliers WHERE is_verified = 0 OR status = 'PENDING'`).get() as any).c;

  const totalProducts = (db.prepare(`SELECT count(*) as c FROM products`).get() as any).c;
  const activeProducts = (db.prepare(`SELECT count(*) as c FROM products WHERE is_approved = 1`).get() as any).c;
  const pendingProducts = (db.prepare(`SELECT count(*) as c FROM products WHERE is_approved = 0`).get() as any).c;
  const lowStockProductsCount = (db.prepare(`SELECT count(*) as c FROM products WHERE stock_quantity < 200`).get() as any).c;

  const totalOrders = (db.prepare(`SELECT count(*) as c FROM orders`).get() as any).c;
  const completedOrders = (db.prepare(`SELECT count(*) as c FROM orders WHERE status = 'Completed' OR status = 'Shipped'`).get() as any).c;
  const pendingOrders = (db.prepare(`SELECT count(*) as c FROM orders WHERE status = 'Pending' OR status = 'Preparing'`).get() as any).c;

  const revenueRow = db.prepare(`SELECT SUM(grand_total) as total FROM orders WHERE status != 'Rejected' AND status != 'Cancelled'`).get() as any;
  const totalRevenue = revenueRow?.total || 148500;

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 18400, orders: 12 },
    { month: 'Feb', revenue: 22100, orders: 15 },
    { month: 'Mar', revenue: 29500, orders: 21 },
    { month: 'Apr', revenue: 34800, orders: 26 },
    { month: 'May', revenue: 41200, orders: 31 },
    { month: 'Jun', revenue: 48900, orders: 38 },
  ];

  const categories = db.prepare(`SELECT c.name, count(p.id) as count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id`).all() as any[];
  const categoryDistribution = categories.map((cat, idx) => ({
    name: cat.name,
    count: cat.count || 0,
    value: cat.count > 0 ? cat.count * 15 : (idx + 1) * 10,
  }));

  const supplierGrowthData = [
    { month: 'Q1 2025', suppliers: 12, buyers: 140 },
    { month: 'Q2 2025', suppliers: 28, buyers: 310 },
    { month: 'Q3 2025', suppliers: 45, buyers: 580 },
    { month: 'Q4 2025', suppliers: 72, buyers: 890 },
    { month: 'Q1 2026', suppliers: 110, buyers: 1240 },
  ];

  const recentActivity = getAdminActivityLogs();

  return {
    totalBuyers,
    totalSuppliers,
    pendingSuppliersCount,
    totalProducts,
    activeProducts,
    pendingProducts,
    lowStockProductsCount,
    totalOrders,
    completedOrders,
    pendingOrders,
    totalRevenue,
    recentActivity,
    monthlyRevenueData,
    categoryDistribution,
    supplierGrowthData,
  };
}

export function getAllBuyersAdmin() {
  const rows = db.prepare(`
    SELECT u.id, u.name, u.email, u.company_name, u.phone, u.avatar, u.is_onboarded, u.status, u.created_at,
           bp.business_type, bp.industry, bp.preferred_categories, bp.preferred_fabrics, bp.typical_order_quantity, bp.budget_range, bp.sustainability_focus
    FROM users u
    LEFT JOIN buyer_profiles bp ON u.id = bp.user_id
    WHERE u.role = 'BUYER'
    ORDER BY u.created_at DESC
  `).all() as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: 'BUYER' as const,
    companyName: r.company_name,
    phone: r.phone,
    avatar: r.avatar,
    isOnboarded: Boolean(r.is_onboarded),
    status: r.status || 'ACTIVE',
    createdAt: r.created_at,
    buyerProfile: r.business_type ? {
      userId: r.id,
      businessType: r.business_type,
      industry: r.industry,
      preferredCategories: parseJson(r.preferred_categories, []),
      preferredFabrics: parseJson(r.preferred_fabrics, []),
      typicalOrderQuantity: r.typical_order_quantity,
      budgetRange: r.budget_range,
      sustainabilityFocus: Boolean(r.sustainability_focus),
    } : undefined,
  }));
}

export function updateUserStatusDb(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED' | 'SUSPENDED') {
  db.prepare(`UPDATE users SET status = ? WHERE id = ?`).run(status, userId);
  logAdminActivity('BUYER', 'Buyer Status Updated', `User ID ${userId} status changed to ${status}.`);
  return true;
}

export function resetUserPasswordDb(userId: string, newPassword?: string) {
  const pwd = newPassword || 'FabricMart2026!';
  db.prepare(`UPDATE users SET password = ? WHERE id = ?`).run(pwd, userId);
  logAdminActivity('BUYER', 'Password Reset by Admin', `Password for user ID ${userId} reset by administrator.`);
  return pwd;
}

export function deleteUserAccountAdmin(userId: string) {
  const user = db.prepare(`SELECT email FROM users WHERE id = ?`).get(userId) as any;
  const result = db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
  if (result.changes > 0) {
    logAdminActivity('BUYER', 'User Deleted', `User account ${user?.email || userId} deleted permanently.`, user?.email, 'warning');
    return true;
  }
  return false;
}

export function getAllSuppliersAdmin() {
  const rows = db.prepare(`
    SELECT s.*, u.name as contactPerson, u.status as userStatus, u.created_at
    FROM suppliers s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.business_name ASC
  `).all() as any[];

  return rows.map(mapSupplierRow);
}

export function updateSupplierApprovalStatusDb(supplierId: string, status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED') {
  const isVerified = status === 'VERIFIED' ? 1 : 0;
  db.prepare(`UPDATE suppliers SET is_verified = ?, status = ? WHERE user_id = ?`).run(isVerified, status, supplierId);
  db.prepare(`UPDATE users SET status = ? WHERE id = ?`).run(status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE', supplierId);
  logAdminActivity('SUPPLIER', 'Supplier Status Updated', `Supplier ${supplierId} status set to ${status}.`);
  return true;
}

export function updateSupplierProfileAdmin(supplierId: string, data: Partial<SupplierProfile>) {
  db.prepare(`
    UPDATE suppliers SET
      business_name = COALESCE(?, business_name),
      contact_person = COALESCE(?, contact_person),
      phone = COALESCE(?, phone),
      address = COALESCE(?, address),
      city = COALESCE(?, city),
      country = COALESCE(?, country),
      gst_tax_id = COALESCE(?, gst_tax_id)
    WHERE user_id = ?
  `).run(
    data.businessName || null,
    data.contactPerson || null,
    data.phone || null,
    data.address || null,
    data.city || null,
    data.country || null,
    data.gstTaxId || null,
    supplierId
  );
  logAdminActivity('SUPPLIER', 'Supplier Profile Edited', `Supplier ${supplierId} information updated by admin.`);
  return true;
}

export function getAllProductsAdmin() {
  const rows = db.prepare(`
    SELECT p.*,
           c.name as categoryName,
           s.business_name as supplierName,
           s.slug as supplierSlug,
           s.logo as supplierLogo
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN suppliers s ON p.supplier_id = s.user_id
    ORDER BY p.created_at DESC
  `).all() as any[];

  return rows.map(mapProductRow);
}

export function approveProductAdmin(productId: string, isApproved: boolean) {
  const val = isApproved ? 1 : 0;
  db.prepare(`UPDATE products SET is_approved = ? WHERE id = ?`).run(val, productId);
  logAdminActivity('PRODUCT', isApproved ? 'Product Approved' : 'Product Rejected', `Product ID ${productId} moderation set to ${isApproved ? 'Approved' : 'Rejected'}.`);
  return true;
}

export function toggleProductFeaturedAdmin(productId: string) {
  const prod = db.prepare(`SELECT is_featured FROM products WHERE id = ?`).get(productId) as any;
  const newVal = prod?.is_featured ? 0 : 1;
  db.prepare(`UPDATE products SET is_featured = ? WHERE id = ?`).run(newVal, productId);
  return Boolean(newVal);
}

export function toggleProductTrendingAdmin(productId: string) {
  const prod = db.prepare(`SELECT is_trending FROM products WHERE id = ?`).get(productId) as any;
  const newVal = prod?.is_trending ? 0 : 1;
  db.prepare(`UPDATE products SET is_trending = ? WHERE id = ?`).run(newVal, productId);
  return Boolean(newVal);
}

export function createCategoryInDb(data: { name: string; description: string; image: string }) {
  const id = `cat-${Date.now()}`;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  db.prepare(`
    INSERT INTO categories (id, name, slug, description, image, fabric_count, status)
    VALUES (?, ?, ?, ?, ?, 0, 'ENABLED')
  `).run(id, data.name, slug, data.description, data.image || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80');

  logAdminActivity('SYSTEM', 'Category Created', `Added category "${data.name}".`);
  return { id, name: data.name, slug, description: data.description, image: data.image, fabricCount: 0 };
}

export function updateCategoryInDb(id: string, data: { name?: string; description?: string; image?: string; status?: string }) {
  db.prepare(`
    UPDATE categories SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      image = COALESCE(?, image),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(data.name || null, data.description || null, data.image || null, data.status || null, id);

  logAdminActivity('SYSTEM', 'Category Updated', `Updated category ID ${id}.`);
  return true;
}

export function deleteCategoryInDb(id: string) {
  const result = db.prepare(`DELETE FROM categories WHERE id = ?`).run(id);
  if (result.changes > 0) {
    logAdminActivity('SYSTEM', 'Category Deleted', `Deleted category ID ${id}.`, undefined, 'warning');
    return true;
  }
  return false;
}

export function getAllOrdersAdmin() {
  const rows = db.prepare(`
    SELECT o.*, u.name as buyer_name, u.email as buyer_email
    FROM orders o
    JOIN users u ON o.buyer_id = u.id
    ORDER BY o.created_at DESC
  `).all() as any[];

  return rows.map(mapOrderRow);
}

export function cancelOrderAdmin(orderId: string, reason: string) {
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId) as any;
  if (!order) return null;

  const history = parseJson(order.status_history, []);
  history.push({
    status: 'Cancelled',
    timestamp: new Date().toISOString(),
    note: `Cancelled by Administrator: ${reason}`,
  });

  db.prepare(`
    UPDATE orders SET status = 'Cancelled', rejection_reason = ?, status_history = ? WHERE id = ?
  `).run(reason, JSON.stringify(history), orderId);

  logAdminActivity('ORDER', 'Order Cancelled by Admin', `Order #${order.order_number} cancelled: ${reason}`, undefined, 'warning');
  return true;
}

export function getAISettingsDb() {
  const rows = db.prepare(`SELECT key, value FROM ai_settings`).all() as any[];
  const settings: any = { enabled: true, huggingFaceApiKey: '', selectedModel: 'FabricMart-LLM-v2', temperature: 0.7, maxTokens: 1024, voiceEnabled: true, groundingWithCatalog: true };
  rows.forEach((r) => {
    if (r.key === 'enabled') settings.enabled = r.value === 'true';
    else if (r.key === 'voiceEnabled') settings.voiceEnabled = r.value === 'true';
    else if (r.key === 'groundingWithCatalog') settings.groundingWithCatalog = r.value === 'true';
    else if (r.key === 'temperature') settings.temperature = parseFloat(r.value);
    else if (r.key === 'maxTokens') settings.maxTokens = parseInt(r.value, 10);
    else settings[r.key] = r.value;
  });
  return settings;
}

export function updateAISettingsDb(data: any) {
  Object.keys(data).forEach((k) => {
    db.prepare(`INSERT OR REPLACE INTO ai_settings (key, value) VALUES (?, ?)`).run(k, String(data[k]));
  });
  logAdminActivity('AI', 'AI Settings Updated', 'Hugging Face API key & model settings updated.');
  return getAISettingsDb();
}

export function getAILogsDb() {
  const rows = db.prepare(`SELECT * FROM ai_logs ORDER BY timestamp DESC LIMIT 50`).all() as any[];
  return rows.map((r) => ({
    id: r.id,
    userQuery: r.user_query,
    userRole: r.user_role || 'BUYER',
    aiResponse: r.ai_response,
    suggestedProductsCount: r.suggested_count,
    timestamp: r.timestamp,
    executionTimeMs: r.execution_time_ms,
    conversionRate: '84.2%',
  }));
}

export function addAILogDb(query: string, role: string, response: string, count: number, executionTime: number = 120) {
  const id = `ailog-${Date.now()}`;
  db.prepare(`
    INSERT INTO ai_logs (id, user_query, user_role, ai_response, suggested_count, execution_time_ms, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, query, role, response, count, executionTime);
}

export function getAnnouncementsDb() {
  return db.prepare(`SELECT * FROM announcements ORDER BY sent_at DESC`).all().map((r: any) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    targetAudience: r.target_audience,
    sentBy: r.sent_by,
    sentAt: r.sent_at,
    readCount: r.read_count,
    priority: r.priority,
  }));
}

export function createAnnouncementDb(data: { title: string; message: string; targetAudience: 'ALL' | 'BUYER' | 'SUPPLIER'; priority?: string }) {
  const id = `ann-${Date.now()}`;
  db.prepare(`
    INSERT INTO announcements (id, title, message, target_audience, sent_by, sent_at, read_count, priority)
    VALUES (?, ?, ?, ?, 'Admin Director', CURRENT_TIMESTAMP, 0, ?)
  `).run(id, data.title, data.message, data.targetAudience, data.priority || 'normal');

  logAdminActivity('SYSTEM', 'Announcement Sent', `Broadcasted notification "${data.title}" to ${data.targetAudience}.`);
  return { id, title: data.title, message: data.message, targetAudience: data.targetAudience, sentBy: 'Admin Director', sentAt: new Date().toISOString(), readCount: 0, priority: data.priority || 'normal' };
}

export function getContentManagementDb() {
  const rows = db.prepare(`SELECT key, value FROM content_management`).all() as any[];
  const data: any = {
    banners: [
      {
        id: 'banner-1',
        headline: 'Direct Textile Sourcing from Verified Global Mills',
        subheadline: 'Browse over 10,000+ certified sustainable fabrics with low MOQs and instant sample swatches.',
        ctaText: 'Explore Marketplace',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        active: true,
      }
    ],
    featuredProductIds: [],
    faqs: [
      { id: 'faq-1', question: 'What is the minimum order quantity (MOQ) on Fabric Mart?', answer: 'MOQs are set directly by supplier mills and typically range from 50 meters to 300 meters depending on production specs.', category: 'Sourcing' },
      { id: 'faq-2', question: 'How do fabric sample swatches work?', answer: 'Apparel buyers can request physical swatch header books directly from mill pages with express DHL/FedEx delivery.', category: 'Samples' }
    ],
    aboutContent: 'Fabric Mart connects premier textile mills with global fashion houses and apparel manufacturers through direct transparent digital trade.',
    contactEmail: 'support@fabricmart.com',
    contactPhone: '+1 (800) 555-FABRIC',
    supportHours: 'Mon-Fri 08:00 - 20:00 EST',
  };

  rows.forEach((r) => {
    data[r.key] = parseJson(r.value, r.value);
  });
  return data;
}

export function updateContentManagementDb(updates: any) {
  Object.keys(updates).forEach((k) => {
    const val = typeof updates[k] === 'object' ? JSON.stringify(updates[k]) : String(updates[k]);
    db.prepare(`INSERT OR REPLACE INTO content_management (key, value) VALUES (?, ?)`).run(k, val);
  });
  logAdminActivity('SYSTEM', 'Content Updated', 'Homepage banners, FAQs or CMS content updated.');
  return getContentManagementDb();
}

export function getSystemSettingsDb() {
  const rows = db.prepare(`SELECT key, value FROM system_settings`).all() as any[];
  const settings: any = {
    marketplaceName: 'Fabric Mart',
    tagline: 'B2B Wholesale Fabric Marketplace',
    logoUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=120&auto=format&fit=crop&q=80',
    currencySymbol: '$ USD',
    taxRatePercent: 8.5,
    defaultShippingRate: 150,
    maintenanceMode: false,
    requireSupplierApproval: true,
    requireProductApproval: true,
    jwtExpiryHours: 24,
    maxLoginAttempts: 5,
    smtpConfigured: true,
  };

  rows.forEach((r) => {
    if (r.key === 'maintenanceMode' || r.key === 'requireSupplierApproval' || r.key === 'requireProductApproval' || r.key === 'smtpConfigured') {
      settings[r.key] = r.value === 'true';
    } else if (r.key === 'taxRatePercent' || r.key === 'defaultShippingRate') {
      settings[r.key] = parseFloat(r.value);
    } else if (r.key === 'jwtExpiryHours' || r.key === 'maxLoginAttempts') {
      settings[r.key] = parseInt(r.value, 10);
    } else {
      settings[r.key] = r.value;
    }
  });

  return settings;
}

export function updateSystemSettingsDb(updates: any) {
  Object.keys(updates).forEach((k) => {
    db.prepare(`INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)`).run(k, String(updates[k]));
  });
  logAdminActivity('SYSTEM', 'System Settings Saved', 'Marketplace branding, tax rates, or maintenance settings saved.');
  return getSystemSettingsDb();
}

export function addAIConversationDb(userId: string | null, aiType: 'ASSISTANT' | 'VOICE_AGENT', roleContext: string, message: string, response: string) {
  const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.prepare(`
    INSERT INTO ai_conversations (id, user_id, ai_type, role_context, message, response, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, userId || 'guest', aiType, roleContext || 'BUYER', message, response);
  return id;
}

export function getAIConversationsDb(userId?: string, aiType?: 'ASSISTANT' | 'VOICE_AGENT') {
  let query = `SELECT * FROM ai_conversations WHERE 1=1`;
  const params: any[] = [];
  if (userId) {
    query += ` AND user_id = ?`;
    params.push(userId);
  }
  if (aiType) {
    query += ` AND ai_type = ?`;
    params.push(aiType);
  }
  query += ` ORDER BY created_at DESC LIMIT 50`;
  return db.prepare(query).all(...params);
}

export function addVoiceSessionDb(userId: string | null, transcript: string, responseText: string, audioDuration: number = 3.5) {
  const id = `voice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.prepare(`
    INSERT INTO voice_sessions (id, user_id, transcript, response_text, audio_duration, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(id, userId || 'guest', transcript, responseText, audioDuration);
  return id;
}

export function getVoiceSessionsDb(userId?: string) {
  if (userId) {
    return db.prepare(`SELECT * FROM voice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`).all(userId);
  }
  return db.prepare(`SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 30`).all();
}

// FABRIC IMAGES & MEDIA CDN FUNCTIONS

function mapFabricImageRow(r: any): FabricImage {
  return {
    id: r.id,
    fabricId: r.fabric_id || r.fabricId,
    cloudinaryPublicId: r.cloudinary_public_id || r.cloudinaryPublicId,
    secureUrl: r.secure_url || r.secureUrl,
    thumbnailUrl: r.thumbnail_url || r.thumbnailUrl || r.secure_url,
    galleryUrl: r.gallery_url || r.galleryUrl || r.secure_url,
    zoomUrl: r.zoom_url || r.zoomUrl || r.secure_url,
    altText: r.alt_text || r.altText || 'Fabric Mart Textile Image',
    sortOrder: r.sort_order ?? r.sortOrder ?? 1,
    isPrimary: Boolean(r.is_primary ?? r.isPrimary ?? 0),
    width: r.width || 1200,
    height: r.height || 1200,
    format: r.format || 'webp',
    fileSize: r.file_size || r.fileSize || 0,
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export function getFabricImagesByProductId(fabricId: string): FabricImage[] {
  const rows = db.prepare(`
    SELECT * FROM fabric_images 
    WHERE fabric_id = ? 
    ORDER BY is_primary DESC, sort_order ASC, created_at ASC
  `).all(fabricId) as any[];
  return rows.map(mapFabricImageRow);
}

export function getAllFabricImagesDb(): FabricImage[] {
  const rows = db.prepare(`
    SELECT * FROM fabric_images 
    ORDER BY created_at DESC
  `).all() as any[];
  return rows.map(mapFabricImageRow);
}

export function insertFabricImageDb(data: {
  id?: string;
  fabricId: string;
  cloudinaryPublicId?: string;
  secureUrl: string;
  thumbnailUrl?: string;
  galleryUrl?: string;
  zoomUrl?: string;
  altText: string;
  sortOrder?: number;
  isPrimary?: boolean | number;
  width?: number;
  height?: number;
  format?: string;
  fileSize?: number;
}): FabricImage {
  const id = data.id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const isPrimary = data.isPrimary ? 1 : 0;
  
  if (isPrimary === 1) {
    db.prepare(`UPDATE fabric_images SET is_primary = 0 WHERE fabric_id = ?`).run(data.fabricId);
  }

  const stmt = db.prepare(`
    INSERT INTO fabric_images (
      id, fabric_id, cloudinary_public_id, secure_url, thumbnail_url, gallery_url, zoom_url,
      alt_text, sort_order, is_primary, width, height, format, file_size, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    id,
    data.fabricId,
    data.cloudinaryPublicId || null,
    data.secureUrl,
    data.thumbnailUrl || data.secureUrl,
    data.galleryUrl || data.secureUrl,
    data.zoomUrl || data.secureUrl,
    data.altText,
    data.sortOrder || 1,
    isPrimary,
    data.width || 1200,
    data.height || 1200,
    data.format || 'webp',
    data.fileSize || 0
  );

  if (isPrimary === 1) {
    db.prepare(`UPDATE products SET images = ? WHERE id = ?`).run(JSON.stringify([data.secureUrl]), data.fabricId);
  }

  const row = db.prepare(`SELECT * FROM fabric_images WHERE id = ?`).get(id);
  return mapFabricImageRow(row);
}

export function setPrimaryFabricImageDb(fabricId: string, imageId: string): boolean {
  db.prepare(`UPDATE fabric_images SET is_primary = 0 WHERE fabric_id = ?`).run(fabricId);
  db.prepare(`UPDATE fabric_images SET is_primary = 1 WHERE id = ? AND fabric_id = ?`).run(imageId, fabricId);
  
  const primaryRow = db.prepare(`SELECT secure_url FROM fabric_images WHERE id = ?`).get(imageId) as any;
  if (primaryRow && primaryRow.secure_url) {
    db.prepare(`UPDATE products SET images = ? WHERE id = ?`).run(JSON.stringify([primaryRow.secure_url]), fabricId);
  }
  return true;
}

export function deleteFabricImageDb(imageId: string): boolean {
  db.prepare(`DELETE FROM fabric_images WHERE id = ?`).run(imageId);
  return true;
}

export function reorderFabricImagesDb(fabricId: string, imageIds: string[]): boolean {
  imageIds.forEach((id, index) => {
    db.prepare(`UPDATE fabric_images SET sort_order = ? WHERE id = ? AND fabric_id = ?`).run(index + 1, id, fabricId);
  });
  return true;
}


