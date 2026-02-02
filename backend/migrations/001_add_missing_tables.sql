-- ============================================
-- AfriAds Platform - Add Missing Tables
-- ============================================
-- This migration adds only the tables that don't exist yet
-- Run as: psql -U afriads_user -d afriads_db -f add_missing_tables.sql
-- ============================================

BEGIN;

-- Ad Placements (Where ads are shown on publisher websites)
CREATE TABLE IF NOT EXISTS ad_placements (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    placement_type VARCHAR(50) NOT NULL, -- 'header', 'sidebar', 'footer', 'in-content', 'popup'
    ad_format VARCHAR(50), -- '300x250', '728x90', 'responsive', etc.
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table (Advertiser payments/deposits)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'bank_transfer', 'mpesa'
    
    -- Transaction Info
    transaction_id VARCHAR(255) UNIQUE,
    payment_gateway VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Metadata
    description TEXT,
    metadata JSONB, -- Store additional payment gateway data
    
    -- Timestamps
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts Table (Publisher earnings withdrawals)
CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payout Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payout_method VARCHAR(50), -- 'stripe', 'paypal', 'bank_transfer', 'mpesa'
    
    -- Account Details (encrypted/tokenized)
    account_details JSONB, -- Store payment account info securely
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Transaction Info
    transaction_id VARCHAR(255),
    
    -- Metadata
    description TEXT,
    notes TEXT,
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Reports (Aggregated analytics for performance)
CREATE TABLE IF NOT EXISTS daily_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    
    -- Entity identifiers
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    ad_creative_id INTEGER REFERENCES ad_creatives(id) ON DELETE CASCADE,
    website_id INTEGER REFERENCES websites(id) ON DELETE SET NULL,
    
    -- Metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    -- Financial
    spend DECIMAL(10, 2) DEFAULT 0.00,
    revenue DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Performance Metrics
    ctr DECIMAL(5, 4) DEFAULT 0.0000, -- Click-through rate
    cvr DECIMAL(5, 4) DEFAULT 0.0000, -- Conversion rate
    cpc DECIMAL(10, 4) DEFAULT 0.0000, -- Cost per click
    cpm DECIMAL(10, 4) DEFAULT 0.0000, -- Cost per mille
    cpa DECIMAL(10, 4) DEFAULT 0.0000, -- Cost per acquisition
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate reports
    UNIQUE(report_date, campaign_id, ad_creative_id, website_id)
);

-- Blocked IPs (For fraud prevention)
CREATE TABLE IF NOT EXISTS blocked_ips (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    reason TEXT,
    blocked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    block_type VARCHAR(20) DEFAULT 'permanent' CHECK (block_type IN ('permanent', 'temporary')),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions (Track login sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'campaign_approved', 'low_budget', 'payout_processed', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs (Audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'login', 'create_campaign', 'approve_ad', etc.
    entity_type VARCHAR(50), -- 'campaign', 'ad_creative', 'website', etc.
    entity_id INTEGER,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys (For publisher integration)
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    secret_key VARCHAR(255),
    permissions JSONB, -- Array of allowed actions
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Ad Placements indexes
CREATE INDEX IF NOT EXISTS idx_ad_placements_website ON ad_placements(website_id);
CREATE INDEX IF NOT EXISTS idx_ad_placements_status ON ad_placements(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_publisher ON payouts(publisher_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at);

-- Daily Reports indexes
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_campaign ON daily_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_website ON daily_reports(website_id);

-- Blocked IPs index
CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON blocked_ips(ip_address);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Activity Logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- API Keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);

-- ============================================
-- ADD TRIGGERS FOR UPDATED_AT
-- ============================================

-- Apply triggers to new tables with updated_at column
DROP TRIGGER IF EXISTS update_ad_placements_updated_at ON ad_placements;
CREATE TRIGGER update_ad_placements_updated_at
    BEFORE UPDATE ON ad_placements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payouts_updated_at ON payouts;
CREATE TRIGGER update_payouts_updated_at
    BEFORE UPDATE ON payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE USEFUL VIEWS
-- ============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS campaign_performance CASCADE;
DROP VIEW IF EXISTS publisher_earnings CASCADE;

-- Campaign Performance View
CREATE VIEW campaign_performance AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.advertiser_id,
    u.email AS advertiser_email,
    u.company_name,
    c.status,
    c.daily_budget,
    c.total_budget,
    c.spent_amount,
    c.bid_type,
    c.bid_amount,
    COALESCE(SUM(dr.impressions), 0) AS total_impressions,
    COALESCE(SUM(dr.clicks), 0) AS total_clicks,
    COALESCE(SUM(dr.conversions), 0) AS total_conversions,
    COALESCE(SUM(dr.spend), 0) AS total_spend,
    CASE 
        WHEN SUM(dr.impressions) > 0 
        THEN ROUND((SUM(dr.clicks)::DECIMAL / SUM(dr.impressions) * 100), 2)
        ELSE 0 
    END AS ctr,
    CASE 
        WHEN SUM(dr.clicks) > 0 
        THEN ROUND((SUM(dr.conversions)::DECIMAL / SUM(dr.clicks) * 100), 2)
        ELSE 0 
    END AS cvr,
    c.created_at,
    c.updated_at
FROM campaigns c
LEFT JOIN users u ON c.advertiser_id = u.id
LEFT JOIN daily_reports dr ON c.id = dr.campaign_id
GROUP BY c.id, u.email, u.company_name;

-- Publisher Earnings View
CREATE VIEW publisher_earnings AS
SELECT 
    w.publisher_id,
    u.email AS publisher_email,
    u.company_name,
    w.id AS website_id,
    w.name AS website_name,
    w.url AS website_url,
    COALESCE(SUM(dr.impressions), 0) AS total_impressions,
    COALESCE(SUM(dr.clicks), 0) AS total_clicks,
    COALESCE(SUM(dr.revenue), 0) AS total_earnings,
    COUNT(DISTINCT dr.campaign_id) AS campaigns_served
FROM websites w
LEFT JOIN users u ON w.publisher_id = u.id
LEFT JOIN daily_reports dr ON w.id = dr.website_id
GROUP BY w.publisher_id, u.email, u.company_name, w.id, w.name, w.url;

-- ============================================
-- VERIFY MIGRATION
-- ============================================

-- List all tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

COMMIT;

-- Success message
\echo '✅ Migration completed successfully!'
\echo 'New tables added:'
\echo '  - ad_placements'
\echo '  - payments'
\echo '  - payouts'
\echo '  - daily_reports'
\echo '  - blocked_ips'
\echo '  - user_sessions'
\echo '  - notifications'
\echo '  - activity_logs'
\echo '  - api_keys'
