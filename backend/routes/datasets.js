import { Router } from 'express';
import { query } from '../db/db.js';

const router = Router();

// ── GET /api/datasets ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT d.id, d.filename, d.data_type, d.rows_processed, d.columns_detected,
              d.size_kb, d.uploaded_at, u.name AS uploaded_by_name
       FROM datasets d
       LEFT JOIN users u ON u.id = d.uploaded_by
       ORDER BY d.uploaded_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Datasets] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch datasets.' });
  }
});

// ── POST /api/datasets (called after upload succeeds) ─────────
router.post('/', async (req, res) => {
  const { uploaded_by, filename, data_type, rows_processed, columns_detected, size_kb } = req.body;
  try {
    const result = await query(
      `INSERT INTO datasets (uploaded_by, filename, data_type, rows_processed, columns_detected, size_kb)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uploaded_by || null, filename, data_type, rows_processed, columns_detected, size_kb]
    );
    res.json({ success: true, dataset: result.rows[0] });
  } catch (err) {
    console.error('[Datasets] Insert error:', err);
    res.status(500).json({ error: 'Failed to save dataset record.' });
  }
});

// ── DELETE /api/datasets/:id ──────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM datasets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[Datasets] Delete error:', err);
    res.status(500).json({ error: 'Failed to delete dataset.' });
  }
});

export default router;
