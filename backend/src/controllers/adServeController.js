// src/controllers/adServeController.js
const { query } = require('../config/database');

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    deviceType = 'mobile';
  }

  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';

  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('safari')) browser = 'safari';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('edge')) browser = 'edge';

  return { deviceType, os, browser };
};

// Serve ad
const serveAd = async (req, res) => {
  try {
    const { zone_id, website_id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!zone_id || !website_id) {
      return res.status(400).json({
        success: false,
        message: 'zone_id and website_id are required'
      });
    }

    const zoneResult = await query(
      `SELECT az.id, az.zone_type, az.dimensions, az.status, w.status as website_status
       FROM ad_zones az
       INNER JOIN websites w ON az.website_id = w.id
       WHERE az.id = $1 AND az.website_id = $2`,
      [zone_id, website_id]
    );

    if (zoneResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad zone not found for this website'
      });
    }

    const zone = zoneResult.rows[0];

    if (zone.status !== 'active' || !['approved', 'active'].includes(zone.website_status)) {
      return res.status(403).json({
        success: false,
        message: 'Ad zone is not available'
      });
    }

    // Parse user agent
    const { deviceType, os, browser } = parseUserAgent(userAgent);

    // Get country from IP (for now, we'll use a placeholder - you can integrate with GeoIP later)
    const country = 'Kenya'; // TODO: Implement GeoIP lookup
    const city = 'Nairobi'; // TODO: Implement GeoIP lookup

    // Debug logging
    console.log('Ad Request:', { zone_id, website_id, deviceType, os, browser, country, city });

    // Find matching ads based on targeting
    const adsQuery = `
      SELECT 
        ac.id as creative_id,
        ac.campaign_id,
        ac.name,
        ac.ad_type,
        ac.format,
        ac.title,
        ac.description,
        ac.image_url,
        ac.video_url,
        ac.destination_url,
        ac.call_to_action,
        c.bid_amount,
        c.bid_type,
        c.daily_budget,
        c.total_budget,
        c.spent_amount,
        tr.countries,
        tr.device_types,
        tr.operating_systems,
        tr.browsers
      FROM ad_creatives ac
      INNER JOIN campaigns c ON ac.campaign_id = c.id
      LEFT JOIN targeting_rules tr ON c.id = tr.campaign_id
      INNER JOIN users u ON c.advertiser_id = u.id
      WHERE ac.status = 'active'
        AND c.status = 'active'
        AND u.status = 'active'
        AND ac.ad_type = $5
        AND ($6::VARCHAR IS NULL OR ac.format IS NULL OR ac.format = $6)
        AND (c.start_date IS NULL OR c.start_date <= NOW())
        AND (c.end_date IS NULL OR c.end_date >= NOW())
        AND (c.total_budget IS NULL OR c.spent_amount < c.total_budget)
        AND (
          c.daily_budget IS NULL
          OR (
            COALESCE((
              SELECT SUM(i2.cost)
              FROM impressions i2
              WHERE i2.campaign_id = c.id
              AND DATE(i2.timestamp) = CURRENT_DATE
            ), 0)
            + COALESCE((
              SELECT SUM(c2.cost)
              FROM clicks c2
              WHERE c2.campaign_id = c.id
              AND DATE(c2.timestamp) = CURRENT_DATE
            ), 0)
          ) < c.daily_budget
        )
        AND (tr.countries IS NULL OR $1 = ANY(tr.countries))
        AND (tr.device_types IS NULL OR $2 = ANY(tr.device_types))
        AND (tr.operating_systems IS NULL OR $3 = ANY(tr.operating_systems) OR $3 = 'unknown')
        AND (tr.browsers IS NULL OR $4 = ANY(tr.browsers) OR $4 = 'unknown')
      ORDER BY c.bid_amount DESC
      LIMIT 1
    `;

    const adResult = await query(adsQuery, [
      country,
      deviceType,
      os,
      browser,
      zone.zone_type,
      zone.dimensions
    ]);

    console.log('Ads found:', adResult.rows.length);
    if (adResult.rows.length > 0) {
      console.log('Selected ad:', adResult.rows[0]);
    }


    if (adResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No ads available'
      });
    }

    const ad = adResult.rows[0];

    // Calculate cost based on bid type
    let cost = 0;
    if (ad.bid_type === 'cpm') {
      cost = parseFloat(ad.bid_amount) / 1000; // Cost per impression
    }

    // Record impression
    const impressionResult = await query(
      `INSERT INTO impressions 
       (ad_creative_id, campaign_id, website_id, ad_zone_id, ip_address, user_agent, country, city, device_type, os, browser, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        ad.creative_id,
        ad.campaign_id,
        website_id,
        zone_id,
        ipAddress,
        userAgent,
        country,
        city,
        deviceType,
        os,
        browser,
        cost
      ]
    );

    const impressionId = impressionResult.rows[0].id;

    // Update campaign spend
    await query(
      'UPDATE campaigns SET spent_amount = spent_amount + $1 WHERE id = $2',
      [cost, ad.campaign_id]
    );

    // Return ad data
    res.json({
      success: true,
      data: {
        impression_id: impressionId,
        ad: {
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          video_url: ad.video_url,
          destination_url: ad.destination_url,
          call_to_action: ad.call_to_action,
          format: ad.format,
          ad_type: ad.ad_type
        },
        tracking: {
          click_url: `${process.env.BASE_URL || `${req.protocol}://${req.get('host')}`}/api/ad-serve/click/${impressionId}`
        }
      }
    });
  } catch (error) {
    console.error('Serve ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve ad',
      error: error.message
    });
  }
};

// Track click
const trackClick = async (req, res) => {
  try {
    const { impression_id } = req.params;
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Get impression details
    const impressionResult = await query(
      'SELECT * FROM impressions WHERE id = $1',
      [impression_id]
    );

    if (impressionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Impression not found'
      });
    }

    const impression = impressionResult.rows[0];

    const adResult = await query(
      'SELECT destination_url FROM ad_creatives WHERE id = $1',
      [impression.ad_creative_id]
    );

    const destinationUrl = adResult.rows[0].destination_url;

    const duplicateClick = await query(
      `SELECT id FROM clicks
       WHERE impression_id = $1 AND ip_address = $2
       LIMIT 1`,
      [impression_id, ipAddress]
    );

    if (duplicateClick.rows.length > 0) {
      return res.redirect(destinationUrl);
    }

    // Get campaign bid info
    const campaignResult = await query(
      'SELECT bid_type, bid_amount FROM campaigns WHERE id = $1',
      [impression.campaign_id]
    );

    const campaign = campaignResult.rows[0];

    // Calculate cost for click
    let cost = 0;
    if (campaign.bid_type === 'cpc') {
      cost = parseFloat(campaign.bid_amount);
    }

    // Record click
    await query(
      `INSERT INTO clicks 
       (impression_id, ad_creative_id, campaign_id, website_id, ad_zone_id, ip_address, user_agent, country, city, device_type, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        impression_id,
        impression.ad_creative_id,
        impression.campaign_id,
        impression.website_id,
        impression.ad_zone_id,
        ipAddress,
        userAgent,
        impression.country,
        impression.city,
        impression.device_type,
        cost
      ]
    );

    // Update campaign spend if CPC
    if (cost > 0) {
      await query(
        'UPDATE campaigns SET spent_amount = spent_amount + $1 WHERE id = $2',
        [cost, impression.campaign_id]
      );
    }

    // Redirect to destination
    res.redirect(destinationUrl);
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message
    });
  }
};

// Get ad statistics
const getAdStats = async (req, res) => {
  try {
    const { campaign_id, start_date, end_date } = req.query;

    let queryText = `
      SELECT 
        DATE(i.timestamp) as date,
        COUNT(DISTINCT i.id) as impressions,
        COUNT(DISTINCT c.id) as clicks,
        SUM(i.cost + COALESCE(c.cost, 0)) as total_cost,
        CASE WHEN COUNT(DISTINCT i.id) > 0 
          THEN (COUNT(DISTINCT c.id)::float / COUNT(DISTINCT i.id)) * 100 
          ELSE 0 
        END as ctr
      FROM impressions i
      LEFT JOIN clicks c ON i.id = c.impression_id
      WHERE 1=1
    `;

    const params = [];

    if (campaign_id) {
      queryText += ` AND i.campaign_id = $${params.length + 1}`;
      params.push(campaign_id);
    }

    if (start_date) {
      queryText += ` AND DATE(i.timestamp) >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      queryText += ` AND DATE(i.timestamp) <= $${params.length + 1}`;
      params.push(end_date);
    }

    queryText += ' GROUP BY DATE(i.timestamp) ORDER BY date DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get ad stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};

// Track conversion
const trackConversion = async (req, res) => {
  try {
    const { impression_id, conversion_type, conversion_value } = req.body;

    if (!impression_id) {
      return res.status(400).json({
        success: false,
        message: 'impression_id is required'
      });
    }

    // Get impression details
    const impressionResult = await query(
      'SELECT * FROM impressions WHERE id = $1',
      [impression_id]
    );

    if (impressionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Impression not found'
      });
    }

    const impression = impressionResult.rows[0];

    // Get click for this impression (if exists)
    const clickResult = await query(
      'SELECT id FROM clicks WHERE impression_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [impression_id]
    );

    if (clickResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No click found for this impression'
      });
    }

    const click = clickResult.rows[0];

    // Get campaign bid info
    const campaignResult = await query(
      'SELECT bid_type, bid_amount FROM campaigns WHERE id = $1',
      [impression.campaign_id]
    );

    const campaign = campaignResult.rows[0];

    // Calculate cost for conversion (if CPA)
    let cost = 0;
    if (campaign.bid_type === 'cpa') {
      cost = parseFloat(campaign.bid_amount);
    }

    // Record conversion
    const conversionResult = await query(
      `INSERT INTO conversions 
       (click_id, campaign_id, conversion_type, conversion_value)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        click.id,
        impression.campaign_id,
        conversion_type || 'sale',
        conversion_value || cost
      ]
    );

    // Update campaign spend if CPA
    if (cost > 0) {
      await query(
        'UPDATE campaigns SET spent_amount = spent_amount + $1 WHERE id = $2',
        [cost, impression.campaign_id]
      );
    }

    res.json({
      success: true,
      data: {
        conversion_id: conversionResult.rows[0].id,
        message: 'Conversion tracked successfully'
      }
    });
  } catch (error) {
    console.error('Track conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track conversion',
      error: error.message
    });
  }
};

// Fraud detection - check if IP is blocked
const checkBlockedIP = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await query(
      'SELECT * FROM blocked_ips WHERE ip_address = $1 AND (block_type = $2 OR expires_at > NOW())',
      [ipAddress, 'permanent']
    );

    if (result.rows.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  } catch (error) {
    console.error('Check blocked IP error:', error);
    next();
  }
};

module.exports = {
  serveAd,
  trackClick,
  getAdStats,
  trackConversion,
  checkBlockedIP
};
