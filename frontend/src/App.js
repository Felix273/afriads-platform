// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignCreatives from './pages/CampaignCreatives';
import PublisherDashboard from './pages/PublisherDashboard';
import WebsiteManagement from './pages/WebsiteManagement';
import Analytics from './pages/Analytics';
import Homepage from './pages/Homepage';
import PaymentHistory from './pages/PaymentHistory';
import PayoutRequest from './pages/PayoutRequest';
import AdminDashboard from './pages/AdminDashboard';
import PublisherEarnings from './pages/PublisherEarnings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin-only Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;
  return isAdmin ? children : <Navigate to="/dashboard" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return children;
  return <Navigate to={isAdmin ? '/admin/ad-ops' : '/dashboard'} />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Homepage />} />

          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin/ad-ops" />}
          />

          <Route
            path="/admin/ad-ops"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/approvals"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/fraud"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route 
            path="/publisher/dashboard" 
            element={
              <ProtectedRoute>
                <PublisherDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/publisher/websites/:id" 
            element={
              <ProtectedRoute>
                <WebsiteManagement />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/publisher/earnings"
            element={
              <ProtectedRoute>
                <PublisherEarnings />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/campaigns/new" 
            element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/campaigns/:id/creatives" 
            element={
              <ProtectedRoute>
                <CampaignCreatives />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Payment & Payout Routes */}
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <PaymentHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payouts" 
            element={
              <ProtectedRoute>
                <PayoutRequest />
              </ProtectedRoute>
            } 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
