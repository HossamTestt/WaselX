/**
 * Analytics Page — Trend charts and platform metrics
 */
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { adminAPI } from '../services/api.js';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.analytics().then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="topbar-title">Analytics</div>
          <div className="topbar-subtitle">Platform performance insights</div>
        </div>
      </div>
      <div className="page-content">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
          <>
            <div className="charts-grid">
              <div className="card">
                <div className="card-header"><div className="card-title">Shipments Last 7 Days</div></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data?.shipmentTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#007BFC" strokeWidth={2.5} dot={{ fill: '#007BFC', r: 4 }} name="Shipments" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><div className="card-title">Shipments by Status</div></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data?.statusBreakdown || []} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF7917" radius={[0, 6, 6, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Revenue Summary</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>TOTAL COMMISSION</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#007BFC' }}>
                      AED {(parseFloat(data?.kpis?.total_revenue) || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>DELIVERED SHIPMENTS</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
                      {data?.kpis?.delivered_shipments || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>TOTAL BIDS</div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF7917' }}>
                      {data?.kpis?.total_bids || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
