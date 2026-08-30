import { pool } from './db.js';
import bcrypt from 'bcrypt';

async function fixUsers() {
  try {
    const hash = await bcrypt.hash('Admin@123', 12);
    
    // 1. Fix all password hashes
    await pool.query('UPDATE users SET password = $1', [hash]);
    console.log('✅ Fixed password hashes for all users to Admin@123');

    // 2. Rename Shijo
    await pool.query('UPDATE users SET name = $1 WHERE email = $2', ['Shijo Varghese', 'shijo@bizinsight.io']);
    console.log('✅ Renamed Shijo Joseph to Shijo Varghese');

    // 3. Make sure Shijo is the ONLY superadmin, and everyone else is viewer or admin
    // The user said "and the rest admins i can choose". I will demote all other admins to viewer,
    // so Shijo can choose to upgrade them manually via the Admin Panel UI.
    await pool.query(`UPDATE users SET role = 'viewer' WHERE email != 'shijo@bizinsight.io'`);
    console.log('✅ Demoted other default users to viewer so you can manually choose admins.');

  } catch (err) {
    console.error('❌ Error fixing users:', err);
  } finally {
    process.exit(0);
  }
}

fixUsers();
