// models/DailyReport.js
const pool = require('../config/database');

class DailyReport {
  static async generate(reportDate = null) {
    // If no date specified, generate for yesterday
    const date = reportDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const query = `
      INSERT INTO daily_reports (
        report_date, campaign_id, ad_creative_id, website_id,
        impressions, clicks, conversions, spend, revenue, ctr, cvr, cpc, cpm, cpa
      )
      SELECT 
        $1 as report_date,
        i.campaign_id,
        i.ad_creative_id,
        i.website_id,
        COUNT(DISTINCT i.id) as impressions,
        COUNT(DISTINCT c.id) as clicks,
        COUNT(DISTINCT cv.id) as conversions,
        COALESCE(SUM(i.cost), 0) as spend,
        COALESCE(SUM(i.cost * 0.3), 0) as revenue, -- 30% publisher revenue share
        CASE 
          WHEN COUNT(DISTINCT i.id) > 0 
          THEN ROUND((COUNT(DISTINCT c.id)::DECIMAL / COUNT(DISTINCT i.id) * 100), 4)
          ELSE 0 
        END as ctr,
        CASE 
          WHEN COUNT(DISTINCT c.id) > 0 
          THEN ROUND((COUNT(DISTINCT cv.id)::DECIMAL / COUNT(DISTINCT c.id) * 100), 4)
          ELSE 0 
        END as cvr,
        CASE 
          WHEN COUNT(DISTINCT c.id) > 0 
          THEN ROUND((SUM(c.cost)::DECIMAL / COUNT(DISTINCT c.id)), 4)
          ELSE 0 
        END as cpc,
        CASE 
          WHEN COUNT(DISTINCT i.id) > 0 
          THEN ROUND((SUM(i.cost)::DECIMAL / COUNT(DISTINCT i.id) * 1000), 4)
          ELSE 0 
        END as cpm,
        CASE 
          WHEN COUNT(DISTINCT cv.id) > 0 
          THEN ROUND((SUM(cv.conversion_value)::DECIMAL / COUNT(DISTINCT cv.id)), 4)
          ELSE 0 
        END as cpa
      FROM impressions i
      LEFT JOIN clicks c ON c.impression_id = i.id 
        AND DATE(c.timestamp) = $1
      LEFT JOIN conversions cv ON cv.click_id = c.id 
        AND DATE(cv.timestamp) = $1
      WHERE DATE(i.timestamp) = $1
      GROUP BY i.campaign_id, i.ad_creative_id, i.website_id
      ON CONFLICT (report_date, campaign_id, ad_creative_id, website_id) 
      DO UPDATE SET
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        spend = EXCLUDED.spend,
        revenue = EXCLUDED.revenue,
        ctr = EXCLUDED.ctr,
        cvr = EXCLUDED.cvr,
        cpc = EXCLUDED.cpc,
        cpm = EXCLUDED.cpm,
        cpa = EXCLUDED.cpa
      RETURNING *
    `;

    const result = await pool.query(query, [dateStr]);
    return result.rows;
  }

  static async findByDate(reportDate) {
    const result = await pool.query(
      'SELECT * FROM daily_reports WHERE report_date = $1 ORDER BY spend DESC',
      [reportDate]
    );
    return result.rows;
  }

  static async findByCampaign(campaignId, startDate = null, endDate = null) {
    let query = `
      SELECT * FROM daily_reports 
      WHERE campaign_id = $1
    `;
    const values = [campaignId];

    if (startDate && endDate) {
      query += ' AND report_date BETWEEN $2 AND $3';
      values.push(startDate, endDate);
    }

    query += ' ORDER BY report_date DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findByWebsite(websiteId, startDate = null, endDate = null) {
    let query = `
      SELECT * FROM daily_reports 
      WHERE website_id = $1
    `;
    const values = [websiteId];

    if (startDate && endDate) {
      query += ' AND report_date BETWEEN $2 AND $3';
      values.push(startDate, endDate);
    }

    query += ' ORDER BY report_date DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getCampaignSummary(campaignId, days = 30) {
    const query = `
      SELECT 
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spend) as total_spend,
        AVG(ctr) as avg_ctr,
        AVG(cvr) as avg_cvr,
        AVG(cpc) as avg_cpc,
        AVG(cpm) as avg_cpm,
        AVG(cpa) as avg_cpa
      FROM daily_reports
      WHERE campaign_id = $1
      AND report_date >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    const result = await pool.query(query, [campaignId]);
    return result.rows[0];
  }

  static async getWebsiteSummary(websiteId, days = 30) {
    const query = `
      SELECT 
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(revenue) as total_revenue,
        AVG(ctr) as avg_ctr,
        COUNT(DISTINCT campaign_id) as unique_campaigns
      FROM daily_reports
      WHERE website_id = $1
      AND report_date >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    const result = await pool.query(query, [websiteId]);
    return result.rows[0];
  }

  static async getTopPerformingCampaigns(limit = 10, days = 7) {
    const query = `
      SELECT 
        campaign_id,
        c.name as campaign_name,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spend) as total_spend,
        AVG(ctr) as avg_ctr
      FROM daily_reports dr
      JOIN campaigns c ON dr.campaign_id = c.id
      WHERE report_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY campaign_id, c.name
      ORDER BY total_conversions DESC, total_clicks DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = DailyReport;
