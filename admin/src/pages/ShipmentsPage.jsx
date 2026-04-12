/**
 * Shipments Page — Monitor all platform shipments
 */
import { useEffect, useState } from 'react';
import { Package, MapPin } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { shipmentsAPI } from '../services/api.js';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 15 });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    shipmentsAPI.list(filters)
      .then(r => { setShipments(r.data.data); setPagination(r.data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.status, filters.page]);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Shipments</div>
          <div className="topbar-subtitle">Monitor all platform shipments</div>
        </div>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Statuses</option>
            {['open','bidding','assigned','picked_up','in_transit','delivered','cancelled'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : shipments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Package size={48} /></div>
                <h3>No shipments found</h3>
                <p>Try different filters</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Shipper</th>
                    <th>Load Type</th>
                    <th>Weight</th>
                    <th>Bids</th>
                    <th>Price (AED)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin size={14} color="#007BFC" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.pickup_city || s.pickup_address?.substring(0, 30)}</div>
                            <div style={{ color: '#64748b', fontSize: '12px' }}>→ {s.dropoff_city || s.dropoff_address?.substring(0, 30)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{s.shipper_name}</td>
                      <td>
                        <span className="badge badge-navy">{s.load_type}</span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{s.weight_tonnes ? `${s.weight_tonnes}t` : '—'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{s.bid_count || 0}</td>
                      <td style={{ fontWeight: 600, color: s.final_price ? '#10b981' : '#64748b' }}>
                        {s.final_price ? s.final_price.toLocaleString() : '—'}
                      </td>
                      <td><StatusBadge status={s.status} /></td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {new Date(s.created_at).toLocaleDateString('en-AE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination.total > 0 && (
            <div className="pagination">
              <div className="pagination-info">Total: {pagination.total} shipments</div>
              <div className="pagination-controls">
                <button className="btn btn-ghost btn-sm" disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
                <button className="btn btn-ghost btn-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
