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
              COUNT(DISTINCT az.id) as zones_count,
              COALESCE(SUM(wr.earnings), 0) as total_earnings,
              COALESCE(SUM(wr.impressions), 0) as total_impressions,
              COALESCE(SUM(wr.clicks), 0) as total_clicks
       FROM websites w
       LEFT JOIN ad_zones az ON w.id = az.website_id
       LEFT JOIN website_reports wr ON w.id = wr.website_id
       WHERE w.publisher_id = $1
       GROUP BY w.id
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
              COUNT(DISTINCT az.id) as zones_count
       FROM websites w
       LEFT JOIN ad_zones az ON w.id = az.website_id
       WHERE w.id = $1 AND w.publisher_id = $2
       GROUP BY w.id`,
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
              COUNT(DISTINCT i.id) as total_impressions,
              COUNT(DISTINCT c.id) as total_clicks
       FROM ad_zones az
       LEFT JOIN impressions i ON az.id = i.ad_zone_id
       LEFT JOIN clicks c ON az.id = c.ad_zone_id
       WHERE az.website_id = $1
       GROUP BY az.id
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

    // Generate ad tag code
    const adTag = `<!-- AfriAds Ad Zone ${zone_id} -->
<div id="afriads-zone-${zone_id}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${req.protocol}://${req.get('host')}/ad-widget.js';
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
      SELECT 
        wr.report_date,
        w.name as website_name,
        wr.impressions,
        wr.clicks,
        wr.earnings
      FROM website_reports wr
      INNER JOIN websites w ON wr.website_id = w.id
      WHERE w.publisher_id = $1
    `;
    const params = [req.user.id];

    if (start_date) {
      queryText += ` AND wr.report_date >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      queryText += ` AND wr.report_date <= $${params.length + 1}`;
      params.push(end_date);
    }

    queryText += ' ORDER BY wr.report_date DESC';

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
