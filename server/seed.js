import bcrypt from 'bcryptjs';
import db from './config/db.js';

export async function seedData() {
  console.log('[SEED] Checking database seeding status...');

  // Check if admin already exists
  const existingAdmin = await db.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
  if (existingAdmin.length > 0) {
    console.log('[SEED] Database already initialized with seed data.');
    return;
  }

  console.log('[SEED] Initializing seed data...');

  const hashedPasswordAdmin = await bcrypt.hash('Admin@12345!', 10);
  const hashedPasswordOwner = await bcrypt.hash('Owner@12345!', 10);
  const hashedPasswordUser = await bcrypt.hash('User@12345!', 10);

  // 1. Create Users (Names must be 20-60 characters according to spec)
  const adminRes = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'System Administrator Account',
      'admin@storerating.com',
      hashedPasswordAdmin,
      '100 Tech Plaza, Innovation Boulevard, Suite 500',
      'ADMIN'
    ]
  );

  const owner1Res = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Marcus Aurelius Antoninus Owner',
      'owner.marcus@storerating.com',
      hashedPasswordOwner,
      '742 Evergreen Terrace, Sector 4, Springfield',
      'STORE_OWNER'
    ]
  );

  const owner2Res = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Victoria Elizabeth Windsor Owner',
      'owner.victoria@storerating.com',
      hashedPasswordOwner,
      '88 Royal Heritage Drive, Kensington, London',
      'STORE_OWNER'
    ]
  );

  const user1Res = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Eleanor Penelope Vance User',
      'eleanor.vance@storerating.com',
      hashedPasswordUser,
      '12 Baker Street, Apt 4B, Marylebone',
      'NORMAL_USER'
    ]
  );

  const user2Res = await db.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Alexander Montgomery III User',
      'alexander.montgomery@storerating.com',
      hashedPasswordUser,
      '450 Oakridge Parkway, Suite 12, Westlake',
      'NORMAL_USER'
    ]
  );

  const owner1Id = owner1Res.insertId;
  const owner2Id = owner2Res.insertId;
  const user1Id = user1Res.insertId;
  const user2Id = user2Res.insertId;

  // 2. Create Stores
  const store1Res = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Apex Tech Electronics Hub',
      'contact@apextechhub.com',
      '500 Silicon Valley Way, San Jose, CA',
      owner1Id
    ]
  );

  const store2Res = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Emerald Organic Fresh Market',
      'support@emeraldorganic.com',
      '82 Green Valley Road, Portland, OR',
      owner2Id
    ]
  );

  const store3Res = await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Horizon Fine Books & Stationers',
      'hello@horizonbooks.com',
      '124 Culture Square, Boston, MA',
      null
    ]
  );

  const store1Id = store1Res.insertId;
  const store2Id = store2Res.insertId;
  const store3Id = store3Res.insertId;

  // Add 6 additional stores
  await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Urban Artisan Coffee Roasters', 'info@urbanartisancoffee.com', '742 Roast Avenue, Seattle, WA', owner1Id]
  );
  await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Velvet Horizon Fashion Boutique', 'contact@velvethorizon.com', '310 Fifth Avenue, New York, NY', owner2Id]
  );
  await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Summit Peak Outdoor Gear Supply', 'service@summitpeakgear.com', '880 Mountain Crest Way, Denver, CO', null]
  );
  await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Lumina Gourmet Bakery & Cafe', 'orders@luminagourmet.com', '150 Pastry Lane, Chicago, IL', null]
  );
  await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Starlight Home Decor & Furnishings', 'support@starlighthome.com', '920 Design Boulevard, Austin, TX', null]
  );
  await db.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    ['Quantum Gaming & Esports Arena', 'arena@quantumgaming.com', '404 Cybertech Parkway, Los Angeles, CA', null]
  );

  // 3. Create Sample Ratings
  await db.query(
    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
    [user1Id, store1Id, 5]
  );

  await db.query(
    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
    [user2Id, store1Id, 4]
  );

  await db.query(
    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
    [user1Id, store2Id, 5]
  );

  await db.query(
    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
    [user2Id, store3Id, 3]
  );

  console.log('[SEED] Seeding completed successfully!');
}

if (process.argv[1]?.includes('seed.js')) {
  (async () => {
    await db.initDb();
    await seedData();
    process.exit(0);
  })();
}
