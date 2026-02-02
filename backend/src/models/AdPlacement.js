// models/AdPlacement.js
const pool = require('../config/database');

class AdPlacement {
  static async create(placementData) {
    const {
      website_id,
      name,
      placement_type,
      ad_format,
      status = 'active'
    } = placementData;

    const query = `
      INSERT INTO ad_placements (
        website_id, name, placement_type, ad_format, status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [website_id, name, placement_type, ad_format, status];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM ad_placements WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByWebsiteId(websiteId) {
    const result = await pool.query(
      'SELECT * FROM ad_placements WHERE website_id = $1 ORDER BY created_at DESC',
      [websiteId]
    );
    return result.rows;
  }

  static async findActiveByWebsiteId(websiteId) {
    const result = await pool.query(
      'SELECT * FROM ad_placements WHERE website_id = $1 AND status = $2',
      [websiteId, 'active']
    );
    return result.rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE ad_placements 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM ad_placements WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getWithWebsite(id) {
    const result = await pool.query(
      `SELECT ap.*, w.name as website_name, w.url as website_url
       FROM ad_placements ap
       JOIN websites w ON ap.website_id = w.id
       WHERE ap.id = $1`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = AdPlacement;
