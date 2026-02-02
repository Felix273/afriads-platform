// src/controllers/campaignController.js
const { query, transaction } = require('../config/database');

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const {
      name,
      daily_budget,
      total_budget,
      start_date,
      end_date,
      bid_type,
      bid_amount
    } = req.body;

    // Validation
    if (!name || !total_budget || !bid_type || !bid_amount) {
      return res.status(400).json({
        success: false,
        message: 'Name, total budget, bid type, and bid amount are required'
      });
    }

    if (!['cpm', 'cpc', 'cpa'].includes(bid_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid type. Must be cpm, cpc, or cpa'
      });
    }

    // Check if advertiser has sufficient balance
    const userResult = await query(
      'SELECT balance FROM users WHERE id = $1',
      [req.user.id]
    );

    if (parseFloat(userResult.rows[0].balance) < parseFloat(total_budget)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance. Please add funds to your account.'
      });
    }

    // Create campaign
    const result = await query(
      `INSERT INTO campaigns (advertiser_id, name, daily_budget, total_budget, start_date, end_date, bid_type, bid_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING *`,
      [
        req.user.id,
        name,
        daily_budget || null,
        total_budget,
        start_date || null,
        end_date || null,
        bid_type,
        bid_amount
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
};

// Get all campaigns for advertiser
const getCampaigns = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT c.*, 
             COUNT(ac.id) as creative_count,
             COALESCE(SUM(cr.impressions), 0) as total_impressions,
             COALESCE(SUM(cr.clicks), 0) as total_clicks,
             COALESCE(SUM(cr.spend), 0) as total_spend
      FROM campaigns c
      LEFT JOIN ad_creatives ac ON c.id = ac.campaign_id
      LEFT JOIN campaign_reports cr ON c.id = cr.campaign_id
      WHERE c.advertiser_id = $1
    `;
    const params = [req.user.id];

    if (status) {
      queryText += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM campaigns WHERE advertiser_id = $1';
    const countParams = [req.user.id];
    
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        campaigns: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaigns',
      error: error.message
    });
  }
};

// Get single campaign
const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, 
              COALESCE(SUM(cr.impressions), 0) as total_impressions,
              COALESCE(SUM(cr.clicks), 0) as total_clicks,
              COALESCE(SUM(cr.conversions), 0) as total_conversions,
              COALESCE(SUM(cr.spend), 0) as total_spend
       FROM campaigns c
       LEFT JOIN campaign_reports cr ON c.id = cr.campaign_id
       WHERE c.id = $1 AND c.advertiser_id = $2
       GROUP BY c.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign',
      error: error.message
    });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      daily_budget,
      total_budget,
      start_date,
      end_date,
      bid_amount,
      status
    } = req.body;

    // Check if campaign exists and belongs to user
    const existingCampaign = await query(
      'SELECT * FROM campaigns WHERE id = $1 AND advertiser_id = $2',
      [id, req.user.id]
    );

    if (existingCampaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Update campaign
    const result = await query(
      `UPDATE campaigns 
       SET name = COALESCE($1, name),
           daily_budget = COALESCE($2, daily_budget),
           total_budget = COALESCE($3, total_budget),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           bid_amount = COALESCE($6, bid_amount),
           status = COALESCE($7, status)
       WHERE id = $8 AND advertiser_id = $9
       RETURNING *`,
      [name, daily_budget, total_budget, start_date, end_date, bid_amount, status, id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists and belongs to user
    const existingCampaign = await query(
      'SELECT * FROM campaigns WHERE id = $1 AND advertiser_id = $2',
      [id, req.user.id]
    );

    if (existingCampaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Can only delete draft campaigns
    if (existingCampaign.rows[0].status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete campaigns in draft status'
      });
    }

    await query('DELETE FROM campaigns WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
};

// Get campaign statistics
const getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Verify campaign belongs to user
    const campaignCheck = await query(
      'SELECT id FROM campaigns WHERE id = $1 AND advertiser_id = $2',
      [id, req.user.id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    let queryText = `
      SELECT 
        report_date,
        impressions,
        clicks,
        conversions,
        spend,
        CASE WHEN impressions > 0 THEN (clicks::float / impressions) * 100 ELSE 0 END as ctr
      FROM campaign_reports
      WHERE campaign_id = $1
    `;
    const params = [id];

    if (start_date) {
      queryText += ` AND report_date >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      queryText += ` AND report_date <= $${params.length + 1}`;
      params.push(end_date);
    }

    queryText += ' ORDER BY report_date DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign statistics',
      error: error.message
    });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats
};
