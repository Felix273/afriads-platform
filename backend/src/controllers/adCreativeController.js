// src/controllers/adCreativeController.js
const { query } = require('../config/database');
const path = require('path');

// Create ad creative
const createCreative = async (req, res) => {
  try {
    const { campaign_id } = req.params;
    const {
      name,
      ad_type,
      format,
      title,
      description,
      image_url,
      video_url,
      destination_url,
      call_to_action
    } = req.body;

    // Verify campaign belongs to user
    const campaignCheck = await query(
      'SELECT id FROM campaigns WHERE id = $1 AND advertiser_id = $2',
      [campaign_id, req.user.id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Validation
    if (!name || !ad_type || !title || !destination_url) {
      return res.status(400).json({
        success: false,
        message: 'Name, ad type, title, and destination URL are required'
      });
    }

    // Create creative
    const result = await query(
      `INSERT INTO ad_creatives 
       (campaign_id, name, ad_type, format, title, description, image_url, video_url, destination_url, call_to_action, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING *`,
      [
        campaign_id,
        name,
        ad_type,
        format,
        title,
        description,
        image_url || null,
        video_url || null,
        destination_url,
        call_to_action || 'Learn More'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Ad creative created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ad creative',
      error: error.message
    });
  }
};

// Get all creatives for a campaign
const getCreatives = async (req, res) => {
  try {
    const { campaign_id } = req.params;

    // Verify campaign belongs to user
    const campaignCheck = await query(
      'SELECT id FROM campaigns WHERE id = $1 AND advertiser_id = $2',
      [campaign_id, req.user.id]
    );

    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const result = await query(
      'SELECT * FROM ad_creatives WHERE campaign_id = $1 ORDER BY created_at DESC',
      [campaign_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get creatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ad creatives',
      error: error.message
    });
  }
};

// Get single creative
const getCreative = async (req, res) => {
  try {
    const { campaign_id, creative_id } = req.params;

    const result = await query(
      `SELECT ac.* FROM ad_creatives ac
       INNER JOIN campaigns c ON ac.campaign_id = c.id
       WHERE ac.id = $1 AND ac.campaign_id = $2 AND c.advertiser_id = $3`,
      [creative_id, campaign_id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad creative not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ad creative',
      error: error.message
    });
  }
};

// Update creative
const updateCreative = async (req, res) => {
  try {
    const { campaign_id, creative_id } = req.params;
    const {
      name,
      title,
      description,
      image_url,
      video_url,
      destination_url,
      call_to_action,
      status
    } = req.body;

    // Verify ownership
    const ownershipCheck = await query(
      `SELECT ac.id FROM ad_creatives ac
       INNER JOIN campaigns c ON ac.campaign_id = c.id
       WHERE ac.id = $1 AND ac.campaign_id = $2 AND c.advertiser_id = $3`,
      [creative_id, campaign_id, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad creative not found'
      });
    }

    const result = await query(
      `UPDATE ad_creatives 
       SET name = COALESCE($1, name),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           video_url = COALESCE($5, video_url),
           destination_url = COALESCE($6, destination_url),
           call_to_action = COALESCE($7, call_to_action),
           status = COALESCE($8, status)
       WHERE id = $9
       RETURNING *`,
      [name, title, description, image_url, video_url, destination_url, call_to_action, status, creative_id]
    );

    res.json({
      success: true,
      message: 'Ad creative updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ad creative',
      error: error.message
    });
  }
};

// Delete creative
const deleteCreative = async (req, res) => {
  try {
    const { campaign_id, creative_id } = req.params;

    // Verify ownership
    const ownershipCheck = await query(
      `SELECT ac.id FROM ad_creatives ac
       INNER JOIN campaigns c ON ac.campaign_id = c.id
       WHERE ac.id = $1 AND ac.campaign_id = $2 AND c.advertiser_id = $3`,
      [creative_id, campaign_id, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad creative not found'
      });
    }

    await query('DELETE FROM ad_creatives WHERE id = $1', [creative_id]);

    res.json({
      success: true,
      message: 'Ad creative deleted successfully'
    });
  } catch (error) {
    console.error('Delete creative error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad creative',
      error: error.message
    });
  }
};

// Upload ad image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/ads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

module.exports = {
  createCreative,
  getCreatives,
  getCreative,
  updateCreative,
  deleteCreative,
  uploadImage
};
