const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data/fabric_mart.db');
const db = new Database(dbPath);

try {
  db.pragma('foreign_keys = OFF');
  
  db.prepare('DELETE FROM buyer_profiles').run();
  db.prepare('DELETE FROM suppliers').run();
  db.prepare("DELETE FROM users WHERE role IN ('BUYER', 'SUPPLIER')").run();

  const insertUser = db.prepare(`INSERT INTO users (id, name, email, password, role, company_name) VALUES (?, ?, ?, ?, ?, ?)`);
  
  // 2 Buyers
  insertUser.run('user-buyer-1', 'Acme Apparel', 'buyer1@acme.com', 'password123', 'BUYER', 'Acme Apparel');
  insertUser.run('user-buyer-2', 'Zeta Fashion', 'buyer2@zeta.com', 'password123', 'BUYER', 'Zeta Fashion');

  // 2 Suppliers
  insertUser.run('user-supplier-1', 'Global Silk Mills', 'sales@globalsilk.com', 'password123', 'SUPPLIER', 'Global Silk Mills');
  insertUser.run('user-supplier-2', 'Eco Cotton Co', 'info@ecocotton.com', 'password123', 'SUPPLIER', 'Eco Cotton Co');

  const insertBuyerProfile = db.prepare(`INSERT INTO buyer_profiles (user_id, business_type) VALUES (?, ?)`);
  insertBuyerProfile.run('user-buyer-1', 'Apparel Brand');
  insertBuyerProfile.run('user-buyer-2', 'Apparel Brand');

  const insertSupplier = db.prepare(`INSERT INTO suppliers (user_id, business_name, slug, email, country) VALUES (?, ?, ?, ?, 'USA')`);
  insertSupplier.run('user-supplier-1', 'Global Silk Mills', 'global-silk-mills', 'sales@globalsilk.com');
  insertSupplier.run('user-supplier-2', 'Eco Cotton Co', 'eco-cotton-co', 'info@ecocotton.com');

  // Map all existing products to user-supplier-1 or user-supplier-2
  const updateProducts = db.prepare(`UPDATE products SET supplier_id = CASE WHEN id LIKE '%2%' OR id LIKE '%4%' OR id LIKE '%6%' OR id LIKE '%8%' THEN 'user-supplier-2' ELSE 'user-supplier-1' END`);
  updateProducts.run();

  db.pragma('foreign_keys = ON');

  console.log('Clean seeding complete!');
  const productsCount = db.prepare('SELECT COUNT(*) as c FROM products p INNER JOIN categories c ON p.category_id = c.id INNER JOIN suppliers s ON p.supplier_id = s.user_id').get();
  console.log('Joined products count:', productsCount.c);
} catch (e) {
  console.error('Error during clean seeding:', e);
} finally {
  db.close();
}
