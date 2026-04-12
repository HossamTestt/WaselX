/**
 * WaselX Admin — Main App with Routing
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ShipmentsPage from './pages/ShipmentsPage.jsx';
import BidsPage from './pages/BidsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import CommissionPage from './pages/CommissionPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('waselx_admin_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="bids" element={<BidsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="commission" element={<CommissionPage />} />
      </Route>
    </Routes>
  );
}
