const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data/fabric_mart.db');
const db = new Database(dbPath);

const buyer1 = {
  id: 'usr-buyer-1',
  name: 'Acme Apparel',
  email: 'buyer1@acme.com',
  password: 'password123',
  role: 'BUYER',
  company_name: 'Acme Apparel'
};

const buyer2 = {
  id: 'usr-buyer-2',
  name: 'Zeta Fashion',
  email: 'buyer2@zeta.com',
  password: 'password123',
  role: 'BUYER',
  company_name: 'Zeta Fashion'
};

const supplier1 = {
  id: 'usr-supplier-1',
  name: 'Global Silk Mills',
  email: 'sales@globalsilk.com',
  password: 'password123',
  role: 'SUPPLIER',
  company_name: 'Global Silk Mills'
};

const supplier2 = {
  id: 'usr-supplier-2',
  name: 'Eco Cotton Co',
  email: 'info@ecocotton.com',
  password: 'password123',
  role: 'SUPPLIER',
  company_name: 'Eco Cotton Co'
};

try {
  console.log('Clearing existing users...');
  db.pragma('foreign_keys = ON');
  
  const deleteProfiles = db.prepare('DELETE FROM buyer_profiles');
  const deleteSuppliers = db.prepare('DELETE FROM suppliers');
  const deleteUsers = db.prepare("DELETE FROM users WHERE role IN ('BUYER', 'SUPPLIER')");
  
  deleteProfiles.run();
  deleteSuppliers.run();
  deleteUsers.run();

  console.log('Inserting fresh buyers...');
  const insertUser = db.prepare(`INSERT INTO users (id, name, email, password, role, company_name) VALUES (?, ?, ?, ?, ?, ?)`);
  
  insertUser.run(buyer1.id, buyer1.name, buyer1.email, buyer1.password, buyer1.role, buyer1.company_name);
  insertUser.run(buyer2.id, buyer2.name, buyer2.email, buyer2.password, buyer2.role, buyer2.company_name);

  console.log('Inserting fresh suppliers...');
  insertUser.run(supplier1.id, supplier1.name, supplier1.email, supplier1.password, supplier1.role, supplier1.company_name);
  insertUser.run(supplier2.id, supplier2.name, supplier2.email, supplier2.password, supplier2.role, supplier2.company_name);

  console.log('Inserting buyer profiles...');
  const insertBuyerProfile = db.prepare(`INSERT INTO buyer_profiles (user_id, business_type) VALUES (?, ?)`);
  insertBuyerProfile.run(buyer1.id, 'Apparel Brand');
  insertBuyerProfile.run(buyer2.id, 'Apparel Brand');

  console.log('Inserting supplier profiles...');
  // I will check if there is a 'country' column and provide it if necessary
  const tableInfo = db.pragma('table_info(suppliers)');
  const hasCountry = tableInfo.some(c => c.name === 'country');
  let insertSupplier;
  if (hasCountry) {
    insertSupplier = db.prepare(`INSERT INTO suppliers (user_id, business_name, slug, email, country) VALUES (?, ?, ?, ?, 'USA')`);
  } else {
    insertSupplier = db.prepare(`INSERT INTO suppliers (user_id, business_name, slug, email) VALUES (?, ?, ?, ?)`);
  }
  
  insertSupplier.run(supplier1.id, supplier1.company_name, 'global-silk-mills', supplier1.email);
  insertSupplier.run(supplier2.id, supplier2.company_name, 'eco-cotton-co', supplier2.email);

  console.log('Done migrating users!');
} catch (e) {
  console.error('Error during migration:', e);
} finally {
  db.close();
}
