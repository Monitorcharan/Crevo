"""
Apply Database Migrations directly to Supabase PostgreSQL
"""

import os
import sys
from pathlib import Path
import psycopg2

BACKEND_DIR = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = BACKEND_DIR / "migrations"
ENV_FILE = BACKEND_DIR / ".env"

if ENV_FILE.exists():
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

DB_HOST = os.environ.get("SUPABASE_DB_HOST", "aws-0-ap-south-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "5432"))
DB_USER = os.environ.get("SUPABASE_DB_USER", "postgres.vkjranivomjttumfsjhz")
DB_PASS = os.environ.get("SUPABASE_DB_PASSWORD", "")
DB_NAME = os.environ.get("SUPABASE_DB_NAME", "postgres")


def run_migrations():
    print(f"Connecting to Supabase PostgreSQL at {DB_HOST}...")
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
        sslmode="require",
    )
    conn.autocommit = True
    cur = conn.cursor()

    migration_files = [
        "001_initial_schema.sql",
        "002_seed_demo_data.sql",
    ]

    for fname in migration_files:
        fpath = MIGRATIONS_DIR / fname
        if not fpath.exists():
            print(f"File not found: {fpath}")
            continue

        print(f"\n---> Applying migration: {fname}")
        sql_content = fpath.read_text(encoding="utf-8")
        try:
            cur.execute(sql_content)
            print(f"[OK] Migration {fname} applied successfully!")
        except Exception as e:
            print(f"[ERROR] applying {fname}: {e}")
            conn.close()
            sys.exit(1)

    print("\n---> Verifying tables in public schema:")
    cur.execute(
        """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
        """
    )
    tables = cur.fetchall()
    for (t,) in tables:
        print(f"  * {t}")

    print("\n---> Verifying seed creators count:")
    cur.execute("SELECT count(*) FROM public.creator_profiles;")
    count = cur.fetchone()[0]
    print(f"  * Total creator profiles in DB: {count}")

    print("\n---> Verifying portfolio items count:")
    cur.execute("SELECT count(*) FROM public.portfolio_items;")
    p_count = cur.fetchone()[0]
    print(f"  * Total portfolio items in DB: {p_count}")

    conn.close()
    print("\nAll database migrations applied and verified successfully!")


if __name__ == "__main__":
    run_migrations()
