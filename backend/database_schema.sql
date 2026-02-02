-- AfriAds Platform Database Schema

-- Users Table (Both Advertisers and Publishers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('advertiser', 'publisher', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns Table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    daily_budget DECIMAL(10, 2),
    total_budget DECIMAL(10, 2),
    spent_amount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'expired')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    bid_type VARCHAR(20) DEFAULT 'cpm' CHECK (bid_type IN ('cpm', 'cpc', 'cpa')),
    bid_amount DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad Creatives Table
CREATE TABLE ad_creatives (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ad_type VARCHAR(20) NOT NULL CHECK (ad_type IN ('display', 'video', 'native', 'push', 'interstitial')),
    format VARCHAR(50), -- e.g., '300x250', '728x90', 'video'
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    destination_url VARCHAR(500) NOT NULL,
    call_to_action VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'paused')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publisher Websites Table
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    monthly_visitors INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad Zones/Placements Table
CREATE TABLE ad_zones (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(20) NOT NULL CHECK (zone_type IN ('display', 'video', 'native', 'push', 'interstitial')),
    dimensions VARCHAR(50), -- e.g., '300x250'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Targeting Rules Table
CREATE TABLE targeting_rules (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    countries TEXT[], -- Array of country codes
    cities TEXT[], -- Array of cities
    device_types TEXT[], -- ['mobile', 'desktop', 'tablet']
    operating_systems TEXT[], -- ['windows', 'macos', 'android', 'ios']
    browsers TEXT[], -- ['chrome', 'firefox', 'safari']
    languages TEXT[],
    age_min INTEGER,
    age_max INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'all')),
    interests TEXT[],
    time_from TIME,
    time_to TIME,
    days_of_week TEXT[], -- ['monday', 'tuesday', etc.]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Impressions Table (For tracking ad views)
CREATE TABLE impressions (
    id BIGSERIAL PRIMARY KEY,
    ad_creative_id INTEGER REFERENCES ad_creatives(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    website_id INTEGER REFERENCES websites(id),
    ad_zone_id INTEGER REFERENCES ad_zones(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(20),
    os VARCHAR(50),
    browser VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cost DECIMAL(10, 4)
);

-- Create index for faster queries
CREATE INDEX idx_impressions_timestamp ON impressions(timestamp);
CREATE INDEX idx_impressions_campaign ON impressions(campaign_id);
CREATE INDEX idx_impressions_website ON impressions(website_id);

-- Clicks Table (For tracking ad clicks)
CREATE TABLE clicks (
    id BIGSERIAL PRIMARY KEY,
    impression_id BIGINT REFERENCES impressions(id),
    ad_creative_id INTEGER REFERENCES ad_creatives(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    website_id INTEGER REFERENCES websites(id),
    ad_zone_id INTEGER REFERENCES ad_zones(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cost DECIMAL(10, 4)
);

-- Create index for faster queries
CREATE INDEX idx_clicks_timestamp ON clicks(timestamp);
CREATE INDEX idx_clicks_campaign ON clicks(campaign_id);

-- Conversions Table (For tracking conversions/actions)
CREATE TABLE conversions (
    id BIGSERIAL PRIMARY KEY,
    click_id BIGINT REFERENCES clicks(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    conversion_type VARCHAR(50), -- 'sale', 'signup', 'download', etc.
    conversion_value DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (For financial tracking)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'ad_spend', 'earnings')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2),
    description TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table (For daily/hourly aggregated stats)
CREATE TABLE campaign_reports (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id),
    report_date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(10, 2) DEFAULT 0.00,
    revenue DECIMAL(10, 2) DEFAULT 0.00,
    ctr DECIMAL(5, 4), -- Click-through rate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, report_date)
);

CREATE TABLE website_reports (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id),
    report_date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    earnings DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(website_id, report_date)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_creatives_updated_at BEFORE UPDATE ON ad_creatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, status)
VALUES ('admin@afriads.com', '$2a$10$xVQGKvZ5aPqGLhLfUjJ9s.HHNLXqQ8yZE1zWNp8rGgfZJ9sXZXqPO', 'admin', 'Admin', 'User', 'active');
