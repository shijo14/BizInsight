#!/bin/bash
# ================================================================
# BizInsight — PostgreSQL Setup Script (Fedora Linux)
# Run this ONCE to initialise your database.
# Usage: bash db/setup.sh
# ================================================================

set -e

DB_NAME="bizinsight"
DB_USER="bizinsight"
DB_PASS="bizinsight123"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  BizInsight — PostgreSQL Setup           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1. Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  echo "❌ PostgreSQL not found. Installing now..."
  sudo dnf install -y postgresql postgresql-server postgresql-contrib
  echo "✅ PostgreSQL installed."
else
  echo "✅ PostgreSQL already installed: $(psql --version)"
fi

# 2. Initialise the PostgreSQL data directory (first time only)
if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
  echo "📦 Initialising PostgreSQL data directory..."
  sudo postgresql-setup --initdb
fi

# 3. Enable and start the PostgreSQL service
echo "🔄 Enabling and starting PostgreSQL..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo "✅ PostgreSQL service is running."
echo ""

# 4. Create the database user and database
echo "🔑 Creating database user '$DB_USER' and database '$DB_NAME'..."
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
    RAISE NOTICE 'User created.';
  ELSE
    RAISE NOTICE 'User already exists, skipping.';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "✅ User and database ready."
echo ""

# 5. Run the schema file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📄 Running schema.sql..."
PGPASSWORD=$DB_PASS psql -U $DB_USER -d $DB_NAME -h localhost -f "$SCRIPT_DIR/schema.sql"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ Database setup COMPLETE!             ║"
echo "║  DB:   $DB_NAME                          ║"
echo "║  User: $DB_USER                          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "⚠️  NOTE: If psql authentication fails, edit:"
echo "    /var/lib/pgsql/data/pg_hba.conf"
echo "    Change 'ident' to 'md5' for local connections."
echo "    Then restart: sudo systemctl restart postgresql"
echo ""
