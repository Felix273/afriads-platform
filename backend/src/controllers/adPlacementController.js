// controllers/adPlacementController.js
const AdPlacement = require('../models/AdPlacement');
const pool = require('../config/database');

class AdPlacementController {
  // Create ad placement
  async createPlacement(req, res) {
    try {
      const { website_id, name, placement_type, ad_format, status } = req.body;
      const userId = req.user.id;

      // Validation
      if (!website_id || !name || !placement_type) {
        return res.status(400).json({ 
          error: 'Website ID, name, and placement type are required' 
        });
      }

      // Check website ownership
      const websiteResult = await pool.query(
        'SELECT publisher_id FROM websites WHERE id = $1',
        [website_id]
      );

      if (websiteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Website not found' });
      }

      if (websiteResult.rows[0].publisher_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create placement
      const placement = await AdPlacement.create({
        website_id,
        name,
        placement_type,
        ad_format,
        status: status || 'active'
      });

      res.status(201).json({
        success: true,
        placement,
        message: 'Ad placement created successfully'
      });
    } catch (error) {
      console.error('Create placement error:', error);
      res.status(500).json({ error: 'Failed to create ad placement' });
    }
  }

  // Get placements for a website
  async getWebsitePlacements(req, res) {
    try {
      const { websiteId } = req.params;
      const userId = req.user.id;

      // Check website ownership
      const websiteResult = await pool.query(
        'SELECT publisher_id FROM websites WHERE id = $1',
        [websiteId]
      );

      if (websiteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Website not found' });
      }

      if (websiteResult.rows[0].publisher_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const placements = await AdPlacement.findByWebsiteId(websiteId);

      res.json({
        success: true,
        placements,
        count: placements.length
      });
    } catch (error) {
      console.error('Get website placements error:', error);
      res.status(500).json({ error: 'Failed to retrieve placements' });
    }
  }

  // Get active placements
  async getActivePlacements(req, res) {
    try {
      const { websiteId } = req.params;

      const placements = await AdPlacement.findActiveByWebsiteId(websiteId);

      res.json({
        success: true,
        placements,
        count: placements.length
      });
    } catch (error) {
      console.error('Get active placements error:', error);
      res.status(500).json({ error: 'Failed to retrieve active placements' });
    }
  }

  // Get placement by ID
  async getPlacementById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const placement = await AdPlacement.getWithWebsite(id);

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      // Check ownership
      const websiteResult = await pool.query(
        'SELECT publisher_id FROM websites WHERE id = $1',
        [placement.website_id]
      );

      if (websiteResult.rows[0].publisher_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        placement
      });
    } catch (error) {
      console.error('Get placement error:', error);
      res.status(500).json({ error: 'Failed to retrieve placement' });
    }
  }

  // Update placement
  async updatePlacement(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Check placement ownership
      const placement = await AdPlacement.findById(id);

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      const websiteResult = await pool.query(
        'SELECT publisher_id FROM websites WHERE id = $1',
        [placement.website_id]
      );

      if (websiteResult.rows[0].publisher_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update placement
      const updatedPlacement = await AdPlacement.update(id, updateData);

      res.json({
        success: true,
        placement: updatedPlacement,
        message: 'Placement updated successfully'
      });
    } catch (error) {
      console.error('Update placement error:', error);
      res.status(500).json({ error: 'Failed to update placement' });
    }
  }

  // Delete placement
  async deletePlacement(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check placement ownership
      const placement = await AdPlacement.findById(id);

      if (!placement) {
        return res.status(404).json({ error: 'Placement not found' });
      }

      const websiteResult = await pool.query(
        'SELECT publisher_id FROM websites WHERE id = $1',
        [placement.website_id]
      );

      if (websiteResult.rows[0].publisher_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete placement
      await AdPlacement.delete(id);

      res.json({
        success: true,
        message: 'Placement deleted successfully'
      });
    } catch (error) {
      console.error('Delete placement error:', error);
      res.status(500).json({ error: 'Failed to delete placement' });
    }
  }
}

module.exports = new AdPlacementController();
