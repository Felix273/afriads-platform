// src/controllers/publisherController.js
const { query } = require('../config/database');

// Submit website for approval
const submitWebsite = async (req, res) => {
  try {
    const { name, url, category, monthly_visitors } = req.body;

    // Validation
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Website name and URL are required'
      });
    }

    // Check if URL already exists
    const existing = await query(
      'SELECT id FROM websites WHERE url = $1',
      [url]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This website is already registered'
      });
    }

    // Create website
    const result = await query(
      `INSERT INTO websites (publisher_id, name, url, category, monthly_visitors, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user.id, name, url, category || null, monthly_visitors || null]
    );

    res.status(201).json({
      success: true,
      message: 'Website submitted for approval',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit website',
      error: error.message
    });
  }
};

// Get publisher's websites
const getWebsites = async (req, res) => {
  try {
    const result = await query(
      `SELECT w.*, 
              COALESCE(z.zones_count, 0)::INTEGER as zones_count,
              (COALESCE(i.impressions, 0) + COALESCE(wr.reported_impressions, 0))::INTEGER as total_impressions,
              (COALESCE(c.clicks, 0) + COALESCE(wr.reported_clicks, 0))::INTEGER as total_clicks,
              (COALESCE(i.impression_earnings, 0) + COALESCE(c.click_earnings, 0) + COALESCE(wr.reported_earnings, 0))::DECIMAL(10, 2) as total_earnings
       FROM websites w
       LEFT JOIN (
         SELECT website_id, COUNT(*) as zones_count
         FROM ad_zones
         GROUP BY website_id
       ) z ON z.website_id = w.id
       LEFT JOIN (
         SELECT website_id, COUNT(*) as impressions, COALESCE(SUM(cost), 0) as impression_earnings
         FROM impressions
         GROUP BY website_id
       ) i ON i.website_id = w.id
       LEFT JOIN (
         SELECT website_id, COUNT(*) as clicks, COALESCE(SUM(cost), 0) as click_earnings
         FROM clicks
         GROUP BY website_id
       ) c ON c.website_id = w.id
       LEFT JOIN (
         SELECT website_id,
                COALESCE(SUM(impressions), 0) as reported_impressions,
                COALESCE(SUM(clicks), 0) as reported_clicks,
                COALESCE(SUM(earnings), 0) as reported_earnings
         FROM website_reports
         GROUP BY website_id
       ) wr ON wr.website_id = w.id
       WHERE w.publisher_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get websites',
      error: error.message
    });
  }
};

// Get single website
const getWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT w.*,
              COALESCE(z.zones_count, 0)::INTEGER as zones_count,
              COALESCE(i.impressions, 0)::INTEGER as total_impressions,
              COALESCE(c.clicks, 0)::INTEGER as total_clicks,
              (COALESCE(i.impression_earnings, 0) + COALESCE(c.click_earnings, 0))::DECIMAL(10, 2) as total_earnings
       FROM websites w
       LEFT JOIN (
         SELECT website_id, COUNT(*) as zones_count
         FROM ad_zones
         GROUP BY website_id
       ) z ON z.website_id = w.id
       LEFT JOIN (
         SELECT website_id, COUNT(*) as impressions, COALESCE(SUM(cost), 0) as impression_earnings
         FROM impressions
         GROUP BY website_id
       ) i ON i.website_id = w.id
       LEFT JOIN (
         SELECT website_id, COUNT(*) as clicks, COALESCE(SUM(cost), 0) as click_earnings
         FROM clicks
         GROUP BY website_id
       ) c ON c.website_id = w.id
       WHERE w.id = $1 AND w.publisher_id = $2
       GROUP BY w.id, z.zones_count, i.impressions, i.impression_earnings, c.clicks, c.click_earnings`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website',
      error: error.message
    });
  }
};

// Create ad zone
const createAdZone = async (req, res) => {
  try {
    const { website_id } = req.params;
    const { name, zone_type, dimensions } = req.body;

    // Verify website ownership
    const websiteCheck = await query(
      'SELECT id, status FROM websites WHERE id = $1 AND publisher_id = $2',
      [website_id, req.user.id]
    );

    if (websiteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    if (websiteCheck.rows[0].status !== 'approved' && websiteCheck.rows[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Website must be approved before creating ad zones'
      });
    }

    // Validation
    if (!name || !zone_type) {
      return res.status(400).json({
        success: false,
        message: 'Zone name and type are required'
      });
    }

    // Create zone
    const result = await query(
      `INSERT INTO ad_zones (website_id, name, zone_type, dimensions, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [website_id, name, zone_type, dimensions || null]
    );

    res.status(201).json({
      success: true,
      message: 'Ad zone created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create ad zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ad zone',
      error: error.message
    });
  }
};

// Get ad zones for website
const getAdZones = async (req, res) => {
  try {
    const { website_id } = req.params;

    // Verify website ownership
    const websiteCheck = await query(
      'SELECT id FROM websites WHERE id = $1 AND publisher_id = $2',
      [website_id, req.user.id]
    );

    if (websiteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    const result = await query(
      `SELECT az.*,
              COALESCE(i.total_impressions, 0)::INTEGER as total_impressions,
              COALESCE(c.total_clicks, 0)::INTEGER as total_clicks,
              (COALESCE(i.impression_earnings, 0) + COALESCE(c.click_earnings, 0))::DECIMAL(10, 2) as total_earnings
       FROM ad_zones az
       LEFT JOIN (
         SELECT ad_zone_id, COUNT(*) as total_impressions, COALESCE(SUM(cost), 0) as impression_earnings
         FROM impressions
         GROUP BY ad_zone_id
       ) i ON i.ad_zone_id = az.id
       LEFT JOIN (
         SELECT ad_zone_id, COUNT(*) as total_clicks, COALESCE(SUM(cost), 0) as click_earnings
         FROM clicks
         GROUP BY ad_zone_id
       ) c ON c.ad_zone_id = az.id
       WHERE az.website_id = $1
       ORDER BY az.created_at DESC`,
      [website_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get ad zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ad zones',
      error: error.message
    });
  }
};

// Get ad tag code
const getAdTag = async (req, res) => {
  try {
    const { zone_id } = req.params;

    // Verify zone ownership
    const zoneCheck = await query(
      `SELECT az.id, az.website_id, w.publisher_id
       FROM ad_zones az
       INNER JOIN websites w ON az.website_id = w.id
       WHERE az.id = $1 AND w.publisher_id = $2`,
      [zone_id, req.user.id]
    );

    if (zoneCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad zone not found'
      });
    }

    const websiteId = zoneCheck.rows[0].website_id;
    const publicBaseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    // Generate ad tag code
    const adTag = `<!-- AfriAds Ad Zone ${zone_id} -->
<div id="afriads-zone-${zone_id}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${publicBaseUrl}/ad-widget.js';
  script.async = true;
  script.onload = function() {
    AfriAds.loadAd({
      zoneId: ${zone_id},
      websiteId: ${websiteId},
      containerId: 'afriads-zone-${zone_id}'
    });
  };
  document.head.appendChild(script);
})();
</script>`;

    res.json({
      success: true,
      data: {
        zone_id,
        website_id: websiteId,
        ad_tag: adTag
      }
    });
  } catch (error) {
    console.error('Get ad tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ad tag',
      error: error.message
    });
  }
};

// Get publisher earnings
const getEarnings = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let queryText = `
      WITH impression_daily AS (
        SELECT
          DATE(i.timestamp) as report_date,
          i.website_id,
          COUNT(*)::INTEGER as impressions,
          COALESCE(SUM(i.cost), 0) as impression_earnings
        FROM impressions i
        INNER JOIN websites w ON w.id = i.website_id
        WHERE w.publisher_id = $1
        GROUP BY DATE(i.timestamp), i.website_id
      ),
      click_daily AS (
        SELECT
          DATE(c.timestamp) as report_date,
          c.website_id,
          COUNT(*)::INTEGER as clicks,
          COALESCE(SUM(c.cost), 0) as click_earnings
        FROM clicks c
        INNER JOIN websites w ON w.id = c.website_id
        WHERE w.publisher_id = $1
        GROUP BY DATE(c.timestamp), c.website_id
      )
      SELECT
        COALESCE(i.report_date, c.report_date) as report_date,
        w.name as website_name,
        COALESCE(i.impressions, 0)::INTEGER as impressions,
        COALESCE(c.clicks, 0)::INTEGER as clicks,
        (COALESCE(i.impression_earnings, 0) + COALESCE(c.click_earnings, 0))::DECIMAL(10, 2) as earnings
      FROM impression_daily i
      FULL OUTER JOIN click_daily c
        ON i.website_id = c.website_id
       AND i.report_date = c.report_date
      INNER JOIN websites w ON w.id = COALESCE(i.website_id, c.website_id)
      WHERE w.publisher_id = $1
    `;
    const params = [req.user.id];

    if (start_date) {
      queryText += ` AND COALESCE(i.report_date, c.report_date) >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      queryText += ` AND COALESCE(i.report_date, c.report_date) <= $${params.length + 1}`;
      params.push(end_date);
    }

    queryText += ' ORDER BY report_date DESC, website_name ASC';

    const result = await query(queryText, params);

    // Calculate totals
    const totals = result.rows.reduce((acc, row) => ({
      total_impressions: acc.total_impressions + parseInt(row.impressions || 0),
      total_clicks: acc.total_clicks + parseInt(row.clicks || 0),
      total_earnings: acc.total_earnings + parseFloat(row.earnings || 0)
    }), { total_impressions: 0, total_clicks: 0, total_earnings: 0 });

    res.json({
      success: true,
      data: {
        earnings: result.rows,
        totals
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings',
      error: error.message
    });
  }
};

module.exports = {
  submitWebsite,
  getWebsites,
  getWebsite,
  createAdZone,
  getAdZones,
  getAdTag,
  getEarnings
};
