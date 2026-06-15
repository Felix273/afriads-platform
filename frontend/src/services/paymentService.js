// src/services/paymentService.js
import api from './api';

export const paymentAPI = {
  // Get all payments for user
  getAll: () => api.get('/payments'),
  
  // Get specific payment
  getOne: (id) => api.get(`/payments/${id}`),

  // Get payment status
  getStatus: (id) => api.get(`/payments/${id}/status`),

  // Check M-Pesa configuration
  getMpesaStatus: () => api.get('/payments/mpesa/status'),
  
  // Create payment
  create: (data) => api.post('/payments', data),
  
  // Get payment statistics
  getStats: (params) => api.get('/payments/stats/summary', { params }),
  
  // Admin: Get all payments
  getAllPayments: (params) => api.get('/payments/admin/all', { params }),
};

export const payoutAPI = {
  // Get all payouts for user
  getAll: () => api.get('/payouts'),
  
  // Get specific payout
  getOne: (id) => api.get(`/payouts/${id}`),
  
  // Request payout
  request: (data) => api.post('/payouts', data),
  
  // Get payout statistics
  getStats: (params) => api.get('/payouts/stats/summary', { params }),
  
  // Get minimum payout amount
  getMinimum: () => api.get('/payouts/info/minimum'),
  
  // Cancel payout
  cancel: (id) => api.delete(`/payouts/${id}`),
  
  // Admin: Get pending payouts
  getPending: () => api.get('/payouts/admin/pending'),
  
  // Admin: Approve payout
  approve: (id, data) => api.put(`/payouts/admin/${id}/approve`, data),
  
  // Admin: Reject payout
  reject: (id, data) => api.put(`/payouts/admin/${id}/reject`, data),
};

export const notificationAPI = {
  // Get all notifications
  getAll: (params) => api.get('/notifications', { params }),
  
  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread/count'),
  
  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read/all'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const activityAPI = {
  // Get user activity
  getAll: (params) => api.get('/activity', { params }),
  
  // Get entity activity
  getEntityActivity: (type, id, params) => api.get(`/activity/entity/${type}/${id}`, { params }),
  
  // Admin: Get recent activity
  getRecent: (params) => api.get('/activity/admin/recent', { params }),
  
  // Admin: Get by action
  getByAction: (action, params) => api.get(`/activity/admin/action/${action}`, { params }),
};

export const placementAPI = {
  // Create placement
  create: (data) => api.post('/placements', data),
  
  // Get placements for website
  getByWebsite: (websiteId) => api.get(`/placements/website/${websiteId}`),
  
  // Get active placements
  getActive: (websiteId) => api.get(`/placements/website/${websiteId}/active`),
  
  // Get specific placement
  getOne: (id) => api.get(`/placements/${id}`),
  
  // Update placement
  update: (id, data) => api.put(`/placements/${id}`, data),
  
  // Delete placement
  delete: (id) => api.delete(`/placements/${id}`),
};
