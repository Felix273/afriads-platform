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
        AND (c.start_date IS NULL OR c.start_date <= NOW())
        AND (c.end_date IS NULL OR c.end_date >= NOW())
        AND (c.total_budget IS NULL OR c.spent_amount < c.total_budget)
        AND (tr.countries IS NULL OR $1 = ANY(tr.countries))
        AND (tr.device_types IS NULL OR $2 = ANY(tr.device_types))
        AND (tr.operating_systems IS NULL OR $3 = ANY(tr.operating_systems) OR $3 = 'unknown')
        AND (tr.browsers IS NULL OR $4 = ANY(tr.browsers) OR $4 = 'unknown')
      ORDER BY c.bid_amount DESC
      LIMIT 1
    `;

    const adResult = await query(adsQuery, [country, deviceType, os, browser]);

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
          click_url: `${req.protocol}://${req.get('host')}/api/ad-serve/click/${impressionId}`
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

    // Get destination URL
    const adResult = await query(
      'SELECT destination_url FROM ad_creatives WHERE id = $1',
      [impression.ad_creative_id]
    );

    const destinationUrl = adResult.rows[0].destination_url;

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

module.exports = {
  serveAd,
  trackClick,
  getAdStats
};
