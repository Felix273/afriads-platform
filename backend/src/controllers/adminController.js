const { query } = require('../config/database');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const getOverview = async (req, res) => {
  try {
    const [
      users,
      campaigns,
      websites,
      creatives,
      delivery,
      payouts
    ] = await Promise.all([
      query(`SELECT user_type, COUNT(*)::INTEGER as count FROM users GROUP BY user_type`),
      query(`SELECT status, COUNT(*)::INTEGER as count FROM campaigns GROUP BY status`),
      query(`SELECT status, COUNT(*)::INTEGER as count FROM websites GROUP BY status`),
      query(`SELECT status, COUNT(*)::INTEGER as count FROM ad_creatives GROUP BY status`),
      query(`
        SELECT
          COUNT(DISTINCT i.id)::INTEGER as impressions,
          COUNT(DISTINCT c.id)::INTEGER as clicks,
          COALESCE(SUM(i.cost + COALESCE(c.cost, 0)), 0)::DECIMAL(10, 2) as spend
        FROM impressions i
        LEFT JOIN clicks c ON c.impression_id = i.id
      `),
      query(`SELECT status, COUNT(*)::INTEGER as count, COALESCE(SUM(amount), 0)::DECIMAL(10, 2) as amount FROM payouts GROUP BY status`)
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows,
        campaigns: campaigns.rows,
        websites: websites.rows,
        creatives: creatives.rows,
        delivery: delivery.rows[0],
        payouts: payouts.rows
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin overview', error: error.message });
  }
};

const getPendingWebsites = async (req, res) => {
  try {
    const result = await query(
      `SELECT w.*, u.email, u.company_name, u.first_name, u.last_name
       FROM websites w
       INNER JOIN users u ON w.publisher_id = u.id
       WHERE w.status = 'pending'
       ORDER BY w.created_at ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get pending websites error:', error);
    res.status(500).json({ success: false, message: 'Failed to load pending websites', error: error.message });
  }
};

const moderateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid website moderation status' });
    }

    const result = await query(
      `UPDATE websites
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Website not found' });
    }

    const website = result.rows[0];

    await Notification.create({
      user_id: website.publisher_id,
      type: `website_${status}`,
      title: status === 'approved' ? 'Website Approved' : 'Website Review Update',
      message: status === 'approved'
        ? `Your website "${website.name}" has been approved. You can now create ad zones.`
        : `Your website "${website.name}" was marked as ${status}.${reason ? ` Reason: ${reason}` : ''}`,
      data: { website_id: website.id, status, reason }
    });

    await ActivityLog.create({
      user_id: req.user.id,
      action: `website_${status}`,
      entity_type: 'website',
      entity_id: website.id,
      description: `Marked website ${website.name} as ${status}`,
      ip_address: req.ip,
      metadata: { reason }
    });

    res.json({ success: true, data: website, message: `Website ${status}` });
  } catch (error) {
    console.error('Moderate website error:', error);
    res.status(500).json({ success: false, message: 'Failed to moderate website', error: error.message });
  }
};

const getPendingCreatives = async (req, res) => {
  try {
    const result = await query(
      `SELECT ac.*, c.name as campaign_name, c.status as campaign_status, u.email as advertiser_email, u.company_name
       FROM ad_creatives ac
       INNER JOIN campaigns c ON ac.campaign_id = c.id
       INNER JOIN users u ON c.advertiser_id = u.id
       WHERE ac.status = 'pending'
       ORDER BY ac.created_at ASC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get pending creatives error:', error);
    res.status(500).json({ success: false, message: 'Failed to load pending creatives', error: error.message });
  }
};

const moderateCreative = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'active', 'paused'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid creative moderation status' });
    }

    const result = await query(
      `UPDATE ad_creatives
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Creative not found' });
    }

    const creative = result.rows[0];
    const ownerResult = await query(
      `SELECT c.advertiser_id, c.name as campaign_name
       FROM campaigns c
       WHERE c.id = $1`,
      [creative.campaign_id]
    );

    const owner = ownerResult.rows[0];
    if (owner) {
      await Notification.create({
        user_id: owner.advertiser_id,
        type: `creative_${status}`,
        title: status === 'rejected' ? 'Creative Rejected' : 'Creative Approved',
        message: status === 'rejected'
          ? `Your creative "${creative.name}" was rejected.${reason ? ` Reason: ${reason}` : ''}`
          : `Your creative "${creative.name}" is ${status} for campaign "${owner.campaign_name}".`,
        data: { creative_id: creative.id, campaign_id: creative.campaign_id, status, reason }
      });
    }

    await ActivityLog.create({
      user_id: req.user.id,
      action: `creative_${status}`,
      entity_type: 'ad_creative',
      entity_id: creative.id,
      description: `Marked creative ${creative.name} as ${status}`,
      ip_address: req.ip,
      metadata: { reason }
    });

    res.json({ success: true, data: creative, message: `Creative ${status}` });
  } catch (error) {
    console.error('Moderate creative error:', error);
    res.status(500).json({ success: false, message: 'Failed to moderate creative', error: error.message });
  }
};

const getBlockedIPs = async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, u.email as blocked_by_email
       FROM blocked_ips b
       LEFT JOIN users u ON b.blocked_by = u.id
       ORDER BY b.created_at DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get blocked IPs error:', error);
    res.status(500).json({ success: false, message: 'Failed to load blocked IPs', error: error.message });
  }
};

const blockIP = async (req, res) => {
  try {
    const { ip_address, reason, block_type = 'permanent', expires_at } = req.body;

    if (!ip_address) {
      return res.status(400).json({ success: false, message: 'ip_address is required' });
    }

    if (!['permanent', 'temporary'].includes(block_type)) {
      return res.status(400).json({ success: false, message: 'Invalid block type' });
    }

    const result = await query(
      `INSERT INTO blocked_ips (ip_address, reason, blocked_by, block_type, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (ip_address)
       DO UPDATE SET reason = EXCLUDED.reason,
                     blocked_by = EXCLUDED.blocked_by,
                     block_type = EXCLUDED.block_type,
                     expires_at = EXCLUDED.expires_at
       RETURNING *`,
      [ip_address, reason || null, req.user.id, block_type, expires_at || null]
    );

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'block_ip',
      entity_type: 'blocked_ip',
      entity_id: result.rows[0].id,
      description: `Blocked IP ${ip_address}`,
      ip_address: req.ip,
      metadata: { reason, block_type, expires_at }
    });

    res.status(201).json({ success: true, data: result.rows[0], message: 'IP blocked' });
  } catch (error) {
    console.error('Block IP error:', error);
    res.status(500).json({ success: false, message: 'Failed to block IP', error: error.message });
  }
};

const unblockIP = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM blocked_ips WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blocked IP not found' });
    }

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'unblock_ip',
      entity_type: 'blocked_ip',
      entity_id: result.rows[0].id,
      description: `Unblocked IP ${result.rows[0].ip_address}`,
      ip_address: req.ip
    });

    res.json({ success: true, message: 'IP unblocked' });
  } catch (error) {
    console.error('Unblock IP error:', error);
    res.status(500).json({ success: false, message: 'Failed to unblock IP', error: error.message });
  }
};

module.exports = {
  getOverview,
  getPendingWebsites,
  moderateWebsite,
  getPendingCreatives,
  moderateCreative,
  getBlockedIPs,
  blockIP,
  unblockIP
};
