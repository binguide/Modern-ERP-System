-- Initial database setup for Modern ERP
-- This script runs once on first PostgreSQL container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Optional: create a separate read-only role (for future)
-- CREATE ROLE erp_readonly LOGIN PASSWORD 'readonly_password' NOSUPERUSER NOINHERIT;
-- GRANT CONNECT ON DATABASE modern_erp TO erp_readonly;

SELECT 'Modern ERP database initialized' AS status;
