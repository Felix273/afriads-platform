// models/AdPlacement.js
// Canonical model mapping to ad_zones table
const { pool } = require('../config/database');

class AdPlacement {
  static async create(placementData) {
    const {
      website_id,
      name,
      placement_type,
      zone_type,
      ad_format,
      dimensions,
      status = 'active'
    } = placementData;

    const resolvedType = zone_type || placement_type || 'display';
    const resolvedDimensions = dimensions || ad_format || null;

    const query = `
      INSERT INTO ad_zones (
        website_id, name, zone_type, dimensions, status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *,
                zone_type as placement_type,
                dimensions as ad_format
    `;

    const values = [website_id, name, resolvedType, resolvedDimensions, status];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT *, zone_type as placement_type, dimensions as ad_format 
       FROM ad_zones WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByWebsiteId(websiteId) {
    const result = await pool.query(
      `SELECT *, zone_type as placement_type, dimensions as ad_format 
       FROM ad_zones WHERE website_id = $1 ORDER BY created_at DESC`,
      [websiteId]
    );
    return result.rows;
  }

  static async findActiveByWebsiteId(websiteId) {
    const result = await pool.query(
      `SELECT *, zone_type as placement_type, dimensions as ad_format 
       FROM ad_zones WHERE website_id = $1 AND status = $2`,
      [websiteId, 'active']
    );
    return result.rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }

    const type = updateData.zone_type || updateData.placement_type;
    if (type !== undefined) {
      fields.push(`zone_type = $${paramCount++}`);
      values.push(type);
    }

    const dims = updateData.dimensions || updateData.ad_format;
    if (dims !== undefined) {
      fields.push(`dimensions = $${paramCount++}`);
      values.push(dims);
    }

    if (updateData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updateData.status);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE ad_zones 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *,
                zone_type as placement_type,
                dimensions as ad_format
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM ad_zones WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getWithWebsite(id) {
    const result = await pool.query(
      `SELECT az.*, az.zone_type as placement_type, az.dimensions as ad_format,
              w.name as website_name, w.url as website_url
       FROM ad_zones az
       JOIN websites w ON az.website_id = w.id
       WHERE az.id = $1`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = AdPlacement;
