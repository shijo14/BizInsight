// Run this once after npm install to generate real password hashes
// Usage: node db/seed.js
// This will print the INSERT SQL you need to paste into schema.sql

import bcrypt from 'bcrypt';
import { query, testConnection } from './db.js';

const SALT_ROUNDS = 12;
const PASSWORD = 'Admin@123';

const USERS = [
  { name: 'Shijo Joseph', email: 'shijo@bizinsight.io',  role: 'superadmin', avatar: 'SJ' },
  { name: 'Anika Sharma', email: 'anika@bizinsight.io',  role: 'admin',      avatar: 'AS' },
  { name: 'Rohan Mehta',  email: 'rohan@bizinsight.io',  role: 'admin',      avatar: 'RM' },
  { name: 'David Chen',   email: 'david@bizinsight.io',  role: 'viewer',     avatar: 'DC' },
];

async function seed() {
  const ok = await testConnection();
  if (!ok) {
    console.error('❌ Cannot connect to PostgreSQL. Make sure it is running and .env is set.');
    process.exit(1);
  }

  console.log('\n📦 Seeding users...\n');
  const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  for (const user of USERS) {
    try {
      const result = await query(
        `INSERT INTO users (name, email, password, role, avatar, status, joined)
         VALUES ($1, $2, $3, $4, $5, 'Active', CURRENT_DATE)
         ON CONFLICT (email) DO UPDATE
           SET password = EXCLUDED.password,
               role     = EXCLUDED.role
         RETURNING id, name, email, role`,
        [user.name, user.email, hash, user.role, user.avatar]
      );
      console.log(`  ✅ ${result.rows[0].role.padEnd(12)} ${result.rows[0].name} <${result.rows[0].email}>`);
    } catch (err) {
      console.error(`  ❌ Failed for ${user.email}:`, err.message);
    }
  }

  console.log('\n📦 Seeding permissions...\n');
  const MODULES = ['dashboard','analytics','sentiment','competitor','predictions','liveData','dataSources','reports','settings'];
  const ADMIN_OFF  = [];
  const VIEWER_OFF = ['analytics','sentiment','competitor','predictions','dataSources','reports','settings'];

  for (const module of MODULES) {
    try {
      await query(
        `INSERT INTO role_permissions (role, module, enabled)
         VALUES ('admin',  $1, $2),
                ('viewer', $1, $3)
         ON CONFLICT (role, module) DO NOTHING`,
        [module, !ADMIN_OFF.includes(module), !VIEWER_OFF.includes(module)]
      );
      console.log(`  ✅ ${module}`);
    } catch(err) {
      console.error(`  ❌ ${module}:`, err.message);
    }
  }

  console.log('\n✅ Seeding complete!\n');
  process.exit(0);
}

seed();
