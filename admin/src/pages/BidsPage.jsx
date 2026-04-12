/**
 * Bids Page — View all bids on the platform
 */
import { useEffect, useState } from 'react';
import { Gavel } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { shipmentsAPI, bidsAPI } from '../services/api.js';

export default function BidsPage() {
  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Bids</div>
          <div className="topbar-subtitle">Track all active bids and commission</div>
        </div>
      </div>
      <div className="page-content">
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon"><Gavel size={48} /></div>
              <h3>Bid Monitoring</h3>
              <p>Select a shipment from the Shipments page to view its bids, or connect to the live API.</p>
              <a href="/shipments" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Go to Shipments
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
