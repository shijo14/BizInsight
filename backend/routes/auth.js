import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/db.js';

const router = Router();

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await query(
      'SELECT id, name, email, password, role, avatar, status FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Update last_active
    await query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    // Don't send the password hash back
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });

  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── GET /api/auth/users ───────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, avatar, status, joined, last_active FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Auth] Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ── POST /api/auth/users ──────────────────────────────────────
router.post('/users', async (req, res) => {
  const { name, email, password, role, avatar } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required.' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const avatarCode = avatar || (name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2));
    const result = await query(
      `INSERT INTO users (name, email, password, role, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, avatar, status, joined`,
      [name, email.toLowerCase().trim(), hash, role || 'viewer', avatarCode]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }
    console.error('[Auth] Create user error:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// ── PATCH /api/auth/users/:id ─────────────────────────────────
router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;

  try {
    const fields = [];
    const values = [];
    let i = 1;
    if (role)   { fields.push(`role = $${i++}`);   values.push(role); }
    if (status) { fields.push(`status = $${i++}`); values.push(status); }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update.' });
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, role, status`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('[Auth] Update user error:', err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// ── DELETE /api/auth/users/:id ────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[Auth] Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ── GET /api/auth/permissions ─────────────────────────────────
router.get('/permissions', async (req, res) => {
  try {
    const result = await query('SELECT role, module, enabled FROM role_permissions ORDER BY role, module');
    // Build object shape: { admin: { analytics: true, ... }, viewer: { ... } }
    const perms = {};
    result.rows.forEach(({ role, module, enabled }) => {
      if (!perms[role]) perms[role] = {};
      perms[role][module] = enabled;
    });
    res.json(perms);
  } catch (err) {
    console.error('[Auth] Fetch permissions error:', err);
    res.status(500).json({ error: 'Failed to fetch permissions.' });
  }
});

// ── PATCH /api/auth/permissions ───────────────────────────────
router.patch('/permissions', async (req, res) => {
  const { role, module, enabled } = req.body;
  if (!role || !module || enabled === undefined) {
    return res.status(400).json({ error: 'role, module, and enabled are required.' });
  }
  try {
    await query(
      `INSERT INTO role_permissions (role, module, enabled)
       VALUES ($1, $2, $3)
       ON CONFLICT (role, module) DO UPDATE SET enabled = $3`,
      [role, module, enabled]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[Auth] Update permissions error:', err);
    res.status(500).json({ error: 'Failed to update permission.' });
  }
});

export default router;
