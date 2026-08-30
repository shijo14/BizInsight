import pool from './db.js';

const run = async () => {
  try {
    const client = await pool.connect();
    console.log('[Migration] Creating company_profile table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_profile (
        id              SERIAL PRIMARY KEY,
        company_name    TEXT    NOT NULL DEFAULT 'My Company',
        industry        TEXT    NOT NULL DEFAULT 'Technology',
        headquarters    TEXT    DEFAULT 'India',
        description     TEXT,
        base_revenue    NUMERIC(15,2) DEFAULT 0,
        base_users      INT          DEFAULT 0,
        currency        TEXT         DEFAULT 'INR',
        competitors     TEXT[]       DEFAULT '{}',
        market_segment  TEXT         DEFAULT 'B2B',
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('[Migration] Seeding initial company profile...');
    await client.query(`
      INSERT INTO company_profile (id, company_name, industry, headquarters, description, base_revenue, base_users, competitors, market_segment)
      VALUES (1, 'BizInsight Inc.', 'SaaS Analytics', 'India', 'AI-powered business intelligence platform for modern enterprises.', 7040086, 1204, ARRAY['DataPulse','Metrify','InsightIQ'], 'B2B')
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log('[Migration] Done!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('[Migration] Failed:', err);
    process.exit(1);
  }
};

run();
