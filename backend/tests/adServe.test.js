// tests/adServe.test.js
const request = require('supertest');
const express = require('express');

// Mock database module
jest.mock('../src/config/database', () => {
  const mockQuery = jest.fn();
  const mockTransaction = jest.fn(async (cb) => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] })
    };
    return cb(mockClient);
  });

  return {
    query: mockQuery,
    transaction: mockTransaction,
    pool: {
      connect: jest.fn()
    }
  };
});

const { query, transaction } = require('../src/config/database');
const adServeRoutes = require('../src/routes/adServeRoutes');

const app = express();
app.use(express.json());
app.use('/api/ad-serve', adServeRoutes);

describe('Ad Serving & Tracking API Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation: empty blocked_ips result for checkBlockedIP middleware
    query.mockImplementation(async (text) => {
      if (typeof text === 'string' && text.includes('FROM blocked_ips')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
  });

  describe('GET /api/ad-serve/serve', () => {
    it('should return 400 when zone_id or website_id is missing', async () => {
      const res = await request(app).get('/api/ad-serve/serve');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('zone_id and website_id are required');
    });

    it('should return 403 for bot user-agents', async () => {
      const res = await request(app)
        .get('/api/ad-serve/serve?zone_id=1&website_id=1')
        .set('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Automated request rejected');
    });

    it('should return 404 when ad zone is not found', async () => {
      query.mockImplementation(async (text) => {
        if (text.includes('FROM blocked_ips')) return { rows: [] };
        if (text.includes('FROM ad_zones')) return { rows: [] };
        return { rows: [] };
      });

      const res = await request(app)
        .get('/api/ad-serve/serve?zone_id=999&website_id=1')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Ad zone not found for this website');
    });

    it('should serve ad and record CPM impression with financial processing', async () => {
      query.mockImplementation(async (text) => {
        if (text.includes('FROM blocked_ips')) return { rows: [] };
        if (text.includes('FROM ad_zones')) {
          return {
            rows: [{ id: 1, zone_type: 'display', dimensions: '300x250', status: 'active', website_status: 'active' }]
          };
        }
        if (text.includes('COUNT(*) FROM impressions')) {
          return { rows: [{ count: '2' }] };
        }
        if (text.includes('FROM ad_creatives')) {
          return {
            rows: [{
              creative_id: 10,
              campaign_id: 5,
              advertiser_id: 2,
              name: 'Summer Campaign',
              ad_type: 'display',
              format: '300x250',
              title: 'Buy Cool Stuff',
              description: 'Best deals online',
              image_url: 'http://example.com/ad.jpg',
              destination_url: 'http://example.com/landing',
              call_to_action: 'Shop Now',
              bid_amount: '2.50',
              bid_type: 'cpm'
            }]
          };
        }
        if (text.includes('INSERT INTO impressions')) {
          return { rows: [{ id: 1001 }] };
        }
        return { rows: [] };
      });

      const res = await request(app)
        .get('/api/ad-serve/serve?zone_id=1&website_id=1')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.impression_id).toBe(1001);
      expect(res.body.data.ad.title).toBe('Buy Cool Stuff');
      expect(res.body.data.tracking.click_url).toContain('/api/ad-serve/click/1001');

      expect(transaction).toHaveBeenCalled();
    });
  });

  describe('GET /api/ad-serve/click/:impression_id', () => {
    it('should return 404 when impression is not found', async () => {
      query.mockImplementation(async (text) => {
        if (text.includes('FROM blocked_ips')) return { rows: [] };
        if (text.includes('FROM impressions')) return { rows: [] };
        return { rows: [] };
      });

      const res = await request(app).get('/api/ad-serve/click/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Impression not found');
    });

    it('should redirect duplicate clicks without double charging', async () => {
      query.mockImplementation(async (text) => {
        if (text.includes('FROM blocked_ips')) return { rows: [] };
        if (text.includes('FROM impressions')) {
          return {
            rows: [{
              id: 1001,
              ad_creative_id: 10,
              campaign_id: 5,
              website_id: 1,
              ad_zone_id: 1
            }]
          };
        }
        if (text.includes('FROM ad_creatives')) {
          return { rows: [{ destination_url: 'http://example.com/landing' }] };
        }
        if (text.includes('FROM clicks')) {
          return { rows: [{ id: 50 }] };
        }
        return { rows: [] };
      });

      const res = await request(app).get('/api/ad-serve/click/1001');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('http://example.com/landing');
    });
  });

  describe('POST /api/ad-serve/conversion', () => {
    it('should return 400 when impression_id is missing', async () => {
      const res = await request(app)
        .post('/api/ad-serve/conversion')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('impression_id is required');
    });

    it('should track CPA conversion successfully', async () => {
      query.mockImplementation(async (text) => {
        if (text.includes('FROM blocked_ips')) return { rows: [] };
        if (text.includes('FROM impressions')) {
          return {
            rows: [{
              id: 1001,
              campaign_id: 5,
              website_id: 1
            }]
          };
        }
        if (text.includes('FROM clicks')) {
          return { rows: [{ id: 88 }] };
        }
        if (text.includes('FROM campaigns')) {
          return { rows: [{ bid_type: 'cpa', bid_amount: '10.00' }] };
        }
        if (text.includes('INSERT INTO conversions')) {
          return { rows: [{ id: 2001 }] };
        }
        return { rows: [] };
      });

      const res = await request(app)
        .post('/api/ad-serve/conversion')
        .send({
          impression_id: 1001,
          conversion_type: 'sale',
          conversion_value: 10.00
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.conversion_id).toBe(2001);
      expect(transaction).toHaveBeenCalled();
    });
  });
});
